'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TimePickerDemo } from '@/components/ui/time-picker'
import { uploadMedia } from '@/utils/upload'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import {
  Clock,
  ImageIcon,
  Mic,
  Move,
  Pencil,
  Trash,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CardProps {
  title?: string
  content: any
  onEdit?: () => void
  onDelete?: () => void
  index: number
  setItemContent: any
  activeComponent?: any
}

/**
 * Componente CardComponent.
 *
 * @param {Object} props - Propriedades do componente.
 * @returns {JSX.Element} - Elemento JSX que representa um card.
 */
const CardComponent = ({
  title,
  icon: Icon,
  content,
  onDelete,
  index,
  isUpload,
  activeComponent,
  handleUploadClick,
  active: isActive,
}: {
  title: string
  icon: any
  content: { text: string; url: string; filename: string }
  onDelete?: () => void
  isUpload?: boolean
  index: number
  activeComponent?: any
  handleUploadClick?: () => void
  active?: boolean
  setItemContent?: any
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(isActive != undefined ? isActive : content ? true : false)
  }, [isActive, content])

  return (
    <div ref={ref} className='w-[390px] max-w-md rounded-lg border-none'>
      {active ? (
        <>{activeComponent}</>
      ) : (
        <div
          onClick={() =>
            isUpload && handleUploadClick
              ? handleUploadClick()
              : setActive(true)
          }
          className='flex h-[124px] w-[390px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-400 bg-slate-100'
        >
          <Icon className='h-6 w-6 text-slate-700' />
          <span className='text-sm text-slate-700'>
            {content?.text || `Adicionar ${title.toLowerCase()}`}
          </span>
        </div>
      )}
    </div>
  )
}

export function ImageCard(props: CardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(props.content.url ? true : false)
  const handleUploadClick = () => {
    fileInputRef && fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const uploadResult = await uploadMedia(file)
      if (uploadResult?.url) {
        props.setItemContent({ url: uploadResult.url })
      }
      setActive(true)
    }
  }

  const activeComponent = (
    <div
      className='relative flex h-[220px] w-full flex-col items-center overflow-hidden rounded-md border-[1px] bg-slate-100'
      style={{
        backgroundImage: `url(${props.content?.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='absolute bottom-4 right-4 flex flex-col gap-2'>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant={'outline'}
          className='h-10 w-10 rounded-full bg-white'
        >
          <Pencil className='h-4 w-4 text-gray-500' />
        </Button>
        <Button
          onClick={() => {
            props.setItemContent({ url: null })
            setActive(false)
          }}
          variant={'outline'}
          className='h-10 w-10 rounded-full bg-white'
        >
          <Trash2 className='h-4 w-4 text-gray-500' />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <input
        type='file'
        accept='image/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <CardComponent
        title='Imagem'
        icon={ImageIcon}
        isUpload={true}
        activeComponent={activeComponent}
        active={active}
        handleUploadClick={handleUploadClick}
        {...props}
      />
    </>
  )
}

/**
 * Componente AudioCard.
 *
 * @param {CardProps} props - Propriedades do componente.
 * @returns {JSX.Element} - Elemento JSX que representa um card de áudio.
 */
export function AudioCard(props: CardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(props.content.url ? true : false)
  const handleUploadClick = () => {
    fileInputRef && fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const uploadResult = await uploadMedia(file)
      if (uploadResult?.url) {
        props.setItemContent({
          url: uploadResult.url,
          filename: uploadResult.filename,
        })
      }
      setActive(true)
    }
  }

  const activeComponent = (
    <>
      <div className='relative flex h-[220px] w-full flex-col items-center overflow-hidden rounded-md border-[1px] bg-slate-100'>
        <Mic className='mb-1 h-6 w-6 text-slate-700' />
        <span className='mb-2 text-sm text-slate-700'>
          {props.content?.filename}
        </span>

        <audio controls className='w-full'>
          <source src={props.content?.url} type='audio/mpeg' />
          Seu navegador não suporta a tag de áudio.
        </audio>
      </div>
      <div className='flex w-[390px] items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Input
            type='checkbox'
            id='simulateRecording'
            checked={props.content?.simulateRecording || false}
            onChange={() =>
              props.setItemContent({
                ...props.content,
                simulateRecording: !props.content?.simulateRecording,
              })
            }
          />
          <p className='text-sm font-medium'>Simular gravando</p>
        </div>
        {props.content?.simulateRecording && (
          <DropdownMenu>
            <DropdownMenuTrigger className='flex items-center gap-2 text-sm font-medium text-[#027A48]'>
              {props.content.recordingTime
                ? `${new Date(props.content.recordingTime).getHours() > 0 ? new Date(props.content.recordingTime).getHours() + 'h' : ''}${new Date(props.content.recordingTime).getMinutes() > 0 ? new Date(props.content.recordingTime).getMinutes() + 'm' : ''}${new Date(props.content.recordingTime).getSeconds()}s`
                : '3s'}{' '}
              de atraso <Clock className='h-4 w-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent className='rounded-xl p-5 text-center'>
              <p className='mb-4 text-sm'>Defina o tempo de atraso</p>
              <TimePickerDemo
                date={
                  props.content?.recordingTime
                    ? new Date(props.content.recordingTime)
                    : new Date(0, 0, 0, 0, 0, 3)
                }
                setDate={(date) =>
                  props.setItemContent({
                    ...props.content,
                    recordingTime: date?.getTime(),
                  })
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  )

  return (
    <div>
      <input
        type='file'
        accept='audio/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <CardComponent
        title='Áudio'
        icon={Mic}
        isUpload={true}
        activeComponent={activeComponent}
        active={active}
        handleUploadClick={handleUploadClick}
        {...props}
      />
    </div>
  )
}
