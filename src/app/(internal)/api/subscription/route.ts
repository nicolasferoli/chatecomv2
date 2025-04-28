import { NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

if (!process.env.STRIPE_MONTHLY_PRICE_ID) {
  throw new Error('STRIPE_MONTHLY_PRICE_ID is not set')
}

if (!process.env.KINDE_SITE_URL) {
  throw new Error('KINDE_SITE_URL is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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

    const { email, id: kinde_id, family_name, given_name } = user
    console.log(`🟢 User ID: `, given_name, family_name)

    const isDefaultPlanMonthly = family_name?.toLowerCase() === 'monthly'
    const isDefaultPlanYearly = family_name?.toLowerCase() === 'yearly'

    if (!email) {
      return NextResponse.json(
        { error: 'Email do usuário não encontrado' },
        { status: 401 }
      )
    }

    if (!kinde_id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // pesquisar se o customer já existe
    let searchedCustomer = await stripe.customers.list({
      email: email,
    })

    if (!searchedCustomer.data.length) {
      const customer = await stripe.customers.create({
        email: email,
      })

      searchedCustomer.data.push(customer)
      console.log(`🟢 Customer created: ${customer.id}`)
    }

    console.log('🟠 Searched customer', searchedCustomer)
    const customerData = searchedCustomer.data[0]

    const customerId = customerData.id
    const usePriceId = process.env.STRIPE_MONTHLY_PRICE_ID
    const trialPeriodDays = isDefaultPlanYearly
      ? 365
      : isDefaultPlanMonthly
        ? 30
        : undefined
    const baseAppUrl = `${process.env.KINDE_SITE_URL}/settings`
    console.log(`🟢 Customer ID: ${customerId}`)

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: usePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: trialPeriodDays,
      },
      success_url: `${baseAppUrl}`,
      cancel_url: `${baseAppUrl}`,
      mode: 'subscription',
    })

    console.log(checkout)

    const resPayload = {
      status: 'ok',
      checkoutUrl: checkout.url,
    }
    return NextResponse.json(resPayload)
  } catch (error) {
    console.log('❌ -> Erro ao criar chat:', error)
    return NextResponse.json({ error: 'Erro ao criar chat' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    )
  }

  console.log(`🟢 User ID: ${user.id}`)
  const { email, id: kinde_id } = user

  if (!email) {
    return NextResponse.json(
      { error: 'Email do usuário não encontrado' },
      { status: 401 }
    )
  }

  if (!kinde_id) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    )
  }

  try {
    const searchedCustomer = await stripe.customers.list({
      email: email,
    })

    if (!searchedCustomer.data.length) {
      await stripe.customers.create({
        email: email,
      })
      return NextResponse.json(
        { error: 'Customer não encontrado' },
        { status: 401 }
      )
    }

    const customerId = searchedCustomer.data[0].id

    if (type === 'portalUrl') {
      const portalUrl = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.KINDE_SITE_URL}/settings`,
      })

      return NextResponse.json({ portalUrl: portalUrl.url })
    }

    const subscription = await stripe.subscriptions.list({
      customer: customerId,
    })

    if (!subscription.data.length) {
      return NextResponse.json(
        { error: 'has_no_subscription' },
        { status: 401 }
      )
    }

    const payments = await stripe.paymentIntents.list({
      customer: customerId,
    })

    console.log(payments)

    return NextResponse.json({
      subscription: subscription.data,
      payments: payments.data,
    })
  } catch (error) {
    console.log('❌ -> Erro ao buscar subscription:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar subscription' },
      { status: 500 }
    )
  }
}
