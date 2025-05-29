import * as React from "react"
import { cn } from "@/lib/utils"
import { BarChart3, Calendar, Zap, User, Settings } from "lucide-react"

interface MobileBottomNavProps {
  activeView: string
  onViewChange: (view: string) => void
  userRole: string
  className?: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  badge?: number
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    roles: ['Employee', 'WorkFlowManagement', 'Manager', 'Developer']
  },
  {
    id: 'smartmatch',
    label: 'Swaps',
    icon: Zap,
    roles: ['Employee', 'WorkFlowManagement', 'Manager', 'Developer'],
    // badge: 3 // Removed hardcoded badge - will be dynamic based on real data
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    roles: ['Employee', 'WorkFlowManagement', 'Manager', 'Developer']
  },
  {
    id: 'account',
    label: 'Account',
    icon: User,
    roles: ['Employee', 'WorkFlowManagement', 'Manager', 'Developer']
  }
]

export function MobileBottomNav({
  activeView,
  onViewChange,
  userRole,
  className
}: MobileBottomNavProps) {
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole))

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg",
      "md:hidden", // Only show on mobile
      className
    )}>
      <div className="grid grid-cols-4 h-16">
        {filteredNavItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors duration-200",
                "relative group",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}

              {/* Icon with badge */}
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )} />

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-colors duration-200",
                isActive ? "text-blue-600" : "text-gray-600"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  )
}

// Hook to manage bottom navigation state
export function useMobileBottomNav() {
  const [isVisible, setIsVisible] = React.useState(true)
  const [lastScrollY, setLastScrollY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide nav when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return { isVisible }
}
