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
import {
  getSchedulers,
  getSeedPeers,
  getCluster,
  deleteCluster,
  deleteScheduler,
  deleteSeedPeer,
  getClusterResponse,
  getSchedulersResponse,
  getSeedPeersResponse,
} from '../../lib/api';
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
import { getPaginatedList, useQuery } from '../../lib/utils';
import LoadingBackdrop from '../loading-backdrop';

export default function ShowCluster() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [pageLoding, setPageLoding] = useState(false);
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
  const [scheduler, setScheduler] = useState<getSchedulersResponse[]>([]);
  const [schedulerCount, setSchedulerCount] = useState<getSchedulersResponse[]>([]);
  const [seedPeerCount, setSeedPeerCount] = useState<getSeedPeersResponse[]>([]);
  const [seedPeer, setSeedPeer] = useState<getSeedPeersResponse[]>([]);
  const [cluster, setCluster] = useState<getClusterResponse>({
    id: 0,
    name: '',
    bio: '',
    scopes: {
      idc: '',
      location: '',
      cidrs: [],
      hostnames: [],
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
    },
    created_at: '',
    updated_at: '',
    is_default: false,
  });
  const [allSchedulers, setAllSchedlers] = useState<getSchedulersResponse[]>([]);
  const [allseedPeers, setAllSeedPeers] = useState<getSeedPeersResponse[]>([]);

  const params = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const schedulerCurrentPage = query.get('schedulerPage') ? parseInt(query.get('schedulerPage') as string, 10) || 1 : 1;
  const seedPeerCurrentPage = query.get('seedPeerPage') ? parseInt(query.get('seedPeerPage') as string, 10) || 1 : 1;

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1C293A',
      },
      secondary: {
        main: '#2E8F79',
      },
    },
    typography: {
      fontFamily: 'mabry-light,sans-serif',
    },
  });

  useEffect(() => {
    (async function () {
      try {
        setPageLoding(true);
        setInformationIsLoading(true);
        setSeedPeerTableIsLoading(true);
        setSchedulerTableIsLoading(true);
        setSchedulerPage(schedulerCurrentPage);
        setSeedPeerPage(seedPeerCurrentPage);

        if (typeof params.id === 'string') {
          const cluster = await getCluster(params.id);

          setCluster(cluster);

          if (cluster.seed_peer_cluster_id !== 0) {
            const seedPeer = await getSeedPeers({
              seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
              page: 1,
              per_page: MAX_PAGE_SIZE,
            });

            setSeedPeer(seedPeer);
            setSeedPeerCount(seedPeer);
          }

          if (cluster.scheduler_cluster_id !== 0) {
            const scheduler = await getSchedulers({
              scheduler_cluster_id: String(cluster.scheduler_cluster_id),
              page: 1,
              per_page: MAX_PAGE_SIZE,
            });

            setScheduler(scheduler);
            setSchedulerCount(scheduler);
          }
          setPageLoding(false);
          setSchedulerTableIsLoading(false);
          setSeedPeerTableIsLoading(false);
          setInformationIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setPageLoding(false);
          setInformationIsLoading(false);
        }
      }
    })();
  }, [params.id, schedulerCurrentPage, seedPeerCurrentPage]);

  useEffect(() => {
    if (Array.isArray(scheduler) && scheduler.length >= 1) {
      scheduler.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      scheduler.sort((a, b) => {
        if (a.state < b.state) {
          return -1;
        } else if (a.state > b.state) {
          return 1;
        } else {
          return 0;
        }
      });
      const totalPage = Math.ceil(scheduler.length / DEFAULT_SCHEDULER_TABLE_PAGE_SIZE);
      const currentPageData = getPaginatedList(scheduler, schedulerPage, DEFAULT_SCHEDULER_TABLE_PAGE_SIZE);

      if (currentPageData.length === 0 && schedulerPage > 1) {
        setSchedulerPage(schedulerPage - 1);
      }

      setSchedulerTotalPages(totalPage);
      setAllSchedlers(currentPageData);
    } else {
      setSchedulerTotalPages(1);
      setAllSchedlers([]);
    }
  }, [scheduler, schedulerPage]);

  useEffect(() => {
    if (Array.isArray(seedPeer) && seedPeer.length >= 1) {
      seedPeer.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      seedPeer.sort((a, b) => {
        if (a.state < b.state) {
          return -1;
        } else if (a.state > b.state) {
          return 1;
        } else {
          return 0;
        }
      });
      const totalPage = Math.ceil(seedPeer.length / DEFAULT_SEED_PEER_TABLE_PAGE_SIZE);
      const currentPageData = getPaginatedList(seedPeer, seedPeerPage, DEFAULT_SEED_PEER_TABLE_PAGE_SIZE);

      if (currentPageData?.length === 0 && seedPeerPage > 1) {
        setSeedPeerPage(seedPeerPage - 1);
      }

      setSeedPeerTotalPages(totalPage);
      setAllSeedPeers(currentPageData);
    } else {
      setSeedPeerTotalPages(1);
      setAllSeedPeers([]);
    }
  }, [seedPeer, seedPeerPage]);

  const numberOfActiveSchedulers =
    Array.isArray(schedulerCount) && schedulerCount?.filter((item: any) => item?.state === 'active').length;

  const numberOfActiveSeedPeers =
    Array.isArray(seedPeerCount) && seedPeerCount?.filter((item: any) => item?.state === 'active').length;

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  const handleDeleteClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
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

      if (cluster.scheduler_cluster_id !== 0) {
        const scheduler = await getSchedulers({
          scheduler_cluster_id: String(cluster.scheduler_cluster_id),
          page: 1,
          per_page: MAX_PAGE_SIZE,
        });
        setSuccessMessage(true);
        setOpenDeleteScheduler(false);
        setScheduler(scheduler);
        setSchedulerCount(scheduler);
        setDeleteLoadingButton(false);
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

      if (cluster.seed_peer_cluster_id !== 0) {
        const seedPeer = await getSeedPeers({
          seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
          page: 1,
          per_page: MAX_PAGE_SIZE,
        });
        setSuccessMessage(true);
        setOpenDeleteSeedPeer(false);
        setSeedPeer(seedPeer);
        setSeedPeerCount(seedPeer);
        setDeleteLoadingButton(false);
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
      setSchedulerTableIsLoading(true);

      const schedulers = searchSchedulers
        ? await getSchedulers({
            scheduler_cluster_id: String(cluster.scheduler_cluster_id),
            page: 1,
            per_page: MAX_PAGE_SIZE,
            host_name: searchSchedulers,
          })
        : await getSchedulers({
            scheduler_cluster_id: String(cluster.scheduler_cluster_id),
            page: 1,
            per_page: MAX_PAGE_SIZE,
          });

      if (schedulers.length > 0) {
        setScheduler(schedulers);
        setSchedulerPage(1);
        setSchedulerTableIsLoading(false);
      } else {
        setSchedulerTotalPages(1);
        setAllSchedlers([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
        setSchedulerTableIsLoading(false);
      }
    }
  };

  const searchSeedPeer = async () => {
    try {
      setSeedPeerTableIsLoading(true);
      const seedPeers = searchSeedPeers
        ? await getSeedPeers({
            seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
            page: 1,
            per_page: MAX_PAGE_SIZE,
            host_name: searchSeedPeers,
          })
        : await getSeedPeers({
            seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
            page: 1,
            per_page: MAX_PAGE_SIZE,
          });

      if (seedPeers.length > 0) {
        setSeedPeer(seedPeers);
        setSeedPeerPage(1);
        setSeedPeerTableIsLoading(false);
      } else {
        setSeedPeerTotalPages(1);
        setAllSeedPeers([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
        setSeedPeerTableIsLoading(false);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LoadingBackdrop open={pageLoding} />
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert id="successMessage" onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert id="errorMessage" onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessageText}
        </Alert>
      </Snackbar>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink underline="hover" component={Link} color="inherit" to={`/clusters`}>
          clusters
        </RouterLink>
        <Typography color="text.primary">{cluster?.name || '-'}</Typography>
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
              id="cancelDeleteCluster"
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
              id="deleteCluster"
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
            label={`Total: ${schedulerCount.length}`}
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
            label={`Total: ${seedPeerCount.length}`}
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
              options={schedulerCount.map((option) => option?.host_name)}
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
          <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="scheduler-table">
            <TableHead sx={{ backgroundColor: 'var(--table-title-color)' }}>
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
            <TableBody id="scheduler-table-body">
              {allSchedulers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    You don't have scheduler cluster.
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
                                        m: '0.4rem',
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
                              id={item?.host_name}
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
            id="cancelDeleteScheduler"
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
            id="deleteScheduler"
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
              navigate(
                `/clusters/${params.id}${newPage > 1 ? `?schedulerPage=${newPage}` : ''}${
                  seedPeerPage > 1 ? `${newPage > 1 ? '&' : '?'}seedPeerPage=${seedPeerPage}` : ''
                }`,
              );
            }}
            color="primary"
            size="small"
            id="scheduler-pagination"
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
              options={seedPeerCount.map((option) => option.host_name)}
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
          <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="seed-peer-table">
            <TableHead sx={{ backgroundColor: 'var(--table-title-color)' }}>
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
            <TableBody id="seed-peer-table-body">
              {allseedPeers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    You don't have seed peer cluster.
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
                              id={item?.host_name}
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
            id="cancelDeleteSeedPeer"
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
            id="deleteSeedPeer"
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
              navigate(
                `/clusters/${params.id}${schedulerPage > 1 ? `?schedulerPage=${schedulerPage}` : ''}${
                  newPage > 1 ? `${schedulerPage > 1 ? '&' : '?'}seedPeerPage=${newPage}` : ''
                }`,
              );
            }}
            color="primary"
            size="small"
            id="seed-peer-pagination"
          />
        </Box>
      ) : (
        <></>
      )}
      <Grid sx={{ height: 2 }}> </Grid>
    </ThemeProvider>
  );
}
