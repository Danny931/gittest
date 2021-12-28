import { Modal, Button } from "antd";
import { ButtonType } from "antd/lib/button";
import { createUseStyles } from "react-jss";
import { WarningFilled } from "@ant-design/icons";
import { useAppSelector } from "../../redux/store";
import { Theme } from "../../theme";
import { switchChain } from "../../redux/transferSlice";
import { getNetworkById } from "../../constants/network";

const useStyles = createUseStyles((theme: Theme) => ({
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    marginTop: 40,
    height: 56,
    lineHeight: "42px",
    background: theme.primaryBrand,
    borderRadius: 16,
    fontSize: 18,
    fontWeight: 700,
  },
  modaldes: {
    color: theme.surfacePrimary,
    marginTop: 40,
    fontSize: 15,
    textAlign: "center",
  },
  modaldes2: {
    color: theme.surfacePrimary,
    marginTop: 30,
    fontSize: 18,
    textAlign: "center",
  },
  unlockModal: {
    border: `1px solid ${theme.primaryBackground}`,
    "& .ant-modal-content": {
      background: theme.secondBackground,
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

export interface SwitchChainModalProps {
  showModal: boolean;
  claimTitle: string
  onClose: () => void;
}
export default function SwitchChainModal({ claimTitle, onClose }: SwitchChainModalProps): JSX.Element {
  const classes = useStyles();
  const { windowWidth } = useAppSelector(state => state);
  const { isMobile } = windowWidth;

  const closeModal = () => {
    onClose();
  };

  const buttonType: ButtonType = "primary";
  const content = (
    <div>
      <div style={{ textAlign: "center" }}>
        <WarningFilled style={{ fontSize: 50, color: "#ffaa00", marginTop: 40 }} />
      </div>
      <div className={classes.modaldes}>
        Please switch to {getNetworkById(Number(process.env.REACT_APP_BSC_ID)).name} to claim the {claimTitle}
      </div>
      <Button
        type={buttonType}
        size="large"
        block
        onClick={() => {
          if (!isMobile) {
            switchChain(Number(process.env.REACT_APP_BSC_ID), "");
          } else {
            closeModal();
          }
        }}
        className={classes.button}
      >
        OK
      </Button>
    </div>
  );
  const titleText = " ";

  return (
    <Modal title={titleText} width={512} onCancel={closeModal} visible footer={null} className={classes.unlockModal}>
      {content}
    </Modal>
  );
}
