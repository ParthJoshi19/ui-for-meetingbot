import { ethers } from 'ethers';
import SkyMainBrowser from '@decloudlabs/skynet/lib/services/SkyMainBrowser';
import SkyBrowserSigner from '@decloudlabs/skynet/lib/services/SkyBrowserSigner';
import type { SkyEnvConfigBrowser } from '@decloudlabs/skynet/lib/types/types';
import ContractService from './cls'; 

// This function sets up everything and returns SkyMainBrowser
export const initializeSkyBrowser = async (provider: any): Promise<SkyMainBrowser> => {
  if (!provider) throw new Error("Web3 provider not found");

  const ethersProvider = new ethers.BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  const address = await signer.getAddress();
  const contractService = new ContractService(619, ethersProvider, signer, address);
  await contractService.setup();

  const envConfig: SkyEnvConfigBrowser = {
    STORAGE_API: 'https://appsender.skynet.io/api/lighthouse',
    CACHE: {
      TYPE: 'CACHE',
    },
  };

  const skyBrowser = new SkyMainBrowser(
    //@ts-ignore
    contractService,
    address,
    new SkyBrowserSigner(address, signer),
    envConfig
  );

  await skyBrowser.init(true);

  return skyBrowser;
};
