import { Request, Response, NextFunction } from "express";

import { geminiService } from "../services/geminiService";
import type { IHealthCheckResponse, IReviewRequest, IReviewResponse } from "../types";

import { config } from "../config";

const startTime = Date.now()

export const healthCheck = (_req: Request, res: Response) => {
  const upTime = Math.floor((Date.now() - startTime)/ 1000)

  const response: IHealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Code Reviewer API',
    upTime,
  }

  res.json(response)
}

export const getApiInfo = (_req: Request, res: Response) => {
  res.json({
    name: 'Smart Code Reviewer API',
    version: `${config.apiVersion}`,
    endpoints: {
      health: '/api/health',
      review: '/api/review (POST)',
    },
    maxCodeLength: config.maxCodeLength,
    supportedLanguages: [
      'javascript',
      'typescript',
      'python',
      'java',
      'go',
      'rust',
      'php',
      'ruby',
    ],
  })
}

export const reviewCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, language = 'javascript' }: IReviewRequest = req.body

    console.log(`📝 Reviewing ${language} code (${code.length} characters)`)
    const startReview = Date.now()

    const review = await geminiService.reviewCode(code, language)

    const duration = Date.now() - startReview
    console.log(`✅ Review completed in ${duration}ms - Overall Score: ${review.overallScore}/100 (${review.overallGrade})`)

    const response: IReviewResponse = {
      success: true,
      data: review,
      timestamp: new Date().toISOString()
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
}
