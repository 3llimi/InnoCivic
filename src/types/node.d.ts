// Node.js types for webpack compatibility
declare namespace NodeJS {
  interface ProcessEnv {
    BRO_API_BASE_URL?: string
    NODE_ENV?: string
  }
}
