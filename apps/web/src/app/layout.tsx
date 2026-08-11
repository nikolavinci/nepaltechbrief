import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari, Mukta } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mukta = Mukta({
  variable: "--font-mukta",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["devanagari"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: "%s | NepTechNews",
    default: "NepTechNews | नेपालको उत्कृष्ट टेक न्युज पोर्टल",
  },
  description: "प्रविधि, स्टार्टअप, ग्याजेट्स, र एप्ससम्बन्धी नेपालको उत्कृष्ट डिजिटल समाचार पोर्टल।",
  openGraph: {
    type: 'website',
    siteName: 'NepTechNews',
    images: ['/placeholder-og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@neptechnews',
    creator: '@neptechnews',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontClass = notoDevanagari.className;
  const fontVars = `${inter.variable} ${notoDevanagari.variable} ${mukta.variable}`;

  return (
    <html
      lang="ne"
      className={`${fontClass} ${fontVars} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
