/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useState, useEffect, useRef } from "react";
import { Table, Tooltip } from "antd";
import { createUseStyles } from "react-jss";
import { FileTextOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { convertUSD } from "celer-web-utils/lib/format";
import { Theme } from "../theme";
import { useWeb3Context } from "../providers/Web3ContextProvider";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { setSelectedLP } from "../redux/lpSlice";
import AddLiquidityModal from "../components/liquidity/NewAddLiquidityModal";
import RemoveLiquidityModal from "../components/liquidity/NewRemoveLiquidityModal";
import SingleChainModal from "../components/liquidity/SingleChainModal";
import { formatDecimal, formatUSDT, formatPercentage } from "../helpers/format";
import { alpha2Hex40 } from "../helpers/alpha2Hex";
import tipIcon from "../images/info.svg";
import resultEmptyIcon from "../images/resultEmpty.svg";
import addgrayIcon from "../images/addgrayIcon.svg";
import removegrayIcon from "../images/removegrayIcon.svg";
import shapesingle from "../images/shapesingle.svg";
import shapesinglegray from "../images/shapesinglegray.svg";
import addIcon from "../images/addIcon.svg";
import removeIcon from "../images/removeIcon.svg";
import farmingIcon from "../images/farming.png";
import farmingLightIcon from "../images/farmingLight.png";
import removeDisabled from "../images/removeDisabled.svg";
import singleDisabled from "../images/singleDisabled.svg";
import addIconDisabled from "../images/addIconDisabled.svg";
import { getTokenSymbol } from "../redux/assetSlice";
import { ColorThemeContext } from "../providers/ThemeProvider";
import {
  // TOTAL_LIQUIDITY,
  // TOTAL_FEE_EARNING,
  YOUR_LIQUIDITY,
  // VOLUME_24H,
  FARMING,
  // FARMINGREWARD,
  tooltipText,
} from "./Liquidity";

const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  liquidityContent: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
  },
  pageHeader: {
    paddingLeft: 0,
    paddingTop: 0,
    "& .ant-page-header-heading-title": {
      color: theme.surfacePrimary,
      fontSize: 18,
    },
  },
  mobilePageHeader: {
    paddingBottom: 0,
    "& .ant-page-header-heading-title": {
      color: theme.surfacePrimary,
      fontSize: 15,
    },
  },
  mainTip: {
    marginBottom: 16,
    padding: "8px 16px",
    fontSize: 16,
    width: "100%",
    // height: 40,
    background: theme.unityWhite,
    // lineHeight: "40px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0px 6px 12px -6px rgba(24, 39, 75, 0.12), 0px 8px 24px -4px rgba(24, 39, 75, 0.08)",
    borderRadius: 4,
  },
  mobileMainTip: {
    marginTop: 14,
    marginRight: 16,
    marginBottom: 20,
    marginLeft: 16,
    padding: "8px 12px",
    fontSize: 16,
    lineHeight: "20px",
    background: theme.unityWhite,
    display: "flex",
    alignItems: "center",
    boxShadow: "0px 6px 12px -6px rgba(24, 39, 75, 0.12), 0px 8px 24px -4px rgba(24, 39, 75, 0.08)",
    borderRadius: 4,
  },
  mainTipImg: {
    width: 16,
    height: 16,
  },
  mainTipText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.primaryBackground,
    paddingLeft: 6,
  },
  card: {
    position: "relative",
  },
  contCover: {
    width: "100%",
    height: "100%",
    background: "rgba(34, 34, 34,0)",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 10,
  },
  contCoverTop: {
    height: 45,
    width: "100%",
  },
  mobileContCoverTop: {
    height: 145,
    width: "100%",
  },
  contCoverTopLeft: {
    height: 45,
    width: 232,
    background: "rgba(34, 34, 34,0.5)",
    float: "left",
  },
  contCoverTopRight: {
    height: 45,
    width: 359,
    background: "rgba(34, 34, 34,0.5)",
    float: "right",
  },
  mobileContCoverTopLeft: {
    height: 125,
    width: "100%",
    background: "rgba(34, 34, 34,0.5)",
    float: "left",
  },

  search: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  mobileSearch: {
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingLeft: 16,
    paddingRight: 16,
  },

  searchinput: {
    width: 350,
    height: 38,
    borderRadius: 6,
    border: `1px solid ${theme.primaryBorder}`,
    background: theme.secondBackground,
    color: theme.secondBrand,
    padding: "0px 24px 0px 30px",
    "& .ant-input": {
      background: theme.secondBackground,
      color: theme.surfacePrimary,
      fontWeight: 600,
    },
    "& .ant-input-clear-icon": {
      color: theme.secondBrand,
      "&:hover": {
        color: theme.secondBrand,
      },
    },
  },
  moblieSearchinput: {
    width: "100%",
    height: 48,
    borderRadius: 6,
    background: theme.secondBackground,
    color: theme.secondBrand,
    padding: "4px 32px",
    "& .ant-input": {
      background: theme.secondBackground,
      color: theme.unityWhite,
      fontWeight: 600,
    },
    "& .ant-input-clear-icon": {
      color: theme.secondBrand,
      "&:hover": {
        color: theme.secondBrand,
      },
    },
  },
  tableLiquidity: {
    fontSize: 14,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    overflow: "auto",
    background: theme.primaryBackground,
    width: 1200,
    borderRadius: "0px 0 12px 12px",
    borderLeft: `1px solid ${theme.primaryBorder}`,
    borderRight: `1px solid ${theme.primaryBorder}`,
    borderBottom: `1px solid ${theme.primaryBorder}`,
    "& .ant-table": {
      width: "1194px !important",
    },
    "& .ant-table table": {
      borderSpacing: "0",
    },

    "& .ant-table-column-sorters": {
      justifyContent: "left",
    },
    "& .ant-table-column-title": {
      flex: "unset",
      marginRight: 5,
    },

    "& .ant-table-tbody > tr": {
      background: `${theme.primaryBackground} !important`,
      borderWidth: 0,
      "& td:first-child": {
        borderRadius: 0,
        borderWidth: 0,
      },
      "& td:last-child": {
        borderRadius: 0,
        borderWidth: 0,
      },
    },
    "& .ant-table-thead > tr > th": {
      background: theme.primaryBackground,
      color: theme.surfacePrimary,
      borderWidth: 0,
      fontSize: 12,
      padding: "10px 0px",
    },

    "& .ant-table-tbody > tr > td": {
      border: "none !important",
      borderWidth: 0,
      color: theme.surfacePrimary,
      padding: "20px 0",
      background: `inherit !important`,
    },
  },
  rebutton: {
    position: "absolute",
    top: props => (props.isMobile ? 20 : 0),
    right: props => (props.isMobile ? 16 : 0),
    zIndex: 10,
    "&.ant-btn": {
      border: "none",
      background: "transparent",
      color: theme.secondBrand,
      opacity: 0.7,
      "&:focus, &:hover": {
        color: theme.unityWhite,
        opacity: 0.9,
      },
    },
  },
  liquidityInfo: {
    width: "100%",
    // display: "flex",
    // justifyContent: "space-between",
    // alignItems: "flex-start",
    marginBottom: 30,
  },
  liquidityInfoCol: {
    border: `2px solid ${theme.primaryBorder}`,
    padding: "35px 24px",
    borderRadius: 16,
    background: theme.secondBackground,
  },
  liquidityInfoColNoBorder: {
    border: `0px solid ${theme.primaryBorder}`,
    padding: "35px 24px",
    borderRadius: 16,
    background: theme.secondBackground,
  },
  statNum: {
    color: theme.surfacePrimary,
    fontWeight: 700,
    fontSize: 22,
  },
  statTitle: {
    color: theme.surfacePrimary,
    fontSize: 14,
    fontWeight: 500,
  },
  connect: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: 70,
  },
  mobileConnect: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: 23,
    paddingLeft: 16,
    paddingRight: 16,
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
    fontWeight: props => (props.isMobile ? 700 : ""),
  },
  claimBtn: {
    background: theme.primaryBrand,
    color: theme.unityWhite,
    border: 0,
    width: 107,
    height: 44,
    borderRadius: 6,
    fontSize: 16,
    "&:focus, &:hover": {
      background: theme.primaryBrand,
      color: theme.surfacePrimary,
    },
  },
  mobileClaimBtn: {
    background: theme.primaryBrand,
    color: theme.unityWhite,
    border: 0,
    width: 86,
    height: 44,
    borderRadius: 6,
    fontSize: 16,
    "&:focus, &:hover": {
      background: theme.primaryBrand,
      color: theme.surfacePrimary,
    },
  },
  unLockBtn: {
    background: theme.primaryBrand,
    color: theme.unityWhite,
    border: 0,
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 700,
    width: 160,
    height: 44,
    "&:focus, &:hover": {
      background: theme.primaryBrand,
      color: theme.surfacePrimary,
    },
  },

  positionSwitch: {
    height: 42,
    borderRadius: 6,
    border: `1px solid ${theme.primaryBorder}`,
    background: theme.secondBackground,
    color: theme.surfacePrimary,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
    paddingRight: 8,
    width: 232,
    fontSize: 18,
    "& .ant-switch": {
      background: theme.primaryUnable,
    },
    "& .ant-switch-checked": {
      background: theme.primaryBrand,
    },
  },
  mobilePositionSwitch: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 36,
    color: theme.surfacePrimary,
    marginTop: 12,

    fontSize: 18,
    "& .ant-switch": {
      background: theme.primaryUnable,
    },
    "& .ant-switch-checked": {
      background: theme.primaryBrand,
    },
  },
  mobileLableSwitch: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    color: theme.surfacePrimary,
    marginTop: 14,
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 14,
    fontWeight: 700,
  },

  tipIconLeft: {
    width: "auto",
    height: 16,
    marginRight: 6,
  },
  searchIconLeft: {
    width: "auto",
    height: 17,
    marginRight: 8,
  },
  farmIconLeft: {
    width: "auto",
    height: 15,
    marginRight: 4,
  },
  tipIconRight: {
    width: "auto",
    height: 15,
    marginLeft: 6,
  },
  lineBlock: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: 24,
    margin: "18px 0",
  },
  line: {
    width: 321,
    height: 1,
    background: theme.secondBrand + alpha2Hex40(),
  },
  bottomIcon: {
    height: 24,
    lineHeight: "24px",
    width: "auto",
    marginLeft: 8,
  },
  unclaimedTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.secondBrand,
    marginTop: 10,
  },
  claimBlock: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  blockLeft: {
    flex: 1,
    color: theme.surfacePrimary,
  },
  unclaimedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "cneter",
    color: theme.surfacePrimary,
    fontSize: 14,
    fontWeight: 500,
  },
  closeIcon: {
    fontSize: 20,
    color: theme.secondBrand,
    position: "absolute",
    top: 13,
    right: 17,
    cursor: "pointer",
  },
  empImg: {
    fontSize: 23,
    fontWeight: 600,
    color: theme.surfacePrimary,
  },
  empText: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.surfacePrimary,
    marginTop: 10,
  },
  tableIcon: {
    width: 16,
    borderRadius: "50%",
    marginRight: 5,
  },
  tableTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    color: theme.surfacePrimary,
    fontSize: 14,
    fontWeight: 500,
  },
  panelContent: {
    position: "absolute",
    top: 0,
    right: 0,
    border: "2px solid #40424e",
    width: "100%",
    zIndex: 9,
    padding: "35px 24px",
    borderRadius: 16,
    background: theme.secondBackground,
  },
  panelContentLiquidity: {
    position: "absolute",
    top: 0,
    right: 0,
    border: "2px solid #40424e",
    width: "100%",
    zIndex: 9,
    padding: "35px 14px 0 24px",
    borderRadius: 16,
    background: theme.secondBackground,
  },
  mobileViewRewardModal: {
    minWidth: props => (props.isMobile ? "100%" : 448),
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
        padding: "16px 16px",
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
  descs: {
    color: theme.secondBrand,
    position: "absolute",
    top: 20,
    left: 0,
    fontSize: 14,
  },
  content: {
    fontSize: 14,
    position: "relative",
    color: theme.surfacePrimary,
    textAlign: "right",
  },
  arrowDown: {
    // color: theme.secondBrand,
    background: theme.secondBrand,
    padding: 5,
    borderRadius: "50%",
  },
  actionBtn: {
    width: 37,
    "& .actImg": {
      display: "none",
    },
    "& .graImg": {
      display: "block",
    },
    "&:hover": {
      "& .actImg": {
        display: "block",
      },
      "& .graImg": {
        display: "none",
      },
    },
  },
  liquidityList: {
    marginTop: 15,
    maxHeight: 362,
    overflow: "auto",
  },
  liquidityListItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
  },
  tokenSym: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.surfacePrimary,
  },
  liquidityAmt: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.surfacePrimary,
    opacity: 0.9,
  },
  liquidityUsd: {
    fontSize: 12,
    fontWeight: 400,
    color: theme.secondBrand,
  },
  itemRight: {
    textAlign: "right",
  },
  farmingTxt: {
    display: "flex",
    alignItems: "center",
    color: theme.infoSuccess,
    fontWeight: 500,
    fontSize: 12,
    position: "absolute",
    top: 20,
    right: 0,
  },
}));

function LiquidityTable({ initData, liquidityList, searchText, order, columnKey, expands }) {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const [addModalState, setAddModalState] = useState(false);
  const [removeModalState, setRemoveModalState] = useState(false);
  const [singleChainModalState, setSingleChainModalState] = useState(false);
  const [dataList, setDataList] = useState([]);
  const { signer, address } = useWeb3Context();
  const { themeType } = useContext(ColorThemeContext);
  const dispatch = useAppDispatch();
  const ref = useRef<string>();
  ref.current = address;
  useEffect(() => {
    const img = new Image();
    img.src = addgrayIcon;
    img.src = addIcon;
    img.src = addIconDisabled;
    img.src = removegrayIcon;
    img.src = removeIcon;
    img.src = removeDisabled;
    img.src = shapesinglegray;
    img.src = shapesingle;
    img.src = singleDisabled;
  }, []);
  useEffect(() => {
    let list = liquidityList;
    if (expands.length > 0) {
      if (columnKey === "chain") {
        if (order === "ascend") {
          list = liquidityList.sort((a, b) => a.chain.name.localeCompare(b.chain.name));
        } else if (order === "descend") {
          list = liquidityList.sort((a, b) => b.chain.name.localeCompare(a.chain.name));
        }
      } else if (columnKey === "liquidity") {
        if (order === "ascend") {
          list = liquidityList.sort((a, b) => a.liquidity - b.liquidity);
        } else if (order === "descend") {
          list = liquidityList.sort((a, b) => b.liquidity - a.liquidity);
        }
      } else if (columnKey === "total_liquidity") {
        if (order === "ascend") {
          list = liquidityList.sort((a, b) => a.total_liquidity - b.total_liquidity);
        } else if (order === "descend") {
          list = liquidityList.sort((a, b) => b.total_liquidity - a.total_liquidity);
        }
      } else if (columnKey === "volume_24h") {
        if (order === "ascend") {
          list = liquidityList.sort((a, b) => a.volume_24h - b.volume_24h);
        } else if (order === "descend") {
          list = liquidityList.sort((a, b) => b.volume_24h - a.volume_24h);
        }
      } else if (columnKey === "farming_apy") {
        if (order === "ascend") {
          list = liquidityList.sort(
            (a, b) => a.lp_fee_earning_apy + a.farming_apy - (b.lp_fee_earning_apy + b.farming_apy),
          );
        } else if (order === "descend") {
          list = liquidityList.sort(
            (a, b) => b.lp_fee_earning_apy + b.farming_apy - (a.lp_fee_earning_apy + a.farming_apy),
          );
        }
      }
    }
    setDataList(list);
  }, [order, columnKey, liquidityList]);
  const addLiquidity = record => {
    setAddModalState(true);
    dispatch(setSelectedLP(record));
  };
  const removeLiquidity = record => {
    setRemoveModalState(true);
    dispatch(setSelectedLP(record));
  };

  const singleLiquidity = record => {
    setSingleChainModalState(true);
    dispatch(setSelectedLP(record));
  };

  const columns = [
    {
      title: () => <div style={{ paddingLeft: 10 }}>Token Name</div>,
      dataIndex: "token",
      key: "token",
      width: "97px",
      render: () => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div />
        </div>
      ),
      sorter: (a, b) =>
        getTokenSymbol(a.token.token.symbol, a.chain.id).localeCompare(
          getTokenSymbol(b.token.token.symbol, b.chain.id),
        ),
    },
    {
      title: () => "Chain Name",
      dataIndex: "chain",
      key: "chain",
      width: "185px",
      render: chain => {
        return (
          <div style={{ position: "relative", display: "flex", flexFlow: "column", alignItems: "flex-start" }}>
            <div className={classes.tableTitle}>
              <img src={chain.icon} className={classes.tableIcon} alt="" />
              {chain.name}
            </div>
          </div>
        );
      },
      sorter: (a, b) => a.chain.name.localeCompare(b.chain.name),
    },

    {
      title: () => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
            color: "#FFFFFFCC",
            marginLeft: 66,
          }}
        >
          <Tooltip
            placement="top"
            title={tooltipText[YOUR_LIQUIDITY]}
            color="#FFFFFF"
            overlayInnerStyle={{ color: "#0A1E42", width: 290 }}
          >
            <img src={tipIcon} className={classes.tipIconLeft} alt="tooltip icon" />
          </Tooltip>
          Your Liquidity
        </div>
      ),
      dataIndex: "liquidity",
      key: "liquidity",
      width: "185px",
      render: (text, record) => {
        const { liquidity, liquidity_amt, token, chain } = record;
        const tooltipText2 = liquidity > 0.000001 ? <div>{formatUSDT(liquidity.toFixed(0))}</div> : "--";
        return liquidity ? (
          <div className={classes.content}>
            <Tooltip placement="topRight" title={tooltipText2} color="#FFFFFF" overlayInnerStyle={{ color: "#0A1E42" }}>
              <div>
                {liquidity_amt >= 0.000001
                  ? `${formatDecimal(liquidity_amt, token?.token?.decimal)} ${getTokenSymbol(
                      token?.token?.symbol,
                      chain.id,
                    )}`
                  : "--"}
              </div>
            </Tooltip>
          </div>
        ) : (
          <div className={classes.content}>--</div>
        );
      },
      sorter: (a, b) => a.liquidity - b.liquidity,
    },
    {
      title: () => (
        <div style={{ display: "flex", alignItems: "right", marginLeft: 87, color: "#FFFFFFCC" }}>Total Liquidity</div>
      ),
      key: "total_liquidity",
      dataIndex: "total_liquidity",
      width: "185px",
      render: (text, record) => {
        const { total_liquidity, total_liquidity_amt, token, chain } = record;
        const tooltipText2 = <div>{formatUSDT(total_liquidity.toFixed(0))}</div>;
        return total_liquidity ? (
          <div style={{ textAlign: "right" }}>
            <Tooltip placement="topRight" title={tooltipText2} color="#FFFFFF" overlayInnerStyle={{ color: "#0A1E42" }}>
              <div className={classes.content}>
                {total_liquidity_amt && total_liquidity_amt !== "0"
                  ? `${formatDecimal(total_liquidity_amt, token?.token?.decimal, 0)} ${getTokenSymbol(
                      token?.token?.symbol,
                      chain.id,
                    )}`
                  : ""}
              </div>
            </Tooltip>
          </div>
        ) : (
          <div className={classes.content}>--</div>
        );
      },
      sorter: (a, b) => a.total_liquidity - b.total_liquidity,
    },
    {
      title: () => <div style={{ textAlign: "right", width: 135 }}>Volume 24H</div>,
      key: "volume_24h",
      dataIndex: "volume_24h",
      width: "158px",
      render: (text, record) => {
        const { chain, token } = record;
        const tooltipText2 = (
          <div>
            {`This is the transaction volume for ${getTokenSymbol(token?.token?.symbol, chain.id)} transfers to ${
              chain.name
            } in the last 24 hours.`}
          </div>
        );
        return text ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "right" }}>
            <span className={classes.content}>{convertUSD(text, "floor", 0)}</span>
            <Tooltip placement="bottom" title={tooltipText2} color="#FFFFFF" overlayInnerStyle={{ color: "#0A1E42" }}>
              <InfoCircleOutlined
                style={{ color: themeType === "dark" ? "#FFFFFFCC" : "#0A0A0A", fontSize: 13, marginLeft: 5 }}
              />
            </Tooltip>
          </div>
        ) : (
          <div className={classes.content}>--</div>
        );
      },
      sorter: (a, b) => a.volume_24h - b.volume_24h,
    },
    {
      title: () => <div style={{ textAlign: "right", width: 141 }}>APY</div>,
      key: "farming_apy",
      dataIndex: "farming_apy",
      width: "160px",
      render: (text, record) => {
        const { lp_fee_earning_apy, farming_apy, farming_session_tokens, chain } = record;
        const hasFarmingSessions = farming_session_tokens.length > 0;
        const tooltipText2 = (
          <div>
            <div style={{ fontWeight: 400 }}>This the LP Fee Earning APY generated from cBridge fees.</div>
            <div style={{ whiteSpace: "pre-wrap" }}>
              <span style={{ color: "#3366FF" }}>{"\n"}Note: </span>
              LP Fee Earning APY = (1 + last 24 hr liquidity fee/total liquidity)
              <sup style={{ fontSize: "0.6em" }}>365</sup>-1
              <div>The 7-day median APY is displayed above.</div>
            </div>
          </div>
        );
        return (
          <div style={{ position: "relative", display: "flex", flexFlow: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className={classes.content}>{formatPercentage(Number(lp_fee_earning_apy * 100), true)}</span>
              <Tooltip
                placement="bottom"
                title={tooltipText2}
                color="#FFFFFF"
                overlayInnerStyle={{ color: "#0A1E42", width: 260 }}
              >
                <InfoCircleOutlined
                  style={{ color: themeType === "dark" ? "#FFFFFFCC" : "#0A0A0A", fontSize: 13, marginLeft: 5 }}
                />
              </Tooltip>
            </div>

            {hasFarmingSessions && (
              <div className={classes.farmingTxt}>
                <img
                  src={themeType === "dark" ? farmingIcon : farmingLightIcon}
                  className={classes.farmIconLeft}
                  alt="tooltip icon"
                />
                {formatPercentage(Number(farming_apy * 100), true)}
                <Tooltip
                  placement="bottom"
                  title={tooltipText[FARMING](farming_session_tokens, chain)}
                  color="#FFFFFF"
                  overlayInnerStyle={{ width: 265, color: "#0A1E42" }}
                >
                  <InfoCircleOutlined
                    style={{ color: themeType === "dark" ? "#00E096" : "#00B42A", fontSize: 13, marginLeft: 5 }}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        );
      },
      sorter: (a, b) => a.lp_fee_earning_apy + a.farming_apy - (b.lp_fee_earning_apy + b.farming_apy),
    },
    {
      title: "",
      key: "action",
      dataIndex: "action",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "right", paddingRight: 12 }}>
          <Tooltip placement="bottom" title="Add Liquidity" color="#FFFFFF" overlayInnerStyle={{ color: "#0A1E42" }}>
            <div className={classes.actionBtn}>
              {signer ? (
                <div
                  onClick={() => {
                    addLiquidity(record);
                  }}
                >
                  <div className="graImg">
                    <img src={addgrayIcon} alt="" height="36px" />
                  </div>
                  <div className="actImg">
                    <img src={addIcon} alt="" height="36px" />
                  </div>
                </div>
              ) : (
                <div>
                  <img src={addIconDisabled} alt="" height="36px" />
                </div>
              )}
            </div>
          </Tooltip>
          <Tooltip placement="bottom" title="Remove Liquidity" color="#FFFFFF" overlayInnerStyle={{ color: "#0A1E42" }}>
            <div className={classes.actionBtn} style={{ marginLeft: 28 }}>
              {record?.liquidity_amt !== "0" && signer ? (
                <div
                  onClick={() => {
                    removeLiquidity(record);
                  }}
                >
                  <div className="graImg">
                    <img src={removegrayIcon} alt="" height="36px" />
                  </div>
                  <div className="actImg">
                    <img src={removeIcon} alt="" height="36px" />
                  </div>
                </div>
              ) : (
                <div>
                  <img src={removeDisabled} alt="" height="36px" />
                </div>
              )}
            </div>
          </Tooltip>
          <Tooltip
            placement="bottomRight"
            title={`Aggregate your liquidity from multiple chains to ${record?.chain.name} and remove the aggregate liquidity with a single operation. An additional fee may apply.`}
            color="#FFFFFF"
            overlayInnerStyle={{ color: "#0A1E42" }}
          >
            <div className={classes.actionBtn} style={{ marginLeft: 28 }}>
              {record?.isCanwidthdraw && signer ? (
                <div
                  onClick={() => {
                    singleLiquidity(record);
                  }}
                >
                  <div className="graImg">
                    <img src={shapesinglegray} alt="" height="36px" />
                  </div>
                  <div className="actImg">
                    <img src={shapesingle} alt="" height="36px" />
                  </div>
                </div>
              ) : (
                <div>
                  <img src={singleDisabled} alt="" height="36px" />
                </div>
              )}
            </div>
          </Tooltip>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className={classes.card}>
        <div>
          <div className={classes.tableLiquidity}>
            <div>
              <Table
                columns={columns}
                dataSource={dataList}
                showHeader={false}
                pagination={false}
                // scroll={{ y: 500 }}
                locale={{
                  emptyText: (
                    <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {searchText ? (
                        <div>
                          <img src={resultEmptyIcon} className={classes.empImg} alt="No Data" />
                          <div className={classes.empText}>No results for {`"${searchText}"`}</div>
                        </div>
                      ) : (
                        <div>
                          <FileTextOutlined className={classes.empImg} />
                          <div className={classes.empText}>No Data! </div>
                        </div>
                      )}
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {addModalState && (
        <AddLiquidityModal
          showModal={addModalState}
          onClose={() => {
            initData();
            setAddModalState(false);
          }}
        />
      )}
      {removeModalState && (
        <RemoveLiquidityModal
          showModal={removeModalState}
          onClose={() => {
            initData();
            setRemoveModalState(false);
          }}
        />
      )}
      {singleChainModalState && (
        <SingleChainModal
          showModal={singleChainModalState}
          onClose={() => {
            initData();
            setSingleChainModalState(false);
          }}
        />
      )}
    </div>
  );
}

export default LiquidityTable;
