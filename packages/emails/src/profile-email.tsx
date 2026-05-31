import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface ProfileEmailProps {
  greeting: string
  intro: string
  profileTitle: string
  profileDescription: string
  tipTitle: string
  tip: string
  recommendationsTitle: string
  recommendations: { title: string; body: string }[]
  footer: string
  brand: string
  accentColor: string
  ctaLabel?: string
  ctaUrl?: string
}

const main = { backgroundColor: '#f6f6f7', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { margin: '0 auto', padding: '24px', maxWidth: '560px' }
const card = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px' }

export function ProfileEmail(props: ProfileEmailProps) {
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
            <Text style={{ fontSize: '16px', color: '#111827' }}>{props.greeting}</Text>
            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>{props.intro}</Text>

            <Heading as="h2" style={{ fontSize: '20px', color: '#111827', marginTop: '24px' }}>
              {props.profileTitle}
            </Heading>
            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>
              {props.profileDescription}
            </Text>

            <Section style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
              <Text style={{ fontSize: '13px', fontWeight: 700, color: accent, margin: '0 0 4px' }}>
                {props.tipTitle}
              </Text>
              <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{props.tip}</Text>
            </Section>

            <Heading as="h3" style={{ fontSize: '16px', color: '#111827', marginTop: '24px' }}>
              {props.recommendationsTitle}
            </Heading>
            {props.recommendations.map((r, i) => (
              <Section key={i} style={{ marginBottom: '12px' }}>
                <Text style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                  {r.title}
                </Text>
                <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{r.body}</Text>
              </Section>
            ))}

            {props.ctaLabel && props.ctaUrl ? (
              <Section style={{ marginTop: '24px' }}>
                <Link
                  href={props.ctaUrl}
                  style={{
                    backgroundColor: accent,
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  {props.ctaLabel}
                </Link>
              </Section>
            ) : null}

            <Hr style={{ borderColor: '#e5e7eb', marginTop: '28px' }} />
            <Text style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>{props.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
