// Shared by the Node-side stub server and the workerd-side tests, which can't
// pass values to each other any other way. Fixed rather than ephemeral so both
// sides agree without a handshake.
export const STUB_PORT = 39517;
export const STUB_ORIGIN = `http://127.0.0.1:${STUB_PORT}`;
