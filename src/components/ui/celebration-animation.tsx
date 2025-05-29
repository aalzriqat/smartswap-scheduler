import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Sparkles, Heart, Star } from "lucide-react"

interface CelebrationAnimationProps {
  isVisible: boolean
  onComplete?: () => void
  type?: "success" | "match" | "achievement"
  message?: string
  duration?: number
}

const celebrationConfig = {
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    particles: "🎉",
    message: "Success!"
  },
  match: {
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    particles: "💖",
    message: "Perfect Match!"
  },
  achievement: {
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    particles: "⭐",
    message: "Achievement Unlocked!"
  }
}

export function CelebrationAnimation({
  isVisible,
  onComplete,
  type = "success",
  message,
  duration = 3000
}: CelebrationAnimationProps) {
  const [showParticles, setShowParticles] = React.useState(false)
  const config = celebrationConfig[type]
  const Icon = config.icon

  React.useEffect(() => {
    if (isVisible) {
      setShowParticles(true)
      
      // Play success sound (if available)
      try {
        const audio = new Audio('/sounds/success.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {
          // Ignore audio errors (user might not have interacted with page yet)
        })
      } catch (error) {
        // Ignore audio errors
      }

      const timer = setTimeout(() => {
        setShowParticles(false)
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 animate-in fade-in duration-300" />
      
      {/* Floating particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {config.particles}
            </div>
          ))}
        </div>
      )}

      {/* Main celebration card */}
      <div className={cn(
        "relative bg-white rounded-2xl shadow-2xl border-2 p-8 max-w-sm mx-4",
        "animate-in zoom-in-95 duration-500 ease-out",
        config.borderColor
      )}>
        {/* Sparkle effects */}
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-6 w-6 text-yellow-400 animate-spin" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          {/* Main icon with pulse animation */}
          <div className={cn(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
            "animate-pulse",
            config.bgColor
          )}>
            <Icon className={cn("h-8 w-8", config.color)} />
          </div>

          {/* Message */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {message || config.message}
            </h3>
            <p className="text-gray-600 text-sm">
              {type === "match" && "Your swap request has been successfully matched!"}
              {type === "success" && "Your action was completed successfully!"}
              {type === "achievement" && "You've reached a new milestone!"}
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all ease-linear",
                config.color.replace('text-', 'bg-')
              )}
              style={{
                width: "100%",
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Preset celebration components
export function SuccessCelebration({ 
  isVisible, 
  onComplete, 
  message 
}: { 
  isVisible: boolean
  onComplete?: () => void
  message?: string 
}) {
  return (
    <CelebrationAnimation
      isVisible={isVisible}
      onComplete={onComplete}
      type="success"
      message={message}
    />
  )
}

export function MatchCelebration({ 
  isVisible, 
  onComplete, 
  message 
}: { 
  isVisible: boolean
  onComplete?: () => void
  message?: string 
}) {
  return (
    <CelebrationAnimation
      isVisible={isVisible}
      onComplete={onComplete}
      type="match"
      message={message}
    />
  )
}

export function AchievementCelebration({ 
  isVisible, 
  onComplete, 
  message 
}: { 
  isVisible: boolean
  onComplete?: () => void
  message?: string 
}) {
  return (
    <CelebrationAnimation
      isVisible={isVisible}
      onComplete={onComplete}
      type="achievement"
      message={message}
    />
  )
}
