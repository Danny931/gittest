/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, Slider, Row, Col, Input } from "antd";
import { useCallback, useEffect, useState, useContext } from "react";
import { createUseStyles } from "react-jss";
import { WarningFilled, DownOutlined } from "@ant-design/icons";
// eslint-disable-next-line
import { parseUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { debounce } from "lodash";
import { useWeb3Context } from "../../providers/Web3ContextProvider";

import { ERC20 } from "../../typechain/ERC20";
import { ERC20__factory } from "../../typechain/factories/ERC20__factory";
import { ColorThemeContext } from "../../providers/ThemeProvider";

import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useCustomContractLoader } from "../../hooks";
import { Theme } from "../../theme";
import { setSingleChainSelectIndex, setSingleChainList } from "../../redux/transferSlice";
import { formatDecimal } from "../../helpers/format";
import trangleT from "../../images/trangleT.svg";
import close from "../../images/close.svg";
import { getNetworkById } from "../../constants/network";
import { estimateWithdrawAmt } from "../../redux/gateway";
import {
  EstimateWithdrawAmtRequest,
  EstimateWithdrawAmtResponse,
  WithdrawInfo,
  EstimateWithdrawAmt,
  ErrMsg,
} from "../../proto/sgn/gateway/v1/gateway_pb";
import { getTokenSymbol } from "../../redux/assetSlice";

/* eslint-disable no-debugger */
/* eslint-disable camelcase */

const useStyles = createUseStyles((theme: Theme) => ({
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
    marginTop: 40,
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
    marginTop: 40,
    fontSize: 15,
    textAlign: "center",
  },
  modaldes2: {
    color: theme.surfacePrimary,
    marginTop: 30,
    fontSize: 18,
    textAlign: "center",
  },
  estimated: {
    width: "100%",
    height: "auto",
    background: theme.primaryBackground,
    color: theme.surfacePrimary,
    fontSize: 12,
    maxLines: 1,
    fontWeight: 600,
    borderTop: "none",
    borderRadius: "0 0 12px 12px",
    padding: "11px",
  },
  singleChain: {
    position: "relative",
    border: `2px solid ${theme.primaryUnable}`,
    borderRadius: "12px",
    cursor: "pointer",
    marginTop: 28,
    "&:hover": {
      // boxShadow: `0 0 0 5px ${theme.primaryBrand} `,
      border: `2px solid ${theme.primaryBrand}`,

      "& .ant-slider-handle": {
        animationTimingFunction: "ease-in-out",
        animationName: "breathe",
        animationDuration: "3000ms",
        animationIterationCount: "infinite",
        animationDirection: "normal",
        // animation-name: breathe,
        // animation-duration: 3000ms,
        // animation-iteration-count: infinite,
        // animation-direction: alternate,
      },
    },
  },

  transitem: {
    padding: "26px 16px 17px 16px",
  },
  transitemTitle: {
    //   background: theme.dark.contentBackground,
    color: theme.surfacePrimary,
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
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
    fontSize: 10,
    color: theme.secondBrand,
    fontWeight: 600,
    textAlign: "right",
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
    margin: "10px 0",
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
    //   fontSize: theme.transferFontM,
    color: "#fc5656",
    // width: "98%",
    // height: 41,
    textAlign: "center",
    marginTop: 40,
    background: "#fff",
    borderRadius: 12,
    padding: "8px 12px",
  },
  errInnerbody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errnote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: theme.infoWarning,
  },
  errnoteimg: {
    color: theme.infoWarning,
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
    "& .ant-modal-content": {
      background: theme.secondBackground,
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
    marginTop: 4,
    "&:hover": {
      "& .ant-slider-rail": {
        background: `${theme.primaryUnable} !important`,
      },
      "& .ant-slider-track": {
        background: `${theme.primaryBrand} !important`,
      },
    },
    "& .ant-slider-rail": {
      // 背景条
      height: 14,
      background: theme.primaryUnable,
      borderRadius: "100px",
    },
    "& .ant-slider-step": {
      height: 14,
    },
    "& .ant-slider-track": {
      // 活动条
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

  sliderInput: {
    backgroundColor: "transparent",
    width: 120,
    height: 48,
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
    "& .ant-input[disabled]": {
      backgroundColor: "transparent",
      textAlign: "right",
      color: theme.surfacePrimary,
    },
    "&:focuse": {
      borderColor: theme.primaryBrand,
    },
  },
  silderTitle: {
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1,
    color: theme.surfacePrimary,
  },
  closeIcon: {
    position: "absolute",
    width: 16,
    height: 16,
    top: 8,
    right: 16,
  },
  waring: {
    padding: "0 16px",
  },
  warningInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: theme.surfacePrimary,
    textAlign: "center",
    margin: "0 0 8px 0",
    borderRadius: 8,
    padding: "8px 15px",
  },
  waringIcon: {
    fontSize: 20,
    marginRight: 5,
    color: "#ff8f00",
  },
  waringText: {
    fontSize: 10,
    fontWeight: 600,
    color: "#17171A",
  },
  disableTooltip: {
    position: "absolute",
    top: 88,
    left: 85,
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
    width: 265,
    fontSize: 12,
    borderRadius: 8,
    textAlign: "center",
    padding: "8px 12px",
    color: "rgb(10, 30, 66)",
    background: "rgb(255, 255, 255)",
    position: "relative",
  },
  actionAre: {
    position: "relative",
  },
  cover: {
    position: "absolute",
    top: 0,
    left: -10,
    width: "103%",
    height: 66,
    background: theme.secondBackground,
    opacity: 0.7,
    zIndex: 10,
  },
  downIcon: {
    color: theme.surfacePrimary,
    fontSize: 15,
  },
}));

export interface SingleChainProps {
  // showModal: boolean;
  showChain: () => void;
  record: any;
  index: number;
  chainToken: any;
  onSuccess: () => void;
  onError: (errMsg: ErrMsg.AsObject) => void;
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

const SingleChain = ({ showChain, record, index, chainToken, onSuccess, onError }: SingleChainProps): JSX.Element => {
  const classes = useStyles();
  const { provider, address } = useWeb3Context();
  const dispatch = useAppDispatch();
  const { selectedLP } = useAppSelector(state => state.lp);
  const tokenContract = useCustomContractLoader(provider, selectedLP?.token?.token?.address || "", ERC20__factory) as
    | ERC20
    | undefined;
  const [allowance, setAllowance] = useState<BigNumber>();
  // const [sliderValue, setSliderValue] = useState<string>(record.ratio);
  const { transferInfo } = useAppSelector(state => state);
  const { singleChainSelectIndex, singleChainList } = transferInfo;
  const { themeType } = useContext(ColorThemeContext);

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
      label: (
        <div className={classes.sliderText} style={{ marginRight: 10 }}>
          <img src={trangleT} alt="" className={classes.sliderIcon} />
          <div style={{ lineHeight: 1 }}>100%</div>
        </div>
      ),
    },
  };

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(nextValues => getestimate(nextValues), 300),
    [],
  );

  const getestimate = async nextValues => {
    const req = new EstimateWithdrawAmtRequest();
    req.setSrcWithdrawsList(nextValues.src_withdrawsList);
    req.setDstChainId(selectedLP?.chain.id);
    req.setTokenSymbol(selectedLP?.token.token.symbol);
    req.setUsrAddr(address);

    const res: EstimateWithdrawAmtResponse = await estimateWithdrawAmt(req);
    const resObject = res.toObject();
    if (resObject.err && resObject.err !== undefined) {
      onError(resObject.err);
    } else {
      onSuccess();
    }
    if (JSON.stringify(res.getReqAmtMap()) !== "{}") {
      const newList = JSON.parse(JSON.stringify(nextValues.singleChainList));
      newList?.map(item => {
        if (
          !BigNumber.from(item.ratio ? Math.round(Number(item.ratio) * 10000000) : "0")
            .mul(BigNumber.from(item.totalLiquidity))
            .div(10000000)
            .div(100)
            .eq(0)
        ) {
          const resMap = res.getReqAmtMap();
          resMap.forEach((entry: EstimateWithdrawAmt, key: number) => {
            if (key === Number(item.from_chain_id)) {
              // const totleFee = (Number(entry.getBaseFee()) + Number(entry.getPercFee())).toString() || "0";
              const eqValueTokenAmtBigNum = BigNumber.from(entry.getEqValueTokenAmt());
              // const feeBigNum = BigNumber.from(totleFee);
              const feeBigNum = BigNumber.from(entry.getBaseFee() !== "" ? entry.getBaseFee() : "0").add(
                BigNumber.from(entry.getPercFee() !== "" ? entry.getPercFee() : "0"),
              );
              const totalFee = feeBigNum.toString();
              const targetReceiveAmounts = eqValueTokenAmtBigNum.sub(feeBigNum);
              item.stimatedReceived = targetReceiveAmounts.toString();
              item.bridgeRate = entry.getBridgeRate();
              item.fee = totalFee;
              item.slippage_tolerance = entry.getSlippageTolerance();
              item.errorMsg =
                Number(entry.getBridgeRate()) < 0.9
                  ? ` The liquidity transfer rate from ${item?.chain.name} to ${selectedLP?.chain.name} is currently low. It is
                    recommended to directly remove liquidity on
                    ${item?.chain.name} to avoid slippage.`
                  : "";
            }
          });
          // const data = resList[Number(item.from_chain_id)];
          // const feeBigNum = BigNumber.from(data?.base_fee !== "" ? data?.base_fee : "0").add(
          //   BigNumber.from(data?.perc_fee !== "" ? data?.perc_fee : "0"),
          // );
          // const eqValueTokenAmtBigNum = BigNumber.from(data.eq_value_token_amt);
          // const totalFee = feeBigNum.toString();
          // const targetReceiveAmounts = eqValueTokenAmtBigNum.sub(feeBigNum);
          // item.stimatedReceived = targetReceiveAmounts.toString();
          // item.bridgeRate = data.bridge_rate;
          // item.fee = totalFee;
          // item.slippage_tolerance = data.slippage_tolerance;
          // item.errorMsg =
          //   Number(data.bridge_rate) < 0.9
          //     ? ` The liquidity transfer rate from ${item?.chain.name} to ${selectedLP?.chain.name} is currently low. It is
          //     recommended to directly remove liquidity on
          //     ${item?.chain.name} to avoid slippage.`
          //     : "";
        }
        return item;
      });

      dispatch(setSingleChainList(newList));
    }
  };

  const onInputChange = async e => {
    const newList = JSON.parse(JSON.stringify(singleChainList));
    let val = e.target.value;
    const reg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{0,6})?$/;
    if (val && !reg.test(val)) {
      return;
    }
    if (Number(val) < 0 || !val) {
      newList[index].ratio = "";
      newList[index].stimatedReceived = "0";
      newList[index].bridgeRate = "";
      newList[index].fee = "0";
      newList[index].errorMsg = "";
      val = "";
    } else if (Number(val) >= 100) {
      val = "100";
      newList[index].ratio = "100";
    } else {
      newList[index].ratio = val;
    }
    dispatch(setSingleChainList(newList));
    const src_withdrawsList = newList?.map(item => {
      const amountVal = BigNumber.from(item.totalLiquidity)
        .mul(item.ratio ? Math.round(Number(item.ratio) * 10000000) : "0")
        .div(1000000000)
        .toString();
      const infoJson = new WithdrawInfo();
      infoJson.setChainId(item.chain.id);
      infoJson.setSlippageTolerance(item.slippage_tolerance);
      infoJson.setAmount(amountVal);

      return infoJson;
    });
    const filterList = src_withdrawsList?.filter(item => item.getAmount() !== "0");
    debouncedSave({ src_withdrawsList: filterList, singleChainList: newList });
  };
  const onSliderChange = val => {
    const newList = JSON.parse(JSON.stringify(singleChainList));
    newList[index].ratio = val;
    if (Number(val) <= 0 || !val) {
      if (val === "0") {
        newList[index].ratio = "0";
      } else {
        newList[index].ratio = "";
      }
      newList[index].stimatedReceived = "0";
      newList[index].bridgeRate = "";
      newList[index].fee = "0";
      newList[index].errorMsg = "";
    }
    dispatch(setSingleChainList(newList));
    const src_withdrawsList = newList?.map(item => {
      const amountVal = BigNumber.from(item.totalLiquidity)
        .mul(item.ratio ? Math.round(Number(item.ratio) * 10000000) : "0")
        .div(1000000000)
        .toString();

      const infoJson = new WithdrawInfo();
      infoJson.setChainId(item.chain.id);
      infoJson.setSlippageTolerance(item.slippage_tolerance);
      infoJson.setAmount(amountVal);
      return infoJson;
    });
    const filterList = src_withdrawsList?.filter(item => item.getAmount() !== "0");
    debouncedSave({ src_withdrawsList: filterList, singleChainList: newList });
  };
  const deleteItem = () => {
    const newList = JSON.parse(JSON.stringify(singleChainList));
    newList.splice(index, 1);
    dispatch(setSingleChainList(newList));
    if (singleChainSelectIndex === index) {
      dispatch(setSingleChainSelectIndex(0));
    }
  };
  const selectedSingle = () => {
    dispatch(setSingleChainSelectIndex(index));
  };
  const { isMobile } = useAppSelector(state => state.windowWidth);

  return (
    <div className={classes.singleChain} onClick={() => selectedSingle()}>
      <div>
        {!(singleChainList.length === 1 && index === 0) && (
          <div
            onClick={e => {
              e.stopPropagation();
              deleteItem();
            }}
          >
            <img className={classes.closeIcon} src={close} alt="" />
          </div>
        )}
      </div>
      <div className={classes.transitem} style={{ padding: isMobile ? "26px 12px 16px 12px" : "26px 16px 17px 16px" }}>
        <div className={classes.transitemTitle}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className={classes.transselect}>
              <div
                className={classes.chainSelcet}
                onClick={() => {
                  showChain();
                }}
              >
                <Avatar size="small" src={getNetworkById(record.from_chain_id).iconUrl} style={{ marginRight: 5 }} />
                <span style={{ marginRight: isMobile ? 0 : 13, fontSize: 16 }}>
                  {getNetworkById(record.from_chain_id).name === "--"
                    ? "Select Chain"
                    : getNetworkById(record.from_chain_id).name}
                </span>
                {/* <img src={arrowDowm} alt="more from chain" /> */}
                <DownOutlined />
                {!record?.from_chain_id && (
                  <div
                    className={classes.disableTooltip}
                    style={
                      themeType === "dark"
                        ? { boxShadow: "none" }
                        : { boxShadow: "0px 3px 10px 4px rgba(143, 155, 179, 0.3)" }
                    }
                  >
                    <div className={classes.disableTooltipbody} style={{ width: 200, marginTop: isMobile ? -10 : 0 }}>
                      <div className={classes.disableTooltipTran} />
                      Please select a chain you want to remove liquidity from.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className={classes.transChainame} style={{ fontSize: isMobile ? 6 : 10, marginTop: isMobile ? 6 : 0 }}>
              Removed Amount:{" "}
              {BigNumber.from(record.totalLiquidity)
                .mul(record.ratio ? Math.round(Number(record.ratio) * 10000000) : "0")
                .div(1000000000)
                .gt(0) ? (
                <span>
                  {formatDecimal(
                    BigNumber.from(record.totalLiquidity)
                      .mul(record.ratio ? Math.round(Number(record.ratio) * 10000000) : "0")
                      .div(1000000000),
                    record?.token.decimal,
                  )}
                </span>
              ) : (
                "--"
              )}{" "}
              {getTokenSymbol(record?.token.symbol, record.from_chain_id)}
            </div>
            <div className={classes.transChainame}>
              Liquidity transfer rate: {record.bridgeRate ? record.bridgeRate : "--"}
            </div>
            <div className={classes.transChainame}>
              Fee:{" "}
              {BigNumber.from(record.fee).gt(0) ? (
                <span>
                  {formatDecimal(BigNumber.from(record.fee), selectedLP?.token?.token?.decimal)}{" "}
                  {getTokenSymbol(record?.token.symbol, record.from_chain_id)}
                </span>
              ) : (
                "--"
              )}
            </div>
          </div>
        </div>
        <div className={classes.actionAre}>
          {!record?.from_chain_id && <div className={classes.cover} />}
          <Row style={{ margin: isMobile ? "30px 0 0 0" : "3px 0 0 0" }}>
            <Col span={isMobile ? 14 : 16}>
              <div className={classes.silderTitle}>Liquidity Share to Remove</div>
              <Slider
                marks={marks}
                step={1}
                className={classes.silder}
                style={{ marginLeft: 2 }}
                onChange={v => onSliderChange(v.toString())}
                value={record.ratio ? Number(record.ratio) : 0}
                disabled={!record?.from_chain_id}
              />
            </Col>
            <Col span={isMobile ? 10 : 8} style={{ position: "relative" }}>
              <Input
                min={0}
                max={20}
                suffix="%"
                type="number"
                className={classes.sliderInput}
                style={{
                  margin: isMobile ? "8px 0 0 2px" : "6px 0 0 16px",
                  width: isMobile ? 115 : 120,
                  fontSize: isMobile ? 10 : 14,
                  height: isMobile ? 38 : 48,
                }}
                value={record.ratio}
                onChange={e => onInputChange(e)}
                disabled={!record?.from_chain_id}
              />
            </Col>
          </Row>
        </div>
      </div>
      <div className={classes.waring}>
        {record?.errorMsg && (
          <div className={classes.warningInner}>
            <WarningFilled className={classes.waringIcon} />
            <span className={classes.waringText}>{record?.errorMsg}</span>
          </div>
        )}
      </div>
      {record?.from_chain_id && (
        <div className={classes.estimated} style={{ fontSize: isMobile ? 8 : 12 }}>
          Estimated Received Amount on {selectedLP?.chain.name}:{" "}
          <span>
            {record.stimatedReceived !== "0" ? (
              <span>{formatDecimal(record.stimatedReceived, selectedLP?.token?.token?.decimal)}</span>
            ) : (
              "--"
            )}{" "}
            {getTokenSymbol(record.token.symbol, selectedLP?.chain.id)}
          </span>
        </div>
      )}
    </div>
  );
};

export default SingleChain;
