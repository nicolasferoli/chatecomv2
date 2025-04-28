'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Braces,
  Clock,
  Italic,
  Move,
  Smile,
  Sparkles,
  Strikethrough,
  Trash,
  X,
  XCircle,
} from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { Label } from '@/components/ui/label'
import { useMessages } from '@/stores/useMessages'
import MessageTextArea from '@/components/CustomTextArea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  QuestionOptions,
  CreateQuestionProps,
  QuestionMessageProps,
  EditQuestionProps,
  QuestionMessageType,
  CreateMessageRequest,
  Message,
  ButtonsMessageProps,
  ButtonsMessageType,
  SectionMessageType,
} from '@/types'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ListButtonsMessageFormProps {
  chatId: string
  initialQuestion?: string
  initialButtons?: string[]
  initialHasDynamicDelay?: boolean
  initialSeconds?: string
  initialMinutes?: string
  onSave: (
    question: string,
    buttons: string[],
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

function ListButtonsMessageForm({
  chatId,
  initialQuestion = '',
  initialButtons = [''],
  initialHasDynamicDelay = true,
  initialSeconds = '3',
  initialMinutes = '0',
  onSave,
  onCancel,
  onDelete,
}: ListButtonsMessageFormProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [buttons, setButtons] = useState(initialButtons)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { messages } = useMessages()
  const [hasDynamicDelay, setHasDynamicDelay] = useState(initialHasDynamicDelay)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [minutes, setMinutes] = useState(initialMinutes)

  const convertToMiliseconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum * 1000
  }

  const convertToSeconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum
  }

  const handleChangeDynamicDelay = () => {
    setHasDynamicDelay(!hasDynamicDelay)
  }
  
  const handleAddButton = () => {
    setButtons([...buttons, ''])
  }

  const handleButtonChange = (index: number, value: string) => {
    const newButtons = [...buttons]
    newButtons[index] = value
    setButtons(newButtons)
  }

  const handleSave = async () => {
    if (question.trim() === '') {
      toast.warn('Digite o texto da pergunta')
      return
    }

    const filteredButtons = buttons.filter((button) => button.trim())

    if (filteredButtons.length === 0) {
      toast.warn('Adicione pelo menos um botão')
      return
    }

    await onSave(
      question.trim(),
      filteredButtons,
      hasDynamicDelay,
      convertToMiliseconds(+minutes, +seconds)
    )
    setQuestion('')
    setButtons([''])
  }

  const handleDeleteButton = (index: number) => {
    const newButtons = [...buttons]
    newButtons.splice(index, 1)
    setButtons(newButtons) // Atualiza apenas o estado local
  }

  return (
    <div className='m-4 h-fit w-full rounded-lg border border-dashed border-[#0C88EE] bg-[#C0DDFF6B] p-4'>
      <MessageTextArea
        placeholder='Digite o texto da pergunta'
        text={question}
        setText={setQuestion}
        hasDynamicDelay={hasDynamicDelay}
        setHasDynamicDelay={setHasDynamicDelay}
        minutes={minutes}
        setMinutes={setMinutes}
        seconds={seconds}
        setSeconds={setSeconds}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        variables={messages[chatId]
          ?.filter((msg) => msg.type === 'question')
          .map((msg) => ({ id: msg.id, text: msg.content.options.variable }))}
      />
      <div className='flex max-w-[390px] text-zinc-800 flex-col gap-3 pt-4'>
        {buttons.map((button, index) => (
          <div key={index} className='relative rounded-md bg-white p-3'>
            <div className='mb-2 text-sm'>Título do botão {index + 1}</div>
            <Input
              value={button}
              onChange={(e) => handleButtonChange(index, e.target.value)}
              placeholder='Digite o título do botão'
              className='mt-1'
            />
            <button
              onClick={() => {
                handleDeleteButton(index)
              }}
            >
              <Trash
                size={18}
                className='absolute right-2 top-3 text-zinc-600 transition-colors hover:text-zinc-800'
              />
            </button>
          </div>
        ))}
        <Button
          variant='ghost'
          className='w-full bg-white text-[#0C88EE]'
          onClick={handleAddButton}
        >
          + Novo botão
        </Button>
      </div>
      <div className='mt-4 flex w-full max-w-[390px] items-center justify-between'>
        <div className='flex gap-2'>
          {/*<Button
            className='rounded-full'
            variant='outline'
            size='icon'
            onClick={() => {}}
          >
            <Move className='h-4 w-4' />
          </Button>*/}
          {onDelete && (
            <Button
              className='rounded-full'
              variant='outline'
              size='icon'
              onClick={onDelete}
            >
              <Trash className='h-4 w-4' />
            </Button>
          )}
        </div>
        <div className='flex gap-2 items-center w-full justify-between ml-1'>
          <div >
          <DropdownMenu>
                <DropdownMenuTrigger
                  className='text-[#0C88EE] text-opacity-100 bg-white p-1 rounded-[60px]'
                  asChild
                >
                     <div className='flex max-w-[390px] items-center justify-end'>
                    <button className='my-0 flex items-center gap-2 p-[2px] sm:px-1 text-sm'>
                      <Clock size={15} />
                      {hasDynamicDelay ? (
                        <span className='sr-only sm:not-sr-only'>
                          Digitação dinâmica
                        </span>
                      ) : (
                        <div>
                          {convertToSeconds(+minutes, +seconds)}s
                          {' '}
                          <span className='sr-only sm:not-sr-only'>
                            Digitando
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side='bottom'
                  align='start'
                  className='mr-6 mt-1 w-[274px] sm:mr-0'
                >
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <div className='flex w-full flex-col items-center justify-between gap-2'>
                        <div className='flex w-full items-center justify-between'>
                          <span className='text-sm'>Definir tempo dinamicamente</span>
                          <Switch
                            checked={hasDynamicDelay}
                            onClick={handleChangeDynamicDelay}
                          />
                        </div>
                        {hasDynamicDelay && (
                          <p className='flex self-start text-sm text-gray-500'>
                          Define o tempo de digitação automaticamente com base no tamanho da mensagem.
                          </p>
                        )}
                      </div>
                    </DropdownMenuItem>
                    {!hasDynamicDelay && (
                      <>
                        <DropdownMenuLabel className='font-normal text-zinc-800'>
                          Simular digitação por:
                        </DropdownMenuLabel>
                        <div
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                          className='relative flex items-center justify-between gap-2 p-1'
                        >
                          <div className='flex flex-col items-start'>
                            <span className='text-sm'>Minutos</span>
                            <Input
                              type='number'
                              value={String(minutes)}
                              onChange={(e) => setMinutes(e.target.value)}
                              className='w-28 text-center'
                            />
                          </div>
                          <span className='absolute right-[93px] top-[34px]'>
                            :
                          </span>
                          <div className='flex flex-col items-start'>
                            <span className='text-sm'>Segundos</span>
                            <Input
                              type='number'
                              value={String(seconds)}
                              onChange={(e) => setSeconds(e.target.value)}
                              className='w-28 text-center'
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
          
          <div className='flex gap-2 self-endssss'>
          <Button
            className='bg-[#E7F4FF] text-[#0C88EE]'
            variant='outline'
            size='default'
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            className='bg-[#0C88EE] text-white'
            variant='outline'
            size='default'
            onClick={handleSave}
          >
            Salvar
          </Button>
          </div>
         
        </div>
      </div>
    </div>
  )
}

export function CreateListButtonsMessage({ chatId }: CreateQuestionProps) {
  const { createMessage, getMessages, stopCreatingMessage } = useMessages()

  const handleSave = async (
    question: string,
    buttons: string[],
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      chatId,
      type: 'buttons',
      content: { text: question, buttons, hasDynamicDelay, delayValue },
    } as CreateMessageRequest

    try {
      await createMessage(messageData)
      await getMessages(chatId)
    } catch (error) {
      console.error('❌ -> Erro ao enviar mensagem:', error)
    }
  }

  return (
    <ListButtonsMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

interface ButtonsMessageContent {
  text: string
  buttons: string[]
}

interface EditListButtonsMessageProps {
  text: string
  buttons: string[]
  oldHasDynamicDelay: boolean
  oldSeconds: string
  oldMinutes: string
  chatId: string
  id: string
  onEditCancel: () => void
}

export function EditListButtonsMessage({
  text,
  buttons,
  chatId,
  id,
  oldHasDynamicDelay,
  oldSeconds,
  oldMinutes,
  onEditCancel,
}: EditListButtonsMessageProps) {
  const { editMessage, getMessages, deleteMessage } = useMessages()

  const handleDelete = async () => {
    await deleteMessage(chatId, id)
  }

  const handleSave = async (
    question: string,
    buttons: string[],
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      id,
      chatId,
      type: 'buttons',
      content: { text: question, buttons, hasDynamicDelay, delayValue },
    } as ButtonsMessageType

    try {
      await editMessage(id, messageData)
      await getMessages(chatId)
      onEditCancel()
    } catch (error) {
      console.error('❌ -> Erro ao editar mensagem:', error)
    }
  }

  return (
    <ListButtonsMessageForm
      chatId={chatId}
      initialQuestion={text}
      initialButtons={buttons}
      initialHasDynamicDelay={oldHasDynamicDelay}
      initialMinutes={oldMinutes}
      initialSeconds={oldSeconds}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

export function ListButtonsMessage({ id, chatId, canEdit, onButtonClick }) {
  const [isEditing, setIsEditing] = useState(false)
  const { getMessages, messages, checkIfMessageIsHidden, checkIfMessageIsInsideSection } = useMessages()
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const message = messages[chatId].find(
    (message) => message.id === id
  ) as ButtonsMessageType

  function formatTime(isoDate) {
    const date = new Date(isoDate)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const formattedMinutes = minutes.toString().padStart(2, '0')
    return `${hours}:${formattedMinutes} ${period}`
  }

  const formatedDate = formatTime(new Date())

  function convertMillisecondsToMinutesAndSeconds(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000) // Converte para segundos
    const minutes = Math.floor(totalSeconds / 60) // Obtém os minutos
    const seconds = totalSeconds % 60 // Obtém os segundos restantes
    return { minutes, seconds }
  }

  const delayValueInMs = message.content.delayValue || 0
  const { minutes, seconds } =
    convertMillisecondsToMinutesAndSeconds(delayValueInMs)

  return (
    ((!checkIfMessageIsHidden(chatId, id) && canEdit) || !canEdit) && (
      <div className={`${checkIfMessageIsInsideSection(chatId, id) && canEdit ? 'border-[#0C88EE] border-l-[1px] my-[-10px] py-[5px] opacity-80' : ''}`}>
      <DragAndDropProvider
        droppableId={message.id}
        draggableId={message.id}
        index={messages[chatId].findIndex((message) => message.id === id)}
        isDragDisabled={isEditing}
      >
        <div>
          {isEditing ? (
            <div className='flex w-full flex-col pr-8'>
              <EditListButtonsMessage
                text={message?.content?.text}
                buttons={message?.content?.buttons}
                oldHasDynamicDelay={message.content.hasDynamicDelay ?? false}
                oldMinutes={minutes.toString()} // Passa os minutos calculados
                oldSeconds={seconds.toString()} // Passa os segundos calculados
                chatId={chatId}
                id={id}
                onEditCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div
              onClick={() => canEdit && setIsEditing(true)}
              className={`${canEdit ? 'transition-color m-2 flex flex-col rounded-lg border border-dashed border-transparent px-3 transition-all duration-300 hover:cursor-pointer hover:border-[1px] hover:border-[#0C88EE] hover:bg-[#C0DDFF6B] hover:drop-shadow-xl' : 'mx-3 p-1'}`}
            >
              <div className='flex w-fit flex-col gap-2'>
                <div className='relative flex w-fit max-w-[390px] cursor-pointer justify-start gap-3 rounded-lg bg-white p-[10px] px-3 text-black shadow-sm hover:drop-shadow-md'>
                  <Image
                    className='rotate- absolute -left-2 top-0'
                    src={'/Polygon.svg'}
                    width={15}
                    height={4}
                    alt='polygon'
                  />
                  <h1>{message?.content?.text}</h1>
                  <span className='self-end text-xs text-zinc-500'>
                    {formatedDate}
                  </span>
                </div>
                {message?.content?.buttons.map((button, index) => (
                  <div
                    key={index}
                    className='w-full rounded-md bg-white p-3 text-center font-medium text-[#0C88EE] hover:cursor-pointer hover:bg-white/80'
                    onClick={() => onButtonClick(button)}
                  >
                    <div className='text-sm'>{button}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <ToastContainer />
      </DragAndDropProvider></div>
    )
  )
}
