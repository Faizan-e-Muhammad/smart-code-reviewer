import dotenv from "dotenv"

dotenv.config()

export const config = {
    port: process.env.PORT || 3001,
    geminiApiKey: process.env.GEMINI_API_KEY,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV || 'development',
    maxCodeLength: 10000,
    apiVersion: '1.0.0',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
}

// Validate required environment variables
if (!config.geminiApiKey) {
    console.error('❌ GEMINI_KEY is not set in environment variables')
    process.exit(1)
}
