import { useCallback, useEffect, useState } from "react";
import { Layout, message } from "antd";
import { createUseStyles } from "react-jss";
import { useAsync } from "react-use";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { GithubFilled, TwitterCircleFilled } from "@ant-design/icons";
// import Vconsole from "vconsole";
import { DiscordCircleFilled, TelegramCircleFilled } from "../icons";
import docIcon from "../images/doc.svg";
import { Theme } from "../theme";
import NewTransfer from "./NewTransfer";
import Liquidity from "./Liquidity";
import Rewards from "./Rewards";
import HistoryModal from "./HistoryModal";
import Header from "../components/Header";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { closeModal, ModalName } from "../redux/modalSlice";
import ProviderModal from "../components/ProviderModal";
import ChainList from "../components/ChainList";
import { useWeb3Context } from "../providers/Web3ContextProvider";
import {
  setCBridgeAddresses,
  setCBridgeDesAddresses,
  setFarmingRewardAddresses,
  setIsHistoryNotEmpty,
  setIsLPNotEmpty,
} from "../redux/globalInfoSlice";
import {
  getTransferConfigs,
  transferHistory,
  lpHistory,
  checkTransferHistory,
  checkLpHistory,
  checkGetLPInfoList,
} from "../redux/gateway";
import {
  setIsChainShow,
  setTransferConfig,
  setTokenList,
  setFromChain,
  setToChain,
  setSelectedToken,
  switchChain,
  setGetConfigsFinish,
  addChainToken,
  setTotalActionNum,
  setTotalPaddingNum,
  setSingleChainList,
  setRefreshTransferAndLiquidity,
} from "../redux/transferSlice";
import { setConfig } from "../redux/configSlice";
import {
  Chain,
  TransferHistoryStatus,
  LPHistoryStatus,
  TokenInfo,
  LPType,
  TransferHistory,
  LPHistory,
  PeggedPairConfig,
} from "../constants/type";
import { PRE_UPGRADE_LINK } from "../constants";
import { NETWORKS, getNetworkById } from "../constants/network";
import HomeCircleFilled from "../icons/HomeCircleFilled";
// import { Chain } from "../proto/sgn/gateway/v1/gateway_pb";
import { dataClone } from "../helpers/dataClone";
import ViewTab from "../components/ViewTab";

/* eslint-disable */
/* eslint-disable no-debugger */
/* eslint-disable camelcase */

const { Content, Footer } = Layout;

const cBridgeV1Url = "https://cbridge-v1-legacy.celer.network";

const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  [`@media (max-width: ${768}px)`]: {
    "@global": {
      body: {
        background: `${theme.secondBackground}`,
      },
    },
  },
  [`@media (min-width: ${769}px)`]: {
    "@global": {
      body: {
        background: `${theme.globalBg}`,
      },
    },
  },
  ".ant-select-dropdown": {
    // backgroundColor: `${theme.componentPrimary} !important`,
    "& .ant-select-item-option-selected:not(.ant-select-item-option-disabled)": {
      //   backgroundColor: `${theme.componentPrimary} !important`,
      //   color: theme.infoPrimary,
    },
    "& .ant-select-item": {
      //   color: theme.infoThird,
    },
  },
  app: {
    background: theme.globalBg,
  },
  layout: {
    background: props => (props.isMobile ? theme.secondBackground : theme.globalBg),
    padding: props => (props.isMobile ? 0 : "0 30px"),
    minHeight: props => (props.isMobile ? 0 : "100vh"),
    maxWidth: "100%",
    "@global": {
      body: {
        backgroundColor: "yellow",
      },
      ".ant-card": {
        //   background: theme.surface,
      },
      ".ant-dropdown": {
        backgroundColor: "yellow",
      },
      "ant-dropdown-menu-title-content": {
        color: "yellow",
      },
    },
  },
  "@global": {
    ".ant-modal-mask": {
      backgroundColor: theme.blurBg,
    },
  },
  headerTip: {
    width: "100%",
    height: 48,
    fontSize: 14,
    lineHeight: "48px",
    color: theme.surfacePrimary,
    fontWeight: 500,
    textAlign: "center",
    borderBottom: `0.5px solid ${theme.primaryBorder}`,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    marginTop: 10,
  },
  footer: {
    margin: props => (props.isMobile ? "20px 16px 16px 16px" : "40px 10px 70px 10px"),
    padding: 0,
    display: "flex",
    flexFlow: "column",
    justifyContent: "center",
    alignItems: props => (props.isMobile ? "flex-start" : "center"),
    background: props => (props.isMobile ? theme.secondBackground : "transparent"),
    "& p, button": {
      color: theme.secondBrand,
      marginBottom: 5,
    },
    fontSize: 12,
    fontWeight: 400,
  },
  footerContent: {
    textAlign: "center",
  },
  footerLink: {
    marginRight: -8,
    "& span": {
      textDecoration: "underline",
    },
    "&:hover": {
      color: "rgb(143, 155, 179)",
    },
  },
  footerContainer: {
    display: "table-row",
    alignItems: "center",
    justifyContent: "space-between",
    color: theme.secondBrand,
    width: "100%",
  },
  footerContainerEnd: {
    marginTop: 25,
    alignItems: "center",
    textDecoration: "underline",
    color: theme.secondBrand,
    fontSize: 12,
    width: "100%",
  },
  footBy: {
    display: "inline-block",
  },
  social: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    color: theme.secondBrand,
    marginTop: 18,
    fontSize: 24,
  },
  content: {
    // width: props => (props.isMobile ? "100%" : 1200),
    width: "100%",
    padding: 0,
    margin: "0px auto",
    position: "relative",
  },
  footerText: {
    fontSize: 12,
    fontWeight: 400,
    color: theme.secondBrand,
  },
  footerURLText: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.secondBrand,
    marginLeft: 7,
  },
}));

function FooterContent() {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  if (isMobile) {
    return null;
  }
  return (
    <div className={classes.footerContainer}>
      <div className={classes.footerText}>Powered by Celer Network</div>
      <div className={classes.social}>
        <HomeCircleFilled onClick={() => window.open("https://www.celer.network", "_blank")} />
        <img
          style={{ cursor: "pointer" }}
          src={docIcon}
          onClick={() => window.open("https://cbridge-docs.celer.network", "_blank")}
        />
        <DiscordCircleFilled onClick={() => window.open("https://discord.gg/uGx4fjQ", "_blank")} />
        <TelegramCircleFilled onClick={() => window.open("https://t.me/celernetwork", "_blank")} />
        <TwitterCircleFilled onClick={() => window.open("https://twitter.com/CelerNetwork", "_blank")} />
        <GithubFilled onClick={() => window.open("https://github.com/celer-network", "_blank")} />
      </div>
      <div className={classes.footerContainerEnd}>
        <label style={{ cursor: "pointer" }} onClick={() => window.open("https://form.typeform.com/to/Q4LMjUaK")}>
          Contact Support
        </label>
        <label
          style={{ marginLeft: 24, cursor: "pointer" }}
          onClick={() => window.open("https://get.celer.app/cbridge-v2-doc/tos-cbridge-2.pdf")}
        >
          Terms of Service
        </label>
        <label style={{ marginLeft: 24, cursor: "pointer" }} onClick={() => window.open(PRE_UPGRADE_LINK)}>
          Migrate Liquidity from Pre-upgrade Pools
        </label>
      </div>
    </div>
  );
}

const findPeggedTokens = (chainId: number, peggedPairConfigs: PeggedPairConfig[]): TokenInfo[] => {
  if (peggedPairConfigs === undefined) {
    return [];
  }
  const peggedTokens = peggedPairConfigs.map(config => {
    if (config.org_chain_id === chainId) {
      return config.org_token;
    }
    if (config.pegged_chain_id === chainId) {
      return config.pegged_token;
    }
  });
  return peggedTokens.filter(e => e !== undefined).map(e => e as TokenInfo);
};

let inter;
function Home(): JSX.Element {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const history = useHistory();
  const { chainId, address, provider } = useWeb3Context();
  const { modal, transferInfo } = useAppSelector(state => state);
  const { lpList, selectedLP } = useAppSelector(state => state.lp);
  const { showProviderModal, showHistoryModal, showTransferModal } = modal;
  const {
    transferConfig,
    isChainShow,
    chainSource,
    fromChain,
    refreshHistory,
    singleChainList,
    singleChainSelectIndex,
    refreshTransferAndLiquidity,
  } = transferInfo;
  const { chains, chain_token, pegged_pair_configs } = transferConfig;
  const [historyTitleNum, setHistoryTitleNum] = useState(0);
  const [lpTitleNum, setLpTitleNum] = useState(0);
  const [historyPaddingNum, setHistoryPaddingNum] = useState(0);
  const [lpPaddingNum, setLpPaddingNum] = useState(0);
  const dispatch = useAppDispatch();
  const handleCloseProviderModal = () => {
    dispatch(closeModal(ModalName.provider));
  };
  const handleCloseHistoryModal = () => {
    dispatch(setRefreshTransferAndLiquidity(!refreshTransferAndLiquidity));
    refreshHistoryList();
    dispatch(closeModal(ModalName.history));
  };
  useEffect(() => {
    const clearTag = localStorage.getItem("clearTag");
    if (clearTag !== "clear") {
      localStorage.clear();
    }
    localStorage.setItem("clearTag", "clear");
    const localeToAddTokenStr = localStorage.getItem("ToAddToken");
    if (localeToAddTokenStr) {
      const localeToAddToken = JSON.parse(localeToAddTokenStr).atoken;
      addChainToken(localeToAddToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAsync(async () => {
    const lpList = await checkGetLPInfoList({ addr: address });
    const txHistoryList = await checkTransferHistory({ addr: address, page_size: 5, next_page_token: "" });
    const lpHistoryList = await checkLpHistory({ addr: address, page_size: 5, next_page_token: "" });
    if (lpList?.lp_info?.find(lp => lp.liquidity > 0)) {
      dispatch(setIsLPNotEmpty());
    }
    if (txHistoryList?.history?.length > 0 || lpHistoryList.history.length > 0) {
      dispatch(setIsHistoryNotEmpty());
    }
  }, [address, dispatch]);

  useEffect(() => {
    document.addEventListener("visibilitychange", function () {
      // console.log(document.visibilityState);
      if (document.visibilityState == "hidden") {
        clearInterval(inter);
      } else if (document.visibilityState == "visible") {
        if (address) {
          refreshHistoryList();
          clearInterval(inter);
          inter = setInterval(() => {
            refreshHistoryList();
          }, 60000);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshHistory]);
  const refreshHistoryList = () => {
    gethistoryList();
    getlphistoryList();
  };
  useEffect(() => {
    if (address) {
      refreshHistoryList();
      clearInterval(inter);
      inter = setInterval(() => {
        refreshHistoryList();
      }, 60000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshHistory]);

  /// Observe from chain id:
  // useEffect(() => {
  //   const cacheToChain = localStorage.getItem("toChainInfo");
  //   if (cacheToChain !== "undefined") {
  //     const toChain = cacheToChain ? JSON.parse(cacheToChain) : null;
  //     const cachePreviousFromChain = localStorage.getItem("previousFromChainInfo");
  //     const previousFromChainId = cachePreviousFromChain ? JSON.parse(cachePreviousFromChain).id : null;

  //     /// If from chain id B is the same as to chain id B and there is a previous from chain id A
  //     ///  set A as new to chain id
  //     if (toChain && toChain.id && chainId === toChain.id && previousFromChainId) {
  //       setToChainMethod(previousFromChainId);
  //     }
  //   }
  // }, [chainId]);
  const getTxStatus = async link => {
    const txid = link.split("/tx/")[1];
    if (txid) {
      const res = await provider?.getTransactionReceipt(txid);
      return res;
    } else {
      return "";
    }
  };
  const gethistoryList = async () => {
    let paddigNum = 0;
    let num = 0;
    const res = await transferHistory({ addr: address, page_size: 50, next_page_token: "" });
    if (res) {
      const hisList = res.history;
      let newList = hisList;
      let localTransferList;
      let noExitList;
      const promiseList: Array<Promise<any>> = [];
      const localTransferListStr = localStorage.getItem("transferListJson");
      if (localTransferListStr) {
        localTransferList = JSON.parse(localTransferListStr)[address];
        const newLocalTransferList: TransferHistory[] = [];
        localTransferList?.map((localItem, i) => {
          if (localItem && localItem !== "null") {
            newLocalTransferList.push(localItem);
            if (localItem.status === TransferHistoryStatus.TRANSFER_FAILED || localItem.txIsFailed) {
              //过滤已经失败的tx
              const nullPromise = new Promise(resolve => {
                resolve(0);
              });
              promiseList.push(nullPromise);
            } else {
              const promistx = getTxStatus(localItem.src_block_tx_link); //查询本地记录的tx状态
              promiseList.push(promistx);
            }
          }
        });
        localTransferList = newLocalTransferList;
      }
      Promise.all(promiseList).then(resList => {
        resList?.map((pItem, i) => {
          const localItem = localTransferList[i];
          if (pItem) {
            localItem.txIsFailed = Number(pItem.status) !== 1;
            if (localItem.status === TransferHistoryStatus.TRANSFER_SUBMITTING) {
              localItem.status = Number(pItem.status) === 1 ? localItem.status : TransferHistoryStatus.TRANSFER_FAILED;
            } else if (localItem.status === TransferHistoryStatus.TRANSFER_CONFIRMING_YOUR_REFUND) {
              localItem.status =
                Number(pItem.status) === 1 ? localItem.status : TransferHistoryStatus.TRANSFER_REFUND_TO_BE_CONFIRMED;
            }
          }
          return pItem;
        });
        noExitList = localTransferList ? dataClone(localTransferList) : [];
        hisList?.map(item => {
          localTransferList?.map((localItem, i) => {
            if (Number(localItem.ts) < Number(hisList[hisList.length - 1].ts)) {
              noExitList[i].hide = true;
            } else if (item.transfer_id === localItem.transfer_id) {
              noExitList[i].hide = true;
              if (localItem.status === TransferHistoryStatus.TRANSFER_CONFIRMING_YOUR_REFUND) {
                //如果本地是CONFIRMING，接口返回的是TO BE CONFIRMED
                if (item.status === TransferHistoryStatus.TRANSFER_REFUND_TO_BE_CONFIRMED) {
                  if (!localItem.txIsFailed) {
                    //没失败过就置成CONFIRMING，失败过就正常展示
                    item.status = TransferHistoryStatus.TRANSFER_CONFIRMING_YOUR_REFUND;
                  }
                  item.updateTime = localItem.updateTime;
                  item.txIsFailed = localItem.txIsFailed;
                }
              }
            }
            return localItem;
          });
          return item;
        });
        const newNoExitList = noExitList?.filter(item => !item.hide);
        newList = newNoExitList ? [...newNoExitList, ...hisList] : hisList;

        newList?.map(item => {
          if (
            item.status === TransferHistoryStatus.TRANSFER_TO_BE_REFUNDED ||
            item.status === TransferHistoryStatus.TRANSFER_REFUND_TO_BE_CONFIRMED
          ) {
            num += 1;
          }
          if (
            item.status !== TransferHistoryStatus.TRANSFER_UNKNOWN &&
            item.status !== TransferHistoryStatus.TRANSFER_FAILED &&
            item.status !== TransferHistoryStatus.TRANSFER_REFUNDED &&
            item.status !== TransferHistoryStatus.TRANSFER_COMPLETED
          ) {
            paddigNum += 1;
          }
          return item;
        });
        setHistoryTitleNum(num);
        setHistoryPaddingNum(paddigNum);
      });
    }
  };
  const getlphistoryList = async () => {
    let paddigNum = 0;
    let num = 0;
    const res = await lpHistory({ addr: address, page_size: 50, next_page_token: "" });
    if (res) {
      const lpList = res.history;
      let newList = lpList;
      let localLpList;
      let noExitList;
      const promiseList: Array<Promise<any>> = [];
      const localLpListStr = localStorage.getItem("LpList");
      if (localLpListStr) {
        localLpList = JSON.parse(localLpListStr)[address];
        const newLocalLpList: LPHistory[] = [];
        localLpList?.map((localItem, i) => {
          if (localItem && localItem !== "null") {
            newLocalLpList.push(localItem);
            if (localItem.status === LPHistoryStatus.LP_FAILED || localItem.txIsFailed) {
              //过滤已经失败的tx
              const nullPromise = new Promise(resolve => {
                resolve(0);
              });
              promiseList.push(nullPromise);
            } else {
              const promistx = getTxStatus(localItem.block_tx_link);
              promiseList.push(promistx);
            }
          } else {
            localLpList.splice(i, 1);
          }
        });
        localLpList = newLocalLpList;
      }
      Promise.all(promiseList).then(resList => {
        resList?.map((pItem, i) => {
          const localItem = localLpList[i];
          if (pItem) {
            localItem.txIsFailed = Number(pItem.status) !== 1;
            if (localItem.type === LPType.LP_TYPE_ADD) {
              localItem.status = Number(pItem.status) === 1 ? LPHistoryStatus.LP_SUBMITTING : LPHistoryStatus.LP_FAILED;
            } else if (localItem.type === LPType.LP_TYPE_REMOVE) {
              localItem.status =
                Number(pItem.status) === 1 ? LPHistoryStatus.LP_SUBMITTING : LPHistoryStatus.LP_WAITING_FOR_LP;
            }
          }
          return pItem;
        });
        noExitList = localLpList ? dataClone(localLpList) : [];
        lpList?.map(item => {
          localLpList?.map((localItem, i) => {
            if (Number(localItem.ts) < Number(localLpList[localLpList.length - 1])) {
              noExitList[i].hide = true;
            } else {
              if (
                (Number(item.nonce) === Number(localItem.nonce) && item.type === LPType.LP_TYPE_ADD) ||
                (Number(item.seq_num) === Number(localItem.seq_num) && item.type === LPType.LP_TYPE_REMOVE)
              ) {
                if (noExitList[i]) {
                  noExitList[i].hide = true;
                }
                if (item.type === LPType.LP_TYPE_REMOVE) {
                  if (item.status === LPHistoryStatus.LP_WAITING_FOR_LP) {
                    if (!localItem.txIsFailed) {
                      //如果没失败过
                      item.status = LPHistoryStatus.LP_SUBMITTING;
                    }
                    item.updateTime = localItem.updateTime;
                    item.txIsFailed = localItem.txIsFailed;
                    item.block_tx_link = item.block_tx_link ? item.block_tx_link : localItem.block_tx_link;
                  }
                }
              }
            }
            return localItem;
          });
          return item;
        });

        const newNoExitList = noExitList?.filter(item => !item.hide);
        newList = newNoExitList ? [...newNoExitList, ...lpList] : lpList;

        newList?.map(item => {
          if (item.status === LPHistoryStatus.LP_WAITING_FOR_LP) {
            num += 1;
          }
          if (
            item.status !== LPHistoryStatus.LP_COMPLETED &&
            item.status !== LPHistoryStatus.LP_FAILED &&
            item.status !== LPHistoryStatus.LP_UNKNOWN
          ) {
            paddigNum += 1;
          }
          return item;
        });
        setLpTitleNum(num);
        setLpPaddingNum(paddigNum);
      });
    }
  };
  useEffect(() => {
    const totalnum = lpTitleNum + historyTitleNum;
    const totalpaddingnum = lpPaddingNum + historyPaddingNum;
    dispatch(setTotalActionNum(totalnum));
    dispatch(setTotalPaddingNum(totalpaddingnum));
  }, [lpTitleNum, historyTitleNum, historyPaddingNum, lpPaddingNum]);
  useEffect(() => {
    if (chainId) {
      const chainName = getNetworkById(chainId).name;
      localStorage.setItem("chainName", chainName);
    }
  }, [chainId]);

  const getQueryString = name => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = history.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  };

  const getDefaultData = (chains, chain_token, sourceChainId, destinationChainId, tokenSymbol) => {
    let sourceChain;
    let destinChain;
    let token;
    const defaultFromChains = chains.filter(item => Number(item.id) === Number(sourceChainId));
    if (defaultFromChains.length > 0) {
      sourceChain = defaultFromChains[0];
    }
    const defaultToChains = chains.filter(item => Number(item.id) === Number(destinationChainId));
    if (defaultToChains.length > 0) {
      destinChain = defaultToChains[0];
    }
    return { sourceChain, destinChain };
  };

  const sortTokenList = (list: TokenInfo[]) => {
    const result: TokenInfo[] = [];
    const normalList: TokenInfo[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].token.symbol === "WETH") {
        if (result.find(item => ["USDC", "USDT"].includes(item.token.symbol))) {
          result.push(list[i]);
        } else {
          result.unshift(list[i]);
        }
      } else if (list[i].token.symbol === "USDC") {
        if (result.find(item => ["USDT"].includes(item.token.symbol))) {
          result.push(list[i]);
        } else {
          result.unshift(list[i]);
        }
      } else if (list[i].token.symbol === "USDT") {
        result.unshift(list[i]);
      } else {
        normalList.push(list[i]);
      }
    }
    const sortList = normalList.sort((a, b) => {
      if (a.token.symbol < b.token.symbol) {
        return -1;
      }
      if (a.token.symbol > b.token.symbol) {
        return 1;
      }
      return 0;
    });
    return result.concat(sortList);
  };

  const setDefaultInfo = useCallback(
    (chains, chain_token, peggedPairConfigs: PeggedPairConfig[], chainId) => {
      if (chains.length > 1) {
        const cacheFromChainId = localStorage.getItem("fromChainId");
        const cacheToChainId = localStorage.getItem("toChainId");
        const cacheTokenSymbol = localStorage.getItem("selectedTokenSymbol");
        const dataInfo = getDefaultData(chains, chain_token, cacheFromChainId, cacheToChainId, cacheTokenSymbol); //get info by id
        const { sourceChain, destinChain } = dataInfo;
        const cacheFromChain = sourceChain;
        const cacheToChain = destinChain;
        let defaultFromChain;
        let defaultToChain;
        let defaultToken;

        if (history.location.search) {
          const sourceChainId = Number(getQueryString("sourceChainId"));
          const destinationChainId = Number(getQueryString("destinationChainId"));
          const tokenSymbol = getQueryString("tokenSymbol");
          localStorage.setItem("fromChainId", sourceChainId.toString() || "");
          localStorage.setItem("toChainId", destinationChainId.toString() || "");
          localStorage.setItem("selectedTokenSymbol", tokenSymbol || "");
          localStorage.setItem("sourceFromUrl", "1");
          history.push("/transfer");
        } else if (!history.location.search && chainId) {
          const isSourceFromUrl = localStorage.getItem("sourceFromUrl");
          const chainInfo = chains.filter(item => Number(item.id) === chainId);
          //处理fromChain
          if (isSourceFromUrl === "1") {
            //处理url有参数
            if (cacheFromChain && cacheFromChain !== "undefined") {
              const localFromChain = cacheFromChain;
              const newLocalFromCahinInfo = chains.filter(item => Number(item.id) === localFromChain.id);
              if (newLocalFromCahinInfo.length > 0) {
                //本地记录的chainId，项目里支持
                defaultFromChain = localFromChain;
              } else {
                defaultFromChain = chains[0];
              }
            }
          } else {
            if (chainInfo.length > 0) {
              defaultFromChain = chainInfo[0];
            } else {
              defaultFromChain = chains[0];
            }
            if (cacheFromChain && cacheFromChain !== "undefined") {
              const localFromChain = cacheFromChain;
              const newLocalFromCahinInfo = chains.filter(item => Number(item.id) === localFromChain.id);
              if (localFromChain.id !== chainId) {
                if (chainInfo.length > 0) {
                  defaultFromChain = chainInfo[0];
                } else {
                  if (newLocalFromCahinInfo.length > 0) {
                    //本地记录的chainId，项目里支持
                    defaultFromChain = localFromChain;
                  } else {
                    defaultFromChain = chains[0];
                  }
                }
              }
            }
          }

          //处理toChain
          defaultToChain = chains[1];
          if (cacheToChain && cacheToChain !== "undefined") {
            defaultToChain = cacheToChain;
            const newLocalToCahinInfo = chains.filter(item => Number(item.id) === defaultToChain.id);
            if (newLocalToCahinInfo.length > 0 && isSourceFromUrl !== "1") {
              if (Number(defaultToChain.id) === Number(chainId) && cacheFromChain) {
                defaultToChain = cacheFromChain;
              }
            }
          }
          localStorage.setItem("sourceFromUrl", "0");
        } else {
          //这里是为了 在没有链接钱包情况下显示 fromchain 和tochain
          if (cacheFromChain) {
            defaultFromChain = cacheFromChain;
          } else {
            defaultFromChain = chains[0];
          }
          if (cacheToChain) {
            defaultToChain = cacheToChain;
          } else {
            defaultToChain = chains[1];
          }
        }
        //有了fromChain以后统一处理token
        if (defaultFromChain) {
          const defalutTokenList = chain_token[defaultFromChain.id]?.token;
          let defaultToken;
          const defaultTokens = defalutTokenList?.filter(item => item.token.symbol === cacheTokenSymbol);
          if (defaultTokens.length > 0) {
            defaultToken = defaultTokens[0];
          } else {
            defaultToken = defalutTokenList[0];
          }

          //设置值
          dispatch(setFromChain(defaultFromChain));
          dispatch(setToChain(defaultToChain));
          dispatch(setCBridgeDesAddresses(defaultToChain?.contract_addr));
          dispatch(setCBridgeAddresses(defaultFromChain?.contract_addr));
          dispatch(setTokenList(defalutTokenList));
          dispatch(setSelectedToken(defaultToken));
        }
      }
    },
    [dispatch, chainId],
  );

  const handleSelectChain = (id: number) => {
    if (chainSource === "from") {
      if (id !== chainId) {
        switchMethod(id, "");
      }
    } else if (chainSource === "to") {
      setToChainMethod(id);
    } else if (chainSource === "wallet") {
      if (id !== chainId) {
        switchMethod(id, "");
      }
    } else if (chainSource === "SingleChain") {
      const newList = dataClone(singleChainList);
      lpList?.map(item => {
        if (item?.chain.id === id && item?.token.token.symbol === selectedLP?.token.token.symbol) {
          newList[singleChainSelectIndex]["totalLiquidity"] = item.liquidity_amt;
          newList[singleChainSelectIndex]["token_addr"] = item?.token.token.address;
          newList[singleChainSelectIndex]["chain"] = item?.chain;
          newList[singleChainSelectIndex]["token"] = item?.token.token;
          newList[singleChainSelectIndex]["stimatedReceived"] = "0";
          newList[singleChainSelectIndex]["bridgeRate"] = "0";
          newList[singleChainSelectIndex]["fee"] = "0";
          newList[singleChainSelectIndex]["errorMsg"] = "";
          newList[singleChainSelectIndex]["ratio"] = "0";
        }
      });
      newList[singleChainSelectIndex]["from_chain_id"] = id;
      dispatch(setSingleChainList(newList));
    }
    dispatch(setIsChainShow(false));
  };

  const switchMethod = (paramChainId, paramToken) => {
    switchChain(paramChainId, paramToken);
    const newTokenList: TokenInfo[] = chain_token[chainId]?.token;
    dispatch(setTokenList(newTokenList));
    if (newTokenList) {
      const cacheTokensymbol = localStorage.getItem("selectedTokenSymbol");
      const cacheTokenList = newTokenList.filter(item => item.token.symbol === cacheTokensymbol);
      if (cacheTokenList.length > 0) {
        dispatch(setSelectedToken(cacheTokenList[0]));
      } else {
        dispatch(setSelectedToken(newTokenList[0]));
      }
    }
  };

  const setToChainMethod = (id?: number) => {
    if (!chains || !chain_token || !chains.length) {
      return;
    }
    const targetToChain: Chain =
      chains.find(chain => chain.id === id) || chains.find(chain => chain.id !== fromChain?.id) || chains[0];
    if (targetToChain) {
      const cacheTochainInfo = JSON.stringify(targetToChain);
      dispatch(setToChain(targetToChain));
      dispatch(setCBridgeDesAddresses(targetToChain?.contract_addr));
    }
  };

  /**
   * 进入页面应该就要请求一次transfer config接口，获取设置bridge相关的address
   */

  useEffect(() => {
    getTransferConfigs().then(res => {
      if (res) {
        const { chains, chain_token, farming_reward_contract_addr, pegged_pair_configs } = res;
        chains.forEach(chain => {
          const { id } = chain;
          chain_token[id].token = sortTokenList(chain_token[id].token);
        });

        const localChains = Object.values(NETWORKS);
        const filteredChains = chains.filter(item => {
          const filterLocalChains = localChains.filter(localChainItem => localChainItem.chainId === item.id);
          return filterLocalChains.length > 0;
        });

        dispatch(
          setTransferConfig({
            chains: filteredChains,
            chain_token,
            farming_reward_contract_addr,
            pegged_pair_configs,
          }),
        );
        dispatch(
          setConfig({
            chains: filteredChains,
            chain_token,
            farming_reward_contract_addr,
            pegged_pair_configs,
          }),
        );
        dispatch(setFarmingRewardAddresses(farming_reward_contract_addr));
        dispatch(setGetConfigsFinish(true));
        // 设置默认信息
        setDefaultInfo(filteredChains, chain_token, pegged_pair_configs, chainId);
      } else {
        message.error("Interface error !");
      }
    });
  }, [dispatch, setDefaultInfo]);
  return (
    <div className={classes.app}>
      <Layout className={classes.layout}>
        <Header />
        <div className="smallTabBodyOut">
          <div className="smallTabBody">
            <ViewTab />
          </div>
        </div>
        <Content className={classes.content}>
          <Switch>
            <Route path="/transfer">
              {/* <History /> */}
              <NewTransfer />
            </Route>
            <Route path="/liquidity">
              <Liquidity />
            </Route>
            <Route path="/rewards">
              <Rewards />
            </Route>
            <Redirect from="/" to="/transfer" />
          </Switch>
        </Content>
        <Footer className={classes.footer}>
          <div className={classes.footerContent}>
            <FooterContent />
          </div>
        </Footer>
      </Layout>
      <ChainList
        visible={isChainShow}
        onSelectChain={handleSelectChain}
        onCancel={() => dispatch(setIsChainShow(false))}
      />
      <HistoryModal visible={showHistoryModal} onCancel={handleCloseHistoryModal} />
      <ProviderModal visible={showProviderModal} onCancel={handleCloseProviderModal} />
    </div>
  );
}

export default Home;
