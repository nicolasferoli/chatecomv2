import EmojiPicker from 'emoji-picker-react'

import { EmojiClickData } from 'emoji-picker-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Braces,
  Clock,
  Italic,
  Loader,
  Loader2,
  Smile,
  Sparkles,
  Strikethrough,
  X,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
interface MessageTextAreaProps {
  text: string
  setText: (text: string) => void
  showEmojiPicker: boolean
  setShowEmojiPicker: (show: boolean) => void
  variables?: Array<{ id: string; text: string }>
  placeholder?: string | 'Escreva sua mensagem'
  hasDynamicDelay: boolean
  setHasDynamicDelay: (hasDynamicDelay: boolean) => void
  minutes: any
  setMinutes: (minutes: any) => void
  seconds: any
  setSeconds: (seconds: any) => void
  isImage?: boolean
}

const MessageTextArea = ({
  text,
  setText,
  showEmojiPicker,
  setShowEmojiPicker,
  variables,
  placeholder,
}: MessageTextAreaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [isAiGenereting, setIsAiGenereting] = useState(true)
  const [isAiLoading, setIsAiLoading] = useState(false)

  const applyMarkdown = (mark: string) => {
    const textarea = textAreaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)
    const newText =
      text.substring(0, start) +
      mark +
      selectedText +
      mark +
      text.substring(end)
    setText(newText)
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText(text + emojiData.emoji)
    setShowEmojiPicker(false)
  }

    const handleGenerateAiText = async () => {
      setIsAiLoading(true)
      const response = await fetch('https://flowiseai-railway-production-4a15.up.railway.app/api/v1/prediction/991272a0-b730-424a-828a-fd5da118ad30', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: text }),
    })
    const data = await response.json()

    setText(data.text)

   setIsAiLoading(false)
   return
  }

  return (
    <div
      className={`z-10 max-w-[390px] overflow-hidden !rounded-md border-[1px] border-gray-300 bg-white text-zinc-900 ${isAiLoading && 'animate-borderColorCycleAi border-[2px]'}`}
    >
      <textarea
        autoFocus
        ref={textAreaRef}
        placeholder={placeholder ? placeholder : 'Escreva sua mensagem'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`h-fit w-full resize-none whitespace-pre-wrap break-words border-none px-[14px] pt-[10px] text-[14px] text-sm outline-none placeholder:text-xs md:placeholder:text-sm ${text.length > 100 && 'min-h-[200px] resize-y'}`}
      />
      <div className='bottom-2 left-2 flex w-full justify-between gap-2 bg-white px-[5px]'>
        <div className='flex items-center opacity-60'>
          <Button variant='link' size='icon' onClick={() => applyMarkdown('*')}>
            <Bold className='h-2 w-2' />
          </Button>
          <Button variant='link' size='icon' onClick={() => applyMarkdown('_')}>
            <Italic className='h-4 w-4' />
          </Button>
          <Button variant='link' size='icon' onClick={() => applyMarkdown('~')}>
            <Strikethrough className='h-4 w-4' />
          </Button>
          <Button
            variant='link'
            size='icon'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className='h-4 w-4' />
          </Button>
        </div>
        <div>
          <div className='flex items-center opacity-80'>
          
            {variables ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='link' size='icon'>
                    <Braces className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {variables.map((variable) => (
                    <DropdownMenuItem
                      key={variable.id}
                      onClick={() => setText(`${text}{${variable.text}}`)}
                    >
                      {variable.text}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant='link' size='icon'>
                <Braces className='h-4 w-4' />
              </Button>
            )}

            <Button variant='link' size='icon' onClick={() => {setIsAiGenereting(!isAiGenereting),handleGenerateAiText()}}>
                {isAiLoading ? (<Loader className='animate-spin h-4 w-4'/>):( <Sparkles className='h-4 w-4' />)}
             
            </Button>
          </div>
        </div>
      </div>

      {showEmojiPicker && (
        <div className='absolute top-52 z-40 rounded-lg border border-gray-300 bg-white p-2 shadow-lg'>
          <span className='mb-2 flex justify-end'>
            <X
              className='text-zinc-500 hover:cursor-pointer hover:text-red-600'
              onClick={() => setShowEmojiPicker(false)}
            />
          </span>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  )
}

export default MessageTextArea
