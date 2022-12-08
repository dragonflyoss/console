import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import Layout from '../../src/layouts/SidebarLayout';

const AboutPage = () => {
  return (
    <Layout>
      <Box>
        <Typography variant="h3">About Page</Typography>
        <Box>
          <Link href="/">Go home</Link>
        </Box>
      </Box>
    </Layout>
  );
};

export default AboutPage;
