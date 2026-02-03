import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('chadito-auth-token')
    const isLoginPage = request.nextUrl.pathname === '/login'

    // Si pas de token et on essaie d'accéder à une page protégée (tout sauf /login et assets)
    if (!token && !isLoginPage && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.includes('.')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si on a un token et qu'on essaie d'aller sur /login, on redirige vers le dashboard
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
