import { Input, Modal, Spin } from "antd";
import { FC, useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { useAppSelector } from "../../redux/store";
import { Theme } from "../../theme";
import TokenItem from "./NewTokenItem";
import { useMergedTokenList } from "../../hooks/useMergedTokenList";

/* eslint-disable*/
/* eslint-disable camelcase */

const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  tokenModal: {
    width: props => (props.isMobile ? "100%" : 512),
    minWidth: props => (props.isMobile ? "100%" : 448),
    background: theme.secondBackground,
    border: props => (props.isMobile ? 0 : `1px solid grey`),
    "& .ant-modal-content": {
      background: theme.secondBackground,
      boxShadow: props => (props.isMobile ? "none" : ""),
    },
    "& .ant-modal-body": {
      padding: "0 !important",
    },
    "& .ant-modal": {
      background: theme.secondBackground,
    },
    "& .ant-modal-header": {
      background: `${theme.secondBackground} !important`,
    },
    "& .ant-modal-title": {
      color: `${theme.surfacePrimary} !important`,
    },
  },
  card: {
    background: theme.secondBackground,
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
    "&:hover": {
      background: theme.surfacePrimary10,
      transition: "ease 0.2s",
    },
  },
  activeItem: {
    composes: ["item"],
    background: theme.secondBackground,
    border: `1px solid ${theme.primaryBrand} !important`,
    transition: "ease 0.2s",
    borderRadius: 16,
  },
  litem: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: theme.secondBrand,
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
  },
  tokenName: {
    fontSize: 16,
    color: theme.secondBrand,
    textAlign: "left",
  },
  tokenSymbol: {
    fontSize: 12,
    color: theme.secondBrand,
    textAlign: "left",
  },
  search: {
    margin: 16,
    "& .ant-input": {
      fontSize: 14,
      background: theme.secondBackground,
      color: theme.secondBrand,
    },
    "& .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover": {
      borderColor: "#1890ff",
    },
    "& .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused": {
      borderColor: "#1890ff",
    },
  },
  searchinput: {
    width: "100%",
    height: 48,
    borderRadius: 100,
    border: "1px solid #4e4c4c",
    background: theme.secondBackground,
  },
  itemList: {
    maxHeight: 510,
    minHeight: 126,
    overflowY: "auto",
  },
}));

interface IProps {
  onSelectToken: (symbol: string) => void;
  visible: boolean;
  onCancel: () => void;
}

const TokenList: FC<IProps> = ({ onSelectToken, visible, onCancel }) => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const classes = useStyles({ isMobile });
  const { fromChain } = useAppSelector(state => state.transferInfo);
  const mergedTokenList = useMergedTokenList();
  const [searchText, setSearchText] = useState("");

  const [tokenList, setTokenList] = useState(mergedTokenList);

  const [filterTokenList, setFilterTokenList] = useState(mergedTokenList);

  const [loading, setLoadig] = useState(false);

  const tokenJson = {};
  filterTokenList?.forEach(item => {
    tokenJson[item?.token?.symbol] = "0.0";
  });
  const [tokenkv, setTokenkv] = useState(tokenJson);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const onInputChange = e => {
    setSearchText(e.target.value?.toLowerCase());
  };
  const onEnter = e => {
    setSearchText(e.target.value?.toLowerCase());
  };

  const njson = { ...tokenkv };

  const setSortValue = (symbol, value) => {
    njson[symbol] = value.split(",").join("");
    setTokenkv(njson);
  };

  useEffect(() => {
    if (!fromChain) {
      return;
    }
    setFilterTokenList(mergedTokenList);
    const tokenJson = {};
    mergedTokenList?.forEach(item => {
      tokenJson[item?.token?.symbol] = "0.0";
    });
    setTokenkv(tokenJson);
  }, [mergedTokenList, fromChain]);

  useEffect(() => {
    if (!fromChain) {
      return;
    }
    const list = filterTokenList?.filter(item => {
      const chainNameFeatch = item.name.toLowerCase().indexOf(searchText) > -1;
      const addressFeatch = item.token.address.toString().toLowerCase().indexOf(searchText) > -1;
      const symbolFeatch = item.token.symbol.toString().toLowerCase().indexOf(searchText) > -1;
      const isFilter = chainNameFeatch || addressFeatch || symbolFeatch;
      return isFilter;
    });
    setTokenList(list);
  }, [searchText, filterTokenList]);

  useEffect(() => {
    const keyList = Object.keys(tokenkv);
    const list = keyList?.map(key => ({ symbol: key, balance: tokenkv[key] }));
    list.sort((a, b) => (Number(a.balance) > Number(b.balance) ? -1 : 1));
    if (filterTokenList?.length === list.length) {
      const newTokenList = list?.map(item => {
        let one;
        filterTokenList?.map(token => {
          if (item.symbol === token?.token?.symbol.toString()) {
            one = token;
          }
          return one;
        });
        return one;
      });
      setTokenList(newTokenList);
    } else {
      setTokenList(filterTokenList);
    }
  }, [filterTokenList, tokenkv]);

  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      footer={null}
      maskClosable={false}
      className={classes.tokenModal}
      title="Select a token"
    >
      <Spin spinning={loading} wrapperClassName="tokenSpin">
        <div className={classes.card}>
          <div className={classes.search}>
            <Input
              className={classes.searchinput}
              placeholder="Search token by name or address"
              onChange={onInputChange}
              onPressEnter={onEnter}
              allowClear
              autoFocus={!isMobile}
            />
          </div>
          <div className={classes.itemList}>
            {tokenList?.map(item => {
              return (
                <TokenItem
                  key={item?.token?.symbol}
                  onSelectToken={onSelectToken}
                  tokenInfo={item}
                  setSort={setSortValue}
                />
              );
            })}
            {tokenList?.length === 0 && (
              <div style={{ width: "100%", fontSize: 16, textAlign: "center", color: "#fff" }}>No results found.</div>
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default TokenList;
