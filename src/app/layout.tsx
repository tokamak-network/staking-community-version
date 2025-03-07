import type { Metadata } from "next";
import RecoilRootWrapper from "@/app/Staking/components/RecoilWrapper";
import { WagmiProviders } from "@/providers/wagmiProvider";
import Entry from "./Entry";

export const metadata: Metadata = {
  title: "Tokamak Bridge",
  viewport:
    "width=device-width,user-scalable=no,initial-scale=1, maximum-scale=1, minimum-scale=1",
  keywords: "staking",
  openGraph: {
    type: "website",
    title: "Staking community version",
    description:
      "Staking community version offers a unified bridge and swap experience between Ethereum and Titan Network.",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ maxHeight: "100vh", margin: 0, padding: 0 }}>
        <RecoilRootWrapper>
          <WagmiProviders>
            <Entry children={children} />
          </WagmiProviders>
        </RecoilRootWrapper>
      </body>
    </html>
  );
}
