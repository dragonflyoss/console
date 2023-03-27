import { URL } from 'next/dist/compiled/@edge-runtime/primitives/url';

const API_URL = process.env.DRAGONFLY_PUBLIC_API;

export async function fetchGetJSON(url: string) {
  try {
    const data = await fetch(url).then((res) => res.json());
    return data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function fetchPostJSON(url: RequestInfo | URL, data?: {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });
    return await response.json();
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function signIn(params: any) {
  const url = new URL('/users/signin', API_URL);
  const data = await fetchPostJSON(url, params);
  return data;
}

export async function signUp(params: any) {
  const url = new URL('/users/signup', API_URL);
  const data = await fetchPostJSON(url, params);
  return data;
}
