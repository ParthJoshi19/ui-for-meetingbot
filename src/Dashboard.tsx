import axios from "axios";
import { useProvider } from "./ProviderContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SkyMainBrowser from "@decloudlabs/skynet/lib/services/SkyMainBrowser";
import SkyBrowserSigner from "@decloudlabs/skynet/lib/services/SkyBrowserSigner";
import SkyEtherContractService from "@decloudlabs/skynet/lib/services/SkyEtherContractService";
import { ethers } from "ethers";
import type { SkyEnvConfigBrowser } from "@decloudlabs/skynet/lib/types/types";
import { fetchNfts } from "./getNft";
import { initializeSkyBrowser } from "./initSky";
import { storeApiKey } from "./supabase";

export async function initSkyMainBrowser(provider: any): Promise<SkyMainBrowser> {
  const ethersProvider = new ethers.BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  const address = await signer.getAddress();

  const contractService = new SkyEtherContractService(
    //@ts-ignore
    ethersProvider,
    signer,
    address,
    619
  );

  const envConfig: SkyEnvConfigBrowser = {
    STORAGE_API: "https://appsender.skynet.io/api/lighthouse",
    CACHE: { TYPE: "CACHE" },
  };

  const skyMainBrowser = new SkyMainBrowser(
    contractService,
    address,
    new SkyBrowserSigner(address, signer),
    envConfig
  );

  await skyMainBrowser.init(true);
  return skyMainBrowser;
}

export default function Dashboard() {
  const { provider, setProvider } = useProvider();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfts, setNfts] = useState<string[]>([]);
  const [selectedNft, setSelectedNft] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("0");
  const navigate = useNavigate();

  const handleLogout = async () => {
    setProvider(null);
    navigate("/");
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const sb = await initializeSkyBrowser(provider);

        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        const balance = await ethersProvider.getBalance(address);
        setEthBalance(ethers.formatEther(balance));


        const addressForNfts = sb.contractService.selectedAccount;
        const fetched = await fetchNfts(addressForNfts, sb);
        setNfts(fetched);
        
        if (fetched.length > 0) {
          setSelectedNft(fetched[0]);
        }
      } catch (err) {
        console.error("SkyBrowser setup failed:", err);
      }
    };

    if (provider) setup();
  }, [provider]);

  const handleClick = async () => {
    setError(null);
    setApiKey(null);
    if (!provider) {
      setError("Provider not found. Please login again.");
      return;
    }

    if (!selectedNft) {
      setError("Please select an NFT first.");
      return;
    }

    setLoading(true);
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      console.log("Using address:", address);
      const message = `${Date.now()}`;
      const signature = await signer.signMessage(message);

      const payload = {
        message,
        signature,
        userAddress: address,
      };

      const genResponse = await axios.post(
        `https://lighthouseservice-c0n1.stackos.io/generate-api-key`,
        {
          userAuthPayload: JSON.stringify(payload),
          accountNFT: JSON.stringify({
            collectionID: "0",
            nftID: selectedNft,
          }),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const apiKeyValue = genResponse.data.data.apiKey;
      setApiKey(apiKeyValue);

      // Store the API key data in Supabase
      try {
        await storeApiKey({
          user_address: address,
          collection_id: "0", // Using the hardcoded collection ID from the request
          nft_id: selectedNft,
          api_key: apiKeyValue,
        });
        console.log("API key data stored successfully in Supabase");
      } catch (supabaseError) {
        console.error("Failed to store API key in Supabase:", supabaseError);
        // Don't throw here as the API key was still generated successfully
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-200">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-green-700">Dashboard</h2>
        <p className="text-gray-700 mb-2">You are logged in with Web3Auth!</p>
        <p className="text-sm text-blue-600 mb-2">ETH Balance: {ethBalance} ETH</p>

        {nfts.length > 0 ? (
          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select NFT:
            </label>
            <select
              value={selectedNft}
              onChange={(e) => setSelectedNft(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {nfts.map((id) => (
                <option key={id} value={id}>
                  NFT #{id}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No NFTs found</p>
        )}

        <button
          onClick={handleClick}
          disabled={loading || !provider || !selectedNft}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Get API KEY"}
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition w-full mt-4"
        >
          Logout
        </button>

        {apiKey && (
          <div className="text-xs break-all mt-4">
            <b>API Key:</b> {apiKey}
          </div>
        )}

        {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
