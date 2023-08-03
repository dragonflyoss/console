import { Routes, Route, Navigate } from 'react-router-dom';
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
function Main() {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Navigate to="/Clusters" replace />} />
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
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default Main;
