import { Avatar, Modal, Button, Slider, Input, Col, Row } from "antd";
import { useNetworkState } from "react-use";
import { useCallback, useEffect, useState, useContext } from "react";
import { createUseStyles } from "react-jss";
import { CheckCircleFilled, WarningFilled, LoadingOutlined, CloseCircleFilled } from "@ant-design/icons";
import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { base64, getAddress, hexlify } from "ethers/lib/utils";
import { debounce } from "lodash";
import { deleteDecimalPart } from "celer-web-utils/lib/format";
import { getNetworkById } from "../../constants/network";
import { useContractsContext } from "../../providers/ContractsContextProvider";
import { useWeb3Context } from "../../providers/Web3ContextProvider";
import { ERC20 } from "../../typechain/ERC20";
import { ERC20__factory } from "../../typechain/factories/ERC20__factory";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { withdrawLiquidity, queryLiquidityStatus, estimateWithdrawAmt } from "../../redux/gateway";
import { ColorThemeContext } from "../../providers/ThemeProvider";
import { LPType, WithdrawDetail, LPHistoryStatus, LPHistory } from "../../constants/type";
import { useCustomContractLoader, useTokenBalance, useBigAmountDelay } from "../../hooks";
import { Theme } from "../../theme";
import { validFloatRegex } from "../../helpers/regex";
import { switchChain } from "../../redux/transferSlice";
import { formatDecimal } from "../../helpers/format";
import { getTokenSymbol } from "../../redux/assetSlice";
import trangleT from "../../images/trangleT.svg";
import {
  WithdrawReq as WithdrawReqProto,
  WithdrawLq as WithdrawLqProto,
  WithdrawType,
} from "../../proto/sgn/cbridge/v1/tx_pb";
import {
  WithdrawLiquidityRequest,
  EstimateWithdrawAmtRequest,
  EstimateWithdrawAmtResponse,
  WithdrawInfo,
  WithdrawMethodType,
  EstimateWithdrawAmt,
} from "../../proto/sgn/gateway/v1/gateway_pb";
import ExceedSafeguardModal from "../../views/ExceedSafeguardModal";
import { minimum, maximum } from "../../helpers/calculation";
/* eslint-disable*/
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
  itemText: {},
  itemTitle: {
    fontSize: 16,
    color: theme.infoSuccess,
  },
  itemTextDes: {
    fontSize: 12,
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
    marginTop: props => (props.isMobile ? 28 : 40),
    marginBottom: props => (props.isMobile ? 31 : 45),
    color: theme.transferSuccess,
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
    marginTop: props => (props.isMobile ? 16 : 40),
    height: 56,
    lineHeight: "42px",
    background: theme.primaryBrand,
    border: 0,
    borderRadius: 16,
    fontSize: 18,
    fontWeight: 700,
  },
  resultText: {
    color: theme.surfacePrimary,
  },
  modaldes: {
    color: theme.surfacePrimary,
    marginTop: props => (props.isMobile ? 16 : 40),
    fontSize: 15,
    textAlign: "center",
  },
  modaldes2: {
    color: theme.surfacePrimary,
    marginTop: props => (props.isMobile ? 16 : 30),
    fontSize: 18,
    textAlign: "center",
    fontWeight: 700,
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
    fontWeight: 600,
  },
  transcontent: {
    borderRadius: "16px",
    background: theme.primaryBackground,
    padding: "16px",
    marginTop: 40,
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
    fontWeight: 600,
    color: theme.secondBrand,
  },
  transnumlimt: {
    //   color: theme.dark.midTextColor,
    //   fontSize: theme.transferFontS,
    borderBottom: "1px solid #8f9bb3",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
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
    fontWeight: 600,
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
    padding: "10px 16px 16px 16px",
    margin: "40px 0",
  },
  descripetItem: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
  },
  leftTitle: {
    color: theme.secondBrand,
    fontSize: 13,
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
    margin: "18px 0",
    cursor: "pointer",
    fontWeight: 700,
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
  msgInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    color: "#17171A",
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
  removeModal: {
    minWidth: props => (props.isMobile ? "100%" : 512),
    background: theme.secondBackground,
    border: `1px solid ${theme.primaryBackground}`,
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
        minHeight: 260,
        padding: props => (props.isMobile ? "30px 16px 0 16px" : ""),
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
  silder: {
    marginTop: 10,
    marginRight: 20,
    "&:hover": {
      "& .ant-slider-rail": {
        background: `${theme.primaryUnable} !important`,
      },
      "& .ant-slider-track": {
        background: `${theme.primaryBrand} !important`,
      },
    },
    "& .ant-slider-rail": {
      //背景条
      height: 14,
      background: theme.primaryUnable,
      borderRadius: "100px",
    },
    "& .ant-slider-step": {
      height: 14,
    },
    "& .ant-slider-track": {
      //活动条
      height: 14,
      background: theme.primaryBrand,
      borderRadius: "100px",
    },
    "& .ant-slider-dot": {
      display: "none",
    },
    "& .ant-slider-handle": {
      top: 9,
    },
    "& .ant-slider-mark-text": {
      color: theme.secondBrand,
    },
  },
  sliderText: {
    lineHeight: 1,
    marginTop: 4,
    fontSize: 10,
  },
  sliderIcon: {
    fontSize: 8,
  },
  noteTips: {
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 600,
    color: theme.surfacePrimary,
    marginTop: 40,
    background: theme.primaryBackground,
    padding: "16px 10px",
    borderRadius: 8,
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
  chainTips: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.surfacePrimary,
  },
  sliderInput: {
    backgroundColor: "transparent",
    width: 110,
    height: 45,
    borderRadius: 16,
    fontSize: 14,
    color: theme.surfacePrimary,
    textAlign: "right",
    position: "absolute",
    right: 0,
    "& input": {
      backgroundColor: "transparent",
      textAlign: "right",
      color: theme.surfacePrimary,
    },
    "&:focuse": {
      borderColor: theme.primaryBrand,
    },
  },
  contentText: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.surfacePrimary,
  },
  surcontent: {
    color: theme.surfacePrimary,
  },
  safeguardToastBox: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 11,
    width: "100%",
    borderRadius: 4,
    padding: "8px 12px 8px 12px",
    // background: theme.primaryBackground,
    marginTop: 40,
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
}));

export interface AddLiquidityModalProps {
  showModal: boolean;
  onClose: () => void;
}

const INIT = "init";

/**
 * Flow
 * If the LP is not connected to the correct chain, toast to switch chain
 * If LP has not approved the corresponding token, toast to approve token
 * chain and approved is ok, show the modal with "Remove Liquidity"
 * if the selected chain is not the connected chain, toast to switch chain
 * if the input is not valid, toast to enter a valid amount
 * If insufficient balance, show error toast “Insufficient liquidity to remove”
 * after click the remove btn, show a popup to wait that SGN rejects the liquidity removal request
 * if SGN rejects the liquidity removal request, show a btn to Confirm Remove Liquidity
 * - if the Confirm success, show the success modal.
 * else show a sorry popup to remain user to try again later
 */

const RemoveLiquidityModal = ({ onClose, showModal }: AddLiquidityModalProps): JSX.Element => {
  const { windowWidth } = useAppSelector(state => state);
  const { isMobile } = windowWidth;
  const classes = useStyles({ isMobile });
  const networkState = useNetworkState();
  const {
    contracts: { lpbridge },
    transactor,
  } = useContractsContext();
  const { provider, address, chainId, signer } = useWeb3Context();
  const dispatch = useAppDispatch();
  const { selectedLP } = useAppSelector(state => state.lp);
  const tokenContract = useCustomContractLoader(provider, selectedLP?.token?.token?.address || "", ERC20__factory) as
    | ERC20
    | undefined;
  const [tokenBalance, , , reload] = useTokenBalance(tokenContract, address);

  const [amount, setAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState<JSX.Element>(<div />);
  const [hasError, setHasError] = useState<boolean>(false);
  const [ratio, setRatio] = useState<string>("0");
  const [estimatedAmount, setEstimatedAmount] = useState<string>("0");
  const [allowance, setAllowance] = useState<BigNumber>();
  const [transfState, setTransfState] = useState<LPHistoryStatus | "init" | "confirmationAlert">(INIT);
  const [loading, setLoading] = useState<boolean>(false);
  const [withdrawDetail, setWithdrawDetail] = useState<WithdrawDetail>();
  const [seqNum, setSeqNum] = useState<string>("");
  const [viewInExploreLink, setViewInExploreLink] = useState<string>("");
  const [epochVolumeCaps, setEpochVolumeCaps] = useState<BigNumber>();
  const [currentEpochVolume, setCurrentEpochVolume] = useState<BigNumber>();
  const [exceedsSafeguard, setExceedsSafeguard] = useState(true);
  const [showExceedSafeguardModal, setShowExceedSafeguardModal] = useState(false);

  const { isBigAmountDelayed, delayMinutes, delayThresholds } = useBigAmountDelay(
    selectedLP?.chain,
    selectedLP?.token?.token,
    Number(amount) ?? 0,
    true,
    epochVolumeCaps,
  );
  const [hasFetchedSafeguard, setHasFetchedSafeguard] = useState(false);
  let content;
  let titleText = "Remove Liquidity";
  let removeStatusInterval;
  const marks = {
    0: {
      label: (
        <div className={classes.sliderText} style={{ marginLeft: 10 }}>
          <img src={trangleT} alt="" className={classes.sliderIcon} />
          <div style={{ lineHeight: 1 }}>0%</div>
        </div>
      ),
    },
    25: {
      label: (
        <div className={classes.sliderText}>
          <img src={trangleT} alt="" className={classes.sliderIcon} />
          <div style={{ lineHeight: 1 }}>25%</div>
        </div>
      ),
    },
    50: {
      label: (
        <div className={classes.sliderText}>
          <img src={trangleT} alt="" className={classes.sliderIcon} />
          <div style={{ lineHeight: 1 }}>50%</div>
        </div>
      ),
    },
    75: {
      label: (
        <div className={classes.sliderText}>
          <img src={trangleT} alt="" className={classes.sliderIcon} />
          <div style={{ lineHeight: 1 }}>75%</div>
        </div>
      ),
    },
    100: {
      // style: {
      //   color: "#fff",
      // },
      label: (
        <div className={classes.sliderText} style={{ marginRight: 10 }}>
          <img src={trangleT} alt="" className={classes.sliderIcon} />
          <div style={{ lineHeight: 1 }}>100%</div>
        </div>
      ),
    },
  };
  let amountStr = "0";
  if (!isNaN(Number(amount))) {
    amountStr = Number(amount)?.toFixed(6).toString() || "0";
  }
  let value = BigNumber.from(0);
  try {
    value = parseUnits(amountStr, selectedLP?.token?.token?.decimal);
  } catch (e) {}

  const generateErrMsg = (msg: string) => {
    return (
      <div className={classes.errInnerbody}>
        <WarningFilled style={{ fontSize: 18, marginRight: 5, color: "#FF3D71" }} />
        <span>{msg}</span>
      </div>
    );
  };
  useEffect(() => {
    setErrorMsg(<div />);
    if (selectedLP?.chain?.id !== chainId) {
      setHasError(true);
      setErrorMsg(
        <div className={classes.errInnerbody}>
          <WarningFilled style={{ fontSize: 20, marginRight: 10, color: "#ff8f00" }} />
          <span style={{ color: "#17171A", fontSize: 16, textAlign: "left" }}>
            Please switch to <span style={{ color: "#17171A", fontWeight: "bold" }}>{selectedLP?.chain?.name} </span>{" "}
            before you can supply liquidity.
          </span>
        </div>,
      );
    } else if ((!validFloatRegex.test(amount) && Number(amount)) || isNaN(Number(amount))) {
      setHasError(true);
      setErrorMsg(generateErrMsg("Please enter a valid number"));
    } else if (value.gt(parseUnits(selectedLP?.liquidity_amt, selectedLP?.token?.token?.decimal))) {
      setHasError(true);
      setErrorMsg(generateErrMsg("Insufficient liquidity to remove"));
    } else {
      if (epochVolumeCaps && value.gte(epochVolumeCaps)) {
        setExceedsSafeguard(true);
        const formatedAmount = formatUnits(epochVolumeCaps.toString(), selectedLP.token.token.decimal);
        setErrorMsg(
          <div className={classes.errInnerbody}>
            <CloseCircleFilled style={{ fontSize: 20, marginRight: 10, color: "#FF3D71" }} />
            <span style={{ color: "#FF3D71", fontWeight: 700, fontSize: 16, textAlign: "left" }}>
              In this beta release, the maximum liquidity removal amount is{" "}
              <span className={classes.errorMsg}>
                {deleteDecimalPart(formatedAmount.toString())}{" "}
                {getTokenSymbol(selectedLP.token.token.symbol, selectedLP.chain.id)}
              </span>
              . Please reduce your removal amount.
            </span>
          </div>,
        );
        return;
      }
      if (currentEpochVolume && epochVolumeCaps && value.add(currentEpochVolume).gt(epochVolumeCaps)) {
        setExceedsSafeguard(true);
        setErrorMsg(
          <div className={classes.errInnerbody}>
            <CloseCircleFilled style={{ fontSize: 20, color: "#FF3D71", marginRight: 10 }} />
            <span style={{ color: "#ff3d71", fontWeight: 700, fontSize: 16, textAlign: "left" }}>
              Sorry the transaction cannot be submitted due to the heavy traffic at this moment. Please reduce your
              amount or try again 1 hour later.
            </span>
          </div>,
        );
        return;
      }
      setHasError(false);
      setExceedsSafeguard(false);
      if (isBigAmountDelayed) {
        setErrorMsg(bigAmountDelayedMsg(selectedLP.token.token.symbol, delayMinutes));
        return;
      }
    }
  }, [selectedLP, chainId, amount, currentEpochVolume, epochVolumeCaps, isBigAmountDelayed]);

  const getAllowance = useCallback(() => {
    tokenContract
      ?.allowance(address, selectedLP?.chain?.contract_addr || AddressZero)
      .then(result => setAllowance(result))
      .catch(e => {
        console.log(e);
      });
  }, [address, selectedLP, tokenContract]);

  useEffect(() => {
    getAllowance();
  }, [getAllowance]);

  const closeModal = () => {
    if (transfState === LPHistoryStatus.LP_COMPLETED) {
      setTransfState(INIT);
    }
    onClose();
  };

  const removeLiquidityMethod = async () => {
    if (!lpbridge || !selectedLP || !signer) {
      return;
    }
    setLoading(true);
    // 计算reqid, sig
    const timestamp = Math.floor(Date.now() / 1000);
    const WithdrawLqProtoList: WithdrawLqProto[] = [];
    const withdrawLqProto = new WithdrawLqProto();
    withdrawLqProto.setFromChainId(selectedLP?.chain.id);
    withdrawLqProto.setMaxSlippage(0);
    withdrawLqProto.setTokenAddr(selectedLP?.token.token.address);
    withdrawLqProto.setRatio(Number(Number(ratio) * 1000000)); //100000000  //此处不能传小数。
    WithdrawLqProtoList.push(withdrawLqProto);

    const withdrawReqProto = new WithdrawReqProto();
    withdrawReqProto.setWithdrawsList(WithdrawLqProtoList);
    withdrawReqProto.setExitChainId(selectedLP?.chain.id);
    withdrawReqProto.setReqId(timestamp);
    withdrawReqProto.setWithdrawType(WithdrawType.WITHDRAW_TYPE_REMOVE_LIQUIDITY);

    let sig;
    try {
      // sig = await signer.signMessage(hash);
      sig = await signer.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(withdrawReqProto.serializeBinary())));
    } catch (error) {
      setLoading(false);
      return;
    }
    const bytes = ethers.utils.arrayify(sig);
    const req = new WithdrawLiquidityRequest();
    req.setWithdrawReq(withdrawReqProto.serializeBinary());
    req.setSig(bytes);
    req.setEstimatedReceivedAmt(estimatedAmount);
    req.setMethodType(WithdrawMethodType.WD_METHOD_TYPE_ONE_RM);
    const withdrawResult = await withdrawLiquidity(req);
    if (withdrawResult) {
      setTransfState(LPHistoryStatus.LP_WAITING_FOR_SGN);
    }
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
      const currentValue = BigNumber.from(value);
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
          //   amt: value.toString(),
          //   token_addr: selectedLP?.token?.token?.address,
          //   chain_id: selectedLP?.chain?.id,
          //   seq_num: seqNum,
          //   tx_hash: resultTx.hash,
          //   type: LPType.LP_TYPE_REMOVE,
          // });
          const newLPJson: LPHistory = {
            withdraw_id: "",
            amount: value.toString(),
            block_tx_link: `${getNetworkById(selectedLP?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`,
            chain: selectedLP?.chain,
            method_type: 1,
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

  const onInputChange = async e => {
    let val = e.target.value;
    const reg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{0,6})?$/;
    if (val && !reg.test(val)) {
      return;
    }
    if (Number(val) >= 100) {
      val = "100";
    } else if (Number(val) < 0 || !val) {
      val = "";
      setEstimatedAmount("");
    }
    setRatio(val);
    let maxAmount = Number(
      formatDecimal(selectedLP?.liquidity_amt, selectedLP?.token?.token?.decimal).split(",").join(""),
    );
    setRatio(val);
    const am = val ? (Number(maxAmount) * val) / 100 : 0;
    setAmount(am.toString());
    debouncedSave({ ratio: val });
  };
  const onSliderChange = val => {
    let maxAmount = Number(
      formatDecimal(selectedLP?.liquidity_amt, selectedLP?.token?.token?.decimal).split(",").join(""),
    );
    setRatio(val.toString());
    const am = (Number(maxAmount) * val) / 100;
    setAmount(am.toString());
    debouncedSave({ ratio: val });
  };
  const debouncedSave = useCallback(
    debounce(nextValues => getestimate(nextValues), 500),
    [lpbridge, currentEpochVolume, epochVolumeCaps],
  );

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

  const getBigAmountModalMsg = (): string => {
    const time = isBigAmountDelayed ? `up to ${delayMinutes} minutes` : "a few minutes";
    return `Please allow ${time} before the transaction completes.`;
  };

  const getestimate = async nextValues => {
    const src_withdrawsList: WithdrawInfo[] = [];
    const infoJson = new WithdrawInfo();
    infoJson.setChainId(selectedLP?.chain.id);
    infoJson.setAmount(
      BigNumber.from(selectedLP.liquidity_amt)
        .mul(nextValues.ratio ? Math.round(Number(nextValues.ratio) * 10000000) : "0")
        .div(1000000000)
        .toString(),
    );
    src_withdrawsList.push(infoJson);

    const req = new EstimateWithdrawAmtRequest();
    req.setSrcWithdrawsList(src_withdrawsList);
    req.setDstChainId(selectedLP?.chain.id);
    req.setTokenSymbol(selectedLP?.token.token.symbol);
    req.setUsrAddr(address);

    const res: EstimateWithdrawAmtResponse = await estimateWithdrawAmt(req);
    if (!res.getErr() && JSON.stringify(res.getReqAmtMap()) !== "{}") {
      const resMap = res.getReqAmtMap();
      resMap.forEach((entry: EstimateWithdrawAmt, key: number) => {
        if (key === Number(selectedLP?.chain.id)) {
          const totleFee = (Number(entry.getBaseFee()) + Number(entry.getPercFee())).toString() || "0";
          const eqValueTokenAmtBigNum = BigNumber.from(entry.getEqValueTokenAmt());
          const feeBigNum = BigNumber.from(totleFee);
          const targetReceiveAmounts = eqValueTokenAmtBigNum.sub(feeBigNum);
          setEstimatedAmount(targetReceiveAmounts.toString());
        }
      });
    }

    let maxT = BigNumber.from(0);
    let currentVolume = BigNumber.from(0);
    let maxSend = BigNumber.from(0);
    if (lpbridge) {
      try {
        maxT = await lpbridge.epochVolumeCaps(selectedLP.token.token.address);
        maxT = maxT.mul(98).div(100);
        currentVolume = await lpbridge.epochVolumes(selectedLP.token.token.address);
        maxSend = await lpbridge.maxSend(selectedLP.token.token.address);
        setHasFetchedSafeguard(true);
      } catch (error) {
        console.log("error", error);
      }
    }

    const needsSafeguard = maxT.gt(0) || maxSend.gt(0);
    if (needsSafeguard) {
      setCurrentEpochVolume(currentVolume);
      const minValue = minimum(maxSend, maxT);
      const maxValue = maximum(maxSend, maxT);
      setEpochVolumeCaps(minValue.gt(0) ? minValue : maxValue);
    } else {
      setExceedsSafeguard(false);
      setCurrentEpochVolume(undefined);
      setEpochVolumeCaps(undefined);
    }
  };
  if (selectedLP?.chain?.id !== chainId) {
    content = (
      <div>
        <div style={{ textAlign: "center" }}>
          <WarningFilled style={{ fontSize: 50, color: "#ffaa00", marginTop: 40 }} />
        </div>
        <div className={classes.modaldes}>
          Please switch to <div className={classes.yellowText}>{selectedLP?.chain?.name} </div> before removing
          liquidity from {selectedLP?.chain?.name}.
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
              closeModal();
            }
          }}
          className={classes.button}
        >
          OK
        </Button>
      </div>
    );
    titleText = "";
  } else if (transfState === "confirmationAlert") {
    content = (
      <div>
        <div style={{ textAlign: "center" }}>
          <WarningFilled style={{ fontSize: 90, color: "#ffaa00", margin: "79px 0 57px" }} />
        </div>
        <div style={{ fontSize: 14, textAlign: "center" }} className={classes.surcontent}>
          By continuing, your liquidity will be deducted and removed. The operation cannot be undone. Are you sure you
          want to continue the liquidity removal?
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
          <span style={{ width: 20 }}></span>
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
  } else if (transfState === LPHistoryStatus.LP_WAITING_FOR_SGN) {
    content = (
      <>
        <div className={classes.modalTop}>
          <div className={classes.modaldes2}>
            Remove{" "}
            <span className={classes.greenText}>
              {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP?.chain?.id)}{" "}
            </span>{" "}
            liquidity from <span>{selectedLP?.chain?.name}</span>
          </div>
          <div className={classes.modalTopIcon}>
            <LoadingOutlined style={{ fontSize: 50, fontWeight: "bold", color: "#3366FF" }} />
          </div>
          <div className={classes.modalToptext}>Waiting for Celer SGN Confirmations...</div>
        </div>
        <div className={classes.modaldes}>
          Your request to remove liquidity is being confirmed by Celer State Guardian Network (SGN), which might take a
          few minutes.
        </div>
      </>
    );
    titleText = " ";
  } else if (transfState === LPHistoryStatus.LP_WAITING_FOR_LP) {
    content = (
      <>
        <div className={classes.modalTop}>
          <div className={classes.modaldes2}>
            Remove{" "}
            <span className={classes.greenText}>
              {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP?.chain?.id)}{" "}
            </span>{" "}
            liquidity from <span>{selectedLP?.chain?.name}</span>
          </div>
        </div>
        <div className={classes.modaldes}>
          Please click “Confirm Remove Liquidity” button to complete the liquidity removal process
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
        >
          Confirm Remove Liquidity
        </Button>
        <ExceedSafeguardModal visible={showExceedSafeguardModal} onCancel={() => setShowExceedSafeguardModal(false)} />
      </>
    );
    titleText = " ";
  } else if (transfState === LPHistoryStatus.LP_COMPLETED) {
    const { themeType } = useContext(ColorThemeContext);
    content = (
      <div>
        <div className={classes.modalTopIcon} style={{ marginTop: 0 }}>
          <CheckCircleFilled
            style={{ fontSize: 90, fontWeight: "bold", color: themeType === "dark" ? "#00e096" : "#00B42A" }}
          />
        </div>
        <div className={classes.modalsuccetext}>Success</div>
        <div className={classes.modaldes2}>
          Remove{" "}
          <span className={classes.greenText}>
            {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP?.chain?.id)}{" "}
          </span>{" "}
          liquidity from <span>{selectedLP?.chain?.name}</span>
        </div>
        <div className={classes.noteview}>
          <div className={classes.noteview}>
            <a href={viewInExploreLink} target="_blank" rel="noreferrer">
              View in Explorer
            </a>
          </div>
        </div>
        <div style={{ fontWeight: "normal" }} className={classes.modaldes}>
          {getBigAmountModalMsg()}
        </div>
        <Button
          type="primary"
          size="large"
          block
          onClick={() => {
            closeModal();
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
        <div className={classes.modalTop} />
        <div className={classes.modaldes}>
          Sorry your request to remove{" "}
          <span style={{ color: "#FFAA00" }}>
            {" "}
            {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP?.chain?.id)}
          </span>{" "}
          liquidity from <span style={{ color: "#FFAA00" }}>{selectedLP.chain.name}</span> cannot be completed because
          you don’t have enough {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP?.chain?.id)} balance on{" "}
          {selectedLP.chain.name}. You may try again later by updating your amount.
        </div>
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={() => {
            closeModal();
          }}
          className={classes.button}
        >
          OK
        </Button>
      </>
    );
    titleText = " ";
  } else {
    content = (
      <div>
        <div className={classes.transitem}>
          <div className={classes.transitemTitle}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className={classes.transselect}>
                <div className={classes.chainSelcet}>
                  <Avatar size="small" src={selectedLP?.chain?.icon} style={{ marginRight: 5 }} />
                  <span style={{ marginRight: 13 }}>{selectedLP?.chain?.name}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.chainTips}>
            Please select the amount of liquidity you wish to remove from {selectedLP?.chain?.name}:
          </div>
          <Row style={{ marginTop: 3 }}>
            <Col span={isMobile ? 16 : 18}>
              <Slider
                marks={marks}
                step={1}
                className={classes.silder}
                onChange={v => onSliderChange(v.toString())}
                value={ratio ? Number(ratio) : 0}
              />
            </Col>
            <Col span={isMobile ? 8 : 6} style={{ position: "relative" }}>
              <Input
                min={0}
                max={20}
                suffix="%"
                type="number"
                style={{
                  margin: isMobile ? "8px 0 0 2px" : "6px 0 0 16px",
                  width: 120,
                  fontSize: isMobile ? 10 : 14,
                  height: isMobile ? 38 : 48,
                }}
                className={classes.sliderInput}
                value={ratio}
                onChange={e => onInputChange(e)}
              />
            </Col>
          </Row>
          <div className={classes.transcontent}>
            <div className={classes.contentText}>
              Amount to Remove: {amount ? <span>{amount}</span> : "0.0"}{" "}
              {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP?.chain?.id)}
            </div>
          </div>
        </div>
        <div className={classes.noteTips}>
          You will remove a <span style={{ color: "#ff8f00" }}>{ratio}% </span> share of your available{" "}
          {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP?.chain?.id)} liquidity on{" "}
          {selectedLP?.chain.name}.
          <span style={{ color: "#ff8f00" }}>
            {" "}
            The actual amount removed may vary when this transaction is executed.
          </span>
        </div>
        <div className={classes.err}>
          <div className={classes.errInner}>{errorMsg}</div>
        </div>
        <Button
          type="primary"
          size="large"
          block
          disabled={hasError || Number(amount) <= 0 || exceedsSafeguard || !hasFetchedSafeguard}
          loading={loading}
          onClick={() => {
            setTransfState("confirmationAlert");
          }}
          className={classes.button}
        >
          Remove Liquidity
        </Button>
      </div>
    );
  }

  return (
    <Modal
      title={titleText}
      width={transfState === "init" && selectedLP?.chain?.id === chainId ? 622 : 512}
      onCancel={closeModal}
      visible={showModal}
      footer={null}
      className={classes.removeModal}
    >
      {content}
    </Modal>
  );
};

export default RemoveLiquidityModal;
