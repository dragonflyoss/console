import Layout from 'components/layout';
import { NextPageWithLayout } from '../_app';
import * as React from 'react';

const Security: NextPageWithLayout = () => {
  return (
    <>
      <h1>job </h1>
    </>
  );
};
export default Security;
Security.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
