import { Button, Tooltip } from "antd";
import { createUseStyles } from "react-jss";
import { useAppSelector } from "../../redux/store";
import { Theme } from "../../theme";
import { tooltipText, TOTAL_LIQUIDITY, FARMINGREWARD, TOTAL_FEE_EARNING } from "../Liquidity";
import tipIcon from "../../images/info.svg";
import { formatUSD } from "../../helpers/format";
import { PRE_UPGRADE_LINK } from "../../constants";

const useStyles = createUseStyles((theme: Theme) => ({
  box: {
    marginBottom: 2,
    width: "100%",
    padding: "20px 16px 12px 16px",
  },
  totalLiquidityPanel: {
    flex: 1,
  },
  panelItem: {
    marginTop: 4,
    display: "flex",
    paddingLeft: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: theme.primaryBackground,
    minHeight: 98,
    position: "relative",
  },
  tipIconLeft: {
    width: 16,
    marginLeft: 4,
  },
  verticalText: {
    display: "flex",
    flexFlow: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  itemTitle: {
    color: theme.surfacePrimary,
    fontSize: 14,
    fontWeight: 600,
  },
  itemSubtitle: {
    color: theme.surfacePrimary,
    fontSize: 22,
    fontWeight: 700,
  },
  statPreUpgrade: {
    color: theme.primaryReduce,
    fontSize: 12,
    marginTop: 6,
  },
  rewardsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingRight: 24,
  },
  claimBtn: {
    background: theme.primaryBrand,
    color: theme.unityWhite,
    border: 0,
    borderRadius: 6,
    fontSize: 12,
    width: 96,
    height: 44,
    fontWeight: 700,
  },
  tooltipOverlay: {
    "& .ant-tooltip-inner": {
      width: "calc(100vw - 100px)",
      borderRadius: 8,
    },
    "& .ant-tooltip-arrow-content": {
      width: 9,
      height: 9,
    },
  },
}));

type InfoPanelProps = {
  content: JSX.Element;
};

function PanelItem({ content }: InfoPanelProps) {
  const styles = useStyles();
  return <div className={styles.panelItem}>{content}</div>;
}

type LiquidityInfoPanelProps = {
  totalLiquidity: number;
  totalFeeEarning: number;
  totalFarmingRewards: number | undefined;
  claimAction: () => void;
  liquidityAction: () => void;
  showLiquidityBtn: boolean;
};

function LiquidityInfoPanel({
  totalLiquidity,
  totalFeeEarning,
  totalFarmingRewards,
  claimAction,
  liquidityAction,
  showLiquidityBtn,
}: LiquidityInfoPanelProps) {
  const styles = useStyles();
  const { isLPNotEmpty } = useAppSelector(state => state.globalInfo);
  return (
    <div className={styles.box}>
      <PanelItem
        content={
          <div className={styles.totalLiquidityPanel}>
            <div className={styles.rewardsBox}>
              <div className={styles.verticalText}>
                <Tooltip
                  overlayClassName={styles.tooltipOverlay}
                  placement="bottom"
                  title={tooltipText[TOTAL_LIQUIDITY]}
                  color="#FFFFFF"
                  overlayInnerStyle={{ color: "#0A1E42" }}
                >
                  <div className={styles.itemTitle}>
                    Your Total Liquidity
                    <img src={tipIcon} className={styles.tipIconLeft} alt="tooltip icon" />
                  </div>
                </Tooltip>
                <span className={styles.itemSubtitle}>{formatUSD(totalLiquidity.toFixed(2))}</span>
              </div>
              {showLiquidityBtn && (
                <Button className={styles.claimBtn} size="large" type="primary" onClick={liquidityAction}>
                  Details
                </Button>
              )}
            </div>
            {isLPNotEmpty ? (
              <div className={styles.statPreUpgrade}>
                <a href={PRE_UPGRADE_LINK} target="_blank" rel="noreferrer">
                  Migrate Liquidity from Pre-upgrade Pools→
                </a>
              </div>
            ) : null}
          </div>
        }
      />
      <PanelItem
        content={
          <div className={styles.verticalText}>
            <Tooltip
              overlayClassName={styles.tooltipOverlay}
              placement="bottom"
              title={tooltipText[TOTAL_FEE_EARNING]}
              color="#FFFFFF"
              overlayInnerStyle={{ color: "#0A1E42", width: 200 }}
            >
              <div className={styles.itemTitle}>
                Your Liquidity Fee Earning
                <img src={tipIcon} className={styles.tipIconLeft} alt="tooltip icon" />
              </div>
            </Tooltip>
            <span className={styles.itemSubtitle}>{formatUSD(totalFeeEarning.toFixed(2))}</span>
          </div>
        }
      />
      <PanelItem
        content={
          <div className={styles.rewardsBox}>
            <div className={styles.verticalText}>
              <Tooltip
                overlayClassName={styles.tooltipOverlay}
                placement="bottom"
                title={tooltipText[FARMINGREWARD]}
                color="#FFFFFF"
                overlayInnerStyle={{ color: "#0A1E42" }}
              >
                <div className={styles.itemTitle} style={{ fontSize: 10 }}>
                  Your Total Farming Rewards
                  <img src={tipIcon} className={styles.tipIconLeft} alt="tooltip icon" />
                </div>
              </Tooltip>
              <span className={styles.itemSubtitle}>{formatUSD(totalFarmingRewards?.toFixed(2) ?? 0)}</span>
            </div>
            <Button
              className={styles.claimBtn}
              size="large"
              type="primary"
              onClick={claimAction}
              disabled={totalFarmingRewards === undefined || totalFarmingRewards <= 0}
            >
              View
            </Button>
          </div>
        }
      />
    </div>
  );
}

export default LiquidityInfoPanel;
