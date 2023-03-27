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

export async function fetchPostJSON(url: any, data?: {}) {
  try {
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data || {}), // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
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
