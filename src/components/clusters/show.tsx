import * as React from 'react';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Information from './information';
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
  IconButton,
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
import { useEffect, useState } from 'react';
import { getSchedulers, getSeedPeers, getCluster, deleteCluster, deleteScheduler, deleteSeedPeer } from '../../lib/api';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import styles from './show.module.css';
import _ from 'lodash';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ShowCluster() {
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

  const params = useParams();
  const navigate = useNavigate();

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

        if (typeof params.id === 'string') {
          const cluster = await getCluster(params.id);
          setCluster(cluster);

          const [schedulers, seedPeers] = await Promise.all([
            getSchedulers({ scheduler_cluster_id: String(cluster.scheduler_cluster_id), page: 1, per_page: 1000 }),
            getSeedPeers({ seed_peer_cluster_id: String(cluster.seed_peer_cluster_id), page: 1, per_page: 1000 }),
          ]);

          setSchedlerList(schedulers);
          setSeedPeerList(seedPeers);
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
  }, [params.id]);

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
      if (typeof params.id === 'string') {
        await deleteCluster(params.id);
        setDeleteLoadingButton(false);
        setSuccessMessage(true);
        setOpenDeletCluster(false);
        navigate('/clusters');
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

  const handleDeleteScheduler = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteScheduler(schedulerSelectedID);
      setSuccessMessage(true);
      setOpenDeletScheduler(false);
      setDeleteLoadingButton(false);

      if (typeof params.id === 'string') {
        const response = await getSchedulers({
          scheduler_cluster_id: String(cluster.scheduler_cluster_id),
          page: 1,
          per_page: 1000,
        });
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

  const handleDeleteSeedPeers = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteSeedPeer(seedPeersSelectedID);
      setSuccessMessage(true);
      setOpenDeletSeedPeers(false);
      setDeleteLoadingButton(false);

      if (typeof params.id === 'string') {
        const response = await getSeedPeers({
          seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
          page: 1,
          per_page: 1000,
        });
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
        <RouterLink underline="hover" component={Link} color="inherit" to={`/clusters`}>
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
                navigate(`/clusters/${params.id}/edit`);
              }}
              size="small"
              variant="contained"
              className={styles.updateButton}
              sx={{
                '&.MuiButton-root': {
                  backgroundColor: 'var(--button-color)',
                  borderRadius: 0,
                  color: '#fff',
                },
                mr: '1rem',
              }}
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
              sx={{
                '&.MuiButton-root': {
                  backgroundColor: 'var(--button-color)',
                  borderRadius: 0,
                  color: '#fff',
                },
              }}
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
                Are you sure you want to delet this cluster?
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
      <Information cluster={cluster} isLoading={isLoading} />
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
                              to={`/clusters/${params.id}/schedulers/${item?.id}`}
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
                          <IconButton
                            sx={{
                              '&.MuiButton-root': {
                                backgroundColor: 'var(--button-color)',
                                borderRadius: 0,
                                color: '#fff',
                              },
                            }}
                            onClick={() => {
                              openHandleScheduler(item);
                            }}
                          >
                            <DeleteIcon
                              fontSize="large"
                              sx={{ color: 'var(--button-color)', width: '2rem', height: '2rem' }}
                            />
                          </IconButton>
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
                Are you sure you want to delet this scheduler?
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
              onClick={handleDeleteScheduler}
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
                  seedPeerList.map((item: any) => {
                    return (
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
                              to={`/clusters/${params.id}/seed-peers/${item?.id}`}
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
                        <TableCell align="center">
                          {isLoading ? <Skeleton /> : _.upperFirst(item?.type) || ''}
                        </TableCell>
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
                          <IconButton
                            sx={{
                              '&.MuiButton-root': {
                                backgroundColor: 'var(--button-color)',
                                borderRadius: 0,
                                color: '#fff',
                              },
                            }}
                            onClick={() => {
                              openHandleSeedPeers(item);
                            }}
                          >
                            <DeleteIcon
                              fontSize="large"
                              sx={{ color: 'var(--button-color)', width: '2rem', height: '2rem' }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                Are you sure you want to delet this seed peer?
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
              onClick={handleDeleteSeedPeers}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Paper>
      <Grid sx={{ height: 2 }}> </Grid>
    </Box>
  );
}
