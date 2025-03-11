import { Jura } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Cannabis Anbau Workshop",
  description: "Digitaler Handout für Cannabis Anbau Workshop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={`${jura.variable} font-jura min-h-screen`} style={{ background: `#f0eee9` }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
