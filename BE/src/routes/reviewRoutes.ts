import { Router } from "express";

import { validateReviewRequest } from "../middleware/validateRequest";

import { healthCheck, getApiInfo, reviewCode } from "../controllers/reviewController";

const router = Router()

// Health Router
router.get('/health', healthCheck)

// API info
router.get('/', getApiInfo)

// Code Review Endpoint
router.post('/review', validateReviewRequest, reviewCode)

export default router;
