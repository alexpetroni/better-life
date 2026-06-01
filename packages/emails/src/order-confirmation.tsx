import { Body, Container, Head, Heading, Hr, Html, Section, Text } from '@react-email/components'
import * as React from 'react'

export interface OrderConfirmationProps {
  heading: string
  greeting: string
  intro: string
  orderLabel: string
  orderNumber: string | number
  itemsLabel: string
  items: { title: string; quantity: number; price: string }[]
  totalLabel: string
  total: string
  footer: string
  brand: string
  accentColor: string
}

const main = { backgroundColor: '#f6f6f7', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { margin: '0 auto', padding: '24px', maxWidth: '560px' }
const card = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px' }

export function OrderConfirmation(props: OrderConfirmationProps) {
  const accent = props.accentColor || '#4F46E5'
  return (
    <Html lang="ro">
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={{ color: accent, fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em' }}>
            {props.brand}
          </Text>
          <Section style={card}>
            <Heading as="h1" style={{ fontSize: '22px', color: '#111827' }}>
              {props.heading}
            </Heading>
            <Text style={{ fontSize: '15px', color: '#374151' }}>{props.greeting}</Text>
            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>{props.intro}</Text>

            <Text style={{ fontSize: '13px', color: '#6b7280', margin: '16px 0 4px' }}>
              {props.orderLabel}: <strong>#{props.orderNumber}</strong>
            </Text>

            <Heading as="h3" style={{ fontSize: '15px', color: '#111827', marginTop: '16px' }}>
              {props.itemsLabel}
            </Heading>
            {props.items.map((it, i) => (
              <Section key={i} style={{ display: 'block', marginBottom: '4px' }}>
                <Text style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                  {it.quantity} × {it.title} — {it.price}
                </Text>
              </Section>
            ))}

            <Hr style={{ borderColor: '#e5e7eb', marginTop: '16px' }} />
            <Text style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
              {props.totalLabel}: {props.total}
            </Text>

            <Hr style={{ borderColor: '#e5e7eb', marginTop: '20px' }} />
            <Text style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>{props.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
