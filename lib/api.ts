import { URL } from 'next/dist/compiled/@edge-runtime/primitives/url';

const API_URL = process.env.NEXT_PUBLIC_DRAGONFLY_PUBLIC_API;

export async function get(url: any) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
    });
    return await response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function post(url: URL, data = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });
    return await response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function patch(url: URL, data: any) {
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });
    return await response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function Delete(url: URL) {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function put(url: URL) {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response;
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

export async function signOut() {
  const url = new URL('/api/v1/users/signout', API_URL);
  return await post(url);
}

export async function listCluster() {
  const url = new URL(`/api/v1/clusters`, API_URL);
  return await get(url);
}

export async function getClusterSearch(params: any) {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join('&');
  const url = new URL(`/api/v1/clusters?${queryString}`, API_URL);
  return await get(url);
}

export async function createCluster(data: any) {
  const url = new URL('/api/v1/clusters', API_URL);
  return await post(url, data);
}

export async function updateCluster(id: any, data: any) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await patch(url, data);
}

export async function deleteCluster(id: any) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await Delete(url);
}

export async function getClusterInformation(id: any) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await get(url);
}

export async function listScheduler() {
  const url = new URL(`/api/v1/schedulers`, API_URL);
  return await get(url);
}

export async function getScheduler(id: any) {
  const url = new URL(`/api/v1/schedulers?scheduler_cluster_id=${id}`, API_URL);
  return await get(url);
}

export async function deleteSchedulerID(id: any) {
  const url = new URL(`api/v1/schedulers/${id}`, API_URL);
  return await Delete(url);
}

export async function getSchedulerID(id: any) {
  const url = new URL(`/api/v1/schedulers/${id}`, API_URL);
  return await get(url);
}

export async function getSeedPeerID(id: any) {
  const url = new URL(`/api/v1/seed-peers/${id}`, API_URL);
  return await get(url);
}

export async function listSeedPeer() {
  const url = new URL(`/api/v1/seed-peers`, API_URL);
  return await get(url);
}

export async function getSeedPeer(id: any) {
  const url = new URL(`/api/v1/seed-peers?seed_peer_cluster_id=${id}`, API_URL);
  return await get(url);
}

export async function deleteSeedPeerID(id: any) {
  const url = new URL(`api/v1/seed-peers/${id}`, API_URL);
  return await Delete(url);
}

export async function listUsers() {
  const url = new URL(`/api/v1/users`, API_URL);
  return await get(url);
}

export async function getUsersInfo(id: any) {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  return await get(url);
}

export async function getuserRoles(id: any) {
  const url = new URL(`/api/v1/users/${id}/roles`, API_URL);
  return await get(url);
}

export async function updateUserInfo(id: any, data: any) {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  return await patch(url, data);
}

export async function updatePassword(id: any, data: any) {
  const url = new URL(`/api/v1/users/${id}/reset_password`, API_URL);
  return await post(url, data);
}

export async function deleteGuest(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/guest`, API_URL);
  return await Delete(url);
}

export async function deleteRoot(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/root`, API_URL);
  return await Delete(url);
}

export async function putRoot(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/root`, API_URL);
  return await put(url);
}

export async function putGuest(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/guest`, API_URL);
  return await put(url);
}
