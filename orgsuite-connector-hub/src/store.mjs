import { DatabaseSync } from 'node:sqlite';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HubError } from './errors.mjs';

export const digest = value => createHash('sha256').update(value).digest('hex');
const random = () => randomBytes(32).toString('base64url');

export function openStore({ dataDir, vaultKey, now = () => Date.now() }) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  if (fs.lstatSync(dataDir).isSymbolicLink()) throw new Error('Storage directory must not be a symlink');
  const canonical = fs.realpathSync(dataDir);
  const repository = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'));
  const relative = path.relative(repository, canonical);
  if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) throw new Error('Canonical storage path must be outside the repository');
  fs.chmodSync(dataDir, 0o700);
  const filename = path.join(dataDir, 'hub.sqlite');
  if (fs.lstatSync(filename, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('Storage file must not be a symlink');
  const db = new DatabaseSync(filename);
  fs.chmodSync(filename, 0o600);
  db.exec(`PRAGMA journal_mode = DELETE; PRAGMA synchronous = FULL; PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS secrets (id TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, actor TEXT NOT NULL, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS oauth_states (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, value TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS connections (id TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, connector TEXT NOT NULL, action TEXT NOT NULL, outcome TEXT NOT NULL, code TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, value TEXT NOT NULL, created_at TEXT NOT NULL);`);
  function encrypt(id, value) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', vaultKey, iv);
    cipher.setAAD(Buffer.from(id));
    const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') });
  }
  function decrypt(id, value) {
    const row = JSON.parse(value);
    if (row.v !== 1) throw new Error('Unsupported vault format');
    const cipher = createDecipheriv('aes-256-gcm', vaultKey, Buffer.from(row.iv, 'base64'));
    cipher.setAAD(Buffer.from(id));
    cipher.setAuthTag(Buffer.from(row.tag, 'base64'));
    return JSON.parse(Buffer.concat([cipher.update(Buffer.from(row.data, 'base64')), cipher.final()]).toString('utf8'));
  }
  return {
    getSecret(id) { const row = db.prepare('SELECT value FROM secrets WHERE id=?').get(id); return row ? decrypt(id, row.value) : null; },
    putSecret(id, value) { db.prepare('INSERT OR REPLACE INTO secrets VALUES (?,?)').run(id, encrypt(id, value)); },
    deleteSecret(id) { db.prepare('DELETE FROM secrets WHERE id=?').run(id); },
    createSession(actor) {
      const token = random(), csrfToken = random(), id = digest(token);
      db.prepare('DELETE FROM sessions WHERE expires <= ?').run(now());
      db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(id, actor, csrfToken, now() + 8 * 60 * 60 * 1000);
      return { token, csrfToken, id, actor };
    },
    session(token) { return token ? db.prepare('SELECT id, actor, csrf AS csrfToken FROM sessions WHERE id=? AND expires>?').get(digest(token), now()) || null : null; },
    deleteSession(id) { db.prepare('DELETE FROM sessions WHERE id=?').run(id); db.prepare('DELETE FROM oauth_states WHERE session_id=?').run(id); },
    saveState(state, sessionId, value) {
      db.prepare('DELETE FROM oauth_states WHERE expires <= ?').run(now());
      db.prepare('INSERT INTO oauth_states VALUES (?,?,?,?)').run(digest(state), sessionId, encrypt('oauth-state', value), now() + 10 * 60 * 1000);
    },
    consumeState(state, sessionId) {
      const id = digest(state);
      db.exec('BEGIN IMMEDIATE');
      try {
        const row = db.prepare('SELECT value FROM oauth_states WHERE id=? AND session_id=? AND expires>?').get(id, sessionId, now());
        db.prepare('DELETE FROM oauth_states WHERE id=? AND session_id=?').run(id, sessionId);
        const value = row ? decrypt('oauth-state', row.value) : null;
        db.exec('COMMIT');
        return value;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    connection(id) { const row = db.prepare('SELECT value FROM connections WHERE id=?').get(id); return row ? JSON.parse(row.value) : null; },
    setConnection(id, value) { db.prepare('INSERT OR REPLACE INTO connections VALUES (?,?)').run(id, JSON.stringify(value)); },
    audit({ actor, connector, action, outcome, code = '' }) {
      db.prepare('INSERT INTO audit(actor,connector,action,outcome,code,created_at) VALUES (?,?,?,?,?,?)').run(actor, connector, action, outcome, code, new Date(now()).toISOString());
    },
    auditEvents() { return db.prepare('SELECT id,actor,connector,action,outcome,code,created_at AS createdAt FROM audit ORDER BY id DESC LIMIT 100').all(); },
    acceptInquiry(record) {
      const payloadHash = digest(JSON.stringify(record));
      db.exec('BEGIN IMMEDIATE');
      try {
        const row = db.prepare('SELECT payload_hash FROM inquiries WHERE id=?').get(record.id);
        if (row && row.payload_hash !== payloadHash) throw new HubError(409, 'inquiry_id_conflict');
        if (!row) db.prepare('INSERT INTO inquiries VALUES (?,?,?,?)').run(record.id, payloadHash, encrypt('inquiry:' + record.id, record), new Date(now()).toISOString());
        db.exec('COMMIT');
        return { ok: true, id: record.id };
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    inquiryCount() { return db.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count; },
    close() { db.close(); }
  };
}
