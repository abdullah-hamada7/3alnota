import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'عالنوتة - قسّم وصفي الحساب بسهولة',
  description: 'عالنوتة هو أسهل طريقة لتقسيم الحسبة مع صحابك. سجّل الطلبات، وزّع المبالغ، وصفي الحساب بوضوح ومن غير لخبطة!',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  openGraph: {
    title: 'عالنوتة - 3al Nota',
    description: 'أسهل طريقة لتقسيم الحسبة مع صحابك. بوضوح ومن غير لخبطة!',
    type: 'website',
    locale: 'ar_EG',
  },
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
          {children}
          <footer className="app-footer">
            <p>عالنوتة</p>
            <p className="credit">Created by Abdullah Hamada</p>
          </footer>
        </div>
      </body>
    </html>
  );
}