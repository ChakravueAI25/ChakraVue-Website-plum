/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sign-up and booking backend (POST /signup, /visit). Unset: forms hand off to Gmail. */
  readonly VITE_EXPERIENCE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
