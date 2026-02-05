export interface IHealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    service: string;
    upTime: number;
}

export interface IReviewRequest {
  code: string;
  language?: string;
}

export interface ReadabilityScore {
  score: number;
  issues: string[];
  strengths: string[];
}

export interface StructureScore {
  score: number;
  issues: string[];
  strengths: string[];
}

export interface MaintainabilityScore {
  score: number;
  issues: string[];
  strengths: string[];
}

export interface CodeMetrics {
  linesOfCode: number;
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  functionCount: number;
  hasComments: boolean;
}

export interface IReview {
  readability: ReadabilityScore;
  structure: StructureScore;
  maintainability: MaintainabilityScore;
  overallScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  summary: string;
  criticalIssues: string[];
  recommendations: string[];
  metrics: CodeMetrics;
}

export interface IReviewResponse {
  success: boolean;
  data?: IReview;
  error?: string;
  timestamp?: string;
}
