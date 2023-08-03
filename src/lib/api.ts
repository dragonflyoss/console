import parseLinkHeader from 'parse-link-header';
import queryString from 'query-string';

const API_URL = process.env.REACT_APP_API_URL || window.location.href;

export async function get(url: URL) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.statusText);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function post(url: URL, request = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request || {}),
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.statusText);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function patch(url: URL, request = {}) {
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request || {}),
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.statusText);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function destroy(url: URL) {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.statusText);
    }
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

    if (response.status === 200) {
      return response;
    } else {
      throw new Error(response.statusText);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

interface signInRequset {
  name: string;
  password: string;
}

interface signInResponse {
  expire: string;
  token: string;
}

export async function signIn(request: signInRequset): Promise<signInResponse> {
  const url = new URL('/api/v1/users/signin', API_URL);
  const response = await post(url, request);
  return await response.json();
}

interface signUpRequset {
  name: string;
  password: string;
  email: string;
}

interface signUpResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  email: string;
  name: string;
  avatar: string;
  phone: string;
  state: string;
  location: string;
  bio: string;
  configs: string;
}

export async function signUp(request: signUpRequset): Promise<signUpResponse> {
  const url = new URL('/api/v1/users/signup', API_URL);
  const response = await post(url, request);
  return await response.json();
}

export async function signOut() {
  const url = new URL('/api/v1/users/signout', API_URL);
  return await post(url);
}

interface getClustersParams {
  page?: number;
  per_page?: number;
  name?: string;
}

interface clustersResponse {
  id: number;
  name: string;
  scopes: {
    idc: string;
    location: string;
    cidrs: Array<string>;
  };
  created_at: string;
  is_default: boolean;
}

interface getClustersResponse {
  data: clustersResponse[];
  total_page?: number;
}

export async function getClusters(params?: getClustersParams): Promise<getClustersResponse> {
  const query = params ? queryString.stringify({ ...params }) : '';
  const url = new URL(`/api/v1/clusters${query ? '?' : ''}${query}`, API_URL);

  const response = await get(url);
  const data = await response.json();
  const linkHeader = response.headers.get('link');
  const links = parseLinkHeader(linkHeader);
  const totalPage = Number(links?.last?.page || 1);
  const responses = { data: data, total_page: totalPage };

  return responses;
}

interface getClusterResponse {
  id: number;
  name: string;
  bio: string;
  scopes: {
    idc: string;
    location: string;
    cidrs: Array<string>;
  };
  scheduler_cluster_id: number;
  seed_peer_cluster_id: number;
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
  };
  seed_peer_cluster_config: {
    load_limit: number;
  };
  peer_cluster_config: {
    load_limit: number;
    concurrent_piece_count: number;
  };
  created_at: string;
  updated_at: string;
  is_default: boolean;
}

export async function getCluster(id: string): Promise<getClusterResponse> {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface createClusterRequest {
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

interface createClusterResponse {
  id: string;
  name: string;
  peer_cluster_config: {
    concurrent_piece_count: number;
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
  };
  scheduler_cluster_id?: number;
  seed_peer_cluster_id?: number;
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

export async function createCluster(request: createClusterRequest): Promise<createClusterResponse> {
  const url = new URL('/api/v1/clusters', API_URL);
  const response = await post(url, request);
  return response.json();
}

interface updateClusterRequset {
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

interface updateClusterResponse {
  id: string;
  name: string;
  peer_cluster_config: {
    concurrent_piece_count: number;
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
  };
  scheduler_cluster_id?: number;
  seed_peer_cluster_id?: number;
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

export async function updateCluster(id: string, request: updateClusterRequset): Promise<updateClusterResponse> {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  const response = await patch(url, request);
  return response.json();
}

export async function deleteCluster(id: string) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await destroy(url);
}

interface getSchedulerParmas {
  scheduler_cluster_id?: string;
}

interface schedulersResponse {
  id: number;
  host_name: string;
  ip: string;
  scheduler_cluster_id: number;
  port: string;
  state: string;
  idc: string;
  features: Array<string>;
  location: string;
  created_at: string;
  updated_at: string;
}

type getSchedulersResponse = schedulersResponse[];

export async function getSchedulers(params?: getSchedulerParmas): Promise<getSchedulersResponse> {
  const query = params ? queryString.stringify({ ...params }) : '';
  const url = new URL(`/api/v1/schedulers${query ? '?' : ''}${query}`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface getSchedulerResponse {
  id: number;
  host_name: string;
  ip: string;
  scheduler_cluster_id: number;
  port: string;
  state: string;
  idc: string;
  features: Array<string>;
  location: string;
  created_at: string;
  updated_at: string;
}

export async function getScheduler(id: string): Promise<getSchedulerResponse> {
  const url = new URL(`/api/v1/schedulers/${id}`, API_URL);
  const response = await get(url);
  return await response.json();
}

export async function deleteScheduler(id: string) {
  const url = new URL(`api/v1/schedulers/${id}`, API_URL);
  return await destroy(url);
}

interface getSeedPeersParmas {
  seed_peer_cluster_id?: string;
}

interface seedPeersResponse {
  id: number;
  host_name: string;
  ip: string;
  port: string;
  download_port: string;
  object_storage_port: string;
  type: string;
  state: string;
  idc: string;
  location: string;
  created_at: string;
  updated_at: string;
  seed_peer_cluster_id: number;
}

type getSeedPeersResponse = seedPeersResponse[];

export async function getSeedPeers(params?: getSeedPeersParmas): Promise<getSeedPeersResponse> {
  const query = params ? queryString.stringify({ ...params }) : '';
  const url = new URL(`/api/v1/seed-peers${query ? '?' : ''}${query}`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface getSeedPeerResponse {
  id: number;
  host_name: string;
  ip: string;
  port: string;
  download_port: string;
  object_storage_port: string;
  type: string;
  state: string;
  idc: string;
  location: string;
  created_at: string;
  updated_at: string;
  seed_peer_cluster_id: number;
}

export async function getSeedPeer(id: string): Promise<getSeedPeerResponse> {
  const url = new URL(`/api/v1/seed-peers/${id}`, API_URL);
  const response = await get(url);
  return await response.json();
}

export async function deleteSeedPeer(id: string) {
  const url = new URL(`api/v1/seed-peers/${id}`, API_URL);
  return await destroy(url);
}

interface userResponse {
  avatar: string;
  id: number;
  email: string;
  name: string;
  state: string;
  location: string;
}

type getUsersResponse = userResponse[];

export async function getUsers(): Promise<getUsersResponse> {
  const url = new URL(`/api/v1/users`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface getUserResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: 0;
  email: string;
  name: string;
  avatar: string;
  phone: string;
  state: string;
  location: string;
  bio: string;
}

export async function getUser(id: string): Promise<getUserResponse> {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  const response = await get(url);
  return await response.json();
}

export async function getUserRoles(id: string): Promise<string[]> {
  const url = new URL(`/api/v1/users/${id}/roles`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface updateUserRequset {
  bio: string;
  email: string;
  location: string;
  phone: string;
}

interface updateUserResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  email: string;
  name: string;
  avatar: string;
  phone: string;
  state: string;
  location: string;
  bio: string;
  configs: string;
}

export async function updateUser(id: string, request: updateUserRequset): Promise<updateUserResponse> {
  const url = new URL(`/api/v1/users/${id}`, API_URL);
  const response = await patch(url, request);
  return response.json();
}

interface updatePasswordRequset {
  old_password: string;
  new_password: string;
}

export async function updatePassword(id: string, request: updatePasswordRequset) {
  const url = new URL(`/api/v1/users/${id}/reset_password`, API_URL);
  return await post(url, request);
}

export async function deleteUserRole(id: string, role: string) {
  const url = new URL(`api/v1/users/${id}/roles/${role}`, API_URL);
  return await destroy(url);
}

export async function putUserRole(id: string, role: string) {
  const url = new URL(`api/v1/users/${id}/roles/${role}`, API_URL);
  return await put(url);
}
