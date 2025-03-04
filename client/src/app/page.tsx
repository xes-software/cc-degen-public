"use client";

import { useState, useEffect } from "react";
import { MeshProvider } from "@meshsdk/react";
import ConnectWallet from "@/lib/cardano/ConnectWallet";
import { AssetExtended, IWallet } from "@meshsdk/core";
import { useRef } from "react";

export default function Home() {
  const [assetType, setAssetType] = useState("From NFT");
  const [nfts, setNfts] = useState<AssetExtended[]>([]);
  const [fts, setFts] = useState<AssetExtended[]>([]);
  const [wallet, setWallet] = useState<IWallet | undefined>();
  const [selectedNfts, setSelectedNfts] = useState<AssetExtended[]>([]);
  const [showNftDropdown, setShowNftDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [nftCount, setNftCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNftDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function submitSwapFt() {
    try {
      setIsSubmitting(true);

      console.log(wallet);
      const addresses = await wallet!.getUsedAddresses();
      // Prepare the data for the API call
      const data = {
        amountNft: Number(nftCount),
        address: addresses[0],
        // Add any other data needed for the API call
      };

      // Make the API call
      const response = (await (
        await fetch("http://0.0.0.0:4242/ft", {
          body: JSON.stringify(data),
          method: "POST",
        })
      ).json()) as { unsignedTx: string };

      const signedTx = await wallet!.signTx(response.unsignedTx, true);
      const txHash = await wallet!.submitTx(signedTx);

      // Handle successful response
      alert(`TxHash: ${txHash}`);
    } catch (error) {
      console.error("Error submitting swap:", error);
      alert("Failed to submit swap request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitSwapNft() {
    try {
      setIsSubmitting(true);

      if (selectedNfts.length === 0) {
        alert("Please select at least one NFT to swap.");
        setIsSubmitting(false);
        return;
      }

      console.log(wallet);
      const addresses = await wallet!.getUsedAddresses();

      // Prepare the data for the API call
      const data = {
        selectedNfts: selectedNfts.map((nft) => nft.unit),
        address: addresses[0],
      };

      // Make the API call
      const response = (await (
        await fetch("http://0.0.0.0:4242/nft", {
          body: JSON.stringify(data),
          method: "POST",
        })
      ).json()) as { unsignedTx: string };
      console.log(response);

      const signedTx = await wallet!.signTx(response.unsignedTx, true);
      const txHash = await wallet!.submitTx(signedTx);

      // Handle successful response
      alert(`TxHash: ${txHash}`);

      // Clear selected NFTs after successful swap
      setSelectedNfts([]);
    } catch (error) {
      console.error("Error submitting NFT swap:", error);
      alert("Failed to submit NFT swap request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleNftSelection = (nft: AssetExtended) => {
    setSelectedNfts((prev) => {
      const isSelected = prev.some((item) => item.unit === nft.unit);
      if (isSelected) {
        return prev.filter((item) => item.unit !== nft.unit);
      } else {
        return [...prev, nft];
      }
    });
  };

  const filteredNfts = nfts.filter((nft) =>
    nft.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MeshProvider>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
        <div className="w-full max-w-md p-6 rounded-xl bg-gray-900 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-2xl font-bold mr-2">swap</h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16V4M7 4L3 8M7 4L11 8" />
              <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
            </svg>
          </div>
          <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between mb-2">
              <span>Number of NFTs: {nfts.length}</span>
              <span>Total FTs: {fts[0] ? fts[0].quantity : "0"}</span>
            </div>

            <ConnectWallet
              getFts={(a) => {
                setFts(a);
                console.log("Logging assets from inside the page.tsx:", a);
              }}
              getNfts={(f) => {
                setNfts(f);
                console.log("Logging nfts from inside the page.tsx:", f);
              }}
              getWallet={(wallet) => setWallet(wallet)}
            ></ConnectWallet>

            <div className="mb-4">
              <select
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
              >
                <option value="From NFT">From NFT</option>
                <option value="From Token">From Token</option>
              </select>
            </div>

            {assetType === "From NFT" ? (
              <>
                <div>
                  <div className="flex items-center">
                    <span className="mr-2">
                      Selected: {selectedNfts.length}
                    </span>
                  </div>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    className="w-full p-3 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 transition-colors mb-4"
                    onClick={() => setShowNftDropdown(!showNftDropdown)}
                  >
                    {selectedNfts.length > 0
                      ? `${selectedNfts.length} NFTs Selected`
                      : "Select NFT"}
                  </button>

                  <button
                    className="w-full p-3 bg-green-600 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    type="button"
                    onClick={submitSwapNft}
                    disabled={isSubmitting || selectedNfts.length === 0}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>

                  {showNftDropdown && (
                    <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search NFTs..."
                          className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div>
                        {filteredNfts.length > 0 ? (
                          filteredNfts.map((nft) => (
                            <div
                              key={nft.unit}
                              className={`p-3 cursor-pointer hover:bg-gray-700 flex items-center ${
                                selectedNfts.some(
                                  (item) => item.unit === nft.unit
                                )
                                  ? "bg-gray-700"
                                  : ""
                              }`}
                              onClick={() => toggleNftSelection(nft)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedNfts.some(
                                  (item) => item.unit === nft.unit
                                )}
                                onChange={() => {}}
                                className="mr-2"
                              />
                              <span>{nft.assetName}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-400">No NFTs found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    How many NFTs?
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={nftCount}
                    onChange={(e) => setNftCount(parseInt(e.target.value) || 1)}
                    className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Enter number of NFTs"
                  />
                </div>
                <button
                  className="w-full p-3 bg-green-600 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  type="button"
                  onClick={submitSwapFt}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </MeshProvider>
  );
}
