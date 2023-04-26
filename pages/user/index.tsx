import Layout from 'components/layout';
import { NextPageWithLayout } from '../_app';

const User: NextPageWithLayout = () => {
  return (
    <>
      <h1>User </h1>
    </>
  );
};
export default User;
User.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
