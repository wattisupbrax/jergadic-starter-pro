import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/submit',              // Submit new terms/definitions
  '/profile(.*)',         // User profile pages  
  '/admin(.*)',          // Admin dashboard
  '/api/terms',          // POST requests to create terms
  '/api/votes(.*)',      // Voting endpoints
  '/api/comments(.*)',   // Comment endpoints
  '/api/dichos(.*)',     // Dichos endpoints
  '/api/flags(.*)',      // Content flagging
])

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/flags(.*)', // Only admins can manage flags
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = auth()
  
  // Handle admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }
    
    // Check if user has admin role (you can customize this logic)
    const userRole = sessionClaims?.metadata?.role || 'user'
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return Response.redirect(new URL('/', req.url))
    }
  }
  
  // Handle protected routes
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return Response.redirect(signInUrl)
  }

  return Response.next()
})  

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api/webhooks).*)",
  ],
}
