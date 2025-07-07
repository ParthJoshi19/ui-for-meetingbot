import SkyMainBrowser from "@decloudlabs/skynet/lib/services/SkyMainBrowser";


export const fetchNfts = async (address: string, skyBrowser: SkyMainBrowser) => {
    let storedNfts = JSON.parse(localStorage.getItem(`nfts-${address}`) || '[]');
    let selectedNftId = localStorage.getItem(`selectedNftId-${address}`);

    const BATCH_SIZE = 20;

    try {
        const nftCount = await skyBrowser?.contractService.AgentNFT.balanceOf(address);
        if (nftCount) {
            const totalCount = parseInt(nftCount.toString());
            let currentIndex = storedNfts.length;

            while (currentIndex < totalCount) {
                const batchPromises = [];
                const endIndex = Math.min(currentIndex + BATCH_SIZE, totalCount);

                // Create batch of promises
                for (let i = currentIndex; i < endIndex; i++) {
                    batchPromises.push(
                        skyBrowser?.contractService.AgentNFT.tokenOfOwnerByIndex(address, i)
                    );
                }

                // Execute batch
                const batchResults = await Promise.all(batchPromises);
                const newNftIds = batchResults
                    .filter(nft => nft)
                    .map(nft => nft.toString());

                // Update state and localStorage with new batch
                const updatedNfts = [...storedNfts, ...newNftIds].sort((a, b) => parseInt(b) - parseInt(a));
                storedNfts = updatedNfts;
                localStorage.setItem(`nfts-${address}`, JSON.stringify(updatedNfts));

                currentIndex += BATCH_SIZE;
            }

            // Handle selected NFT after all NFTs are loaded
            if (!selectedNftId || !(await isValidOwner(selectedNftId, address, skyBrowser))) {
                selectedNftId = storedNfts[0];
                localStorage.setItem(`selectedNftId-${address}`, selectedNftId!);
            }

            return storedNfts; // Return the NFTs array
        }
        return []; // Return empty array if no NFTs found
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        return []; // Return empty array on error
    }
};

export const mintNft = async (skyBrowser: SkyMainBrowser) => {
    const registeredNFT = await skyBrowser.contractService.NFTMinter.registeredNFTs(skyBrowser.contractService.AgentNFT);
    console.log(registeredNFT);
    // if (!registeredNFT.isRegistered) {
    //     return false;
    // }
    const response = await skyBrowser.contractService.callContractWrite(
        skyBrowser.contractService.NFTMinter.mint(
            skyBrowser.contractService.selectedAccount,
            skyBrowser.contractService.AgentNFT,
            {
                value: registeredNFT.mintPrice
            }));
    if (response.success) {
        fetchNfts(skyBrowser.contractService.selectedAccount, skyBrowser);
        return true;
    }
    return false;
};

const isValidOwner = async (tokenId: string, address: string, skyBrowser: SkyMainBrowser) => {
    try {
        const owner = await skyBrowser?.contractService.AgentNFT.ownerOf(tokenId);
        return owner?.toLowerCase() === address.toLowerCase();
    } catch {
        return false;
    }
};