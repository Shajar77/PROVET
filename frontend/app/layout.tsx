import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { GeistPixelGrid } from 'geist/font/pixel'
import './globals.css'
import { Providers } from './providers'
import { SmoothScroll } from './smooth-scroll'
import { Footer } from '@/components/footer'
import { Suspense } from 'react'
import { NavigationLoader } from '@/components/navigation-loader'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'PROVET | On-Chain Model Provenance Protocol',
  description:
    'Register AI models on-chain, attest to predictions with cryptographic signatures, and verify which model made every decision. Built on Base with EIP-712 signatures for transparent AI accountability.',
  keywords: [
    'PROVET',
    'AI model registry',
    'blockchain AI',
    'model provenance',
    'EIP-712 signatures',
    'AI attestation',
    'Base network',
    'on-chain verification',
    'AI transparency',
    'model versioning',
    'cryptographic signatures',
    'AI accountability',
  ],
  authors: [{ name: 'PROVET' }],
  creator: 'PROVET',
  publisher: 'PROVET',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'PROVET | On-Chain Model Provenance Protocol',
    description:
      'Register AI models on-chain, attest to predictions with cryptographic signatures, and verify which model made every decision. Built on Base with EIP-712 signatures.',
    siteName: 'PROVET',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROVET | On-Chain Model Provenance',
    description:
      'Register AI models on-chain and verify predictions with cryptographic signatures. Transparent AI accountability built on Base.',
    creator: '@provet_ai',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#F2F1EA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// Preconnect to critical origins
export const preconnect = [
  'https://sepolia.base.org',
  'https://mainnet.base.org',
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${GeistPixelGrid.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://sepolia.base.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mainnet.base.org" crossOrigin="anonymous" />
      </head>
      <body className="font-mono antialiased" suppressHydrationWarning>
        <SmoothScroll>
          <Providers>
            <Suspense>
              <NavigationLoader />
            </Suspense>
            {children}
            <Footer />
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  )
}
