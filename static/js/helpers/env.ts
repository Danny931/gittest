import { NETWORKS } from "../constants/network";

const STORAGE_KEY_NAMES = {
  rpcUrl: "rpcUrl",
};
const chainId = process.env.REACT_APP_NETWORK_ID;
const url = Object.values(NETWORKS).find(network => network.chainId + "" === chainId)?.rpcUrl;

export const setRpcUrl = (rpcUrl: string): void => {
  localStorage.setItem(STORAGE_KEY_NAMES.rpcUrl, rpcUrl);
};

export const getRpcUrl = (): string | undefined => {
  return localStorage.getItem(STORAGE_KEY_NAMES.rpcUrl) || url;
};
