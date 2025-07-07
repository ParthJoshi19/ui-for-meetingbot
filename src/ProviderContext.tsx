import { createContext, useContext } from "react";

export const ProviderContext = createContext<any>(null);

export function useProvider() {
  return useContext(ProviderContext);
}
