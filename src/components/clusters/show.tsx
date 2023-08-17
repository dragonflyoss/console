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
  Pagination,
  Autocomplete,
  TextField,
  Stack,
  Divider,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getSchedulers, getSeedPeers, getCluster, deleteCluster, deleteScheduler, deleteSeedPeer } from '../../lib/api';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import styles from './show.module.css';
import SearchIcon from '@mui/icons-material/Search';
import _ from 'lodash';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ShowCluster() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [schedulerIsLoading, setSchedulerIsLoading] = useState(true);
  const [seedPeerIsLoading, setSeedPeerIsLoading] = useState(true);
  const [openDeletCluster, setOpenDeletCluster] = useState(false);
  const [openDeletScheduler, setOpenDeletScheduler] = useState(false);
  const [openDeletSeedPeers, setOpenDeletSeedPeers] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [schedulerSelectedRow, setSchedulerSelectedRow] = useState(null);
  const [schedulerSelectedID, setSchedulerSelectedID] = useState('');
  const [seedPeersSelectedRow, setSeedPeersSelectedRow] = useState(null);
  const [seedPeersSelectedID, setSeedPeersSelectedID] = useState('');
  const [schedulerPage, setSchedulerPage] = useState(1);
  const [schedulerTotalPages, setSchedulerTotalPages] = useState<number>(1);
  const [seedPeerPage, setSeedPeerPage] = useState(1);
  const [seedPeerTotalPages, setSeedPeerTotalPages] = useState<number>(1);
  const [schedulerPageSize] = useState(5);
  const [seedPeerPageSize] = useState(5);
  const [schedulerSearchValue, setSchedulerSearchValue] = useState('');
  const [seedPeerSearchValue, setSeedPeerSearchValue] = useState('');
  const [scheduler, setScheduler] = useState([{ host_name: '' }]);
  const [seedPeer, setSeedPeer] = useState([{ host_name: '' }]);
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
  const [allScheduler, setAllSchedler] = useState([
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
  const [allseedPeer, setAllSeedPeer] = useState([
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
      primary: {
        main: '#1C293A',
      },
      secondary: {
        main: '#2E8F79',
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

  useEffect(() => {
    (async function () {
      try {
        setSchedulerIsLoading(true);

        if (cluster.scheduler_cluster_id !== 0) {
          const [scheduler, schedulers] = await Promise.all([
            getSchedulers({
              scheduler_cluster_id: String(cluster.scheduler_cluster_id),
              page: 1,
              per_page: 1000,
            }),
            getSchedulers({
              scheduler_cluster_id: String(cluster.scheduler_cluster_id),
              page: schedulerPage,
              per_page: schedulerPageSize,
            }),
          ]);

          setScheduler(scheduler.data);
          setAllSchedler(schedulers.data);
          setSchedulerTotalPages(schedulers.total_page || 1);
          setSchedulerIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setSchedulerIsLoading(false);
        }
      }
    })();
  }, [cluster.scheduler_cluster_id, schedulerPage, schedulerPageSize]);

  useEffect(() => {
    (async function () {
      try {
        setSeedPeerIsLoading(true);

        if (cluster.seed_peer_cluster_id !== 0) {
          const [seedPeer, seedPeers] = await Promise.all([
            getSeedPeers({
              seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
              page: 1,
              per_page: 1000,
            }),
            getSeedPeers({
              seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
              page: seedPeerPage,
              per_page: seedPeerPageSize,
            }),
          ]);

          setSeedPeer(seedPeer.data);
          setAllSeedPeer(seedPeers.data);
          setSeedPeerTotalPages(seedPeers.total_page || 1);
          setSeedPeerIsLoading(false);
        } else {
          setSeedPeerIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setSeedPeerIsLoading(false);
        }
      }
    })();
  }, [cluster.seed_peer_cluster_id, seedPeerPage, seedPeerPageSize]);

  const numberOfActiveSchedulers =
    Array.isArray(scheduler) && scheduler?.filter((item: any) => item?.state === 'active').length;

  const numberOfActiveSeedPeers =
    Array.isArray(seedPeer) && seedPeer?.filter((item: any) => item?.state === 'active').length;

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

      if (cluster.scheduler_cluster_id !== 0) {
        const [scheduler, schedulers] = await Promise.all([
          getSchedulers({
            scheduler_cluster_id: String(cluster.scheduler_cluster_id),
            page: 1,
            per_page: 1000,
          }),
          getSchedulers({
            scheduler_cluster_id: String(cluster.scheduler_cluster_id),
            page: schedulerPage,
            per_page: schedulerPageSize,
          }),
        ]);

        setScheduler(scheduler.data);

        schedulers.data.length === 0 && schedulerPage > 1
          ? setSchedulerPage(schedulerPage - 1)
          : setAllSchedler(schedulers.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  const handleDeleteSeedPeers = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteSeedPeer(seedPeersSelectedID);
      setSuccessMessage(true);
      setOpenDeletSeedPeers(false);
      setDeleteLoadingButton(false);
      if (cluster.seed_peer_cluster_id !== 0) {
        const [seedPeer, seedPeers] = await Promise.all([
          getSeedPeers({
            seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
            page: 1,
            per_page: 1000,
          }),
          getSeedPeers({
            seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
            page: seedPeerPage,
            per_page: seedPeerPageSize,
          }),
        ]);

        setSeedPeer(seedPeer.data);
        seedPeers?.data.length === 0 && seedPeerPage > 1
          ? setSeedPeerPage(seedPeerPage - 1)
          : setAllSeedPeer(seedPeers.data);
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
  const schedulerKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const submitButton = document.getElementById('scheduler-button');
      submitButton?.click();
    }
  };

  const seedPeerKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const submitButton = document.getElementById('seedPeer-button');
      submitButton?.click();
    }
  };

  const searchScheduler = async () => {
    try {
      const scheduler = await getSchedulers({
        scheduler_cluster_id: String(cluster.scheduler_cluster_id),
        page: 1,
        per_page: schedulerPageSize,
        host_name: schedulerSearchValue,
      });

      setAllSchedler(scheduler.data);
      setSchedulerTotalPages(scheduler.total_page || 1);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  const searchSeedPeer = async () => {
    try {
      const seedPeer = await getSeedPeers({
        seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
        page: 1,
        per_page: seedPeerPageSize,
        host_name: seedPeerSearchValue,
      });

      setAllSeedPeer(seedPeer.data);
      setSeedPeerTotalPages(seedPeer.total_page || 1);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
        <Box sx={{ display: 'flex' }}>
          <Paper
            variant="outlined"
            sx={{ width: '50%', mr: '0.5rem', p: '1.2rem', display: 'flex', justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', width: '70%' }}>
              <Box
                component="img"
                src="/icons/cluster/scheduler-statistics.svg"
                sx={{ width: '6rem', height: '6rem' }}
              />
              <Box sx={{ ml: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontFamily="mabry-bold">
                  Scheduler
                </Typography>
                <Box>
                  <Typography variant="h5" fontFamily="mabry-bold">
                    {scheduler.length}
                  </Typography>
                  <div>number of scheduler</div>
                </Box>
              </Box>
            </Box>
            <Chip
              size="small"
              icon={<Box component="img" src="/icons/cluster/active.svg" sx={{ width: '1.2rem', height: '1.2rem' }} />}
              label={`Active:${numberOfActiveSchedulers}`}
            />
          </Paper>
          <Paper
            variant="outlined"
            sx={{ width: '50%', ml: '0.5rem', p: '1.2rem', display: 'flex', justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', width: '70%' }}>
              <Box
                component="img"
                src="/icons/cluster/scheduler-statistics.svg"
                sx={{ width: '6rem', height: '6rem' }}
              />
              <Box sx={{ ml: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontFamily="mabry-bold">
                  Seed Peer
                </Typography>
                <Box>
                  <Typography variant="h5" fontFamily="mabry-bold">
                    {seedPeer.length}
                  </Typography>
                  <div>number of seed peer</div>
                </Box>
              </Box>
            </Box>
            <Chip
              size="small"
              icon={<Box component="img" src="/icons/cluster/active.svg" sx={{ width: '1.2rem', height: '1.2rem' }} />}
              label={`Active:${numberOfActiveSeedPeers}`}
            />
          </Paper>
        </Box>
        <Typography variant="h6" gutterBottom fontFamily="mabry-bold" mt="2rem" mb="1rem">
          Scheduler Cluster
        </Typography>
        <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Box className={styles.searchContainer}>
            <Stack spacing={2} sx={{ width: '20rem' }}>
              <Autocomplete
                size="small"
                color="secondary"
                id="free-solo-demo"
                freeSolo
                onKeyDown={schedulerKeyDown}
                inputValue={schedulerSearchValue}
                onInputChange={(_event, newInputValue) => {
                  setSchedulerSearchValue(newInputValue);
                }}
                options={scheduler.map((option) => option?.host_name)}
                renderInput={(params) => <TextField {...params} label="Search" />}
              />
            </Stack>
            <IconButton
              type="button"
              aria-label="search"
              id="scheduler-button"
              size="small"
              onClick={searchScheduler}
              sx={{ width: '3rem' }}
            >
              <SearchIcon sx={{ color: 'rgba(0,0,0,0.6)' }} />
            </IconButton>
          </Box>
          <Box width="100%">
            <Divider />
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
                {allScheduler.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      -
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {Array.isArray(allScheduler) &&
                      allScheduler.map((item: any) => {
                        return (
                          <TableRow
                            key={item?.id}
                            selected={schedulerSelectedRow === item}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell align="center">{schedulerIsLoading ? <Skeleton /> : item?.id}</TableCell>
                            <TableCell align="center">
                              {schedulerIsLoading ? (
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
                              {schedulerIsLoading ? (
                                <Skeleton />
                              ) : (
                                <Box className={styles.ipContainer}>
                                  <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                                  {item?.ip}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell align="center">{schedulerIsLoading ? <Skeleton /> : item?.port}</TableCell>
                            <TableCell align="center">
                              {schedulerIsLoading ? (
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
                              {schedulerIsLoading ? (
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
          </Box>
        </Paper>
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
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={schedulerTotalPages}
            page={schedulerPage}
            onChange={(_event: any, newPage: number) => {
              setSchedulerPage(newPage);
            }}
            color="primary"
            size="small"
          />
        </Box>
        <Typography variant="h6" gutterBottom fontFamily="mabry-bold" mt="2rem" mb="1rem">
          Seed Peer Cluster
        </Typography>
        <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Box className={styles.searchContainer}>
            <Stack spacing={2} sx={{ width: '20rem' }}>
              <Autocomplete
                size="small"
                color="secondary"
                id="seedPeerSearch"
                freeSolo
                onKeyDown={seedPeerKeyDown}
                inputValue={seedPeerSearchValue}
                onInputChange={(_event, newInputValue) => {
                  setSeedPeerSearchValue(newInputValue);
                }}
                options={seedPeer.map((option) => option.host_name)}
                renderInput={(params) => <TextField {...params} label="Search" />}
              />
            </Stack>
            <IconButton
              type="button"
              aria-label="search"
              id="seedPeer-button"
              size="small"
              onClick={searchSeedPeer}
              sx={{ width: '3rem' }}
            >
              <SearchIcon sx={{ color: 'rgba(0,0,0,0.6)' }} />
            </IconButton>
          </Box>
          <Box width="100%">
            <Divider />
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
                {allseedPeer.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      -
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {Array.isArray(allseedPeer) &&
                      allseedPeer.map((item: any) => {
                        return (
                          <TableRow
                            key={item?.id}
                            selected={seedPeersSelectedRow === item}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell align="center">{seedPeerIsLoading ? <Skeleton /> : item?.id}</TableCell>
                            <TableCell align="center">
                              {seedPeerIsLoading ? (
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
                              {seedPeerIsLoading ? (
                                <Skeleton />
                              ) : (
                                <Box className={styles.ipContainer}>
                                  <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                                  {item?.ip}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell align="center">{seedPeerIsLoading ? <Skeleton /> : item?.port}</TableCell>
                            <TableCell align="center">
                              {seedPeerIsLoading ? <Skeleton /> : item?.download_port}
                            </TableCell>
                            <TableCell align="center">
                              {seedPeerIsLoading ? (
                                <Skeleton />
                              ) : item?.object_storage_port === 0 ? (
                                '-'
                              ) : (
                                item?.object_storage_port
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {seedPeerIsLoading ? <Skeleton /> : _.upperFirst(item?.type) || ''}
                            </TableCell>
                            <TableCell align="center">
                              {seedPeerIsLoading ? (
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
          </Box>
        </Paper>
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
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={seedPeerTotalPages}
            page={seedPeerPage}
            onChange={(_event: any, newPage: number) => {
              setSeedPeerPage(newPage);
            }}
            color="primary"
            size="small"
          />
        </Box>
        <Grid sx={{ height: 2 }}> </Grid>
      </Box>
    </ThemeProvider>
  );
}
