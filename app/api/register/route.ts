import { NextResponse } from 'next/server';
import { registerUser } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    try {
      // Registrando o usuário usando a função do NextAuth
      const user = await registerUser(name, email, password);
      
      // Retorno de sucesso
      return NextResponse.json(
        { message: 'Usuário criado com sucesso', user },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Erro ao registrar usuário' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 