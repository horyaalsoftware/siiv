"use client"

import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface TopNavProps {
  userName?: string | null
  userRole?: string | null
}

export function TopNav({ userName, userRole }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
             S
           </div>
           <span className="font-bold text-xl tracking-tight hidden sm:inline-block">Siiv</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-2 sm:mr-4">
            <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold leading-none">{userName}</span>
                <span className="text-xs text-muted-foreground uppercase mt-1 tracking-wider font-mono">{userRole}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-muted shadow-inner">
               <User className="h-5 w-5" />
            </div>
          </div>
          
          <div className="h-6 w-px bg-border mx-1"></div>
          
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
