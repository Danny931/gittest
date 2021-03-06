import { FC, useCallback, useEffect, useState } from "react";
import { Card, Button, Avatar, Tooltip, Modal } from "antd";
import { createUseStyles } from "react-jss";
import { useLocation } from "react-router-dom";
import { useToggle, useNetworkState } from "react-use";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { debounce } from "lodash";
import { WarningFilled, InfoCircleOutlined, DownOutlined, CloseCircleFilled } from "@ant-design/icons";
import { deleteDecimalPart } from "celer-web-utils/lib/format";

import { ERC20 } from "../typechain/ERC20";
import { ERC20__factory } from "../typechain/factories/ERC20__factory";

import { useContractsContext } from "../providers/ContractsContextProvider";
import { useWeb3Context } from "../providers/Web3ContextProvider";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { closeModal, ModalName, openModal } from "../redux/modalSlice";

import {
  setIsChainShow,
  setChainSource,
  setTokenList,
  setFromChain,
  setToChain,
  setSelectedToken,
  setSelectedTokenSymbol,
  switchChain,
  setEstimateAmtInfoInState,
  setRefreshHistory,
} from "../redux/transferSlice";

import { useCustomContractLoader, useTokenBalance, useBigAmountDelay, useNativeETHToken } from "../hooks";
import { formatDecimal, formatPercentage } from "../helpers/format";
import { TokenInfo } from "../constants/type";
import { Theme } from "../theme";

import ProviderModal from "../components/ProviderModal";
import TransferModal from "../components/transfer/NewTransferModal";
import TokenInput, { ITokenInputChangeEvent } from "../components/TokenInput";
import TokenList from "../components/transfer/NewTokenList";

import settingIcon from "../images/setting.svg";
import arrowUpDowm from "../images/arrowupdown.svg";
import arrowDowm from "../images/arrow-D.svg";
import RateModal from "../components/RateModal";
import TransferOverview, { getTokenDisplaySymbol } from "./transfer/TransferOverview";
import { WebClient } from "../proto/sgn/gateway/v1/GatewayServiceClientPb";
import { EstimateAmtRequest, ErrCode } from "../proto/sgn/gateway/v1/gateway_pb";
import { minimum, maximum } from "../helpers/calculation";
import { getTokenSymbol } from "../redux/assetSlice";
import { PeggedChainMode, usePeggedPairConfig } from "../hooks/usePeggedPairConfig";

/* eslint-disable*/
/* eslint-disable no-debugger */
/* eslint-disable camelcase */
const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  flexCenter: {
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  transferCard: {
    position: "relative",
    width: "100%",
    maxWidth: 624,
    marginTop: props => (props.isMobile ? 0 : 45),
    borderRadius: props => (props.isMobile ? 0 : 16),
    background: props => (props.isMobile ? "transparent" : theme.secondBackground),
    border: props => (props.isMobile ? "none" : `1px solid ${theme.primaryBorder}`),
    "& .ant-card-head": {
      color: theme.primaryBrand,
      fontSize: 22,
      borderBottom: `1px solid ${theme.primaryBorder}`,
      padding: "30px 32px 10px 32px",
      fontWeight: 700,
    },
    "& .ant-card-body": {
      padding: props => (props.isMobile ? "18px 16px 24px 16px" : 32),
    },
    "& .ant-card-head-title": {
      padding: "0",
      lineHeight: 1,
      marginBottom: 7,
      height: "25px",
    },
    "& .ant-card-extra": {
      padding: "0",
      lineHeight: 1,
    },
  },
  settingIcon: {
    width: 24,
    color: theme.secondBrand,
  },
  contCover: {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    background: theme.transferCover,
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 10,
  },
  cardContent: {
    position: "relative",
    width: props => (props.isMobile ? "100%" : 560),
  },
  trans: {},
  err: {
    width: "100%",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: props => (props.isMobile ? 0 : 24),
  },
  btnare: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    zIndex: 15,
  },
  btnarein: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  transBtn: {
    width: 560,
    margin: "0",
    height: 56,
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 16,
    background: theme.primaryBrand,
    border: 0,
  },
  cont: {
    width: "100%",
    //  fontSize: theme.transferFontS,
  },
  transMobileBtn: {
    marginTop: 20,
    width: "calc(100vw - 32px)",
    height: 55,
    fontSize: 16,
    borderRadius: 16,
    background: theme.primaryBrand,
    border: 0,
    fontWeight: 700,
  },
  transitem: {},
  transitemTitle: {
    //   background: theme.dark.contentBackground,
    color: theme.surfacePrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // padding: "0 12px",
  },
  transcontent: {
    borderRadius: "16px",
    background: theme.primaryBackground,
    padding: "15px 0",
    marginTop: 8,
  },
  transInfoItem: {
    display: "flex",
    justifyContent: "space-between",
  },
  transInfoTitle: {
    color: theme.secondBrand,
    fontSize: 12,
    fontWeight: 600,
  },
  transInfoContent: {
    color: theme.unityBlack,
    fontSize: 12,
    fontWeight: 600,
    "& img": {
      width: 16,
      height: 16,
    },
  },
  icon: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: props => (props.isMobile ? "17px 0" : "13px 0"),
  },
  source: {
    display: "inline-block",
    marginRight: 8,
    fontSize: 14,
    width: props => (props.isMobile ? "" : 35),
  },
  transselect: {
    background: theme.primaryBackground,
    display: "inline-block",
    minWidth: 100,
    borderRadius: 100,
  },
  transChainame: {
    fontSize: props => (props.isMobile ? 12 : 14),
    fontWeight: props => (props.isMobile ? 400 : 500),
    textAlign: props => (props.isMobile ? "right" : ""),
  },
  transnum: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    marginTop: 3,
    color: theme.secondBrand,
  },
  transnumtext: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.secondBrand,
  },
  transnumlimt: {
    borderBottom: "1px solid #8F9BB3",
    cursor: "pointer",
    fontSize: 12,
  },

  transndes: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    marginTop: 18,
    fontSize: 20,
  },
  transdestext: {
    //   fontSize: theme.transferFontXl,
    color: theme.surfacePrimary,
    flex: 2,
    "& .ant-input::-webkit-input-placeholder": {
      color: `${theme.surfacePrimary} !important`,
    },
  },
  transdeslimt: {
    position: "relative",
    flex: 1,
  },
  investSelct: {
    display: "flex",
    position: "absolute",
    top: -13,
    right: 0,
    alignItems: "baseline",
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
  selectdes: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: 16,
    fontWeight: 600,
    color: theme.surfacePrimary,
  },
  selecttoog: {
    height: 14,
    color: theme.surfacePrimary,
  },

  chainSelcet: {
    borderRadius: "100px",
    background: theme.primaryBackground,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 8,
    paddingRight: 10,
    height: 40,
    fontSize: 16,
    fontWeight: 600,
  },
  msgBoldInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    color: "#17171A",
    fontWeight: "bold",
    textAlign: props => (props.isMobile ? "left" : "center"),
    margin: "8px 12px",
  },
  msgInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    color: "black",
    textAlign: props => (props.isMobile ? "left" : "center"),
    margin: "8px 12px",
  },
  warningInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    color: theme.infoWarning,
    textAlign: props => (props.isMobile ? "left" : "center"),
    margin: "8px 12px",
  },
  warningMessage: {
    color: theme.textWarning,
  },
  errInner: {
    color: theme.infoDanger,
    textAlign: "left",
    margin: props => (props.isMobile ? "24px 0 0 0" : "24px 0"),
    background: "#fff",
    boxShadow: "0px 6px 12px -6px rgba(24, 39, 75, 0.12), 0px 8px 24px -4px rgba(24, 39, 75, 0.08)",
    borderRadius: 8,
    fontSize: 14,
  },
  errInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "8px 12px",
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
  setting: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 432,
    height: 156,
    background: theme.secondBackground,
    borderRadius: 16,
    border: `1px solid ${theme.primaryBorder}`,
  },
  settingTitle: {
    color: theme.surfacePrimary,
    fontSize: 13,
  },
  settingContent: {},
  transcontenttip: {
    fontSize: 12,
    fontWeight: 400,
    color: theme.unityBlack,
  },
  tipTitle: {
    fontSize: 13,
    width: "100%",
    textAlign: "center",
    fontWeight: 400,
    marginBottom: 10,
  },
  mobileTooltipOverlayStyle: {
    "& .ant-tooltip-inner": {
      width: "calc(100vw - 40px) !important",
      borderRadius: 8,
    },
    "& .ant-tooltip-arrow-content": {
      width: 9,
      height: 9,
    },
  },
  mobileRateModal: {
    width: "calc(100% - 32px)",
    minWidth: "calc(100% - 32px)",
    border: `1px solid ${theme.primaryBorder}`,
    borderRadius: 16,
    height: "auto",
    margin: 8,
    "& .ant-modal-content": {
      background: theme.primaryBackground,
      borderRadius: 16,
      "& .ant-modal-header": {
        background: "transparent",
        borderRadius: 16,
      },
      "& .ant-modal-body": {
        padding: "16px 16px",
        background: "transparent",
      },
    },
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
    fontSize: 14,
    color: theme.infoDanger,
    textAlign: "left",
  },
  warningMsg: {
    fontSize: 14,
    color: theme.infoWarning,
    textAlign: "left",
  },
}));

let maxAmount = "0";

const Transfer: FC = () => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const {
    contracts: { bridge, originalTokenVault, peggedTokenBridge },
  } = useContractsContext();

  const { provider, signer, chainId, address } = useWeb3Context();
  const dispatch = useAppDispatch();
  const networkState = useNetworkState();
  const { transferInfo, modal, globalInfo } = useAppSelector(state => state);
  const { refreshGlobalTokenBalance, cBridgeDesAddresses } = globalInfo;

  // const globalTokenBalance = BigNumber.from(globalTokenBalanceString);
  const { showProviderModal, showRateModal, showTransferModal } = modal;
  const {
    transferConfig,
    fromChain,
    toChain,
    tokenList,
    selectedToken,
    estimateAmtInfoInState,
    rate,
    refreshHistory,
    refreshTransferAndLiquidity,
  } = transferInfo;
  const { chain_token, chains } = transferConfig;
  const location = useLocation();
  const segments = location.pathname.split("/").filter(p => p);

  const pegConfig = usePeggedPairConfig();
  const tokenContract = useCustomContractLoader(
    provider,
    pegConfig.getTokenBalanceAddress(selectedToken?.token?.address || ""),
    ERC20__factory,
  ) as ERC20 | undefined;

  const [tokenBalance, , , refreshBlance] = useTokenBalance(tokenContract, address);
  const [amount, setAmount] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [safeguardMaxAmount, setSafeguardMaxAmount] = useState<BigNumber>();
  const [exceedsSafeguard, setExceedsSafeguard] = useState(true);
  const [errorMsg, setErrorMsg] = useState<JSX.Element>(<div />);
  const [hasError, setHasError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isTokenShow, toggleIsTokenShow] = useToggle(false);
  const [fee, setFee] = useState(0);
  const [minSendValue, setMinSendValue] = useState<BigNumber>();
  const [tokenEnabled, setTokenEnabled] = useState(true);
  const { isNativeETHToken, ETHBalance } = useNativeETHToken(fromChain, selectedToken);
  const { isBigAmountDelayed, delayMinutes, delayThresholds } = useBigAmountDelay(
    toChain,
    selectedToken?.token,
    receiveAmount,
  );
  const [noTokenOnDst, setNoTokenOnDst] = useState(false);
  const setTokenMethod = (symbol?: string) => {
    if (!tokenList) {
      return;
    }
    const targetToken: TokenInfo = tokenList.find(token => token.token.symbol === symbol) || tokenList[0];
    dispatch(setSelectedToken(targetToken));
    dispatch(setSelectedTokenSymbol(targetToken?.token.symbol));
    toggleIsTokenShow();
    setAmount("");
    setMaxValue("");
    setReceiveAmount(0);
    setFee(0);
    setSafeguardMaxAmount(undefined);
  };

  const getTokenByChainAndTokenSymbol = (chainId, tokenSymbol) => {
    return transferConfig?.chain_token[chainId]?.token.find(tokenInfo => tokenInfo?.token?.symbol === tokenSymbol);
  };

  // Highlight current token when first loaded.
  useEffect(() => {
    let tokenSymbol = selectedToken?.token.symbol || "";
    dispatch(setSelectedTokenSymbol(tokenSymbol));
  }, [isTokenShow]);
  useEffect(() => {
    refreshBlance();
  }, [refreshGlobalTokenBalance]);

  const initData = () => {
    setAmount("");
    setMaxValue("");
    setReceiveAmount(0);
    setFee(0);
    dispatch(setEstimateAmtInfoInState(null));
    setNoTokenOnDst(false);
  };
  // ??????fromChain???toChain???token??????
  useEffect(() => {
    initData();
  }, [fromChain]);

  useEffect(() => {
    debouncedSave({
      fromChain,
      toChain,
      token: selectedToken,
      val: amount,
      addr: address,
      network: networkState,
      rate,
      minSendVal: minSendValue,
    });
  }, [selectedToken]);

  useEffect(() => {
    if (!selectedToken || !bridge) {
      return;
    }
    bridge
      ?.minSend(selectedToken.token.address)
      .then(res => {
        setMinSendValue(res);
      })
      .catch(e => {
        console.log(e);
      });
  }, [selectedToken, bridge]);

  const generateErrMsg = (msg: string, iconType = "WarningFilled") => {
    return (
      <div className={classes.errInnerbody}>
        {iconType === "WarningFilled" ? (
          <WarningFilled style={{ fontSize: 20, marginRight: 5 }} />
        ) : (
          <CloseCircleFilled style={{ fontSize: 20, marginRight: 5 }} />
        )}
        <span style={{ fontSize: 14, marginLeft: 10 }}>{msg}</span>
      </div>
    );
  };
  const generateWaringMsg = (msg: string) => {
    return (
      <div className={classes.warningInnerbody}>
        <WarningFilled style={{ fontSize: 20, marginRight: 5 }} />
        <span className={classes.warningMessage}>{msg}</span>
      </div>
    );
  };

  const bigAmountDelayedMsg = (tokenSymbol: string, minutes: string) => {
    return (
      <div style={{ display: "inline-flex" }}>
        <div className={classes.warningInnerbody} style={{ display: "inline-flex", margin: "8px 0px 8px 12px" }}>
          <WarningFilled style={{ fontSize: 20, marginRight: 10 }} />
        </div>
        <div style={{ display: "inline", margin: "8px 0px" }}>
          <span className={classes.msgInnerbody} style={{ display: "inline", margin: "0px" }}>
            {`Transfer of more than ${delayThresholds} ${tokenSymbol} takes`}
          </span>
          <span className={classes.msgBoldInnerbody} style={{ display: "inline", margin: "0px 4px" }}>
            {`up to ${minutes} minutes`}
          </span>
          <span className={classes.msgInnerbody} style={{ display: "inline", margin: "0px 12px 0px 0px" }}>
            to complete.
          </span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // reset token enable status when switch the token
    setTokenEnabled(true);
    setNoTokenOnDst(false);
  }, [selectedToken]);

  useEffect(() => {
    setTokenEnabled(true);
    setNoTokenOnDst(false);
    setExceedsSafeguard(false);

    debouncedSave({
      fromChain,
      toChain,
      token: selectedToken,
      val: amount,
      addr: address,
      network: networkState,
      rate,
      minSendVal: minSendValue,
    });
  }, [pegConfig]);

  // error ??????
  useEffect(() => {
    setHasError(false);
    setErrorMsg(<div />);

    if (!networkState.online) {
      setHasError(true);
      return setErrorMsg(generateErrMsg(`Network error. Please check your Internet connection.`, "CloseCircleFilled"));
    }
    if (!signer) {
      return;
    }
    if (!tokenEnabled) {
      setHasError(true);
      setErrorMsg(
        generateErrMsg(
          `${getTokenSymbol(selectedToken?.token?.symbol, toChain?.id)} transfer to ${
            toChain?.name
          } is not yet supported.`,
        ),
      );
      return;
    }
    if (noTokenOnDst) {
      setHasError(true);
      setErrorMsg(
        generateErrMsg(
          `Insufficient liquidity on ${toChain?.name}. You may reduce your transfer amount.`,
          "CloseCircleFilled",
        ),
      );
      return;
    }
    if (fromChain && toChain && fromChain?.id === toChain?.id) {
      setHasError(true);
      return setErrorMsg(generateErrMsg(`Cannot transfer on the same chain.`));
    }
    if (fromChain && fromChain?.id !== chainId) {
      setHasError(true);
      return setErrorMsg(
        <div className={classes.errInnerbody}>
          <WarningFilled style={{ fontSize: 20, marginRight: 5, color: "#ff8f00" }} />
          <span style={{ color: "#17171A", marginTop: 3 }}>
            You must switch to <span style={{ fontWeight: "bold" }}> {fromChain?.name} </span>
            to begin the transfer.
          </span>
        </div>,
      );
    }
    const validFloatRegex = /^[0-9]+[.]?[0-9]*$/;
    if ((!validFloatRegex.test(amount) && amount) || Number(amount) < 0) {
      setHasError(true);
      return setErrorMsg(generateErrMsg("Please enter a valid number"));
    }
    let amountStr = "0";
    if (!isNaN(Number(amount))) {
      amountStr = Number(amount).toString() || "0";
    }
    let value = BigNumber.from(0);
    try {
      value = parseUnits(amountStr, selectedToken?.token?.decimal);
    } catch {
      setHasError(true);
      return setErrorMsg(generateErrMsg(`The input amount is too small or exceeds the maximum.`));
    }
    // if the entered transfer amount is smaller than the fee,
    if (fee > Number(amount) && Number(amount) > 0) {
      setHasError(true);
      setErrorMsg(generateErrMsg(`The received amount cannot cover fee.`));
      return;
    }
    if (value.gt(isNativeETHToken ? ETHBalance : tokenBalance)) {
      setHasError(true);
      return setErrorMsg(generateErrMsg(`Insufficient balance.`));
    }
    if (minSendValue && value.lte(minSendValue) && Number(amount) > 0 && estimateAmtInfoInState) {
      const minsendNum = Number(formatDecimal(minSendValue, selectedToken?.token?.decimal).split(",").join(""));
      setHasError(true);
      return setErrorMsg(
        generateErrMsg(
          `The transfer amount must be greater than ${minsendNum} ${getTokenSymbol(
            selectedToken?.token?.symbol,
            fromChain?.id,
          )}.`,
        ),
      );
    }

    if (estimateAmtInfoInState && safeguardMaxAmount && value.gt(safeguardMaxAmount)) {
      setExceedsSafeguard(true);
      const formatedAmount = formatUnits(safeguardMaxAmount.toString(), selectedToken?.token.decimal);
      setHasError(true);
      setErrorMsg(
        generateErrMsg(
          `In this beta release, the maximum transfer amount is
          ${deleteDecimalPart(formatedAmount.toString())}
          ${getTokenSymbol(selectedToken?.token.symbol, fromChain?.id)}. Please reduce your transfer amount.`,
          "CloseCircleFilled",
        ),
      );
      return;
    }

    setExceedsSafeguard(false);
    if (isBigAmountDelayed && estimateAmtInfoInState && !exceedsSafeguard && !loading) {
      const tokenSymbol = getTokenSymbol(selectedToken?.token?.symbol, toChain?.id);
      setHasError(false);
      setErrorMsg(bigAmountDelayedMsg(tokenSymbol, delayMinutes));
      return;
    }
    if (bridgeRate < 0.9) {
      //warning ???????????????
      setErrorMsg(generateWaringMsg("The current bridge rate for your transfer is low. Please proceed with caution."));
      return;
    }
  }, [
    amount,
    chainId,
    fromChain,
    toChain,
    signer,
    // transferConfig,
    // globalTokenBalance,
    networkState,
    tokenBalance,
    fee,
    estimateAmtInfoInState,
    // rate,
    tokenEnabled,
    safeguardMaxAmount,
    exceedsSafeguard,
    selectedToken,
    isNativeETHToken,
    ETHBalance,
    isBigAmountDelayed,
    pegConfig,
    noTokenOnDst,
  ]);

  useEffect(() => {
    if (segments[0] === "transfer" && Number(amount) > 0) {
      debouncedSave({
        fromChain,
        toChain,
        token: selectedToken,
        val: amount,
        addr: address,
        network: networkState,
        rate,
        minSendVal: minSendValue,
      });
    }
  }, [refreshTransferAndLiquidity]);

  const renderCardSetting = () => {
    return (
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
          />
        )}
      </div>
    );
  };

  const showChain = type => {
    if (!signer) {
      return;
    }
    dispatch(setChainSource(type));
    dispatch(setIsChainShow(true));
  };
  const getRelayNodeInfo = async item => {
    if (!item.network.online) {
      setHasError(true);
      setErrorMsg(generateErrMsg(`Network error. Please check your Internet connection.`, "CloseCircleFilled"));
      return;
    }

    if (Number(item.val) < 0 || isNaN(Number(item.val))) {
      return;
    }
    const { fromChain: selectedFromChain, toChain: selectedToChain, token: targetToken, addr } = item;
    let value = BigNumber.from(0);
    try {
      value = parseUnits(item.val || "0", targetToken?.token?.decimal);
    } catch (e) {}
    if (Number(item.val) > 0) {
      setLoading(true);
      let maxT = BigNumber.from(0);
      let minAmt = BigNumber.from(0);
      let maxAmt = BigNumber.from(0);

      switch (pegConfig.mode) {
        case PeggedChainMode.Deposit:
          if (originalTokenVault) {
            maxT = await originalTokenVault.epochVolumeCaps(pegConfig.config.org_token.token.address);
            maxT = maxT.mul(98).div(100);
            minAmt = await originalTokenVault.minDeposit(pegConfig.config.org_token.token.address);
            maxAmt = await originalTokenVault.maxDeposit(pegConfig.config.org_token.token.address);
          }
          break;
        case PeggedChainMode.Burn:
          if (peggedTokenBridge) {
            maxT = await peggedTokenBridge.epochVolumeCaps(pegConfig.config.pegged_token.token.address);
            maxT = maxT.mul(98).div(100);
            minAmt = await peggedTokenBridge.minBurn(pegConfig.config.pegged_token.token.address);
            maxAmt = await peggedTokenBridge.maxBurn(pegConfig.config.pegged_token.token.address);
          }
          break;
        default:
          if (bridge) {
            maxT = await bridge.epochVolumeCaps(selectedToken?.token?.address ?? "");
            maxT = maxT.mul(98).div(100);
            maxAmt = await bridge.maxSend(selectedToken?.token?.address ?? "");
          }
          break;
      }

      if (minAmt.gt(0)) {
        setMinSendValue(minAmt);
      }

      const needsSafeguard = maxT.gt(0) || maxAmt.gt(0);
      if (needsSafeguard) {
        const minValue = minimum(maxAmt, maxT);
        const maxValue = maximum(maxAmt, maxT);
        setSafeguardMaxAmount(minValue.gt(0) ? minValue : maxValue);
      } else {
        setExceedsSafeguard(false);
        setSafeguardMaxAmount(undefined);
      }

      const estimateRequest = new EstimateAmtRequest();
      estimateRequest.setSrcChainId(selectedFromChain.id);
      estimateRequest.setDstChainId(selectedToChain.id);
      estimateRequest.setTokenSymbol(targetToken?.token.symbol);
      estimateRequest.setAmt(value.toString());
      estimateRequest.setUsrAddr(addr);
      estimateRequest.setSlippageTolerance(Number(item.rate) * 10000);
      estimateRequest.setIsPegged(pegConfig.mode !== PeggedChainMode.Off);

      const client = new WebClient(`${process.env.REACT_APP_GRPC_SERVER_URL}`, null, null);

      const res = await client.estimateAmt(estimateRequest, null);

      setLoading(false);
      if (!res?.getErr()) {
        dispatch(setEstimateAmtInfoInState(res.toObject()));
        const feeBigNum = BigNumber.from(res?.getBaseFee()).add(BigNumber.from(res?.getPercFee()));
        const totleFee = feeBigNum.toString() || "0";
        const tgas = Number(
          formatDecimal(totleFee, getTokenByChainAndTokenSymbol(toChain?.id, targetToken?.token?.symbol)?.token.decimal)
            .split(",")
            .join(""),
        );

        const targetReceiveAmounts = res.getEstimatedReceiveAmt();
        const receiveAmounts = formatDecimal(
          targetReceiveAmounts,
          getTokenByChainAndTokenSymbol(toChain?.id, targetToken?.token?.symbol)?.token.decimal,
        )
          .split(",")
          .join("");
        setFee(tgas);
        setReceiveAmount(Number(receiveAmounts));
        setNoTokenOnDst(false);
      } else {
        const response = res.toObject();
        if (
          response.err?.code === ErrCode.ERROR_NO_TOKEN_ON_DST_CHAIN ||
          response.err?.code === ErrCode.ERROR_NO_TOKEN_ON_SRC_CHAIN
        ) {
          setTokenEnabled(false);
        }
        if (response.err?.code === ErrCode.ERROR_CODE_NO_ENOUGH_TOKEN_ON_DST_CHAIN) {
          setNoTokenOnDst(true);
        } else {
          setNoTokenOnDst(false);
        }
        setReceiveAmount(0);
        setFee(0);
        dispatch(setEstimateAmtInfoInState(null));
      }
    } else {
      setReceiveAmount(0);
      setFee(0);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  const debouncedSave = useCallback(
    debounce(nextValue => getRelayNodeInfo(nextValue), 1000),
    [bridge, selectedToken, pegConfig],
  );

  const setMaxAmount = () => {
    if (!signer) {
      return;
    }
    const balance = isNativeETHToken ? ETHBalance : tokenBalance;
    let maxShow = formatDecimal(balance.toString(), selectedToken?.token?.decimal).split(",").join("");
    let maxSen = formatDecimal(balance.toString(), selectedToken?.token?.decimal, selectedToken?.token?.decimal)
      .split(",")
      .join("");
    if (!maxSen) {
      debouncedSave({
        fromChain,
        toChain,
        token: selectedToken,
        val: "0",
        addr: address,
        network: networkState,
        rate,
        minSendVal: minSendValue,
      });
      return;
    }
    setAmount(maxShow.toString());
    setMaxValue(maxSen.toString());
    debouncedSave({
      fromChain,
      toChain,
      token: selectedToken,
      val: maxSen,
      addr: address,
      network: networkState,
      rate,
      minSendVal: minSendValue,
    });

    dispatch(setEstimateAmtInfoInState(null));
    setNoTokenOnDst(false);
    setReceiveAmount(0);
  };

  const handleTokenInputChange = (e: ITokenInputChangeEvent) => {
    if (!signer) {
      return;
    }
    setMaxValue("");
    dispatch(setEstimateAmtInfoInState(null));
    setTokenEnabled(true);
    setAmount(e.value);
    setNoTokenOnDst(false);
    if (e.error) {
      setHasError(true);
      setErrorMsg(generateErrMsg(e.error));
    } else {
      setHasError(false);
    }
    debouncedSave({
      fromChain,
      toChain,
      token: selectedToken,
      val: e.value,
      addr: address,
      network: networkState,
      rate,
      minSendVal: minSendValue,
    });
  };

  const switchMethod = (paramChain, paramToken) => {
    switchChain(paramChain.id, paramToken);
    const newTokenList = chain_token[chainId]?.token;
    dispatch(setTokenList(newTokenList));
    if (newTokenList) {
      const defaultToken = newTokenList[0];
      dispatch(setSelectedToken(defaultToken));
    }
    refreshBlance();
  };

  const exchangeFromAndToChain = () => {
    if (!fromChain || !toChain) {
      return;
    }
    const tmpfromChain = fromChain;
    const tmpChain = toChain;
    dispatch(setToChain(tmpfromChain));
    dispatch(setFromChain(tmpChain));
    localStorage.setItem("selectedTokenSymbol", "");
    if (tmpfromChain.id !== tmpChain.id) {
      switchMethod(tmpChain, "");
    }
  };

  const handleCloseProviderModal = () => {
    dispatch(closeModal(ModalName.provider));
  };
  const handleCloseTransferModal = () => {
    refreshBlance();
    dispatch(setRefreshHistory(!refreshHistory));
    dispatch(closeModal(ModalName.transfer));
  };

  const handleSuccess = () => {
    setAmount("");
    setMaxValue("");
    setReceiveAmount(0);
    setFee(0);
    dispatch(setEstimateAmtInfoInState(null));
  };

  const handleSelectToken = (symbol: string) => {
    if (!tokenList) {
      return;
    }
    setTokenMethod(symbol);
  };

  const onShowProviderModal = useCallback(() => {
    dispatch(openModal(ModalName.provider));
  }, [dispatch]);
  const onShowTransferModal = useCallback(() => {
    dispatch(openModal(ModalName.transfer));
  }, [dispatch]);
  const handleOpenRateModal = () => {
    dispatch(openModal(ModalName.rate));
  };
  const handleCloseRateModal = () => {
    debouncedSave({
      fromChain,
      toChain,
      token: selectedToken,
      val: amount,
      addr: address,
      network: networkState,
      rate,
      minSendVal: minSendValue,
    });
    dispatch(closeModal(ModalName.rate));
  };
  let baseTgas;
  let percTgas;
  let bridgeRate;
  let slippage_tolerance;
  let minimumReceived;
  if (estimateAmtInfoInState) {
    const slippageToleranceNum = (Number(estimateAmtInfoInState.slippageTolerance) / 1000000).toFixed(6);
    const millionBigNum = BigNumber.from(1000000);

    let minimumReceivedNum = BigNumber.from("0");
    if (amount) {
      const amountBn = parseUnits(
        amount,
        getTokenByChainAndTokenSymbol(toChain?.id, selectedToken?.token?.symbol)?.token.decimal,
      );
      minimumReceivedNum = amountBn.sub(
        amountBn.mul(BigNumber.from(estimateAmtInfoInState.maxSlippage)).div(millionBigNum),
      );

      if (minimumReceivedNum.lt(0)) {
        minimumReceivedNum = BigNumber.from("0");
      }
    }

    baseTgas =
      formatDecimal(
        estimateAmtInfoInState?.baseFee,
        getTokenByChainAndTokenSymbol(toChain?.id, selectedToken?.token?.symbol)?.token.decimal,
      ) || "--";
    percTgas =
      formatDecimal(
        estimateAmtInfoInState?.percFee,
        getTokenByChainAndTokenSymbol(toChain?.id, selectedToken?.token?.symbol)?.token.decimal,
      ) || "--";
    bridgeRate = estimateAmtInfoInState.bridgeRate;
    slippage_tolerance = formatPercentage(Number(slippageToleranceNum));

    minimumReceived =
      formatDecimal(
        minimumReceivedNum || "0",
        getTokenByChainAndTokenSymbol(toChain?.id, selectedToken?.token?.symbol)?.token.decimal,
      ) + " ";
  }

  useEffect(() => {
    maxAmount =
      fromChain?.id === chainId
        ? formatDecimal(isNativeETHToken ? ETHBalance : tokenBalance, selectedToken?.token?.decimal)
        : "0";
  }, [tokenBalance, ETHBalance, isNativeETHToken]);

  return (
    <div className={classes.flexCenter}>
      <Card className={classes.transferCard} bordered={false}>
        <div className={classes.cardContent}>
          <div className={classes.trans}>
            <div className={classes.transitem}>
              <div className={classes.transitemTitle}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className={classes.source}>From</div>
                  <div className={classes.transselect}>
                    <div
                      className={classes.chainSelcet}
                      onClick={() => {
                        showChain("from");
                      }}
                    >
                      <Avatar size="small" src={fromChain?.icon} style={{ marginRight: 5 }} />
                      <span style={{ marginRight: 13 }}>{fromChain?.name}</span>
                      <img src={arrowDowm} alt="more from chain" />
                    </div>
                  </div>
                </div>
                {(() => {
                  if (pegConfig.mode !== PeggedChainMode.Off) {
                    return null;
                  }
                  if (isMobile) {
                    <div>
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenRateModal();
                        }}
                        style={{ cursor: "pointer", position: "relative" }}
                      >
                        <img src={settingIcon} className={classes.settingIcon} alt="setting icon" />
                      </div>
                      <Modal
                        className={classes.mobileRateModal}
                        title=""
                        closable
                        visible={showRateModal}
                        onCancel={handleCloseRateModal}
                        footer={null}
                        centered
                      >
                        <RateModal
                          onCancle={() => {
                            handleCloseRateModal();
                          }}
                        />
                      </Modal>
                    </div>;
                  }
                  return renderCardSetting();
                })()}
              </div>
              <div className={classes.transcontent}>
                <div className={classes.transnum}>
                  <div className={classes.transnumtext}>Send:</div>
                  <div
                    className={classes.transnumlimt}
                    onClick={() => {
                      setMaxAmount();
                    }}
                  >
                    Max: <span>{maxAmount}</span>
                  </div>
                </div>
                <div className={classes.transndes}>
                  <div className={classes.transdestext}>
                    <TokenInput value={amount} onChange={handleTokenInputChange} disabled={fromChain?.id !== chainId} />
                  </div>
                  <div className={classes.transdeslimt}>
                    <div className={classes.investSelct} onClick={() => toggleIsTokenShow()}>
                      <div className={classes.selectpic}>
                        <img src={selectedToken?.icon} alt="" />
                      </div>
                      <div className={classes.selectdes}>
                        {getTokenSymbol(selectedToken?.token.symbol, fromChain?.id)}
                      </div>
                      <div className={classes.selecttoog}>
                        <DownOutlined style={{ fontSize: "14px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.icon}>
              <img
                src={arrowUpDowm}
                alt="arrow up down"
                onClick={() => exchangeFromAndToChain()}
                style={{
                  cursor: "pointer",
                }}
                width={32}
              />
            </div>
            <div className={classes.transitem}>
              <div className={classes.transitemTitle}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className={classes.source}>To</div>
                  <div className={classes.transselect}>
                    <div
                      className={classes.chainSelcet}
                      onClick={() => {
                        showChain("to");
                      }}
                    >
                      <Avatar size="small" src={toChain?.icon} style={{ marginRight: 5 }} />
                      <span style={{ marginRight: 13 }}>{toChain?.name}</span>
                      <img src={arrowDowm} alt="more to chain" />
                    </div>
                  </div>
                </div>
              </div>
              <div className={classes.transcontent}>
                {fromChain && toChain && selectedToken ? (
                  <div className={classes.transnum}>
                    <div className={classes.transnumtext}>
                      <Tooltip
                        title={
                          <div className={classes.transcontenttip}>
                            This amount is estimated based on the current bridge rate and fees.
                          </div>
                        }
                        placement="top"
                        color="#fff"
                        overlayInnerStyle={{ color: "#000", backgroundColor: "#fff", width: 265 }}
                      >
                        <InfoCircleOutlined style={{ fontSize: 12, marginRight: 6 }} />
                      </Tooltip>
                      Receive (estimated):
                    </div>
                  </div>
                ) : null}
                <div className={classes.transndes}>
                  <div className={classes.transdestext}>
                    {receiveAmount === 0 ? (
                      <span>0.0</span>
                    ) : (
                      <span>
                        {receiveAmount < 0
                          ? "--"
                          : `${receiveAmount} ${getTokenDisplaySymbol(selectedToken?.token, toChain)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={classes.err}>
          <div className={classes.errInner}>{errorMsg}</div>
        </div>
        <div style={{ width: "100%", textAlign: "center", position: "relative", height: 56 }}>
          <div className={classes.btnare}>
            <div className={classes.btnarein}>
              {signer ? (
                <Button
                  type="primary"
                  onClick={onShowTransferModal}
                  loading={loading}
                  className={isMobile ? classes.transMobileBtn : classes.transBtn}
                  disabled={
                    !(Number(amount) > 0 && !hasError && receiveAmount) ||
                    exceedsSafeguard ||
                    process.env.REACT_APP_BTN_DISABLED === "true"
                  }
                >
                  Transfer
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={onShowProviderModal}
                  className={isMobile ? classes.transMobileBtn : classes.transBtn}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
        {!signer && <div className={classes.contCover}> </div>}
      </Card>
      {bridgeRate && !exceedsSafeguard ? (
        <TransferOverview
          selectedToken={selectedToken}
          fromChain={fromChain}
          toChain={toChain}
          bridgeRate={bridgeRate}
          minimumReceived={minimumReceived}
          baseFee={estimateAmtInfoInState?.baseFee}
          percFee={estimateAmtInfoInState?.percFee}
          transferConfig={transferConfig}
          receiveAmount={receiveAmount}
        />
      ) : null}
      <ProviderModal visible={showProviderModal} onCancel={handleCloseProviderModal} />
      {showTransferModal && (
        <TransferModal
          amount={maxValue || amount}
          receiveAmount={receiveAmount}
          onCancel={handleCloseTransferModal}
          onSuccess={handleSuccess}
        />
      )}
      <TokenList visible={isTokenShow} onSelectToken={handleSelectToken} onCancel={() => toggleIsTokenShow()} />
    </div>
  );
};

export default Transfer;
