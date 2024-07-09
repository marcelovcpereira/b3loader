/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_B3LOADER_URL: string
    readonly VITE_DIRECTORY_PATH: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }