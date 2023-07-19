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
export async function getClusters() {
  const url = new URL(`/api/v1/clusters`, API_URL);
  return await get(url);
}
export async function getClustersSearch(params: any) {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
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
export async function DeleteCluster(id: any) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await Delete(url);
}

export async function getInformation(id: any) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await get(url);
}

export async function GetScheduler() {
  const url = new URL(`/api/v1/schedulers`, API_URL);
  return await get(url);
}
export async function GetSchedulerID(id: any) {
  const url = new URL(`/api/v1/schedulers?scheduler_cluster_id=${id}`, API_URL);
  return await get(url);
}
export async function DeleteSchedulerID(id: any) {
  const url = new URL(`api/v1/schedulers/${id}`, API_URL);
  return await Delete(url);
}
export async function GetSeedPeer() {
  const url = new URL(`/api/v1/seed-peers`, API_URL);
  return await get(url);
}

export async function GetSeedPeerID(id: any) {
  const url = new URL(`/api/v1/seed-peers?seed_peer_cluster_id=${id}`, API_URL);
  return await get(url);
}
export async function DeleteSeedPeerID(id: any) {
  const url = new URL(`api/v1/seed-peers/${id}`, API_URL);
  return await Delete(url);
}
export async function Getusers() {
  const url = new URL(`/api/v1/users`, API_URL);
  return await get(url);
}
export async function GetusersInfo(id: any) {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  return await get(url);
}

export async function GetuserRoles(id: any) {
  const url = new URL(`/api/v1/users/${id}/roles`, API_URL);
  return await get(url);
}

export async function ChangeUser(id: any, data: any) {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  return await patch(url, data);
}

export async function ResetPassword(id: any, data: any) {
  const url = new URL(`/api/v1/users/${id}/reset_password`, API_URL);
  return await post(url, data);
}

export async function GetSchedulers(id: any) {
  const url = new URL(`/api/v1/schedulers/${id}`, API_URL);
  return await get(url);
}

export async function GetSeedPeers(id: any) {
  const url = new URL(`/api/v1/seed-peers/${id}`, API_URL);
  return await get(url);
}

export async function DeleteGuest(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/guest`, API_URL);
  return await Delete(url);
}
export async function DeleteRoot(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/root`, API_URL);
  return await Delete(url);
}
export async function PutRoot(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/root`, API_URL);
  return await put(url);
}

export async function PutGuest(id: any) {
  const url = new URL(`api/v1/users/${id}/roles/guest`, API_URL);
  return await put(url);
}
