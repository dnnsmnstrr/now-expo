declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_GITHUB_CLIENT_ID: string;
      EXPO_PUBLIC_GIST_ID: string;
    }
  }
}

export {};