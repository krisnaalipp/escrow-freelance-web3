import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import type { Chain } from "viem";

const hardhatLocalhost = {
  id: 31_337,
  name: "Localhost 31337",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
} as const satisfies Chain;

export const walletConfig = createConfig({
  chains: [hardhatLocalhost, sepolia],
  connectors: [injected()],
  transports: {
    [hardhatLocalhost.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
  },
});
