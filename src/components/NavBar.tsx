"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="w-full bg-gray-800 text-white py-4 px-8 shadow-md">
      <nav className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">DeFi 应用</h1>
        <div className="flex gap-4">
          <Link href="/staking">质押</Link>
          <Link href="/swap">代币兑换</Link>
          <Link href="/history">交易历史</Link>
        </div>
        <ConnectButton label="connect wallect" />
      </nav>
    </header>
  );
};

export default Navbar;
