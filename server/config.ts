interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string | number;
  jwtCookieMaxAge: number;
  otpExpiryMinutes: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  databaseUrl: string;
}

// Load environment variables with defaults
const loadConfig = (): Config => {
  const port = parseInt(process.env.PORT || '3000', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // In production, these should be set via environment variables
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/proposal_gate';
  
  // JWT settings
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
  const jwtCookieMaxAge = 24 * 60 * 60 * 1000; // 1 day in ms
  
  // OTP settings
  const otpExpiryMinutes = 15;
  
  // Rate limiting
  const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
  const rateLimitMax = 5; // Max requests per window

  return {
    port,
    nodeEnv,
    jwtSecret,
    jwtExpiresIn,
    jwtCookieMaxAge,
    otpExpiryMinutes,
    rateLimitWindowMs,
    rateLimitMax,
    databaseUrl,
  };
};

export const config = loadConfig();

// Type for the config object
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      JWT_SECRET?: string;
      JWT_EXPIRES_IN?: string;
      DATABASE_URL?: string;
    }
  }
}
