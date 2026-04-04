import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://wedding-bride-three.vercel.app";
const OG_IMAGE = `${SITE_URL}/assets/images/4011796024475880260.webp`;
const TITLE = "Thiệp cưới Diễm My & Công Tú 💍 21.04.2026";
const DESCRIPTION = "Trân trọng kính mời bạn đến dự lễ vu quy của Diễm My & Công Tú vào ngày 21 tháng 04 năm 2026. 💕";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Thiệp Cưới Diễm My & Công Tú",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: TITLE,
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
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
