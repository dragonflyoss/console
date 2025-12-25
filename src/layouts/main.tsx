import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SignIn from '../components/signin';
import NotFound from '../components/404';
import SignUp from '../components/signup';
import Layout from '../components/menu';
import Clusters from '../components/clusters';
import EditCluster from '../components/clusters/edit';
import NewCluster from '../components/clusters/new';
import Cluster from '../components/clusters/information';
// import SeedPeers from '../components/clusters/seed-peers';
import Schedulers from '../components/clusters/schedulers/index';
import ShowCluster from '../components/clusters/show';
import ShowScheduler from '../components/clusters/schedulers/show';
// import ShowSeedPeer from '../components/clusters/seed-peers/show';
import Peers from '../components/clusters/peers';
import Profile from '../components/profile';
import Users from '../components/users';
import NewUser from '../components/users/new';
import Tokens from '../components/developer/tokens';
import NewTokens from '../components/developer/tokens/new';
import EditTokens from '../components/developer/tokens/edit';
import Preheats from '../components/job/preheats';
import NewPreheat from '../components/job/preheats/new';
import ShowPreheat from '../components/job/preheats/show';
import Task from '../components/resource/task';
import ShowTask from '../components/resource/task/executions/show';
import PersistentCacheTasksCluster from '../components/resource/persistent-cache-task/cluster';
import PersistentCacheTasks from '../components/resource/persistent-cache-task';
import PersistentCacheTask from '../components/resource/persistent-cache-task/show';
import Audit from '../components/audit';
import GC from '../components/gc';
import TransitionRoute from '../components/TransitionRoute';
import { useState, useEffect } from 'react';
import { getJwtPayload } from '../lib/utils';
import { getUserRoles } from '../lib/api';
import { ROLE_ROOT } from '../lib/constants';

function Main() {
  const [isRoot, setIsRoot] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const payload = getJwtPayload();
    (async function () {
      try {
        if (payload?.id) {
          const role = localStorage.getItem('role');

          if (role) {
            setIsRoot(role === 'root');
          } else {
            const role = await getUserRoles(payload?.id);
            setIsRoot(role.includes(ROLE_ROOT));
          }
        } else {
          localStorage.removeItem('role');
        }
      } catch (error) {
        if (error instanceof Error) {
          setIsRoot(false);
        }
      }
    })();
  }, [location]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Navigate to="/clusters" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<Layout />}>
        <Route path="/clusters" element={<TransitionRoute><Clusters /></TransitionRoute>} />
        <Route path="/clusters/new" element={<TransitionRoute><NewCluster /></TransitionRoute>} />
        <Route path="/clusters/:id/edit" element={<TransitionRoute><EditCluster /></TransitionRoute>} />
        <Route element={<ShowCluster />}>
          <Route path="/clusters/:id" element={<TransitionRoute><Cluster /></TransitionRoute>} />
          <Route path="/clusters/:id/schedulers" element={<TransitionRoute><Schedulers /></TransitionRoute>} />
          <Route path="/clusters/:id/peers" element={<TransitionRoute><Peers /></TransitionRoute>} />
        </Route>
        <Route path="/clusters/:id/schedulers/:id" element={<TransitionRoute><ShowScheduler /></TransitionRoute>} />
        <Route path="/profile" element={<TransitionRoute><Profile /></TransitionRoute>} />
        <Route path="/developer/personal-access-tokens" element={<TransitionRoute><Tokens /></TransitionRoute>} />
        <Route path="/developer/personal-access-tokens/new" element={<TransitionRoute><NewTokens /></TransitionRoute>} />
        <Route path="/developer/personal-access-tokens/:id" element={<TransitionRoute><EditTokens /></TransitionRoute>} />
        <Route path="/jobs/preheats" element={<TransitionRoute><Preheats /></TransitionRoute>} />
        <Route path="/jobs/preheats/new" element={<TransitionRoute><NewPreheat /></TransitionRoute>} />
        <Route path="/jobs/preheats/:id" element={<TransitionRoute><ShowPreheat /></TransitionRoute>} />
        <Route path="/resource/task/:key" element={<TransitionRoute><Task /></TransitionRoute>} />
        <Route path="/resource/task/executions/:id" element={<TransitionRoute><ShowTask /></TransitionRoute>} />
        <Route path="/resource/persistent-cache-task" element={<TransitionRoute><PersistentCacheTasksCluster /></TransitionRoute>} />
        <Route path="/resource/persistent-cache-task/clusters/:id" element={<TransitionRoute><PersistentCacheTasks /></TransitionRoute>} />
        <Route path="/resource/persistent-cache-task/clusters/:id/:id" element={<TransitionRoute><PersistentCacheTask /></TransitionRoute>} />
        <Route path="/audit" element={<TransitionRoute><Audit /></TransitionRoute>} />
        <Route path="/gc/:key" element={<TransitionRoute><GC /></TransitionRoute>} />
        {isRoot && <Route path="/users" element={<TransitionRoute><Users /></TransitionRoute>} />}
        <Route path="/users/new" element={<TransitionRoute><NewUser /></TransitionRoute>} />
      </Route>
      <Route path="*" element={<TransitionRoute><NotFound /></TransitionRoute>} />
    </Routes>
  );
}

export default Main;
