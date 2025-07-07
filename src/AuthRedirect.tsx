import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useProvider } from "./ProviderContext";

interface AuthRedirectProps {
  children: React.ReactNode;
}

export default function AuthRedirect({ children }: AuthRedirectProps) {
  const { provider } = useProvider();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (provider) {
          // Test if the provider is still valid by trying to get the signer
          const ethers = await import("ethers");
          const web3Provider = new ethers.BrowserProvider(provider);
          const signer = await web3Provider.getSigner();
          await signer.getAddress(); // This will throw if not authenticated
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [provider]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
} 