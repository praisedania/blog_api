const requiredEnvVars = [
  'JWT_SECRET'
];

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, we typically use DATABASE_URL (Render default)
  if (isProduction && !process.env.DATABASE_URL) {
    console.error('CRITICAL: Missing DATABASE_URL in production environment.');
    process.exit(1);
  }

  // In non-production, we expect individual DB variables
  if (!isProduction) {
    const dbVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST'];
    const missing = dbVars.filter(envVar => !process.env[envVar]);
    if (missing.length > 0) {
      console.warn('WARNING: Missing database environment variables:', missing.join(', '));
    }
  }

  const missingGeneral = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingGeneral.length > 0) {
    console.error('CRITICAL: Missing required environment variables:', missingGeneral.join(', '));
    process.exit(1);
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('WARNING: RESEND_API_KEY is missing. Email features will be disabled.');
  }
};

module.exports = validateEnv;

