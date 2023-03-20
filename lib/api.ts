interface Param {
  [key: string]: any;
}
interface HttpParams {
  methods: 'POST' | 'GET';
  url: string;
  type?: 'SERVER_RENDER' | 'HTTP';
  requestParam?: Param;
}
const request: (param: HttpParams) => Promise<any> = (param) => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        // token
        const token = localStorage.getItem('Token');
        //post
        let body = param?.requestParam;
        if (token) {
          body = Object.assign(param?.requestParam || {}, { token });
        }
        //get
        let bodyStr = '';
        Object.keys(body || {}).forEach((key) => {
          bodyStr += `${bodyStr ? `&` : `?`}${key}=${body?.[key]}`;
        });
        //Request Path Prefix
        let requestUrl = `${param.type === 'SERVER_RENDER' ? process.env.NEXT_PUBLIC_LOCAL_API : process.env.NEXT_PUBLIC_API}${param.url}`;
        //Get Method Splice Request Parameters
        param.methods === 'GET' && (requestUrl += bodyStr);
        const res = await fetch(requestUrl, {
          method: param.methods,
          body: param.methods === 'POST' ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (data.code === 200) {
          resolve(data || {});
        } else {
          reject('error' || '');
        }
      })();
    } catch (err) {
      reject(err);
    }
  });
};
export const renderHttp = {
  get: (url: string, requestParam: Param) => request({ methods: 'GET', url, type: 'SERVER_RENDER', requestParam }),
  post: (url: string, requestParam: Param) => request({ methods: 'POST', url, type: 'SERVER_RENDER', requestParam }),
};
export const http = {
  get: (url: string, requestParam: Param) => request({ methods: 'GET', url, type: 'HTTP', requestParam }),
  post: (url: string, requestParam: Param) => request({ methods: 'POST', url, type: 'HTTP', requestParam }),
};
