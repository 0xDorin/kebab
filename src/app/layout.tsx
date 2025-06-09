import type { Metadata } from "next";
import "./globals.css";
import { WagmiProvider } from "@/components/providers/wagmi-provider";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CMS with Wagmi",
  description: "CMS project with Wagmi integration",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>{props.children}</WagmiProvider>
      </body>
    </html>
  );
}
