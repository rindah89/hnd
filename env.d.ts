declare namespace NodeJS {
  interface ProcessEnv {
    KINDE_CLIENT_ID: string;
    KINDE_CLIENT_SECRET: string;
    KINDE_ISSUER_URL: string;
    KINDE_SITE_URL: string;
    KINDE_POST_LOGOUT_REDIRECT_URL: string;
    KINDE_POST_LOGIN_REDIRECT_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 