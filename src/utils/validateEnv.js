const requiredEnvVars = [
  'JWT_SECRET',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_HOST'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('CRITICAL: Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('WARNING: RESEND_API_KEY is missing. Email features will be disabled.');
  }
};

module.exports = validateEnv;
