import type { Metadata, Viewport } from 'next';
import { Nunito, El_Messiri } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

const elMessiri = El_Messiri({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-el-messiri',
});


export const metadata: Metadata = {
  title: 'عالنوتة - قسّم وصفي الحساب بسهولة',
  description: 'عالنوتة هو أسهل طريقة لتقسيم الحسبة مع صحابك. سجّل الطلبات، وزّع المبالغ، وصفي الحساب بوضوح ومن غير لخبطة!',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'عالنوتة',
    statusBarStyle: 'default',
    capable: true,
  },
  openGraph: {
    title: 'عالنوتة - 3al Nota',
    description: 'أسهل طريقة لتقسيم الحسبة مع صحابك. بوضوح ومن غير لخبطة!',
    type: 'website',
    locale: 'ar_EG',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e88e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${nunito.variable} ${elMessiri.variable}`}>
      <head>
      </head>
      <body>
        <div className="mobile-container">
          <main className="flex-grow">
            {children}
          </main>
          <footer className="app-footer">
            <div className="footer-content">
              <div className="footer-links">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfcOhBmcJBb7RRcFG0Q3j8PfXWMWhmvNJi1q8UjKE3WV9uIrw/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feedback-link"
                >
                  قولنا رأيك
                </a>

              </div>
              <div className="footer-branding">
                <p className="app-name">عالنوتة</p>
                <p className="credit">© Abdullah Hamada</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}