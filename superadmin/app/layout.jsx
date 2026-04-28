import './globals.css';

export const metadata = { title: 'Loyalr — Superadmin', description: 'Platform control panel' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
