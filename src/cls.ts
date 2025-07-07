
import { ContractTransactionResponse, ContractTransactionReceipt, ethers } from 'ethers';

import type { APICallReturn, APIResponse, ContractAddresses, SkyContractService } from '@decloudlabs/skynet/lib/types/types';
import { type AppManager, type BalanceSettler, type BalanceStore, type CollectionNFT, type NFT, type NFTRoles, type ERC20, type Subscription, type SecondsCostCalculator, type NFTMinter, NFTRoles__factory, Subscription__factory, NFTMinter__factory, ERC20__factory, SecondsCostCalculator__factory, AppManager__factory, BalanceSettler__factory, CollectionNFT__factory, NFT__factory, BalanceStore__factory, type NFTFactory, NFTFactory__factory } from '@decloudlabs/skynet/lib/types/contracts';
import { chainContracts } from '@decloudlabs/skynet/lib/utils/constants';
import { apiCallWrapper } from '@decloudlabs/skynet/lib/utils/utils';
export default class ContractService implements SkyContractService {
  selectedAccount: string;
  AppManager: AppManager;
  BalanceSettler: BalanceSettler;
  BalanceStore: BalanceStore;
  CollectionNFT: CollectionNFT;
  AgentNFT: NFT;
  SubnetNFT: NFT;
  NFTRoles: NFTRoles;
  SkyUSD: ERC20;
  Subscription: Subscription;
  SecondsCostCalculator: SecondsCostCalculator;
  NFTMinter: NFTMinter;
  NFTFactory: NFTFactory;
  provider: ethers.Provider;
  signer: ethers.Signer;
  contractAddresses: ContractAddresses;

  constructor(
    chainID: keyof typeof chainContracts,
    provider: ethers.Provider,
    signer: ethers.Signer,
    walletAddress: string
  ) {
    this.contractAddresses = chainContracts[chainID];
    this.provider = provider;
    this.signer = signer;
    this.selectedAccount = walletAddress;

    const empty: any = {};

    this.AppManager = empty;
    this.BalanceSettler = empty;
    this.BalanceStore = empty;
    this.CollectionNFT = empty;
    this.AgentNFT = empty;
    this.SubnetNFT = empty;
    this.NFTRoles = empty;
    this.SkyUSD = empty;
    this.Subscription = empty;
    this.SecondsCostCalculator = empty;
    this.NFTMinter = empty;
    this.NFTFactory = empty;
  }

  setup = async () => {
    const c = chainContracts['619'];
    const signer = this.signer;

    this.AppManager = AppManager__factory.connect(c.AppManager, signer);
    this.BalanceSettler = BalanceSettler__factory.connect(c.BalanceSettler, signer);
    this.BalanceStore = BalanceStore__factory.connect(c.BalanceStore, signer);
    this.CollectionNFT = CollectionNFT__factory.connect(c.CollectionNFT, signer);
    this.AgentNFT = NFT__factory.connect(c.AgentNFT, signer);
    this.SubnetNFT = NFT__factory.connect(c.SubnetNFT, signer);
    this.NFTRoles = NFTRoles__factory.connect(c.AgentAccessControl, signer);
    this.SecondsCostCalculator = SecondsCostCalculator__factory.connect(c.SecondsCostCalculator, signer);
    this.SkyUSD = ERC20__factory.connect(c.SkyUSD, signer);
    this.Subscription = Subscription__factory.connect(c.Subscription, signer);
    this.NFTMinter = NFTMinter__factory.connect(c.AgentNFTMinter, signer);
    this.NFTFactory = NFTFactory__factory.connect(c.NFTFactory, signer);
  };

  async callContractWrite(
    apiCall: Promise<ContractTransactionResponse>
  ): Promise<APICallReturn<string>> {
    const result = await apiCallWrapper<ContractTransactionReceipt, any>(
      (async () => {
        const tr = await apiCall;
        const rc = await tr.wait();
        if (!rc) {
          throw new Error('Transaction receipt is null');
        }
        return rc;
      })(),
      (res) => res.hash
    );

    return result;
  }

  async callContractRead<K, T, E = Error>(
    apiCall: Promise<K>,
    format: (rowList: K) => T,
    modifyRet?: (param: APIResponse<K, E>) => APICallReturn<T, E>
  ): Promise<APICallReturn<T, E>> {
    const result = await apiCallWrapper<K, T, E>(
      (async () => {
        const tr = await apiCall;
        return tr;
      })(),
      format,
      modifyRet
    );

    return result;
  }
}
