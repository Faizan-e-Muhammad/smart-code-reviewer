import axios from "axios";

import { config } from "../config";

import type { IReviewResponse } from "../types";

const BASE_URL = `${config.apiBaseUrl}`;

export class ApiError extends Error {
  public statusCode: number;

  constructor (statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

export const reviewCode = async (
  code: string,
  language: string = 'javascript'
): Promise<IReviewResponse> => {
  try {
    const response = await axios.post(`${config.apiBaseUrl}/review`, {
      code,
      language,
    })

    const data: IReviewResponse = await response.data

    if (response.status !== 200) {
      throw new ApiError(response.status, data.error || "Request Failed")
    }

    return data
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }

    // Network or other errors
    throw new ApiError(0, err instanceof Error ? err.message : "Network error")
  }
}

export const checkHealth = async (): Promise<boolean> => {
  try{
    const response = await axios.get(`${BASE_URL}/health`)

    return response.status === 200
  } catch {
    return false
  }
}
