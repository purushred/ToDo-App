import '@testing-library/jest-dom'

// Polyfill crypto.randomUUID for tests
if (!globalThis.crypto) {
  globalThis.crypto = require('crypto').webcrypto
}