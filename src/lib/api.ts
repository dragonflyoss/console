import queryString from 'query-string';
import { parseLinkHeader } from '@web3-storage/parse-link-header';

const API_URL = process.env.REACT_APP_API_URL || window.location.href;

export async function get(url: URL) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      return response;
    }

    let errorMessage = null;

    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const jsonResponse = await response.json();
      errorMessage = jsonResponse?.message || response.statusText;
    } else {
      errorMessage = await response.text();
    }

    throw new Error(errorMessage && typeof errorMessage === 'string' ? errorMessage : response.statusText);
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
    }

    let errorMessage = null;

    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const jsonResponse = await response.json();
      errorMessage = jsonResponse?.message || response.statusText;
    } else {
      errorMessage = await response.text();
    }

    throw new Error(errorMessage && typeof errorMessage === 'string' ? errorMessage : response.statusText);
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
    }

    let errorMessage = null;

    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const jsonResponse = await response.json();
      errorMessage = jsonResponse?.message || response.statusText;
    } else {
      errorMessage = await response.text();
    }

    throw new Error(errorMessage && typeof errorMessage === 'string' ? errorMessage : response.statusText);
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
    }

    let errorMessage = null;

    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const jsonResponse = await response.json();
      errorMessage = jsonResponse?.message || response.statusText;
    } else {
      errorMessage = await response.text();
    }

    throw new Error(errorMessage && typeof errorMessage === 'string' ? errorMessage : response.statusText);
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
    }

    let errorMessage = null;

    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const jsonResponse = await response.json();
      errorMessage = jsonResponse?.message || response.statusText;
    } else {
      errorMessage = await response.text();
    }

    throw new Error(errorMessage && typeof errorMessage === 'string' ? errorMessage : response.statusText);
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
  bio?: string;
  location?: string;
  phone?: string;
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

export interface getClusterResponse {
  id: number;
  name: string;
  bio: string;
  scopes: {
    idc: string;
    location: string;
    cidrs: Array<string> | null;
    hostnames: Array<string> | null;
  };
  scheduler_cluster_id: number;
  seed_peer_cluster_id: number;
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
    job_rate_limit: number;
  };
  seed_peer_cluster_config: {
    load_limit: number;
  };
  peer_cluster_config: {
    load_limit: number;
  };
  created_at: string;
  updated_at: string;
  is_default: boolean;
}

export async function getClusters(params?: getClustersParams): Promise<getClusterResponse[]> {
  const url = params
    ? new URL(`/api/v1/clusters?${queryString.stringify(params)}`, API_URL)
    : new URL('/api/v1/clusters', API_URL);

  const response = await get(url);
  return await response.json();
}

export async function getCluster(id: string): Promise<getClusterResponse> {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface createClusterRequest {
  name: string;
  peer_cluster_config: {
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
    job_rate_limit: number;
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
    hostnames: Array<string>;
  };
}

interface createClusterResponse {
  id: string;
  name: string;
  peer_cluster_config: {
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
    job_rate_limit: number;
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
    hostnames: Array<string>;
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
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
    job_rate_limit: number;
  };
  scopes: {
    cidrs: Array<string>;
    idc: string;
    location: string;
    hostnames: Array<string>;
  };
  seed_peer_cluster_config: {
    load_limit: number;
  };
}

interface updateClusterResponse {
  id: string;
  name: string;
  peer_cluster_config: {
    load_limit: number;
  };
  scheduler_cluster_config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
    job_rate_limit: number;
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
    hostnames: Array<string>;
  };
}

export async function updateCluster(id: string, request: updateClusterRequset): Promise<updateClusterResponse> {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  const response = await patch(url, request);
  return await response.json();
}

export async function deleteCluster(id: string) {
  const url = new URL(`/api/v1/clusters/${id}`, API_URL);
  return await destroy(url);
}

interface getSchedulerParmas {
  scheduler_cluster_id?: string;
  page?: number;
  per_page?: number;
  host_name?: string;
}

export interface getSchedulersResponse {
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

export async function getSchedulers(params?: getSchedulerParmas): Promise<getSchedulersResponse[]> {
  const url = params
    ? new URL(`/api/v1/schedulers?${queryString.stringify(params)}`, API_URL)
    : new URL('/api/v1/schedulers', API_URL);

  const response = await get(url);
  return await response.json();
}

export interface getSchedulerResponse {
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

export async function getSchedulerFeatrues(): Promise<Array<string>> {
  const url = new URL(`/api/v1/scheduler-features`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface updateSchedulerFeatruesRequset {
  features: Array<string>;
}

export async function updateSchedulerFeatrues(
  id: string,
  request: updateSchedulerFeatruesRequset,
): Promise<getSchedulerResponse> {
  const url = new URL(`/api/v1/schedulers/${id}`, API_URL);
  const response = await patch(url, request);
  return await response.json();
}

export async function deleteScheduler(id: string) {
  const url = new URL(`/api/v1/schedulers/${id}`, API_URL);
  return await destroy(url);
}

interface getSeedPeersParmas {
  seed_peer_cluster_id?: string;
  page?: number;
  per_page?: number;
  host_name?: string;
}

export interface getSeedPeersResponse {
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

export async function getSeedPeers(params?: getSeedPeersParmas): Promise<getSeedPeersResponse[]> {
  const url = params
    ? new URL(`/api/v1/seed-peers?${queryString.stringify(params)}`, API_URL)
    : new URL('/api/v1/seed-peers', API_URL);

  const response = await get(url);
  return await response.json();
}

export interface getSeedPeerResponse {
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
  const url = new URL(`/api/v1/seed-peers/${id}`, API_URL);
  return await destroy(url);
}

interface getUserParams {
  page?: number;
  per_page?: number;
}

export interface getUsersResponse {
  avatar: string;
  id: number;
  email: string;
  name: string;
  state: string;
  location: string;
}

export async function getUsers(params: getUserParams): Promise<getUsersResponse[]> {
  const url = params
    ? new URL(`/api/v1/users?${queryString.stringify(params)}`, API_URL)
    : new URL('/api/v1/users', API_URL);

  const response = await get(url);
  return await response.json();
}

export interface getUserResponse {
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
  return await response.json();
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
  const url = new URL(`/api/v1/users/${id}/roles/${role}`, API_URL);
  return await destroy(url);
}

export async function putUserRole(id: string, role: string) {
  const url = new URL(`/api/v1/users/${id}/roles/${role}`, API_URL);
  return await put(url);
}

interface getTokensParams {
  page?: number;
  per_page?: number;
}

export interface getTokensResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  name: string;
  bio: string;
  token: string;
  scopes: Array<string>;
  state: string;
  expired_at: string;
  user_id: number;
  user: {
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
    configs: null;
  };
}

export async function getTokens(params?: getTokensParams): Promise<getTokensResponse[]> {
  const url = params
    ? new URL(`/api/v1/personal-access-tokens?${queryString.stringify(params)}`, API_URL)
    : new URL('/api/v1/personal-access-tokens', API_URL);

  const response = await get(url);
  return await response.json();
}

export async function getToken(id: string): Promise<getTokensResponse> {
  const url = new URL(`/api/v1/personal-access-tokens/${id}`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface createTokensRequest {
  name: string;
  bio: string;
  scopes: Array<string>;
  expired_at: string;
}

interface createTokensResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  name: string;
  bio: string;
  token: string;
  scopes: Array<string>;
  state: string;
  expired_at: string;
  user_id: number;
}

export async function createTokens(request: createTokensRequest): Promise<createTokensResponse> {
  const url = new URL(`/api/v1/personal-access-tokens`, API_URL);
  const response = await post(url, request);
  return await response.json();
}

export async function deleteTokens(id: string) {
  const url = new URL(`/api/v1/personal-access-tokens/${id}`, API_URL);
  return await destroy(url);
}

interface updateTokensRequset {
  bio: string;
  expired_at: string;
  scopes: Array<string>;
}

interface updateTokensResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  name: string;
  bio: string;
  token: string;
  scopes: Array<string>;
  state: string;
  expired_at: string;
  user_id: number;
}

export async function updateTokens(id: string, request: updateTokensRequset): Promise<updateTokensResponse> {
  const url = new URL(`/api/v1/personal-access-tokens/${id}`, API_URL);
  const response = await patch(url, request);
  return await response.json();
}

interface getJobsParams {
  page?: number;
  per_page?: number;
  user_id?: string;
  state?: string;
}

interface JobStates {
  created_at: string;
  error: string;
  results: Array<string> | null;
  state: string;
  task_name: string;
  task_uuid: string;
  ttl: number;
}

interface scheduler_clusters {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  name: string;
  bio: string;
  config: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
    job_rate_limit: number;
  };
  client_config: {
    load_limit: number;
  };
  scopes: {};
  is_default: boolean;
  seed_peer_clusters: null;
  schedulers: null;
  peers: null;
  jobs: null;
}

export interface JobsResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  task_id: string;
  bio: string;
  type: string;
  state: string;
  args: {
    concurrent_count: number;
    headers: { [key: string]: string } | null;
    password: string;
    platform: string;
    scope: string;
    tag: string;
    timeout: number;
    type: string;
    url: string;
    piece_length: number;
    username: string;
  };
  result: {
    created_at: string;
    group_uuid: string;
    job_states: Array<JobStates>;
    state: string;
    updated_at: string;
  };
  user_id: number;
  user: {
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
    configs: null | any;
  };
  seed_peer_clusters: any[];
  scheduler_clusters: scheduler_clusters;
}

interface getJobsResponse {
  data: JobsResponse[];
  total_page?: number;
}

export async function getJobs(params: getJobsParams): Promise<getJobsResponse> {
  const url = new URL(`/api/v1/jobs?${queryString.stringify(params)}&type=preheat`, API_URL);

  const response = await get(url);
  const data = await response.json();
  const linkHeader = response.headers.get('link');
  const links = parseLinkHeader(linkHeader || null);
  const totalPage = Number(links?.last?.page);
  const responses = { data: data, total_page: totalPage };
  return responses;
}

export interface getJobResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  task_id: string;
  bio: string;
  type: string;
  state: string;
  args: {
    concurrent_count: number;
    filtered_query_params: string;
    headers: { [key: string]: string } | null;
    password: string;
    platform: string;
    scope: string;
    tag: string;
    timeout: number;
    type: string;
    url: string;
    piece_length: number;
    username: string;
  };
  result: {
    created_at: string;
    group_uuid: string;
    job_states: Array<JobStates>;
    state: string;
    updated_at: string;
  };
  user_id: number;
  user: {
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
    configs: null;
  };
  seed_peer_clusters: [];
  scheduler_clusters: Array<scheduler_clusters>;
}

export async function getJob(id: string): Promise<getJobResponse> {
  const url = new URL(`/api/v1/jobs/${id}`, API_URL);
  const response = await get(url);
  return await response.json();
}

interface createJobRequest {
  bio: string;
  type: string;
  args: {
    type: string;
    url: string;
    tag: string;
    filtered_query_params: string;
    headers?: { [key: string]: string } | null;
    piece_length?: number;
  };
  scheduler_cluster_ids: Array<number>;
}

interface cerateJobResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  task_id: string;
  bio: string;
  type: string;
  state: string;
  args: {
    filtered_query_params: string;
    headers: { [key: string]: string };
    tag: string;
    type: string;
    url: string;
    piece_length: number;
  };
  result: string;
}

export async function createJob(request: createJobRequest): Promise<cerateJobResponse> {
  const url = new URL(`/api/v1/jobs`, API_URL);
  const response = await post(url, request);
  return await response.json();
}

interface getpeerParams {
  page?: number;
  per_page?: number;
  scheduler_cluster_id?: number;
}

export interface getPeersResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  host_name: string;
  type: string;
  idc: string;
  location: string;
  ip: string;
  port: number;
  download_port: number;
  object_storage_port: number;
  state: string;
  os: string;
  platform: string;
  platform_family: string;
  platform_version: string;
  kernel_version: string;
  git_version: string;
  git_commit: string;
  build_platform: string;
  scheduler_cluster_id: number;
  scheduler_cluster: {
    id: number;
    created_at: string;
    updated_at: string;
    is_del: number;
    name: string;
    bio: string;
    config: {
      candidate_parent_limit: number;
      filter_parent_limit: number;
      job_rate_limit: number;
    };
    client_config: {
      load_limit: number;
    };
    scopes: {
      cidrs: Array<string>;
      idc: string;
      location: string;
    };
    is_default: boolean;
    seed_peer_clusters: number;
    schedulers: string;
    peers: string;
    jobs: string;
  };
}

export async function getPeers(params?: getpeerParams): Promise<getPeersResponse[]> {
  const url = params
    ? new URL(`/api/v1/peers?${queryString.stringify(params)}`, API_URL)
    : new URL('/api/v1/peers', API_URL);

  const response = await get(url);
  return await response.json();
}

interface SyncPeers {
  type: string;
  scheduler_cluster_ids?: Array<number>;
}

export async function getSyncPeers(request: SyncPeers): Promise<string> {
  const url = new URL(`/api/v1/jobs`, API_URL);
  const response = await post(url, request);
  return await response.json();
}

interface user {
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
  configs: null;
}

interface createTaskJobResquest {
  args: {
    task_id?: string;
    url?: string;
    tag?: string;
    application?: string;
    filtered_query_params?: string;
  };
  scheduler_cluster_ids?: Array<number>;
  type: string;
}

export interface createTaskJobResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  task_id: string;
  bio: string;
  type: string;
  state: string;
  args: {
    task_id: string;
  };
  result: null;
  user_id: number;
  user: user;
  seed_peer_clusters: Array<string> | null;
  scheduler_clusters: Array<scheduler_clusters>;
}

export async function createTaskJob(request: createTaskJobResquest): Promise<createTaskJobResponse> {
  const url = new URL(`/api/v1/jobs`, API_URL);
  const response = await post(url, request);
  return await response.json();
}

export interface peers {
  created_at: string;
  host_type: string;
  hostname: string;
  id: string;
  ip: string;
  updated_at: string;
}

export interface jobStates {
  created_at: string;
  error: string;
  results: [{ peers: Array<peers> | null; scheduler_cluster_id: number }];
  state: string;
  task_name: string;
  task_uuid: string;
  ttl: number;
}

interface failureTasks {
  description: string;
  host_type: string;
  hostname: string;
  ip: string;
}

interface successTasks {
  host_type: string;
  hostname: string;
  ip: string;
}

interface deleteJobStates {
  created_at: string;
  error: string;
  results: [
    {
      failure_tasks: Array<failureTasks> | null;
      scheduler_cluster_id: 1;
      success_tasks: Array<successTasks> | null;
    },
  ];
  state: string;
  task_name: string;
  task_uuid: string;
  ttl: 0;
}

export interface getTaskJobResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_del: number;
  task_id: string;
  bio: string;
  type: string;
  state: string;
  args: {
    application?: string;
    filtered_query_params?: string;
    tag?: string;
    task_id: string;
    timeout?: number;
    url?: string;
    piece_length?: number;
  };
  result: {
    created_at: string;
    group_uuid: string;
    job_states: deleteJobStates[] | jobStates[];
    state: string;
    updated_at: string;
  };
  user_id: number;
  user: user;
  seed_peer_clusters: [];
  scheduler_clusters: Array<scheduler_clusters>;
}

export async function getTaskJob(id: any): Promise<getTaskJobResponse> {
  const url = new URL(`/api/v1/jobs/${id}`, API_URL);
  const response = await get(url);

  return await response.json();
}

interface getDeleteTaskJobResponse {
  data: getTaskJobResponse[];
  total_page?: number;
}

export async function getDeleteTaskJob(params: getJobsParams): Promise<getDeleteTaskJobResponse> {
  const url = new URL(`/api/v1/jobs?${queryString.stringify(params)}&type=delete_task`, API_URL);

  const response = await get(url);
  const data = await response.json();
  const linkHeader = response.headers.get('link');
  const links = parseLinkHeader(linkHeader || null);
  const totalPage = Number(links?.last?.page);
  const responses = { data: data, total_page: totalPage };
  return responses;
}

interface getPersistentCacheTasksParams {
  page?: number;
  per_page?: number;
  scheduler_cluster_id?: string;
}

export interface persistentCacheTasksPeersResponse {
  block_parents: [string];
  cost: number;
  created_at: string;
  finished_pieces: {};
  host: {
    announce_interval: number;
    build: {
      git_commit: string;
      git_version: string;
      go_version: string;
      platform: string;
    };
    cpu: {
      logical_count: number;
      percent: number;
      physical_count: number;
      process_percent: number;
      times: {
        guest: number;
        guest_nice: number;
        idle: number;
        iowait: number;
        irq: number;
        nice: number;
        softirq: number;
        steal: number;
        system: number;
        user: number;
      };
    };
    created_at: string;
    disable_shared: boolean;
    disk: {
      free: number;
      inodes_free: number;
      inodes_total: number;
      inodes_used: number;
      inodes_used_percent: number;
      read_bandwidth: number;
      total: number;
      used: number;
      used_percent: number;
      write_bandwidth: number;
    };
    download_port: number;
    hostname: string;
    id: string;
    ip: string;
    kernel_version: string;
    memory: {
      available: number;
      free: number;
      process_used_percent: number;
      total: number;
      used: number;
      used_percent: number;
    };
    network: {
      download_rate: number;
      download_rate_limit: number;
      idc: string;
      location: string;
      tcp_connection_count: number;
      upload_rate: number;
      upload_rate_limit: number;
      upload_tcp_connection_count: number;
    };
    os: string;
    platform: string;
    platform_family: string;
    platform_version: string;
    port: number;
    scheduler_cluster_id: number;
    type: string;
    updated_at: string;
  };
  id: string;
  persistent: boolean;
  state: string;
  updated_at: string;
}

export interface getPersistentCacheTasksResponse {
  id: string;
  persistent_replica_count: number;
  tag: string;
  application: string;
  piece_length: number;
  content_length: number;
  total_piece_count: number;
  state: string;
  ttl: number;
  created_at: string;
  updated_at: string;
  peers: Array<persistentCacheTasksPeersResponse>;
}

export async function getPersistentCacheTasks(
  params: getPersistentCacheTasksParams,
): Promise<getPersistentCacheTasksResponse[]> {
  const url = new URL(`/api/v1/persistent-cache-tasks?${queryString.stringify(params)}`, API_URL);

  const response = await get(url);
  return await response.json();
}

export async function getPersistentCacheTask(
  id: string,
  params: getPersistentCacheTasksParams,
): Promise<getPersistentCacheTasksResponse> {
  const url = new URL(`/api/v1/persistent-cache-tasks/${id}?${queryString.stringify(params)}`, API_URL);

  const response = await get(url);
  return await response.json();
}

interface deletePersistentCacheTasksParams {
  scheduler_cluster_id?: string;
}

export async function deletePersistentCacheTask(id: string, params: deletePersistentCacheTasksParams) {
  const url = new URL(`/api/v1/persistent-cache-tasks/${id}?${queryString.stringify(params)}`, API_URL);

  return await destroy(url);
}
