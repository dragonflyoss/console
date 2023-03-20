
interface Param {
  [key: string]: any;
}
interface HttpParams {
  methods: 'POST' | 'GET';
  url: string;
  type?: 'SERVER_RENDER' | 'HTTP';
  requestParam?: Param;
}
//封装请求，服务端请求与本地请求都用这个
const request: (param: HttpParams) => Promise<any> = (param) => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        // token:用户登陆信息
        const token = localStorage.getItem('Token');
        //post请求体
        let body = param?.requestParam;
        if (token) {
          body = Object.assign(param?.requestParam || {}, { token });
        }
        //get请求参数
        let bodyStr = '';
        Object.keys(body || {}).forEach((key) => {
          bodyStr += `${bodyStr ? `&` : `?`}${key}=${body?.[key]}`;
        });
        //请求路径前缀
        let requestUrl = `${param.type === 'SERVER_RENDER' ? process.env.NEXT_PUBLIC_LOCAL_API : process.env.NEXT_PUBLIC_API}${param.url}`;
        //get方式拼接请求参数
        param.methods === 'GET' && (requestUrl += bodyStr);

        const res = await fetch(requestUrl, {
          method: param.methods,
          body: param.methods === 'POST' ? JSON.stringify(body) : undefined,
          // body: param.methods === 'POST' ? JSON.stringify(body) : undefined,
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
