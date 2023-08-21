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
import {
  MAX_PAGE_SIZE,
  DEFAULT_SCHEDULER_TABLE_PAGE_SIZE,
  DEFAULT_SEED_PEER_TABLE_PAGE_SIZE,
} from '../../lib/constants';

export default function ShowCluster() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [informationIsLoading, setInformationIsLoading] = useState(true);
  const [schedulerTableIsLoading, setSchedulerTableIsLoading] = useState(true);
  const [seedPeerTableIsLoading, setSeedPeerTableIsLoading] = useState(true);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [openDeleteCluster, setOpenDeleteCluster] = useState(false);
  const [openDeleteScheduler, setOpenDeleteScheduler] = useState(false);
  const [openDeleteSeedPeer, setOpenDeleteSeedPeer] = useState(false);
  const [schedulerSelectedRow, setSchedulerSelectedRow] = useState(null);
  const [schedulerSelectedID, setSchedulerSelectedID] = useState('');
  const [seedPeerSelectedRow, setSeedPeerSelectedRow] = useState(null);
  const [seedPeerSelectedID, setSeedPeerSelectedID] = useState('');
  const [schedulerPage, setSchedulerPage] = useState(1);
  const [schedulerTotalPages, setSchedulerTotalPages] = useState<number>(1);
  const [seedPeerPage, setSeedPeerPage] = useState(1);
  const [seedPeerTotalPages, setSeedPeerTotalPages] = useState<number>(1);
  const [searchSchedulers, setSearchSchedulers] = useState('');
  const [searchSeedPeers, setSearchSeedPeer] = useState('');
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
  const [allSchedulers, setAllSchedlers] = useState([
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
  const [allseedPeers, setAllSeedPeers] = useState([
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
        setInformationIsLoading(true);

        if (typeof params.id === 'string') {
          const cluster = await getCluster(params.id);
          setCluster(cluster);
          setInformationIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setInformationIsLoading(false);
        }
      }
    })();
  }, [params.id]);

  useEffect(() => {
    (async function () {
      try {
        setSchedulerTableIsLoading(true);

        if (cluster.scheduler_cluster_id !== 0) {
          const [scheduler, schedulers] = await Promise.all([
            getSchedulers({
              scheduler_cluster_id: String(cluster.scheduler_cluster_id),
              page: 1,
              per_page: MAX_PAGE_SIZE,
            }),
            getSchedulers({
              scheduler_cluster_id: String(cluster.scheduler_cluster_id),
              page: schedulerPage,
              per_page: DEFAULT_SCHEDULER_TABLE_PAGE_SIZE,
            }),
          ]);

          setScheduler(scheduler.data);
          setAllSchedlers(schedulers.data);
          setSchedulerTotalPages(schedulers.total_page || 1);
          setSchedulerTableIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setSchedulerTableIsLoading(false);
        }
      }
    })();
  }, [cluster.scheduler_cluster_id, schedulerPage]);

  useEffect(() => {
    (async function () {
      try {
        setSeedPeerTableIsLoading(true);

        if (cluster.seed_peer_cluster_id !== 0) {
          const [seedPeer, seedPeers] = await Promise.all([
            getSeedPeers({
              seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
              page: 1,
              per_page: MAX_PAGE_SIZE,
            }),
            getSeedPeers({
              seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
              page: seedPeerPage,
              per_page: DEFAULT_SEED_PEER_TABLE_PAGE_SIZE,
            }),
          ]);

          setSeedPeer(seedPeer.data);
          setAllSeedPeers(seedPeers.data);
          setSeedPeerTotalPages(seedPeers.total_page || 1);
          setSeedPeerTableIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setSeedPeerTableIsLoading(false);
        }
      }
    })();
  }, [cluster.seed_peer_cluster_id, seedPeerPage]);

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

  const handleDeleteClose = () => {
    setOpenDeleteCluster(false);
    setOpenDeleteScheduler(false);
    setSchedulerSelectedRow(null);
    setOpenDeleteSeedPeer(false);
    setSeedPeerSelectedRow(null);
  };

  const handleDeleteCluster = async () => {
    setDeleteLoadingButton(true);

    try {
      if (typeof params.id === 'string') {
        await deleteCluster(params.id);
        setDeleteLoadingButton(false);
        setSuccessMessage(true);
        setOpenDeleteCluster(false);
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
    setOpenDeleteScheduler(true);
  };

  const handleDeleteScheduler = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteScheduler(schedulerSelectedID);
      setSuccessMessage(true);
      setOpenDeleteScheduler(false);
      setDeleteLoadingButton(false);

      if (cluster.scheduler_cluster_id !== 0) {
        const [scheduler, schedulers] = await Promise.all([
          getSchedulers({
            scheduler_cluster_id: String(cluster.scheduler_cluster_id),
            page: 1,
            per_page: MAX_PAGE_SIZE,
          }),
          getSchedulers({
            scheduler_cluster_id: String(cluster.scheduler_cluster_id),
            page: schedulerPage,
            per_page: DEFAULT_SCHEDULER_TABLE_PAGE_SIZE,
          }),
        ]);

        setScheduler(scheduler.data);
        setSchedulerTotalPages(schedulers.total_page || 1);

        schedulers.data.length === 0 && schedulerPage > 1
          ? setSchedulerPage(schedulerPage - 1)
          : setAllSchedlers(schedulers.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  const openHandleSeedPeer = (row: any) => {
    setSeedPeerSelectedRow(row);
    setSeedPeerSelectedID(row.id);
    setOpenDeleteSeedPeer(true);
  };

  const handleDeleteSeedPeer = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteSeedPeer(seedPeerSelectedID);
      setSuccessMessage(true);
      setOpenDeleteSeedPeer(false);
      setDeleteLoadingButton(false);

      if (cluster.seed_peer_cluster_id !== 0) {
        const [seedPeer, seedPeers] = await Promise.all([
          getSeedPeers({
            seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
            page: 1,
            per_page: MAX_PAGE_SIZE,
          }),
          getSeedPeers({
            seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
            page: seedPeerPage,
            per_page: DEFAULT_SEED_PEER_TABLE_PAGE_SIZE,
          }),
        ]);

        setSeedPeer(seedPeer.data);
        setSeedPeerTotalPages(seedPeers.total_page || 1);

        seedPeers?.data.length === 0 && seedPeerPage > 1
          ? setSeedPeerPage(seedPeerPage - 1)
          : setAllSeedPeers(seedPeers.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  const searchSchedulerKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const submitButton = document.getElementById('scheduler-button');
      submitButton?.click();
    }
  };

  const searchSeedPeerKeyDown = (event: any) => {
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
        per_page: DEFAULT_SCHEDULER_TABLE_PAGE_SIZE,
        host_name: searchSchedulers,
      });

      setAllSchedlers(scheduler.data);
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
        per_page: DEFAULT_SEED_PEER_TABLE_PAGE_SIZE,
        host_name: searchSeedPeers,
      });

      setAllSeedPeers(seedPeer.data);
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
              setOpenDeleteCluster(true);
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
          open={openDeleteCluster}
          onClose={handleDeleteClose}
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
              onClick={handleDeleteClose}
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
              onClick={handleDeleteCluster}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Information cluster={cluster} isLoading={informationIsLoading} />
      <Box sx={{ display: 'flex' }}>
        <Paper
          variant="outlined"
          sx={{ width: '50%', mr: '0.5rem', p: '1.2rem', display: 'flex', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', width: '70%' }}>
            <Box component="img" src="/icons/cluster/scheduler-statistics.svg" sx={{ width: '6rem', height: '6rem' }} />
            <Box sx={{ ml: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontFamily="mabry-bold">
                Scheduler
              </Typography>
              <Box>
                <Typography variant="h5" fontFamily="mabry-bold">
                  {numberOfActiveSchedulers}
                </Typography>
                <div>number of active schdulers</div>
              </Box>
            </Box>
          </Box>
          <Chip
            size="small"
            icon={<Box component="img" src="/icons/cluster/total.svg" sx={{ width: '1.2rem', height: '1.2rem' }} />}
            label={`Total: ${scheduler.length}`}
          />
        </Paper>
        <Paper
          variant="outlined"
          sx={{ width: '50%', ml: '0.5rem', p: '1.2rem', display: 'flex', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', width: '70%' }}>
            <Box component="img" src="/icons/cluster/scheduler-statistics.svg" sx={{ width: '6rem', height: '6rem' }} />
            <Box sx={{ ml: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontFamily="mabry-bold">
                Seed Peer
              </Typography>
              <Box>
                <Typography variant="h5" fontFamily="mabry-bold">
                  {numberOfActiveSeedPeers}
                </Typography>
                <div>number of active seed peers</div>
              </Box>
            </Box>
          </Box>
          <Chip
            size="small"
            icon={<Box component="img" src="/icons/cluster/total.svg" sx={{ width: '1.2rem', height: '1.2rem' }} />}
            label={`Total: ${seedPeer.length}`}
          />
        </Paper>
      </Box>
      <Typography variant="subtitle1" gutterBottom fontFamily="mabry-bold" mt="2rem" mb="1rem">
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
              onKeyDown={searchSchedulerKeyDown}
              inputValue={searchSchedulers}
              onInputChange={(_event, newInputValue) => {
                setSearchSchedulers(newInputValue);
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
              {allSchedulers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    -
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {Array.isArray(allSchedulers) &&
                    allSchedulers.map((item: any) => {
                      return (
                        <TableRow
                          key={item?.id}
                          selected={schedulerSelectedRow === item}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell align="center">{schedulerTableIsLoading ? <Skeleton /> : item?.id}</TableCell>
                          <TableCell align="center">
                            {schedulerTableIsLoading ? (
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
                            {schedulerTableIsLoading ? (
                              <Skeleton />
                            ) : (
                              <Box className={styles.ipContainer}>
                                <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                                {item?.ip}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center">{schedulerTableIsLoading ? <Skeleton /> : item?.port}</TableCell>
                          <TableCell align="center">
                            {schedulerTableIsLoading ? (
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
                            {schedulerTableIsLoading ? (
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
        open={openDeleteScheduler}
        onClose={handleDeleteClose}
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
              setOpenDeleteScheduler(false);
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
      {schedulerTotalPages > 1 ? (
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
      ) : (
        <></>
      )}
      <Typography variant="subtitle1" gutterBottom fontFamily="mabry-bold" mt="2rem" mb="1rem">
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
              onKeyDown={searchSeedPeerKeyDown}
              inputValue={searchSeedPeers}
              onInputChange={(_event, newInputValue) => {
                setSearchSeedPeer(newInputValue);
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
              {allseedPeers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    -
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {Array.isArray(allseedPeers) &&
                    allseedPeers.map((item: any) => {
                      return (
                        <TableRow
                          key={item?.id}
                          selected={seedPeerSelectedRow === item}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell align="center">{seedPeerTableIsLoading ? <Skeleton /> : item?.id}</TableCell>
                          <TableCell align="center">
                            {seedPeerTableIsLoading ? (
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
                            {seedPeerTableIsLoading ? (
                              <Skeleton />
                            ) : (
                              <Box className={styles.ipContainer}>
                                <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                                {item?.ip}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center">{seedPeerTableIsLoading ? <Skeleton /> : item?.port}</TableCell>
                          <TableCell align="center">
                            {seedPeerTableIsLoading ? <Skeleton /> : item?.download_port}
                          </TableCell>
                          <TableCell align="center">
                            {seedPeerTableIsLoading ? (
                              <Skeleton />
                            ) : item?.object_storage_port === 0 ? (
                              '-'
                            ) : (
                              item?.object_storage_port
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {seedPeerTableIsLoading ? <Skeleton /> : _.upperFirst(item?.type) || ''}
                          </TableCell>
                          <TableCell align="center">
                            {seedPeerTableIsLoading ? (
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
                                openHandleSeedPeer(item);
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
        open={openDeleteSeedPeer}
        onClose={handleDeleteClose}
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
              setOpenDeleteSeedPeer(false);
              setSeedPeerSelectedRow(null);
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
            onClick={handleDeleteSeedPeer}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {seedPeerTotalPages > 1 ? (
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
      ) : (
        <></>
      )}
      <Grid sx={{ height: 2 }}> </Grid>
    </ThemeProvider>
  );
}
