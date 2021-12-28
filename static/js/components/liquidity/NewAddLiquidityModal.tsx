import { Avatar, Button, Modal, Tooltip } from "antd";
import { useCallback, useEffect, useState, useContext } from "react";
import { createUseStyles } from "react-jss";
import { CheckCircleFilled, InfoCircleOutlined, LoadingOutlined, WarningFilled } from "@ant-design/icons";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, MaxUint256 } from "@ethersproject/constants";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { getNetworkById } from "../../constants/network";
import { LPHistoryStatus, LPType, LPHistory } from "../../constants/type";
import { formatDecimal, formatPercentage } from "../../helpers/format";
import { validFloatRegex } from "../../helpers/regex";
import { useCustomContractLoader, useTokenBalance, useNativeETHToken } from "../../hooks";
import { useContractsContext } from "../../providers/ContractsContextProvider";
import { useWeb3Context } from "../../providers/Web3ContextProvider";
import { queryLiquidityStatus } from "../../redux/gateway";
import { useAppSelector } from "../../redux/store";
import { switchChain } from "../../redux/transferSlice";
import { Theme } from "../../theme";
import { ERC20 } from "../../typechain/ERC20";
import { ERC20__factory } from "../../typechain/factories/ERC20__factory";
import TokenInput, { ITokenInputChangeEvent } from "../TokenInput";
import { getTokenSymbol } from "../../redux/assetSlice";
import { ColorThemeContext } from "../../providers/ThemeProvider";
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
  addQuilityDes: {
    background: theme.primaryBackground,
    padding: "16px 10px",
    borderRadius: 8,
  },
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
    fontWeight: 400,
    color: theme.surfacePrimary,
  },
  transferdes2: {
    fontSize: 12,
    width: "100%",
    textAlign: "center",
    fontWeight: 400,
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
    fontWeight: 700,
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
    marginBottom: props => (props.isMobile ? 31 : 45),
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
    marginTop: props => (props.isMobile ? 34 : 58),
    fontSize: 15,
    textAlign: "center",
    fontWeight: 600,
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
    height: props => (props.isMobile ? 40 : 60),
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
    fontWeight: 600,
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
    margin: props => (props.isMobile ? "16px 0" : "40px 0"),
  },
  descripetItem: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
  },
  leftTitle: {
    color: theme.secondBrand,
    fontSize: 13,
    fontWeight: 600,
  },
  rightContent: {
    display: "flex",
    alignItems: "center",
    color: theme.surfacePrimary,
    fontSize: 13,
    fontWeight: 600,
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
    margin: "18px 0 0 0",
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
  tipsbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errnote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: theme.infoDanger,
  },
  errnoteimg: {
    color: theme.infoDanger,
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
  addModal: {
    width: props => (props.isMobile ? "100%" : 512),
    minWidth: props => (props.isMobile ? "100%" : 448),
    border: `1px solid ${theme.primaryBackground}`,
    background: theme.secondBackground,
    "& .ant-modal-body": {
      padding: "18px 16px 32px 16px",
    },
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
        padding: props => (props.isMobile ? "18px 16px" : ""),
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
  bottomTips: {
    width: "100%",
    textAlign: "center",
    fontSize: 15,
    fontWeight: 400,
    marginTop: 16,
  },
  bottomlink: {
    width: "100%",
    textAlign: "center",
    fontSize: 15,
    fontWeight: 600,
    marginTop: 16,
  },
}));

export interface AddLiquidityModalProps {
  showModal: boolean;
  onClose: () => void;
}

/**
 * Todo
 * approve token method  -- waiting test
 * add liquidity method  -- waiting test
 * add loading
 */

const AddLiquidityModal = ({ onClose, showModal }: AddLiquidityModalProps): JSX.Element => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const {
    contracts: { lpbridge, pool },
    transactor,
  } = useContractsContext();
  const { provider, address, chainId } = useWeb3Context();

  const { selectedLP } = useAppSelector(state => state.lp);
  const tokenContract = useCustomContractLoader(provider, selectedLP?.token?.token?.address || "", ERC20__factory) as
    | ERC20
    | undefined;
  const [tokenBalance] = useTokenBalance(tokenContract, address);
  const [amount, setAmount] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [errorMsg, setErrorMsg] = useState<JSX.Element>(<div />);
  const [hasError, setHasError] = useState<boolean>(false);
  const [txhash, setTxhash] = useState<string>("");
  const [allowance, setAllowance] = useState<BigNumber>();
  const [addLiquidityState, setAddLiquidityState] = useState<
    "transfer" | LPHistoryStatus | "submittingTransfer" | "txFailed"
  >("transfer");
  const [loading, setLoading] = useState<boolean>(false);
  const [viewInExploreLink, setViewInExploreLink] = useState<string>("");
  const [value, setValue] = useState<BigNumber>(BigNumber.from(0));
  const { transferConfig } = useAppSelector(state => state.transferInfo);
  const { chains } = transferConfig;
  const chainInfo = chains.filter(item => Number(item.id) === chainId);
  const chain = chainInfo.length > 0 ? chainInfo[0] : null;
  const [minnum, setMinAdd] = useState(BigNumber.from("0"));
  const { themeType } = useContext(ColorThemeContext);
  const { isNativeETHToken, ETHBalance } = useNativeETHToken(chain !== null ? chain : undefined, selectedLP?.token);
  let content;
  let titleText = "Add Liquidity";
  let queryLiquidityStatusInterval;

  const generateErrMsg = (msg: string) => {
    return (
      <div className={classes.errInnerbody}>
        <WarningFilled className={classes.errnoteimg} style={{ fontSize: 20, marginRight: 5 }} />
        <span style={{ fontSize: 16, fontWeight: 700 }}>{msg}</span>
      </div>
    );
  };
  useEffect(() => {
    let amountStr = "0";
    if (!Number.isNaN(Number(amount))) {
      amountStr = Number(amount).toString() || "0";
    }
    let newValue = BigNumber.from(0);
    let convertError;
    try {
      if (maxValue) {
        newValue = parseUnits(maxValue, selectedLP?.token?.token?.decimal);
      } else {
        newValue = parseUnits(amountStr, selectedLP?.token?.token?.decimal);
      }
      setValue(newValue);
    } catch (e) {
      convertError = e;
    }
    setHasError(false);

    if (selectedLP?.chain?.id !== chainId) {
      setErrorMsg(
        <div className={classes.errInnerbody}>
          <WarningFilled style={{ fontSize: 20, marginRight: 10, color: "#ff8f00" }} />
          <span style={{ color: "#17171A", fontSize: 16, textAlign: "left" }}>
            Please switch to <span style={{ color: "#17171A", fontWeight: "bold" }}>{selectedLP?.chain?.name}</span>{" "}
            before you can supply liquidity.
          </span>
        </div>,
      );
    } else if ((!validFloatRegex.test(amount) && amount) || Number(amount) < 0) {
      setHasError(true);
      setErrorMsg(generateErrMsg("Please enter a valid number"));
    } else if (newValue.gt(isNativeETHToken ? ETHBalance : tokenBalance)) {
      setHasError(true);
      setErrorMsg(generateErrMsg("Insufficient balance"));
    } else if (convertError) {
      setHasError(true);
      setErrorMsg(generateErrMsg(`The number exceeds the maximum.`));
    } else if (amount && newValue.gte(0) && newValue.lte(minnum)) {
      setHasError(true);
      setErrorMsg(
        generateErrMsg(
          `The added liquidity amount needs to be greater than ${formatDecimal(
            minnum,
            selectedLP?.token.token?.decimal,
          )} ${getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}.`,
        ),
      );
    } else {
      setErrorMsg(<div />);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLP, chainId, amount, tokenBalance, minnum, isNativeETHToken, ETHBalance]);

  const getAllowance = useCallback(() => {
    if (!tokenContract || !lpbridge || !address) {
      return;
    }
    tokenContract
      ?.allowance(address, lpbridge.address || AddressZero)
      .then(result => {
        setAllowance(result);
      })
      .catch(e => {
        console.log(e);
      });
  }, [address, lpbridge, tokenContract]);

  useEffect(() => {
    getAllowance();
  }, [getAllowance]);

  useEffect(() => {
    return () => {
      clearInterval(queryLiquidityStatusInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeModal = () => {
    if (addLiquidityState === LPHistoryStatus.LP_COMPLETED) {
      setAddLiquidityState("transfer");
    }
    clearInterval(queryLiquidityStatusInterval);
    onClose();
  };

  const handleTokenInputChange = (e: ITokenInputChangeEvent) => {
    setAmount(e.value);
    setMaxValue("");
  };

  const setMaxAmount = () => {
    const balance = isNativeETHToken ? ETHBalance : tokenBalance;
    const showAmount = formatDecimal(balance.toString(), selectedLP?.token?.token?.decimal).split(",").join("");
    if (!showAmount) {
      return;
    }
    setAmount(showAmount);
    setMaxValue(formatUnits(balance.toString(), selectedLP?.token?.token?.decimal));
  };
  const getMinnum = async () => {
    try {
      if (!lpbridge || !selectedLP?.token?.token.address) {
        return;
      }
      const minAdd = await lpbridge.minAdd(selectedLP?.token?.token.address);
      if (minAdd) {
        setMinAdd(minAdd);
      }
    } catch (error) {
      console.log("error:", error);
    }
  };
  useEffect(() => {
    getMinnum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, lpbridge]);

  const approveMethod = async () => {
    if (!transactor || !allowance || !tokenContract || !lpbridge) {
      return;
    }
    const approveTx = await transactor(tokenContract?.approve(lpbridge.address, MaxUint256));
    setLoading(true);
    await approveTx.wait();
    setLoading(false);
    getAllowance();
  };

  const queryStatus = hash => {
    clearInterval(queryLiquidityStatusInterval);
    queryLiquidityStatusInterval = setInterval(async () => {
      // 查询接口，查询状态
      const queryStatusRes = await queryLiquidityStatus({
        seq_num: "0",
        tx_hash: hash,
        lp_addr: address,
        chain_id: selectedLP?.chain?.id,
        type: LPType.LP_TYPE_ADD,
      });
      if (queryStatusRes?.status) {
        const link =
          queryStatusRes?.block_tx_link || `${getNetworkById(selectedLP?.chain.id).blockExplorerUrl}/tx/${hash}`;
        const transStatus = queryStatusRes.status;
        setViewInExploreLink(link);
        if (transStatus === LPHistoryStatus.LP_COMPLETED || transStatus === LPHistoryStatus.LP_FAILED) {
          setAddLiquidityState(queryStatusRes?.status);
          clearInterval(queryLiquidityStatusInterval);
          setViewInExploreLink(link);
          setLoading(false);
        } else {
          setAddLiquidityState(queryStatusRes?.status);
          setLoading(false);
        }
      } else if (queryStatusRes?.status === LPHistoryStatus.LP_UNKNOWN) {
        // console.error("add lp, status: LP_UNKNOWN");
      } else {
        /// Potential Improvement: Add error happened handling
        clearInterval(queryLiquidityStatusInterval);
      }
    }, 5000);
  };
  const addLiquidityMethod = async () => {
    if (!lpbridge || !pool || !selectedLP || !transactor) {
      return;
    }
    /**
     * 先调合约，拿到合约信息
     * 然后调markLiquidity接口，把
     *  lp_addr: string,
     *  amt_added: string,
     *  token_addr: string,
     *  chain_id: number,
     *  seq_num: number,
     * 信息作为参数
     * 最后调用一次queryLiquidityStatus接口，查询状态（需传入seq_num参数）
     */
    try {
      setLoading(true);
      const resultTx = await transactor(
        isNativeETHToken
          ? lpbridge.addNativeLiquidity(value, { value })
          : lpbridge.addLiquidity(selectedLP?.token?.token?.address, value),
      ).catch(e => {
        console.log(e);
        setLoading(false);
      });
      if (resultTx) {
        const newtxStr = JSON.stringify(resultTx);
        const newtx = JSON.parse(newtxStr);
        const ts = new Date().getTime();
        console.log("add  resultTx", resultTx);
        setTxhash(resultTx.hash);
        if (resultTx instanceof Error || newtx.code) {
          console.log("get before error", resultTx);
          setLoading(false);
        } else {
          setAddLiquidityState("submittingTransfer");
          const newLPJson: LPHistory = {
            withdraw_id: "",
            amount: value.toString(),
            block_tx_link: `${getNetworkById(selectedLP?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`,
            chain: selectedLP?.chain,
            method_type: 1,
            seq_num: resultTx.nonce,
            status: LPHistoryStatus.LP_SUBMITTING,
            token: selectedLP?.token,
            ts,
            type: LPType.LP_TYPE_ADD,
            nonce: resultTx.nonce,
            isLocal: true,
            updateTime: ts,
            txIsFailed: false,
          };
          const localLpListStr = localStorage.getItem("LpList");
          let localLpList: LPHistory[] = [];
          if (localLpListStr) {
            localLpList = JSON.parse(localLpListStr)[address] || [];
          }
          localLpList.unshift(newLPJson);
          const newJson = { [address]: localLpList };
          localStorage.setItem("LpList", JSON.stringify(newJson));
          setViewInExploreLink(`${getNetworkById(selectedLP?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`);
          const receipt = await resultTx.wait();
          try {
            if (Number(receipt?.status) !== 1) {
              setLoading(false);
            }
            setAddLiquidityState(LPHistoryStatus.LP_SUBMITTING);
            queryStatus(resultTx.hash);
          } catch (e) {
            setLoading(false);
            clearInterval(queryLiquidityStatusInterval);
          }
        }
      }
    } catch (e) {
      console.log("get error", e);
      const str = JSON.stringify(e);
      if (str.indexOf('"code":"TRANSACTION_REPLACED"') > -1) {
        const getStr = str.match(/"transactionHash":"(([0-9]|[A-Za-z])+)",/);
        setAddLiquidityState(LPHistoryStatus.LP_SUBMITTING);
        if (getStr) {
          setViewInExploreLink(`${getNetworkById(selectedLP?.chain.id).blockExplorerUrl}/tx/${getStr[1]}`);
          queryStatus(getStr[1]);
        }
      } else {
        setAddLiquidityState("txFailed");
        setLoading(false);
      }
    } finally {
      //   setLoading(false);
    }
  };
  if (selectedLP?.chain?.id !== chainId) {
    content = (
      <div>
        <div style={{ textAlign: "center" }}>
          <WarningFilled style={{ fontSize: 50, color: "#ffaa00", marginTop: 40 }} />
        </div>
        <div className={classes.modaldes}>
          Please switch to <div className={classes.yellowText}>{selectedLP?.chain?.name} </div> before adding liquidity
          to {selectedLP?.chain?.name}.
        </div>
        <Button
          type="primary"
          size="large"
          block
          // loading={loading}
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
  } else if (allowance && allowance.isZero() && !isNativeETHToken) {
    content = (
      <div className={classes.content}>
        <Avatar
          src={selectedLP?.token?.icon}
          alt={getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}
          style={{ marginBottom: 12 }}
        />
        <div className={classes.modalToptext}>
          {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}
        </div>
        <div className={classes.modaldes} style={{ marginTop: 20 }}>
          Please approve {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)} before adding
          liquidity.
        </div>
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={() => {
            approveMethod();
          }}
          className={classes.button}
        >
          Approve
        </Button>
      </div>
    );
    titleText = `Approve ${getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}`;
  } else if (addLiquidityState === "txFailed") {
    content = (
      <div>
        <div style={{ textAlign: "center", height: 30 }} />
        <div className={classes.modaldes}>
          Your transaction has failed on {selectedLP?.chain.name}. This is usually because the gas limit is set too low.
          Rest assured that your funds are safe. You may try again later.
        </div>
        <Button
          type="primary"
          size="large"
          block
          // loading={loading}
          onClick={() => {
            closeModal();
          }}
          className={classes.button}
        >
          OK
        </Button>
      </div>
    );
    titleText = "";
  } else if (addLiquidityState === "submittingTransfer") {
    content = (
      <>
        <div>
          <div className={classes.modaldes2}>
            Adding{" "}
            <span className={classes.greenText}>
              {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}{" "}
            </span>{" "}
            liquidity to <span className={classes.greenText}>{selectedLP?.chain?.name}</span>
          </div>
          <div className={classes.modalTopIcon}>
            <LoadingOutlined style={{ fontSize: 50, fontWeight: "bold", color: "#3366FF" }} />
          </div>
          <div className={classes.modaldes}>Submitting your transaction...</div>
          <div className={classes.noteview}>
            <a href={getNetworkById(chainId).blockExplorerUrl + "/tx/" + txhash} target="_blank" rel="noreferrer">
              View in Explorer
            </a>
          </div>
        </div>
      </>
    );
    titleText = " ";
  } else if (addLiquidityState === LPHistoryStatus.LP_WAITING_FOR_SGN) {
    content = (
      <>
        <div>
          <div className={classes.modaldes2}>
            Add{" "}
            <span className={classes.greenText}>
              {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}{" "}
            </span>{" "}
            liquidity to <span className={classes.greenText}>{selectedLP?.chain?.name}</span>
          </div>
          <div className={classes.modalTopIcon}>
            <LoadingOutlined style={{ fontSize: 50, fontWeight: "bold", color: "#3366FF" }} />
          </div>
          <div className={classes.modaldes}>Waiting for Celer SGN confirmations...</div>
          <div className={classes.modaldes}>
            Your transaction is being confirmed by Celer State Guardian Network (SGN), which might take a few minutes
          </div>
        </div>
      </>
    );
    titleText = " ";
  } else if (addLiquidityState === LPHistoryStatus.LP_SUBMITTING) {
    content = (
      <div>
        <div>
          <div className={classes.modaldes2}>
            Add{" "}
            <span className={classes.greenText}>
              {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}{" "}
            </span>{" "}
            liquidity to <span className={classes.greenText}>{selectedLP?.chain?.name}</span>
          </div>
          <div className={classes.modalTopIcon}>
            <LoadingOutlined style={{ fontSize: 50, fontWeight: "bold", color: "#3366FF" }} />
          </div>
          <div className={classes.modaldes}>Waiting for {chain?.block_delay} block confirmations...</div>
          <div className={classes.noteview}>
            <a href={viewInExploreLink} target="_blank" rel="noreferrer">
              View in Explorer
            </a>
          </div>
        </div>
      </div>
    );
    titleText = " ";
  } else if (
    addLiquidityState === LPHistoryStatus.LP_COMPLETED ||
    addLiquidityState === LPHistoryStatus.LP_FAILED ||
    addLiquidityState === LPHistoryStatus.LP_UNKNOWN
  ) {
    content = (
      <div>
        <div className={classes.modalTopIcon} style={{ marginTop: 0 }}>
          <CheckCircleFilled
            style={{ fontSize: 70, fontWeight: "bold", color: themeType === "dark" ? "#00E096" : "#00B42A" }}
          />
        </div>
        <div className={classes.modalsuccetext}>Success</div>
        <div className={classes.modaldes2}>
          Add{" "}
          <span className={classes.greenText}>
            {amount} {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}{" "}
          </span>{" "}
          liquidity on <span className={classes.greenText}>{selectedLP?.chain?.name}</span>
        </div>
        <div className={classes.noteview}>
          <a href={viewInExploreLink} target="_blank" rel="noreferrer">
            View in Explorer
          </a>
        </div>
        <div className={classes.modaldes}>Please allow a few minutes before the transaction completes</div>
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
      </div>
    );
    titleText = " ";
  } else if (allowance) {
    content = (
      <div>
        <div className={classes.transitem}>
          <div className={classes.transitemTitle}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className={classes.transselect}>
                <div className={classes.chainSelcet}>
                  <Avatar size="small" src={selectedLP?.chain?.icon} style={{ marginRight: 5 }} />
                  <span style={{ marginRight: 13, fontWeight: 600, fontSize: 16 }}>{selectedLP?.chain?.name}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.transcontent}>
            <div className={classes.transnum}>
              <div className={classes.transnumtext}>Input:</div>
              <div
                className={classes.transnumlimt}
                onClick={() => {
                  setMaxAmount();
                }}
              >
                Max:{" "}
                <span>
                  {selectedLP?.chain?.id === chainId
                    ? formatDecimal(
                        isNativeETHToken ? ETHBalance.toString() : tokenBalance.toString(),
                        selectedLP?.token?.token?.decimal,
                      )
                    : "--"}
                </span>
              </div>
            </div>
            <div className={classes.transndes}>
              <div className={classes.transdestext}>
                <TokenInput
                  value={amount}
                  onChange={handleTokenInputChange}
                  disabled={selectedLP?.chain?.id !== chainId}
                />
              </div>
              <div className={classes.transdeslimt}>
                <div className={classes.investSelct}>
                  <div className={classes.selectpic}>
                    <img src={selectedLP?.token.icon} alt="" />
                  </div>
                  <div className={classes.selectdes}>
                    {getTokenSymbol(selectedLP?.token?.token?.symbol, selectedLP.chain.id)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.descripet}>
          <div className={classes.descripetItem}>
            <div className={classes.leftTitle}>
              <Tooltip
                title={
                  <div>
                    <div>{`LP Fee Earning APY: ${Number(selectedLP?.lp_fee_earning_apy * 100).toFixed(2)}%`}</div>
                    <div>
                      {selectedLP?.has_farming_sessions &&
                        `Farming APY: ${Number(selectedLP?.farming_apy * 100).toFixed(2)}%`}
                    </div>
                  </div>
                }
                placement="right"
                color="#fff"
                overlayInnerStyle={{ color: "#000" }}
              >
                <div className={classes.leftTitle}>
                  APY
                  <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
                </div>
              </Tooltip>
            </div>
            <div className={classes.rightContent}>
              {formatPercentage(selectedLP?.lp_fee_earning_apy * 100 + selectedLP?.farming_apy * 100, true)}
            </div>
          </div>
        </div>
        <div className={classes.addQuilityDes}>
          <div className={classes.tipsbody}>
            <WarningFilled style={{ fontSize: 17, marginRight: 5, color: "#ff8f00" }} />
            <div className={classes.transferdes2} style={{ textAlign: "left" }}>
              <span style={{ color: "#ff8f00" }}>Your liquidity may be moved to other chains</span> when users make
              cross-chain transfers with your supplied liquidity.
            </div>
          </div>
          <div className={classes.tipsbody} style={{ margin: isMobile ? "16px 0 0 0" : "30px 0 0 0" }}>
            <WarningFilled style={{ fontSize: 17, marginRight: 5, color: "#ff8f00" }} />
            <div className={classes.transferdes2} style={{ textAlign: "left" }}>
              There is a risk of <span style={{ color: "#ff8f00" }}>pricing arbitrage</span> if you add to a liquidity
              pool that has many more times liquidity than others.{" "}
              <a
                href="https://cbridge-docs.celer.network/reference/faq#is-there-any-risk-with-providing-liquidity-in-cbridge-v2"
                target="_blank"
                rel="noreferrer"
              >
                Learn More
              </a>
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
          disabled={hasError || Number(amount) <= 0}
          loading={loading}
          onClick={() => {
            addLiquidityMethod();
            // testM()
          }}
          className={classes.button}
        >
          Add Liquidity
        </Button>
        <div className={classes.bottomTips}>
          <span style={{ color: "#ff8f00" }}>*Beta release, use at your own risk! </span>
          <div className={classes.bottomlink}>
            <a href="https://cbridge-docs.celer.network/tutorial/lp-guide" target="_blank" rel="noreferrer">
              Read LP Guide
            </a>
            <a
              href="https://cbridge-docs.celer.network/reference/audit-reports"
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 27 }}
            >
              Audit reports
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal title={titleText} onCancel={closeModal} visible={showModal} footer={null} className={classes.addModal}>
      {content}
    </Modal>
  );
};

export default AddLiquidityModal;
