import { useState, useEffect } from "react";
import { FileTextOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { LPInfo } from "../../constants/type";
import { Theme } from "../../theme";
import LiquidityProductCell from "./LiquidityProductCell";
import { getTokenSymbol } from "../../redux/assetSlice";

const useStyles = createUseStyles((theme: Theme) => ({
  box: {
    gridTemplateColumns: "auto",
    rowGap: 6,
    width: "100%",
    padding: "16px 16px 0 16px",
  },
  noDataView: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 248,
    borderRadius: 8,
    background: theme.primaryBackground,
  },
  noDataIcon: {
    fontSize: 24,
    color: theme.surfacePrimary,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.surfacePrimary,
    marginTop: 24,
  },
}));

type LiquidityProductListProps = {
  liquidityTableList: LPInfo[];
  addAction: (lpInfo: LPInfo) => void;
  removeAction: (lpInfo: LPInfo) => void;
  singleLiquidity: (lpInfo: LPInfo) => void;
  order: string;
  columnKey: string;
};

function LiquidityProductList({ liquidityTableList, addAction, removeAction, singleLiquidity, order, columnKey }: LiquidityProductListProps) {
  const styles = useStyles();
  const [dataList, setDataList] = useState<Array<LPInfo>>([]);
  useEffect(() => {
    let list = JSON.parse(JSON.stringify(liquidityTableList));
    if (columnKey === "token") {
      if (order === "ascend") {
        list = liquidityTableList.sort((a, b) => getTokenSymbol(a.token.token.symbol, a.chain.id).localeCompare(
          getTokenSymbol(b.token.token.symbol, b.chain.id)
        ))
      } else if (order === "descend") {
        list = liquidityTableList.sort((a, b) => getTokenSymbol(b.token.token.symbol, b.chain.id).localeCompare(
          getTokenSymbol(a.token.token.symbol, a.chain.id)
        ))
      }
    } else if (columnKey === "chain") {
      if (order === "ascend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => a.chain.name.localeCompare(b.chain.name))
        ))
        list = liquidityTableList.sort((a, b) => a.chain.name.localeCompare(b.chain.name))
      } else if (order === "descend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => b.chain.name.localeCompare(a.chain.name))
        ))
        list = liquidityTableList.sort((a, b) => b.chain.name.localeCompare(a.chain.name))
      }
    } else if (columnKey === "liquidity") {
      if (order === "ascend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => a.liquidity - b.liquidity)
        ))
        list = liquidityTableList.sort((a, b) => a.liquidity - b.liquidity)
      } else if (order === "descend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => b.liquidity - a.liquidity)
        ))
        list = liquidityTableList.sort((a, b) => b.liquidity - a.liquidity)
      }
    } else if (columnKey === "total_liquidity") {
      if (order === "ascend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => a.total_liquidity - b.total_liquidity)
        ))
        list = liquidityTableList.sort((a, b) => a.total_liquidity - b.total_liquidity)
      } else if (order === "descend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => b.total_liquidity - a.total_liquidity)
        ))
        list = liquidityTableList.sort((a, b) => b.total_liquidity - a.total_liquidity)
      }
    } else if (columnKey === "volume_24h") {
      if (order === "ascend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => a.volume_24h - b.volume_24h)
        ))
        list = liquidityTableList.sort((a, b) => a.volume_24h - b.volume_24h)
      } else if (order === "descend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => b.volume_24h - a.volume_24h)
        ))
        list = liquidityTableList.sort((a, b) => b.volume_24h - a.volume_24h)
      }
    } else if (columnKey === "farming_apy") {
      if (order === "ascend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => a.lp_fee_earning_apy + a.farming_apy - (b.lp_fee_earning_apy + b.farming_apy))
        ))
        list = liquidityTableList.sort((a, b) => a.lp_fee_earning_apy + a.farming_apy - (b.lp_fee_earning_apy + b.farming_apy))
      } else if (order === "descend") {
        liquidityTableList.map(item => (
          item.liquidityList?.sort((a, b) => b.lp_fee_earning_apy + b.farming_apy - (a.lp_fee_earning_apy + a.farming_apy))
        ))
        list = liquidityTableList.sort((a, b) => b.lp_fee_earning_apy + b.farming_apy - (a.lp_fee_earning_apy + a.farming_apy))
      }
    }
    setDataList(list)
  }, [order, columnKey, liquidityTableList]);
  return (
    <div className={styles.box}>
      {dataList.length > 0 ? (
        dataList.map(lp => (
          <LiquidityProductCell
            key={lp.key + lp.token.token.address}
            lpInfo={lp}
            addAction={addAction}
            removeAction={removeAction}
            singleLiquidity={singleLiquidity}
          />
        ))
      ) : (
        <div className={styles.noDataView}>
          <div style={{ display: "flex", flexFlow: "column", justifyContent: "flex-start", alignItems: "center" }}>
            <FileTextOutlined className={styles.noDataIcon} />
            <span className={styles.noDataText}>No Data!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiquidityProductList;
