import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SignIn from '../components/signin';
import NotFound from '../components/404';
import SignUp from '../components/signup';
import Layout from '../components/menu';
import Clusters from '../components/clusters';
import EditCluster from '../components/clusters/edit';
import NewCluster from '../components/clusters/new';
import ShowCluster from '../components/clusters/show';
import ShowScheduler from '../components/schedulers/show';
import ShowSeedPeer from '../components/seed-peers/show';
import Profile from '../components/profile';
import Users from '../components/users';
import Tokens from '../components/developer/tokens';
import NewTokens from '../components/developer/tokens/new';
import EditTokens from '../components/developer/tokens/edit';
import Preheats from '../components/job/preheats';
import NewPreheat from '../components/job/preheats/new';
import ShowPreheat from '../components/job/preheats/show';
import Peers from '../components/insight/peer';
import { useState, useEffect } from 'react';
import { getJwtPayload } from '../lib/utils';
import { getUserRoles } from '../lib/api';
import { ROLE_ROOT } from '../lib/constants';

function Main() {
  const [isRoot, setIsRoot] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const payload = getJwtPayload();
console.log(payload);

    (async function () {
      if (payload?.id) {
        const role = await getUserRoles(payload?.id);
        setIsRoot(role.includes(ROLE_ROOT));
      }
    })();
  }, [location]);

  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Navigate to="/clusters" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<Layout />}>
        <Route path="/clusters" element={<Clusters />} />
        <Route path="/clusters/new" element={<NewCluster />} />
        <Route path="/clusters/:id/edit" element={<EditCluster />} />
        <Route path="/clusters/:id" element={<ShowCluster />} />
        <Route path="/clusters/:id/schedulers/:id" element={<ShowScheduler />} />
        <Route path="/clusters/:id/seed-peers/:id" element={<ShowSeedPeer />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/developer/personal-access-tokens" element={<Tokens />} />
        <Route path="/developer/personal-access-tokens/new" element={<NewTokens />} />
        <Route path="/developer/personal-access-tokens/:id" element={<EditTokens />} />
        <Route path="/jobs/preheats" element={<Preheats />} />
        <Route path="/jobs/preheats/new" element={<NewPreheat />} />
        <Route path="/jobs/preheats/:id" element={<ShowPreheat />} />
        <Route path="/insight/peers" element={<Peers />} />
        <Route path="/users" element={isRoot ? <Users /> : <NotFound />} />
      </Route>
    </Routes>
  );
}

export default Main;
