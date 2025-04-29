import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Este middleware intercepta todas as rotas exceto as de API, _next/static, _next/image, e favicon.ico.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
    // Adicionar rotas específicas que você quer proteger aqui, se necessário.
    // '/dashboard/:path*', // Exemplo
  ],
}

export async function middleware(req: NextRequest) {
  console.log('>>> NextAuth Middleware Running for:', req.nextUrl.pathname);
  
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  // Se o usuário não estiver autenticado, redireciona para o login
  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}