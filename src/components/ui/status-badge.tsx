import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        pending: "border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        approved: "border-green-200 bg-green-100 text-green-800 hover:bg-green-200",
        rejected: "border-red-200 bg-red-100 text-red-800 hover:bg-red-200",
        cancelled: "border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200",
        active: "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200",
        completed: "border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        expired: "border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-200",
        "perfect-match": "border-green-300 bg-green-200 text-green-900 hover:bg-green-300",
        "high-match": "border-blue-300 bg-blue-200 text-blue-900 hover:bg-blue-300",
        "good-match": "border-yellow-300 bg-yellow-200 text-yellow-900 hover:bg-yellow-300",
        "low-match": "border-orange-300 bg-orange-200 text-orange-900 hover:bg-orange-300",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "pending",
      size: "md",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
  pulse?: boolean
}

function StatusBadge({ className, variant, size, pulse = false, children, ...props }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        statusBadgeVariants({ variant, size }),
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }
