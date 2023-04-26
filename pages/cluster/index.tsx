import Layout from 'components/layout';
import { NextPageWithLayout } from '../_app';
import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';

import CardActions from '@mui/material/CardActions';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, useEffect } from 'react';
import { getSchedulerClusters ,getScheduler} from 'lib/api';
import Cookies from 'js-cookie';

const info = [
  {
    formProps: {
      name: 'name',
      key: 'name',
      label: 'name',
      autoComplete: 'family-name',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'Name',
  },

  {
    key: 'Peer cluster config',
    label: 'Peer cluster config',
    type: 'json',
    title: true,
    tab: '2',
    formProps: {
      tooltip: 'scheduler cluster config info',
      required: true,
    },
    en_US: 'Peer cluster config',
  },
  {
    formProps: {
      key: 'Concurrent Piece Count',
      label: 'Concurrent Piece Count',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'Please enter cluster description',
  },
  {
    formProps: {
      key: 'load_limit',
      label: 'load_limit',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'Load Limit',
  },
  {
    key: 'Scheduler Cluster Config',
    label: 'Scheduler Cluster Config',
    type: 'json',
    title: true,
    tab: '2',
    formProps: {
      tooltip: 'scheduler cluster config info',
      required: true,
    },
    en_US: 'Scheduler Cluster Config',
  },
  {
    formProps: {
      key: 'Filter Parent Limit',
      label: 'Filter Parent Limit',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'Filter Parent Limit',
  },
  {
    formProps: {
      key: 'Filter Parent Range Limit',
      label: 'Filter Parent Range Limit',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'Filter Parent Range Limit',
  },
  {
    key: 'Seed Peer Cluster Config',
    label: 'Seed Peer Cluster Config',
    type: 'json',
    title: true,
    tab: '2',
    formProps: {
      tooltip: 'scheduler cluster config info',
      required: true,
    },
    en_US: 'Seed Peer Cluster Config',
  },
  {
    formProps: {
      key: 'Load Limit',
      label: 'Load Limit',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'Load Limit',
  },
  {
    formProps: {
      key: 'bio',
      label: 'bio',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'bio',
  },
  {
    formProps: {
      key: 'is_default',
      label: 'is_defaulto',
    },
    select: true,
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    selectNode: [
      {
        value: 'USD',
        label: '$',
      },
      {
        value: 'EUR',
        label: '€',
      },
      {
        value: 'BTC',
        label: '฿',
      },
      {
        value: 'JPY',
        label: '¥',
      },
    ],

    en_US: 'Is Default',
  },
  {
    key: 'Scopes',
    label: 'Scopes',
    type: 'json',
    title: true,
    tab: '2',
    formProps: {
      tooltip: 'scheduler cluster config info',
      required: true,
    },
    en_US: 'Scopes',
  },
  {
    formProps: {
      key: 'Cidrs',
      label: 'Cidrs',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'Cidrs',
  },
  {
    formProps: {
      key: 'idc',
      label: 'idc',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'idc',
  },
  {
    formProps: {
      key: 'location',
      label: 'location',
    },
    validate: (value: string) => {
      const reg = /[A-Za-z\d]/;
      return reg.test(value);
    },
    en_US: 'location',
  },
];
const SelectText = [{ value: true }, { value: false }];

const Security: NextPageWithLayout = (props: any) => {
  useEffect(() => {
    getScheduler();
  }, []);
  var lastVisit = Cookies.get('jwt');

  const cluster = [
    {
      ID: 1,
      Name: 'scheduler-cluster-1',
      BIO: '',
      Scopes: {
        idc: '',
        location: '',
        cidrs: null,
      },
      SchedulerClusterID: 1,
      SeedPeerClusterID: 1,
      SchedulerClusterConfig: {
        filter_parent_limit: 0,
        filter_parent_range_limit: 0,
      },
      SeedPeerClusterConfig: {
        load_limit: 300,
      },
      PeerClusterConfig: {
        load_limit: 50,
        concurrent_piece_count: 4,
      },
      CreatedAt: '2023-04-25T07:27:23Z',
      UpdatedAt: '2023-04-25T07:27:23Z',
      IsDefault: true,
    },
  ];
  const [age, setAge] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    // setOpen(false);
  };
  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };
  const handleSubmit = (event: any) => {
    event.preventDefault();

    const passwordElement = event.currentTarget.elements.bio;

    const data = new FormData(event.currentTarget);
    console.log(passwordElement.value, '....1');

    info.forEach((item) => {});
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Add cluster
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Cluster</DialogTitle>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogContent>
            {info.map((item: any, idx: number) => {
              if (item.title) {
                return <h3 key={idx}>{item.en_US}</h3>;
              } else {
                return (
                  <TextField
                    margin="normal"
                    select={item.select}
                    color="success"
                    required
                    fullWidth
                    key={idx}
                    {...item.formProps}
                  >
                    {item.select &&
                      item.selectNode.map((option: any) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                  </TextField>
                );
              }
            })}
          </DialogContent>
          <DialogActions>
            <Button type="submit" onClick={handleClose}>
              Subscribe
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Grid sx={{ display: 'flex' }} component="form" noValidate>
        {cluster.map((item: any, id: React.Key | null | undefined) => (
          <Card sx={{ width: '18rem', ml: 2, mt: 2 }} key={id}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                ID:{item.ID}
              </Typography>
              <Typography variantMapping={{ h1: 'h5' }} component="div" typeof="sfe">
                Name:{item.Name}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Bio:{item.BIO}
              </Typography>
              <Typography variant="body2">Is Default {item.IsDefault}</Typography>
              <Typography variant="body2">Create Time{item.CreatedAt}</Typography>
            </CardContent>
            <CardActions>
              <Link href={`/cluster/${item.ID}`} underline="none">
                Learn More
              </Link>
            </CardActions>
          </Card>
        ))}
      </Grid>
    </div>
  );
};
export default Security;
Security.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

// export async function getStaticProps() {
//   const response = await fetch('http://localhost:3000/api/clusters');
//   const reply = await response.json();

//   return {
//     props: {
//       reply: reply.data,
//     }, // will be passed to the page component as props
//   };
// }
