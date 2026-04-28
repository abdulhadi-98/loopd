import './globals.css';

export const metadata = {
  title: 'Loyalr',
  description: 'Your digital loyalty card',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
