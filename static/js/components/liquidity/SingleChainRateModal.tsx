/* eslint-disable camelcase */
import { Tooltip, Input, Row, Col } from "antd";
import { InfoCircleOutlined, WarningFilled } from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { useState } from "react";
import { Theme } from "../../theme";
import { setSingleChainRate } from "../../redux/transferSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const RateModal = ({ onCancle, source }) => {
  const useStyles = createUseStyles((theme: Theme) => ({
    ratemodal: {
      position: "relative",
    },
    ratemodalwarp: {
      position: "fixed",
      width: "100vw",
      height: "100vh",
      top: 0,
      left: 0,
      zIndex: 20,
    },
    rateBody: {
      padding: "32px 16px",
      border: `1px solid ${theme.primaryBorder}`,
      borderRadius: 16,
      zIndex: 1001,
      top: source === "transfer" ? 32 : -176,
      right: source === "transfer" ? 0 : -18,
      position: "absolute",
      backgroundColor: theme.secondBackground,
    },
    title: {
      fontSize: 12,
      fontWeight: 600,
      color: theme.surfacePrimary,
      marginBottom: 24,
    },
    unableBtn: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "16px",
      fontSize: 14,
      fontWeight: 600,
      background: theme.primaryUnable,
      color: theme.secondBrand,
      textAlign: "center",
      cursor: "pointer",
      height: 48,
    },
    activeBtn: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "16px",
      fontSize: 14,
      fontWeight: 600,
      background: theme.primaryBrand,
      color: theme.unityWhite,
      textAlign: "center",
      cursor: "pointer",
      height: 48,
    },
    content: {
      display: "flex",
      alignItems: "center",
    },
    rateInput: {
      backgroundColor: "transparent",
      height: 48,
      borderRadius: 16,
      fontSize: 14,
      color: theme.surfacePrimary,
      borderColor: "#d9d9d9",
      textAlign: "right",
      "& input": {
        backgroundColor: "transparent",
        textAlign: "right",
        color: theme.surfacePrimary,
      },
    },
    activeRateInput: {
      backgroundColor: "transparent",
      height: 48,
      borderRadius: 16,
      fontSize: 14,
      color: theme.surfacePrimary,
      borderColor: theme.primaryBrand,
      textAlign: "right",
      "& input": {
        backgroundColor: "transparent",
        textAlign: "right",
        color: theme.surfacePrimary,
      },
    },
    inputBtn: {
      position: "relative",
    },
    extra: {
      position: "absolute",
      top: 17,
      right: 10,
      color: theme.surfacePrimary,
      fontSize: 14,
    },
    desc: {
      fontSize: 12,
      color: theme.infoWarning,
      marginTop: 10,
    },
    errorDesc: {
      fontSize: 12,
      color: theme.infoDanger,
      marginTop: 10,
    },
    warimg: {
      position: "absolute",
      top: 13,
      left: 10,
    },
  }));
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { transferInfo } = useAppSelector(state => state);
  const { singleChainRate } = transferInfo;
  const [type, setType] = useState(
    singleChainRate !== "1" && singleChainRate !== "3" && singleChainRate !== "5" ? "num" : singleChainRate,
  );
  const [num, setNum] = useState(singleChainRate);
  const setInfo = val => {
    if (Number(val) >= 0.5) {
      dispatch(setSingleChainRate(val));
    }
  };

  const onTypeChange = val => {
    setType(val);
    setNum(val);
    setInfo(val);
  };
  const onInputChange = val => {
    const reg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{0,3})?$/;
    if (val && !reg.test(val)) {
      return;
    }
    setNum(val);
    // dispatch(setSingleChainRate(val));
  };
  const { isMobile } = useAppSelector(state => state.windowWidth);
  return (
    <div className={classes.ratemodal}>
      <div className={classes.rateBody}>
        <div className={classes.title}>
          <Tooltip
            title={
              <span>
                <span>
                  The transaction will be reverted if the cross-chain liquidity transfer rate moves unfavorably by your
                  slippage tolerance.
                </span>
              </span>
            }
            placement={isMobile ? "bottom" : "right"}
            color="#fff"
            overlayInnerStyle={{ color: "#000" }}
          >
            <span>
              Slippage Tolerance
              <InfoCircleOutlined style={{ fontSize: 13, marginLeft: 6 }} />
            </span>
          </Tooltip>
        </div>
        <Row gutter={[6, 6]} style={{ width: isMobile ? "86vw" : 442 }}>
          <Col xs={5} sm={4} md={12} lg={5} xl={5}>
            <div
              className={type === "1" ? classes.activeBtn : classes.unableBtn}
              onClick={() => {
                onTypeChange("1");
              }}
            >
              1%
            </div>
          </Col>
          <Col xs={5} sm={4} md={12} lg={5} xl={5}>
            <div
              className={type === "3" ? classes.activeBtn : classes.unableBtn}
              onClick={() => {
                onTypeChange("3");
              }}
            >
              3%
            </div>
          </Col>
          <Col xs={5} sm={4} md={8} lg={5} xl={5}>
            <div
              className={type === "5" ? classes.activeBtn : classes.unableBtn}
              onClick={() => {
                onTypeChange("5");
              }}
            >
              5%
            </div>
          </Col>
          <Col xs={9} sm={4} md={16} lg={9} xl={9}>
            <div className={classes.inputBtn}>
              <Input
                // controls={false}
                className={type === "num" ? classes.activeRateInput : classes.rateInput}
                size="large"
                type="number"
                suffix="%"
                onFocus={() => {
                  setType("num");
                }}
                value={num || undefined}
                onChange={e => {
                  onInputChange(e.target.value);
                }}
                onBlur={e => {
                  setInfo(e.target.value);
                }}
              />
              {Number(num) < 0.5 && (
                <div className={classes.warimg}>
                  <WarningFilled style={{ fontSize: 20, marginRight: 5, color: "#fc5656" }} />
                </div>
              )}
              {Number(num) >= 0.5 && Number(num) < 1 && (
                <div className={classes.warimg}>
                  <WarningFilled style={{ fontSize: 20, marginRight: 5, color: "#ff8f00" }} />
                </div>
              )}
            </div>
          </Col>
        </Row>
        {Number(num) < 0.5 && (
          <div className={classes.errorDesc}>The slippage tolerance should be greater than 0.5%.</div>
        )}
        {Number(num) >= 0.5 && Number(num) < 1 && (
          <div className={classes.desc}>
            Slippage tolerance is too low. Your transaction might fail with high probability.
          </div>
        )}
      </div>
      <div
        className={classes.ratemodalwarp}
        onClick={e => {
          e.stopPropagation();
          onCancle();
        }}
      />
    </div>
  );
};

export default RateModal;
