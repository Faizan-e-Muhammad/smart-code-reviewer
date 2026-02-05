import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] ${req.method} ${req.path}`)

  if (req.method === 'POST' && req.body) {
    console.log(`  Body: ${JSON.stringify(req.body).substring(0, 100)}...`)
  }

  next()
}
