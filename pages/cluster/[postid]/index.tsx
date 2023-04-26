import type { NextPageWithLayout } from '../../_app';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Layout from '../../../components/layout';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import styles from './index.module.css';
import { getSchedulerClusters } from 'lib/api';
import {
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
// function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
//   return { name, calories, fat, carbs, protein };
// }
const Cluster: NextPageWithLayout = (props: any) => {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [openUpdata, setOpenUpdata] = React.useState(false);
  console.log(Cookies.get('jwt'));

  // useEffect(() => {
  //   getSchedulerClusters();
  // }, []);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClickUpdataOpen = () => {
    setOpenUpdata(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleUpdata = () => {
    setOpenUpdata(false);
  };
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
  const seedPeer = [
    {
      id: 1,
      created_at: '2023-04-12T06:36:52Z',
      updated_at: '2023-04-21T00:04:42Z',
      host_name: 'b3222d25eea9',
      type: 'super',
      idc: '1',
      location: '',
      ip: '11.122.202.34',
      port: 65006,
      download_port: 65008,
      object_storage_port: 0,
      state: 'active',
      SeedPeerClusterID: 1,
    },
  ];
  const formlist = [
    {
      id: 'id',
      lable: 'ID',
      box: 2,
      prent: 'ID',
    },
    {
      id: 'name',
      lable: 'Name',
      box: 2,
      prent: 'Name',
    },
    {
      id: 'isDefault',
      lable: 'IsDefault',
      box: 2,
      prent: 'IsDefault',
      isDefault: 'true',
    },
    {
      id: 'bio',
      lable: 'BIO',
      box: 12,
      prent: 'bio',
    },
  ];

  const clusterInfo = [
    {
      key: 'Scopes',
      label: 'Scopes',
      title: 'Scopes',
      scopes: [
        {
          key: 'idc',
          en_US: 'IDC',
          label: 'idc',
        },
        {
          key: 'location',
          en_US: 'Location',
          label: 'location',
        },
        {
          key: 'cidrs',
          en_US: 'CIDRS',
          label: 'cidrs',
        },
      ],
    },

    {
      key: 'SchedulerClusterConfig',
      label: 'scheduler',
      title: 'scheduler',
      scopes: [
        {
          key: 'filter_parent_limit',
          en_US: 'Ilter Parent Limit',
          label: 'filter_parent_limit',
        },
        {
          key: 'filter_parent_range_limit',
          en_US: 'Filter Parent Range Limit',
          label: 'filter_parent_range_limit',
        },
      ],
    },
    {
      key: 'Peer',
      label: 'Peer',
      title: 'Peer',
      scopes: [
        {
          key: 'seedPeerClusterload_limit',
          en_US: 'seedPeerClusterload Limit',
          label: 'seedPeerClusterload_limit',
        },
        {
          key: 'Peerload_limit',
          en_US: 'Peerload Limit',
          label: 'Peerload_limit',
        },
        {
          key: 'concurrent_piece_count',
          en_US: 'Concurrent Piece Count',
          label: 'concurrent_piece_count',
        },
      ],
    },
  ];

  const info = [
    {
      key: 'Scopes',
      label: 'Scopes',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Scopes',
    },
    {
      key: 'Concurrent Piece Count',
      label: 'Concurrent Piece Count',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Concurrent Piece Count',
    },
    {
      key: 'Load Limit',
      label: 'Load Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Load Limit',
    },
    ,
    {
      key: 'Scheduler Cluster Config',
      label: 'Scheduler Cluster Config',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Scheduler Cluster Config',
    },
    {
      key: 'Filter Parent Limit',
      label: 'Filter Parent Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Filter Parent Limit',
    },
    {
      key: 'Filter Parent Range Limit',
      label: 'Filter Parent Range Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Filter Parent Range Limit',
    },

    {
      key: 'Seed Peer Cluster Config',
      label: 'Seed Peer Cluster Config',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Seed Peer Cluster Config',
    },
    {
      key: 'Load Limit',
      label: 'Load Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Load Limit',
    },
    {
      key: 'bio',
      label: 'bio',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Bio',
    },

    {
      key: 'is_default',
      label: 'IDC',
      tab: '1',
      parent: 'scopes',
      props: {
        placeholder: 'Please enter IDC, separated by "|" characters',
      },
      en_US: 'Is Default',
    },
    {
      key: 'Scopes',
      label: 'Scopes',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Scopes',
    },
    {
      key: 'Cidrs',
      label: 'Cidrs',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Cidrs',
    },
    {
      key: 'idc',
      label: 'IDC',
      tab: '1',
      parent: 'scopes',
      props: {
        placeholder: 'Please enter IDC, separated by "|" characters',
      },
      en_US: 'IDC',
    },
    {
      key: 'location',
      label: 'Location',
      tab: '1',
      parent: 'scopes',
      props: {
        placeholder: 'Please enter Location, separated by "|" characters',
      },
      en_US: 'Location',
    },
    {
      key: 'created_at',
      label: '创建时间',
      hide: true,
      en_US: 'Create Time',
    },
    {
      key: 'updated_at',
      label: '更新时间',
      hide: true,
      en_US: 'Update Time',
    },
  ];

  const information = [
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
  const str = clusterInfo.map((item) => {
    const source: any = information[0] || {};
    return source[item.key];
  });
  const arr=str.map(sub=>{
    const source: any = information[0] || {};
    return sub
  })
  console.log(arr);

  return (
    <Grid className={styles.main}>
      <Grid item xs={12} sx={{ mb: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleClickOpen} size="small">
          Delete Cluster
        </Button>
        <Button variant="contained" size="small" onClick={handleClickUpdataOpen} sx={{ ml: '1rem' }}>
          Updata Cluster
        </Button>
        <Dialog
          open={openUpdata}
          onClose={handleUpdata}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{' Updata Cluster'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">Are you sure to delete this cluster?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUpdata}>Disagree</Button>
            <Button onClick={handleUpdata} autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add Cluster</DialogTitle>
          <DialogContent>
            {info.map((sub: any, id: number) => {
              if (sub.title) {
                return <h3 key={id}>{sub.en_US}</h3>;
              } else {
                return (
                  <TextField
                    margin="normal"
                    color="success"
                    required
                    fullWidth
                    name={sub.key}
                    key={id}
                    label={sub.en_US}
                    {...(sub.formprops || '')}
                  ></TextField>
                );
              }
            })}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Subscribe</Button>
          </DialogActions>
        </Dialog>
      </Grid>
      <Divider />

      <Typography variant="h5" gutterBottom sx={{ m: '1rem' }}>
        Information
      </Typography>
      <Grid sx={{ display: 'flex', mb: 2 }}>
        <Grid item xs={12} sx={{ display: 'flex', flexWrap: 'wrap', ml: 1 }}>
          {/* {info.map((sub, idx: number) => {
            const source: any = information[0] || {};
            if (sub.title) return null;
            return (
              <Grid
                key={idx}
                item
                xs={2}
                sx={{
                  ml: 1,
                  mt: 1,
                  height: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F2EFE9',
                }}
              >
                <div>{sub.en_US}</div>
                <Tooltip title="Add" placement="top">
                  <div>
                    {sub.parent ? (
                      <Tooltip title={(source[sub.parent] || {})[sub.key] || '-'}>
                        <div
                          style={{
                            width: '90%',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ marginRight: '1rem' }}>:</span>
                          {(source[sub.parent] || {})[sub.key] || '-'}
                        </div>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title={
                          sub.key === 'seed_peer_cluster_id'
                            ? (source['seed_peer_clusters'] || [])[0]?.name || '-'
                            : (source || {})[sub.key] || '-'
                        }
                      >
                        <div
                          style={{
                            width: '90%',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ marginRight: '1rem' }}>:</span>
                          {sub.key === 'seed_peer_cluster_id'
                            ? (source['seed_peer_clusters'] || [])[0]?.name || '-'
                            : (source || {})[sub.key] || '-'}
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </Tooltip>
              </Grid>
            );
          })} */}

          <Grid item xs={12} sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <Grid item xs={12} sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {formlist.map((item, id) => {
                const source: any = information[0] || {};
                return (
                  <Grid className={styles.box} key={id} item xs={item.box}>
                    <Typography variant="h6" className={styles.title}>
                      {item.lable}
                    </Typography>
                    <Tooltip
                      title={
                        item.isDefault ? (
                          <div>{source[item.prent] ? ' true' : 'false'}</div>
                        ) : (
                          <div>{source[item.prent] || '-'}</div>
                        )
                      }
                      placement="top"
                    >
                      {item.isDefault ? (
                        source[item.prent] ? (
                          <div className={styles.content}>true</div>
                        ) : (
                          <div className={styles.content}>false</div>
                        )
                      ) : (
                        <div className={styles.content}>{source[item.prent] || '-'}</div>
                      )}
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>

            <Grid item xs={12} sx={{ m: 2 }}>
              <Divider />
              12
            </Grid>

            {clusterInfo.map((item, id) => {
              const source: any = information[0] || {};
              return (
                <Grid item xs={5} key={id} className={styles.tottom}>
                  <Typography variant="h6" gutterBottom key={id} sx={{ ml: 1 }}>
                    {item.title}
                  </Typography>

                  {item.scopes.map((sub) => (
                    <Grid
                      sx={{
                        ml: 1,
                      }}
                      key={sub.key}
                    >
                      {sub.en_US}
                      {/* <div>{source[item.label] || '-'}</div> */}
                    </Grid>
                  ))}
                </Grid>
              );
            })}

            <Grid>
              <Typography variant="h6" gutterBottom></Typography>
            </Grid>
          </Grid>

          <Divider />
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom>
        Scheduler
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center"> ID</TableCell>
              <TableCell align="center">Host Name</TableCell>
              <TableCell align="center">IP</TableCell>
              <TableCell align="center">IDC</TableCell>
              <TableCell align="center">Location</TableCell>
              <TableCell align="center">Port</TableCell>
              <TableCell align="center">Features</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedulers.map((item) => (
              <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">{item.id}</TableCell>
                <TableCell align="center">
                  <Link href={`${router.asPath}/scheduler/${item.id}`}>{item.host_name}</Link>
                </TableCell>
                <TableCell align="center">{item.ip}</TableCell>
                <TableCell align="center">{item.idc || '-'}</TableCell>
                <TableCell align="center">{item.location || '-'}</TableCell>
                <TableCell align="center">{item.port}</TableCell>
                <TableCell align="center">{item.features}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Seed Peer
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Host Name</TableCell>
              <TableCell align="center">IP</TableCell>
              <TableCell align="center">Port</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Download Port</TableCell>
              <TableCell align="center">Object Storage Port</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seedPeer.map((item) => (
              <TableRow key={item.id}>
                <TableCell align="center">{item.id}</TableCell>
                <TableCell align="center">
                  <Link href={`${router.asPath}/seed-peer/${item.id}`}>{item.host_name}</Link>
                </TableCell>
                <TableCell align="center">{item.host_name}</TableCell>
                <TableCell align="center">{item.ip}</TableCell>
                <TableCell align="center">{item.port}</TableCell>
                <TableCell align="center">{item.type}</TableCell>
                <TableCell align="center">{item.download_port}</TableCell>
                <TableCell align="center">{item.object_storage_port}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid sx={{ height: 2 }}> </Grid>
    </Grid>
  );
};

export default Cluster;
Cluster.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
// export async function getStaticPaths() {
//   const response = await fetch('http://localhost:3000/api/clusters');
//   const reply = await response.json();
//   return {
//     paths: reply.data.map((p: any) => ({
//       params: { postid: p.id.toString() },
//     })),
//     fallback: false,
//   };
// }

// export async function getStaticProps(context: any) {
//   console.log('context', context);
//   const id = context.params.postid;
//   const response = await fetch(`http://localhost:3000/api/clusters/schedule/${id}`);
//   const reply = await response.json();
//   return {
//     props: {
//       reply,
//     },
//   };
// }
