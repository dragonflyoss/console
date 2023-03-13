import { LOCAL_URL } from './constans';
interface Param {
  [key: string]: any;
}
interface HttpParams {
  methods: 'POST' | 'GET';
  url: string;
  type?: 'SERVER_RENDER' | 'HTTP';
  param?: Param;
}
const request: (param: HttpParams) => Promise<any> = (param) => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        const token = localStorage.getItem('Token');
        let body = {};
        if (token) {
          body = Object.assign(param?.param || {}, { token });
        }

        const res = await fetch(
          `${param.type === 'SERVER_RENDER' ? LOCAL_URL : process.env.NEXT_PUBLIC_API}${param.url}`,
          {
            method: param.methods,
            body: JSON.stringify(body),
          },
        );
        const data = await res.json();
        // console.log(data)
        if (data.code === 200) {
          resolve(data?.data || {});
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
  get: (url: string, param: Param) => request({ methods: 'GET', url, type: 'SERVER_RENDER', param }),
  post: (url: string, param: Param) => request({ methods: 'POST', url, type: 'SERVER_RENDER' }),
};
export const http = {
  get: (url: string, param: Param) => request({ methods: 'GET', url, type: 'HTTP', param }),
  post: (url: string, param: Param) => request({ methods: 'POST', url, type: 'HTTP', param }),
};
