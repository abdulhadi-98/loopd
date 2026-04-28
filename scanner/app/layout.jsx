import './globals.css';

export const metadata = { title: 'Loyalr Scanner', description: 'Staff QR scanner' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  );
}
