const API_URL = process.env.NEXT_PUBLIC_LOCAL_API;

async function fetchAPI(url = '', data: any = {}, type = 'GET') {
  const headers = { 'Content-Type': 'application/json' };
  type = type.toUpperCase();
  url = API_URL + url;

  if (type == 'GET') {
    let dataStr = '';
    Object.keys(data || {}).forEach((key) => {
      dataStr += key + '=' + data[key] + '&';
    });
    if (dataStr !== '') {
      dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
      url = url + '?' + dataStr;
    }
  }

  const requestConfig: any = {
    method: type,
    headers: headers,
    mode: 'cors',
  };

  if (type == 'POST') {
    Object.defineProperty(requestConfig, 'body', {
      value: JSON.stringify(data),
    });
  }

  try {
    const response = await fetch(url, requestConfig);
    const res = await response.json();
    return res;
  } catch (error) {
    throw new Error('Failed to fetch API');
  }
}

export async function signIn(params: any) {
  const data = await fetchAPI('/users/signin', params, 'POST');
  return data;
}

export async function signUp(params: any) {
  const data = await fetchAPI('/users/signup', params, 'POST');
  return data;
}
