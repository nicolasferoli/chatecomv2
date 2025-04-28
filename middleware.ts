import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Este middleware intercepta todas as rotas exceto as de API, _next/static, _next/image, e favicon.ico.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Adicionar rotas específicas que você quer proteger aqui, se necessário.
    // '/dashboard/:path*', // Exemplo
  ],
}

export function middleware(request: NextRequest) {
  // Você pode adicionar lógica personalizada aqui antes ou depois do Kinde authMiddleware,
  // por exemplo, para redirecionamentos baseados em roles, etc.

  // Executa o middleware de autenticação do Kinde
  return authMiddleware(request)

  // Se precisar retornar uma resposta customizada APÓS o authMiddleware:
  // const response = authMiddleware(request);
  // // Modificar response aqui se necessário
  // return response;
}