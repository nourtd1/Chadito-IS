import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('chadito-auth-token')
    const isLoginPage = request.nextUrl.pathname === '/login'

    // Logique simplifiée pour éviter les boucles de redirection au build
    // Si on est sur une route admin (commençant par /) mais pas login, que ce n'est pas un fichier statique

    if (!token && !isLoginPage && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.includes('.')) {
        // return NextResponse.redirect(new URL('/login', request.url)) // Désactivé temporairement pour stabiliser le dev
    }

    return NextResponse.next()
}

// Matcher plus restrictif pour éviter d'intercepter les assets
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
