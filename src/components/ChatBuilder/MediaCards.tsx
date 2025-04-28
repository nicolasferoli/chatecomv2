'use client'

import { Button } from '@/components/ui/button'
import { TimePickerDemo } from '@/components/ui/time-picker'
import { uploadMedia } from '@/utils/upload'
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
  Clock,
  ImageIcon,
  VideoIcon,
  Loader,
  Mic,
  Move,
  Pencil,
  Trash,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

interface CardProps {
  title?: string
  content: any
  onEdit?: () => void
  onDelete?: () => void
  index: number
  setItemContent: any
  activeComponent?: any
  isLoading?: boolean
  setHasDynamicDelay: (hasDynamicDelay: boolean) => void
  hasDynamicDelay: boolean
  minutes: any
  setMinutes: (minutes: any) => void
  seconds: any
  setSeconds: (seconds: any) => void
  isImage?: boolean
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
  isUpload,
  activeComponent,
  handleUploadClick,
  active: isActive,
  isLoading,
  setHasDynamicDelay,
  hasDynamicDelay,
  minutes,
  setMinutes,
  seconds,
  setSeconds,
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
  isLoading?: boolean
  setHasDynamicDelay: (hasDynamicDelay: boolean) => void
  minutes: any
  setMinutes: (minutes: any) => void
  seconds: any
  setSeconds: (seconds: any) => void
  hasDynamicDelay: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    setActive(isActive != undefined ? isActive : content ? true : false)
  }, [isActive, content])

  const convertToSeconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum
  }

  const handleChangeDynamicDelay = () => {
    setHasDynamicDelay(!hasDynamicDelay)
  }

  return (
    <div ref={ref} className='relative max-w-[390px] rounded-lg border-none'>
      {active ? (
        <>{activeComponent}</>
      ) : (
        <div
          onClick={() =>
            isUpload && handleUploadClick
              ? handleUploadClick()
              : setActive(true)
          }
          className='flex h-[124px] max-w-[390px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-400 bg-slate-100'
        >
          {isLoading ? (
            <Loader
              className='absolute z-50 animate-spin text-zinc-600 duration-1000'
              size={50}
            />
          ) : (
            <div className='flex flex-col items-center justify-center gap-2'>
              <Icon className='h-6 w-6 text-slate-700' />
              <span className='text-sm text-slate-700'>
                {content?.text || `Adicionar ${title.toLowerCase()}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ImageCard(props: CardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(props.content.url ? true : false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const handleUploadClick = () => {
    fileInputRef && fileInputRef.current?.click()
  }

  useEffect(() => {
    setActive(props.content.url ? true : false)
  }, [props.content])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true)
      const file = e.target.files[0]
      const filename = file.name
      try {
        const uploadResult = await uploadMedia(file)
        if (uploadResult?.url) {
          props.setItemContent({ url: uploadResult.url, name: filename })
        }
      } finally {
        setActive(true)
        setIsLoading(false)
        toast.success('Imagem enviada com sucesso!')
      }
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
      {isLoading && (
        <Loader
          className='absolute top-20 z-50 animate-spin text-white duration-1000'
          size={50}
        />
      )}
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
        isLoading={isLoading}
        isImage={true}
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
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    fileInputRef && fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true)
      const file = e.target.files[0]
      const maxSize = 1.2 * 1024 * 1024

      if (file.size > maxSize) {
        toast.warn('O arquivo excede o tamanho máximo permitido de 1.2 MB.')
        setIsLoading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      try {
        const uploadResult = await uploadMedia(file)
        if (uploadResult?.url) {
          props.setItemContent({
            url: uploadResult.url,
            filename: uploadResult.filename,
          })
        }
      } finally {
        setActive(true)
        toast.success('Áudio enviado com sucesso!')
        setIsLoading(false)
      }
    }
  }

  const activeComponent = (
    <div className='relative flex w-full flex-col items-center overflow-hidden rounded-md border-[1px] bg-slate-100 p-6'>
      {isLoading ? (
        <Loader className='animate-spin duration-1000' />
      ) : (
        <audio
          controls
          className='flex items-start self-start rounded-md border-[1px] border-slate-200'
        >
          <source src={props.content?.url} type='audio/mpeg' />
          Seu navegador não suporta a tag de áudio.
        </audio>
      )}

      <div className='absolute right-4 top-2 flex flex-col gap-2'>
        {/* Botão de Editar (Substituir Áudio) */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant={'outline'}
          className='h-10 w-10 rounded-full bg-white'
        >
          <Pencil className='h-4 w-4 text-gray-500' />
        </Button>

        {/* Botão de Excluir */}
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
    <div>
      <input
        type='file'
        accept='audio/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <CardComponent
        isImage={true}
        title='Áudio'
        icon={Mic}
        isUpload={true}
        activeComponent={activeComponent}
        active={active}
        handleUploadClick={handleUploadClick}
        isLoading={isLoading}
        {...props}
      />
    </div>
  )
}
