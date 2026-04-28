import './globals.css';

export const metadata = { title: 'Loyalr Dashboard', description: 'Restaurant analytics' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
