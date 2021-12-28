import { useState, useEffect } from "react";
import { Button, Tooltip } from "antd";
import { createUseStyles } from "react-jss";
import { base64 } from "ethers/lib/utils";
import { InfoCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import classNames from "classnames";
import { BigNumber } from "@ethersproject/bignumber";
import { formatDecimal } from "celer-web-utils/lib/format";
import { Theme } from "../../theme";
import { useWeb3Context } from "../../providers/Web3ContextProvider";
import { useContractsContext } from "../../providers/ContractsContextProvider";
import { claimPercentageFeeRebate, getPercentageFeeRebateInfo } from "../../redux/gateway";
import { ClaimType, GetPercentageFeeRebateInfoResponse } from "../../constants/type";
import SwitchChainModal from "./SwitchChainModal";
import ClaimSuccessModal from "./ClaimSuccessModal";
import { formatTimeCountDown } from "../../utils/timeFormat";
import { useAppSelector } from "../../redux/store";
import bannerFeeRebate from "../../images/bannerFeeRebate.png";
import learnMoreImage from "../../images/learnMoreIcon.png";

let leftInterval;
const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  liquidityContent: {
    width: "100%",
    margin: "0 auto",
    position: "relative",
    lineHeight: 1,
    marginTop: "20px",
    marginBottom: 0,
    background: theme.secondBackground,
    padding: props => (props.isMobile ? "0 0 0 0 " : "0 16px 0 16px"),
    borderRadius: props => (props.isMobile ? 0 : 16),
    border: props => (props.isMobile ? "none" : `1px solid ${theme.primaryBorder}`),
  },
  liquidityInfo: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    "& :first": {
      marginRight: 18,
    },
  },
  mobileLiquidityInfo: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 30,
    "& :first": {
      marginRight: 18,
    },
  },
  liquidityInfoCol: {
    height: 142,
    // flex: 1,
    marginLeft: 15,
    padding: "35px 24px",
    borderRadius: 16,
    background: theme.primaryBackground,
  },
  mobileLiquidityInfoCol: {
    height: 118,
    marginTop: 10,
    padding: "30px 15px 20px 15px",
    borderRadius: 16,
    background: theme.primaryBackground,
  },
  mobileTimeLiquidityInfoCol: {
    marginTop: 10,
    padding: "30px 15px 30px 15px",
    borderRadius: 16,
    background: theme.primaryBackground,
  },
  countDown: {
    width: "33%",
  },
  rebateReward: {
    width: "67%",
  },
  statTitle: {
    color: theme.secondBrand,
    fontSize: props => (props.isMobile ? 12 : 14),
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
  },
  statNum: {
    color: theme.surfacePrimary,
    fontWeight: 700,
    fontSize: 22,
    marginTop: 10,
  },
  claimBtn: {
    background: theme.primaryBrand,
    color: theme.unityWhite,
    border: 0,
    width: "107px",
    borderRadius: 6,
    fontSize: 16,
    marginTop: 10,
    "&:focus, &:hover": {
      background: theme.primaryBrand,
    },
  },
  header: {
    fontSize: 12,
    fontWeight: 400,
    color: theme.secondBrand,
    marginTop: 0,
    marginBottom: props => (props.isMobile ? 0 : 0),
    display: "flex",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: theme.surfacePrimary,
    marginTop: props => (props.isMobile ? 0 : 28),
  },
  titleDesc: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: props => (props.isMobile ? "14px" : "20px"),
    color: theme.secondBrand,
    marginTop: 10,
    marginBottom: 0,
  },
  bannerImage: {
    width: props => (props.isMobile ? 156 : 372),
    height: props => (props.isMobile ? 52 : 124),
    marginTop: props => (props.isMobile ? 30 : 0),
    marginLeft: 6,
  },
  statNumDes: {
    fontSize: 14,
    fontWeight: 500,
    marginTop: 3,
    color: theme.secondBrand,
  },
  statTitleBot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLider: {},
  silder: {
    marginLeft: 0,
    "&:hover": {
      "& .ant-slider-rail": {
        background: `${theme.primaryUnable} !important`,
      },
      "& .ant-slider-track": {
        background: `${theme.sliderTrack} !important`,
      },
    },
    "& .ant-slider-rail": {
      // 背景条
      height: 11,
      background: theme.primaryUnable,
      borderRadius: "100px",
    },
    "& .ant-slider-step": {
      height: 11,
    },
    "& .ant-slider-track": {
      // 活动条
      height: 11,
      background: theme.sliderTrack,
      borderRadius: "100px",
    },
    "& .ant-slider-dot": {
      display: "none",
    },
    "& .ant-slider-handle": {
      top: 9,
      display: "none",
    },
    "& .ant-slider-mark-text": {
      color: theme.secondBrand,
    },
  },
  stateDes2: {
    fontSize: 14,
    fontWeight: 500,
    marginTop: 10,
    color: theme.unityWhite,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleDescBlue: {
    color: theme.primaryBrand,
  },
  timeDes: {
    fontSize: 14,
    fontWeight: 400,
    marginTop: 10,
    color: theme.surfacePrimary,
  },
}));

interface FeeRebateProps {
  showFeeRebate: (show: boolean) => void;
  showLoading: (show: boolean) => void;
}

export default function FeeRebate(props: FeeRebateProps): JSX.Element | null {
  const { showFeeRebate, showLoading } = props;
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const {
    contracts: { incentiveEventsReward },
  } = useContractsContext();
  const { address, chainId } = useWeb3Context();
  const [switchChainModalState, setSwitchChainModalState] = useState(false);
  const [claimSuccessModalState, setClaimSuccessModalState] = useState(false);
  const [claimRewardStatus, setClaimRewardStatus] = useState<ClaimType>();
  const [getPercentageFeeRebateInfoResponse, setGetPercentageFeeRebateInfoResponse] =
    useState<GetPercentageFeeRebateInfoResponse>();
  const [leftTimes, setLeftTimes] = useState<number>(0);
  const [claimTxHash, setClaimTxHash] = useState<string>("");

  const initData = () => {
    getPercentageFeeRebate();
  };
  useEffect(() => {
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, incentiveEventsReward]);

  const getPercentageFeeRebate = () => {
    if (!address) {
      return;
    }
    showLoading(true);
    getPercentageFeeRebateInfo({ addr: address })
      .then(res => {
        showFeeRebate(Number(res.event_id) > 0);
        showLoading(false);
        if (res && Number(res.event_id) > 0) {
          setGetPercentageFeeRebateInfoResponse(res);
        }
      })
      .catch(e => {
        showFeeRebate(false);
        showLoading(false);
        console.log(e);
      });
  };

  const claimedRewardAmountsData = async eventID => {
    try {
      const farmTx = await incentiveEventsReward?.claimedRewardAmounts(eventID, address);
      if (BigNumber.from(farmTx).gte(BigNumber.from(getPercentageFeeRebateInfoResponse?.reward))) {
        setClaimRewardStatus(ClaimType.COMPLETED);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const claimMethod = async () => {
    if (chainId !== Number(process.env.REACT_APP_BSC_ID)) {
      setSwitchChainModalState(true);
      return;
    }
    if (!incentiveEventsReward) {
      return;
    }
    setClaimRewardStatus(ClaimType.CLAIMING);
    const claimPercentageFeeRebateResponse = await claimPercentageFeeRebate({ addr: address });

    if (claimPercentageFeeRebateResponse) {
      const signatures = claimPercentageFeeRebateResponse.signature;
      const sigs = base64.decode(signatures.sig_bytes);
      try {
        const claimTx = (
          await incentiveEventsReward.claimReward(
            address,
            claimPercentageFeeRebateResponse.event_id,
            claimPercentageFeeRebateResponse.reward,
            sigs,
          )
        ).hash;
        console.log(claimTx);
        setClaimTxHash(claimTx);
        setClaimRewardStatus(ClaimType.COMPLETED);
        setClaimSuccessModalState(true);
        initData();
      } catch (e) {
        console.log(e);
        setClaimRewardStatus(ClaimType.UNLUCK_SUCCESSED);
      }
    } else {
      setClaimRewardStatus(ClaimType.UNLUCK_SUCCESSED);
    }
  };

  useEffect(() => {
    if (!getPercentageFeeRebateInfoResponse) {
      return;
    }
    startCountDown();
    if (getPercentageFeeRebateInfoResponse && getPercentageFeeRebateInfoResponse?.signature.sig_bytes) {
      claimedRewardAmountsData(getPercentageFeeRebateInfoResponse?.event_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPercentageFeeRebateInfoResponse]);

  const startCountDown = () => {
    clearInterval(leftInterval);
    if (claimRewardStatus === ClaimType.COMPLETED) {
      return;
    }

    const endTime = getPercentageFeeRebateInfoResponse?.event_end_time || 0;
    let leftT = (endTime - new Date().getTime()) / 1000;
    if (
      (getPercentageFeeRebateInfoResponse?.so_far_sum_reward || 0) >=
      (getPercentageFeeRebateInfoResponse?.event_max_reward_cap || 0)
    ) {
      leftT = 0;
    }
    if (leftT > 0) {
      setClaimRewardStatus(ClaimType.UNLUCKED_TOO_FREQUENTLY);
    } else {
      const rewward = getPercentageFeeRebateInfoResponse?.reward || "0";
      if (Number(formatDecimal(rewward, 2)) > 0.01) {
        setClaimRewardStatus(ClaimType.UNLUCK_SUCCESSED);
      }
      return;
    }
    setLeftTimes(leftT);
    leftInterval = setInterval(() => {
      if (leftT <= 0) {
        clearInterval(leftInterval);
        setClaimRewardStatus(ClaimType.UNLUCK_SUCCESSED);
      } else {
        leftT -= 1;
      }
      setLeftTimes(leftT);
    }, 1000);
  };

  if (!getPercentageFeeRebateInfoResponse) {
    return null;
  }

  const curReward = formatDecimal(getPercentageFeeRebateInfoResponse.reward, 2);

  const renderBtn = () => {
    switch (claimRewardStatus) {
      case ClaimType.UNLUCK_SUCCESSED:
        return (
          <Button type="primary" className={classes.claimBtn} onClick={claimMethod}>
            Claim
          </Button>
        );
      case ClaimType.CLAIMING:
        return (
          <Button type="primary" className={classes.claimBtn} disabled>
            Claiming
          </Button>
        );
      case ClaimType.COMPLETED:
        return (
          <Button type="primary" className={classes.claimBtn} disabled>
            Claimed
          </Button>
        );
      default:
        return (
          <Button type="primary" className={classes.claimBtn} disabled>
            Claim
          </Button>
        );
    }
  };

  const learnMore = () => {
    return (
      <a href="https://cbridge-docs.celer.network/rewards/fee-rebate" target="_blank" rel="noreferrer">
        {" Learn More"}
      </a>
    );
  };

  const liquidityInfoPanel = () => (
    <div>
      <div className={classes.header}>
        <div>
          <div className={classes.title}>Fee Rebate</div>
          <div className={classes.titleDesc}>
            {" "}
            During the event period, you will be able to receive a rebate on the fees you pay while using cBridge v2.
            The higher the volume you bridged, the higher the rebate received.
            <span>{learnMore()}</span>
          </div>
        </div>
        <img className={classes.bannerImage} src={bannerFeeRebate} alt="banner fee rebate" />
      </div>
      <div className={isMobile ? classes.mobileLiquidityInfo : classes.liquidityInfo}>
        <div
          className={
            isMobile ? classes.mobileTimeLiquidityInfoCol : classNames(classes.liquidityInfoCol, classes.countDown)
          }
          style={{ marginLeft: 0 }}
        >
          <div className={classes.statTitle}>Event Ends in:</div>
          <div className={classes.statNum}>
            <span>{leftTimes > 0 ? formatTimeCountDown(leftTimes) : "This event has ended"}</span>
          </div>
          {leftTimes > 0 && (
            <div className={classes.timeDes}>
              or when the max reward cap is reached{" "}
              <span>
                <div
                  onClick={() => {
                    window.open("https://cbridge-docs.celer.network/rewards/fee-rebate");
                  }}
                  style={{ cursor: "pointer", display: "inline-block" }}
                >
                  <img src={learnMoreImage} alt="LAYER2.FINANCE" style={{ width: "20px" }} />
                </div>
              </span>
            </div>
          )}
        </div>
        <div
          className={
            isMobile ? classes.mobileLiquidityInfoCol : classNames(classes.liquidityInfoCol, classes.rebateReward)
          }
        >
          <div className={classes.statTitle}>
            Current fee rebate reward
            <Tooltip
              placement="top"
              title={
                <div>
                  {" "}
                  For each transfer you make during the event period, you will receive{" "}
                  {getPercentageFeeRebateInfoResponse.rebate_portion * 100}% rebate on the fees. The higher the volume
                  you bridged, the higher the rebate.
                  <br />
                  <br />
                  Your fee rebate reward is claimable after{" "}
                  {moment(Number(getPercentageFeeRebateInfoResponse.event_end_time)).format("YYYY-MM-DD HH:mm:ss")}
                </div>
              }
              overlayInnerStyle={{
                width: 265,
                color: "#0A1E42",
                padding: "9px 12px",
                fontSize: "12px",
                textAlign: "left",
              }}
              color="#FFFFFF"
            >
              <InfoCircleOutlined style={{ fontSize: 15, marginLeft: 5 }} />
            </Tooltip>
          </div>
          <div className={classes.statTitleBot}>
            <div>
              <div className={classes.statNum}>{curReward} CELR</div>
            </div>
            {renderBtn()}
          </div>
        </div>
        {/* <div className={classes.liquidityInfoCol}>
                    <div className={classes.statTitle}>
                        Current rebate portion
                        <Tooltip
                            placement="top"
                            title={
                                <div>
                                    For each transfer you make during the event period, you will receive X% of the liquidity fee you paid
                                    as a rebate. The higher volume you bridged, the higher rebate portion you will receive.
                                    <div style={{ fontWeight: "bold" }}>See details</div>
                                </div>
                            }
                            overlayInnerStyle={{
                                width: 265,
                                color: "#0A1E42",
                                padding: "9px 12px",
                                fontSize: "12px",
                                textAlign: "center",
                            }}
                            color="#FFFFFF"
                        >
                            <InfoCircleOutlined style={{ fontSize: 15, marginLeft: 5 }} />
                        </Tooltip>
                    </div>
                    <div className={classes.statNum}>{Number(curPortion).toFixed(2)} CELR</div>
                </div> */}
      </div>
    </div>
  );
  return (
    <div className={classes.liquidityContent}>
      {liquidityInfoPanel()}

      {switchChainModalState && (
        <SwitchChainModal
          showModal={switchChainModalState}
          claimTitle="fee rebate"
          onClose={() => {
            initData();
            setSwitchChainModalState(false);
          }}
        />
      )}

      {claimSuccessModalState && (
        <ClaimSuccessModal
          modaldes="Your request to claim the fee rebate rewards has been submitted"
          txHash={claimTxHash}
          onClose={() => {
            initData();
            setClaimSuccessModalState(false);
          }}
        />
      )}
    </div>
  );
}
