import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker';

const DESCRIPTION =
  "Trouve ton chez-toi autour de toi. Plateforme immobilière mobile-first ivoirienne inspirée du swipe, avec géolocalisation, calcul du coût réel d'entrée et Babi Score.";

export const metadata: Metadata = {
  title: 'BABI SWIPE IMMO',
  description: DESCRIPTION,
  manifest: '/manifest.webmanifest',
  applicationName: 'BABI SWIPE IMMO',
  appleWebApp: {
    capable: true,
    title: 'BabiSwipe',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'BABI SWIPE IMMO',
    description: DESCRIPTION,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0F1115',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Cabinet+Grotesk:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0F1115] text-white antialiased select-none font-sans overflow-x-hidden">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
