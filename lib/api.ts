import { URL } from 'next/dist/compiled/@edge-runtime/primitives/url';

const API_URL = process.env.NEXT_PUBLIC_DRAGONFLY_PUBLIC_API;

export async function get(url: URL) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
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
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
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

export async function patch(url: URL, data = {}) {
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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

interface clusterPagingData {
  page?: number;
  per_page?: number;
  name?: string;
}

export async function listCluster(data?: clusterPagingData) {
  const queryString = data
    ? Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
        .join('&')
    : '';
  const url = new URL(`/api/v1/clusters${queryString ? '?' : ''}${queryString}`, API_URL);
  return await get(url);
}

export async function getCluster(id: string) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await get(url);
}

interface clusterData {
  name: string;
  peer_cluster_config: {
    concurrent_piece_count: number;
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
  };
  seed_peer_cluster_config: {
    load_limit: number;
  };
  bio: string;
  is_default: boolean;
  scopes: {
    cidrs: Array<string>;
    idc: string;
    location: string;
  };
}

export async function createCluster(data: clusterData) {
  const url = new URL('/api/v1/clusters', API_URL);
  return await post(url, data);
}

interface updateClusterData {
  is_default: boolean;
  bio: string;
  peer_cluster_config: {
    concurrent_piece_count: number;
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
  };
  scopes: {
    cidrs: Array<string>;
    idc: string;
    location: string;
  };
  seed_peer_cluster_config: {
    load_limit: number;
  };
}

export async function updateCluster(id: string, data: updateClusterData) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await patch(url, data);
}

export async function deleteCluster(id: string) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await Delete(url);
}

export async function listScheduler() {
  const url = new URL(`/api/v1/schedulers`, API_URL);
  return await get(url);
}

export async function getScheduler(id: string) {
  const url = new URL(`/api/v1/schedulers?scheduler_cluster_id=${id}`, API_URL);
  return await get(url);
}

export async function deleteSchedulerID(id: string) {
  const url = new URL(`api/v1/schedulers/${id}`, API_URL);
  return await Delete(url);
}

export async function getSchedulerID(id: string) {
  const url = new URL(`/api/v1/schedulers/${id}`, API_URL);
  return await get(url);
}

export async function getSeedPeerID(id: string) {
  const url = new URL(`/api/v1/seed-peers/${id}`, API_URL);
  return await get(url);
}

export async function listSeedPeer() {
  const url = new URL(`/api/v1/seed-peers`, API_URL);
  return await get(url);
}

export async function getSeedPeer(id: string) {
  const url = new URL(`/api/v1/seed-peers?seed_peer_cluster_id=${id}`, API_URL);
  return await get(url);
}

export async function deleteSeedPeerID(id: string) {
  const url = new URL(`api/v1/seed-peers/${id}`, API_URL);
  return await Delete(url);
}

export async function listUsers() {
  const url = new URL(`/api/v1/users`, API_URL);
  return await get(url);
}

export async function getUser(id: string) {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  return await get(url);
}

export async function getUserRoles(id: string) {
  const url = new URL(`/api/v1/users/${id}/roles`, API_URL);
  return await get(url);
}

interface updateUserData {
  bio: string;
  email: string;
  location: string;
  phone: string;
}

export async function updateUser(id: string, data: updateUserData) {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  return await patch(url, data);
}

interface updatePassworData {
  old_password: string;
  new_password: string;
}

export async function updatePassword(id: string, data: updatePassworData) {
  const url = new URL(`/api/v1/users/${id}/reset_password`, API_URL);
  return await post(url, data);
}

export async function deleteGuest(id: string) {
  const url = new URL(`api/v1/users/${id}/roles/guest`, API_URL);
  return await Delete(url);
}

export async function deleteRoot(id: string) {
  const url = new URL(`api/v1/users/${id}/roles/root`, API_URL);
  return await Delete(url);
}

export async function putRoot(id: string) {
  const url = new URL(`api/v1/users/${id}/roles/root`, API_URL);
  return await put(url);
}

export async function putGuest(id: string) {
  const url = new URL(`api/v1/users/${id}/roles/guest`, API_URL);
  return await put(url);
}
