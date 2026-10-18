import { createServer } from 'node:http';
import { loadConfig } from './config.mjs';
import { openStore } from './store.mjs';
import { createApplication } from './app.mjs';

const config = loadConfig();
const store = openStore(config);
const { handler } = createApplication({ config, store });
const server = createServer({ maxHeaderSize: 8192 }, (req, res) => {
  handler(req, res).catch(() => {
    if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); }
    res.end('{"ok":false,"error":"internal_error"}');
  });
server.requestTimeout = 30_000;
server.headersTimeout = 10_000;
server.listen(config.port, config.host, () => console.log('OrgSuite Connector Hub listening at ' + config.origin));
function shutdown() { server.close(() => { store.close(); process.exit(0); }); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
