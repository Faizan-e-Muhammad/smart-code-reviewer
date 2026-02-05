import { GoogleGenAI } from "@google/genai";

import type { IReview, CodeMetrics } from "../types";

import { config } from "../config";
import { AppError } from "../middleware/errorHandler";


export class GeminiService {
  private genAI: GoogleGenAI
  private model: string

  constructor() {
    this.genAI = new GoogleGenAI({apiKey: config.geminiApiKey!})
    this.model = 'gemini-3-flash-preview'
  }

  async reviewCode(code: string, language: string): Promise<IReview> {
    const prompt = this.buildPrompt(code, language)

    try {
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents: prompt
      })
      const reviewText = result.text

      if (!reviewText) {
        throw new AppError(502, 'No response received from AI service')
      }

      // Parse and validate JSON response
      const review = this.parseReview(reviewText, code)

      return review      
    } catch (error) {
      console.log('Gemini API Error: ', error)

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new AppError(401, 'Invalid API key')
        }
        if (error.message.includes('quota')) {
          throw new AppError(429, 'API quota exceeded')
        }
      }

      throw new AppError(500, 'Failed to communicate with AI service')
    }
  }

  private parseReview(reviewText: string, code: string): IReview {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = reviewText.trim()

      // Remove markdown code blocks
      const jsonMatch = reviewText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      }

      const review = JSON.parse(jsonText) as Omit<IReview, 'metrics'>

      // Validate structure
      if (
        !review.readability ||
        !review.structure ||
        !review.maintainability ||
        typeof review.overallScore !== 'number' ||
        !review.overallGrade ||
        !review.summary ||
        !Array.isArray(review.criticalIssues) ||
        !Array.isArray(review.recommendations)
      ) {
        throw new Error('Invalid review structure')
      }

      // Calculate metrics from the code
      const metrics = this.calculateMetrics(code)

      return {
        ...review,
        metrics,
      }
    } catch (error) {
      console.log('Failed to parse review: ', reviewText.substring(0, 200))
      throw new AppError(500, 'Failed to parse AI response')
    }
  }

  private calculateMetrics (code: string): CodeMetrics {
    const lines = code.split('\n').filter(line => line.trim().length > 0)
    const linesOfCode = lines.length

    // Simple function count
    const functionMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{|def\s+\w+|func\s+\w+/g)
    const functionCount = functionMatches ? functionMatches.length : 0

    // Check for comments
    const hasComments = /\/\/|\/\*|\*\/|#|"""/.test(code)

    // Simple complexity estimation
    let complexity: CodeMetrics['complexity'] = 'low'
    const complexityIndicators = (code.match(/if|else|for|while|switch|case|catch|\?\.|&&|\|\|/g) || []).length

    if (complexityIndicators > 15) complexity = 'very-high'
    else if (complexityIndicators > 10) complexity = 'high'
    else if (complexityIndicators > 5) complexity = 'medium'

    return {
      linesOfCode,
      complexity,
      functionCount,
      hasComments,
    }
  }

  private buildPrompt(code: string, language: string): string {
    return `You are an expert code reviewer specializing in code quality assessment. Your task is to thoroughly review the following ${language} code for three key aspects: READABILITY, STRUCTURE, and MAINTAINABILITY.

      CODE TO REVIEW:
      \`\`\`${language}
      ${code}
      \`\`\`

      Please analyze this code and provide a comprehensive review following these guidelines:

      **READABILITY (0-100):**
      - Variable and function naming clarity
      - Code formatting and consistency
      - Comment quality and presence
      - Code clarity and self-documentation
      - Cognitive load required to understand the code

      **STRUCTURE (0-100):**
      - Code organization and modularity
      - Separation of concerns
      - Proper use of design patterns
      - Function/method size and cohesion
      - Coupling and dependencies
      - Logical flow and organization

      **MAINTAINABILITY (0-100):**
      - Code reusability
      - Extensibility and flexibility
      - Error handling and edge cases
      - Testing considerations
      - Technical debt indicators
      - Long-term sustainability

      For each category (readability, structure, maintainability):
      - Provide a score from 0-100
      - List specific ISSUES found (be detailed and reference actual code)
      - List STRENGTHS (what's done well)

      Additionally provide:
      - An OVERALL SCORE (weighted average)
      - An OVERALL GRADE (A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: <60)
      - A brief SUMMARY (2-3 sentences)
      - CRITICAL ISSUES that must be addressed (can be empty array)
      - RECOMMENDATIONS for improvement (prioritized list)

      IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.

      Required JSON format:
      {
        "readability": {
          "score": 85,
          "issues": ["issue 1", "issue 2"],
          "strengths": ["strength 1", "strength 2"]
        },
        "structure": {
          "score": 75,
          "issues": ["issue 1"],
          "strengths": ["strength 1"]
        },
        "maintainability": {
          "score": 80,
          "issues": ["issue 1"],
          "strengths": ["strength 1"]
        },
        "overallScore": 80,
        "overallGrade": "B",
        "summary": "Brief 2-3 sentence summary of the code quality",
        "criticalIssues": ["critical issue 1 that must be fixed"],
        "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
      }

      Be specific, constructive, and reference actual code elements in your feedback.`
  }

}

export const geminiService = new GeminiService()
