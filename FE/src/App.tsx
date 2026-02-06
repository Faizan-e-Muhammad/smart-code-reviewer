import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { reviewCode, checkHealth } from './services/api'
import { ScoreCard } from './components/ScoreCard'
import type { IReview } from './types'
import './App.css'


function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [review, setReview] = useState<IReview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiHealthy, setApiHealthy] = useState(true)

  useEffect(() => {
    checkHealth().then(setApiHealthy)
  }, [])

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review')
      return
    }

    setLoading(true)
    setError(null)
    setReview(null)

    try {
      const response = await reviewCode(code, language)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get review')
      }

      setReview(response.data)
    } catch (err) {
      console.error('Review error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze code')

      const healthy = await checkHealth()
      setApiHealthy(healthy)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    const colors = {
      A: 'text-green-600 bg-green-100 border-green-400',
      B: 'text-blue-600 bg-blue-100 border-blue-400',
      C: 'text-yellow-600 bg-yellow-100 border-yellow-400',
      D: 'text-orange-600 bg-orange-100 border-orange-400',
      F: 'text-red-600 bg-red-100 border-red-400',
    }
    return colors[grade as keyof typeof colors] || colors.C
  }

  const getComplexityColor = (complexity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      'very-high': 'bg-red-100 text-red-800',
    }
    return colors[complexity as keyof typeof colors] || colors.medium
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            🔍 Smart Code Reviewer
          </h1>
          <p className="text-slate-600 text-lg mb-2">
            AI-powered analysis of code readability, structure, and maintainability
          </p>
          <p className="text-slate-500 text-sm">
            Get detailed insights before human code review
          </p>

          {/* API Status */}
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white shadow-md border-2 border-slate-200">
            <div
              className={`w-3 h-3 rounded-full ${
                apiHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-medium text-slate-700">
              API Status: {apiHealthy ? 'Connected ✓' : 'Disconnected ✗'}
            </span>
          </div>
        </div>

        {/* Code Input Section */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-2 border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">📝 Submit Code for Review</h2>
            <div className="flex gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer transition-colors border-2 border-slate-300"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
              </select>

              <button
                onClick={() => {
                  setCode('')
                  setReview(null)
                  setError(null)
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors border-2 border-slate-300"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 font-mono text-sm border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
            placeholder="Paste your code here for comprehensive review..."
          />

          <button
            onClick={handleReview}
            disabled={loading || !apiHealthy}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg"
          >
            {loading ? (
              <>
                <span className="animate-spin text-2xl">⚙️</span>
                Analyzing Code...
              </>
            ) : (
              <>
                <span className="text-2xl">🔍</span>
                Review Code Quality
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold flex items-center gap-2">
                <span>❌</span> Error
              </p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              {!apiHealthy && (
                <p className="text-red-500 text-xs mt-2">
                  💡 Make sure the backend server is running on port 3001
                </p>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-2 border-slate-200">
            <div className="text-7xl mb-6 animate-pulse">🤖</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              Analyzing Your Code...
            </h3>
            <p className="text-slate-500">
              Evaluating readability, structure, and maintainability
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Review Results */}
        {review && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Overall Score Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Review Complete!</h2>
                  <p className="text-indigo-100 text-lg">{review.summary}</p>
                </div>
                <div className="text-center">
                  <div className={`inline-block px-8 py-4 rounded-xl font-bold text-5xl border-4 ${getGradeColor(review.overallGrade)} bg-white`}>
                    {review.overallGrade}
                  </div>
                  <p className="mt-2 text-sm text-indigo-100">Overall Grade</p>
                  <p className="text-3xl font-bold mt-1">{review.overallScore}/100</p>
                </div>
              </div>
            </div>

            {/* Code Metrics */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📊</span> Code Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600">
                    {review.metrics.linesOfCode}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Lines of Code</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {review.metrics.functionCount}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Functions</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getComplexityColor(review.metrics.complexity)}`}>
                    {review.metrics.complexity.toUpperCase()}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">Complexity</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl">
                    {review.metrics.hasComments ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Comments</div>
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            {review.criticalIssues.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                  <span>🚨</span> Critical Issues
                </h3>
                <ul className="space-y-2">
                  {review.criticalIssues.map((issue, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200"
                    >
                      <span className="text-red-600 font-bold flex-shrink-0">⚠️</span>
                      <span className="text-slate-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Score Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <ScoreCard
                title="Readability"
                score={review.readability.score}
                issues={review.readability.issues}
                strengths={review.readability.strengths}
                icon="📖"
              />
              <ScoreCard
                title="Structure"
                score={review.structure.score}
                issues={review.structure.issues}
                strengths={review.structure.strengths}
                icon="🏗️"
              />
              <ScoreCard
                title="Maintainability"
                score={review.maintainability.score}
                issues={review.maintainability.issues}
                strengths={review.maintainability.strengths}
                icon="🔧"
              />
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>💡</span> Recommendations for Improvement
              </h3>
              <div className="space-y-3">
                {review.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500"
                  >
                    <span className="font-bold text-indigo-700 flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-slate-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Display */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>💻</span> Reviewed Code
              </h3>
              <div className="rounded-lg overflow-hidden border-2 border-slate-300">
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '14px',
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!review && !loading && !error && (
          <div className="bg-white rounded-xl shadow-xl p-12 text-center border-2 border-slate-200">
            <div className="text-7xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              Ready to Review Your Code
            </h3>
            <p className="text-slate-500 mb-6">
              Paste your code above and click "Review Code Quality" to get started
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="text-3xl mb-2">📖</div>
                <h4 className="font-semibold text-slate-700 mb-1">Readability</h4>
                <p className="text-sm text-slate-600">
                  Naming, formatting, and code clarity analysis
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">🏗️</div>
                <h4 className="font-semibold text-slate-700 mb-1">Structure</h4>
                <p className="text-sm text-slate-600">
                  Organization, patterns, and modularity review
                </p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="text-3xl mb-2">🔧</div>
                <h4 className="font-semibold text-slate-700 mb-1">Maintainability</h4>
                <p className="text-sm text-slate-600">
                  Long-term code quality and extensibility check
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500 space-y-2">
          <p className="font-medium">
            🤖 Powered by Google Gemini 1.5 Flash • Built with Express.js & React • TypeScript Fullstack
          </p>
          <p className="text-xs">
            Smart Code Reviewer - Comprehensive AI-powered code quality analysis
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
