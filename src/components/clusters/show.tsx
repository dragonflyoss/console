import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Information from './information';
import { styled } from '@mui/material/styles';
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
  Stepper,
  List,
  ListItem,
  Tooltip as MuiTooltip,
  ListSubheader,
  StepIconProps,
  stepConnectorClasses,
  StepConnector,
  LinearProgressProps,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Chart,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
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
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import DeleteAnimation from '../delete-animation';

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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
Chart.defaults.font.family = 'mabry-light';

function CircularProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '70%', pt: '0.4rem' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress
          color="error"
          sx={{ height: '0.6rem', borderRadius: '0.2rem' }}
          variant="determinate"
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" fontFamily="mabry-bold" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function ShowCluster() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [informationIsLoading, setInformationIsLoading] = useState(true);
  const [schedulerTableIsLoading, setSchedulerTableIsLoading] = useState(true);
  const [seedPeerTableIsLoading, setSeedPeerTableIsLoading] = useState(true);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [openDeleteCluster, setOpenDeleteCluster] = useState(false);
  const [openDeleteInactive, setOpenDeleteInactive] = useState(false);
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
  const [allInactiveError, setAllInactiveError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteAllInactiveErrorMessage, setDeleteAllInactiveErrorMessage] = useState<string[]>([]);
  const [deleteInactiveSchedulerSuccessful, setDeleteInactiveSchedulerSuccessful] = useState(0);
  const [deleteInactiveSeedPeerSuccessful, setDeleteInactiveSeedPeerSuccessful] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressLoading, setProgressLoading] = useState(false);

  const steps = ['Schedulers', 'Seed peers', 'Confirm delete'];
  const params = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const schedulerCurrentPage = query.get('schedulerPage') ? parseInt(query.get('schedulerPage') as string, 10) || 1 : 1;
  const seedPeerCurrentPage = query.get('seedPeerPage') ? parseInt(query.get('seedPeerPage') as string, 10) || 1 : 1;

  useEffect(() => {
    (async function () {
      try {
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
          setSchedulerTableIsLoading(false);
          setSeedPeerTableIsLoading(false);
          setInformationIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setSchedulerTableIsLoading(false);
          setSeedPeerTableIsLoading(false);
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

  const numberOfInactiveSchedulers =
    Array.isArray(schedulerCount) && schedulerCount?.filter((item: any) => item?.state === 'inactive').length;

  const numberOfActiveSeedPeers =
    Array.isArray(seedPeerCount) && seedPeerCount?.filter((item: any) => item?.state === 'active').length;

  const numberOfInactiveSeedPeers =
    Array.isArray(seedPeerCount) && seedPeerCount?.filter((item: any) => item?.state === 'inactive').length;

  const schedulerInactive =
    Array.isArray(schedulerCount) && schedulerCount?.filter((item: any) => item?.state === 'inactive');

  const seedPeerInactive =
    Array.isArray(seedPeerCount) && seedPeerCount?.filter((item: any) => item?.state === 'inactive');

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  const schedulerDoughnutOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: allSchedulers.length !== 0,
      },
    },
    cutout: '60%',
  };

  const schedulerDoughnut = {
    labels: [allSchedulers.length === 0 ? '' : 'Active', 'Inactive'],
    datasets: [
      {
        data: [allSchedulers.length === 0 ? [1] : numberOfActiveSchedulers, numberOfInactiveSchedulers],
        backgroundColor: [allSchedulers.length === 0 ? '#cdcdcd' : '#2e8f79', '#1c293a'],
        borderWidth: 1,
        offset: 2,
        hoverOffset: 5,
      },
    ],
  };

  const seedPeerDoughnutOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: allseedPeers.length !== 0,
      },
    },
    cutout: '60%',
  };

  const seedPeerDoughnut = {
    labels: [allseedPeers.length === 0 ? '' : 'Active', 'Inactive'],
    datasets: [
      {
        data: [allseedPeers.length === 0 ? [1] : numberOfActiveSeedPeers, numberOfInactiveSeedPeers],
        backgroundColor: [allseedPeers.length === 0 ? '#cdcdcd' : '#2e8f79', '#1c293a'],
        borderWidth: 1,
        offset: 2,
        hoverOffset: 5,
      },
    ],
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
    if (!progressLoading) {
      setOpenDeleteInactive(false);
      setDeleteAllInactiveErrorMessage([]);
      setDeleteInactiveSchedulerSuccessful(0);
      setDeleteInactiveSeedPeerSuccessful(0);
      setActiveStep(0);
    }
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
        setSchedulerTableIsLoading(false);
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
        setSeedPeerTableIsLoading(false);
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

  const handleConfirmDelete = async (event: any) => {
    setProgressLoading(true);
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const idcText = event.currentTarget.elements.deleteAllInactive.value;

    if (idcText !== 'DELETE') {
      setAllInactiveError(true);
    } else if (idcText === 'DELETE') {
      handleNext();

      const schedulerID = Array.isArray(schedulerInactive) && schedulerInactive.map((item: any) => item.id);

      const seedPeerID = Array.isArray(seedPeerInactive) && seedPeerInactive.map((item: any) => item.id);

      const deleteSelectedSchedulers = async (ids: any, onDeleteSuccess: any) => {
        for (let i = 0; i < ids.length; i++) {
          try {
            await (async function (id) {
              return deleteScheduler(id);
            })(ids[i]);

            onDeleteSuccess();
            setDeleteInactiveSchedulerSuccessful(
              (deleteInactiveSchedulerSuccessful) => deleteInactiveSchedulerSuccessful + 1,
            );
          } catch (error) {
            if (error instanceof Error) {
              setDeleteAllInactiveErrorMessage((prevMessages) => [
                ...prevMessages,
                `Deletion of scheduler with ID ${ids[i]} failed! Error : ${error.message}.`,
              ]);
            }
            throw error;
          }
        }
      };

      const deleteSelectedSeedPeers = async (ids: any, onDeleteSuccess: any) => {
        for (let i = 0; i < ids.length; i++) {
          try {
            await (async function (id) {
              return deleteSeedPeer(id);
            })(ids[i]);

            onDeleteSuccess();
            setDeleteInactiveSeedPeerSuccessful(
              (deleteInactiveSeedPeerSuccessful) => deleteInactiveSeedPeerSuccessful + 1,
            );
          } catch (error) {
            if (error instanceof Error) {
              setDeleteAllInactiveErrorMessage((prevMessages) => [
                ...prevMessages,
                `Deletion of seed peer with ID ${ids[i]} failed!, error:${error.message}`,
              ]);
            }
            throw error;
          }
        }
      };

      const executeDelete = async (schedulersIds: any, seedPeersIds: any) => {
        if (schedulerID !== false && seedPeerID !== false) {
          const totalApiCalls = schedulerID.length + seedPeerID.length;

          const increment = 100 / totalApiCalls;
          const onDeleteSuccess = () => {
            setProgress((prevProgress) => prevProgress + increment);
          };

          try {
            await deleteSelectedSchedulers(schedulersIds, onDeleteSuccess);
            await deleteSelectedSeedPeers(seedPeersIds, onDeleteSuccess);

            setProgressLoading(false);

            if (cluster.scheduler_cluster_id !== 0) {
              const scheduler = await getSchedulers({
                scheduler_cluster_id: String(cluster.scheduler_cluster_id),
                page: 1,
                per_page: MAX_PAGE_SIZE,
              });
              setScheduler(scheduler);
              setSchedulerCount(scheduler);
            }

            if (cluster.seed_peer_cluster_id !== 0) {
              const seedPeer = await getSeedPeers({
                seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
                page: 1,
                per_page: MAX_PAGE_SIZE,
              });
              setSeedPeer(seedPeer);
              setSeedPeerCount(seedPeer);
            }
          } catch (error) {
            setProgressLoading(false);

            try {
              if (cluster.scheduler_cluster_id !== 0) {
                const scheduler = await getSchedulers({
                  scheduler_cluster_id: String(cluster.scheduler_cluster_id),
                  page: 1,
                  per_page: MAX_PAGE_SIZE,
                });
                setScheduler(scheduler);
                setSchedulerCount(scheduler);
              }

              if (cluster.seed_peer_cluster_id !== 0) {
                const seedPeer = await getSeedPeers({
                  seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
                  page: 1,
                  per_page: MAX_PAGE_SIZE,
                });
                setSeedPeer(seedPeer);
                setSeedPeerCount(seedPeer);
              }
            } catch (error) {
              if (error instanceof Error) {
                setErrorMessage(true);
                setErrorMessageText(error.message);
              }
            }
          }
        }
      };

      executeDelete(schedulerID, seedPeerID);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setOpenDeleteInactive(false);
    setDeleteAllInactiveErrorMessage([]);
    setDeleteInactiveSchedulerSuccessful(0);
    setDeleteInactiveSeedPeerSuccessful(0);
  };

  return (
    <ThemeProvider theme={theme}>
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
            id="delete-cluster"
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
      <Box className={styles.openDeleteInactiveDialog}>
        <Typography variant="h6" fontFamily="mabry-bold">
          Scheduler And Seed Peer
        </Typography>
        <MuiTooltip title="Delete inactive schedulers and inactive seed peers." placement="top">
          <Button
            variant="contained"
            size="small"
            id="delete-all-inactive-instances"
            onClick={() => {
              setOpenDeleteInactive(true);
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
            DELETE ALL INACTIVE INSTANCES
          </Button>
        </MuiTooltip>
      </Box>
      <Dialog
        open={openDeleteInactive}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '48rem',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            p: '1rem',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src="/icons/cluster/delete.svg"
              sx={{ width: '1.8rem', height: '1.8rem', mr: '0.4rem' }}
            />
            <Typography variant="h6" component="div" fontFamily="mabry-bold">
              Delete inactive schedulers and inactive seed peers
            </Typography>
          </Box>
          {!progressLoading ? (
            <IconButton
              aria-label="close"
              id="close-delete-icon"
              onClick={handleReset}
              sx={{
                color: (theme) => theme.palette.grey[500],
                p: 0,
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : (
            <></>
          )}
        </Box>
        <Divider />
        <DialogContent sx={{ p: '1.4rem' }}>
          <Box sx={{ width: '100%' }} onSubmit={handleConfirmDelete} component="form">
            {activeStep === steps.length ? (
              <Fragment>
                {progressLoading ? (
                  <Box className={styles.circularProgressWrapper}>
                    <DeleteAnimation />
                    <Typography variant="subtitle1" component="div" fontFamily="mabry-bold">
                      LOADING...
                    </Typography>
                    <CircularProgressWithLabel value={progress} />
                  </Box>
                ) : (
                  <Box>
                    {deleteAllInactiveErrorMessage.length > 0 ? (
                      <>
                        <Box className={styles.logHeaderWrapper}>
                          <Paper variant="outlined" className={styles.headerContainer}>
                            <Box>
                              <Box className={styles.headerContent}>
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div">
                                  Schedulers
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h6" fontFamily="mabry-bold">
                                {deleteInactiveSchedulerSuccessful || '0'}
                              </Typography>
                              <Typography color="#8a8a8a" fontSize="0.8rem" component="div" variant="subtitle2">
                                number of deleted schedulers
                              </Typography>
                            </Box>
                            <Box
                              component="img"
                              className={styles.headerErrorIcon}
                              src="/icons/cluster/delete-inactive.svg"
                            />
                          </Paper>
                          <Paper variant="outlined" className={styles.headerContainer}>
                            <Box>
                              <Box className={styles.headerContent}>
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div">
                                  Seed Peers
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h6" fontFamily="mabry-bold">
                                {deleteInactiveSeedPeerSuccessful || '0'}
                              </Typography>
                              <Typography color="#8a8a8a" fontSize="0.8rem" component="div" variant="subtitle2">
                                number of deleted seed peers
                              </Typography>
                            </Box>
                            <Box
                              component="img"
                              className={styles.headerErrorIcon}
                              src="/icons/cluster/delete-inactive.svg"
                            />
                          </Paper>
                          <Paper variant="outlined" className={styles.headerContainer}>
                            <Box>
                              <Box className={styles.headerContent}>
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div" id="failure">
                                  Failure
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h6" fontFamily="mabry-bold">
                                {deleteAllInactiveErrorMessage.length || '0'}
                              </Typography>
                              <Typography color="#8a8a8a" fontSize="0.8rem" component="div" variant="subtitle2">
                                number of delete error
                              </Typography>
                            </Box>
                            <Box
                              component="img"
                              className={styles.headerErrorIcon}
                              src="/icons/cluster/delete-inactive-error.svg"
                            />
                          </Paper>
                        </Box>
                        <Paper variant="outlined" className={styles.deleteInactiveWrapper}>
                          <Typography variant="inherit" fontFamily="mabry-bold" pb="1rem">
                            Logs
                          </Typography>
                          <Accordion
                            disableGutters
                            square
                            variant="outlined"
                            sx={{
                              '&:not(:last-child)': {
                                borderBottom: 0,
                              },
                              '&:before': {
                                display: 'none',
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
                              sx={{
                                flexDirection: 'row-reverse',
                                '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                  transform: 'rotate(90deg)',
                                },
                                '& .MuiAccordionSummary-content': {
                                  marginLeft: '1rem',
                                },
                                height: '2rem',
                              }}
                              aria-controls="panel1d-content"
                              id="inactive-header"
                            >
                              <Box display="flex" alignItems="center">
                                <Box
                                  component="img"
                                  sx={{ width: '1.2rem', height: '1.2rem', mr: '0.4rem' }}
                                  src="/icons/job/preheat/failure.svg"
                                />
                                <Typography variant="body2" fontFamily="mabry-bold">
                                  Error log
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{
                                padding: '1rem',
                                borderTop: '1px solid rgba(0, 0, 0, .125)',
                                backgroundColor: '#24292f',
                              }}
                            >
                              <Typography sx={{ color: '#d0d7de' }}>{deleteAllInactiveErrorMessage}</Typography>
                            </AccordionDetails>
                          </Accordion>
                        </Paper>
                      </>
                    ) : (
                      <>
                        <Box className={styles.logHeaderWrapper}>
                          <Paper variant="outlined" className={styles.successHeaderContainer}>
                            <Box>
                              <Box className={styles.headerContent}>
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div">
                                  Schedulers
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h6" fontFamily="mabry-bold">
                                {deleteInactiveSchedulerSuccessful || '0'}
                              </Typography>
                              <Typography color="#8a8a8a" component="div" variant="subtitle2">
                                number of deleted schedulers
                              </Typography>
                            </Box>
                            <Box
                              component="img"
                              className={styles.headerIcon}
                              src="/icons/cluster/delete-inactive.svg"
                            />
                          </Paper>
                          <Paper variant="outlined" className={styles.successHeaderContainer}>
                            <Box>
                              <Box className={styles.headerContent}>
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div">
                                  Seed peers
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h6" fontFamily="mabry-bold">
                                {deleteInactiveSeedPeerSuccessful || '0'}
                              </Typography>
                              <Typography color="#8a8a8a" component="div" variant="subtitle2">
                                number of deleted seed peers
                              </Typography>
                            </Box>
                            <Box
                              component="img"
                              className={styles.headerIcon}
                              src="/icons/cluster/delete-inactive.svg"
                            />
                          </Paper>
                        </Box>
                        <Alert variant="outlined" severity="success">
                          You have successfully removed all inactive schedulers and inactive seed peers!
                        </Alert>
                      </>
                    )}
                  </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {!progressLoading ? (
                    <Button
                      variant="contained"
                      id="cancel-button"
                      size="small"
                      onClick={handleReset}
                      sx={{
                        '&.MuiButton-root': {
                          backgroundColor: 'var(--button-color)',
                          borderRadius: 0,
                          color: '#fff',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <></>
                  )}
                </Box>
              </Fragment>
            ) : (
              <Fragment>
                {activeStep === 0 ? (
                  <Paper variant="outlined">
                    <Box className={styles.schedulerInactiveCountWrapper}>
                      <Typography fontFamily="mabry-bold" variant="subtitle1" component="div">
                        Schedulers
                      </Typography>
                      <Box
                        sx={{
                          ml: '0.6rem',
                          border: '1px solid #d5d2d2',
                          p: '0.1rem 0.3rem',
                          borderRadius: '0.4rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          sx={{ width: '0.6rem', height: '0.6rem' }}
                          src="/icons/cluster/inactive-total.svg"
                        />
                        <Typography
                          id="schedulerTotal"
                          variant="caption"
                          fontFamily="mabry-bold"
                          component="div"
                          pl="0.3rem"
                          lineHeight="1rem"
                        >
                          {(Array.isArray(schedulerInactive) && schedulerInactive.length) || '0'} inactive
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Divider />
                      <ListSubheader color="inherit" className={styles.schedulerInactiveListTitle}>
                        <Box className={styles.schedulerInactiveHeaderID}>
                          <Typography variant="body2" fontFamily="mabry-bold" color="#515155" component="div">
                            ID
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderHostname}>
                          <Typography variant="body2" fontFamily="mabry-bold" color="#515155" component="div">
                            Hostname
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderIP}>
                          <Typography variant="body2" fontFamily="mabry-bold" color="#515155" component="div">
                            IP
                          </Typography>
                        </Box>
                      </ListSubheader>
                      <Divider />
                      {Array.isArray(schedulerInactive) && schedulerInactive.length !== 0 ? (
                        <List
                          sx={{
                            width: '100%',
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'auto',
                            maxHeight: 300,
                            padding: '0',
                          }}
                          subheader={<li />}
                        >
                          {Array.isArray(schedulerInactive) &&
                            schedulerInactive.map((item) => (
                              <Box key={item.id}>
                                <ListItem className={styles.schedulerInactiveList}>
                                  <MuiTooltip title={item.id || '-'} placement="top">
                                    <Typography variant="body2" component="div" className={styles.schedulerInactiveID}>
                                      {item.id}
                                    </Typography>
                                  </MuiTooltip>
                                  <MuiTooltip title={item.host_name || '-'} placement="top">
                                    <Typography
                                      variant="body2"
                                      component="div"
                                      className={styles.schedulerInactiveHostname}
                                    >
                                      {item.host_name}
                                    </Typography>
                                  </MuiTooltip>
                                  <MuiTooltip title={item.ip || '-'} placement="top">
                                    <Typography variant="body2" component="div" className={styles.schedulerInactiveIP}>
                                      {item.ip}
                                    </Typography>
                                  </MuiTooltip>
                                </ListItem>
                                <Divider />
                              </Box>
                            ))}
                        </List>
                      ) : (
                        <Typography variant="subtitle2" component="div" className={styles.noInactiveScheduler}>
                          You don't have any inactive scheduler.
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ) : activeStep === 1 ? (
                  <Paper variant="outlined">
                    <Box className={styles.schedulerInactiveCountWrapper}>
                      <Typography fontFamily="mabry-bold" variant="subtitle1" component="div">
                        Seed peers
                      </Typography>
                      <Box
                        sx={{
                          ml: '0.6rem',
                          border: '1px solid #d5d2d2',
                          p: '0.1rem 0.3rem',
                          borderRadius: '0.4rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          sx={{ width: '0.6rem', height: '0.6rem' }}
                          src="/icons/cluster/inactive-total.svg"
                        />
                        <Typography
                          id="seedPeerTotal"
                          variant="caption"
                          fontFamily="mabry-bold"
                          component="div"
                          pl="0.3rem"
                          lineHeight="1rem"
                        >
                          {(Array.isArray(seedPeerInactive) && seedPeerInactive.length) || '0'} inactive
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Divider />
                      <ListSubheader color="inherit" className={styles.schedulerInactiveListTitle}>
                        <Box className={styles.schedulerInactiveHeaderID}>
                          <Typography variant="body2" fontFamily="mabry-bold" color="#515155" component="div">
                            ID
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderHostname}>
                          <Typography variant="body2" fontFamily="mabry-bold" color="#515155" component="div">
                            Hostname
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderIP}>
                          <Typography variant="body2" fontFamily="mabry-bold" color="#515155" component="div">
                            IP
                          </Typography>
                        </Box>
                      </ListSubheader>
                      <Divider />
                      {Array.isArray(seedPeerInactive) && seedPeerInactive.length !== 0 ? (
                        <List
                          sx={{
                            width: '100%',
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'auto',
                            maxHeight: 300,
                            padding: '0',
                          }}
                          subheader={<li />}
                        >
                          {Array.isArray(seedPeerInactive) &&
                            seedPeerInactive.map((item) => (
                              <Box key={item.id}>
                                <ListItem className={styles.schedulerInactiveList}>
                                  <MuiTooltip title={item.id || '-'} placement="top">
                                    <Typography variant="body2" component="div" className={styles.schedulerInactiveID}>
                                      {item.id}
                                    </Typography>
                                  </MuiTooltip>
                                  <MuiTooltip title={item.host_name || '-'} placement="top">
                                    <Typography
                                      variant="body2"
                                      component="div"
                                      className={styles.schedulerInactiveHostname}
                                    >
                                      {item.host_name}
                                    </Typography>
                                  </MuiTooltip>
                                  <MuiTooltip title={item.ip || '-'} placement="top">
                                    <Typography variant="body2" component="div" className={styles.schedulerInactiveIP}>
                                      {item.ip}
                                    </Typography>
                                  </MuiTooltip>
                                </ListItem>
                                <Divider />
                              </Box>
                            ))}
                        </List>
                      ) : (
                        <Typography variant="subtitle2" component="div" className={styles.noInactiveScheduler}>
                          You don't have any inactive seed peer.
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ) : activeStep === 2 ? (
                  <Box>
                    <Box display="flex" alignItems="flex-start" pb="1rem">
                      <Box
                        component="img"
                        src="/icons/cluster/delete-warning.svg"
                        sx={{ width: '1.4rem', height: '1.4rem', pr: '0.2rem' }}
                      />
                      <Box>
                        <Typography variant="body1" fontFamily="mabry-bold" component="span" sx={{ color: '#D81E06' }}>
                          WARNING:&nbsp;
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ color: '#D81E06' }}>
                          This action CANNOT be undone.
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" component="div">
                      Inactive schedulers and inactive seed peers will be permanently delete.
                    </Typography>
                    <TextField
                      error={allInactiveError}
                      sx={{ pt: '1rem', width: '14rem' }}
                      id="deleteAllInactive"
                      name="deleteAllInactive"
                      color="success"
                      size="small"
                      placeholder={`Type 'DELETE' to proceed`}
                      autoComplete="family-name"
                      helperText={allInactiveError ? `Please enter "DELETE"` : ''}
                      onChange={(event) => {
                        if (event.target.value === 'DELETE') {
                          setAllInactiveError(false);
                        } else {
                          setAllInactiveError(true);
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <></>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: '2rem' }}>
                  <Button
                    variant="contained"
                    size="small"
                    id="back-button"
                    endIcon={<ArrowBackIcon />}
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{
                      '&.MuiButton-root': {
                        backgroundColor: activeStep === 0 ? '' : 'var(--button-color)',
                        borderRadius: 0,
                        color: '#fff',
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {activeStep === steps.length - 1 ? (
                    <LoadingButton
                      endIcon={<DeleteIcon />}
                      size="small"
                      variant="contained"
                      type="submit"
                      id="save-delete"
                      sx={{
                        '&.MuiLoadingButton-root': {
                          backgroundColor: 'var(--save-color)',
                          borderRadius: 0,
                          color: '#fff',
                          borderColor: 'var(--save-color)',
                        },
                      }}
                    >
                      Save
                    </LoadingButton>
                  ) : (
                    <Button
                      disabled={
                        Array.isArray(schedulerInactive) &&
                        Array.isArray(seedPeerInactive) &&
                        schedulerInactive.length + seedPeerInactive.length === 0
                      }
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                      id="next-button"
                      onClick={handleNext}
                      sx={{
                        '&.MuiButton-root': {
                          backgroundColor:
                            Array.isArray(schedulerInactive) &&
                            Array.isArray(seedPeerInactive) &&
                            schedulerInactive.length + seedPeerInactive.length === 0
                              ? ''
                              : 'var(--button-color)',
                          borderRadius: 0,
                          color: '#fff',
                        },
                      }}
                    >
                      next
                    </Button>
                  )}
                </Box>
              </Fragment>
            )}
          </Box>
        </DialogContent>
      </Dialog>
      <Box sx={{ display: 'flex' }}>
        <Paper
          variant="outlined"
          sx={{ width: '50%', mr: '0.5rem', p: '1.2rem', display: 'flex', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', width: '70%' }}>
            <Box className={styles.doughnut}>
              {schedulerTableIsLoading ? (
                <Skeleton variant="circular" width="100%" height="100%" />
              ) : (
                <Doughnut data={schedulerDoughnut} options={schedulerDoughnutOptions} />
              )}
            </Box>
            <Box sx={{ ml: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontFamily="mabry-bold">
                Scheduler
              </Typography>
              <Box>
                {schedulerTableIsLoading ? (
                  <Skeleton width="2rem" />
                ) : (
                  <Typography variant="h5" fontFamily="mabry-bold">
                    {numberOfActiveSchedulers}
                  </Typography>
                )}
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
            <Box className={styles.doughnut}>
              {seedPeerTableIsLoading ? (
                <Skeleton variant="circular" width="100%" height="100%" />
              ) : (
                <Doughnut data={seedPeerDoughnut} options={seedPeerDoughnutOptions} />
              )}
            </Box>
            <Box sx={{ ml: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontFamily="mabry-bold">
                Seed Peer
              </Typography>
              <Box>
                {seedPeerTableIsLoading ? (
                  <Skeleton width="2rem" />
                ) : (
                  <Typography variant="h5" fontFamily="mabry-bold">
                    {numberOfActiveSeedPeers}
                  </Typography>
                )}
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
              {schedulerTableIsLoading ? (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell align="center">
                    <Skeleton />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="4rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                      <Skeleton width="4rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="2rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="3.5rem" height="2.6rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="3.8rem" height="2.8rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="2.5rem" height="2.5rem" />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : allSchedulers.length === 0 ? (
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
                          <TableCell align="center">{item?.id}</TableCell>
                          <TableCell align="center">
                            <RouterLink
                              component={Link}
                              to={`/clusters/${params.id}/schedulers/${item?.id}`}
                              underline="hover"
                              sx={{ color: 'var(--description-color)' }}
                            >
                              {item?.host_name}
                            </RouterLink>
                          </TableCell>
                          <TableCell align="center">
                            <Box className={styles.ipContainer}>
                              <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                              {item?.ip}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item?.port}</TableCell>
                          <TableCell align="center">
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
                          </TableCell>
                          <TableCell align="center">
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
              {seedPeerTableIsLoading ? (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell align="center">
                    <Skeleton />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="4rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                      <Skeleton width="4rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="2rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="2rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="2rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="2rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="3.5rem" height="2.6rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="2.5rem" height="2.5rem" />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : allseedPeers.length === 0 ? (
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
                          <TableCell align="center">{item?.id}</TableCell>
                          <TableCell align="center">
                            <RouterLink
                              component={Link}
                              to={`/clusters/${params.id}/seed-peers/${item?.id}`}
                              underline="hover"
                              sx={{ color: 'var(--description-color)' }}
                            >
                              {item?.host_name}
                            </RouterLink>
                          </TableCell>
                          <TableCell align="center">
                            <Box className={styles.ipContainer}>
                              <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                              {item?.ip}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item?.port}</TableCell>
                          <TableCell align="center">{item?.download_port}</TableCell>
                          <TableCell align="center">
                            {item?.object_storage_port === 0 ? '-' : item?.object_storage_port}
                          </TableCell>
                          <TableCell align="center">{_.upperFirst(item?.type) || ''}</TableCell>
                          <TableCell align="center">
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
