import { useEffect, useState, useContext } from "react";
import { createUseStyles } from "react-jss";
import { Modal } from "antd";
import { Theme } from "../../theme";
import { ColorThemeContext } from "../../providers/ThemeProvider";
import arrowAcendyIcon from "../../images/arrowAcend.svg";
import arrowDescendIcon from "../../images/arrowDescend.svg";
import arrowAcendyLightIcon from "../../images/arrowAcendLight.svg";
import arrowDescendLightIcon from "../../images/arrowDescendLight.svg";

export interface LiquidityTableOrderProps {
  onCancle: (orderBy: string, key: string, keyName: string) => void;
  order: string;
  columnKey: string;
}
class SortByMenu {
  key: string;

  keyName: string;

  constructor(key: string, keyName: string) {
    this.key = key;
    this.keyName = keyName;
  }
}
export default function LiquidityTableOrder({ onCancle, order, columnKey }: LiquidityTableOrderProps): JSX.Element {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keyList = [
    new SortByMenu("", "Default"),
    new SortByMenu("token", "Token"),
    new SortByMenu("chain", "Chain"),
    new SortByMenu("liquidity", "Your Liquidity"),
    new SortByMenu("total_liquidity", "Total liquidity"),
    new SortByMenu("volume_24h", "Volume 24h"),
  ];
  const [sortOrder, setSortOrder] = useState("");
  const [sortColumnKey, setSortColumnKey] = useState("");
  const [sortkeyName, setSortkeyName] = useState("");
  const { themeType } = useContext(ColorThemeContext);
  const sortAcendyUrl = themeType === "dark" ? arrowAcendyIcon : arrowAcendyLightIcon;
  const sortDescendUrl = themeType === "dark" ? arrowDescendIcon : arrowDescendLightIcon;
  useEffect(() => {
    if (order === "ascend") {
      setSortOrder("ascend");
    } else {
      setSortOrder("descend");
    }
  }, [order]);

  useEffect(() => {
    setSortColumnKey(columnKey);
    keyList?.map(item => item.key === columnKey && setSortkeyName(item.keyName));
  }, [columnKey, keyList]);

  const useStyles = createUseStyles((theme: Theme) => ({
    ratemodal: {
      position: "relative",
    },
    ratemodalwarp: {
      height: 200,
      justifyContent: "bottom",
    },
    selectMenu: {
      background: theme.infoDanger,
      borderRadius: "8px 8px 0px 0px",
    },
    unmodaltext: {
      fontSize: 12,
      width: "100%",
      padding: "9px 0",
      textAlign: "center",
      fontWeight: 600,
      color: theme.surfacePrimary,
    },
    modaltext: {
      fontSize: 12,
      width: "100%",
      padding: "9px 0",
      textAlign: "center",
      fontWeight: 600,
      color: theme.primaryBrand,
    },

    unlockModal: {
      width: "100vw",
      position: "fixed",
      top: "calc(100vh - 280px)",
      height: "auto",
      background: theme.secondBackground,
      border: `1px solid ${theme.primaryBackground}`,
      "& ..ant-modal": {
        height: "auto",
        padding: 0,
      },
      "& .ant-modal-content": {
        width: "100vw",
        height: "auto",
        background: theme.secondBackground,
        boxShadow: "",
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
          padding: 0,
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
  const classes = useStyles();
  const closeModal = () => {
    onCancle(sortColumnKey === "" ? "" : sortOrder, sortColumnKey, sortColumnKey === "" ? "" : sortkeyName);
  };
  const content = (
    <div className={classes.ratemodalwarp}>
      {keyList?.map(item => (
        <div
          className={item.key === sortColumnKey ? classes.modaltext : classes.unmodaltext}
          onClick={() => {
            onCancle(item.key === "" ? "" : sortBy(), item.key, item.key === "" ? "" : item.keyName);
          }}
        >
          {item.keyName}
          {sortOrder && sortColumnKey && item.key === sortColumnKey && sortOrder !== "undefined" && (
            <img src={sortOrder === "ascend" ? sortAcendyUrl : sortDescendUrl} alt="Acending or Descending" />
          )}
        </div>
      ))}
    </div>
  );
  return (
    <Modal title="Sort by" width={512} onCancel={closeModal} visible footer={null} className={classes.unlockModal}>
      {content}
    </Modal>
  );
  function sortBy(): string {
    if (sortOrder === "ascend") {
      return "descend";
    }
    return "ascend";
  }
}
