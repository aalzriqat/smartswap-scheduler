import * as React from "react"
import { cn } from "@/lib/utils"
import { MessageCircle, X, Send, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileFeedbackButtonProps {
  className?: string
  onSubmit?: (feedback: { message: string; rating: number; type: string }) => void
}

export function MobileFeedbackButton({ className, onSubmit }: MobileFeedbackButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [rating, setRating] = React.useState(0)
  const [feedbackType, setFeedbackType] = React.useState("general")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const isMobile = useIsMobile()

  const handleSubmit = async () => {
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit?.({
        message: message.trim(),
        rating,
        type: feedbackType
      })
      
      // Reset form
      setMessage("")
      setRating(0)
      setFeedbackType("general")
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show on mobile
  if (!isMobile) return null

  return (
    <>
      {/* Floating feedback button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 rounded-full shadow-lg",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "h-12 w-12 p-0",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 active:scale-95",
          className
        )}
        aria-label="Send feedback"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>

      {/* Feedback modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal content */}
          <Card className="relative w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Having issues?</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Feedback type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What's this about?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "bug", label: "Bug Report" },
                    { id: "feature", label: "Feature Request" },
                    { id: "general", label: "General" },
                    { id: "help", label: "Need Help" }
                  ].map((type) => (
                    <Button
                      key={type.id}
                      variant={feedbackType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFeedbackType(type.id)}
                      className="text-xs"
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  How would you rate your experience?
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition-colors",
                          star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tell us more
                </label>
                <Textarea
                  placeholder="Describe your issue or suggestion..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Send Feedback</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
