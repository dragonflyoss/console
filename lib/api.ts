import { URL } from 'next/dist/compiled/@edge-runtime/primitives/url';

const API_URL = process.env.NEXT_PUBLIC_DRAGONFLY_PUBLIC_API;

export async function get(url: string | URL) {
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

export async function post(url: string | URL, data: any) {
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
  const url = new URL('/api/v1/users/signin', API_URL);
  const data = await post(url, params);
  return data;
}

export async function signUp(params: any) {
  const url = new URL('/api/v1/users/signup', API_URL);
  const data = await post(url, params);
  return data;
}
