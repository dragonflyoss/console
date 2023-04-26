import Layout from 'components/layout';
import { NextPageWithLayout } from '../_app';
import { Box, Button, Divider, Grid, Tooltip } from '@mui/material';
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import DialogTitle from '@mui/material/DialogTitle';

const Job: NextPageWithLayout = () => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fromList = [
    {
      formProps: {
        id: 'ID',
        label: 'ID',
        name: 'ID',
        type: 'id',
      },
    },
    {
      formProps: {
        id: 'Name',
        label: 'Name',
        name: 'Name',
        type: 'Name',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'ID',
        label: 'ID',
        name: 'ID',
        type: 'id',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Description',
        label: 'Description',
        name: 'Description',
        type: 'Description',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Seed Peer Cluster',
        label: 'Seed Peer Cluster',
        name: 'Seed Peer Cluster',
        type: 'Seed Peer Cluster',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Config',
        label: 'Config',
        name: 'Config',
        type: 'Config',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'IDC',
        label: 'IDC',
        name: 'IDC',
        type: 'IDC',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Net Topologyr',
        label: 'Net Topology',
        name: 'Net Topology',
        type: 'Net Topology',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Location',
        label: 'Location',
        name: 'Location',
        type: 'Location',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Filter Parent Countr',
        label: 'Filter Parent Countr',
        name: 'Filter Parent Countr',
        type: 'Filter Parent Countr',

        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Load Limit',
        label: 'Load Limit',
        name: 'Load Limit',
        type: 'Load Limit',
        autoComplete: 'family-name',
      },
    },
    {
      formProps: {
        id: 'Download Parallel Count',
        label: 'Download Parallel Count',
        name: 'Download Parallel Count',
        type: 'Download Parallel Count',

        autoComplete: 'family-name',
      },
    },
  ];
  const cluster = [
    {
      id: 1,
      created_at: '2023-04-12T06:36:51Z',
      updated_at: '2023-04-12T06:36:51Z',
      name: 'scheduler-cluster-1',
      bio: '',
      config: { filter_parent_limit: 4, filter_parent_range_limit: 40 },
      client_config: { concurrent_piece_count: 4, load_limit: 50 },
      scopes: {},
      is_default: true,
      seed_peer_clusters: [
        {
          id: 1,
          created_at: '2023-04-12T06:36:51Z',
          updated_at: '2023-04-12T06:36:51Z',
          name: 'seed-peer-cluster-1',
          bio: '',
          config: { load_limit: 300 },
          is_default: true,
          scheduler_clusters: null,
          jobs: null,
        },
      ],
      security_group_id: 0,
      jobs: null,
    },
    {
      id: 2,
      created_at: '2023-04-12T06:36:51Z',
      updated_at: '2023-04-12T06:36:51Z',
      name: 'scheduler-cluster-2',
      bio: '',
      config: { filter_parent_limit: 4, filter_parent_range_limit: 40 },
      client_config: { concurrent_piece_count: 4, load_limit: 50 },
      scopes: {},
      is_default: true,
      seed_peer_clusters: [
        {
          id: 1,
          created_at: '2023-04-12T06:36:51Z',
          updated_at: '2023-04-12T06:36:51Z',
          name: 'seed-peer-cluster-1',
          bio: '',
          config: { load_limit: 300 },
          is_default: true,
          scheduler_clusters: null,
          jobs: null,
        },
      ],
      security_group_id: 0,
      jobs: null,
    },
  ];

  const schedulers = [
    {
      id: 1,
      created_at: '2023-04-12T06:36:51Z',
      updated_at: '2023-04-19T03:34:42Z',
      host_name: 'f3b1ddbbe0f9',
      idc: '',
      location: '',
      ip: '11.122.202.34',
      port: 8002,
      state: 'active',
      features: ['schedule', 'preheat'],
      SchedulerClusterID: 1,
    },
    {
      id: 2,
      created_at: '2023-04-12T06:36:51Z',
      updated_at: '2023-04-19T03:34:42Z',
      host_name: 'f3b233ddbbe0f9',
      idc: '',
      location: '',
      ip: '11.122.202.34',
      port: 8003,
      state: 'active',
      features: ['schedule', 'preheat'],
      SchedulerClusterID: 1,
    },
  ];

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Grid item xs={3}>
          <Button>add cluster</Button>
          {cluster.map((item) => (
            <Grid item xs={12} key={item.id} sx={{ display: 'flex' }}>
              <Tooltip title="scheduler-cluster-1" placement="top-start">
                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  sx={{
                    textTransform: 'none',
                    width: '12rem',
                  }}
                >
                  {item.name}
                </Button>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        <Divider orientation="vertical" flexItem />
        <Grid item xs={12}>
          <Grid>
            <Button variant="outlined" onClick={handleClickOpen}>
              upda cluster
            </Button>
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Update Cluster</DialogTitle>
              <DialogContent>
                {fromList.map((item) => (
                  <TextField
                    margin="normal"
                    color="success"
                    required
                    fullWidth
                    key={item.formProps.name}
                    {...item.formProps}
                  ></TextField>
                ))}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Subscribe</Button>
              </DialogActions>
            </Dialog>
            <Button>delete cluster</Button>
            <Grid sx={{ ml: 2 }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell> host_name</TableCell>
                      <TableCell>ip</TableCell>
                      <TableCell>port</TableCell>
                      <TableCell>state</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedulers.map((row) => (
                      <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell align="left">{row.host_name}</TableCell>
                        <TableCell align="left">{row.ip}</TableCell>
                        <TableCell align="left">{row.port}</TableCell>
                        <TableCell align="left">{row.state}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default Job;
Job.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
