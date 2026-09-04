import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata = {
  title: "NHAG Choir",
  description: "North Hodge Assembly of God Choir — songs, setlists, events, prayer, and announcements.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NHAG Choir",
  },
};

export const viewport = {
  themeColor: "#F6F1E6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
