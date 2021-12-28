import { Modal, Button } from "antd";
import { useEffect, useState, useContext } from "react";
import { createUseStyles } from "react-jss";
import { CheckCircleFilled, WarningFilled } from "@ant-design/icons";
import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";
import { base64, getAddress, hexlify } from "ethers/lib/utils";
import { ColorThemeContext } from "../providers/ThemeProvider";
import { getNetworkById } from "../constants/network";
import { useContractsContext } from "../providers/ContractsContextProvider";
import { useWeb3Context } from "../providers/Web3ContextProvider";
import { useAppSelector } from "../redux/store";
import { queryLiquidityStatus } from "../redux/gateway";
import { LPType, LPHistoryStatus, LPHistory } from "../constants/type";
import { Theme } from "../theme";
import { formatDecimal } from "../helpers/format";
import { switchChain } from "../redux/transferSlice";
import ExceedSafeguardModal from "./ExceedSafeguardModal";
import { getTokenSymbol } from "../redux/assetSlice";
import { useBigAmountDelay } from "../hooks";
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
    marginTop: 15,
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
  removeModal: {
    width: props => (props.isMobile ? "100%" : 446),
    minWidth: props => (props.isMobile ? "100%" : 446),
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
        padding: props => (props.isMobile ? "24px 16px" : ""),
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
}));

export interface AddLiquidityModalProps {
  visible: boolean;
  onCancel: () => void;
  record: any;
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

const HistoryLPModal = ({ onCancel, visible, record }: AddLiquidityModalProps): JSX.Element => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const {
    contracts: { bridge },
    transactor,
  } = useContractsContext();
  const { chainId, address } = useWeb3Context();
  const [transfState, setTransfState] = useState(record?.status);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewInExploreLink, setViewInExploreLink] = useState<string>("");
  const [showExceedSafeguardModal, setShowExceedSafeguardModal] = useState(false);
  const { isBigAmountDelayed, delayMinutes, delayThresholds } = useBigAmountDelay(
    record?.chain,
    record?.token.token,
    Number(formatUnits(record?.amount, record?.token?.token?.decimal)) ?? 0,
  );
  let content;
  let titleText = "Remove Liquidity";
  const { themeType } = useContext(ColorThemeContext);
  useEffect(() => {
    setTransfState(record?.status);
  }, [record]);

  const closeModal = () => {
    onCancel();
  };

  const getBigAmountModalMsg = (): string => {
    const time = isBigAmountDelayed ? `up to ${delayMinutes} minutes` : "a few minutes";
    return `Please allow ${time} before the transaction completes.`;
  };

  // Contract remove liquidity method
  const confirmRemoveLiquidityMethod = async () => {
    if (!bridge || !transactor) {
      return;
    }
    setLoading(true);
    const res = await queryLiquidityStatus({
      seq_num: record?.seq_num,
      lp_addr: address,
      chain_id: record?.chain?.id,
      type: LPType.LP_TYPE_REMOVE,
    });

    const { wd_onchain: _wdmsg, sorted_sigs: _sigs, signers: _signers, powers: _powers } = res;
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
      if (bridge) {
        maxT = await bridge.epochVolumeCaps(record?.token?.token?.address);
        maxT = maxT.mul(98).div(100);
        currentVolume = await bridge.epochVolumes(record?.token?.token?.address);
      }
      const currentValue = BigNumber.from(record?.amount);
      const totalValue = currentValue.add(currentVolume);
      if (!maxT.eq(0) && totalValue.gte(maxT)) {
        setLoading(false);
        setShowExceedSafeguardModal(true);
        return;
      }
      const resultTx = await transactor(bridge.withdraw(wdmsg, sigs, signers, powers)).catch(e => {
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
          setTransfState(LPHistoryStatus.LP_COMPLETED);
          setLoading(false);
          // await markLiquidity({
          //   lp_addr: address,
          //   amt: record?.amount,
          //   token_addr: record?.token?.token?.address,
          //   chain_id: record?.chain?.id,
          //   seq_num: record?.seq_num,
          //   tx_hash: resultTx.hash,
          //   type: LPType.LP_TYPE_REMOVE,
          // });
          const newLPJson: LPHistory = {
            withdraw_id: "",
            amount: record?.amount,
            block_tx_link: `${getNetworkById(record?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`,
            chain: record?.chain,
            method_type: 1,
            seq_num: Number(record?.seq_num),
            status: LPHistoryStatus.LP_SUBMITTING,
            token: record?.token,
            ts: record?.ts,
            updateTime: new Date().getTime(),
            type: LPType.LP_TYPE_REMOVE,
            nonce: resultTx.nonce,
            isLocal: true,
            txIsFailed: false,
          };
          const localLpListStr = localStorage.getItem("LpList");
          let localLpList: LPHistory[] = [];
          if (localLpListStr) {
            localLpList = JSON.parse(localLpListStr)[address] || [];
          }
          let isHave = false;
          localLpList.map(item => {
            if (Number(item.seq_num) === Number(record.seq_num) && item.type === LPType.LP_TYPE_REMOVE) {
              isHave = true;
              item.updateTime = new Date().getTime();
              item.txIsFailed = false;
              item.block_tx_link = `${getNetworkById(record?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`;
            }
            return item;
          });
          if (!isHave) {
            localLpList.unshift(newLPJson);
          }
          const newJson = { [address]: localLpList };
          localStorage.setItem("LpList", JSON.stringify(newJson));

          const queryStatusRes = await queryLiquidityStatus({
            seq_num: record?.seq_num,
            lp_addr: address,
            chain_id: record?.chain?.id,
            type: LPType.LP_TYPE_REMOVE,
          });
          setViewInExploreLink(
            queryStatusRes?.block_tx_link || `${getNetworkById(record?.chain.id).blockExplorerUrl}/tx/${resultTx.hash}`,
          );
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

  const liquidityAmount = formatDecimal(record?.amount, record?.token?.token?.decimal);
  if (record?.chain?.id !== chainId) {
    content = (
      <div>
        <div style={{ textAlign: "center" }}>
          <WarningFilled style={{ fontSize: 50, color: "#ffaa00", marginTop: 40 }} />
        </div>
        <div className={classes.modaldes}>
          Please switch to <div className={classes.yellowText}>{record?.chain?.name} </div> before confirming liquidity
          removal
        </div>
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={() => {
            if (!isMobile) {
              switchChain(record?.chain?.id, "");
            } else {
              onCancel();
            }
          }}
          className={classes.button}
        >
          OK
        </Button>
      </div>
    );
    titleText = "";
  } else if (transfState === LPHistoryStatus.LP_WAITING_FOR_LP) {
    content = (
      <>
        <div className={classes.modalTop}>
          <div className={classes.modaldes2}>
            Remove{" "}
            <span className={classes.greenText}>
              {liquidityAmount} {getTokenSymbol(record?.token?.token?.symbol, record?.chain?.id)}{" "}
            </span>{" "}
            liquidity from <span className={classes.greenText}>{record?.chain?.name}</span>
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
    content = (
      <div>
        <div className={classes.modalTopIcon} style={{ marginTop: 0 }}>
          <CheckCircleFilled
            style={{ fontSize: 70, fontWeight: "bold", color: themeType === "dark" ? "#00e096" : "#00B42A" }}
          />
        </div>
        <div className={classes.modalsuccetext}>Success</div>
        <div className={classes.modaldes2}>
          Remove{" "}
          <span className={classes.greenText}>
            {liquidityAmount} {getTokenSymbol(record?.token?.token?.symbol, record?.chain?.id)}{" "}
          </span>{" "}
          liquidity from <span className={classes.greenText}>{record?.chain?.name}</span>
        </div>
        <div className={classes.noteview}>
          <a href={viewInExploreLink} target="_blank">
            View in Explorer{" "}
          </a>
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
  }

  return (
    <Modal
      title={titleText}
      width={512}
      onCancel={closeModal}
      visible={visible}
      footer={null}
      maskClosable={false}
      className={classes.removeModal}
    >
      {content}
    </Modal>
  );
};

export default HistoryLPModal;
