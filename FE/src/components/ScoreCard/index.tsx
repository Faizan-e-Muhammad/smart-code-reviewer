interface ScoreCardProps {
  title: string
  score: number
  issues: string[]
  strengths: string[]
  icon: string
}

export const ScoreCard = ({ title, score, issues, strengths, icon }: ScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-300'
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-300'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-300'
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-300'
    return 'text-red-600 bg-red-50 border-red-300'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          {title}
        </h3>
        <div className={`px-4 py-2 rounded-lg font-bold text-2xl border-2 ${getScoreColor(score)}`}>
          {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-600 mb-2">⚠️ Issues:</h4>
          <ul className="space-y-2">
            {issues.map((issue, idx) => (
              <li key={idx} className="text-sm text-slate-700 bg-red-50 p-2 rounded border-l-2 border-red-400">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-600 mb-2">✅ Strengths:</h4>
          <ul className="space-y-2">
            {strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-slate-700 bg-green-50 p-2 rounded border-l-2 border-green-400">
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
