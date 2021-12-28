import { useEffect, useState } from "react";
import { Chain, TokenInfo } from "../constants/type";
import { useContractsContext } from "../providers/ContractsContextProvider";
import { useWeb3Context } from "../providers/Web3ContextProvider";
import { useEthBalance } from ".";
import { NETWORKS } from "../constants/network";

export const useNativeETHToken = (srcChain: Chain | undefined, tokenInfo: TokenInfo | undefined) => {
  const [isNativeETHToken, setIsNativeETHToken] = useState(false);
  const [tokenDisplayName, setTokenDisplayName] = useState(tokenInfo?.name ?? "");

  const {
    contracts: { bridge },
  } = useContractsContext();
  const { provider, address } = useWeb3Context();
  const [ETHBalance] = useEthBalance(provider, address);

  useEffect(() => {
    if (!srcChain || !tokenInfo || !bridge) {
      return;
    }
    const chainIds = [
      NETWORKS.mainnet.chainId,
      NETWORKS.arbitrum.chainId,
      NETWORKS.Optimism.chainId,
      NETWORKS.goerli.chainId,
      NETWORKS.BoBa.chainId,
    ];
    const nativeETHToken = chainIds.includes(srcChain.id) && tokenInfo.token.symbol === "WETH";
    setIsNativeETHToken(nativeETHToken);
    if (nativeETHToken) {
      setTokenDisplayName("Ethereum Token");
    } else {
      setTokenDisplayName(tokenInfo?.name ?? "");
    }
  }, [srcChain, tokenInfo, bridge]);

  return { isNativeETHToken, ETHBalance, tokenDisplayName };
};
