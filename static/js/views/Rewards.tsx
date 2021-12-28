/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useCallback, useContext, useState } from "react";
import { Button, Spin } from "antd";
import { createUseStyles } from "react-jss";
import { useHistory } from "react-router";
import { Theme } from "../theme";
import { useWeb3Context } from "../providers/Web3ContextProvider";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { ModalName, openModal } from "../redux/modalSlice";
import FeeRebate from "../components/rewards/FeeRebate";
import rewardsDarkIcon from "../images/rewardsDark.png";
import rewardsLightIcon from "../images/rewardsLight.png";
import { ColorThemeContext } from "../providers/ThemeProvider";
import RetentionRewards from "../components/rewards/RetentionRewards";

/* eslint-disable camelcase */
/* eslint-disable no-debugger */
const useStyles = createUseStyles((theme: Theme) => ({
  liquidityContent: {
    width: "100%",
    margin: "0 auto",
    position: "relative",
    lineHeight: 1,
    marginBottom: 200,
    maxWidth: "1200px",
  },

  mobileLiquidityContent: {
    // width: "100%",
    margin: "0 auto",
    position: "relative",
    lineHeight: 1,
    marginBottom: 200,
    marginLeft: 10,
    marginRight: 10,
    maxWidth: "1200px",
  },

  connect: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: 70,
  },
  connectBtn: {
    width: 560,
    margin: "0 auto",
    height: 56,
    fontSize: 16,
    borderRadius: 16,
    background: theme.primaryBrand,
    border: 0,
    "&:focus, &:hover": {
      background: theme.primaryBrand,
      color: theme.surfacePrimary,
    },
  },
  contentEmpty: {
    width: "100%",
    height: 436,
    borderRadius: 16,
    background: theme.secondBackground,
    textAlign: "center",
    color: theme.surfacePrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    height: "30px",
    margin: "0px 0 25px 0",
  },
  emptytext: {
    fontSize: 14,
    fontWeight: 500,
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

const Rewards: FC = () => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles();
  const { web3Modal } = useWeb3Context();
  const dispatch = useAppDispatch();
  const [retentionRewardVisible, setRetentionRewardVisible] = useState(true);
  const [feeRebateVisible, setFeeRebateVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const { themeType } = useContext(ColorThemeContext);
  const noRewardIcon = themeType === "dark" ? rewardsDarkIcon : rewardsLightIcon;
  const history = useHistory();

  const onShowProviderModal = useCallback(() => {
    dispatch(openModal(ModalName.provider));
  }, [dispatch]);

  if (!web3Modal.cachedProvider) {
    history.push("/transfer");
    return (
      <div className={classes.connect}>
        <Button type="primary" onClick={onShowProviderModal} className={classes.connectBtn}>
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className={isMobile ? classes.mobileLiquidityContent : classes.liquidityContent}>
      <div className={themeType === "dark" ? classes.spinblur : classes.whiteSpinblur}>
        <Spin spinning={loading}>
          {retentionRewardVisible || feeRebateVisible ? (
            <div>
              {retentionRewardVisible && (
                <RetentionRewards
                  showRetentionRewards={visible => {
                    setRetentionRewardVisible(visible);
                  }}
                  showLoading={load => {
                    setLoading(load);
                  }}
                />
              )}
              {feeRebateVisible && (
                <FeeRebate
                  showFeeRebate={visible => {
                    setFeeRebateVisible(visible);
                  }}
                  showLoading={load => {
                    setLoading(load);
                  }}
                />
              )}
            </div>
          ) : (
            <div className={classes.contentEmpty}>
              <div>
                <img className={classes.emptyIcon} src={noRewardIcon} alt="no_rewards" />
                <div className={classes.emptytext}>No rewards yet</div>
              </div>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default Rewards;
