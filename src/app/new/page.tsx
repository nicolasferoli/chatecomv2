'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@radix-ui/react-dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, Circle, Loader, Loader2, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Headers/Header'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import LoadingScreen from '@/containers/LoadingScreen'
import { CreateProductButton } from '@/components/CreateProductButton'
import { toast } from 'react-toastify'

const types = [
  {
    value: 'sell',
    title: 'Vender',
    description: '',
    icon: '💰',
  },
]

const automationTemplates = [
  {
    value: 'jeff_ecom',
    title: 'Jeff ECOM - Venda Direta',
    description:
      'Template otimizado para estratégias de vendas direta seguindo uma persuasão de 9 etapas.',
    image: `url('/flows/preview-flow-jeff.png')`,
    type: 'sell',
  },
]

export default function New() {
  const [selectedValueSelect1, setSelectedValueSelect1] = useState('whatsapp')
  const [selectedValueSelect2, setSelectedValueSelect2] = useState('whatsapp')
  const [data, setData] = useState<any>({
    theme: 'whatsapp',
    name: '',
    prompt: {
      product_info: '',
      audience_info: '',
    },
    template: '',
    bot_name: 'Chatbot',
    bot_picture: '',
    type: '',
    status: 'online',
    verified: true,
    // hasNotifySound: false,
  })
  const [importProductGenius, setImportProductGenius] = useState(false)
  const [importWebUrl, setImportWebUrl] = useState(false)
  const [useAi, setUseAi] = useState(false)
  const [useAiParam, setUseAiParam] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [geniusProduct, setGeniusProduct] = useState<any>(null)
  const { user } = useKindeAuth()
  const descriptions = [
    {
      emoji: '📝',
      description: 'Escrevendo copy...',
    },
    {
      emoji: '💬',
      description: 'Criando mensagens...',
    },
    {
      emoji: '⏳',
      description: 'Configurando delays...',
    },
    {
      emoji: '🎙️',
      description: 'Gravando áudios...',
    },
    {
      emoji: '😎',
      description: 'Seu chatbot está quase pronto...',
    },
  ]
  const [currentEmoji, setCurrentEmoji] = useState(descriptions[0].emoji)
  const [currentDescription, setCurrentDescription] = useState(
    descriptions[0].description
  )

  useEffect(() => {
    if (geniusProduct) {
      setData((prevData) => ({
        ...prevData,
        prompt: {
          ...prevData.prompt,
          product_info: geniusProduct.description,
        },
      }))
    }
  }, [geniusProduct])

  useEffect(() => {
    if (!user?.email) return

    const fetchProducts = async () => {
      const response = await fetch('/api/genius', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      })
      const data = await response.json()
      setProducts(
        data?.results?.map((product) => ({
          name: product.nomeProduto,
          description: product.infoProduto,
        }))
      )
    }
    fetchProducts()
  }, [user?.email])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUseAiParam(params.get('useAi'))
  }, [])
  useEffect(() => {
    if (useAiParam === 'true') {
      setUseAi(true)
    }
  }, [useAiParam])

  const togleImportWeb = () => {
    setImportWebUrl(!importWebUrl)
    if (importProductGenius === true) {
      setImportProductGenius(false)
    }
  }
  const togleImportGenius = () => {
    setImportProductGenius(!importProductGenius)
    if (importWebUrl === true) {
      setImportWebUrl(false)
    }
  }

  const handleChangeSelect1 = (value) => {
    setSelectedValueSelect1(value)
    setData((prevData) => ({
      ...prevData,
      theme: value,
    }))
  }

  const handleGeniusProduct = (value: string) => {
    setGeniusProduct(products.find((product: any) => product.name === value))
  }

  const [currentStep, setCurrentStep] = useState(1)
  const goToStep = (step) => {
    setCurrentStep(step)
  }

  const handleCreateChat = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(500000),
      })
      if (!response.ok) {
        throw new Error('Erro ao criar chat')
      }

      const result = await response.json()
      window.location.href = `/builder/${result.id}`
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleCreateChatWithAi = async () => {
    try {
      setAiLoading(true)
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          NAME: data.name,
          TEMPLATE: data.template,
          URL: data.url || undefined,
          TEXTO: data.prompt.product_info || undefined,
          ID: data.id,
          user_id: user?.id,
        }),
      })
      if (!response.ok) {
        toast.error('Erro ao criar chat com IA')
        window.location.href = `/new?useAi=true`
        throw new Error('Erro ao criar chat')
      }

      const result = await response.json()
      window.location.href = `/builder/${result.id}`
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!useAi && currentStep === 1) {
      return handleCreateChat()
    }

    if (currentStep === 3) {
      handleCreateChatWithAi()
    } else {
      goToStep(currentStep + 1)
    }
  }

  useEffect(() => {
    if (!aiLoading) return
    const interval = setInterval(() => {
      setCurrentDescription((prevDescription: any) => {
        const currentIndex = descriptions.findIndex(
          (desc) => desc.description === prevDescription
        )
        const nextIndex = (currentIndex + 1) % descriptions.length
        return descriptions[nextIndex].description
      })
      setCurrentEmoji((prevEmoji: any) => {
        const currentIndex = descriptions.findIndex(
          (desc) => desc.emoji === prevEmoji
        )
        const nextIndex = (currentIndex + 1) % descriptions.length
        return descriptions[nextIndex].emoji
      })
    }, 12000)

    return () => {
      clearInterval(interval)
    }
  }, [descriptions, aiLoading])

  if (aiLoading) {
    return (
      <>
        <Header />
        <LoadingScreen
          emoji={currentEmoji}
          text={currentDescription}
          description={'Isso pode levar alguns minutos'}
          totalSeconds={60}
        />
      </>
    )
  }

  return (
    <>
      <Header />
      <Card className='relative mx-auto mt-[50px] flex w-full max-w-[890px] flex-col gap-6 p-[20px]'>
        <Button
          variant={'outline'}
          className='absolute right-6 top-6 h-[40px] w-[40px] rounded-full'
          onClick={() => {
            window.location.href = '/'
          }}
        >
          <XIcon />
        </Button>
        {currentStep === 1 && (
          <div>
            <CardHeader>
              <CardTitle>Nova conversa</CardTitle>
              <CardDescription className='py-2 text-sm'>
                Etapa {currentStep} de {useAiParam === 'true' ? '3' : '1'}
              </CardDescription>
              <hr></hr>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className='flex flex-col'>
                  <CardTitle className='pb-2 pt-4 text-left text-[18px] font-bold'>
                    Que template deseja utilizar?
                  </CardTitle>

                  <div>
                    <Select
                      value={selectedValueSelect1}
                      onValueChange={handleChangeSelect1}
                    >
                      <SelectTrigger className='border-grayBlueDark flex h-10 w-full rounded-md border p-2 px-2'>
                        <SelectValue placeholder='Selecione um domínio' />
                      </SelectTrigger>
                      <SelectContent className='my-1 flex cursor-pointer flex-col gap-4 rounded-md border bg-white p-2 shadow-md'>
                        <SelectGroup className='flex flex-col gap-4'>
                          <SelectItem
                            onClick={() => handleChangeSelect1('whatsapp')}
                            className='outline-none'
                            value='whatsapp'
                          >
                            <div className='flex gap-2'>
                              <Image
                                src={'/icons/whatsapp-icon.svg'}
                                width={15}
                                height={15}
                                alt='Logo'
                              />
                              <span>WhatsApp</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            className='outline-none'
                            value='facebook'
                            disabled
                          >
                            <div className='flex gap-2'>
                              <Image
                                src={'/icons/facebook-icon.svg'}
                                width={15}
                                height={15}
                                alt='Logo'
                              />
                              <span>Facebook (Em breve)</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            className='outline-none'
                            value='instagram'
                            disabled
                          >
                            <div className='flex gap-2'>
                              <Image
                                src={'/icons/instagram-icon.svg'}
                                width={15}
                                height={15}
                                alt='Logo'
                              />
                              <span>Instagram (Em breve)</span>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <CardTitle className='pb-4 pt-6 text-left text-[18px] font-bold'>
                    Como deseja chamar seu chatbot?
                  </CardTitle>

                  <Input
                    className='flex h-[50px] placeholder:text-sm'
                    id='automationName'
                    name='automationName'
                    type='text'
                    placeholder='Escreva o nome da sua conversa'
                    required
                    onChange={(e) =>
                      setData((prevData) => ({
                        ...prevData,
                        name: e.target.value,
                      }))
                    }
                  />
                  {/*useAi && (
                    <>
                      <div className='mb-4'>
                        <CardTitle className='pb-2 pt-6 text-left text-[18px] font-bold'>
                          Qual o objetivo da sua conversa?
                        </CardTitle>
                        <CardDescription>
                          Defina o propósito da conversa, escolhendo metas
                          claras como conversão, engajamento ou suporte
                          personalizado.
                        </CardDescription>
                      </div>

                      <div className='grid grid-cols-1 gap-4 md:grid-cols-1'>
                        {types.map((automationItem, index) => (
                          <Card
                            key={index}
                            onClick={() => {
                              setData((prevData) => ({
                                ...prevData,
                                type: automationItem.value,
                              }))
                            }}
                            className={`inline-flex w-[365px] min-w-full max-w-full items-center justify-start gap-2 rounded-[8px] border bg-white p-4 ${
                              data?.type === automationItem.value
                                ? 'border-[#15803D] bg-slate-50'
                                : ''
                            }`}
                          >
                            <CardContent className='flex w-full items-center justify-between gap-2 space-x-2 p-2 py-0 pl-4'>
                              <div className='flex-grow'>
                                <Label className='flex w-full cursor-pointer items-center gap-3 text-left text-[16px] font-medium'>
                                  <div className='text-[28px]'>
                                    {automationItem.icon}
                                  </div>
                                  {automationItem.title}
                                </Label>
                                <p className='mt-2 text-[14px] opacity-80'>
                                  {automationItem.description}
                                </p>
                              </div>
                              <Circle
                                size={'15px'}
                                className='min-h-[16px] min-w-[16px] rounded-full'
                                id={`automation-${index}`}
                                style={{
                                  color:
                                    data?.type === automationItem.value
                                      ? 'transparent'
                                      : 'black',
                                  fill:
                                    data?.type === automationItem.value
                                      ? '#16A34A'
                                      : 'transparent',
                                  border:
                                    data?.type === automationItem.value
                                      ? '1px solid white'
                                      : 'none',
                                  boxShadow:
                                    data?.type === automationItem.value
                                      ? '0 0 0 2px black'
                                      : 'none',
                                }}
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}*/}
                  <div className='mt-6 flex justify-end'>
                    {useAi ? (
                      <Button
                        type='submit'
                        className='mt-2 self-end bg-[#0C88EE]'
                      >
                        Próximo
                      </Button>
                    ) : (
                      <Button
                        type='submit'
                        className='mt-2 self-end bg-[#0C88EE]'
                      >
                        Criar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <CardHeader>
              <CardTitle>Nova conversa</CardTitle>
              <CardDescription>Etapa {currentStep} de 3</CardDescription>
              <hr></hr>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <Card className='m-auto mb-6 flex h-fit min-h-[80px] max-w-[800px] flex-col justify-center p-6'>
                <div className='flex flex-col gap-6'>
                  <div className='flex w-full items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='mr-2 text-[28px]'>🧞‍♂️</div>
                      <span>Importar produto da Genius ECOM</span>
                    </div>
                    <Switch
                      checked={importProductGenius}
                      onCheckedChange={togleImportGenius}
                    />
                  </div>
                  {importProductGenius && (
                    <div>
                      <Select onValueChange={handleGeniusProduct}>
                        <SelectTrigger className='border-grayBlueDark flex h-10 w-full rounded-md border p-2 px-2'>
                          <SelectValue placeholder='Selecione um produto do Genius' />
                        </SelectTrigger>
                        <SelectContent className='my-1 flex cursor-pointer flex-col gap-4 rounded-md border bg-white p-2 shadow-md'>
                          <SelectGroup className='flex flex-col gap-4'>
                            {products.map((product: any) => (
                              <SelectItem
                                key={product?.name}
                                value={product?.name}
                              >
                                {product?.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>
              <Card className='m-auto flex h-fit min-h-[80px] max-w-[800px] flex-col justify-center p-6'>
                <div className='flex flex-col gap-6'>
                  <div className='flex w-full items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='mr-2 text-[28px]'>🌐️</div>
                      <span>Importar dados do Website</span>
                    </div>
                    <Switch
                      checked={importWebUrl}
                      onCheckedChange={togleImportWeb}
                    />
                  </div>
                  {importWebUrl && (
                    <div>
                      <Input
                        className='flex h-[50px] placeholder:text-sm'
                        id='automationName'
                        name='automationName'
                        type='text'
                        placeholder='URL do site'
                        required
                        onChange={(e) =>
                          setData((prevData) => ({
                            ...prevData,
                            url: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </Card>

              {!importProductGenius && !importWebUrl && (
                <div className='flex max-w-[890px] flex-col gap-4'>
                  <div className='m-auto flex h-fit min-h-[80px] w-full flex-col justify-center gap-3 p-6'>
                    <div className='flex items-center justify-between'>
                      <span>Descreva o seu produto</span>
                      <CreateProductButton
                        setProductDescription={(e) =>
                          setData({
                            ...data,
                            prompt: {
                              ...data.prompt,
                              product_info: e,
                            },
                          })
                        }
                      />
                    </div>
                    <Textarea
                      className={`flex h-[80px] min-h-[80px] resize-none placeholder:text-sm ${data.prompt.product_info.length > 100 && 'min-h-[200px] resize-y'}`}
                      id='productInfo'
                      name='productInfo'
                      placeholder='Fale sobre o produto, qual o objetivo, principais características, pontos fortes, pontos fracos e etc.'
                      required
                      value={data.prompt.product_info}
                      onChange={(e) =>
                        setData({
                          ...data,
                          prompt: {
                            ...data.prompt,
                            product_info: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
              <div className='m-auto my-6 flex max-w-[800px] items-end justify-end gap-2 self-end'>
                <Button
                  type='button'
                  onClick={() => {
                    goToStep(currentStep - 1)
                  }}
                  className='mt-2 self-end border border-[#D0D5DD] bg-white text-[#344054]'
                >
                  Voltar
                </Button>
                <Button type='submit' className='mt-2 self-end bg-[#0C88EE]'>
                  Próximo
                </Button>
              </div>
            </form>
          </div>
        )}
        {currentStep === 3 && (
          <div>
            <CardHeader>
              <CardTitle>Nova conversa</CardTitle>
              <CardDescription>Etapa {currentStep} de 3</CardDescription>
              <hr></hr>
            </CardHeader>

            <form onSubmit={handleSubmit} className=''>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {automationTemplates.map((automationItem, index) => (
                    <Card
                      key={index}
                      onClick={() => {
                        setData((prevData) => ({
                          ...prevData,
                          template: automationItem.value,
                        }))
                      }}
                      className={`inline-flex min-h-[86px] w-[365px] min-w-full max-w-full items-center justify-start gap-2 rounded-[8px] border bg-white p-0 ${
                        data.template === automationItem.value
                          ? 'border-[#15803D] bg-[#F2F4F7]'
                          : 'bg-[#F2F4F7]'
                      }`}
                    >
                      <CardContent className='flex w-full flex-col items-center justify-between gap-2 space-x-2 !p-0'>
                        <div
                          className='h-[180px] w-full'
                          style={{
                            backgroundImage: automationItem.image,
                            backgroundSize: 'cover',
                          }}
                        ></div>
                        <div className='mt-4 flex w-full items-center justify-between gap-2 space-x-2 px-8 pb-8'>
                          <div className='flex-grow'>
                            <Label className='w-full cursor-pointer text-left text-[16px] font-medium'>
                              {automationItem.title}
                            </Label>
                            <p className='mt-2 text-[14px] opacity-80'>
                              {automationItem.description}
                            </p>
                          </div>
                          <Circle
                            size={'15px'}
                            className='min-h-[16px] min-w-[16px] rounded-full'
                            id={`automation-${index}`}
                            style={{
                              color:
                                data.template === automationItem.value
                                  ? 'transparent'
                                  : 'black',
                              fill:
                                data.template === automationItem.value
                                  ? '#16A34A'
                                  : 'transparent',
                              border:
                                data.template === automationItem.value
                                  ? '1px solid white'
                                  : 'none',
                              boxShadow:
                                data.template === automationItem.value
                                  ? '0 0 0 2px black'
                                  : 'none',
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className='ml-auto flex max-w-[300px] justify-between'>
                <Button
                  type='button'
                  variant={'link'}
                  onClick={() => {
                    goToStep(currentStep - 1)
                  }}
                  className='mr-2 w-full'
                >
                  Voltar
                </Button>
                <Button
                  type='submit'
                  className='w-full bg-[#16A34A] hover:bg-[#16A34A]/80'
                >
                  Finalizar
                </Button>
              </CardFooter>
            </form>
          </div>
        )}
      </Card>
    </>
  )
}
