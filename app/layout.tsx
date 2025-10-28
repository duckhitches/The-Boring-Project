import type { Metadata } from 'next';
import './globals.css';
import 'prismjs/themes/prism-tomorrow.css';

export const metadata: Metadata = {
  title: 'The Boring Project',
  description: "A creative web app for developers to create and share visually appealing 'project cards' that showcase their coding projects, with AI-powered features for summarization, code explanation, and design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 font-zalando">{children}</body>
    </html>
  )
}
