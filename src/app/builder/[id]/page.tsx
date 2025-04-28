import AuthProtection from '@/components/AuthProtection'
import BuilderHeader from '@/components/Headers/BuilderHeader'
import Header from '@/components/Headers/Header'
import BuilderScreen from '@/containers/BuilderScreen'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat Builder',
  description: 'Construa seu chat interativo',
}

export default async function BuilderPage({ params }) {
  const id = await params.id
  
  return (
    <div className='z-0'>
      <AuthProtection>
        <Header />
        <BuilderHeader chatId={id} activeSection='builder' />
        <BuilderScreen chatId={id} />
      </AuthProtection>
    </div>
  )
}

// Validação opcional do ID na rota
export async function generateStaticParams() {
  return []
}
