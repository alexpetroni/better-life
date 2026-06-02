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

// Generic marketing email used by all worker-driven nurture sequences (profile
// nurture, abandoned cart, post-purchase education, re-engagement). All copy is
// passed in by the caller (worker nurture-copy). Marketing mail MUST carry a
// one-click unsubscribe link (GDPR + the project's consent model) — it is a
// required prop here, never optional.
export interface NurtureEmailProps {
  brand: string
  accentColor: string
  heading: string
  greeting: string
  paragraphs: string[]
  cta?: { label: string; url: string }
  footer: string
  unsubscribeLabel: string
  unsubscribeUrl: string
}

const main = { backgroundColor: '#f6f6f7', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { margin: '0 auto', padding: '24px', maxWidth: '560px' }
const card = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px' }

export function NurtureEmail(props: NurtureEmailProps) {
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
            <Heading as="h1" style={{ fontSize: '20px', color: '#111827', marginTop: 0 }}>
              {props.heading}
            </Heading>
            <Text style={{ fontSize: '16px', color: '#111827' }}>{props.greeting}</Text>
            {props.paragraphs.map((p, i) => (
              <Text key={i} style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>
                {p}
              </Text>
            ))}

            {props.cta ? (
              <Section style={{ marginTop: '24px' }}>
                <Link
                  href={props.cta.url}
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
                  {props.cta.label}
                </Link>
              </Section>
            ) : null}

            <Hr style={{ borderColor: '#e5e7eb', marginTop: '28px' }} />
            <Text style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>{props.footer}</Text>
            <Text style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>
              <Link href={props.unsubscribeUrl} style={{ color: '#9ca3af', textDecoration: 'underline' }}>
                {props.unsubscribeLabel}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
