import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';


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
  themeColor: '#c9653a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=El+Messiri:wght@400;600;700&display=swap" rel="stylesheet" />
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