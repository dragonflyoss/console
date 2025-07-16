import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SignIn from '../components/signin';
import NotFound from '../components/404';
import SignUp from '../components/signup';
import Layout from '../components/menu';
import Clusters from '../components/clusters';
import EditCluster from '../components/clusters/edit';
import NewCluster from '../components/clusters/new';
import Cluster from '../components/clusters/information';
import SeedPeers from '../components/clusters/seed-peers';
import Schedulers from '../components/clusters/schedulers/index';
import ShowCluster from '../components/clusters/show';
import ShowScheduler from '../components/clusters/schedulers/show';
import ShowSeedPeer from '../components/clusters/seed-peers/show';
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
import Clear from '../components/resource/task/clear';
import Task from '../components/resource/task';
import Executions from '../components/resource/task/executions';
import ShowTask from '../components/resource/task/executions/show';
import PersistentCacheTasksCluster from '../components/resource/persistent-cache-task/cluster';
import PersistentCacheTasks from '../components/resource/persistent-cache-task';
import PersistentCacheTask from '../components/resource/persistent-cache-task/show';
import Audit from '../components/audit';
import GC from '../components/gc';
import JobGC from '../components/gc/job';
import AuditGC from '../components/gc/audit';
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
    <Routes>
      <Route path="/" element={<Navigate to="/clusters" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<Layout />}>
        <Route path="/clusters" element={<Clusters />} />
        <Route path="/clusters/new" element={<NewCluster />} />
        <Route path="/clusters/:id/edit" element={<EditCluster />} />
        <Route element={<ShowCluster />}>
          <Route path="/clusters/:id" element={<Cluster />} />
          <Route path="/clusters/:id/schedulers" element={<Schedulers />} />
          <Route path="/clusters/:id/seed-peers" element={<SeedPeers />} />
          <Route path="/clusters/:id/peers" element={<Peers />} />
        </Route>
        <Route path="/clusters/:id/schedulers/:id" element={<ShowScheduler />} />
        <Route path="/clusters/:id/seed-peers/:id" element={<ShowSeedPeer />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/developer/personal-access-tokens" element={<Tokens />} />
        <Route path="/developer/personal-access-tokens/new" element={<NewTokens />} />
        <Route path="/developer/personal-access-tokens/:id" element={<EditTokens />} />
        <Route path="/jobs/preheats" element={<Preheats />} />
        <Route path="/jobs/preheats/new" element={<NewPreheat />} />
        <Route path="/jobs/preheats/:id" element={<ShowPreheat />} />
        <Route element={<Task />}>
          <Route path="/resource/task/clear" element={<Clear />} />
          <Route path="/resource/task/executions" element={<Executions />} />
          <Route path="/resource/task/executions/:id" element={<ShowTask />} />
        </Route>
        <Route path="/resource/persistent-cache-task" element={<PersistentCacheTasksCluster />} />
        <Route path="/resource/persistent-cache-task/clusters/:id" element={<PersistentCacheTasks />} />
        <Route path="/resource/persistent-cache-task/clusters/:id/:id" element={<PersistentCacheTask />} />
        <Route path="/audit" element={<Audit />} />
        <Route element={<GC />}>
          <Route path="/gc/audit" element={<AuditGC />} />
          <Route path="/gc/job" element={<JobGC />} />
        </Route>
        {isRoot && <Route path="/users" element={<Users />} />}
        <Route path="/users/new" element={<NewUser />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Main;
