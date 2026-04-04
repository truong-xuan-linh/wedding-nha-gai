import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "21.04.2026💍 | My & Tú",
  description: "21.04.2026💍 ",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    title: "21.04.2026💍 | My & Tú",
    description: "21.04.2026💍 ",
    type: "website",
    images: [
      {
        url: "/assets/images/4011796024475880260.webp",
        width: 1200,
        height: 630,
        alt: "21.04.2026💍",
      },
    ],
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="mdl-js">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/assets/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon.ico" />
        <link rel="stylesheet" href="/534d19d963ca7a9d.css" />
        <link rel="stylesheet" href="/3a12fbab90cd8589.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
