import { Avatar } from "antd";
import { useEffect } from "react";
import { createUseStyles } from "react-jss";
import { useTokenBalance, useCustomContractLoader, useNativeETHToken } from "../../hooks";
import { useWeb3Context } from "../../providers/Web3ContextProvider";
import { useAppSelector } from "../../redux/store";
import { Theme } from "../../theme";
import { ERC20 } from "../../typechain";
import { ERC20__factory } from "../../typechain/factories/ERC20__factory";
import { formatDecimal } from "../../helpers/format";
import { alpha2Hex } from "../../helpers/alpha2Hex";
import { getTokenSymbol } from "../../redux/assetSlice";
import { usePeggedPairConfig } from "../../hooks/usePeggedPairConfig";

/* eslint-disable*/
/* eslint-disable camelcase */
const useStyles = createUseStyles((theme: Theme) => ({
  card: {
    // background: theme.primaryBackground,
    width: "100%",
    paddingBottom: 15,
    "@global": {
      ".ant-list-item": {
        padding: "10px 12px",
      },
      ".ant-list-item-meta-title": {
        fontSize: 16,
        marginBottom: 0,
      },
      ".ant-list-item-meta-description": {
        fontSize: 12,
      },
    },
    "&.ant-card": {
      height: "100%",
    },
    "& .ant-card-body": {
      padding: 0,
      overflow: "hidden",
    },

    "& .ant-list-item": {
      border: "none",
    },

    "& .ant-list-item-meta": {
      alignItems: "center",
    },
    "& .ant-card-head-title": {
      padding: "24px 0",
    },
  },
  item: {
    cursor: "pointer",
    overflow: "hidden",
    color: theme.secondBrand,
    margin: "10px 20px",
    borderRadius: 16,
    background: theme.surfacePrimary + alpha2Hex(10),
  },
  activeItem: {
    composes: ["item"],
    color: theme.surfacePrimary,
    margin: "10px 20px",
    transition: "ease 0.2s",
    borderRadius: 16,
    background: theme.surfacePrimary + alpha2Hex(10),
    border: `1px solid ${theme.primaryBrand}`,
  },
  litem: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
  },
  tokenName: {
    fontSize: 16,
    textAlign: "left",
  },
  tokenSymbol: {
    fontSize: 12,
    textAlign: "left",
  },
}));

const TokenItem = ({ onSelectToken, tokenInfo, setSort }) => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles();
  const { provider, address, chainId } = useWeb3Context();
  const { refreshGlobalTokenBalance } = useAppSelector(state => state.globalInfo);
  const { fromChain, selectedTokenSymbol } = useAppSelector(state => state.transferInfo);
  const { icon, token } = tokenInfo;
  const { decimal, symbol } = token;
  const pegConfig = usePeggedPairConfig();
  const tokenContract = useCustomContractLoader(
    provider,
    pegConfig.getTokenBalanceAddress(tokenInfo.token.address || ""),
    ERC20__factory,
  ) as ERC20 | undefined;
  const [tokenBalanceone, loading, , refreshBlance] = useTokenBalance(tokenContract, address);
  const balanceone = () => {
    if (fromChain?.id !== chainId) {
      return "--";
    }
    if (isNativeETHToken) {
      return formatDecimal(ETHBalance.toString(), decimal);
    }
    return formatDecimal(tokenBalanceone.toString(), decimal);
  };

  const { isNativeETHToken, ETHBalance, tokenDisplayName } = useNativeETHToken(fromChain, tokenInfo);

  useEffect(() => {
    setSort(symbol, balanceone());
  }, [token, loading, tokenBalanceone, ETHBalance]);

  useEffect(() => {
    refreshBlance();
  }, [refreshGlobalTokenBalance]);

  return (
    <div
      className={selectedTokenSymbol === symbol ? classes.activeItem : classes.item}
      onClick={() => onSelectToken(symbol)}
    >
      <div className={classes.litem}>
        <div className={classes.itemLeft}>
          <Avatar size="large" src={icon} />
          <div style={{ marginLeft: 8 }}>
            <div className={classes.tokenName}>{tokenDisplayName}</div>
          </div>
        </div>
        <div className={classes.tokenName} style={{ textAlign: isMobile ? "right" : "left" }}>
          {balanceone()} <span style={{ marginLeft: 5 }}>{getTokenSymbol(symbol, chainId)}</span>
        </div>
      </div>
    </div>
  );
};

export default TokenItem;
