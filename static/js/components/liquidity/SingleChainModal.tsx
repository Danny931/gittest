/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Button, Tooltip } from "antd";
import { useCallback, useEffect, useState, useContext } from "react";
import { createUseStyles } from "react-jss";
import {
  CheckCircleFilled,
  WarningFilled,
  LoadingOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { debounce } from "lodash";
import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";
import { base64, getAddress, hexlify } from "ethers/lib/utils";
import { deleteDecimalPart } from "celer-web-utils/lib/format";

import { useContractsContext } from "../../providers/ContractsContextProvider";
import { useWeb3Context } from "../../providers/Web3ContextProvider";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { withdrawLiquidity, queryLiquidityStatus } from "../../redux/gateway";

import { LPType, WithdrawDetail, LPHistoryStatus, LPHistory } from "../../constants/type";
import { Theme } from "../../theme";
import { formatDecimal } from "../../helpers/format";
import { switchChain, setChainSource, setIsChainShow, setSingleChainList } from "../../redux/transferSlice";
import SingleChain from "./SingleChain";
import settingIcon from "../../images/setting.svg";
import { closeModal, ModalName, openModal } from "../../redux/modalSlice";
import RateModal from "./SingleChainRateModal";
import { getTokenSymbol } from "../../redux/assetSlice";
import { useBigAmountDelay } from "../../hooks";
import { ColorThemeContext } from "../../providers/ThemeProvider";
import { getNetworkById } from "../../constants/network";
import {
  WithdrawReq as WithdrawReqProto,
  WithdrawLq as WithdrawLqProto,
  WithdrawType,
} from "../../proto/sgn/cbridge/v1/tx_pb";
import { ErrCode, WithdrawLiquidityRequest, WithdrawMethodType } from "../../proto/sgn/gateway/v1/gateway_pb";
import ExceedSafeguardModal from "../../views/ExceedSafeguardModal";
import { minimum, maximum } from "../../helpers/calculation";
/* eslint-disable no-debugger */
/* eslint-disable camelcase */

const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  balanceText: {
    textDecoration: "underline",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  countdown: {
    fontSize: 14,
    fontWeight: 600,
  },
  explanation: {
    color: theme.infoSuccess,
    marginBottom: 24,
  },
  historyDetail: {
    width: "100%",
  },
  detailItem: {
    borderBottom: `1px solid ${theme.infoSuccess}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    padding: "12px 0",
  },
  detailItemBto: {
    borderBottom: `1px solid ${theme.infoSuccess}`,
    padding: "12px 0",
  },
  detailItemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "left",
  },
  itemContImg: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    marginRight: 8,
  },
  itemRight: {
    textAlign: "right",
  },
  itemText: {
    color: theme.surfacePrimary,
    fontSize: 20,

    fontWeight: 600,
  },
  itemTitle: {
    fontSize: 16,
    color: theme.infoSuccess,
  },
  totalValue: {
    fontSize: 16,
    color: "#FC5656",
  },
  totalValueRN: {
    fontSize: 16,
    color: "#00d395",
  },
  fromNet: {
    fontSize: 12,
    color: theme.infoSuccess,
  },
  expe: {
    fontSize: 12,
    color: theme.infoSuccess,
    textAlign: "left",
    paddingTop: 30,
  },
  time: {
    fontSize: 16,
    color: theme.infoSuccess,
    textAlign: "right",
  },
  modalTop: {},
  modalTopDes: {
    fontSize: 14,
  },
  modalTopTitle: {
    fontSize: 12,
    width: "100%",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: 600,
    color: theme.surfacePrimary,
  },
  transferdes: {
    fontSize: 12,
    width: "100%",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: 600,
    color: theme.surfacePrimary,
  },
  modalToptext: {
    fontSize: 15,
    width: "100%",
    textAlign: "center",
    fontWeight: 600,
    color: theme.surfacePrimary,
    lineHeight: 1,
  },
  modalsuccetext: {
    fontSize: 22,
    width: "100%",
    textAlign: "center",
    fontWeight: 600,
    color: theme.infoSuccess,
  },
  modalTopTitleNotice: {
    fontSize: 14,
    fontWeight: 400,
    width: "100%",
    textAlign: "center",
    marginBottom: 20,
  },
  modalTopIcon: {
    fontSize: 16,
    fontWeight: 600,
    width: "100%",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 45,
  },
  addToken: {
    color: "#0c82ff",
    fontSize: 13,
    padding: "10px 10px",
    borderRadius: "100px",
    background: "rgba(14,129,251,0.2)",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    justifyContent: "center",
    marginTop: 40,
  },
  button: {
    height: 56,
    lineHeight: "42px",
    background: theme.primaryBrand,
    border: 0,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 700,
    marginTop: 40,
  },
  addbutton: {
    height: 44,
    lineHeight: "38px",
    background: theme.primaryBrand,
    border: 0,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 700,
  },
  resultText: {
    color: theme.surfacePrimary,
  },
  modaldes: {
    color: theme.surfacePrimary,
    marginTop: 50,
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
  },
  modaldesmid: {
    color: theme.surfacePrimary,
    marginTop: 40,
    fontSize: 15,
    fontWeight: 400,
    textAlign: "center",
  },
  modaldesLarg: {
    color: theme.surfacePrimary,
    marginTop: 40,
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
  },
  yellowText: {
    color: theme.infoWarning,
    display: "inline-block",
  },
  transitem: {},
  transitemTitle: {
    //   background: theme.dark.contentBackground,
    color: theme.surfacePrimary,
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // padding: "0 12px",
  },
  transcontent: {
    borderRadius: "16px",
    background: theme.primaryBackground,
    padding: "15px 0",
    marginTop: 5,
  },
  icon: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "20px 0 10px 0",
  },
  source: {
    display: "inline-block",
    marginRight: 8,
    fontSize: 15,
  },
  transselect: {
    background: theme.primaryBackground,
    display: "inline-block",
    minWidth: 100,
    borderRadius: 100,
  },
  transChainame: {
    fontSize: 15,
  },
  transnum: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    color: theme.secondBrand,
  },
  transnumtext: {
    //   color: theme.dark.lowTextColor,
    fontSize: 14,
    color: theme.secondBrand,
  },
  transnumlimt: {
    //   color: theme.dark.midTextColor,
    //   fontSize: theme.transferFontS,
    borderBottom: "1px solid #8f9bb3",
    cursor: "pointer",
  },
  transexp: {
    //   color: theme.dark.midTextColor,
    fontSize: 14,
  },
  transndes: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    marginTop: 18,
  },
  transdestext: {
    //   fontSize: theme.transferFontXl,
    //   color: theme.dark.midTextColor,
    flex: 2,
  },
  transdeslimt: {
    position: "relative",
    flex: 1,
  },
  chainSelcet: {
    borderRadius: "100px",
    background: theme.primaryBackground,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    //   fontSize: theme.transferFontM,
    //   color: theme.dark.heiTextColor,
    paddingLeft: 8,
    paddingRight: 10,
    height: 40,
  },
  investSelct: {
    display: "flex",
    position: "absolute",
    top: -13,
    right: 0,
    alignItems: "center",
  },
  selectdes: {
    marginLeft: 5,
    fontSize: 16,
    color: theme.surfacePrimary,
  },
  selectpic: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    "& img": {
      width: "100%",
      borderRadius: "50%",
    },
  },
  descripet: {
    background: theme.primaryBackground,
    borderRadius: 16,
    padding: "18px 20px",
    marginTop: "25px",
  },
  descripetItem: {
    display: "flex",
    justifyContent: "space-between",
    lineHeight: 1,
  },
  leftCon: {
    display: "flex",
    alignItems: "center",
  },
  titleIcon: {
    color: theme.secondBrand,
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
  },
  leftTitle: {
    color: theme.secondBrand,
    alignItems: "center",
    fontSize: 10,
    fontWeight: 600,
    display: "flex",
  },
  titleInfo: {
    display: "flex",
    flex: 1,
    lineHeight: "15px",
  },
  rightContent: {
    display: "flex",
    alignItems: "center",
    color: theme.surfacePrimary,
    fontSize: 13,
    fontWeight: 400,
  },
  desImg: {
    width: 14,
    marginLeft: 6,
  },
  note: {
    color: theme.primaryBrand,
  },
  noteview: {
    color: theme.primaryBrand,
    textAlign: "center",
    margin: "18px 0 30px 0",
    cursor: "pointer",
  },
  err: {
    width: "100%",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    // minHeight: 80,
  },
  errInner: {
    color: "#fc5656",
    textAlign: "center",
  },
  errInnerbody: {
    marginTop: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    background: "#fff",
    padding: "8px 12px",
    color: theme.infoDanger,
    fontWeight: 700,
    fontSize: 16,
    boxShadow: "0px 4px 17px  rgba(24, 39, 75, 0.08), 0px 8px 10px rgba(24, 39, 75, 0.12)",
  },

  errMessage: {
    width: "100vw",
    position: "fixed",
    top: 122,
    left: 0,
    textAlign: "center",
  },
  errMessageMobile: {
    width: "calc(100vw - 32px)",
    position: "relative",
    top: -45,
    left: 0,
    textAlign: "center",
  },
  messageBody: {
    fontSize: 16,
    padding: "8px 15px",
    background: "#fff",
    //   width: theme.tipsWidth,
    borderRadius: 12,
    margin: "0 auto",
    // textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greenText: {
    color: theme.infoSuccess,
  },
  removeModal: {
    border: `1px solid ${theme.primaryBackground}`,
    background: theme.secondBackground,
    "& .ant-modal-content": {
      background: theme.secondBackground,
      boxShadow: props => (props.isMobile ? "none" : ""),
      "& .ant-modal-close": {
        color: theme.surfacePrimary,
      },
      "& .ant-modal-header": {
        background: theme.secondBackground,
        borderBottom: "none",
        "& .ant-modal-title": {
          color: theme.surfacePrimary,
          "& .ant-typography": {
            color: theme.surfacePrimary,
          },
        },
      },
      "& .ant-modal-body": {
        minHeight: 235,
      },
      "& .ant-modal-footer": {
        border: "none",
        "& .ant-btn-link": {
          color: theme.primaryBrand,
        },
      },
    },
    "& .ant-typography": {
      color: theme.surfacePrimary,
    },
  },
  title: {
    width: "100%",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: theme.surfacePrimary,
  },
  desc: {
    width: "100%",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: theme.secondBrand,
    marginTop: 10,
    lineHeight: 1,
  },
  descsel: {
    width: "100%",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: theme.secondBrand,
    marginTop: 26,
    marginBottom: 26,
    lineHeight: 1,
  },
  settingIcon: {
    width: 18,
    color: theme.secondBrand,
  },
  chainIcon: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    margin: "0 4px",
  },
  chainIconSmall: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    marginLeft: "4px",
  },
  btnOut: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    margin: "24px 0",
  },
  autoSlid: {
    minHeight: 300,
    maxHeight: 435,
    paddingBottom: 20,
    overflow: "auto",
  },
  dangerText: {
    color: theme.infoDanger,
    fontSize: 16,
    fontWeight: 700,
    textAlign: "left",
    marginLeft: 10,
  },
  safeguardToastBox: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 11,
    width: "100%",
    borderRadius: 4,
    padding: "8px 12px 8px 12px",
    background: theme.primaryBackground,
  },
  errorMsg: {
    fontWeight: 700,
    fontSize: 16,
    color: theme.infoDanger,
    textAlign: "left",
  },
  warningMsg: {
    fontWeight: 700,
    fontSize: 16,
    color: theme.infoWarning,
    textAlign: "left",
  },
  bigAmountDelayed: {
    textAlign: "left",
    fontSize: 14,
    fontWeight: 600,
    color: theme.surfacePrimary,
    marginTop: 40,
    background: "#fff",
    padding: "0px 10px",
    borderRadius: 8,
    boxShadow: "0px 4px 17px  rgba(24, 39, 75, 0.08), 0px 8px 10px rgba(24, 39, 75, 0.12)",
  },
  msgInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    color: "black",
    textAlign: "center",
    margin: "8px 12px",
  },
  warningInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    color: theme.infoWarning,
    textAlign: "center",
    margin: "8px 12px",
  },
  msgBoldInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    textAlign: "center",
    margin: "8px 12px",
    color: "#17171A",
    fontWeight: "bold",
  },
}));

export interface SingleChainModalProps {
  showModal: boolean;
  onClose: () => void;
}

const INIT = "init";

const SingleChainModal = ({ onClose, showModal }: SingleChainModalProps): JSX.Element => {
  const {
    contracts: { lpbridge },
    transactor,
  } = useContractsContext();
  const { address, chainId, signer } = useWeb3Context();
  const dispatch = useAppDispatch();
  const { selectedLP, lpList } = useAppSelector(state => state.lp);
  const { modal } = useAppSelector(state => state);
  const { showRateModal } = modal;
  const [errorMsg, setErrorMsg] = useState<JSX.Element>(<div />);
  const [transfState, setTransfState] = useState<LPHistoryStatus | "init" | "confirmationAlert">(INIT);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [addbtnDisabled, setAddbtnDisabled] = useState<boolean>(false);
  const [withdrawDetail, setWithdrawDetail] = useState<WithdrawDetail>();
  const [seqNum, setSeqNum] = useState<string>("0");
  const [totalEstimatedAmt, setTotalEstimatedAmt] = useState<string>("0");
  const [fee, setFee] = useState<string>("0");
  const [viewInExploreLink, setViewInExploreLink] = useState<string>("");
  const { windowWidth, transferInfo } = useAppSelector(state => state);
  const { isMobile } = windowWidth;
  const classes = useStyles({ isMobile });
  const { singleChainList, singleChainRate, transferConfig } = transferInfo;
  const { chains } = transferConfig;
  const [epochVolumeCaps, setEpochVolumeCaps] = useState<BigNumber>();
  const [currentEpochVolume, setCurrentEpochVolume] = useState<BigNumber>();
  const [aggBtnDisabled, setAggBtnDisabled] = useState(true);
  const [showExceedSafeguardModal, setShowExceedSafeguardModal] = useState(false);
  const { isBigAmountDelayed, delayMinutes, delayThresholds } = useBigAmountDelay(
    selectedLP?.chain,
    selectedLP?.token?.token,
    Number(formatUnits(totalEstimatedAmt, selectedLP?.token.token.decimal)) ?? 0,
    true,
    epochVolumeCaps,
  );
  const { themeType } = useContext(ColorThemeContext);
  const [hasFetchedSafeguard, setHasFetchedSafeguard] = useState(false);
  const [noTokenOnDst, setNoTokenOnDst] = useState(false);
  let content;
  let titleText = "Remove Liquidity";
  let removeStatusInterval;

  const generateErrMsg = (msg: string) => {
    return (
      <div className={classes.errInnerbody}>
        <CloseCircleFilled style={{ fontSize: 18, marginRight: 5, color: "#FF3D71" }} />
        <span className={classes.dangerText}>{msg}</span>
      </div>
    );
  };

  useEffect(() => {
    setErrorMsg(<div />);
    setHasError(false);
    if (selectedLP?.chain?.id !== chainId) {
      setHasError(true);
      setErrorMsg(
        generateErrMsg(`Please switch to ${selectedLP?.chain?.name} before liquidity aggregation and removal.`),
      );
      return;
    }
    if (noTokenOnDst) {
      setHasError(true);
      setErrorMsg(
        generateErrMsg(`Insufficient liquidity on ${selectedLP?.chain?.name}. You may reduce your withdrawal amount.`),
      );
      return;
    }
    const totalAmt = BigNumber.from(totalEstimatedAmt);
    if (totalAmt.lt(BigNumber.from(fee))) {
      setHasError(true);
      setErrorMsg(generateErrMsg("The received amount cannot cover fee."));
      return;
    }
    if (epochVolumeCaps && totalAmt.gte(epochVolumeCaps)) {
      setAggBtnDisabled(true);
      const formatedAmount = formatUnits(epochVolumeCaps.toString(), selectedLP.token.token.decimal);
      setErrorMsg(
        generateErrMsg(
          `In this beta release, the maximum liquidity removal
          amount is ${deleteDecimalPart(formatedAmount.toString())} ${getTokenSymbol(
            selectedLP.token.token.symbol,
            selectedLP?.chain.id,
          )}. Please reduce your removal amount.`,
        ),
      );
      return;
    }
    if (epochVolumeCaps && currentEpochVolume && totalAmt.add(currentEpochVolume).gt(epochVolumeCaps)) {
      setAggBtnDisabled(true);
      setErrorMsg(
        <div className={classes.errInnerbody}>
          <CloseCircleFilled style={{ fontSize: 20, color: "#FF3D71", marginRight: 10 }} />
          <span style={{ color: "#FF3D71", fontWeight: 700, fontSize: 16, textAlign: "left" }}>
            Sorry the transaction cannot be submitted due to the heavy traffic at this moment. Please reduce your amount
            or try again 1 hour later.
          </span>
        </div>,
      );
      return;
    }
    setAggBtnDisabled(false);
    if (isBigAmountDelayed) {
      setErrorMsg(bigAmountDelayedMsg(selectedLP.token.token.symbol, delayMinutes));
    }
  }, [
    selectedLP,
    chainId,
    totalEstimatedAmt,
    fee,
    currentEpochVolume,
    epochVolumeCaps,
    isBigAmountDelayed,
    noTokenOnDst,
  ]);

  const checkSafeguard = useCallback(
    debounce(async () => {
      let maxT = BigNumber.from(0);
      let currentVolume = BigNumber.from(0);
      let maxSend = BigNumber.from(0);
      if (lpbridge) {
        maxT = await lpbridge.epochVolumeCaps(selectedLP.token.token.address);
        maxT = maxT.mul(98).div(100);
        currentVolume = await lpbridge.epochVolumes(selectedLP.token.token.address);
        maxSend = await lpbridge.maxSend(selectedLP.token.token.address);
        setHasFetchedSafeguard(true);
      }

      const needsSafeguard = maxT.gt(0) || maxSend.gt(0);
      if (needsSafeguard) {
        setAggBtnDisabled(true);
        setCurrentEpochVolume(currentVolume);
        const minValue = minimum(maxSend, maxT);
        const maxValue = maximum(maxSend, maxT);
        setEpochVolumeCaps(minValue.gt(0) ? minValue : maxValue);
      } else {
        setAggBtnDisabled(false);
        setCurrentEpochVolume(undefined);
        setEpochVolumeCaps(undefined);
      }
    }, 500),
    [singleChainList, lpbridge, currentEpochVolume, epochVolumeCaps],
  );

  useEffect(() => {
    checkSafeguard();
  }, [totalEstimatedAmt]);

  useEffect(() => {
    let num = BigNumber.from(0);
    let feeTotal = BigNumber.from(0);
    let emptyChainExists = false;
    singleChainList?.map(item => {
      num = BigNumber.from(item.stimatedReceived || "0").add(num);
      feeTotal = BigNumber.from(item.fee).add(feeTotal);
      if (item.chain.id === undefined || item.chain.id === "") {
        emptyChainExists = true;
      }
      return item;
    });
    setAggBtnDisabled(emptyChainExists);
    setTotalEstimatedAmt(num.toString());
    setFee(feeTotal.toString());

    const list = chains.filter(item => {
      let hasLiquidity = true;
      lpList?.map(iitem => {
        if (Number(iitem.chain.id) === Number(item.id) && iitem.token.token.symbol === selectedLP.token.token.symbol) {
          if (iitem.liquidity_amt === "0") {
            hasLiquidity = false;
          }
        }
        return iitem;
      });
      return hasLiquidity;
    });
    setAddbtnDisabled(singleChainList.length === list.length);
  }, [singleChainList]);

  const getBigAmountModalMsg = (): string => {
    const time = isBigAmountDelayed ? `up to ${delayMinutes} minutes` : "a few minutes";
    return `Successfully aggregate & remove liquidity to ${selectedLP?.chain?.name}. Please wait ${time} to receive the fund.`;
  };

  const defaultSingleChain = {
    key: 0,
    from_chain_id: "",
    token_addr: "",
    ratio: "0",
    stimatedReceived: "0",
    totalLiquidity: "0",
    errorMsg: "",
    chain: {},
    token: selectedLP?.token.token,
    cbridgeRate: "",
    fee: "0",
  };
  useEffect(() => {
    if (showModal) {
      const newList = [defaultSingleChain];
      dispatch(setSingleChainList(newList));
    }
  }, [selectedLP, showModal]);

  const closeModalFunc = () => {
    const newList = [defaultSingleChain];
    dispatch(setSingleChainList(newList));
    if (transfState === LPHistoryStatus.LP_COMPLETED) {
      setTransfState(INIT);
    }
    clearInterval(removeStatusInterval);
    onClose();
  };

  const showChain = type => {
    if (!signer) {
      return;
    }
    dispatch(setChainSource(type));
    dispatch(setIsChainShow(true));
  };
  const handleOpenRateModal = () => {
    dispatch(openModal(ModalName.rate));
  };
  const handleCloseRateModal = () => {
    dispatch(closeModal(ModalName.rate));
  };
  const addItem = () => {
    const newList = JSON.parse(JSON.stringify(singleChainList));
    defaultSingleChain.key = newList.length;
    newList.push(defaultSingleChain);
    dispatch(setSingleChainList(newList));
    setTimeout(() => {
      scrollBottom();
    }, 10);
  };
  const scrollBottom = () => {
    const scrollb = document.getElementById("slid");
    if (scrollb) {
      scrollb.scrollTop = 10000;
    }
  };

  const bigAmountDelayedMsg = (tokenSymbol: string, minutes: string) => {
    return (
      <div className={classes.bigAmountDelayed} style={{ display: "inline-flex" }}>
        <div className={classes.warningInnerbody} style={{ display: "inline-flex", margin: "8px 0px 8px 12px" }}>
          <WarningFilled style={{ fontSize: 20, marginRight: 10 }} />
        </div>
        <div style={{ display: "inline", margin: "8px 0px" }}>
          <span className={classes.msgInnerbody} style={{ display: "inline", margin: "0px" }}>
            {`For liquidity removal of more than ${delayThresholds} ${tokenSymbol}, it takes`}
          </span>
          <span className={classes.msgBoldInnerbody} style={{ display: "inline", margin: "0px 4px" }}>
            {`up to ${minutes} minutes`}
          </span>
          <span className={classes.msgInnerbody} style={{ display: "inline", margin: "0px 12px 0px 0px" }}>
            to receive the fund.
          </span>
        </div>
      </div>
    );
  };

  const removeLiquidityMethod = async () => {
    if (!lpbridge || !selectedLP || !signer) {
      return;
    }
    setLoading(true);
    const timestamp = Math.floor(Date.now() / 1000);
    let total_estimated_received_amt = BigNumber.from(0);
    const newList = singleChainList.filter(item => item.from_chain_id !== "");
    const WithdrawLqProtoList = newList?.map(item => {
      const withdrawLqProto = new WithdrawLqProto();
      withdrawLqProto.setFromChainId(item.from_chain_id);
      withdrawLqProto.setMaxSlippage((Number(singleChainRate) / 100) * 1000000); // base 1e6
      withdrawLqProto.setTokenAddr(item.token_addr);
      withdrawLqProto.setRatio(Number(item.ratio) * 1000000); // 100000000
      total_estimated_received_amt = BigNumber.from(item.stimatedReceived).add(total_estimated_received_amt);
      return withdrawLqProto;
    });

    const withdrawReqProto = new WithdrawReqProto();
    withdrawReqProto.setWithdrawsList(WithdrawLqProtoList);
    withdrawReqProto.setExitChainId(selectedLP?.chain.id);
    withdrawReqProto.setReqId(timestamp);
    withdrawReqProto.setWithdrawType(WithdrawType.WITHDRAW_TYPE_REMOVE_LIQUIDITY);
    let sig;
    try {
      sig = await signer.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(withdrawReqProto.serializeBinary())));
    } catch (error) {
      setLoading(false);
      return;
    }

    const bytes = ethers.utils.arrayify(sig);

    const req = new WithdrawLiquidityRequest();
    req.setWithdrawReq(withdrawReqProto.serializeBinary());
    req.setSig(bytes);
    req.setEstimatedReceivedAmt(total_estimated_received_amt.toString());
    req.setMethodType(WithdrawMethodType.WD_METHOD_TYPE_ALL_IN_ONE);

    const withdrawResult = await withdrawLiquidity(req);
    if (withdrawResult) {
      setTransfState(LPHistoryStatus.LP_WAITING_FOR_SGN);
    }
    if (withdrawResult.getErr()) {
      if (Number(withdrawResult.getErr()?.getCode()) === 1003) {
        setTransfState(LPHistoryStatus.LP_FAILED);
        setLoading(false);
      } else {
        // message.error("Withdraw Liquidity Failed!");
        onClose();
      }
    } else {
      const seq_num = withdrawResult.getSeqNum().toString() || "";
      setSeqNum(seq_num);
      removeStatusInterval = setInterval(async () => {
        const res = await queryLiquidityStatus({
          seq_num,
          lp_addr: address,
          chain_id: selectedLP?.chain?.id,
          type: LPType.LP_TYPE_REMOVE,
        });
        if (res?.status) {
          const status = res.status;
          if (status === LPHistoryStatus.LP_WAITING_FOR_SGN) {
            //   setTransfState(status);
          } else if (status === LPHistoryStatus.LP_FAILED) {
            setTransfState(status);
            setLoading(false);
            clearInterval(removeStatusInterval);
          } else if (status === LPHistoryStatus.LP_WAITING_FOR_LP) {
            setTransfState(status);
            const { wd_onchain, sorted_sigs, signers, powers } = res;
            setWithdrawDetail({
              _wdmsg: wd_onchain,
              _sigs: sorted_sigs,
              _signers: signers,
              _powers: powers,
            });
            setLoading(false);
            clearInterval(removeStatusInterval);
          }
        } else if (res?.status === LPHistoryStatus.LP_UNKNOWN) {
          console.error("status: " + res.status);
        } else {
          clearInterval(removeStatusInterval);
        }
      }, 5000);
    }
  };
  // Contract remove liquidity method
  const confirmRemoveLiquidityMethod = async () => {
    if (!lpbridge || !withdrawDetail || !transactor) {
      return;
    }
    setLoading(true);
    const { _wdmsg, _signers, _sigs, _powers } = withdrawDetail;

    const wdmsg = base64.decode(_wdmsg);

    const signers = _signers.map(item => {
      const decodeSigners = base64.decode(item);
      const hexlifyObj = hexlify(decodeSigners);
      return getAddress(hexlifyObj);
    });
    const sigs = _sigs.map(item => {
      return base64.decode(item);
    });
    const powers = _powers.map(item => {
      const decodeNum = base64.decode(item);
      return BigNumber.from(decodeNum);
    });
    try {
      setLoading(true);
      let maxT = BigNumber.from(0);
      let currentVolume = BigNumber.from(0);
      if (lpbridge) {
        maxT = await lpbridge.epochVolumeCaps(selectedLP?.token?.token?.address);
        maxT = maxT.mul(98).div(100);
        currentVolume = await lpbridge.epochVolumes(selectedLP?.token?.token?.address);
      }
      const currentValue = BigNumber.from(totalEstimatedAmt);
      const totalValue = currentValue.add(currentVolume);
      if (!maxT.eq(0) && totalValue.gte(maxT)) {
        setLoading(false);
        setShowExceedSafeguardModal(true);
        return;
      }
      const resultTx = await transactor(lpbridge.withdraw(wdmsg, sigs, signers, powers)).catch(e => {
        console.log("catch tx error", e);
        setTransfState(LPHistoryStatus.LP_WAITING_FOR_LP);
        setLoading(false);
      });
      if (resultTx) {
        const newtxStr = JSON.stringify(resultTx);
        const newtx = JSON.parse(newtxStr);
        if (resultTx instanceof Error || newtx.code) {
          console.log("get before error", resultTx);
          setTransfState(LPHistoryStatus.LP_WAITING_FOR_LP);
          setLoading(false);
        } else {
          // await markLiquidity({
          //   lp_addr: address,
          //   amt: totalEstimatedAmt.toString(),
          //   token_addr: selectedLP?.token?.token?.address,
          //   chain_id: selectedLP?.chain?.id,
          //   seq_num: seqNum,
          //   tx_hash: resultTx.hash,
          //   type: LPType.LP_TYPE_REMOVE,
          // });
          const newLPJson: LPHistory = {
            withdraw_id: "",
            amount: totalEstimatedAmt.toString(),
            block_tx_link: `${getNetworkById(selectedLP?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`,
            chain: selectedLP?.chain,
            method_type: 2,
            seq_num: Number(seqNum),
            status: LPHistoryStatus.LP_SUBMITTING,
            token: selectedLP?.token,
            ts: new Date().getTime(),
            updateTime: new Date().getTime(),
            type: LPType.LP_TYPE_REMOVE,
            nonce: resultTx.nonce,
            isLocal: true,
          };
          const localLpListStr = localStorage.getItem("LpList");
          let localLpList: LPHistory[] = [];
          if (localLpListStr) {
            localLpList = JSON.parse(localLpListStr)[address] || [];
          }
          localLpList.unshift(newLPJson);
          const newJson = { [address]: localLpList };
          localStorage.setItem("LpList", JSON.stringify(newJson));

          // const queryStatusRes = await queryLiquidityStatus({
          //   seq_num: seqNum,
          //   lp_addr: address,
          //   chain_id: selectedLP?.chain?.id,
          //   type: LPType.LP_TYPE_REMOVE,
          // });
          setViewInExploreLink(`${getNetworkById(selectedLP?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`);
          setTransfState(LPHistoryStatus.LP_COMPLETED);
          setLoading(false);
          // removeStatusInterval = setInterval(async () => {
          //   const res = await queryLiquidityStatus({
          //     seq_num: seqNum,
          //     lp_addr: address,
          //     chain_id: selectedLP?.chain?.id,
          //     type: LPType.LP_TYPE_REMOVE,
          //   });
          //   if (res?.status) {
          //     const status = res.status;
          //     if (
          //       status === LPHistoryStatus.LP_COMPLETED ||
          //       status === LPHistoryStatus.LP_COMPLETED_NUMBER ||
          //       status === LPHistoryStatus.LP_FAILED ||
          //       status === LPHistoryStatus.LP_FAILED_NUMBER
          //     ) {
          //       clearInterval(removeStatusInterval);
          //       setLoading(false);
          //       setTransfState(status);
          //     } else {
          //       // setTransfState(status);
          //     }
          //   } else {
          //     setLoading(false);
          //     clearInterval(removeStatusInterval);
          //   }
          // }, 5000);
          try {
            const receipt = await resultTx.wait();
            if (Number(receipt?.status) !== 1) {
              setTransfState(LPHistoryStatus.LP_WAITING_FOR_LP);
              setLoading(false);
            }
          } catch (e) {
            setTransfState(LPHistoryStatus.LP_WAITING_FOR_LP);
            setLoading(false);
          }
        }
      }
    } catch (e) {
      setLoading(false);
    } finally {
      //   setLoading(false);
    }
  };

  if (selectedLP?.chain?.id !== chainId) {
    content = (
      <div className={classes.modalTop}>
        <div style={{ textAlign: "center" }}>
          <WarningFilled style={{ fontSize: 50, color: "#ffaa00", marginTop: 40 }} />
        </div>
        <div className={classes.modaldes}>
          Please switch to <div className={classes.yellowText}>{selectedLP?.chain?.name} </div> before you can aggregate
          and remove liquidity on this chain.
        </div>
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={() => {
            if (!isMobile) {
              switchChain(selectedLP?.chain?.id, "");
            } else {
              closeModalFunc();
            }
          }}
          className={classes.button}
        >
          OK
        </Button>
      </div>
    );
    titleText = "";
  } else if (transfState === LPHistoryStatus.LP_WAITING_FOR_SGN) {
    content = (
      <>
        <div className={classes.modalTop}>
          <div className={classes.modaldesLarg} style={{ marginTop: 60 }} />
          <div className={classes.modalTopIcon} style={{ marginBottom: 52 }}>
            <LoadingOutlined style={{ fontSize: 50, fontWeight: "bold", color: "#3366FF" }} />
          </div>
          <div className={classes.modalToptext}>Waiting for Celer SGN Confirmations...</div>
          <div className={classes.modaldesmid}>
            Your request to aggregate & remove liquidity is being confirmed by Celer State Guardian Network (SGN), which
            might take a few minutes.
          </div>
        </div>
      </>
    );
    titleText = " ";
  } else if (transfState === LPHistoryStatus.LP_WAITING_FOR_LP) {
    content = (
      <>
        <div className={classes.modalTop}>
          <div className={classes.modaldesLarg}>{`Aggregate & Remove Liquidity to ${selectedLP?.chain?.name}`}</div>

          <div className={classes.modaldesmid}>
            Please click the button to complete the liquidity aggregation and removal process.
          </div>
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={() => {
              confirmRemoveLiquidityMethod();
            }}
            className={classes.button}
            style={{ fontSize: isMobile ? 12 : 18 }}
          >
            Confirm Liquidity Aggregation and Removal
          </Button>
        </div>
        <ExceedSafeguardModal visible={showExceedSafeguardModal} onCancel={() => setShowExceedSafeguardModal(false)} />
      </>
    );
    titleText = " ";
  } else if (transfState === LPHistoryStatus.LP_COMPLETED) {
    content = (
      <div className={classes.modalTop}>
        <div className={classes.modalTopIcon} style={{ marginTop: 0 }}>
          <CheckCircleFilled
            style={{
              fontSize: 70,
              fontWeight: "bold",
              color: themeType === "dark" ? "#00E096" : "#00B42A",
              marginTop: 40,
            }}
          />
        </div>
        <div className={classes.modaldesLarg}>{getBigAmountModalMsg()}</div>
        <div className={classes.noteview}>
          <div className={classes.noteview}>
            <a href={viewInExploreLink} target="_blank" rel="noreferrer">
              View in Explorer
            </a>
          </div>
        </div>
        <Button
          type="primary"
          size="large"
          block
          onClick={() => {
            closeModalFunc();
          }}
          className={classes.button}
        >
          OK
        </Button>
      </div>
    );
    titleText = " ";
  } else if (transfState === LPHistoryStatus.LP_FAILED) {
    content = (
      <>
        <div className={classes.modalTop}>
          <div className={classes.modaldes} style={{ marginBottom: 30 }}>
            The transaction has been canceled because the slippage tolerance has been exceeded.
          </div>
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={() => {
              closeModalFunc();
            }}
            className={classes.button}
          >
            OK
          </Button>
        </div>
      </>
    );

    titleText = " ";
  } else if (transfState === "confirmationAlert") {
    content = (
      <div>
        <div style={{ textAlign: "center" }}>
          <WarningFilled style={{ fontSize: 90, color: "#ffaa00", marginTop: 79 }} />
        </div>
        <div className={classes.modaldes}>
          By continuing, your liquidity will be aggregated and removed. The operation cannot be undone. Are you sure you
          want to continue the liquidity aggregation and removal?
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={() => {
              setTransfState("init");
            }}
            className={classes.button}
          >
            Cancel
          </Button>
          <span style={{ width: 20 }} />
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={() => {
              setTransfState("init");
              removeLiquidityMethod();
            }}
            className={classes.button}
          >
            Continue
          </Button>
        </div>
      </div>
    );
    titleText = "";
  } else {
    content = (
      <div>
        <div className={classes.autoSlid} id="slid">
          <div className={classes.title}>With a single operation, you can:</div>
          <div>
            <div className={classes.desc}>
              1. Aggregate your liquidity from multiple chains to {selectedLP.chain.name}
            </div>
            <div className={classes.desc}>2. Remove the aggregated liquidity from {selectedLP.chain.name}</div>
          </div>
          <div className={classes.descsel}>Please select the liquidity share you want to remove from each chain.</div>
          <div>
            {singleChainList?.map((item, index) => {
              return (
                <SingleChain
                  record={item}
                  showChain={() => showChain("SingleChain")}
                  chainToken={selectedLP.token.token}
                  index={index}
                  key={item.key}
                  onSuccess={() => setNoTokenOnDst(false)}
                  onError={errMsg => setNoTokenOnDst(errMsg.code === ErrCode.ERROR_CODE_NO_ENOUGH_TOKEN_ON_DST_CHAIN)}
                />
              );
            })}
          </div>
        </div>
        {/* {!addbtnDisabled && ( */}
        <div className={classes.btnOut}>
          <Button type="primary" className={classes.addbutton} disabled={addbtnDisabled} onClick={() => addItem()}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <PlusCircleOutlined style={{ fontSize: 18, marginRight: 5 }} /> Add more chains
            </div>
          </Button>
        </div>
        {/* )} */}

        <div>
          <div className={classes.descripet} style={{ padding: isMobile ? "10px 10px" : "18px 20px" }}>
            <div className={classes.descripetItem}>
              <div className={classes.leftCon}>
                <span className={classes.leftTitle}>
                  <Tooltip
                    title={
                      <div>
                        This is estimated only. The actual received amount might vary when this transaction is executed.
                        <div>
                          <span style={{ whiteSpace: "pre-wrap" }}>{`\n`}</span>
                          <span style={{ fontWeight: "bold" }}>Fee</span>{" "}
                          {`: ${formatDecimal(fee, selectedLP?.token.token.decimal)}  ${getTokenSymbol(
                            selectedLP?.token.token.symbol,
                            selectedLP?.chain.id,
                          )} `}
                        </div>
                        <div>
                          <div>
                            <span style={{ fontWeight: "bold" }}>Slippage Tolerance</span>
                            {`: ${Number(singleChainRate)}%`}
                          </div>
                        </div>
                      </div>
                    }
                    placement="top"
                    color="#fff"
                    overlayInnerStyle={{ color: "#000", width: 265 }}
                  >
                    <InfoCircleOutlined className={classes.titleIcon} />
                  </Tooltip>
                  <div className={classes.titleInfo}>
                    <span>Estimated Received Amount on {selectedLP?.chain.name} </span>
                    <img src={selectedLP?.chain.icon} alt="" className={classes.chainIconSmall} />
                  </div>
                </span>
              </div>
              <div className={classes.rightContent}>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    handleOpenRateModal();
                  }}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <img src={settingIcon} className={classes.settingIcon} alt="setting icon" />
                  {showRateModal && (
                    <RateModal
                      onCancle={() => {
                        handleCloseRateModal();
                      }}
                      source="singleChain"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className={classes.descripetItem}>
              <div className={classes.itemText} style={{ marginTop: isMobile ? 6 : 3 }}>
                {formatDecimal(totalEstimatedAmt, selectedLP?.token.token.decimal)}{" "}
                {getTokenSymbol(selectedLP?.token.token.symbol, selectedLP?.chain.id)}
              </div>
            </div>
          </div>
          <div className={classes.err}>
            <div className={classes.errInner}>{errorMsg}</div>
          </div>
          <Button
            type="primary"
            size="large"
            block
            disabled={hasError || totalEstimatedAmt === "0" || aggBtnDisabled || !hasFetchedSafeguard || noTokenOnDst}
            loading={loading}
            onClick={() => {
              setTransfState("confirmationAlert");
            }}
            className={classes.button}
          >
            Aggregate and Remove Liquidity
          </Button>
        </div>
      </div>
    );
    titleText = "Aggregate & Remove Liquidity";
  }

  return isMobile ? (
    <Modal
      title={titleText}
      width="100%"
      onCancel={closeModalFunc}
      visible={showModal}
      footer={null}
      maskClosable={false}
      destroyOnClose
      className={classes.removeModal}
      bodyStyle={{ padding: "24px 12px 24px 12px" }}
      centered={!!(singleChainList.length > 1 && transfState === "init")}
    >
      {content}
    </Modal>
  ) : (
    <Modal
      title={titleText}
      width={transfState === "init" && selectedLP?.chain?.id === chainId ? 622 : 512}
      onCancel={closeModalFunc}
      visible={showModal}
      footer={null}
      maskClosable={false}
      destroyOnClose
      className={classes.removeModal}
      bodyStyle={{ padding: "24px 18px 24px 18px" }}
      centered={!!(singleChainList.length > 1 && transfState === "init")}
    >
      {content}
    </Modal>
  );
};

export default SingleChainModal;
