import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from 'components/404';
import SignIn from 'components/signin/index';
import SignUp from 'components/signup/index';
import Clusters from 'components/clusters/index';
import NewCluster from 'components/clusters/new';
import ShowCluster from 'components/clusters/show';
import EditCluster from 'components/clusters/edit';
import ShowScheduler from 'components/schedulers/show';
import ShowSeedPeer from 'components/seed-peers/show';
import Profile from 'components/profile/index';
import Users from 'components/users';
import Layout from 'components/layout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Layout />}>
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
    </Router>
  );
}
