/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_SUPABASE_URL: string | undefined;
  readonly VITE_SUPABASE_ANON_KEY: string | undefined;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};

declare module 'vue-router' {
  type RouteMeta = {
    title?: string;
  };
}
