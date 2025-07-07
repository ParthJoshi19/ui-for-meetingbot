import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AuthRedirect from "./AuthRedirect";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState} from "react";
import { ProviderContext } from "./ProviderContext";

function Root() {
  // Only store provider in memory, do not persist to localStorage
  const [provider, setProvider] = useState<any>(null);

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <AuthRedirect>
                <App />
              </AuthRedirect>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ProviderContext.Provider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
