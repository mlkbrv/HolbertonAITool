/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_ORIGIN?: string;
  readonly VITE_SHOW_TEST_TOOLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
