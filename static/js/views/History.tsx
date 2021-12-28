/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
import { FC, useEffect, useState, useContext } from "react";
import { Menu, Tooltip, Button, Spin } from "antd";
import { createUseStyles } from "react-jss";
import _ from "lodash";
import moment from "moment";
import {
  WarningFilled,
  InfoCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useWeb3Context } from "../providers/Web3ContextProvider";
import { Theme } from "../theme";
import errorMessages from "../constants/errorMessage";
import { formatDecimal } from "../helpers/format";
import { transferHistory, lpHistory } from "../redux/gateway";
import { TransferHistoryStatus, LPHistoryStatus, TransferHistory, LPHistory } from "../constants/type";
import { useAppSelector } from "../redux/store";
import { switchChain, addChainToken } from "../redux/transferSlice";
import { ColorThemeContext } from "../providers/ThemeProvider";
import HistoryTransferModal from "./HistoryTransferModal";
import HistoryLPModal from "./HistoryLPModal";
import PageFlipper from "../components/PageFlipper";
import meta from "../images/meta.svg";
import { LPType } from "../proto/sgn/gateway/v1/gateway_pb";
import { getTokenDisplaySymbol, needToChangeTokenDisplaySymbol } from "./transfer/TransferOverview";
import { getTokenSymbol } from "../redux/assetSlice";
import runRightIconDark from "../images/runRightDark.svg";
import runRightIconLight from "../images/runRightLight.svg";
import { dataClone } from "../helpers/dataClone";
import { usePeggedPairConfig } from "../hooks/usePeggedPairConfig";

/* eslint-disable*/
const defaultPageSize = 5;

const upgradeTipText =
  "cBridge v2 upgrade is completed on 12/03/2021. If you are looking for transfer history or liquidity history before upgrade, please visit this ";

const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  flexCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  menu: {
    width: props => (props.isMobile ? "100%" : 416),
    height: 44,
    background: theme.primaryUnable,
    borderRadius: 8,
    border: "none",
    "& .ant-menu-item": {
      flexGrow: 1,
      flexBasis: 0,
      textAlign: "center",
      margin: "2px !important",
      fontSize: 16,
      borderRadius: 8,
      top: 0,
      lineHeight: "38px",
      padding: props => (props.isMobile ? "0 !important" : ""),
      "&:hover": {
        color: theme.surfacePrimary,
      },
    },
    "& .ant-menu-item::after": {
      borderBottom: "0 !important",
    },
    "& .ant-menu-item div": {
      color: theme.secondBrand,
      fontWeight: 700,
      fontSize: "16px",
      "&:hover": {
        color: theme.primaryBrand,
      },
    },
    "& .ant-menu-item-selected": {
      background: theme.primaryBrand,
    },
    "& .ant-menu-item-selected:hover": {
      background: theme.primaryBrand,
      color: "#fff !important",
    },
    "& .ant-menu-item-selected div": {
      color: theme.unityWhite,
      "&:hover": {
        color: `${theme.unityWhite} !important`,
      },
    },
  },
  headerTip: {
    marginTop: 16,
    padding: "8px 17px",
    fontSize: 16,
    width: "100%",
    background: theme.unityWhite,
    display: "flex",
    alignItems: "center",
    boxShadow: "0px 6px 12px -6px rgba(24, 39, 75, 0.12), 0px 8px 24px -4px rgba(24, 39, 75, 0.08)",
    borderRadius: 8,
  },
  mobileHeaderTip: {
    marginTop: 14,
    marginBottom: 20,
    padding: "8px 12px",
    fontSize: 16,
    lineHeight: "20px",
    background: theme.unityWhite,
    display: "flex",
    alignItems: "center",
    boxShadow: "0px 6px 12px -6px rgba(24, 39, 75, 0.12), 0px 8px 24px -4px rgba(24, 39, 75, 0.08)",
    borderRadius: 8,
  },
  headerTipImg: props =>
    props.isMobile
      ? {
          width: 18,
          height: 18,
        }
      : {
          width: 30,
          height: 30,
        },
  headerTipText: props =>
    props.isMobile
      ? {
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: "600",
          color: theme.unityBlack,
          paddingLeft: 11,
        }
      : {
          fontSize: 16,
          lineHeight: "19px",
          fontWeight: "bold",
          color: theme.unityBlack,
          paddingLeft: 13,
        },
  tipLink: {
    color: "#3366FF",
  },
  historyBody: {
    width: 786,
    padding: "72px 8px",
    background: theme.globalBg,
    borderRadius: 16,
    border: `1px solid ${theme.primaryBorder}`,
    boxSizing: "border-box",
    boxShadow: "0px 4px 17px rgba(51, 102, 255, 0.1), 0px 8px 10px rgba(51, 102, 255, 0.1)",
  },
  mobileHistoryBody: {
    width: "100%",
    height: "100%",
    overflowY: "scroll",
    padding: "32px 16px",
  },
  historyList: {},
  ListItem: {
    width: "100%",
    background: theme.secondBackground,
    marginTop: 16,
    borderRadius: 16,
    padding: "24px 16px 10px 16px",
  },

  itemtitle: {
    display: "flex",
    alignItems: "center",
  },
  turnRight: {
    width: 20,
    height: 18,
    margin: "0 10px",
  },
  txIcon: {
    width: 27,
    height: 27,
    borderRadius: "50%",
  },
  itemTime: {
    fontSize: 12,
    color: theme.secondBrand,
    textAlign: props => (props.isMobile ? "left" : "right"),
    fontWeight: 400,
  },
  reducetxnum: {
    fontSize: props => (props.isMobile ? 12 : 14),
    color: theme.infoDanger,
    lineHeight: 1,
  },
  receivetxnum: {
    fontSize: props => (props.isMobile ? 12 : 14),
    color: theme.infoSuccess,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },
  waring: {
    color: theme.infoWarning,
    fontSize: 14,
  },
  failed: {
    color: theme.infoDanger,
    fontSize: 14,
  },
  completed: {
    color: theme.infoSuccess,
    fontSize: 14,
  },
  canceled: {
    color: theme.infoWarning,
    fontSize: 14,
  },
  itemcont: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  mobileItemContent: {
    display: "grid",
    alignItems: "center",
    gridTemplateColumns: "repeat(1, 1fr)",
  },
  itemLeft: {
    display: "flex",
    justifyContent: props => (props.isMobile ? "space-between" : "flex-start"),
    alignItems: "center",
  },
  itemRight: {
    marginBottom: 0,
    textAlign: "right",
    alignItems: "center",
    justifyContent: "space-between",
    maxHeight: "40px",
  },
  mobileItemRight: {
    marginTop: 20,
    marginBottom: 0,
    textAlign: props => "left",
    alignItems: "center",
    justifyContent: "space-between",
  },
  showSuppord: {
    transform: "translateY(-21%)",
  },
  chainName: {
    fontSize: props => (props.isMobile ? 12 : 14),
    color: theme.surfacePrimary,
    lineHeight: 1,
  },
  linktitle: {
    fontSize: props => (props.isMobile ? 12 : 14),
    color: theme.surfacePrimary,
  },
  chainName2: {
    fontSize: 14,
    color: theme.surfacePrimary,
    lineHeight: 1,
  },
  chaindes: {
    marginLeft: 6,
  },
  submitBtn: {
    background: theme.primaryBrand,
    borderColor: theme.primaryBrand,
    fontWeight: "bold",
    borderRadius: props => (props.isMobile ? 4 : 2),
    marginTop: props => (props.isMobile ? 14 : 0),
  },
  empty: {
    height: 480,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.surfacePrimary,
    fontSize: 15,
  },
  linkIcon: {
    fontSize: 14,
    marginLeft: 0,
  },
  numdot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "1px solid #fff",
    backgroundColor: theme.infoDanger,
    color: "#fff !important",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    fontSize: "12px !important",
  },
  tabtitle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  rebutton: {
    position: "absolute",
    top: 7,
    right: 4,
    zIndex: 10,
    "&.ant-btn": {
      boxShadow: "none",
      border: "none",
      background: "transparent",
      color: theme.secondBrand,
      opacity: 0.7,
      "&:focus, &:hover": {
        border: "none",
        color: theme.surfacePrimary,
        opacity: 0.9,
      },
    },
  },
  mobileTooltipOverlayStyle: {
    "& .ant-tooltip-inner": {
      width: "calc(100vw - 40px)",
      borderRadius: 8,
    },
    "& .ant-tooltip-arrow-content": {
      width: 9,
      height: 9,
    },
  },
  singlText: {
    fontSize: 14,
    lineHeight: "20px",
    color: theme.surfacePrimary,
  },
  blueText: {
    clolor: theme.primaryReduce,
  },
  disableTooltip: {
    position: "absolute",
    top: 40,
    right: 0,
    zIndex: 100,
    borderRadius: 8,
  },
  disableTooltipTran: {
    width: 9,
    height: 9,
    position: "absolute",
    top: -11,
    left: 32,
    zIndex: 100,
    background: "rgb(255, 255, 255)",
    boxShadow: "-3px -3px 7px rgb(0 0 0 / 7%)",
    transform: "translateY(6.53553391px) rotate(45deg)",
  },
  disableTooltipbody: {
    width: 290,
    fontSize: 12,
    borderRadius: 8,
    textAlign: "left",
    padding: "8px 12px",
    color: "rgb(10, 30, 66)",
    background: "rgb(255, 255, 255)",
    position: "relative",
  },
  whiteSpinblur: {
    "& .ant-spin-blur": {
      opacity: 0.5,
    },
    "& .ant-spin-blur::after": {
      opacity: 0.5,
    },
    "& .ant-spin-container::after": {
      background: "#f6f7fd",
    },
  },
  spinblur: {
    "& .ant-spin-blur": {
      opacity: 0.4,
    },
    "& .ant-spin-blur::after": {
      opacity: 0.4,
    },
    "& .ant-spin-container::after": {
      background: "#2c2c2c",
    },
  },
}));
const tooltipShowTime = process.env.REACT_APP_ENV === "TEST" ? 1 : 15; //m

const History: FC = () => {
  const { themeType } = useContext(ColorThemeContext);
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const [fetchedTransferHistory, setFetchedTransferHistory] = useState(false);
  const [fetchedLiquidityHistory, setFetchedLiquidityHistory] = useState(false);
  const [historykey, setHistorykey] = useState("transfer_history");
  const { address, chainId, provider } = useWeb3Context();
  const now = new Date().getTime();
  const [nexPageToken, setNexPageToken] = useState(0);
  const [historyList, setHistoryList] = useState<TransferHistory[]>([]);
  const [liquidityList, setLiquidityList] = useState<LPHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(defaultPageSize);
  const [historyTitleNum, setHistoryTitleNum] = useState(0);
  const [lpTitleNum, setLpTitleNum] = useState(0);
  const [historyPaddingNum, setHistoryPaddingNum] = useState(0);
  const [lpPaddingNum, setLpPaddingNum] = useState(0);
  const [pageMap, setPageMap] = useState({ 0: now });
  const [showModal, setShowModal] = useState(false);
  const [showLPModal, setShowLPModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LPHistory>();
  const [hisLoading, setHisLoading] = useState(false);
  const [lpLoading, setLpLodaing] = useState(false);

  const getTxStatus = async link => {
    const txid = link.split("/tx/")[1];
    if (txid) {
      const res = await provider?.getTransactionReceipt(txid);
      return res;
    } else {
      return "";
    }
  };
  const setPageMapJson = (cPage, stemp) => {
    const oldPageMap = dataClone(pageMap);
    oldPageMap[cPage + 1] = stemp;
    setPageMap(oldPageMap);
  };

  const checkLocalHistoryList = (hisList, pMap, cPage) => {
    let paddigNum = 0;
    let num = 0;
    const promiseList: Array<Promise<any>> = [];
    let newList = hisList;
    let localTransferList;
    let noExitList;
    let localList;
    const localTransferListStr = localStorage.getItem("transferListJson");
    if (localTransferListStr) {
      localTransferList = JSON.parse(localTransferListStr)[address];
      const newLocalTransferList: TransferHistory[] = [];
      localTransferList?.forEach(localItem => {
        if (localItem && localItem !== "null") {
          newLocalTransferList.push(localItem);
          if (
            localItem?.status === TransferHistoryStatus.TRANSFER_FAILED ||
            localItem?.txIsFailed ||
            Number(localItem.src_send_info.chain.id) !== Number(chainId)
          ) {
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
          }
          // else if (localItem.status === TransferHistoryStatus.TRANSFER_CONFIRMING_YOUR_REFUND) {
          //   localItem.status =
          //     Number(pItem.status) === 1 ? localItem.status : TransferHistoryStatus.TRANSFER_REFUND_TO_BE_CONFIRMED;
          // }
        }
        return pItem;
      });
      localList = localTransferList ? dataClone(localTransferList) : [];
      noExitList = localTransferList ? dataClone(localTransferList) : [];
      hisList?.map(item => {
        localTransferList?.map((localItem, i) => {
          if (Number(localItem.ts) >= Number(pMap[cPage])) {
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
              } else {
                localList[i].hide = true;
              }
            } else {
              localList[i].hide = true;
            }
          }
          return localItem;
        });
        return item;
      });
      const newNoExitList = noExitList?.filter(item => !item.hide);
      const newLocalList = localList?.filter(item => !item.hide);
      const newJson = { [address]: newLocalList };
      localStorage.setItem("transferListJson", JSON.stringify(newJson));
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
      newList.sort((a, b) => Number(b.ts) - Number(a.ts));
      if (newList.length > 0) {
        const arrList: TransferHistory[][] = _.chunk(newList, 5);
        const nowList = arrList[0];
        const timeStr = nowList[nowList.length - 1].ts.toString();
        setPageMapJson(cPage, timeStr);
        setHistoryTitleNum(num);
        setHistoryPaddingNum(paddigNum);
        setHistoryList(nowList);
      } else {
        setHistoryTitleNum(0);
        setHistoryPaddingNum(0);
        setHistoryList([]);
      }
      setFetchedTransferHistory(true);
      newList.sort((a, b) => Number(b.ts) - Number(a.ts));
      if (newList.length > 0) {
        const arrList: TransferHistory[][] = _.chunk(newList, 5);
        const nowList = arrList[0];
        const timeStr = nowList[nowList.length - 1].ts.toString();
        setPageMapJson(cPage, timeStr);
        setHistoryTitleNum(num);
        setHistoryPaddingNum(paddigNum);
        setHistoryList(nowList);
      } else {
        setHistoryTitleNum(0);
        setHistoryPaddingNum(0);
        setHistoryList([]);
      }
      setFetchedTransferHistory(true);
      setHisLoading(false);
    });
  };

  const gethistoryList = async (next_page_token, pMap = pageMap, cPage = currentPage) => {
    setHisLoading(true);
    const res = await transferHistory({ addr: address, page_size: defaultPageSize, next_page_token });
    if (res) {
      if (historykey === "transfer_history") {
        setSize(res?.current_size);
      }
      //处理本地记录
      let newList = res.history;
      checkLocalHistoryList(newList, pMap, cPage);
    }
  };

  const getlphistoryList = async (next_page_token, pMap = pageMap, cPage = currentPage) => {
    let paddigNum = 0;
    setLpLodaing(true);
    const res = await lpHistory({ addr: address, page_size: defaultPageSize, next_page_token });
    const promiseList: Array<Promise<any>> = [];
    if (res) {
      if (historykey === "liquidity_history") {
        setSize(res?.current_size);
      }
      const lpList = res.history;
      let num = 0;
      let newList = lpList;
      let localLpList;
      let noExitList;
      let localList;
      const localLpListStr = localStorage.getItem("LpList");
      if (localLpListStr) {
        localLpList = JSON.parse(localLpListStr)[address];
        const newLocalLpList: LPHistory[] = [];
        localLpList?.forEach(localItem => {
          if (localItem && localItem !== "null") {
            newLocalLpList.push(localItem);
            if (
              localItem?.status === LPHistoryStatus.LP_FAILED ||
              localItem?.txIsFailed ||
              Number(localItem.chain.id) !== Number(chainId)
            ) {
              //过滤已经失败的tx
              const nullPromise = new Promise(resolve => {
                resolve(0);
              });
              promiseList.push(nullPromise);
            } else {
              const promistx = getTxStatus(localItem.block_tx_link);
              promiseList.push(promistx);
            }
          }
        });
        localLpList = newLocalLpList;
      }
      Promise.all(promiseList).then(resList => {
        console.log("resList", resList);
        resList?.map((pItem, i) => {
          const localItem = localLpList[i];
          if (pItem) {
            localItem.txIsFailed = Number(pItem.status) !== 1;
            if (localItem.type === LPType.LP_TYPE_ADD) {
              localItem.status = Number(pItem.status) === 1 ? LPHistoryStatus.LP_SUBMITTING : LPHistoryStatus.LP_FAILED;
            }
            //  else if (localItem.type === LPType.LP_TYPE_REMOVE) {
            //   localItem.status =
            //     Number(pItem.status) === 1 ? LPHistoryStatus.LP_SUBMITTING : LPHistoryStatus.LP_WAITING_FOR_LP;
            // }
          }
          return pItem;
        });

        localList = localLpList ? dataClone(localLpList) : [];
        noExitList = localLpList ? dataClone(localLpList) : [];
        lpList?.map(item => {
          localLpList?.map((localItem, i) => {
            if (Number(localItem.ts) >= Number(pMap[cPage])) {
              noExitList[i].hide = true;
            } else {
              if (
                (Number(item.nonce) === Number(localItem.nonce) && item.type === LPType.LP_TYPE_ADD) ||
                (Number(item.seq_num) === Number(localItem.seq_num) && item.type === LPType.LP_TYPE_REMOVE)
              ) {
                if (noExitList[i]) {
                  noExitList[i].hide = true;
                }
                if (item.type === LPType.LP_TYPE_ADD) {
                  localList[i].hide = true;
                } else if (item.type === LPType.LP_TYPE_REMOVE) {
                  if (item.status === LPHistoryStatus.LP_WAITING_FOR_LP) {
                    if (!localItem.txIsFailed) {
                      //如果没失败过
                      item.status = LPHistoryStatus.LP_SUBMITTING;
                    }
                    item.updateTime = localItem.updateTime;
                    item.txIsFailed = localItem.txIsFailed;
                    item.block_tx_link = item.block_tx_link ? item.block_tx_link : localItem.block_tx_link;
                  } else {
                    localList[i].hide = true;
                  }
                }
              }
            }
            return localItem;
          });
          return item;
        });

        const newNoExitList = noExitList?.filter(item => !item.hide);
        const newLocalList = localList?.filter(item => !item.hide);
        newList = newNoExitList ? [...newNoExitList, ...lpList] : lpList;
        const newJson = { [address]: newLocalList };
        localStorage.setItem("LpList", JSON.stringify(newJson));
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
        newList.sort((a, b) => Number(b.ts) - Number(a.ts));
        if (newList.length > 0) {
          const arrList: LPHistory[][] = _.chunk(newList, 5);
          const nowList = arrList[0];
          const timeStr = nowList[nowList.length - 1].ts.toString();
          setPageMapJson(cPage, timeStr);
          setLpTitleNum(num);
          setLpPaddingNum(paddigNum);
          setLiquidityList(nowList);
        } else {
          setLpTitleNum(0);
          setLpPaddingNum(0);
          setLiquidityList([]);
        }
        setFetchedLiquidityHistory(true);
        setLpLodaing(false);
      });
    }
  };

  useEffect(() => {
    setNexPageToken(now);
    const newpMap = { 0: now };
    setPageMap(newpMap);
    setCurrentPage(0);
    if (!showModal) {
      gethistoryList(now.toString(), newpMap, 0);
    }
    if (!showLPModal) {
      getlphistoryList(now.toString(), newpMap, 0);
    }
  }, [historykey, showModal, showLPModal]);

  useEffect(() => {
    if (nexPageToken !== 0) {
      if (historykey === "transfer_history") {
        gethistoryList(nexPageToken);
      } else {
        getlphistoryList(nexPageToken);
      }
    }
  }, [nexPageToken]);

  const reloadHisList = () => {
    if (historykey === "transfer_history") {
      gethistoryList(currentPage === 0 ? now : pageMap[currentPage]);
    } else {
      getlphistoryList(currentPage === 0 ? now : pageMap[currentPage]);
    }
  };

  useEffect(() => {
    if (!fetchedTransferHistory || !fetchedLiquidityHistory) {
      return;
    }
    let hasActionInTranster = historyTitleNum > 0;
    let hasActionInLiquidity = lpTitleNum > 0;
    let hasPendingInTransfer = historyPaddingNum > 0;
    let hasPendingInLiquidity = lpPaddingNum > 0;
    let hasHistoryInTranster = historyList.length > 0;
    let hasHistoryInLiquidity = liquidityList.length > 0;

    // Action Required > No Action Required
    // Pending > No Pending
    // History > No History
    // Transfer > Liquidity
    let transferDefaultPriority = 1;
    let liquidityDefaultPriority = 0;
    let hasHistoryPriority = 10;
    let hasPendingPriority = 100;
    let hasActionPriority = 1000;
    let transferPriority = 0;
    let liquidityPriority = 0;

    transferPriority += transferDefaultPriority;
    liquidityPriority += liquidityDefaultPriority;
    if (hasHistoryInTranster) {
      transferPriority += hasHistoryPriority;
    }
    if (hasHistoryInLiquidity) {
      liquidityPriority += hasHistoryPriority;
    }
    if (hasPendingInTransfer) {
      transferPriority += hasPendingPriority;
    }
    if (hasPendingInLiquidity) {
      liquidityPriority += hasPendingPriority;
    }
    if (hasActionInTranster) {
      transferPriority += hasActionPriority;
    }
    if (hasActionInLiquidity) {
      liquidityPriority += hasActionPriority;
    }
    if (liquidityPriority > transferPriority) {
      setHistorykey("liquidity_history");
    } else {
      setHistorykey("transfer_history");
    }
  }, [fetchedTransferHistory, fetchedLiquidityHistory]);

  const clearLpLocalData = item => {
    const localLpListStr = localStorage.getItem("LpList");
    let localList;
    if (localLpListStr) {
      const localLpList = JSON.parse(localLpListStr)[address];
      localList = localLpList ? dataClone(localLpList) : [];
      localLpList?.map(async (localItem, i) => {
        if (
          (Number(item.nonce) === Number(localItem.nonce) && item.type === LPType.LP_TYPE_ADD) ||
          (Number(item.seq_num) === Number(localItem.seq_num) && item.type === LPType.LP_TYPE_REMOVE)
        ) {
          localList.splice(i, 1);
        }
        return localItem;
      });
    }
    const newJson = { [address]: localList };
    localStorage.setItem("LpList", JSON.stringify(newJson));
    reloadHisList();
  };

  const clearHistoryLocalData = item => {
    const transferListStr = localStorage.getItem("transferListJson");
    let localList;
    if (transferListStr) {
      const transferList = JSON.parse(transferListStr)[address];
      localList = transferList ? dataClone(transferList) : [];
      transferList?.map(async (localItem, i) => {
        if (item.transfer_id === localItem.transfer_id) {
          localList.splice(i, 1);
        }
        return localItem;
      });
    }
    const newJson = { [address]: localList };
    localStorage.setItem("transferListJson", JSON.stringify(newJson));
    reloadHisList();
  };
  const onPageChange = page => {
    const oldPageMap = dataClone(pageMap);
    if (page === 0) {
      oldPageMap[0] = now;
      setNexPageToken(now);
    } else {
      setNexPageToken(oldPageMap[page]);
    }
    setCurrentPage(page);
    setPageMap(oldPageMap);
  };

  const tipsStatus = item => {
    let lab;
    const nowDate = new Date().getTime();
    const showResult = nowDate - Number(item.updateTime || item.ts) <= tooltipShowTime * 60 * 1000;
    switch (item.status) {
      case TransferHistoryStatus.TRANSFER_SUBMITTING:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              showResult ? (
                <span>
                  Your transfer is being confirmed on {item.src_send_info.chain.name}. Please allow{" "}
                  {item.src_send_info.chain.block_delay} block confirmations (a few minutes) for your transfer request
                  to be confirmed.
                </span>
              ) : (
                <div>
                  It seems that your transaction has been stuck for more than 15 minutes.
                  <div style={{ marginLeft: 10, marginTop: 15 }}>
                    <div style={{ display: "flex", alignItems: "baseline" }}>
                      <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                      <div>
                        {" "}
                        If your on-chain tx has completed, please{" "}
                        <a
                          href={`https://form.typeform.com/to/Q4LMjUaK#srctx=${item.src_block_tx_link}&transferid=${item.transfer_id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          contact support
                        </a>{" "}
                        for help.
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                        <div>
                          {" "}
                          If your on-chain tx is still pending, you may speed up your transaction by increasing the gas
                          price.{" "}
                        </div>
                      </div>
                    </div>
                    {item.isLocal && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", alignItems: "baseline" }}>
                          <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                          <div>
                            {" "}
                            If your on-chain tx has failed, this is usually because the gas limit is set too low. You
                            can manually{" "}
                            <span
                              style={{ color: "#1890ff", cursor: "pointer" }}
                              onClick={() => {
                                clearHistoryLocalData(item);
                              }}
                            >
                              clear this history item
                            </span>{" "}
                            and try again later.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
            placement={isMobile ? "bottomLeft" : "bottomRight"}
            color="#fff"
            overlayInnerStyle={{ color: "#000", width: 265 }}
          >
            <div className={classes.waring}>
              Submitting
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_DELAYED:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <span>
                Your fund is being processed on {item.dst_received_info.chain.name}, which usually takes 30-60 minutes.
              </span>
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.waring}>
              Waiting for fund release
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_FAILED:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <span>
                Your transaction has failed on {item.src_send_info.chain.name}. This is usually because the gas limit is
                set too low. Rest assured that your funds are safe. You may try again later.
              </span>
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.failed}>
              Failed
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_WAITING_FOR_FUND_RELEASE:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <span>
                Your transfer is being released to {item.dst_received_info.chain.name}, which takes a few minutes in
                most cases but could take a few hours if there is heavy traffic or your transfer amount is large.
              </span>
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.waring}>
              Waiting for fund release
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_COMPLETED:
        lab = <div className={classes.completed}>Completed</div>;
        break;
      case TransferHistoryStatus.TRANSFER_TO_BE_REFUNDED: // TODO
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <span>
                The transfer cannot be completed because{" "}
                {errorMessages[item?.refund_reason] ||
                  "the bridge rate has moved unfavorably by your slippage tolerance"}
                . You may request a refund.
              </span>
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.waring}>
              To be refunded
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_REQUESTING_REFUND:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <span>
                Your refund request is being confirmed on Celer State Guardian Network (SGN), which may take a few
                minutes.
              </span>
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.waring}>
              Requesting refund
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_REFUND_TO_BE_CONFIRMED:
        lab = <div className={classes.waring}>Refund to be confirmed</div>;
        break;
      case TransferHistoryStatus.TRANSFER_CONFIRMING_YOUR_REFUND:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              showResult ? (
                <span>
                  Your request for refunding the transfer is being confirmed on {item.src_send_info.chain.name}, which
                  might take a few minutes.
                </span>
              ) : (
                <div>
                  It seems that your transaction has been stuck for more than 15 minutes.
                  <div style={{ marginLeft: 10, marginTop: 15 }}>
                    <div style={{ display: "flex", alignItems: "baseline" }}>
                      <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                      <div>
                        {" "}
                        If your on-chain tx has completed, please{" "}
                        <a
                          href={`https://form.typeform.com/to/Q4LMjUaK#srctx=${item.src_block_tx_link}&transferid=${item.transfer_id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          contact support
                        </a>{" "}
                        for help.
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                        <div>
                          {" "}
                          If your on-chain tx is still pending, you may speed up your transaction by increasing the gas
                          price.{" "}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                        <div>
                          {" "}
                          If your on-chain tx has failed, this is usually because the gas limit is set too low.Please{" "}
                          <span
                            style={{ color: "#1890ff", cursor: "pointer" }}
                            onClick={e => {
                              e.stopPropagation();
                              const newItem = item;
                              newItem.status = TransferHistoryStatus.TRANSFER_REFUND_TO_BE_CONFIRMED;
                              setSelectedItem(newItem);
                              setShowModal(true);
                            }}
                          >
                            click here
                          </span>{" "}
                          to resubmit the tx.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
            placement={isMobile ? "bottomLeft" : "bottomRight"}
            color="#fff"
            overlayInnerStyle={{ color: "#000", width: 265 }}
          >
            <div className={classes.waring}>
              Confirming your refund
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_WAITING_FOR_SGN_CONFIRMATION:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <span>
                Your transfer is being confirmed on Celer State Guardian Network (SGN), which might take a few minutes.
              </span>
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.waring}>
              Waiting for SGN confirmation
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case TransferHistoryStatus.TRANSFER_REFUNDED:
        lab = <div className={classes.completed}>Refunded</div>;
        break;
      default:
        break;
    }
    return lab;
  };

  const btnChange = item => {
    let btntext;
    switch (item.status) {
      case TransferHistoryStatus.TRANSFER_TO_BE_REFUNDED:
        btntext = "Request Refund ";
        break;
      case TransferHistoryStatus.TRANSFER_REFUND_TO_BE_CONFIRMED:
        btntext = "Confirm Refund";
        break;
      default:
        break;
    }
    if (btntext) {
      return (
        <div style={{ position: "relative", width: "fit-content" }}>
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <WarningFilled style={{ fontSize: 20, marginLeft: 4, marginRight: 10, color: "#ff8f00" }} />
                </div>
                <div>
                  It seems that your tx was failed or stuck on-chain. If you found the tx was failed, please increase
                  your gas limit and resubmit the transaction.
                </div>
              </div>
            }
            color="#fff"
            visible={!!item.txIsFailed}
            placement={isMobile ? "bottomLeft" : "right"}
            overlayInnerStyle={{ color: "#000", textAlign: "left", borderRadius: 10, fontSize: 12, width: 290 }}
            getPopupContainer={() => {
              return document.getElementById("modalpop") || document.body;
            }}
          >
            <Button
              type="primary"
              onClick={e => {
                e.stopPropagation();
                setSelectedItem(item);
                setShowModal(true);
              }}
              className={classes.submitBtn}
            >
              {btntext}
            </Button>
          </Tooltip>
          {/* {!!item.txIsFailed && (
            <div
              className={classes.disableTooltip}
              style={
                themeType === "dark"
                  ? { boxShadow: "none" }
                  : { boxShadow: "0px 3px 10px 4px rgba(143, 155, 179, 0.3)" }
              }
            >
              <div className={classes.disableTooltipbody} style={{ marginTop: isMobile ? -10 : 0 }}>
                <div className={classes.disableTooltipTran}></div>
                <div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>
                      <WarningFilled style={{ fontSize: 20, marginLeft: 4, marginRight: 10, color: "#ff8f00" }} />
                    </div>
                    <div>
                      It seems that your tx was failed or stuck on-chain. If you found the tx was failed, please
                      increase your gas limit and resubmit the transaction.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      );
    }
    return <div />;
  };
  const pegConfig = usePeggedPairConfig();
  const addTokenMethod = (id, token) => {
    const addtoken = {
      address: pegConfig.getTokenBalanceAddress(token?.address || ""),
      symbol: getTokenSymbol(token?.symbol, id),
      decimals: token?.decimal,
      image: token?.icon,
    };
    if (chainId === id) {
      addChainToken(addtoken);
    } else {
      switchChain(id, addtoken);
    }
  };

  return (
    <div className={isMobile ? classes.mobileHistoryBody : classes.historyBody}>
      <div>
        <div className={classes.flexCenter}>
          <Menu
            className={classes.menu}
            selectedKeys={[historykey]}
            onClick={e => {
              setHistorykey(e.key);
            }}
            mode="horizontal"
          >
            <Menu.Item key="transfer_history">
              <div className={classes.tabtitle}>
                Transfer History{historyTitleNum !== 0 && <div className={classes.numdot}>{historyTitleNum}</div>}
              </div>
            </Menu.Item>
            <Menu.Item key="liquidity_history">
              <div className={classes.tabtitle}>
                Liquidity History{lpTitleNum !== 0 && <div className={classes.numdot}>{lpTitleNum}</div>}
              </div>
            </Menu.Item>
          </Menu>
          {isMobile ? null : (
            <Button
              type="primary"
              className={classes.rebutton}
              onClick={() => {
                reloadHisList();
              }}
              icon={<ReloadOutlined style={{ fontSize: 20 }} />}
            />
          )}
        </div>
        <div className={classes.historyList}>
          {historykey === "transfer_history" ? (
            <div className={themeType === "dark" ? classes.spinblur : classes.whiteSpinblur}>
              <Spin spinning={hisLoading}>
                <div>
                  {historyList.length > 0 ? (
                    <div>
                      {historyList?.map(item => {
                        const sendAmountWithDecimal = formatDecimal(
                          item.src_send_info.amount,
                          item.src_send_info.token?.decimal,
                        )
                          .split(",")
                          .join("");
                        const receivedAmountWithDecimal = formatDecimal(
                          item?.dst_received_info.amount,
                          item?.dst_received_info?.token?.decimal,
                        )
                          .split(",")
                          .join("");

                        const showSupport =
                          item.status !== TransferHistoryStatus.TRANSFER_COMPLETED &&
                          item.status !== TransferHistoryStatus.TRANSFER_FAILED &&
                          item.status !== TransferHistoryStatus.TRANSFER_REFUNDED;
                        return (
                          <div className={classes.ListItem} key={item.transfer_id}>
                            <div className={isMobile ? classes.mobileItemContent : classes.itemcont}>
                              <div className={classes.itemLeft}>
                                <div
                                  className={classes.itemtitle}
                                  style={isMobile ? { minWidth: 0 } : { minWidth: 160 }}
                                >
                                  <div>
                                    <img src={item.src_send_info.chain.icon} alt="" className={classes.txIcon} />
                                  </div>
                                  <div className={classes.chaindes}>
                                    <a className={classes.chainName} href={item.src_block_tx_link} target="_blank">
                                      {item.src_send_info.chain.name} <LinkOutlined className={classes.linkIcon} />
                                    </a>

                                    <div className={classes.reducetxnum}>
                                      - {sendAmountWithDecimal}{" "}
                                      {getTokenSymbol(item?.src_send_info.token.symbol, item?.src_send_info.chain.id)}
                                    </div>
                                  </div>
                                </div>
                                <img
                                  src={themeType === "dark" ? runRightIconDark : runRightIconLight}
                                  alt=""
                                  className={classes.turnRight}
                                />
                                <div className={classes.itemtitle}>
                                  <div>
                                    <img src={item?.dst_received_info.chain.icon} alt="" className={classes.txIcon} />
                                  </div>
                                  <div className={classes.chaindes}>
                                    {item.dst_block_tx_link ? (
                                      <a className={classes.linktitle} href={item.dst_block_tx_link} target="_blank">
                                        {item?.dst_received_info.chain.name}{" "}
                                        <LinkOutlined className={classes.linkIcon} />
                                      </a>
                                    ) : (
                                      <div className={classes.linktitle}> {item?.dst_received_info.chain.name}</div>
                                    )}

                                    {/* dest amount */}
                                    {Number(receivedAmountWithDecimal) > 0 ? (
                                      <div className={classes.receivetxnum}>
                                        +{" "}
                                        <span>
                                          {receivedAmountWithDecimal}{" "}
                                          {getTokenDisplaySymbol(
                                            item?.dst_received_info?.token,
                                            item?.dst_received_info?.chain,
                                          )}
                                        </span>
                                        {!isMobile && (
                                          <Tooltip
                                            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
                                            title={"Add to MetaMask"}
                                            placement={"bottom"}
                                            color="#fff"
                                            overlayInnerStyle={{ color: "#000" }}
                                          >
                                            <img
                                              onClick={() => {
                                                addTokenMethod(
                                                  item?.dst_received_info.chain.id,
                                                  item?.dst_received_info.token,
                                                );
                                              }}
                                              src={meta}
                                              alt=""
                                              height={14}
                                              style={{
                                                display: needToChangeTokenDisplaySymbol(
                                                  item?.src_send_info.token,
                                                  item?.dst_received_info.chain,
                                                )
                                                  ? "none"
                                                  : "flex",
                                                marginLeft: 5,
                                                cursor: "pointer",
                                              }}
                                            />
                                          </Tooltip>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                              <div className={isMobile ? classes.mobileItemRight : classes.itemRight}>
                                <div className={showSupport ? classes.showSuppord : ""}>
                                  <div>{tipsStatus(item)}</div>
                                  <div className={classes.itemTime}>
                                    {moment(Number(item.ts)).format("YYYY-MM-DD HH:mm:ss")}
                                  </div>
                                  {showSupport && (
                                    <a
                                      href={`https://form.typeform.com/to/Q4LMjUaK#srctx=${item.src_block_tx_link}&transferid=${item.transfer_id}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Contact Support
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>{btnChange(item)}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={classes.empty}>
                      {!hisLoading && (
                        <div>
                          <div style={{ width: "100%", textAlign: "center", marginBottom: 15 }}>
                            <ClockCircleOutlined style={{ fontSize: 30 }} />
                          </div>
                          <div style={{ fontSize: 15 }}> No history yet!</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Spin>
            </div>
          ) : (
            <div className={themeType === "dark" ? classes.spinblur : classes.whiteSpinblur}>
              <Spin spinning={lpLoading}>
                <div>
                  {liquidityList.length > 0 ? (
                    <div>
                      {liquidityList?.map(item => {
                        return (
                          <LPHistoryItem
                            key={item.chain.id + item.ts}
                            item={item}
                            extendsFunction={item => {
                              setSelectedItem(item);
                              setShowLPModal(true);
                            }}
                            clearLpLocalData={() => clearLpLocalData(item)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className={classes.empty}>
                      {!lpLoading && (
                        <div>
                          <div style={{ width: "100%", textAlign: "center", marginBottom: 15 }}>
                            <ClockCircleOutlined style={{ fontSize: 30 }} />
                          </div>
                          <div style={{ fontSize: 15 }}> No history yet!</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Spin>
            </div>
          )}
        </div>
        {currentPage !== undefined ? (
          <div className={classes.pagination}>
            <PageFlipper
              page={currentPage}
              hasMore={Number(size) === defaultPageSize}
              onPageChange={(toPage: number) => onPageChange(toPage)}
            />
          </div>
        ) : null}
      </div>

      {showLPModal && (
        <HistoryLPModal visible={showLPModal} onCancel={() => setShowLPModal(false)} record={selectedItem} />
      )}
      {showModal && (
        <HistoryTransferModal visible={showModal} onCancel={() => setShowModal(false)} record={selectedItem} />
      )}
    </div>
  );
};

type LiqBtnProps = {
  item: LPHistory;
  callback: () => void;
};

export default History;

interface LPHistoryItemProps {
  item: LPHistory;
  extendsFunction;
  clearLpLocalData: () => void;
}

const LPHistoryItem = (props: LPHistoryItemProps): JSX.Element => {
  const { item, extendsFunction, clearLpLocalData } = props;
  const { isMobile } = useAppSelector(state => state.windowWidth);

  const classes = useStyles({ isMobile });
  const amountWithDecimal = formatDecimal(item?.amount, item.token.token?.decimal);
  const amout = amountWithDecimal.split(".")[1] === "0" ? amountWithDecimal.split(".")[0] : amountWithDecimal;
  const showSupport =
    item.status !== LPHistoryStatus.LP_COMPLETED &&
    item.status !== LPHistoryStatus.LP_FAILED &&
    item.block_tx_link &&
    item.block_tx_link.length > 0;
  const liqtipsStatus = item => {
    let lab;
    const nowDate = new Date().getTime();
    const showResult = nowDate - Number(item.updateTime || item.ts) <= tooltipShowTime * 60 * 1000;

    switch (item.status) {
      case LPHistoryStatus.LP_SUBMITTING:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              item.type === LPType.LP_TYPE_ADD ? (
                <span>
                  {showResult ? (
                    <span>
                      Your request for adding liquidity is being confirmed on {item.chain.name}. Please allow{" "}
                      {item.chain.block_delay} block confirmations (a few minutes) for the request to be confirmed.
                    </span>
                  ) : (
                    <div>
                      It seems that your transaction has been stuck for more than 15 minutes.
                      <div style={{ marginLeft: 10, marginTop: 15 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "baseline" }}>
                            <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                            <div>
                              {" "}
                              If your on-chain tx has completed, please{" "}
                              <a
                                href={`https://form.typeform.com/to/Q4LMjUaK#srctx=${item.block_tx_link}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                contact support
                              </a>{" "}
                              for help.
                            </div>{" "}
                          </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", alignItems: "baseline" }}>
                            <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                            <div>
                              {" "}
                              If your on-chain tx is still pending, you may speed up your transaction by increasing the
                              gas price.{" "}
                            </div>
                          </div>
                        </div>
                        {item.isLocal && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ display: "flex", alignItems: "baseline" }}>
                              <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                              <div>
                                {" "}
                                If your on-chain tx has failed, this is usually because the gas limit is set too low.
                                You can manually{" "}
                                <span
                                  style={{ color: "#1890ff", cursor: "pointer" }}
                                  onClick={() => {
                                    clearLpLocalData();
                                  }}
                                >
                                  clear this history item
                                </span>{" "}
                                and try again later.
                              </div>{" "}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </span>
              ) : (
                <div>
                  {showResult ? (
                    <span>
                      {item.method_type === 2
                        ? `The transaction is being confirmed on ${item.chain.name}. Please wait a few minutes`
                        : `Your request for removing liquidity is being confirmed on ${item.chain.name}, which might take a few
                   minutes.`}
                    </span>
                  ) : (
                    <div>
                      It seems that your transaction has been stuck for more than 15 minutes.
                      <div style={{ marginLeft: 10, marginTop: 15 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "baseline" }}>
                            <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                            <div>
                              {" "}
                              If your on-chain tx has completed, please{" "}
                              <a
                                href={`https://form.typeform.com/to/Q4LMjUaK#srctx=${item.block_tx_link}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                contact support
                              </a>{" "}
                              for help.
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", alignItems: "baseline" }}>
                            <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                            <div>
                              {" "}
                              If your on-chain tx is still pending, you may speed up your transaction by increasing the
                              gas price.{" "}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", alignItems: "baseline" }}>
                            <div style={{ fontSize: 15, fontWeight: "bold", marginRight: 5 }}>·</div>
                            <div>
                              {" "}
                              If your on-chain tx has failed, this is usually because the gas limit is set too low.
                              Please{" "}
                              <span
                                style={{ color: "#1890ff", cursor: "pointer" }}
                                onClick={e => {
                                  e.stopPropagation();
                                  const newItem = item;
                                  newItem.status = LPHistoryStatus.LP_WAITING_FOR_LP;
                                  extendsFunction(newItem);
                                }}
                              >
                                click here
                              </span>{" "}
                              to resubmit the tx.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            placement={isMobile ? "bottomLeft" : "bottomRight"}
            color="#fff"
            overlayInnerStyle={{ color: "#000", width: 265 }}
          >
            <div className={classes.waring}>
              Submitting
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case LPHistoryStatus.LP_DELAYED:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={<span>Your fund is being processed on {item.chain.name}, which usually takes 30-60 minutes.</span>}
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.waring}>
              Waiting for fund release
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case LPHistoryStatus.LP_FAILED:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <span>
                {item.method_type === 2
                  ? `The transaction has been canceled because the slippage tolerance has been exceeded.`
                  : ` Your transaction has failed on ${item.chain.name}. This is usually because the gas limit is set too low.
                    Rest assured that your funds are safe. You may try again later.`}
              </span>
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.failed}>
              {item.method_type === 2 ? "Canceled" : "Failed"}
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case LPHistoryStatus.LP_WAITING_FOR_SGN:
        lab = (
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              item.type === LPType.LP_TYPE_ADD ? (
                <span>
                  Your request for adding liquidity is being confirmed on Celer State Guardian Network (SGN), which
                  might take a few minutes.
                </span>
              ) : (
                <span>
                  {item.method_type === 2
                    ? "The liquidity aggregation and withdrawal transaction is being confirmed by Celer State Guardian Network (SGN). Please wait for a few minutes."
                    : "Your request for removing liquidity is being confirmed on Celer State Guardian Network (SGN), which might take a few minutes."}
                </span>
              )
            }
            placement={isMobile ? "bottomLeft" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <div className={classes.waring}>
              Waiting for SGN confirmation
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </div>
          </Tooltip>
        );
        break;
      case LPHistoryStatus.LP_COMPLETED:
        lab = <div className={classes.completed}>Completed</div>;
        break;
      case LPHistoryStatus.LP_WAITING_FOR_LP:
        lab = <div className={classes.waring}>Waiting for LP Confirmation</div>;
        break;
      default:
        break;
    }
    return lab;
  };

  const LiqBtnChange = item => {
    let btntext;
    switch (item.status) {
      case LPHistoryStatus.LP_WAITING_FOR_LP:
        btntext = item.method_type === 2 ? "Confirm Liquidity Aggregation and Removal" : "Confirm Remove Liquidity";
        break;
      default:
        break;
    }
    if (btntext) {
      return (
        <div>
          <Tooltip
            overlayClassName={isMobile ? classes.mobileTooltipOverlayStyle : undefined}
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <WarningFilled style={{ fontSize: 20, marginLeft: 4, marginRight: 10, color: "#ff8f00" }} />
                </div>
                <div>
                  It seems that your tx was failed or stuck on-chain. If you found the tx was failed, please increase
                  your gas limit and resubmit the transaction.
                </div>
              </div>
            }
            color="#fff"
            visible={!!item.txIsFailed}
            placement={isMobile ? "bottomLeft" : "right"}
            overlayInnerStyle={{ color: "#000", textAlign: "left", borderRadius: 10, fontSize: 12, width: 290 }}
            getPopupContainer={() => {
              return document.getElementById("modalpop") || document.body;
            }}
          >
            <Button
              type="primary"
              onClick={e => {
                e.stopPropagation();
                extendsFunction(item);
              }}
              className={classes.submitBtn}
              style={isMobile ? { fontSize: 12 } : { fontSize: 14 }}
            >
              {btntext}
            </Button>
          </Tooltip>
        </div>
      );
    }
    return <div />;
  };
  return (
    <div className={classes.ListItem} key={item.withdraw_id}>
      <div className={isMobile ? classes.mobileItemContent : classes.itemcont}>
        <div className={classes.itemLeft}>
          {item.block_tx_link ? (
            <a className={classes.chainName2} href={item.block_tx_link} target="_blank">
              <span>
                {item.type === LPType.LP_TYPE_ADD ? (
                  `Add ${amout} ${item.token.token.symbol} to ${item.chain.name}`
                ) : (
                  <span>
                    {item.method_type === 2 ? (
                      <span className={classes.singlText}>{`Aggregate and remove ${amout} ${getTokenSymbol(
                        item.token.token.symbol,
                        item.chain.id,
                      )} on ${item.chain.name}`}</span>
                    ) : (
                      `Remove ${amout} ${getTokenSymbol(item.token.token.symbol, item.chain.id)} from ${
                        item.chain.name
                      }`
                    )}
                  </span>
                )}{" "}
                <LinkOutlined className={classes.linkIcon} />
              </span>
            </a>
          ) : (
            <div className={classes.chainName2}>
              <span>
                {item.type === LPType.LP_TYPE_ADD ? (
                  `Add ${amout} ${item.token.token.symbol} to ${item.chain.name}`
                ) : (
                  <span>
                    {item.method_type === 2 ? (
                      <span className={classes.singlText}>{`Aggregate and remove ${amout} ${getTokenSymbol(
                        item.token.token.symbol,
                        item.chain.id,
                      )} on ${item.chain.name}`}</span>
                    ) : (
                      `Remove ${amout} ${getTokenSymbol(item.token.token.symbol, item.chain.id)} from ${
                        item.chain.name
                      }`
                    )}
                  </span>
                )}{" "}
              </span>{" "}
            </div>
          )}
        </div>
        <div className={isMobile ? classes.mobileItemRight : classes.itemRight}>
          <div className={showSupport ? classes.showSuppord : ""}>
            <div>{liqtipsStatus(item)}</div>
            <div className={classes.itemTime}>{moment(Number(item?.ts)).format("YYYY-MM-DD HH:mm:ss")}</div>
            {showSupport && (
              <a
                href={`https://form.typeform.com/to/Q4LMjUaK#srctx=${item.block_tx_link}`}
                target="_blank"
                rel="noreferrer"
              >
                Contact Support
              </a>
            )}
          </div>
        </div>
      </div>
      <div>{LiqBtnChange(item)}</div>
    </div>
  );
};
