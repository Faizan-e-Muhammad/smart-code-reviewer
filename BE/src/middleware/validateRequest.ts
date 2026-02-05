import { Request, Response, NextFunction } from "express";

import { AppError } from "./errorHandler";
import { config } from "../config";

export const validateReviewRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { code, language } = req.body

  if (!code || typeof code !== 'string') {
    throw new AppError(400, 'Code is required and must be a string')
  }

  if (code.trim().length === 0) {
    throw new AppError(400, 'Code cannot be empty')
  }

  if (code.length > config.maxCodeLength) {
    throw new AppError(413, `Code is too long (max ${config.maxCodeLength} characters)`)
  }

  if (language && typeof language !== 'string') {
    throw new AppError(400, 'Language must be a string')
  }

  next()
}
