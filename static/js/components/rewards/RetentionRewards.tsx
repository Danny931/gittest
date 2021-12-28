import { useState, useEffect } from "react";
import { Button, Tooltip, Slider } from "antd";
import { createUseStyles } from "react-jss";
import { base64 } from "ethers/lib/utils";
import { InfoCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { BigNumber } from "@ethersproject/bignumber";
import { formatDecimal } from "celer-web-utils/lib/format";
import { Theme } from "../../theme";
import { useWeb3Context } from "../../providers/Web3ContextProvider";
import { useContractsContext } from "../../providers/ContractsContextProvider";
import { claimRetentionRewards, getRetentionRewardsInfo } from "../../redux/gateway";
import { ClaimType, GetRetentionRewardsInfoResponse } from "../../constants/type";
import SwitchChainModal from "./SwitchChainModal";
import ClaimSuccessModal from "./ClaimSuccessModal";
import { formatTimeCountDown } from "../../utils/timeFormat";
import { useAppSelector } from "../../redux/store";
import bannerRetentionRewards from "../../images/bannerRetentionRewards.png";
import learnMoreImage from "../../images/learnMoreIcon.png";

let leftInterval;
const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  liquidityContent: {
    width: "100%",
    margin: "0 auto",
    position: "relative",
    lineHeight: 1,
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
    flex: 1,
    marginLeft: 15,
    padding: "35px 24px",
    borderRadius: 16,
    background: theme.primaryBackground,
  },
  mobileLiquidityInfoCol: {
    height: 118,
    marginTop: 10,
    padding: "30px 15px 0px 15px",
    borderRadius: 16,
    background: theme.primaryBackground,
  },
  mobileTimeLiquidityInfoCol: {
    marginTop: 10,
    padding: "30px 15px 30px 15px",
    borderRadius: 16,
    background: theme.primaryBackground,
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
    marginTop: 28,
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
    color: theme.surfacePrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  silderDesc: {
    fontSize: 12,
    fontWeight: 400,
  },
  titleDescBlue: {
    color: theme.primaryBrand,
  },
  timeDes: {
    fontSize: 14,
    fontWeight: 400,
    marginTop: 10,
    color: theme.unityWhite,
  },
}));

interface RetentionRewardsProps {
  showRetentionRewards: (show: boolean) => void;
  showLoading: (show: boolean) => void;
}

export default function RetentionRewards(props: RetentionRewardsProps): JSX.Element | null {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const { showRetentionRewards, showLoading } = props;
  const classes = useStyles({ isMobile });
  const {
    contracts: { incentiveEventsReward },
  } = useContractsContext();
  const { address, chainId } = useWeb3Context();
  const [switchChainModalState, setSwitchChainModalState] = useState(false);
  const [claimSuccessModalState, setClaimSuccessModalState] = useState(false);
  const [claimRewardStatus, setClaimRewardStatus] = useState<ClaimType>();
  const [getRetentionRewardsInfoResponse, setGetRetentionRewardsInfoResponse] =
    useState<GetRetentionRewardsInfoResponse>();
  const [leftTimes, setLeftTimes] = useState<number>(0);
  const [claimTxHash, setClaimTxHash] = useState<string>("");

  const initData = () => {
    getRetentionRewards();
  };

  useEffect(() => {
    if (!address) {
      return;
    }
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, incentiveEventsReward]);

  const getRetentionRewards = () => {
    if (!address) {
      return;
    }
    showLoading(true);
    getRetentionRewardsInfo({ addr: address })
      .then(res => {
        showRetentionRewards(Number(res.event_id) > 0);
        showLoading(false);
        if (res && Number(res.event_id) > 0) {
          setGetRetentionRewardsInfoResponse(res);
        }
      })
      .catch(e => {
        showRetentionRewards(false);
        showLoading(false);
        console.log(e);
      });
  };

  const claimedRewardAmountsData = async eventID => {
    try {
      const farmTx = await incentiveEventsReward?.claimedRewardAmounts(eventID, address);
      if (BigNumber.from(farmTx).gte(BigNumber.from(getRetentionRewardsInfoResponse?.current_reward))) {
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
    const claimRetentionRewardsResponse = await claimRetentionRewards({ addr: address });
    if (claimRetentionRewardsResponse) {
      const signatures = claimRetentionRewardsResponse.signature;
      const sigs = base64.decode(signatures.sig_bytes);
      try {
        const claimTx = (
          await incentiveEventsReward.claimReward(
            address,
            claimRetentionRewardsResponse.event_id,
            claimRetentionRewardsResponse.current_reward,
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
    if (!getRetentionRewardsInfoResponse) {
      return;
    }
    startCountDown();
    if (getRetentionRewardsInfoResponse && getRetentionRewardsInfoResponse?.signature.sig_bytes) {
      claimedRewardAmountsData(getRetentionRewardsInfoResponse?.event_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRetentionRewardsInfoResponse]);

  const startCountDown = () => {
    clearInterval(leftInterval);
    if (claimRewardStatus === ClaimType.COMPLETED) {
      return;
    }

    const endTime = getRetentionRewardsInfoResponse?.event_end_time || 0;
    let leftT = (endTime - new Date().getTime()) / 1000;
    if (leftT > 0) {
      setClaimRewardStatus(ClaimType.UNLUCKED_TOO_FREQUENTLY);
    } else {
      const rewward = getRetentionRewardsInfoResponse?.current_reward || "0";
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

  if (!getRetentionRewardsInfoResponse) {
    return null;
  }

  const curReward = formatDecimal(getRetentionRewardsInfoResponse.current_reward, 2);
  const maxReward = formatDecimal(getRetentionRewardsInfoResponse.max_reward, 2);
  const transfer = getRetentionRewardsInfoResponse.max_transfer_volume * getRetentionRewardsInfoResponse.celr_usd_price;
  const sliderValue = (+Number(curReward) / Number(maxReward)) * 100;

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
      <a href="https://www.baidu.com" target="_blank" rel="noreferrer">
        {" Learn More"}
      </a>
    );
  };

  const liquidityInfoPanel = () => (
    <div>
      <div>
        <div className={classes.header}>
          <div>
            <div className={classes.title}>Retention Rewards</div>
            <div className={classes.titleDesc}>
              As a loyal cBridge user, you will receive exclusive retention rewards in CELR by completing successful
              transfers on cBridge v2. <span>{learnMore()}</span>
            </div>
          </div>
          <img className={classes.bannerImage} src={bannerRetentionRewards} alt="banner retention rewards" />
        </div>

        <div className={isMobile ? classes.mobileLiquidityInfo : classes.liquidityInfo}>
          <div
            className={isMobile ? classes.mobileTimeLiquidityInfoCol : classes.liquidityInfoCol}
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
                </span>
              </div>
            )}
          </div>
          <div className={isMobile ? classes.mobileLiquidityInfoCol : classes.liquidityInfoCol}>
            <div className={classes.statTitle}>
              Your Current Rewards
              <Tooltip
                placement="top"
                title={
                  <div>
                    During the event period, the more cross-chain transfers you make on cBridge v2, the more Retention
                    Rewards you are able to earn! You can earn up to a maximum of {maxReward} CELR in Retention Rewards
                    during the event period.
                    <br />
                    <br />
                    <span style={{ color: "#3366ff" }}>Note:</span>You will be able to claim your Retention Rewards
                    after the event has ended.
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
          <div className={isMobile ? classes.mobileLiquidityInfoCol : classes.liquidityInfoCol}>
            <div className={classes.statTitle}>
              Claim Milestone
              <Tooltip
                placement="top"
                title={
                  <div>
                    You can make progress towards your claim milestone by making cross-chain transfers in cBridge v2.
                    <br />
                    Note that only transfers completed before{" "}
                    {moment(Number(getRetentionRewardsInfoResponse.event_end_time)).format("YYYY-MM-DD HH:mm:ss")} will
                    be counted
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
            <Slider
              className={classes.silder}
              step={1}
              // onChange={v => setSliderValue(v)}
              value={sliderValue}
            />
            <div className={classes.stateDes2}>
              <div>Transfer ${Number(transfer).toFixed(2)} in cBridge v2</div>
              <div className={classes.silderDesc}>
                ${(Number(curReward) * getRetentionRewardsInfoResponse.celr_usd_price).toFixed(2)}/$
                {(Number(maxReward) * getRetentionRewardsInfoResponse.celr_usd_price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={classes.liquidityContent}>
      {liquidityInfoPanel()}

      {switchChainModalState && (
        <SwitchChainModal
          showModal={switchChainModalState}
          claimTitle="rewards"
          onClose={() => {
            initData();
            setSwitchChainModalState(false);
          }}
        />
      )}

      {claimSuccessModalState && (
        <ClaimSuccessModal
          modaldes="Your request to claim the retention rewards has been submitted"
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
