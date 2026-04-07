"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAccount, useConnect, useConnectors, useDisconnect } from "wagmi";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletConnection() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const { address, isConnected } = useAccount();

  const handleConnect = () => {
    const connector = connectors.find((item) => item.type === "injected");

    if (connector) {
      connect({ connector });
    }
  };

  if (isConnected) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className="btn btn-primary px-4 py-2 text-sm" title={address}>
            {address ? shortAddress(address) : "Wallet"}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="surface-card z-50 w-52 rounded-xl p-2 shadow-xl"
          >
            <p className="text-secondary px-2 py-1 text-xs">Connected</p>
            <p className="text-primary truncate px-2 pb-2 text-xs">{address}</p>
            <DropdownMenu.Separator className="mx-1 my-1 h-px bg-slate-500/30" />
            <DropdownMenu.Item
              onSelect={() => disconnect()}
              className="w-full cursor-pointer rounded-lg px-2 py-2 text-left text-sm font-medium text-red-300 outline-none transition-colors hover:bg-red-400/10 focus:bg-red-400/10"
            >
              Disconnect
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      className="btn btn-primary px-4 py-2 text-sm"
    >
      Connect Wallet
    </button>
  );
}
