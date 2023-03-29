import { URL } from 'next/dist/compiled/@edge-runtime/primitives/url';

const API_URL = process.env.NEXT_PUBLIC_DRAGONFLY_PUBLIC_API;

export async function get(url: URL) {
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

export async function post(url: URL, data: any) {
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

interface signinData {
  name: string;
  password: string;
}

export async function signIn(data: signinData) {
  const url = new URL('/api/v1/users/signin', API_URL);
  return await post(url, data);
}

interface signupData {
  name: string;
  password: string;
  email: string;
}

export async function signUp(data: signupData) {
  const url = new URL('/api/v1/users/signup', API_URL);
  return await post(url, data);
}
