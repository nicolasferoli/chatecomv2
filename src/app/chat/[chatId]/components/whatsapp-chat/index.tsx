'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chat, Message } from '@prisma/client'

import { ChatHeader } from './chat-header'
import { ChatContent } from './chat-content'
import { ChatContext } from './chat-context'
import { registerChatAction, sendAnswer } from '../../actions/chat-actions'
import { ToastContainer } from 'react-toastify'

type WhatsAppChatProps = {
  chatInfo: Chat
  messages: Message[]
}

export function WhatsAppChat({ chatInfo, messages }: WhatsAppChatProps) {
  const runId = useMemo(() => crypto.randomUUID(), [])
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [isWaitingAnswer, setWaitingAnswer] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  const [currentMessage, setCurrentMessage] = useState<Message>()

  const messagesIterator = useMemo(
    () =>
      (function* (): Generator<Message, void, unknown> {
        yield* messages
      })(),
    [messages]
  )

  const variableReplacer = useCallback(
    (value: string) =>
      value.replace(/\{(\w+)\}/gi, (og, name) => variables?.[name] ?? og),
    [variables]
  )

  // TODO: Falta implementar ActionLog (analytics)
  // TODO: Falta implementar delay dinâmico
  async function renderNextMessage() {
    const { value: message, done: iteratorFinish } = messagesIterator.next()
    if (iteratorFinish) return console.log('::::> CHAT FINALIZADO')
    setCurrentMessage(message)

    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, 2_000))

    const key = message.type === 'image' ? 'legend' : 'text'
    if (message?.content?.[key]) {
      message.content[key] = variableReplacer(message.content[key])
    }

    setChatHistory((state) => [...state, message])
    setIsTyping(false)

    if (message.type === 'question' || message.type === 'buttons') {
      setWaitingAnswer(true)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 750))

    renderNextMessage()
  }

  async function storeUserAnswer(value: string) {
    if (value)
      // @ts-expect-error Não precisa popular todas propriedades
      setChatHistory((state) => [
        ...state,
        {
          id: crypto.randomUUID(),
          from: 'user',
          chatId: chatInfo.id,
          type: 'text',
          content: {
            text: value,
          },
        },
      ])

    switch (currentMessage?.type) {
      case 'redirect':
        await registerChatAction(chatInfo.id, 'clicked_link', {
          clicked_link_url: `https://${(currentMessage?.content as any)?.url}`,
        })
        break
      case 'buttons':
        await registerChatAction(chatInfo.id, 'clicked_button', {
          button_question: (currentMessage?.content as any)?.text,
          button_answer: value,
        })

        renderNextMessage()
        break
      case 'question':
        const variableName = (currentMessage?.content as any)?.options?.variable
        setVariables((state) => ({
          ...state,
          [variableName]: value,
        }))

        await sendAnswer(runId, chatInfo.id, currentMessage?.id!, value)
        break
    }
  }

  useEffect(() => {
    renderNextMessage()
  }, [variables])

  return (
    <ChatContext.Provider
      value={{
        chatInfo,
        currentMessage,
        isTyping,
        isWaitingAnswer,
        setWaitingAnswer,
        storeUserAnswer,
        messages: chatHistory,
      }}
    >
      <div className='flex min-h-[100svh] flex-col bg-gray-100 bg-whatsappBackground'>
        <ChatHeader />
        <ChatContent />
      </div>

      <ToastContainer />
    </ChatContext.Provider>
  )
}
