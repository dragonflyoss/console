import react, { useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import Layout from '../../src/layouts/SidebarLayout';
// import NextLink from 'next/link';

const HomePage = () => {
  useEffect(() => {
    axios
      .post(
        'https://mock.mengxuegu.com/mock/63919e2293a67b5f1066998a/api/data/',
      )
      .then((res) => {
        console.log('data', res);
      });
  }, []);
  return (
    <Layout>
      <Box>
        <Typography variant="h3">home page</Typography>
        <Button href="/about" size="large" variant="contained">
          About
        </Button>
      </Box>
    </Layout>
  );
};

export default HomePage;
