import { RequestConfig } from 'umi';

export const request: RequestConfig = {
  errorConfig: {
    adaptor: (resData, ctx) => {
      const { res } = ctx;
      return {
        ...resData,
        errorCode: res.status,
        success: res.ok,
        error: resData.errors,
        errorMessage: resData.errors,
      };
    },
  },
};
