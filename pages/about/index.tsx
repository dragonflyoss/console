import { Box } from '@mui/material';
import Link from 'next/link';
import Layout from '../../src/layouts/SidebarLayout';

const AboutPage = () => {
  return (
    <Layout>
      <Box>
        <h3>About Page</h3>
        <Box>
          <Link href="/home">Go home </Link>
        </Box>
      </Box>
    </Layout>
  );
};

export default AboutPage;
