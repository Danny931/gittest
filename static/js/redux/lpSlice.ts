import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LPList, LPInfo } from "../constants/type";

/* eslint-disable camelcase */
/* eslint-disable no-debugger */

interface LPIState {
  lpList: LPList;
  selectedLP: LPInfo;
}

const initialState: LPIState = {
  lpList: [],
  selectedLP: {
    key: "0",
    chain: {
      id: 0,
      name: "",
      icon: "",
      block_delay: 0,
      gas_token_symbol: "",
      explore_url: "",
      rpc_url: "",
      contract_addr: "",
    },
    token: {
      token: {
        symbol: "",
        address: "",
        decimal: 0,
        xfer_disabled: false,
      },
      name: "",
      icon: "",
      max_amt: "",
    },
    liquidity: 0,
    liquidity_amt: "",
    total_liquidity: 0,
    total_liquidity_amt: "",
    has_farming_sessions: false,
    lp_fee_earning: 0,
    farming_reward_earning: 0,
    volume_24h: 0,
    lp_fee_earning_apy: 0,
    farming_apy: 0,
    farming_session_tokens: [],
  },
};

const lpSlice = createSlice({
  name: "lp",
  initialState,
  reducers: {
    setLPList: (state, { payload }: PayloadAction<LPList>) => {
      const newList = payload?.map((item, i) => {
        item.key = i.toString();
        return item;
      });
      state.lpList = newList;
    },
    setSelectedLP: (state, { payload }: PayloadAction<LPInfo>) => {
      state.selectedLP = payload;
    },
  },
});

export const { setLPList, setSelectedLP } = lpSlice.actions;

export default lpSlice.reducer;
