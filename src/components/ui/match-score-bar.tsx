import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface MatchScoreBarProps {
  score: number
  label?: string
  showIcon?: boolean
  showPercentage?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
  reasons?: Array<{
    factor: string
    status: "positive" | "negative" | "neutral"
    description?: string
  }>
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-500"
  if (score >= 80) return "bg-blue-500"
  if (score >= 70) return "bg-yellow-500"
  if (score >= 60) return "bg-orange-500"
  return "bg-red-500"
}

const getScoreGradient = (score: number) => {
  if (score >= 90) return "from-green-400 to-green-600"
  if (score >= 80) return "from-blue-400 to-blue-600"
  if (score >= 70) return "from-yellow-400 to-yellow-600"
  if (score >= 60) return "from-orange-400 to-orange-600"
  return "from-red-400 to-red-600"
}

const getScoreIcon = (score: number) => {
  if (score >= 80) return CheckCircle
  if (score >= 60) return AlertCircle
  return XCircle
}

const getScoreIconColor = (score: number) => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

export function MatchScoreBar({
  score,
  label,
  showIcon = true,
  showPercentage = true,
  size = "md",
  animated = true,
  reasons = []
}: MatchScoreBarProps) {
  const [displayScore, setDisplayScore] = React.useState(animated ? 0 : score)
  const Icon = getScoreIcon(score)

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayScore(score)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [score, animated])

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  }

  const containerClasses = {
    sm: "space-y-1",
    md: "space-y-2",
    lg: "space-y-3"
  }

  return (
    <div className={cn("w-full", containerClasses[size])}>
      {(label || showIcon || showPercentage) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showIcon && (
              <Icon className={cn("h-4 w-4", getScoreIconColor(score))} />
            )}
            {label && (
              <span className="text-sm font-medium text-gray-700">{label}</span>
            )}
          </div>
          {showPercentage && (
            <span className={cn(
              "text-sm font-semibold",
              score >= 80 ? "text-green-600" : 
              score >= 60 ? "text-yellow-600" : "text-red-600"
            )}>
              {score}%
            </span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "bg-gradient-to-r transition-all duration-1000 ease-out rounded-full",
            sizeClasses[size],
            getScoreGradient(score)
          )}
          style={{ 
            width: `${displayScore}%`,
            transition: animated ? "width 1000ms ease-out" : "none"
          }}
        />
      </div>

      {reasons.length > 0 && (
        <div className="mt-2 space-y-1">
          {reasons.map((reason, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              {reason.status === "positive" && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {reason.status === "negative" && (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              {reason.status === "neutral" && (
                <AlertCircle className="h-3 w-3 text-yellow-500" />
              )}
              <span className="text-gray-600">
                {reason.factor}
                {reason.description && `: ${reason.description}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
