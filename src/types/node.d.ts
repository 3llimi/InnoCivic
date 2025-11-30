// Node.js types for webpack compatibility
declare namespace NodeJS {
  interface ProcessEnv {
    BRO_API_BASE_URL?: string
    NODE_ENV?: string
  }
}

// Global constants injected by webpack DefinePlugin
declare const __API_BASE_URL__: string | undefined;
