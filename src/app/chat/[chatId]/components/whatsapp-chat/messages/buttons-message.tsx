import React, { useState } from 'react'
import { Message } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDateToTime } from '@/utils/format-date-to-time'
import { MessageBubble } from './message-bubble'
import { customMarkdownParser } from './text-message'
import { cn } from '@/lib/utils'
import { useChatContext } from '../chat-context'

export type BaseMessageProps = {
  message: Message
}

export const ButtonsMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & BaseMessageProps
>(({ className, message, ...props }, ref) => {
  if (!(message.content as any)?.text) return
  const { storeUserAnswer } = useChatContext()
  const [disabled, setDisabled] = useState<boolean>(false)

  const sentAt = React.useMemo(() => formatDateToTime(new Date()), [])

  return (
    <div className='mx-4 my-1 flex w-fit flex-col gap-1'>
      <MessageBubble
        type={message.from}
        className={cn('m-0 min-w-full flex-col', className)}
        ref={ref}
        {...props}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className='mr-12 max-w-[370px] text-wrap break-words'
        >
          {customMarkdownParser((message.content as any)?.text ?? '')}
        </ReactMarkdown>
        <span className='absolute bottom-3 right-3 -my-1 self-end text-xs text-zinc-500'>
          {sentAt}
        </span>
      </MessageBubble>

      {(message?.content as any)?.buttons?.map((buttonName, index) => (
        <button
          key={index}
          className='max-w-full rounded-md bg-white p-3 text-center font-medium text-[#0C88EE] hover:cursor-pointer hover:bg-white/80'
          onClick={async () => {
            setDisabled(true)
            storeUserAnswer(buttonName)
          }}
          disabled={disabled}
        >
          <div className='text-sm'>{buttonName}</div>
        </button>
      ))}
    </div>
  )
})
