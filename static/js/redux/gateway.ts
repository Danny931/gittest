import axios from "axios";
import {
  GetTransferConfigsResponse,
  MarkTransferRequest,
  GetTransferStatusRequest,
  GetTransferStatusResponse,
  GetLPInfoListRequest,
  GetLPInfoListResponse,
  MarkLiquidityRequest,
  QueryLiquidityStatusRequest,
  QueryLiquidityStatusResponse,
  TransferHistoryRequest,
  TransferHistoryResponse,
  LPHistoryRequest,
  LPHistoryResponse,
  ClaimWithdrawRewardRequest,
  ClaimRewardDetailsRequest,
  ClaimRewardDetailsResponse,
  RewardingDataRequest,
  RewardingDataResponse,
  GetRetentionRewardsInfoRequest,
  GetRetentionRewardsInfoResponse,
  ClaimRetentionRewardsRequest,
  ClaimRetentionRewardsResponse,
  GetPercentageFeeRebateInfoRequest,
  GetPercentageFeeRebateInfoResponse,
  ClaimPercentageFeeRebateRequest,
  ClaimPercentageFeeRebateResponse,
} from "../constants/type";
// import {
//   Web,
//   EstimateAmtRequest,
//   EstimateAmtResponse,
//   // WithdrawLiquidityRequest,
//   // WithdrawLiquidityResponse,
//   // EstimateWithdrawAmtRequest,
//   // EstimateWithdrawAmtResponse,
// } from "../proto-grpc/sgn/gateway/v1/gateway.pb";
import {
  EstimateWithdrawAmtRequest,
  EstimateWithdrawAmtResponse,
  WithdrawLiquidityRequest,
  WithdrawLiquidityResponse,
} from "../proto/sgn/gateway/v1/gateway_pb";
import { WebClient } from "../proto/sgn/gateway/v1/GatewayServiceClientPb";

/* eslint-disable camelcase */
const preFix = { pathPrefix: process.env.REACT_APP_SERVER_URL }; // 域名
console.log("preFix", preFix);
const client = new WebClient(`${process.env.REACT_APP_GRPC_SERVER_URL}`, null, null);
export const getTransferConfigs = (): Promise<GetTransferConfigsResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/getTransferConfigsForAll`)
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

// export const estimateAmt = (reqParams: EstimateAmtRequest): Promise<EstimateAmtResponse> => {
//   return Web.EstimateAmt(reqParams, preFix);
// };

export const estimateWithdrawAmt = (reqParams: EstimateWithdrawAmtRequest): Promise<EstimateWithdrawAmtResponse> => {
  return client.estimateWithdrawAmt(reqParams, null);
};
export const markTransfer = (params: MarkTransferRequest) => {
  return axios
    .post(`${process.env.REACT_APP_SERVER_URL}/v1/markTransfer`, {
      ...params,
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });
};

export const getTransferStatus = (params: GetTransferStatusRequest): Promise<GetTransferStatusResponse> => {
  return axios
    .post(`${process.env.REACT_APP_SERVER_URL}/v1/getTransferStatus`, {
      ...params,
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });
};

export const getLPInfoList = (reqParams: GetLPInfoListRequest): Promise<GetLPInfoListResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/getLPInfoList`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const checkGetLPInfoList = (reqParams: GetLPInfoListRequest): Promise<GetLPInfoListResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL_CHECK}/v1/getLPInfoList`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

// export const withdrawLiquidity = (params: WithdrawLiquidityRequest): Promise<WithdrawLiquidityResponse> =>
//   axios
//     .post(`${process.env.REACT_APP_SERVER_URL}/v1/withdrawLiquidity`, {
//       ...params,
//     })
//     .then(res => {
//       return res.data;
//     })
//     .catch(e => {
//       console.log("error=>", e);
//     });

export const withdrawLiquidity = (reqParams: WithdrawLiquidityRequest): Promise<WithdrawLiquidityResponse> => {
  return client.withdrawLiquidity(reqParams, null);
};
export const markLiquidity = (params: MarkLiquidityRequest) =>
  axios
    .post(`${process.env.REACT_APP_SERVER_URL}/v1/markLiquidity`, {
      ...params,
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const queryLiquidityStatus = (reqParams: QueryLiquidityStatusRequest): Promise<QueryLiquidityStatusResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/queryLiquidityStatus`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const transferHistory = (reqParams: TransferHistoryRequest): Promise<TransferHistoryResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/transferHistory`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const lpHistory = (reqParams: LPHistoryRequest): Promise<LPHistoryResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/lpHistory`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const checkTransferHistory = (reqParams: TransferHistoryRequest): Promise<TransferHistoryResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL_CHECK}/v1/transferHistory`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const checkLpHistory = (reqParams: LPHistoryRequest): Promise<LPHistoryResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL_CHECK}/v1/lpHistory`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const getStartDate = () =>
  axios
    .get(`https://cbridge-stat.s3.us-west-2.amazonaws.com/mainnet/cbridge-stat.json`)
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const unlockFarmingReward = (params: ClaimWithdrawRewardRequest) =>
  axios
    .post(`${process.env.REACT_APP_SERVER_URL}/v1/unlockFarmingReward`, {
      ...params,
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const getFarmingRewardDetails = (reqParams: ClaimRewardDetailsRequest): Promise<ClaimRewardDetailsResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/getFarmingRewardDetails`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const rewardingData = (reqParams: RewardingDataRequest): Promise<RewardingDataResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/rewardingData`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const getRetentionRewardsInfo = (
  reqParams: GetRetentionRewardsInfoRequest,
): Promise<GetRetentionRewardsInfoResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/getRetentionRewardsInfo`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const claimRetentionRewards = (params: ClaimRetentionRewardsRequest): Promise<ClaimRetentionRewardsResponse> =>
  axios
    .post(`${process.env.REACT_APP_SERVER_URL}/v1/claimRetentionRewards`, {
      ...params,
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const getPercentageFeeRebateInfo = (
  reqParams: GetPercentageFeeRebateInfoRequest,
): Promise<GetPercentageFeeRebateInfoResponse> =>
  axios
    .get(`${process.env.REACT_APP_SERVER_URL}/v1/getFeeRebateInfo`, {
      params: {
        ...reqParams,
      },
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });

export const claimPercentageFeeRebate = (
  params: ClaimPercentageFeeRebateRequest,
): Promise<ClaimPercentageFeeRebateResponse> =>
  axios
    .post(`${process.env.REACT_APP_SERVER_URL}/v1/claimFeeRebate`, {
      ...params,
    })
    .then(res => {
      return res.data;
    })
    .catch(e => {
      console.log("error=>", e);
    });
