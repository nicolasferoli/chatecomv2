import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📝 -> Criando novo chat:', body)
    const {
      id,
      name,
      description,
      theme,
      prompt,
      template,
      type,
      domain,
      bot_name,
      bot_picture,
    } = body

    // Verifica se já existe um chat com este ID
    if (id) {
      const existingChat = await prisma.chat.findUnique({
        where: { id },
      })

      if (existingChat) {
        console.log('⚠️ -> Chat já existe:', existingChat)
        return NextResponse.json(existingChat)
      }
    }

    const chat = await prisma.chat.create({
      data: {
        id: uuidv4(),
        name,
        description: description || '',
        theme: theme || '',
        prompt: prompt || '',
        template: template || '',
        type: type || '',
        domain: domain || '',
        user_id: user.id || '',
        bot_name: bot_name || '',
        bot_picture: bot_picture || '',
      },
    })

    console.log('✅ -> Chat criado:', chat)
    return NextResponse.json(chat)
  } catch (error) {
    console.log('❌ -> Erro ao criar chat:', error)
    return NextResponse.json({ error: 'Erro ao criar chat' }, { status: 500 })
  }
}

export async function GET() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    )
  }

  try {
    console.log('🔍 -> Buscando todos os chats')
    const chats = await prisma.chat.findMany({
      include: {
        messages: true,
      },
      where: {
        user_id: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('✅ -> Chats encontrados:', chats.length)
    return NextResponse.json(chats)
  } catch (error) {
    console.log('❌ -> Erro ao buscar chats:', error)
    return NextResponse.json({ error: 'Erro ao buscar chats' }, { status: 500 })
  }
}
