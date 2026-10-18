export class HubError extends Error {
  constructor(status, code) {
    super(code);
    this.name = 'HubError';
    this.status = status;
    this.code = code;
  }
}

export function publicError(error) {
  if (error instanceof HubError) return { status: error.status, code: error.code };
  return { status: 500, code: 'internal_error' };
}
