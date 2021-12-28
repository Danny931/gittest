import { useState, useContext } from "react";
import { Button, Tooltip } from "antd";
import { createUseStyles } from "react-jss";
import { InfoCircleOutlined } from "@ant-design/icons";
import { convertUSD, round, formatIntegerPart } from "celer-web-utils/lib/format";
import { Theme } from "../../theme";
import { FARMING, tooltipText, YOUR_LIQUIDITY } from "../Liquidity";
import tipIcon from "../../images/info.svg";
import farmingIcon from "../../images/farming.png";
import { LPInfo } from "../../constants/type";
import { formatPercentage, formatDecimal } from "../../helpers/format";
import { useWeb3Context } from "../../providers/Web3ContextProvider";
import arrowDownIcon from "../../images/arrowDownBlue.svg";
import arrowUpIcon from "../../images/arrowUpBlue.svg";
import morePointIcon from "../../images/morePoint.svg";
import { getTokenSymbol } from "../../redux/assetSlice";
import { ColorThemeContext } from "../../providers/ThemeProvider";

const useStyles = createUseStyles((theme: Theme) => ({
  box: {
    width: "100%",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    border: `1px solid ${theme.primaryBorder}`,
    backgroundColor: theme.secondBackground,
    borderColor: theme.primaryBorder,
    "& .ant-btn[disabled]": {
      borderColor: theme.disableButtonBg,
    },
  },
  boxson: {
    width: "100%",
    padding: "0 12px 0 12px",
    backgroundColor: theme.secondBackground,
    borderColor: theme.primaryBorder,
    "& .ant-btn[disabled]": {
      borderColor: theme.disableButtonBg,
    },
  },
  boxsonItem: {
    width: "100%",
    padding: "14px 12px 12px 12px",
    borderTop: `1px solid ${theme.primaryBorder}`,
    borderLeft: "none",
    borderRight: "none",
    backgroundColor: theme.primaryBackground,
    borderColor: theme.primaryBorder,
    "& .ant-btn[disabled]": {
      borderColor: theme.disableButtonBg,
    },
  },
  content: {
    display: "flex",
    overflow: "hidden",
    flexFlow: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
  },
  tipIconRight: {
    width: "auto",
    height: 12,
    marginLeft: 4,
  },
  tipIconLeft: {
    width: "auto",
    height: 12,
    marginRight: 4,
  },
  nameWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    fontSize: 18,
    color: theme.surfacePrimary,
    fontWeight: 600,
  },
  nameItemWrapper: {
    display: "flex",
    height: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    fontSize: 12,
    color: theme.surfacePrimary,
    fontWeight: 600,
  },
  icon: {
    width: 16,
    borderRadius: "50%",
    marginRight: 2,
  },
  itemFootIcon: {
    width: 16,
    height: 16,
  },
  productInfoItem: {
    marginTop: 4,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    fontSize: 12,
    color: theme.surfacePrimary,
  },
  fold: {
    borderTop: `1px solid ${theme.primaryBorder}`,
    display: "flex",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    fontSize: 14,
    fontWeight: 600,
    color: theme.primaryReduce,
  },
  details: {
    borderTop: `1px solid ${theme.primaryBorder}`,
    display: "flex",
    padding: 12,
    margin: "0 12px 0 12px",
    justifyContent: "center",
    alignItems: "center",
    width: "calc(100% - 24px)",
    fontSize: 14,
    fontWeight: 600,
    color: theme.primaryReduce,
  },
  productInfoText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    color: theme.surfacePrimary,
    fontWeight: 700,
  },
  farmIconLeft: {
    width: 16,
    marginRight: 6,
  },
  primaryBtn: {
    height: 44,
    borderRadius: 8,
    fontSize: 16,
    borderColor: "#3366FF",
    background: "#3366FF",
    color: theme.unityWhite,
    padding: "0 2px",
    fontWeight: 700,
    "& .ant-btn-primary": {
      color: theme.primaryBrand,
    },
  },
  disablePrimaryBtn: {
    height: 44,
    borderRadius: 8,
    fontSize: 16,
    borderColor: theme.disableButtonBg,
    background: theme.disableButtonBg,
    color: theme.secondBrand,
    padding: "0 2px",
    fontWeight: 700,
    "& .ant-btn-primary": {
      color: theme.primaryBrand,
    },
  },
  mobileTooltipOverlayStyle: {
    "& .ant-tooltip-inner": {
      width: 265,
      borderRadius: 8,
    },
    "& .ant-tooltip-arrow-content": {
      width: 9,
      height: 9,
    },
  },
  showAllChain: {
    color: theme.unityBlack,
    fontWeight: 700,
    fontSize: 12,
  },
}));
// const [buttonStyle, setbuttonStyle] = useState(String);

type LiquidityProductCellProps = {
  lpInfo: LPInfo;
  addAction: (lpInfo: LPInfo) => void;
  removeAction: (lpInfo: LPInfo) => void;
  singleLiquidity: (lpInfo: LPInfo) => void;
};

type LiquidityItemCellProps = {
  itemData: LPInfo;
  addAction: (lpInfo: LPInfo) => void;
  removeAction: (lpInfo: LPInfo) => void;
  singleLiquidity: (lpInfo: LPInfo) => void;
};

function LiquidityProductCell({ lpInfo, addAction, removeAction, singleLiquidity }: LiquidityProductCellProps) {
  const styles = useStyles();

  const [isExpandable, setIsExpandable] = useState(false);
  return (
    <div className={styles.box}>
      <div className={styles.content}>
        <div
          className={styles.productInfoItem}
          style={{
            padding: "19px 12px 13px 12px",
          }}
        >
          <div className={styles.nameWrapper}>
            <img src={lpInfo.token.icon} className={styles.icon} alt="" />
            {getTokenSymbol(lpInfo.token.token.symbol, lpInfo.chain.id)}
          </div>
          {!isExpandable ? (
            <div className={styles.productInfoText}>
              {lpInfo.chainList?.map(
                (item, index) =>
                  index < 7 && (
                    <img src={item.icon} style={{ width: 16, borderRadius: "50%", marginRight: 2 }} alt="" />
                  ),
              )}
              {lpInfo.chainList && lpInfo.chainList.length > 7 && (
                <div onClick={() => setIsExpandable(true)}>
                  <img src={morePointIcon} style={{ width: 16 }} alt="Details icon" />
                </div>
              )}
            </div>
          ) : (
            <div onClick={() => setIsExpandable(false)}>
              <img src={arrowUpIcon} className={styles.itemFootIcon} alt="Fold icon" />
            </div>
          )}
        </div>
        {!isExpandable && (
          <div style={{ padding: "0px 8px 16px 8px" }} className={styles.boxson}>
            <div className={styles.productInfoItem}>
              <div style={{ opacity: 0.8 }}>
                Your Liquidity
                <Tooltip
                  overlayClassName={styles.mobileTooltipOverlayStyle}
                  arrowPointAtCenter
                  placement="topLeft"
                  title={tooltipText[YOUR_LIQUIDITY]}
                  color="#FFFFFF"
                  overlayInnerStyle={{ color: "#0A1E42" }}
                >
                  <img src={tipIcon} className={styles.tipIconRight} alt="tooltip icon" />
                </Tooltip>
              </div>
              <div className={styles.productInfoText}>
                {Number(lpInfo.liquidity_amt) >= 0.000001
                  ? `${formatIntegerPart(round(Number(lpInfo.liquidity_amt), 6))} ${getTokenSymbol(
                      lpInfo.token?.token?.symbol,
                      lpInfo.chain.id,
                    )}`
                  : "--"}
              </div>
            </div>

            <div className={styles.productInfoItem}>
              <div style={{ opacity: 0.8 }}>Total Liquidity</div>
              <div className={styles.productInfoText}>
                {lpInfo.total_liquidity_amt && lpInfo.total_liquidity_amt !== "0"
                  ? `${formatIntegerPart(round(Number(lpInfo.total_liquidity_amt), 0))} ${getTokenSymbol(
                      lpInfo.token?.token?.symbol,
                      lpInfo.chain.id,
                    )}`
                  : ""}{" "}
              </div>
            </div>
            <div className={styles.productInfoItem}>
              <div style={{ opacity: 0.8 }}>Volume 24H</div>
              <div className={styles.productInfoText}>
                <Tooltip
                  overlayClassName={styles.mobileTooltipOverlayStyle}
                  arrowPointAtCenter
                  placement="bottomLeft"
                  title={
                    <div>
                      {`This is the transaction volume for ${lpInfo.token.token.symbol} transfers to ${lpInfo.chain.name} in the last 24 hours.`}
                    </div>
                  }
                  color="#FFFFFF"
                  overlayInnerStyle={{ color: "#0A1E42" }}
                >
                  <img src={tipIcon} className={styles.tipIconRight} alt="tooltip icon" />
                </Tooltip>
                {lpInfo.volume_24h ? convertUSD(lpInfo.volume_24h, "floor", 0) : "--"}
              </div>
            </div>
          </div>
        )}
        {isExpandable &&
          lpInfo.liquidityList?.map(item => (
            <LiquidityItemCell
              key={item.key + item.token.token.address}
              itemData={item}
              addAction={addAction}
              removeAction={removeAction}
              singleLiquidity={singleLiquidity}
            />
          ))}
        {isExpandable ? (
          <div className={styles.fold} onClick={() => setIsExpandable(!isExpandable)}>
            Fold <img src={arrowUpIcon} className={styles.itemFootIcon} alt="Fold icon" />
          </div>
        ) : (
          <div className={styles.details} onClick={() => setIsExpandable(!isExpandable)}>
            Details <img src={arrowDownIcon} className={styles.itemFootIcon} alt="Details icon" />
          </div>
        )}
      </div>
    </div>
  );
}

function LiquidityItemCell({ itemData, addAction, removeAction, singleLiquidity }: LiquidityItemCellProps) {
  const styles = useStyles();
  const { signer } = useWeb3Context();
  const { themeType } = useContext(ColorThemeContext);

  /* eslint-disable camelcase */
  const { farming_session_tokens } = itemData;
  const hasFarmingSessions = farming_session_tokens.length > 0;
  return (
    <div className={styles.boxsonItem}>
      <div className={styles.content}>
        <div className={styles.productInfoItem}>
          <div className={styles.nameItemWrapper}>
            <img src={itemData.chain.icon} className={styles.icon} alt="" />
            {itemData.chain.name}
          </div>
          <div className={styles.productInfoText}>
            {itemData.chainList?.map(item => (
              <img src={item.icon} style={{ width: 16, borderRadius: "50%", marginRight: 2 }} alt="" />
            ))}
          </div>
        </div>
        <div className={styles.productInfoItem}>
          <div style={{ opacity: 0.8 }}>
            Your Liquidity
            <Tooltip
              overlayClassName={styles.mobileTooltipOverlayStyle}
              arrowPointAtCenter
              placement="topLeft"
              title={tooltipText[YOUR_LIQUIDITY]}
              color="#FFFFFF"
              overlayInnerStyle={{ color: "#0A1E42" }}
            >
              <img src={tipIcon} className={styles.tipIconRight} alt="tooltip icon" />
            </Tooltip>
          </div>
          <div className={styles.productInfoText}>
            {itemData.liquidity
              ? `${formatDecimal(itemData.liquidity_amt, itemData?.token?.token?.decimal)} ${getTokenSymbol(
                  itemData.token.token.symbol,
                  itemData?.chain.id,
                )}`
              : "--"}
          </div>
        </div>

        <div className={styles.productInfoItem}>
          <div style={{ opacity: 0.8 }}>Total Liquidity</div>
          <div className={styles.productInfoText}>
            {itemData.total_liquidity
              ? `${formatDecimal(itemData.total_liquidity_amt, itemData?.token?.token?.decimal, 0)} ${getTokenSymbol(
                  itemData.token.token.symbol,
                  itemData?.chain.id,
                )}`
              : "--"}
          </div>
        </div>
        <div className={styles.productInfoItem}>
          <div style={{ opacity: 0.8 }}>Volume 24H</div>
          <div className={styles.productInfoText}>
            <Tooltip
              overlayClassName={styles.mobileTooltipOverlayStyle}
              arrowPointAtCenter
              placement="bottomLeft"
              title={
                <div>
                  {`This is the transaction volume for ${itemData.token.token.symbol} transfers to ${itemData.chain.name} in the last 24 hours.`}
                </div>
              }
              color="#FFFFFF"
              overlayInnerStyle={{ color: "#0A1E42" }}
            >
              <InfoCircleOutlined
                className={styles.tipIconLeft}
                style={{ color: themeType === "dark" ? "#FFFFFFCC" : "#0A0A0A" }}
              />
            </Tooltip>
            {itemData.volume_24h ? convertUSD(itemData.volume_24h, "floor", 0) : "--"}
          </div>
        </div>
        <div className={styles.productInfoItem}>
          <div style={{ opacity: 0.8 }}>APY</div>
          <div className={styles.productInfoText}>
            <Tooltip
              overlayClassName={styles.mobileTooltipOverlayStyle}
              arrowPointAtCenter
              placement="bottomRight"
              title={
                <div>
                  <div style={{ fontWeight: 700 }}>
                    LP Fee Earning APY:{" "}
                    <span style={{ fontWeight: 400 }}>{`${Number(itemData.lp_fee_earning_apy * 100).toFixed(
                      2,
                    )}%`}</span>
                  </div>
                  {hasFarmingSessions ? (
                    <div style={{ fontWeight: 700 }}>
                      Farming APY:{" "}
                      <span style={{ fontWeight: 400 }}>{`${Number(itemData.farming_apy * 100).toFixed(2)}%`}</span>
                    </div>
                  ) : null}
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <span style={{ color: "#3366FF" }}>{"\n"}Note: </span>
                    LP Fee Earning APY = (1 + last 24 hr liquidity fee/total liquidity)
                    <sup style={{ fontSize: "0.6em" }}>365</sup>-1{"\n\n"}
                    The 7-day median APY is displayed above.
                  </div>
                </div>
              }
              color="#FFFFFF"
              overlayInnerStyle={{ color: "#0A1E42" }}
            >
              <InfoCircleOutlined
                className={styles.tipIconLeft}
                style={{ color: themeType === "dark" ? "#FFFFFFCC" : "#0A0A0A" }}
              />
            </Tooltip>
            {formatPercentage(Number(itemData.lp_fee_earning_apy * 100) + Number(itemData.farming_apy * 100), true)}
          </div>
        </div>
        {hasFarmingSessions ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#00E096",
              marginTop: 16,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <img src={farmingIcon} className={styles.farmIconLeft} alt="tooltip icon" />
            Farming
            <Tooltip
              overlayClassName={styles.mobileTooltipOverlayStyle}
              arrowPointAtCenter
              placement="bottomLeft"
              title={tooltipText[FARMING](farming_session_tokens, itemData?.chain.id)}
              color="#FFFFFF"
              overlayInnerStyle={{ color: "#0A1E42" }}
            >
              <InfoCircleOutlined style={{ color: "#00E096", fontSize: 15, marginLeft: 5 }} />
            </Tooltip>
          </div>
        ) : null}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "20% 30% 50%",
            columnGap: 5,
            width: "calc(100vw - 70px)",
            marginTop: 16,
          }}
        >
          <Button
            type="primary"
            className={signer ? styles.primaryBtn : styles.disablePrimaryBtn}
            onClick={() => addAction(itemData)}
            disabled={!signer || process.env.REACT_APP_BTN_DISABLED === "true"}
          >
            Add
          </Button>
          <Button
            type="primary"
            className={itemData?.liquidity_amt !== "0" && signer ? styles.primaryBtn : styles.disablePrimaryBtn}
            onClick={() => removeAction(itemData)}
            disabled={!(itemData?.liquidity_amt !== "0" && signer) || process.env.REACT_APP_BTN_DISABLED === "true"}
          >
            Remove
          </Button>
          <Button
            type="primary"
            className={itemData?.isCanwidthdraw && signer ? styles.primaryBtn : styles.disablePrimaryBtn}
            style={{ fontSize: 12 }}
            onClick={() => singleLiquidity(itemData)}
            disabled={!(itemData?.isCanwidthdraw && signer) || process.env.REACT_APP_BTN_DISABLED === "true"}
          >
            Aggregate & Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

// function  getButtonStyle(type: String,action: (lpInfo: LPInfo) => void) {
//   const styles = useStyles();
//   switch(type){
//     case "Add":
//       if(type === "Add"){
//         setbuttonStyle(styles.primaryBtn)
//         }else{
//         setbuttonStyle(styles.disablePrimaryBtn)
//         }
//       break;

//   }
//   return <Button type="primary" className={styles.primaryBtn} onClick={() => action}>type</Button>
// }
export default LiquidityProductCell;
