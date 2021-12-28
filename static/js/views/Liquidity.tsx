/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, FC, useCallback, useState, useEffect, useRef } from "react";
import { Button, PageHeader, Table, Space, Input, Switch, Tooltip, Spin, message, Modal, Row, Col } from "antd";
import { createUseStyles } from "react-jss";
import { useToggle } from "react-use";
import { BigNumber } from "ethers";
import { base64, formatUnits } from "ethers/lib/utils";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  ReloadOutlined,
  CloseOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { round, convertUSD } from "celer-web-utils/lib/format";
import { FarmingRewards__factory } from "../typechain/factories/FarmingRewards__factory";
import { useReadOnlyCustomContractLoader } from "../hooks";
import { Theme } from "../theme";
import { useWeb3Context } from "../providers/Web3ContextProvider";
import { useContractsContext } from "../providers/ContractsContextProvider";
import { useConfigContext } from "../providers/ConfigContextProvider";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { setLPList, setSelectedLP } from "../redux/lpSlice";
import { getLPInfoList, unlockFarmingReward, getFarmingRewardDetails, rewardingData } from "../redux/gateway";
import { closeModal, ModalName, openModal } from "../redux/modalSlice";
import { setlpCBridgeAddresses } from "../redux/globalInfoSlice";
import ProviderModal from "../components/ProviderModal";
import AddLiquidityModal from "../components/liquidity/NewAddLiquidityModal";
import RemoveLiquidityModal from "../components/liquidity/NewRemoveLiquidityModal";
import LockLiquidityModal from "../components/liquidity/LockLiquidityModal";
import ClaimLiquidityModal from "../components/liquidity/claimLiquidityModal";
import SingleChainModal from "../components/liquidity/SingleChainModal";
import LiquidityTableOrder from "./liquidityInfo/LiquidityTableOrder";
import { formatDecimal, formatUSDT, formatBalance, formatMula } from "../helpers/format";
import { alpha2Hex40 } from "../helpers/alpha2Hex";
import { LPList, Reward, UnlockRewardType, ClaimType, TokenInfo, LPInfo } from "../constants/type";

import tipIcon from "../images/info.svg";
import searchIcon from "../images/search.svg";
import resultEmptyIcon from "../images/resultEmpty.svg";
import addgrayIcon from "../images/addgrayIcon.svg";
import removegrayIcon from "../images/removegrayIcon.svg";
import shapesingle from "../images/shapesingle.svg";
import shapesinglegray from "../images/shapesinglegray.svg";
import addIcon from "../images/addIcon.svg";
import removeIcon from "../images/removeIcon.svg";
import removeDisabled from "../images/removeDisabled.svg";
import singleDisabled from "../images/singleDisabled.svg";
import addIconDisabled from "../images/addIconDisabled.svg";
import actionArrowUpIcon from "../images/actionArrowUp.svg";
import actionArrowDownIcon from "../images/actionArrowDown.svg";

import { ColorThemeContext } from "../providers/ThemeProvider";
import { setRefreshHistory } from "../redux/transferSlice";
import LiquidityProductList from "./liquidityInfo/LiquidityProductList";
import LiquidityInfoPanelForMobile from "./liquidityInfo/LiquidityInfoPanel";
import { getNetworkById, NETWORKS } from "../constants/network";
import { PRE_UPGRADE_LINK } from "../constants";
import { getTokenSymbol } from "../redux/assetSlice";
import LiquidityTable from "./LiquidityTable";
import morePointIcon from "../images/morePoint.svg";
import arrowAcendyIcon from "../images/arrowAcend.svg";
import arrowDescendIcon from "../images/arrowDescend.svg";
import arrowAcendyLightIcon from "../images/arrowAcendLight.svg";
import arrowDescendLightIcon from "../images/arrowDescendLight.svg";
/* eslint-disable camelcase */
/* eslint-disable no-debugger */
/* eslint-disable no-else-return */

export const TOTAL_LIQUIDITY = "total_liquidity";
export const TOTAL_FEE_EARNING = "your_fee_earning";
export const YOUR_LIQUIDITY = "your_liquidity";
export const VOLUME_24H = "volume_24h";
export const FARMING = "farming";
export const FARMINGREWARD = "farmingReward";

export const tooltipText = {
  [TOTAL_LIQUIDITY]: (
    <div style={{ textAlign: "left", margin: "10px 0" }}>
      <div>This is your current liquidity in cBridge v2.</div>
      <br />
      <div>
        <span style={{ color: "#3366ff" }}>Note:</span> Your total liquidity may fluctuate due to the inherent slippage
        when users make transfers across chains with imbalanced liquidity.
      </div>
      <br />
      <div>
        <span style={{ color: "#3366ff" }}>Note:</span> Your supplied liquidity may be distributed to different chains
        when users send cross-chain transfers with your liquidity.
      </div>
    </div>
  ),
  [YOUR_LIQUIDITY]: (
    <div style={{ textAlign: "left", margin: "10px 0" }}>
      <div>This is your current liquidity in cBridge v2.</div>
      <br />
      <div>
        <span style={{ color: "#3366ff" }}>Note:</span> Your liquidity may fluctuate due to the inherent spillage when
        users make transfers across chains with imbalanced liquidity.
      </div>
      <br />
      <div>
        <span style={{ color: "#3366ff" }}>Note:</span> Your supplied liquidity may be distributed to different chains
        when users send cross-chain transfers with your liquidity.
      </div>
    </div>
  ),

  [FARMING]: (tokenInfos: TokenInfo[], chain) => {
    const tokensWithIcon = (
      <div style={{ display: "flex", flexWrap: "wrap", paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Farming Rewards: </div>
        {tokenInfos.map((tokenInfo, index) => {
          const isLast = index === tokenInfos.length - 1;
          return (
            <div
              key={tokenInfo.token.address}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 2 }}
            >
              <img
                src={tokenInfo.icon}
                style={{ width: 16, borderRadius: "50%", marginLeft: 2, marginRight: 2 }}
                alt=""
              />
              <span style={{ marginTop: 2 }}>
                {isLast ? (
                  getTokenSymbol(tokenInfo.token?.symbol, chain.id) ?? ""
                ) : (
                  <span>
                    {`${getTokenSymbol(tokenInfo.token?.symbol, chain.id) ?? ""}`}{" "}
                    <span style={{ marginLeft: 2 }}>+</span>{" "}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
    return (
      <div>
        <div>
          This is the farming APY for this pool. Your liquidity in this pool will automatically enroll in this farming
          session and yield farming rewards.{" "}
          <a
            href="https://cbridge-docs.celer.network/reference/faq#liquidity-mining"
            target="_blank"
            rel="noreferrer"
            style={{ fontWeight: 600 }}
          >
            Learn More
          </a>
        </div>
        {tokenInfos.length > 0 && <div>{tokensWithIcon}</div>}
      </div>
    );
  },
  [FARMINGREWARD]: (
    <div style={{ textAlign: "left", margin: "10px 0" }}>
      <div>
        This is your total cumulative farming rewards so far, including both currently locked/claimable rewards and
        historically claimed rewards. Farming rewards need to be claimed on{" "}
        {getNetworkById(Number(process.env.REACT_APP_CLAIM_ID)).name}
      </div>
    </div>
  ),
  [TOTAL_FEE_EARNING]:
    "You can earn fees for providing liquidity in cBridge v2. Your earned fees have been automatically added to your total liquidity.",
};

const getLiquidityTitleTokenName = symbol => {
  if (symbol === "WETH") {
    return "ETH";
  }
  return symbol;
};

const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  liquidityContent: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
  },
  pageHeaderBlock: {
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
  headerTip: {
    marginTop: 20,
    marginBottom: 28,
    padding: "8px 17px",
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
  mobileHeaderTip: {
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
    borderRadius: 8,
  },
  headerTipImg: props =>
    props.isMobile
      ? {
          width: 18,
          height: 18,
        }
      : {
          width: 30,
          height: 30,
        },
  headerTipText: props =>
    props.isMobile
      ? {
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: "600",
          color: theme.unityBlack,
          paddingLeft: 11,
        }
      : {
          fontSize: 16,
          lineHeight: "19px",
          fontWeight: "bold",
          color: theme.unityBlack,
          paddingLeft: 13,
        },
  tipLink: {
    color: "#3366FF",
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
    boxShadow: "0px 6px 12px -6px rgba(24, 39, 75, 0.12)",
    borderRadius: 4,
  },
  mainTipImg: {
    width: 16,
    height: 16,
  },
  mainTipText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.unityBlack,
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
    height: 60,
    width: "100%",
  },
  contCoverTopLeft: {
    height: 42,
    width: 232,
    background: theme.secondBackground,
    opacity: 0.5,
    borderRadius: 4,
    float: "left",
  },
  contCoverTopRight: {
    height: 38,
    width: 350,
    background: theme.secondBackground,
    opacity: 0.5,
    borderRadius: 4,
    float: "right",
    marginTop: 2,
  },
  mobileContCoverTopLeft: {
    height: 125,
    width: 230,
    float: "left",
  },

  search: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    "& .ant-input::-webkit-input-placeholder": {
      color: "#8F9BB3 !important",
    },
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
    transition: "none !important",
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
    borderCollapse: "collapse",
    width: "100%",
    height: 48,
    borderRadius: 6,
    border: `1px solid ${theme.primaryBorder}`,
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
  table: {
    fontSize: 14,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    borderCollapse: "separate",
    overflow: "auto",
    background: "transparent !important",
    "& .ant-table": {
      width: 1200,
      background: "transparent !important",
      transition: "none !important",
    },
    "& .ant-table table": {
      borderSpacing: "0 4px",
    },
    "& .ant-table-column-sorters": {
      justifyContent: "left",
      border: "#ffffffff",
      borderBlockWidth: 0,
      "& ::before": {
        backgroundColor: "transparent",
      },
    },
    "& .ant-table-thead th.ant-table-column-has-sorters:hover": {
      background: `${theme.secondBackground} !important`,
    },
    "& .ant-table-column-title": {
      flex: "unset",
      marginRight: 5,
    },
    "& .ant-table-thead > tr": {
      transition: "none !important",
      "& th:first-child": {
        borderRadius: "12px 0 0 12px !important",
        borderLeft: `1px solid ${theme.primaryBorder}`,
      },
      "& th:last-child": {
        borderRadius: "0 12px 12px 0 !important",
        borderRight: `1px solid ${theme.primaryBorder}`,
      },
    },
    "& .ant-table-thead > tr > th": {
      background: theme.secondBackground,
      transition: "none !important",
      border: `1px solid ${theme.primaryBorder}`,
      color: theme.surfacePrimary,
      fontSize: 12,
      borderRight: "none",
      borderLeft: "none",
      padding: "10px 0px",
    },
    "& .ant-table-tbody > tr": {
      background: theme.secondBackground,
      transition: "none !important",
      "& td:first-child": {
        borderRadius: "12px 0 0 12px",
        borderLeft: `1px solid ${theme.primaryBorder}`,
      },
      "& td:last-child": {
        borderRadius: 12,
        borderRight: `1px solid ${theme.primaryBorder}`,
      },
    },
    "& .ant-table-tbody > tr > td": {
      border: `1px solid ${theme.primaryBorder}`,
      borderRight: "none",
      borderLeft: "none",
      color: theme.secondBackground,
      height: 76,
      background: `inherit !important`,
      transition: "none !important",
    },
    "& .table-cell-color-open": {
      "& td": {
        borderBottom: "none !important",
      },
      "& td:first-child": {
        borderRadius: "12px 0 0 0px !important",
        borderLeft: `1px solid ${theme.primaryBorder}`,
      },
      "& td:last-child": {
        borderRadius: "0 12px 0px 0 !important",
        borderRight: `1px solid ${theme.primaryBorder}`,
      },
    },
    "& .table-cell-color-close": {
      "& td": {
        borderBottom: "none !important",
      },
      "& td:first-child": {
        borderRadius: "12px 0 0px 12px !important",
        borderLeft: `1px solid ${theme.primaryBorder}`,
      },
      "& td:last-child": {
        borderRadius: "0 12px 12px 0 !important",
        borderRight: `1px solid ${theme.primaryBorder}`,
      },
    },
    "& .ant-table-tbody ": {
      "& .ant-table-expanded-row > td": {
        border: "none",
        borderLeft: "none !important",
        borderRight: "none !important",
        top: "-4px",
      },
    },
    "& .ant-table-cell": {
      padding: 0,
    },
  },
  rebutton: {
    position: "absolute",
    top: props => (props.isMobile ? 20 : 0),
    right: props => (props.isMobile ? 16 : 0),
    zIndex: 10,
    "&.ant-btn": {
      boxShadow: "none",
      border: "none",
      background: "transparent",
      color: theme.secondBrand,
      opacity: 0.7,
      "&:focus, &:hover": {
        border: "none",
        color: theme.surfacePrimary,
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
  statPreUpgrade: {
    position: "absolute",
    bottom: 16,
    color: theme.primaryReduce,
    fontSize: 12,
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
      color: theme.unityWhite,
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
      color: theme.unityWhite,
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
      color: theme.unityWhite,
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
      color: theme.unityWhite,
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
  mobileShowMyPosition: {
    width: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    border: `1px solid ${theme.primaryBorder}`,
    background: theme.secondBackground,
    color: theme.secondBrand,
    padding: 8,
    "& .ant-switch-checked .ant-switch-handle": { left: "calc(100% - 13px)" },
  },
  mobileSort: {
    width: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    minHeight: 36,
    marginLeft: 8,
    border: `1px solid ${theme.primaryBorder}`,
    background: theme.secondBackground,
    color: theme.secondBrand,
  },
  mobileLableSwitch: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    color: theme.surfacePrimary,
    marginTop: 18,
    fontSize: 12,
    fontWeight: 600,
  },
  mobileSwitch: {
    marginLeft: 4,
    width: 32,
    height: 16,
    minWidth: 32,
    "& .ant-switch-handle": { width: 13, height: 13 },
  },
  switch: {
    width: "44px !important",
    height: 24,
    "& .ant-switch-handle": { width: 20, height: 20 },
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
    marginTop: 16,
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
    width: 20,
    borderRadius: "50%",
    marginRight: 5,
  },
  chainIcon: {
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
    border: `2px solid ${theme.selectChainBorder}`,
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
    border: `2px solid ${theme.selectChainBorder}`,
    width: "100%",
    zIndex: 9,
    padding: "35px 14px 0 24px",
    borderRadius: 16,
    background: theme.secondBackground,
  },
  mobileViewRewardModal: {
    minWidth: props => (props.isMobile ? "100%" : 448),
    background: theme.secondBackground,
    border: `1px solid ${theme.selectChainBorder}`,
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
  actionIcon: {
    width: 24,
    height: 24,
  },
  farmingTxt: {
    display: "flex",
    alignItems: "center",
    color: theme.infoSuccess,
    fontWeight: 700,
    fontSize: 10,
    position: "absolute",
    top: 20,
    right: 0,
  },
  tabelTitle: {
    color: theme.surfacePrimary,
  },
  showPos: {
    color: theme.surfacePrimary,
    liquidityList: {
      marginTop: 15,
      maxHeight: 362,
      overflow: "auto",
    },
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

  mobileChainTooltipOverlayStyle: {
    fontSize: 12,
    fontWeight: 700,
    "& .ant-tooltip-inner": {
      width: 240,
      borderRadius: 8,
    },
    "& .ant-tooltip-arrow-content": {
      width: 9,
      height: 9,
    },
  },
}));

type YourLiquidityPreview = {
  tokenSysmbol: string;
  tokenIcon: string;
  lqAmount: string;
  usdAmount: string;
  tokenDecimal: number;
  chainId: number;
};

const Liquidity: FC = () => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const {
    contracts: { farmingRewards },
  } = useContractsContext();
  const { transferInfo, globalInfo } = useAppSelector(state => state);
  const { refreshHistory, refreshTransferAndLiquidity } = transferInfo;
  const { isLPNotEmpty, farmingRewardAddresses } = globalInfo;
  const location = useLocation();
  const segments = location.pathname.split("/").filter(p => p);
  const [addModalState, setAddModalState] = useState(false);
  const [removeModalState, setRemoveModalState] = useState(false);
  const [singleChainModalState, setSingleChainModalState] = useState(false);
  const [lockModalState, setLockModalState] = useState(false);
  const [claimModalState, setClaimModalState] = useState(false);
  const [showUnlockList, setShowUnlockList] = useState(false);
  const [showYourTotalLiquidityList, setShowYourTotalLiquidityList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [expandedLPInfos, setExpandedLPInfos] = useState<Array<LPInfo>>([]);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [showLiquidityTableOrder, setShowLiquidityTableOrder] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortColumnKey, setSortColumnKey] = useState("");
  const [sortColumnKeyName, setSortColumnKeyName] = useState("");
  const { themeType } = useContext(ColorThemeContext);
  const sortAcendyUrl = themeType === "dark" ? arrowAcendyIcon : arrowAcendyLightIcon;
  const sortDescendUrl = themeType === "dark" ? arrowDescendIcon : arrowDescendLightIcon;
  const columns = [
    {
      title: () => <div style={{ marginLeft: 23 }}>Token</div>,
      dataIndex: "token",
      key: "token",
      width: "100px",
      render: (token, record) => (
        <div style={{ display: "flex", alignItems: "left", justifyContent: "space-between", marginLeft: 23 }}>
          <div className={classes.tableTitle}>
            <img src={token.icon} className={classes.tableIcon} alt="" />
            {getLiquidityTitleTokenName(record.token.token.symbol)}
          </div>
        </div>
      ),
      sorter: (a, b) =>
        getTokenSymbol(a.token.token.symbol, a.chain.id).localeCompare(
          getTokenSymbol(b.token.token.symbol, b.chain.id),
        ),
    },
    {
      title: () => "Chain",
      dataIndex: "chain",
      key: "chain",
      width: "185px",
      render: (e, record) => {
        const { chainList, token } = record;
        return (
          <div style={{ position: "relative", display: "flex", flexFlow: "column", alignItems: "flex-start" }}>
            <div>
              {chainList?.map(
                (item, index) => index < 15 && <img src={item.icon} className={classes.chainIcon} alt="" />,
              )}
              {chainList?.length > 15 && (
                <Tooltip
                  overlayClassName={classes.mobileChainTooltipOverlayStyle}
                  placement="bottomLeft"
                  title={
                    <div className={classes.showAllChain}>
                      Chains that support {token.token.symbol}:
                      <br />
                      {chainList &&
                        chainList?.map(item => (
                          <img src={item.icon} style={{ width: 16, borderRadius: "50%", marginRight: 2 }} alt="" />
                        ))}
                    </div>
                  }
                  color="#FFFFFF"
                  overlayInnerStyle={{ color: "#0A1E42" }}
                >
                  <img src={morePointIcon} style={{ width: 16 }} alt="More Chain" />
                </Tooltip>
              )}
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
          <span className={classes.tabelTitle}>Your Liquidity</span>
        </div>
      ),
      dataIndex: "liquidity",
      key: "liquidity",
      width: "185px",
      render: (text, record) => {
        const { liquidity, liquidity_amt, token } = record;
        const tooltipText2 = liquidity > 0.000001 ? <div>{formatUSDT(liquidity.toFixed(0))}</div> : "--";
        return liquidity ? (
          <div className={classes.content}>
            <Tooltip placement="topRight" title={tooltipText2} color="#FFFFFF" overlayInnerStyle={{ color: "#0A1E42" }}>
              <div>
                {Number(liquidity_amt) >= 0.000001
                  ? `${formatMula(round(Number(liquidity_amt), 6), "")} ${getLiquidityTitleTokenName(
                      token?.token?.symbol,
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
        <div style={{ display: "flex", alignItems: "right", marginLeft: 87 }} className={classes.tabelTitle}>
          Total Liquidity
        </div>
      ),
      key: "total_liquidity",
      dataIndex: "total_liquidity",
      width: "185px",
      render: (text, record) => {
        const { total_liquidity, total_liquidity_amt, token } = record;
        const tooltipText2 = <div>{formatUSDT(total_liquidity.toFixed(0))}</div>;
        return total_liquidity_amt ? (
          <div style={{ textAlign: "right" }} className={classes.content}>
            <Tooltip placement="topRight" title={tooltipText2} color="#FFFFFF" overlayInnerStyle={{ color: "#0A1E42" }}>
              <div>
                {total_liquidity_amt && total_liquidity_amt !== "0"
                  ? `${formatMula(round(Number(total_liquidity_amt), 0), "")} ${getLiquidityTitleTokenName(
                      token?.token?.symbol,
                    )}`
                  : ""}
              </div>
            </Tooltip>
          </div>
        ) : (
          <div style={{ textAlign: "right" }} className={classes.content}>
            --
          </div>
        );
      },
      sorter: (a, b) => a.total_liquidity - b.total_liquidity,
    },
    {
      title: () => (
        <div style={{ textAlign: "right", width: 141 }} className={classes.tabelTitle}>
          Volume 24H
        </div>
      ),
      key: "volume_24h",
      dataIndex: "volume_24h",
      width: "158px",
      render: text => {
        return text ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "right" }}>
            <span className={classes.content}>{convertUSD(text, "floor", 0)}</span>
          </div>
        ) : (
          <div className={classes.content}>--</div>
        );
      },
      sorter: (a, b) => a.volume_24h - b.volume_24h,
    },
    expandedLPInfos.length > 0
      ? {
          title: () => (
            <div style={{ textAlign: "right", width: 141 }} className={classes.tabelTitle}>
              APY
            </div>
          ),
          key: "farming_apy",
          dataIndex: "farming_apy",
          width: "160px",
          render: () => <span />,
          sorter: (a, b) => a.farming_apy - b.farming_apy,
        }
      : {
          title: "",
          key: "farming_apy",
          dataIndex: "farming_apy",
          width: "160px",
          render: () => <span />,
        },
    {
      title: "",
      key: "action",
      dataIndex: "action",
      render: () => <div style={{ display: "flex", alignItems: "center", justifyContent: "right", width: 182 }} />,
    },
  ];

  const { signer, address, chainId, web3Modal, provider } = useWeb3Context();
  const { getContractAddrByChainId, getRpcUrlByChainId } = useConfigContext();
  const rpcUrl = getRpcUrlByChainId(process.env.REACT_APP_CLAIM_ID);
  const jprovider = new JsonRpcProvider(rpcUrl);
  const farmingRewardsInfoContract = useReadOnlyCustomContractLoader(
    jprovider,
    farmingRewardAddresses,
    FarmingRewards__factory,
  );
  const { modal, config } = useAppSelector(state => state);
  const { lpList } = useAppSelector(state => state.lp);
  const [liquidityList, setLiquidityList] = useState(lpList);
  const [hasLiquidityList, setHasLiquidityList] = useState<YourLiquidityPreview[]>([]);
  const [liquidityInfo, setLiquidityInfo] = useState({
    totalLiquidity: 0,
    totalFeeEarning: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [isJustShowOwnLiquidity, toggleIsJustShowOwnLiquidity] = useToggle(false);
  const { showProviderModal, showUnclaimedRewardsModal, showYourLiquidity } = modal;
  const dispatch = useAppDispatch();
  const [totalFarimgRewards, setTotalFarimgRewards] = useState<number>();
  const [unlockableReward, setUnlockableReward] = useState<Array<Reward>>();
  const [claimableReward, setClaimableReward] = useState<Array<Reward>>();
  const [claimedReward, setClaimedReward] = useState<Array<Reward>>();
  const [claimedRewardTotal, setClaimedRewardTotal] = useState<number>();
  const [claimRewardStatus, setClaimRewardStatus] = useState<UnlockRewardType>(UnlockRewardType.UNLUCK);
  const [claimStatus, setClaimStatus] = useState<ClaimType>();
  // const [farmingRewardDetail, setFarmingRewardDetail] =
  //   useState<{ reward_proto_bytes: string; signatures: Array<Signature> }>();
  const [refreshCount, setRefreshCount] = useState(0);
  const ref = useRef<string>();
  ref.current = address;
  let getFarmingRewardInterval;
  let claimInterval;
  let unlockTimeout;
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
    if (segments[0] === "liquidity") {
      initData();
    }
  }, [refreshTransferAndLiquidity]);
  const onShowProviderModal = useCallback(() => {
    dispatch(openModal(ModalName.provider));
  }, [dispatch]);

  const handleCloseProviderModal = () => {
    dispatch(closeModal(ModalName.provider));
  };

  const handleShowUnclaimedRewardsModal = useCallback(() => {
    dispatch(openModal(ModalName.unclaimedRewards));
  }, [dispatch]);
  const handleCloseUnclaimedRewardsModal = () => {
    dispatch(closeModal(ModalName.unclaimedRewards));
  };
  const handleShowYourLiquidityModal = useCallback(() => {
    dispatch(openModal(ModalName.yourLiquidity));
  }, [dispatch]);
  const handleCloseYourLiquidityModal = () => {
    dispatch(closeModal(ModalName.yourLiquidity));
  };

  const onInputChange = e => {
    setSearchText(e.target.value?.toLowerCase());
    // getSearch(e);
  };

  const onEnter = e => {
    setSearchText(e.target.value?.toLowerCase());
    // getSearch(e);
  };

  const checkOwnLiquidity = () => {
    toggleIsJustShowOwnLiquidity();
    // const list = liquidityList.filter(item => {
    //   return item.liquidity !== 0;
    // });
    // setLiquidityList(list);
  };
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
  const setTotalLpList = list => {
    const totalList: LPInfo[] = [];
    const chainListMap = {};
    const liquidityAmtMap = {};
    const liquidityUsdMap = {};
    const totalLiquidityAmtMap = {};
    const totalLiquidityUsdMap = {};
    const volume_24hMap = {};
    const liquidityListMap = {};
    if (list.length > 0) {
      list.forEach(element => {
        if (liquidityAmtMap[element.token.token.symbol] === undefined) {
          chainListMap[element.token.token.symbol] = [];
          liquidityListMap[element.token.token.symbol] = [];
          liquidityAmtMap[element.token.token.symbol] = 0;
          liquidityUsdMap[element.token.token.symbol] = 0;
          totalLiquidityAmtMap[element.token.token.symbol] = 0;
          totalLiquidityUsdMap[element.token.token.symbol] = 0;
          volume_24hMap[element.token.token.symbol] = 0;
        }
        liquidityAmtMap[element.token.token.symbol] += Number(
          formatDecimal(`${element.liquidity_amt}`, element.token.token.decimal).split(",").join(""),
        );
        liquidityUsdMap[element.token.token.symbol] += Number(Math.floor(element.liquidity));
        totalLiquidityAmtMap[element.token.token.symbol] += Number(
          Math.floor(Number(formatUnits(`${element.total_liquidity_amt}`, element.token.token.decimal))),
        );
        totalLiquidityUsdMap[element.token.token.symbol] += Number(Math.floor(element.total_liquidity));
        volume_24hMap[element.token.token.symbol] += Number(Math.floor(element.volume_24h));
        chainListMap[element.token.token.symbol].push(element.chain);
        liquidityListMap[element.token.token.symbol].push(element);
      });
    }
    Object.entries(liquidityAmtMap).forEach((item, i) => {
      const symbol = item[0];
      const lq = list.filter(lqItem => lqItem.token.token.symbol === `${symbol}`)[0];
      const inhertList = liquidityListMap[symbol];
      inhertList.map(initem => {
        const withLpList = lpList?.filter(iitem => {
          let hasLiquidity = false;
          if (initem.token.token.symbol === iitem.token.token.symbol) {
            if (iitem.liquidity_amt !== "0") {
              hasLiquidity = true;
            }
          }
          return hasLiquidity;
        });
        initem.isCanwidthdraw = withLpList.length > 0;
        return initem;
      });
      const totalLpInfo: LPInfo = {
        key: i.toString(),
        chain: lq.chain,
        token: lq.token,
        liquidity: liquidityUsdMap[symbol],
        liquidity_amt: liquidityAmtMap[symbol],
        has_farming_sessions: lq.has_farming_sessions,
        lp_fee_earning: lq.lp_fee_earning,
        farming_reward_earning: lq.farming_reward_earning,
        volume_24h: volume_24hMap[symbol],
        total_liquidity: totalLiquidityUsdMap[symbol],
        total_liquidity_amt: totalLiquidityAmtMap[symbol],
        lp_fee_earning_apy: lq.lp_fee_earning_apy,
        farming_apy: lq.farming_apy,
        farming_session_tokens: lq.farming_session_tokens,
        isCanwidthdraw: lq.isCanwidthdraw,
        liquidityList: inhertList,
        chainList: chainListMap[symbol],
      };
      totalList.push(totalLpInfo);
    });
    setLiquidityList(totalList);
  };
  useEffect(() => {
    const localChains = Object.values(NETWORKS);
    const list = lpList?.filter(item => {
      const chainNameFeatch = item.chain.name.toLowerCase().indexOf(searchText) > -1;
      const tokenNameFeatch = item.token.token.symbol.toString().toLowerCase().indexOf(searchText) > -1;
      const ownLiquidityFeatch = item.liquidity !== 0;
      const filterLocalChains = localChains.filter(localChainItem => localChainItem.chainId === item.chain.id);
      const whiteList = getNetworkById(item.chain.id).tokenSymbolList;
      const blackList = getNetworkById(item.chain.id).lqMintTokenSymbolBlackList;
      const newSymbolList: string[] = [];
      whiteList.forEach(sym => {
        if (!blackList.includes(sym)) {
          newSymbolList.push(sym);
        }
      });
      const filterLocalToken = newSymbolList.filter(localTokenItem => localTokenItem === item.token.token.symbol);
      const isFilter = isJustShowOwnLiquidity
        ? (chainNameFeatch || tokenNameFeatch) &&
          ownLiquidityFeatch &&
          filterLocalChains.length > 0 &&
          filterLocalToken.length > 0
        : (chainNameFeatch || tokenNameFeatch) && filterLocalChains.length > 0 && filterLocalToken.length > 0;
      return isFilter;
    });

    const newList = JSON.parse(JSON.stringify(list));
    setTotalLpList(newList);

    const hasList = newList?.filter(item => item.liquidity_amt !== "0");
    const yourLqPreviewList: YourLiquidityPreview[] = [];
    const tokenAmountMap = {};
    const usdAmountMap = {};
    if (hasList.length > 0) {
      hasList.forEach(element => {
        if (!tokenAmountMap[element.token.token.symbol]) {
          tokenAmountMap[element.token.token.symbol] = 0;
          usdAmountMap[element.token.token.symbol] = 0;
        }
        tokenAmountMap[element.token.token.symbol] += Number(
          formatUnits(`${element.liquidity_amt}`, element.token.token.decimal),
        );
        usdAmountMap[element.token.token.symbol] += Number(`${element.liquidity}`);
      });
    }
    Object.entries(tokenAmountMap).forEach(item => {
      const lq = hasList.filter(lqItem => lqItem.token.token.symbol === `${item[0]}`)[0];
      const lqAmount = item[1];
      if (Number(`${lqAmount}`) > 0.000001) {
        const yourLqPreivewItem: YourLiquidityPreview = {
          tokenIcon: lq.token.icon,
          tokenSysmbol: lq.token.token.symbol,
          lqAmount: `${lqAmount}`,
          usdAmount: usdAmountMap[item[0]] as string,
          tokenDecimal: lq.token.token.decimal,
          chainId: lq.chain.chainID,
        };
        yourLqPreviewList.push(yourLqPreivewItem);
      }
    });

    yourLqPreviewList.sort((a, b) => Number(b.lqAmount) - Number(a.lqAmount));
    setHasLiquidityList(yourLqPreviewList);
  }, [searchText, isJustShowOwnLiquidity, refreshCount, lpList]);

  const getReward = () => {
    if (!address || !farmingRewardsInfoContract) {
      return;
    }
    rewardingData({ addr: address })
      .then(res => {
        // setUnlockableReward(res);
        if (res) {
          const { historical_cumulative_rewards, unlocked_cumulative_rewards, usd_price } = res;
          // TODO: 根据不同的symbol进行数据差值处理
          const sorted_historical_cumulative_rewards = historical_cumulative_rewards?.sort((a, b) =>
            a?.token?.symbol.localeCompare(b?.token?.symbol),
          );
          const sorted_unlocked_cumulative_rewards = unlocked_cumulative_rewards?.sort((a, b) =>
            a?.token?.symbol.localeCompare(b?.token?.symbol),
          );

          const lockedFarmingRewards = sorted_historical_cumulative_rewards.map((item, index) => {
            const unlockedRewardAmt = sorted_unlocked_cumulative_rewards[index]?.amt || 0;
            return {
              token: item?.token,
              amt: item?.amt - unlockedRewardAmt,
            };
          });
          const fetchList: Array<Promise<BigNumber>> = [];
          let totalRewardsDoller = 0;
          sorted_historical_cumulative_rewards.forEach(item => {
            const dollers = item?.amt * usd_price[item?.token?.symbol];
            totalRewardsDoller += dollers;
            const getClaimedRewardAmounts = farmingRewardsInfoContract.claimedRewardAmounts(
              address,
              item?.token?.address,
            );
            fetchList.push(getClaimedRewardAmounts);
          });
          setTotalFarimgRewards(totalRewardsDoller);
          setUnlockableReward(lockedFarmingRewards);
          Promise.all(fetchList)
            .then(resList => {
              // let totalRewardsDoller = 0;
              const claimableRewards: Array<Reward> = [];
              const claimedRewards: Array<Reward> = [];
              resList.forEach((claimedRewardAmounts, index) => {
                const seletctedLockedFarmingRewards = sorted_unlocked_cumulative_rewards[index];
                const claimedRewardAmountsNumber = Number(
                  formatDecimal(claimedRewardAmounts, seletctedLockedFarmingRewards?.token?.decimal)
                    .split(",")
                    .join(""),
                );
                if (seletctedLockedFarmingRewards !== undefined) {
                  claimableRewards.push({
                    token: seletctedLockedFarmingRewards?.token,
                    amt: seletctedLockedFarmingRewards?.amt - claimedRewardAmountsNumber,
                  });
                }
                claimedRewards.push({
                  token: seletctedLockedFarmingRewards?.token,
                  amt: claimedRewardAmountsNumber,
                });
              });
              setClaimableReward(claimableRewards);
              let total = 0;
              claimedRewards.forEach(item => {
                total += item.amt;
              });
              setClaimedRewardTotal(total);
              setClaimedReward(claimedRewards);
            })
            .catch(e => {
              console.log(e);
            });
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  const startlpList = (slient = false) => {
    if (web3Modal.cachedProvider) {
      if (address) {
        getLpList(address, slient);
      }
    } else {
      getLpList("0");
    }
  };
  const initData = (slient = false) => {
    dispatch(setRefreshHistory(!refreshHistory));
    startlpList(slient);
    getReward();
  };
  useEffect(() => {
    startlpList();
  }, [address]);

  useEffect(() => {
    getReward();
  }, [farmingRewardsInfoContract]);

  useEffect(() => {
    return () => {
      clearInterval(getFarmingRewardInterval);
      clearInterval(claimInterval);
      clearTimeout(unlockTimeout);
      sessionStorage.removeItem("unlockTimeoutFlag");
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      initData(true);
    }, 60000);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    if (!provider) {
      return;
    }
    const cacheTxHash = sessionStorage.getItem("cacheTxHash");
    if (cacheTxHash) {
      setClaimLoading(true);
      claimInterval = setInterval(async () => {
        const txStatusRes = await getTxStatus(cacheTxHash);
        if (txStatusRes) {
          sessionStorage.removeItem("cacheTxHash");
          setClaimLoading(false);
          getReward();
          clearInterval(claimInterval);
        }
      }, 1000);
    }
  }, [provider]);

  useEffect(() => {
    if (!config || !chainId) {
      return;
    }
    const contractAddr = getContractAddrByChainId(chainId);
    if (contractAddr) {
      dispatch(setlpCBridgeAddresses(contractAddr));
    }
  }, [dispatch, chainId, config]);

  const getLpList = (addressParam, silent = false) => {
    setLoading(!silent);
    getLPInfoList({ addr: addressParam }).then(res => {
      if (res) {
        const { lp_info } = res;
        dispatch(setLPList(lp_info));
        setLiquidityInfo(getTotalLiquidity(lp_info));
        setLoading(false);
        setRefreshCount(refreshCount + 1);
      } else {
        message.error("Interface error!");
      }
    });
  };
  /**
   * get totalLiquidity, totalFeeEarning
   */
  // eslint-disable-next-line no-shadow
  const getTotalLiquidity = (liquidityList: LPList) => {
    let totalLiquidity = 0;
    let totalFeeEarning = 0;
    liquidityList?.forEach(liquidity => {
      totalLiquidity += liquidity.liquidity;
      totalFeeEarning += liquidity.lp_fee_earning;
    });
    return {
      totalLiquidity,
      totalFeeEarning,
    };
  };

  const getTxStatus = async txHashStr => {
    if (txHashStr) {
      const res = await provider?.getTransactionReceipt(txHashStr);
      return res;
    } else {
      return "";
    }
  };

  const viewFarmingReward = () => {
    if (isMobile) {
      handleShowUnclaimedRewardsModal();
    } else {
      setShowUnlockList(true);
    }
  };

  const unlockMethod = async () => {
    if (Number(process.env.REACT_APP_CLAIM_ID) !== chainId) {
      setLockModalState(true);
      setClaimRewardStatus(UnlockRewardType.SWITCH_CHAIN);
      return;
    }
    setLockModalState(true);
    sessionStorage.removeItem("unlockTimeoutFlag");
    if (Number(process.env.REACT_APP_CLAIM_ID) !== chainId) {
      setClaimRewardStatus(UnlockRewardType.SWITCH_CHAIN);
      return;
    }
    setClaimRewardStatus(UnlockRewardType.UNLUCKING);
    setLoading(true);
    await unlockFarmingReward({ addr: address });
    unlockTimeout = setTimeout(() => {
      const unlockTimeoutFlag = sessionStorage.getItem("unlockTimeoutFlag") === "true";
      if (unlockTimeoutFlag) {
        setClaimRewardStatus(UnlockRewardType.UNLUCK);
        sessionStorage.removeItem("unlockTimeoutFlag");
        clearTimeout(unlockTimeout);
        return;
      }
      getFarmingRewardDetails({ addr: address })
        .then(res => {
          if (res && res.details && res.details.length > 0) {
            clearInterval(getFarmingRewardInterval);
            setClaimRewardStatus(UnlockRewardType.UNLUCK_SUCCESSED);
            setLoading(false);
          } else {
            setLoading(false);
            message.error("Something error!");
          }
        })
        .catch(() => {
          setLoading(false);
          message.error("gateway error!");
        });
    }, 30000);
  };

  const claimMethod = async () => {
    if (Number(process.env.REACT_APP_CLAIM_ID) !== chainId) {
      setLockModalState(true);
      setClaimRewardStatus(UnlockRewardType.SWITCH_CHAIN);
      return;
    }
    if (!farmingRewards) {
      return;
    }
    const res = await getFarmingRewardDetails({ addr: address });
    if (res && res.details && res.details.length > 0) {
      setClaimLoading(true);
      const { reward_proto_bytes, signatures } = res.details[0];
      const newSignatures = signatures.sort((a, b) => a.signer.localeCompare(b.signer));
      const sigs = newSignatures?.map(item => {
        return base64.decode(item.sig_bytes);
      });
      const rewardProtoBytes = base64.decode(reward_proto_bytes);
      const signers = [];
      const powers = [];
      try {
        const farmTx = (await farmingRewards.claimRewards(rewardProtoBytes, sigs, signers, powers)).hash;
        setLockModalState(false);
        setClaimRewardStatus(UnlockRewardType.UNLUCK);
        setClaimStatus(ClaimType.COMPLETED);
        setClaimModalState(true);
        setTxHash(farmTx);
        sessionStorage.setItem("cacheTxHash", farmTx);
        claimInterval = setInterval(async () => {
          const txStatusRes = await getTxStatus(farmTx);
          if (txStatusRes) {
            sessionStorage.removeItem("cacheTxHash");
            setClaimLoading(false);
            getReward();
            clearInterval(claimInterval);
          }
        }, 1000);
      } catch (e) {
        setClaimLoading(false);
        console.log(e);
      }
    }
  };

  const { totalLiquidity, totalFeeEarning } = liquidityInfo;
  const unlockFlag = !!unlockableReward?.find(item => Number(item?.amt?.toFixed(2)) > 0);
  const claimFlag = !!claimableReward?.find(item => Number(item?.amt?.toFixed(2)) > 0);

  const unlockedRewardListContent = () => (
    <div>
      <div>
        <div className={classes.statTitle}>
          Your Total Farming Rewards
          <Tooltip
            placement="topLeft"
            title={tooltipText[FARMINGREWARD]}
            color="#FFFFFF"
            overlayInnerStyle={{ color: "#0A1E42" }}
          >
            <InfoCircleOutlined style={{ fontSize: 15, marginLeft: 5 }} />
          </Tooltip>
        </div>
        <div className={classes.statNum}>
          <span>{totalFarimgRewards ? convertUSD(totalFarimgRewards, "floor", 2) : "$0.00"}</span>
        </div>
      </div>
      <div>
        <div className={classes.unclaimedTitle} style={{ marginTop: 23 }}>
          💰 Locked Farming Rewards
        </div>
        <div className={classes.claimBlock}>
          <div className={classes.blockLeft}>
            {unlockableReward && unlockableReward.length > 0
              ? unlockableReward.map(item => (
                  <div className={classes.unclaimedItem} key={item?.token?.symbol}>
                    {`${formatMula(round(Number(item?.amt), 2), "")} ${getTokenSymbol(item?.token?.symbol, chainId)}`}
                  </div>
                ))
              : "--"}
          </div>
          <Button
            type="primary"
            className={classes.unLockBtn}
            onClick={() => {
              unlockMethod();
            }}
            disabled={!unlockFlag || claimRewardStatus === UnlockRewardType.UNLUCKING}
          >
            {claimRewardStatus === UnlockRewardType.UNLUCKING ? "Unlocking.." : "Unlock to claim"}
          </Button>
        </div>
      </div>
      <div className={classes.lineBlock}>
        <div className={classes.line} />
        <div className={classes.bottomIcon}>
          <ArrowDownOutlined className={classes.arrowDown} />
        </div>
      </div>
      <div>
        <div className={classes.unclaimedTitle}>💰 Claimable Farming Rewards</div>
        <div className={classes.claimBlock}>
          <div className={classes.blockLeft}>
            {claimableReward && claimableReward.length > 0
              ? claimableReward?.map(item => (
                  <div className={classes.unclaimedItem} key={item?.token?.symbol}>
                    {`${formatMula(round(Number(item?.amt), 2), "")} ${getTokenSymbol(item?.token?.symbol, chainId)}`}
                  </div>
                ))
              : "--"}
          </div>
          <Button
            type="primary"
            className={classes.unLockBtn}
            onClick={() => {
              claimMethod();
            }}
            disabled={!claimFlag || claimLoading}
            style={{ width: 134 }}
          >
            {claimLoading ? "Claiming" : "Claim"}
          </Button>
        </div>
      </div>
      {claimedRewardTotal && claimedRewardTotal > 0 ? (
        <div>
          <div className={classes.line} style={{ margin: "20px 0 18px 0" }} />
          <div>
            <div className={classes.unclaimedTitle}>💰 Claimed Farming Rewards</div>
            <div className={classes.blockLeft}>
              {claimedReward && claimedReward.length > 0
                ? claimedReward?.map(item => (
                    <div className={classes.unclaimedItem} key={item?.token?.symbol}>
                      {`${formatMula(round(Number(item?.amt), 2), "")} ${getTokenSymbol(item?.token?.symbol, chainId)}`}
                    </div>
                  ))
                : "--"}
            </div>
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
  const yourTotalLiquidityItem = () => (
    <div>
      <div className={classes.statTitle}>
        Your Total Liquidity
        <Tooltip
          placement="top"
          title={tooltipText[TOTAL_LIQUIDITY]}
          color="#FFFFFF"
          overlayInnerStyle={{ color: "#0A1E42", width: 290 }}
        >
          <InfoCircleOutlined style={{ fontSize: 15, marginLeft: 5 }} />
        </Tooltip>
      </div>
      <div className={classes.statNum}>
        <span>{formatUSDT(totalLiquidity.toFixed(2))}</span>
      </div>
    </div>
  );
  const yourTotalLiquidityListContent = () => (
    <div>
      {!isMobile && yourTotalLiquidityItem()}
      <div
        className="yourTotalLiquidityList"
        style={isMobile ? { paddingRight: 0, maxHeight: "auto" } : { paddingRight: 10, maxHeight: 360 }}
      >
        {hasLiquidityList?.map(item => {
          return (
            <div key={item.tokenSysmbol} className={classes.liquidityListItem}>
              <div>
                <img
                  src={item.tokenIcon}
                  className={classes.tableIcon}
                  alt=""
                  style={{
                    boxShadow:
                      themeType === "dark"
                        ? "0px 2px 4px -2px rgba(24, 39, 75, 0.12), 0px 4px 4px -2px rgba(24, 39, 75, 0.08)"
                        : "0px 2px 4px -2px rgba(24, 39, 75, 0.12), 0px 4px 4px -2px rgba(24, 39, 75, 0.08)",
                  }}
                />
                <span className={classes.tokenSym}>{getTokenSymbol(item.tokenSysmbol, item.chainId)}</span>
              </div>
              <div className={classes.itemRight}>
                <div className={classes.liquidityAmt}>
                  <span>{formatBalance(`${item.lqAmount}`, ",")}</span>{" "}
                  <span>{getTokenSymbol(item.tokenSysmbol, item.chainId)}</span>
                </div>
                <div className={classes.liquidityUsd}>{formatUSDT(Number(item.usdAmount).toFixed(2))}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  const unlockedRewardList = () => (
    <div className={classes.panelContent}>
      <div>
        <CloseOutlined
          className={classes.closeIcon}
          onClick={() => {
            setShowUnlockList(false);
          }}
        />
      </div>
      {unlockedRewardListContent()}
    </div>
  );
  const yourTotalLiquidityList = () => (
    <div className={classes.panelContentLiquidity}>
      <div>
        <CloseOutlined
          className={classes.closeIcon}
          onClick={() => {
            setShowYourTotalLiquidityList(false);
          }}
        />
      </div>
      {yourTotalLiquidityListContent()}
    </div>
  );
  const liquidityInfoPanel = () => (
    <div className={classes.liquidityInfo}>
      <Row gutter={[15, { md: 15 }]}>
        <Col md={12} lg={12} xl={8}>
          <div
            className={!showYourTotalLiquidityList ? classes.liquidityInfoCol : classes.liquidityInfoColNoBorder}
            style={{ position: "relative" }}
          >
            {!showYourTotalLiquidityList ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {yourTotalLiquidityItem()}
                {hasLiquidityList.length > 0 && (
                  <div style={{ alignSelf: "center" }}>
                    <Button
                      type="primary"
                      className={isMobile ? classes.mobileClaimBtn : classes.claimBtn}
                      // disabled
                      onClick={() => {
                        setShowYourTotalLiquidityList(true);
                      }}
                      size="large"
                    >
                      Details
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              yourTotalLiquidityList()
            )}
            {isLPNotEmpty ? (
              <div className={classes.statPreUpgrade}>
                <a href={PRE_UPGRADE_LINK} target="_blank" rel="noreferrer">
                  Migrate Liquidity from Pre-upgrade Pools→
                </a>
              </div>
            ) : null}
          </div>
        </Col>
        <Col md={12} lg={12} xl={8}>
          <div className={classes.liquidityInfoCol}>
            <div className={classes.statTitle}>
              Your Liquidity Fee Earnings
              <Tooltip
                placement="top"
                title={tooltipText[TOTAL_FEE_EARNING]}
                color="#FFFFFF"
                overlayInnerStyle={{ color: "#0A1E42", width: 290 }}
              >
                <InfoCircleOutlined style={{ fontSize: 15, marginLeft: 5 }} />
              </Tooltip>
            </div>
            <div className={classes.statNum}>
              <span>{formatUSDT(totalFeeEarning.toFixed(2))}</span>
            </div>
          </div>
        </Col>
        <Col md={12} lg={12} xl={8}>
          <div
            className={!showUnlockList ? classes.liquidityInfoCol : classes.liquidityInfoColNoBorder}
            style={{ position: "relative" }}
          >
            {!showUnlockList ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div className={classes.statTitle}>
                    Your Total Farming Rewards
                    <Tooltip
                      placement="top"
                      title={tooltipText[FARMINGREWARD]}
                      color="#FFFFFF"
                      overlayInnerStyle={{ color: "#0A1E42" }}
                    >
                      <InfoCircleOutlined style={{ fontSize: 15, marginLeft: 5 }} />
                    </Tooltip>
                  </div>
                  <div className={classes.statNum}>
                    <span>{totalFarimgRewards ? convertUSD(totalFarimgRewards, "floor", 2) : "$0.00"}</span>
                  </div>
                </div>
                <div style={{ alignSelf: "center" }}>
                  <Button
                    type="primary"
                    className={isMobile ? classes.mobileClaimBtn : classes.claimBtn}
                    disabled={totalFarimgRewards === undefined || totalFarimgRewards <= 0}
                    onClick={() => {
                      viewFarmingReward();
                    }}
                    size="large"
                  >
                    View
                  </Button>
                </div>
              </div>
            ) : (
              unlockedRewardList()
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
  const newList = JSON.parse(JSON.stringify(liquidityList));
  return (
    <div className={themeType === "dark" ? classes.spinblur : classes.whiteSpinblur}>
      <Spin spinning={loading}>
        <div className={classes.liquidityContent}>
          <div className={classes.pageHeaderBlock}>
            <PageHeader
              title="Your Liquidity Overview"
              className={isMobile ? classes.mobilePageHeader : classes.pageHeader}
            />
            <Button
              type="primary"
              className={classes.rebutton}
              onClick={() => {
                initData();
              }}
              icon={<ReloadOutlined style={{ fontSize: 20 }} />}
            />
          </div>
          {(() => {
            if (web3Modal.cachedProvider) {
              if (isMobile) {
                return (
                  <>
                    <LiquidityInfoPanelForMobile
                      totalLiquidity={totalLiquidity}
                      totalFeeEarning={totalFeeEarning}
                      totalFarmingRewards={totalFarimgRewards}
                      claimAction={viewFarmingReward}
                      liquidityAction={handleShowYourLiquidityModal}
                      showLiquidityBtn={hasLiquidityList.length > 0}
                    />
                    <Modal
                      className={classes.mobileViewRewardModal}
                      title="💰 Unclaimed Farming Rewards"
                      visible={showUnclaimedRewardsModal}
                      onCancel={handleCloseUnclaimedRewardsModal}
                      footer={null}
                    >
                      {unlockedRewardListContent()}
                    </Modal>
                    <Modal
                      className={classes.mobileViewRewardModal}
                      title="Your Total Liquidity"
                      visible={showYourLiquidity}
                      onCancel={handleCloseYourLiquidityModal}
                      footer={null}
                    >
                      {yourTotalLiquidityListContent()}
                    </Modal>
                  </>
                );
              }
              return liquidityInfoPanel();
            }
            return (
              <div className={isMobile ? classes.mobileConnect : classes.connect}>
                <Button type="primary" onClick={onShowProviderModal} className={classes.connectBtn}>
                  Connect Wallet
                </Button>
              </div>
            );
          })()}
          <div className={classes.card}>
            {!signer && !isMobile && (
              <div className={classes.contCover} style={{ height: 100 }}>
                <div className={classes.contCoverTop}>
                  <div className={classes.contCoverTopLeft} />
                  <div className={classes.contCoverTopRight} />
                </div>
              </div>
            )}
            {!signer && isMobile && (
              <div className={classes.contCover} style={{ height: 60 }}>
                <div className={classes.mobileContCoverTop}>
                  <div className={classes.mobileContCoverTopLeft} />
                </div>
              </div>
            )}

            {isMobile ? (
              <div>
                <div className={classes.mobileSearch}>
                  <div className={classes.mobilePositionSwitch}>
                    <img
                      style={{ position: "absolute", left: 24, top: 22, zIndex: 3 }}
                      src={searchIcon}
                      className={classes.searchIconLeft}
                      alt="search icon"
                    />
                    <Input
                      className={classes.moblieSearchinput}
                      placeholder="Search by token name or chain name"
                      onChange={onInputChange}
                      onPressEnter={onEnter}
                      autoFocus={signer && !isMobile}
                    />
                  </div>

                  <div className={classes.mobileLableSwitch}>
                    <div className={classes.mobileShowMyPosition}>
                      <div>Only Show My Positions</div>
                      <Switch onChange={checkOwnLiquidity} className={classes.mobileSwitch} />
                    </div>
                    <div className={classes.mobileSort}>
                      <div
                        style={{ marginRight: sortOrder ? 0 : 8, marginLeft: 8, padding: "8px 0" }}
                        onClick={() => {
                          setShowLiquidityTableOrder(true);
                        }}
                      >
                        Sort by {sortColumnKeyName}
                      </div>
                      <div
                        onClick={() => {
                          if (sortOrder === "ascend") {
                            setSortOrder("descend");
                          } else {
                            setSortOrder("ascend");
                          }
                        }}
                      >
                        {sortOrder && (
                          <img
                            src={sortOrder === "ascend" ? sortAcendyUrl : sortDescendUrl}
                            alt="Acending or Descending"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <LiquidityProductList
                  liquidityTableList={newList}
                  addAction={lpInfo => {
                    addLiquidity(lpInfo);
                  }}
                  removeAction={lpInfo => {
                    removeLiquidity(lpInfo);
                  }}
                  singleLiquidity={lpInfo => {
                    singleLiquidity(lpInfo);
                  }}
                  order={sortOrder}
                  columnKey={sortColumnKey}
                />
              </div>
            ) : (
              <div>
                <div className={classes.search}>
                  <div className={classes.positionSwitch}>
                    <Space>
                      <div style={{ width: "100%", fontSize: 14 }}>Only Show My Positions</div>
                      <Switch onChange={checkOwnLiquidity} className={classes.switch} />
                    </Space>
                  </div>
                  <div style={{ position: "relative" }}>
                    <img
                      style={{ position: "absolute", left: 8, top: 12, zIndex: 3 }}
                      src={searchIcon}
                      className={classes.searchIconLeft}
                      alt="search icon"
                    />
                    <Input
                      className={classes.searchinput}
                      placeholder="Search by token name or chain name"
                      onChange={onInputChange}
                      onPressEnter={onEnter}
                      autoFocus={signer && !isMobile}
                    />
                  </div>
                </div>
                <div className={classes.table}>
                  <div className="iquidityTable">
                    <Table
                      columns={columns}
                      showSorterTooltip={false}
                      dataSource={liquidityList}
                      pagination={false}
                      // scroll={{ y: 500 }}
                      rowClassName={record => {
                        const tempLPInfos = expandedLPInfos.filter(
                          item => item && record.token.token.address === item.token.token.address,
                        );
                        if (tableExpanded && tempLPInfos.length > 0) {
                          return "table-cell-color-open";
                        }
                        return "table-cell-color-close";
                      }}
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
                      expandRowByClick={!false}
                      onExpandedRowsChange={expandedRows => {
                        const expandsLPInfos: Array<LPInfo> = [];
                        expandedRows.map(value => {
                          const lpInfo: LPInfo = liquidityList[value];
                          expandsLPInfos.push(lpInfo);
                        });
                        setExpandedLPInfos(expandsLPInfos);
                        if (expandedRows.length > 0) {
                          setTableExpanded(true);
                        }
                      }}
                      expandable={{
                        expandedRowRender: record => {
                          const liquidityListData = JSON.parse(JSON.stringify(record.liquidityList));
                          return (
                            <div className={classes.liquidityTableBody}>
                              <LiquidityTable
                                initData={initData}
                                liquidityList={liquidityListData}
                                searchText={searchText}
                                order={sortOrder}
                                columnKey={sortColumnKey}
                                expands={expandedLPInfos}
                              />
                            </div>
                          );
                        },
                        expandIcon: ({ expanded, onExpand, record }) =>
                          expanded ? (
                            <div
                              className="expanded-block"
                              onClick={e => {
                                onExpand(record, e);
                              }}
                            >
                              <div className="expanded-icon">
                                <img src={actionArrowUpIcon} className={classes.actionIcon} alt="folding" />
                              </div>
                            </div>
                          ) : (
                            <div
                              className="expanded-block"
                              onClick={e => {
                                onExpand(record, e);
                              }}
                            >
                              <div className="expanded-icon">
                                <img src={actionArrowDownIcon} className={classes.actionIcon} alt="expanded" />
                              </div>
                            </div>
                          ),
                        fixed: false,
                        expandIconColumnIndex: 7,
                      }}
                      onChange={(pagination, filters, sorter) => {
                        if (sorter instanceof Array) {
                          setSortOrder(`${sorter[0]?.order}`);
                          setSortColumnKey(`${sorter[0]?.columnKey}`);
                        } else {
                          setSortOrder(`${sorter?.order}`);
                          setSortColumnKey(`${sorter?.columnKey}`);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <ProviderModal visible={showProviderModal} onCancel={handleCloseProviderModal} />
          {lockModalState && (
            <LockLiquidityModal
              showModal={lockModalState}
              unlockableReward={unlockableReward}
              claimableReward={claimableReward}
              claimRewardStatus={claimRewardStatus}
              claimMethod={claimMethod}
              loading={claimLoading}
              txHash={txHash}
              onClose={() => {
                initData();
                clearTimeout(unlockTimeout);
                if (claimRewardStatus === UnlockRewardType.UNLUCKING) {
                  sessionStorage.setItem("unlockTimeoutFlag", "true");
                }
                setLockModalState(false);
              }}
              onSuccessClose={() => {
                setShowUnlockList(false);
              }}
            />
          )}
          {claimModalState && (
            <ClaimLiquidityModal
              showModal={claimModalState}
              unlockableReward={unlockableReward}
              claimableReward={claimableReward}
              claimRewardStatus={claimStatus}
              claimMethod={claimMethod}
              loading={claimLoading}
              txHash={txHash}
              onClose={() => {
                initData();
                setClaimModalState(false);
              }}
              onSuccessClose={() => {
                setShowUnlockList(false);
              }}
            />
          )}
          {showLiquidityTableOrder && (
            <LiquidityTableOrder
              onCancle={(order, key, keyname) => {
                setSortOrder(order);
                setSortColumnKey(key);
                setSortColumnKeyName(keyname);
                setShowLiquidityTableOrder(false);
              }}
              order={sortOrder}
              columnKey={sortColumnKey}
            />
          )}
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
      </Spin>
    </div>
  );
};

export default Liquidity;
