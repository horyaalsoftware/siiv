import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  // 1. Redirect already logged-in users from /login to dashboard
  if (nextUrl.pathname === "/login") {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl))
    }
    return undefined
  }

  // 2. Protect all other routes
  if (!isLoggedIn) {
     // Allow access to auth API routes and static images/assets
     if (nextUrl.pathname.startsWith("/api/auth") || 
         nextUrl.pathname.startsWith("/_next") || 
         nextUrl.pathname.match(/\.(jpg|png|gif|svg|ico)$/)) {
       return undefined
     }
     return Response.redirect(new URL("/login", nextUrl))
  }

  return undefined
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
