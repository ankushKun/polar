/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_PORTAL_ORIGIN?: string
  readonly VITE_PORTAL_SUBDOMAIN_BASE?: string
  readonly VITE_DEV_AUTH_BYPASS?: string
  readonly VITE_DEV_MOCK_DATA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
