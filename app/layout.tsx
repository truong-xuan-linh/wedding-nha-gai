import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "21.04.2026💍 | CineLove",
  description: "21.04.2026💍 - Thiệp cưới online Huyền & Tú",
  keywords:
    "thiệp cưới online miễn phí, website cưới online, thiệp cưới điện tử, thiệp mời cưới, mẫu thiệp cưới đẹp, tạo thiệp cưới, Cinelove",
  authors: [{ name: "CineLove" }],
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    title: "21.04.2026💍 | CineLove",
    description: "21.04.2026💍 - Thiệp cưới online Huyền & Tú",
    url: "https://cinelove.me/s/Ui1aOGGEUE1cT1hTUhhciahOiiZhUU0OG",
    type: "website",
    siteName: "CineLove",
    images: [
      {
        url: "https://img.cinelove.me/uploads/72551605-7892-4c13-a158-ac080371e869/2e27300c-364a-4477-8a4c-bfae17cac71a.jpeg?crop=0,0,1824,1216&resize=1000x&format=webp",
        width: 1200,
        height: 630,
        alt: "21.04.2026💍",
      },
    ],
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cinelove",
    creator: "@cinelove",
    title: "21.04.2026💍 | CineLove",
    description: "21.04.2026💍 - Thiệp cưới online Huyền & Tú",
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
        <link rel="icon" href="https://cinelove.me/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://cinelove.me/apple-touch-icon.png" />
        <link rel="canonical" href="https://cinelove.me/s/Ui1aOGGEUE1cT1hTUhhciahOiiZhUU0OG" />
        {/* Original CineLove CSS bundles */}
        <link rel="stylesheet" href="/534d19d963ca7a9d.css" />
        <link rel="stylesheet" href="/3a12fbab90cd8589.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
