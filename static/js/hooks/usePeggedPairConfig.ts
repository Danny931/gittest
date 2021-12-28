/* eslint-disable camelcase */
import { useEffect, useState } from "react";
import { PeggedPairConfig } from "../constants/type";
import { setOTContractAddr, setPTContractAddr } from "../redux/globalInfoSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";

// eslint-disable-next-line no-shadow
export enum PeggedChainMode {
  Off,
  Deposit,
  Burn,
  DepositThenSwap,
  BurnThenSwap,
}

export class PeggedPair {
  mode: PeggedChainMode;

  config: PeggedPairConfig;

  canonicalAddrMap: Map<string, string>;

  constructor(mode: PeggedChainMode, config: PeggedPairConfig, canonicalAddrMap: Map<string, string>) {
    this.mode = mode;
    this.config = config;
    this.canonicalAddrMap = canonicalAddrMap;
  }

  getTokenBalanceAddress(originalAddress: string) {
    const canonicalAddr = this.canonicalAddrMap.get(originalAddress);
    if (canonicalAddr !== undefined && canonicalAddr.length > 0) {
      return canonicalAddr;
    }
    return originalAddress;
  }

  getSpenderAddress() {
    switch (this.mode) {
      case PeggedChainMode.Deposit:
      case PeggedChainMode.DepositThenSwap:
        return this.config.pegged_deposit_contract_addr;
      case PeggedChainMode.Burn:
        return this.config.pegged_burn_contract_addr;
      case PeggedChainMode.BurnThenSwap:
        return this.config.pegged_token.token.address;
      default:
        return "";
    }
  }
}

export const usePeggedPairConfig = (): PeggedPair => {
  const { transferInfo } = useAppSelector(state => state);
  const { fromChain, toChain, selectedToken } = transferInfo;
  const pegged_pair_configs = transferInfo.transferConfig.pegged_pair_configs;
  const [peggedPair, setPeggedPair] = useState<PeggedPair>(
    new PeggedPair(PeggedChainMode.Off, {} as PeggedPairConfig, new Map()),
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!pegged_pair_configs || pegged_pair_configs === undefined) {
      return;
    }
    const depositConfigs = pegged_pair_configs.filter(
      e =>
        e.org_chain_id === fromChain?.id &&
        e.pegged_chain_id === toChain?.id &&
        e.org_token.token.symbol === selectedToken?.token.symbol,
    );
    const burnConfigs = pegged_pair_configs.filter(
      e =>
        e.org_chain_id === toChain?.id &&
        e.pegged_chain_id === fromChain?.id &&
        e.org_token.token.symbol === selectedToken?.token.symbol,
    );
    const canonicalAddrMap = new Map<string, string>();
    pegged_pair_configs
      .filter(e => e.canonical_token_contract_addr.length > 0)
      .forEach(e => {
        canonicalAddrMap.set(e.pegged_token.token.address, e.canonical_token_contract_addr);
      });
    if (depositConfigs.length > 0) {
      dispatch(setOTContractAddr(depositConfigs[0].pegged_deposit_contract_addr));
      setPeggedPair(new PeggedPair(PeggedChainMode.Deposit, depositConfigs[0], canonicalAddrMap));
    } else if (burnConfigs.length > 0) {
      if (burnConfigs[0].canonical_token_contract_addr.length > 0) {
        setPeggedPair(new PeggedPair(PeggedChainMode.BurnThenSwap, burnConfigs[0], canonicalAddrMap));
      } else {
        setPeggedPair(new PeggedPair(PeggedChainMode.Burn, burnConfigs[0], canonicalAddrMap));
      }
      dispatch(setPTContractAddr(burnConfigs[0].pegged_burn_contract_addr));
    } else {
      setPeggedPair(new PeggedPair(PeggedChainMode.Off, {} as PeggedPairConfig, canonicalAddrMap));
    }
  }, [fromChain, toChain, selectedToken, pegged_pair_configs, dispatch]);

  return peggedPair;
};
