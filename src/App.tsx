import { useEffect, useState } from "react";
import {
  Web3Auth,
  WEB3AUTH_NETWORK,
  type Web3AuthOptions,
} from "@web3auth/modal";

import { useProvider } from "./ProviderContext";
import { CHAIN_NAMESPACES } from "@web3auth/modal";
import dotenv from 'dotenv';
dotenv.config();
function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const { provider, setProvider } = useProvider();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);


  useEffect(() => {
    const init = async () => {
      const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID
      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x26b",
        rpcTarget: "https://rpc.skynet.io/", // You can use any RPC endpoint
        displayName: "Ethereum Mainnet",
        blockExplorerUrl: "https://etherscan.io/",
        ticker: "ETH",
        tickerName: "Ethereum",
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      };
      const web3AuthOptions: Web3AuthOptions = {
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        chains: [chainConfig],
        defaultChainId: "0x26b",
      };
      const web3authInstance = new Web3Auth(web3AuthOptions);

      await web3authInstance.init();
      setWeb3auth(web3authInstance);
      
      // Check if user is already connected
      if (web3authInstance.connected) {
        const prov = await web3authInstance.connect();
        setProvider(prov);
      }
      
      setIsInitializing(false);
    };
    init();
  }, [setProvider]);

  const login = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!web3auth) return;
      const prov = await web3auth.connect();
      setProvider(prov);
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };



  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">
          Web3Auth Login
        </h2>
        <div className="mb-4 w-full flex flex-col items-center">
          <img src="/vite.svg" alt="Logo" className="w-16 h-16 mb-2" />
          <span className="text-gray-500 text-sm">Secure Ethereum Login</span>
        </div>

        {error && <div className="mb-2 text-red-600 text-xs">{error}</div>}
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full disabled:opacity-60"
          disabled={loading || provider}
        >
          {loading && !provider ? "Logging in..." : "Login with Web3Auth"}
        </button>
      </div>
    </div>
  );
}

export default App;
