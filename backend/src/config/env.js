import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const requiredEnvVars = {
  GROQ_API_KEY: 'Missing GROQ_API_KEY. Please configure backend/.env',
  DB_PASSWORD: 'Missing DB_PASSWORD. Please configure backend/.env',
};

let hasMissing = false;
for (const [key, message] of Object.entries(requiredEnvVars)) {
  if (!process.env[key]) {
    console.error(`\n[SECURITY ERROR] ${message}`);
    hasMissing = true;
  }
}

// FRONTEND_URL is required in production
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error('\n[SECURITY ERROR] Missing FRONTEND_URL. Please configure FRONTEND_URL in production environment.');
  hasMissing = true;
}

if (hasMissing) {
  console.error('Backend startup aborted due to missing environment variables.\n');
  process.exit(1);
}
