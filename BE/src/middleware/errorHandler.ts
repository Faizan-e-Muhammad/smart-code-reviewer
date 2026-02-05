import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    })
  }

  // Log Unexpected errors
  console.error('❌ Unexpected error:', err)

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  })
}
