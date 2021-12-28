/* eslint-disable camelcase */
import { Avatar, List, Modal, Input } from "antd";
import { FC, useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { useWeb3Context } from "../providers/Web3ContextProvider";
import { useAppSelector } from "../redux/store";
import { Theme } from "../theme";
import ActionTitle from "./common/ActionTitle";
import { Chain } from "../constants/type";
import { NETWORKS } from "../constants/network";

const useStyles = createUseStyles<string, { isMobile: boolean }, Theme>((theme: Theme) => ({
  chainModal: {
    width: "100%",
    minWidth: props => (props.isMobile ? "100%" : 624),
    background: theme.secondBackground,
    border: props => (props.isMobile ? 0 : `1px solid ${theme.selectChainBorder}`),
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
  },
  chainModalWrap: {
    zIndex: 1001,
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
      border: `1px solid ${theme.primaryBorder} `,
      borderWidth: "1px !important",
    },
    "& .ant-list-split .ant-list-item:last-child": {
      border: `1px solid ${theme.primaryBorder} `,
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
    borderRadius: 16,
    background: theme.chainBg,
    "&:hover": {
      background: theme.primaryBorder,
      transition: "ease 0.2s",
    },
  },
  activeItem: {
    composes: ["item"],
    background: theme.chainBg,
    border: `1px solid ${theme.primaryBrand} !important`,
    transition: "ease 0.2s",
    borderRadius: 16,
    "& div": {
      color: theme.surfacePrimary,
    },
  },
  litem: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    color: theme.secondBrand,
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
  },
  tokenName: {
    fontSize: 16,
    color: theme.secondBrand,
  },
  tokenSymbol: {
    fontSize: 12,
    color: theme.secondBrand,
  },
  itemRight: {
    display: "flex",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: theme.infoSuccess,
  },
  text: {
    color: "#00D395",
    fontSize: 16,
    marginLeft: 7,
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
  content: {
    maxHeight: 485,
    overflowY: "auto",
    padding: "0 16px",
  },
}));

interface IProps {
  visible: boolean;
  onSelectChain: (tokenId: number) => void;
  onCancel: () => void;
}

const ChainList: FC<IProps> = ({ visible, onSelectChain, onCancel }) => {
  const { isMobile } = useAppSelector(state => state.windowWidth);
  const { selectedLP, lpList } = useAppSelector(state => state.lp);
  const classes = useStyles({ isMobile });
  const { chainId } = useWeb3Context();
  const { transferInfo } = useAppSelector(state => state);
  const { chainSource, transferConfig, fromChain, toChain, singleChainList, singleChainSelectIndex, selectedToken } =
    transferInfo;
  const { chains, chain_token } = transferConfig;
  const [chainArr, setChainArr] = useState(chains);
  const [searchText, setSearchText] = useState("");

  const getTitle = () => {
    let title;
    switch (chainSource) {
      case "from":
        title = "Select Source Chain";
        break;
      case "to":
        title = "Select Destination Chain";
        break;
      case "wallet":
        title = "Switch Your Connected Chain";
        break;
      case "SingleChain":
        title = "Select Source Chain";
        break;

      default:
        break;
    }
    return title;
  };

  const getChainId = () => {
    let chainModalId;
    switch (chainSource) {
      case "from":
        chainModalId = fromChain?.id;
        break;
      case "to":
        chainModalId = toChain?.id;
        break;
      case "wallet":
        chainModalId = chainId;
        break;
      case "SingleChain":
        chainModalId = singleChainList[singleChainSelectIndex].from_chain_id;
        break;
      default:
        break;
    }
    return chainModalId;
  };

  const onInputChange = e => {
    setSearchText(e.target.value?.toLowerCase());
  };
  const onEnter = e => {
    setSearchText(e.target.value?.toLowerCase());
  };

  useEffect(() => {
    const localChains = Object.values(NETWORKS);
    const list = chains.filter(item => {
      const chainNameFeatch = item.name.toLowerCase().indexOf(searchText) > -1;
      const chainIdFeatch = item.id.toString().toLowerCase().indexOf(searchText) > -1;
      const filterLocalChains = localChains.filter(localChainItem => localChainItem.chainId === item.id);
      const isFilter = (chainNameFeatch || chainIdFeatch) && filterLocalChains.length > 0;
      return isFilter;
    });

    setChainArr(list);
  }, [chains, searchText, visible]);
  useEffect(() => {
    if (chainSource === "SingleChain") {
      const selectedIdList = singleChainList?.map(item => {
        return item.from_chain_id;
      });
      const list = chains.filter(chain => {
        const isSelected =
          selectedIdList.includes(chain.id) && chain.id !== singleChainList[singleChainSelectIndex]?.from_chain_id;
        if (isSelected) {
          return false;
        }
        const valuyLpList = lpList
          .filter(it => Number(it.chain.id) === Number(chain.id))
          .filter(it => it.token.token.symbol === selectedLP.token.token.symbol)
          .filter(it => it.liquidity > 0);
        const hasLiquidity = valuyLpList.length > 0;
        return hasLiquidity;
      });
      setChainArr(list);
    }
  }, [
    chains,
    singleChainList,
    chainSource,
    singleChainSelectIndex,
    lpList,
    selectedLP,
    visible,
    selectedToken,
    chain_token,
  ]);

  const renderTokenItem = (chain: Chain) => {
    return (
      <List.Item
        className={getChainId() === chain.id ? classes.activeItem : classes.item}
        onClick={() => onSelectChain(chain.id)}
      >
        <div className={classes.litem}>
          <div className={classes.itemLeft}>
            <Avatar size="large" src={chain.icon} />
            <div style={{ marginLeft: 8 }}>
              <div className={classes.tokenName}>{chain.name}</div>
            </div>
          </div>
          {getChainId() === chain.id && chainSource === "wallet" && (
            <div className={classes.itemRight}>
              <div className={classes.dot} />
            </div>
          )}
        </div>
      </List.Item>
    );
  };

  return (
    <Modal
      onCancel={() => onCancel()}
      visible={visible}
      footer={null}
      className={classes.chainModal}
      maskStyle={{ zIndex: 1001 }}
      wrapClassName={classes.chainModalWrap}
      maskClosable={false}
      title={<ActionTitle title={getTitle()} />}
    >
      <div className={classes.card}>
        <div className={classes.search}>
          <Input
            className={classes.searchinput}
            placeholder="Search chain by name or chain ID"
            onChange={onInputChange}
            onPressEnter={onEnter}
            allowClear
            autoFocus={!isMobile}
          />
        </div>
        <div className={classes.content}>
          <List
            itemLayout="horizontal"
            grid={{
              gutter: 16,
              column: isMobile ? 1 : 2,
            }}
            size="small"
            dataSource={chainArr}
            renderItem={renderTokenItem}
            locale={{ emptyText: "No results found." }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ChainList;
