import '@testing-library/jest-dom'

// Polyfill crypto for tests
if (!globalThis.crypto) {
  globalThis.crypto = require('crypto').webcrypto
}

// Mock Prisma client at module level to prevent binary loading issues
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    Prisma: {
      PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
        code: string
        constructor(message: string, { code }: { code: string }) {
          super(message)
          this.code = code
          this.name = 'PrismaClientKnownRequestError'
        }
      },
    },
  }
})

// Mock Next.js server components
jest.mock('next/server', () => {
  const MockNextResponse = class Response {
    private _status: number
    private _body: string
    private _headers: Map<string, string>

    constructor(body?: any, init?: any) {
      this._status = init?.status || 200
      this._headers = new Map()
      
      if (init?.headers) {
        if (init.headers instanceof Map) {
          init.headers.forEach((v: string, k: string) => this._headers.set(k.toLowerCase(), v))
        } else if (typeof init.headers.forEach === 'function') {
          init.headers.forEach((v: string, k: string) => this._headers.set(k.toLowerCase(), v))
        } else {
          Object.entries(init.headers).forEach(([k, v]) => this._headers.set(k.toLowerCase(), v as string))
        }
      }
      
      if (typeof body === 'string') {
        this._body = body
      } else if (body !== undefined && body !== null) {
        this._body = JSON.stringify(body)
        if (!this._headers.has('content-type')) {
          this._headers.set('content-type', 'application/json')
        }
      } else {
        this._body = ''
      }
    }

    get status() { return this._status }
    get ok() { return this._status >= 200 && this._status < 300 }
    
    get headers() {
      return {
        get: (name: string) => this._headers.get(name.toLowerCase()) || null,
        set: (name: string, value: string) => { this._headers.set(name.toLowerCase(), value) },
        append: (name: string, value: string) => {
          const existing = this._headers.get(name.toLowerCase())
          this._headers.set(name.toLowerCase(), existing ? `${existing}, ${value}` : value)
        },
        delete: (name: string) => { this._headers.delete(name.toLowerCase()) },
        has: (name: string) => this._headers.has(name.toLowerCase()),
        forEach: (cb: (v: string, k: string) => void) => this._headers.forEach(cb),
      }
    }
    
    async json() {
      if (this._body === '') return undefined
      return JSON.parse(this._body)
    }
    
    async text() {
      return this._body
    }

    static json(data: any, init?: any) {
      const response = new MockNextResponse(JSON.stringify(data), init)
      response._headers.set('content-type', 'application/json')
      return response
    }
  }

  return {
    NextResponse: MockNextResponse,
  }
})

// Simple Request mock
class MockRequest {
  private _url: string
  private _method: string
  private _headers: Map<string, string>
  private _body: any

  constructor(input: string | URL | Request, init?: any) {
    this._url = typeof input === 'string' ? input : input.toString()
    this._method = init?.method || 'GET'
    this._headers = new Map()
    this._body = init?.body
    
    if (init?.headers) {
      if (init.headers instanceof Map) {
        init.headers.forEach((v: string, k: string) => this._headers.set(k.toLowerCase(), v))
      } else if (typeof init.headers.forEach === 'function') {
        init.headers.forEach((v: string, k: string) => this._headers.set(k.toLowerCase(), v))
      } else {
        Object.entries(init.headers).forEach(([k, v]) => this._headers.set(k.toLowerCase(), v as string))
      }
    }
  }

  get url() { return this._url }
  get method() { return this._method }
  
  get headers() {
    return {
      get: (name: string) => this._headers.get(name.toLowerCase()) || null,
      set: (name: string, value: string) => { this._headers.set(name.toLowerCase(), value) },
      append: (name: string, value: string) => {
        const existing = this._headers.get(name.toLowerCase())
        this._headers.set(name.toLowerCase(), existing ? `${existing}, ${value}` : value)
      },
      delete: (name: string) => { this._headers.delete(name.toLowerCase()) },
      has: (name: string) => this._headers.has(name.toLowerCase()),
      forEach: (cb: (v: string, k: string) => void) => this._headers.forEach(cb),
    }
  }
  
  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body)
    }
    return this._body
  }
  
  async text() {
    return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
  }
}

// Only set globals if they don't exist (for jsdom env)
if (typeof (globalThis as any).Request === 'undefined') {
  (globalThis as any).Request = MockRequest
}