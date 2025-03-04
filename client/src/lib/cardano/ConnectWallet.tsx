"use client";

import React, { useState, useRef, useEffect } from "react";
import { AssetExtended, BrowserWallet, IWallet } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";

interface WalletInfo {
  name: string;
  icon: string;
  version: string;
}

export default function ConnectWallet({
  getFts,
  getNfts,
  getWallet,
}: {
  getFts: (fts: AssetExtended[]) => void;
  getNfts: (nfts: AssetExtended[]) => void;
  getWallet: (wallet: IWallet) => void;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { wallet, connect, connected } = useWallet();

  const [lovelace, setLovelace] = useState("");

  // Function to programmatically close the popover
  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  // Fetch available wallets when popover opens
  useEffect(() => {
    const fetchWallets = async () => {
      if (isPopoverOpen) {
        try {
          const wallets = await BrowserWallet.getAvailableWallets();
          setAvailableWallets(wallets);
        } catch (error) {
          console.error("Error fetching available wallets:", error);
          setAvailableWallets([]);
        }
      }
    };

    fetchWallets();
  }, [isPopoverOpen]);

  useEffect(() => {
    if (connected === true) {
      wallet
        .getPolicyIdAssets(process.env.NEXT_PUBLIC_NFT_POLICY_ID!)
        .then((v) => {
          getNfts(v);
        });
      wallet
        .getPolicyIdAssets(process.env.NEXT_PUBLIC_FT_POLICY_ID!)
        .then((v) => {
          getFts(v);
        });
      getWallet(wallet);

      wallet.getLovelace().then((l) => {
        console.log(l);
        setLovelace(l);
      });
    }
  }, [connected, wallet]); //eslint-disable-line

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        closePopover();
      }
    };

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  // Handle wallet selection
  const handleWalletSelect = (walletName: string) => {
    console.log(`Selected wallet: ${walletName}`);
    connect(walletName);
    closePopover();
  };

  return (
    <div>
      <button
        onClick={() => setIsPopoverOpen(true)}
        className="px-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {(() => {
          if (connected) {
            return <>Connected ₳{Number(lovelace) / 1000000}</>;
          } else {
            return <>Connect Wallet</>;
          }
        })()}
      </button>

      {isPopoverOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={popoverRef}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Wallet</h2>
              <button
                onClick={closePopover}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {availableWallets.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {availableWallets.map((wallet, index) => (
                  <div key={index} className="aspect-square">
                    <button
                      onClick={() => handleWalletSelect(wallet.name)}
                      className="w-full h-full aspect-square bg-gray-100 rounded-md flex flex-col items-center justify-center hover:bg-gray-200 transition-colors p-2"
                    >
                      <img className="w-full" src={wallet.icon}></img>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p>
                  No compatible wallets found. Please install a Cardano wallet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
