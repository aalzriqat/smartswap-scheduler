import * as React from "react"
import { cn } from "@/lib/utils"
import { Zap, Search, Users, Clock } from "lucide-react"

interface LiveTrackingIndicatorProps {
  isActive: boolean
  status: "searching" | "matching" | "found" | "no-matches" | "idle"
  matchCount?: number
  timeElapsed?: number
  className?: string
}

const statusConfig = {
  searching: {
    icon: Search,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    message: "Searching for compatible matches...",
    pulseColor: "bg-blue-400"
  },
  matching: {
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    message: "Analyzing compatibility scores...",
    pulseColor: "bg-yellow-400"
  },
  found: {
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    message: "Matches found!",
    pulseColor: "bg-green-400"
  },
  "no-matches": {
    icon: Search,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
    message: "Found 0 potential matches.",
    pulseColor: "bg-orange-400"
  },
  idle: {
    icon: Clock,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    message: "Ready to search",
    pulseColor: "bg-gray-400"
  }
}

export function LiveTrackingIndicator({
  isActive,
  status,
  matchCount,
  timeElapsed,
  className
}: LiveTrackingIndicatorProps) {
  const [dots, setDots] = React.useState("")
  const config = statusConfig[status]
  const Icon = config.icon

  // Animated dots for active states
  React.useEffect(() => {
    if (!isActive) {
      setDots("")
      return
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isActive])

  // Format time elapsed
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (!isActive && status === "idle") {
    return null
  }

  return (
    <div className={cn(
      "flex items-center space-x-3 p-4 rounded-lg border transition-all duration-300",
      config.bgColor,
      config.borderColor,
      className
    )}>
      {/* Animated icon with pulse effect */}
      <div className="relative">
        <Icon className={cn("h-5 w-5", config.color)} />
        {isActive && (
          <div className={cn(
            "absolute inset-0 rounded-full animate-ping",
            config.pulseColor,
            "opacity-75"
          )} />
        )}
      </div>

      {/* Status message */}
      <div className="flex-1">
        <div className={cn("font-medium", config.color)}>
          {config.message}{isActive && dots}
        </div>

        {/* Additional info */}
        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
          {matchCount !== undefined && matchCount > 0 && (
            <span>{matchCount} potential matches</span>
          )}
          {timeElapsed !== undefined && timeElapsed > 0 && (
            <span>Elapsed: {formatTime(timeElapsed)}</span>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {isActive && (
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full animate-bounce",
                config.pulseColor
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "1s"
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Preset configurations for common use cases
export function SearchingIndicator({ matchCount, timeElapsed }: { matchCount?: number; timeElapsed?: number }) {
  return (
    <LiveTrackingIndicator
      isActive={true}
      status="searching"
      matchCount={matchCount}
      timeElapsed={timeElapsed}
    />
  )
}

export function MatchingIndicator({ timeElapsed }: { timeElapsed?: number }) {
  return (
    <LiveTrackingIndicator
      isActive={true}
      status="matching"
      timeElapsed={timeElapsed}
    />
  )
}

export function FoundIndicator({ matchCount }: { matchCount: number }) {
  return (
    <LiveTrackingIndicator
      isActive={false}
      status="found"
      matchCount={matchCount}
    />
  )
}
