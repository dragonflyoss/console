import { RequestConfig } from 'umi';

export const request: RequestConfig = {
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: resData.ok,
        errorMessage: resData.errors,
      };
    },
  },
};
