import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware'
import type { NextRequest } from 'next/server'

// Este middleware intercepta todas as rotas exceto as de API, _next/static, _next/image, e favicon.ico.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Adicionar rotas específicas que você quer proteger aqui, se necessário.
    // '/dashboard/:path*', // Exemplo
  ],
}

export default function middleware(req: NextRequest) {
  return withAuth(req)
}