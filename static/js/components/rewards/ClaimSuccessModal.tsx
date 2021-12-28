import { Modal, Button } from "antd";
import { createUseStyles } from "react-jss";
import { Theme } from "../../theme";
import arrTop from "../../images/arrTop.svg";
import { getNetworkById } from "../../constants/network";

const useStyles = createUseStyles((theme: Theme) => ({
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  modalTopIcon: {
    fontSize: 16,
    fontWeight: 600,
    width: "100%",
    textAlign: "center",
    paddingTop: 30,
    marginBottom: 55,
  },
  modaldes: {
    color: theme.surfacePrimary,
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
    margin: "0px 20px 10px 20px ",
  },
  noteview: {
    fontSize: 14,
    fontWeight: 500,
    // color: theme.surfacePrimary,
    textAlign: "center",
    margin: "0px 0 0 0 ",
    cursor: "pointer",
  },
  descMessage: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.surfacePrimary,
    textAlign: "center",
    margin: "25px 0 0 0 ",
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
let detailInter;
export interface ClaimSuccessModalProps {
  modaldes: string;
  txHash: string;
  onClose: () => void;
}
export default function ClaimSuccessModal({ modaldes, txHash, onClose }: ClaimSuccessModalProps): JSX.Element {
  const classes = useStyles();

  const closeModal = () => {
    clearInterval(detailInter);
    onClose();
  };

  const content = (
    <div>
      <div className={classes.modalTopIcon} style={{ marginTop: 0 }}>
        <img src={arrTop} height="90" alt="" />
      </div>
      <div className={classes.modaldes}>
        {modaldes && modaldes.length > 0 ? modaldes : "Your request has been submitted"}
      </div>
      <div className={classes.noteview}>
        <a
          href={getNetworkById(Number(process.env.REACT_APP_BSC_ID)).blockExplorerUrl + "/tx/" + txHash}
          target="_blank"
          rel="noreferrer"
        >
          View in Explorer
        </a>
      </div>
      <div className={classes.descMessage}>Please allow a few minutes to receive the rewards.</div>

      <Button
        type="primary"
        size="large"
        block
        onClick={() => {
          closeModal();
        }}
        className={classes.button}
      >
        Done
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
