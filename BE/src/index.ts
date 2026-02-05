import express from "express";
import cors from "cors";

import reviewRoutes from "./routes/reviewRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

import { config } from "./config";

const app = express()

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(requestLogger)

// Routes
app.use('/api', reviewRoutes)

// Error handling (must be last)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log('┌─────────────────────────────────────────┐')
  console.log('│   🚀 Code Review API Server Started    │')
  console.log('└─────────────────────────────────────────┘')
  console.log(`📍 Server: http://localhost:${config.port}`)
  console.log(`📝 API Endpoint: http://localhost:${config.port}/api/review`)
  console.log(`💚 Health Check: http://localhost:${config.port}/api/health`)
  console.log(`🌍 Environment: ${config.nodeEnv}`)
  console.log(`🔑 API Key: ${config.geminiApiKey ? '✓ Configured' : '✗ Missing'}`)
  console.log('─────────────────────────────────────────')
})
