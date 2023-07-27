import type { NextPageWithLayout } from '../../_app';
import Layout from 'components/layout';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Clusters from 'components/cluster';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Link as RouterLink,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { ReactElement, useEffect, useState } from 'react';
import { getSchedulers, getSeedPeers, getCluster, deleteCluster, deleteScheduler, deleteSeedPeer } from 'lib/api';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import styles from './index.module.css';
import _ from 'lodash';

const Cluster: NextPageWithLayout = () => {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openDeletCluster, setOpenDeletCluster] = useState(false);
  const [openDeletScheduler, setOpenDeletScheduler] = useState(false);
  const [openDeletSeedPeers, setOpenDeletSeedPeers] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [schedulerSelectedRow, setSchedulerSelectedRow] = useState(null);
  const [schedulerSelectedID, setSchedulerSelectedID] = useState('');
  const [seedPeersSelectedRow, setSeedPeersSelectedRow] = useState(null);
  const [seedPeersSelectedID, setSeedPeersSelectedID] = useState('');
  const [cluster, setCluster] = useState({
    id: 0,
    name: '',
    bio: '',
    scopes: {
      idc: '',
      location: '',
      cidrs: [''],
    },
    scheduler_cluster_id: 0,
    seed_peer_cluster_id: 0,
    scheduler_cluster_config: {
      candidate_parent_limit: 0,
      filter_parent_limit: 0,
    },
    seed_peer_cluster_config: {
      load_limit: 0,
    },
    peer_cluster_config: {
      load_limit: 0,
      concurrent_piece_count: 0,
    },
    created_at: '',
    updated_at: '',
    is_default: true,
  });
  const [schedulerList, setSchedlerList] = useState([
    {
      id: 0,
      host_name: '',
      idc: '',
      location: '',
      ip: '',
      port: '',
      state: '',
      features: [''],
    },
  ]);
  const [seedPeerList, setSeedPeerList] = useState([
    {
      id: 0,
      host_name: '',
      download_port: '',
      object_storage_port: '',
      ip: '',
      port: '',
      state: '',
      type: '',
    },
  ]);

  const router = useRouter();
  const { asPath, query } = router;

  const theme = createTheme({
    palette: {
      secondary: {
        contrastText: '#fff',
        main: '#239b56',
      },
    },
  });

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        if (typeof query.slug === 'string') {
          const [cluster, scheduler, seedPeer] = await Promise.all([
            getCluster(query.slug),
            getSchedulers({ scheduler_cluster_id: query.slug }),
            getSeedPeers({ seed_peer_cluster_id: query.slug }),
          ]);

          setCluster(cluster);
          setSchedlerList(scheduler);
          setSeedPeerList(seedPeer);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [query.slug]);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  const handleDelete = () => {
    setOpenDeletCluster(false);
    setOpenDeletScheduler(false);
    setSchedulerSelectedRow(null);
    setOpenDeletSeedPeers(false);
    setSeedPeersSelectedRow(null);
  };

  const handledeleteCluster = async () => {
    setDeleteLoadingButton(true);

    try {
      if (typeof query.slug === 'string') {
        deleteCluster(query.slug);
        setDeleteLoadingButton(false);
        setSuccessMessage(true);
        setOpenDeletCluster(false);
        router.push('/clusters');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  const openHandleScheduler = (row: any) => {
    setSchedulerSelectedRow(row);
    setSchedulerSelectedID(row.id);
    setOpenDeletScheduler(true);
  };

  const handledeleteScheduler = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteScheduler(schedulerSelectedID);
      setSuccessMessage(true);
      setOpenDeletScheduler(false);
      setDeleteLoadingButton(false);

      if (typeof query.slug === 'string') {
        const response = await getSchedulers({ scheduler_cluster_id: query.slug });
        setSchedlerList(response);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  const openHandleSeedPeers = (row: any) => {
    setSeedPeersSelectedRow(row);
    setSeedPeersSelectedID(row.id);
    setOpenDeletSeedPeers(true);
  };

  const handledeleteSeedPeers = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteSeedPeer(seedPeersSelectedID);
      setSuccessMessage(true);
      setOpenDeletSeedPeers(false);
      setDeleteLoadingButton(false);

      if (typeof query.slug === 'string') {
        const response = await getSeedPeers({ seed_peer_cluster_id: query.slug });
        setSeedPeerList(response);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessageText}
        </Alert>
      </Snackbar>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink underline="hover" component={Link} color="inherit" href={`/clusters`}>
          clusters
        </RouterLink>
        <Typography color="text.primary" fontFamily="mabry-bold">
          {cluster?.name}
        </Typography>
      </Breadcrumbs>
      <Box className={styles.container}>
        <Typography variant="h5">Cluster</Typography>
        <ThemeProvider theme={theme}>
          <Box>
            <Button
              onClick={() => {
                router.push(`/clusters/${query.slug}/edit`);
              }}
              size="small"
              variant="contained"
              className={styles.updateButton}
            >
              <Box component="img" className={styles.updateClusterIcon} src="/icons/user/edit.svg" />
              Update Cluster
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setOpenDeletCluster(true);
              }}
              className={styles.deleteButton}
            >
              <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
              Delete Cluster
            </Button>
          </Box>
        </ThemeProvider>
        <Dialog
          open={openDeletCluster}
          onClose={handleDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box component="img" className={styles.deleteClusterIcon} src="/icons/cluster/delete.svg" />
              <Typography fontFamily="mabry-bold" pt="1rem">
                Are you sure you want to delet this Cluster?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
              size="small"
              variant="outlined"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  color: 'var(--calcel-size-color)',
                  borderRadius: 0,
                  borderColor: 'var(--calcel-color)',
                },
                ':hover': {
                  backgroundColor: 'var( --calcel-hover-corlor)',
                  borderColor: 'var( --calcel-hover-corlor)',
                },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                mr: '1rem',
                width: '8rem',
              }}
              onClick={handleDelete}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
              size="small"
              variant="outlined"
              type="submit"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  backgroundColor: 'var(--save-color)',
                  borderRadius: 0,
                  color: 'var(--save-size-color)',
                  borderColor: 'var(--save-color)',
                },
                ':hover': { backgroundColor: 'var(--save-hover-corlor)', borderColor: 'var(--save-hover-corlor)' },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                width: '8rem',
              }}
              onClick={handledeleteCluster}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Clusters cluster={cluster} isLoading={isLoading} />
      <Typography variant="subtitle1" gutterBottom fontFamily="mabry-bold" mt="2rem" mb="1rem">
        Scheduler Cluster
      </Typography>
      <Paper variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  ID
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Hostname
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  IP
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  IDC
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Location
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  State
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Features
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Operation
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedulerList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  -
                </TableCell>
              </TableRow>
            ) : (
              <>
                {Array.isArray(schedulerList) &&
                  schedulerList.map((item: any) => {
                    return (
                      <TableRow
                        key={item?.id}
                        selected={schedulerSelectedRow === item}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.id}</TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <RouterLink
                              component={Link}
                              href={`${asPath}/schedulers/${item?.id}`}
                              underline="hover"
                              sx={{ color: 'var(--description-color)' }}
                            >
                              {item?.host_name}
                            </RouterLink>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <Box className={styles.ipContainer}>
                              <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                              {item?.ip}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.port}</TableCell>
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.idc || '-'}</TableCell>
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.location || '-'}</TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <Chip
                              label={_.upperFirst(item?.state) || ''}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: '0%',
                                backgroundColor:
                                  item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                                color: item?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                                borderColor:
                                  item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <>
                              {Array.isArray(item.features) &&
                                item.features.map((item: string, id: any) => (
                                  <Chip
                                    key={id}
                                    label={_.upperFirst(item) || ''}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderRadius: '0%',
                                      background: 'var(--button-color)',
                                      color: '#FFFFFF',
                                      mr: '0.4rem',
                                      borderColor: 'var(--button-color)',
                                      fontWeight: 'bold',
                                    }}
                                  />
                                ))}
                            </>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            onClick={() => {
                              openHandleScheduler(item);
                            }}
                            size="small"
                            variant="contained"
                            sx={{
                              '&.MuiButton-root': {
                                backgroundColor: 'var(--button-color)',
                                borderRadius: 0,
                                color: '#fff',
                              },
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </>
            )}
          </TableBody>
        </Table>
        <Dialog
          open={openDeletScheduler}
          onClose={handleDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box component="img" className={styles.deleteClusterIcon} src="/icons/cluster/delete.svg" />
              <Typography fontFamily="mabry-bold" pt="1rem">
                Are you sure you want to delet this Scheduler Cluster?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
              size="small"
              variant="outlined"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  color: 'var(--calcel-size-color)',
                  borderRadius: 0,
                  borderColor: 'var(--calcel-color)',
                },
                ':hover': {
                  backgroundColor: 'var( --calcel-hover-corlor)',
                  borderColor: 'var( --calcel-hover-corlor)',
                },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                mr: '1rem',
                width: '8rem',
              }}
              onClick={() => {
                setOpenDeletScheduler(false);
                setSchedulerSelectedRow(null);
              }}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
              size="small"
              variant="outlined"
              type="submit"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  backgroundColor: 'var(--save-color)',
                  borderRadius: 0,
                  color: 'var(--save-size-color)',
                  borderColor: 'var(--save-color)',
                },
                ':hover': { backgroundColor: 'var(--save-hover-corlor)', borderColor: 'var(--save-hover-corlor)' },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                width: '8rem',
              }}
              onClick={handledeleteScheduler}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Paper>
      <Typography variant="subtitle1" gutterBottom fontFamily="mabry-bold" mt="2rem" mb="1rem">
        Seed Peer Cluster
      </Typography>
      <Paper variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  ID
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Hostname
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  IP
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Download Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Object Storage Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Type
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  State
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Operation
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seedPeerList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  -
                </TableCell>
              </TableRow>
            ) : (
              <>
                {Array.isArray(seedPeerList) &&
                  seedPeerList.map((item: any) => (
                    <TableRow
                      key={item?.id}
                      selected={seedPeersSelectedRow === item}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center">{isLoading ? <Skeleton /> : item?.id}</TableCell>
                      <TableCell align="center">
                        {isLoading ? (
                          <Skeleton />
                        ) : (
                          <RouterLink
                            component={Link}
                            href={`${asPath}/seed-peers/${item?.id}`}
                            underline="hover"
                            sx={{ color: 'var(--description-color)' }}
                          >
                            {item?.host_name}
                          </RouterLink>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {isLoading ? (
                          <Skeleton />
                        ) : (
                          <Box className={styles.ipContainer}>
                            <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                            {item?.ip}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">{isLoading ? <Skeleton /> : item?.port}</TableCell>
                      <TableCell align="center">{isLoading ? <Skeleton /> : item?.download_port}</TableCell>
                      <TableCell align="center">
                        {isLoading ? <Skeleton /> : item?.object_storage_port === 0 ? '-' : item?.object_storage_port}
                      </TableCell>
                      <TableCell align="center">{isLoading ? <Skeleton /> : _.upperFirst(item?.type) || ''}</TableCell>
                      <TableCell align="center">
                        {isLoading ? (
                          <Skeleton />
                        ) : (
                          <Chip
                            label={_.upperFirst(item?.state) || ''}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: '0%',
                              backgroundColor:
                                item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                              color: item?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                              borderColor:
                                item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          onClick={() => {
                            openHandleSeedPeers(item);
                          }}
                          size="small"
                          variant="contained"
                          sx={{
                            '&.MuiButton-root': {
                              backgroundColor: 'var(--button-color)',
                              borderRadius: 0,
                              color: '#fff',
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            )}
          </TableBody>
        </Table>
        <Dialog
          open={openDeletSeedPeers}
          onClose={handleDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box component="img" className={styles.deleteClusterIcon} src="/icons/cluster/delete.svg" />
              <Typography fontFamily="mabry-bold" pt="1rem">
                Are you sure you want to delet this Seed Peer Cluster?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
              size="small"
              variant="outlined"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  color: 'var(--calcel-size-color)',
                  borderRadius: 0,
                  borderColor: 'var(--calcel-color)',
                },
                ':hover': {
                  backgroundColor: 'var( --calcel-hover-corlor)',
                  borderColor: 'var( --calcel-hover-corlor)',
                },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                mr: '1rem',
                width: '8rem',
              }}
              onClick={() => {
                setOpenDeletSeedPeers(false);
                setSeedPeersSelectedRow(null);
              }}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
              size="small"
              variant="outlined"
              type="submit"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  backgroundColor: 'var(--save-color)',
                  borderRadius: 0,
                  color: 'var(--save-size-color)',
                  borderColor: 'var(--save-color)',
                },
                ':hover': { backgroundColor: 'var(--save-hover-corlor)', borderColor: 'var(--save-hover-corlor)' },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                width: '8rem',
              }}
              onClick={handledeleteSeedPeers}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Paper>
      <Grid sx={{ height: 2 }}> </Grid>
    </Box>
  );
};

export default Cluster;

Cluster.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
