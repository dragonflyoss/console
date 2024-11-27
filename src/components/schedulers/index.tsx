import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
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
  List,
  ListItem,
  Tooltip as MuiTooltip,
  ListSubheader,
  LinearProgressProps,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  debounce,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  deleteCluster,
  deleteScheduler,
  getSchedulersResponse,
  getSeedPeersResponse,
  getSchedulerFeatrues,
  updateSchedulerFeatrues,
} from '../../lib/api';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import styles from './index.module.css';
import _ from 'lodash';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '../../lib/constants';
import { fuzzySearchScheduler, getPaginatedList, useQuery } from '../../lib/utils';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import DeleteAnimation from '../delete-animation';
import DeleteSuccessfullyAnimation from '../deleted-successfully-animation';
import SearchCircularProgress from '../circular-progress';
import { CancelLoadingButton, SavelLoadingButton } from '../loading-button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import { MyContext } from '../clusters/show';

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
  const [schedulerTableIsLoading, setSchedulerTableIsLoading] = useState(true);
  const [seedPeerTableIsLoading, setSeedPeerTableIsLoading] = useState(true);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [openDeleteInactive, setOpenDeleteInactive] = useState(false);
  const [openDeleteScheduler, setOpenDeleteScheduler] = useState(false);
  const [schedulerFeatures, setSchedulerFeatures] = useState<Array<string>>([]);
  const [openSchedulerEditFeatures, setOpenSchedulerEditFeatures] = useState(false);
  const [featuresScheduler, setFeaturesScheduler] = useState(false);
  const [featuresPreheat, setFeaturesPreheat] = useState(false);
  const [schedulerSelectedRow, setSchedulerSelectedRow] = useState<getSchedulersResponse | null>(null);
  const [schedulerSelectedID, setSchedulerSelectedID] = useState('');
  const [schedulerPage, setSchedulerPage] = useState(1);
  const [schedulerTotalPages, setSchedulerTotalPages] = useState<number>(1);
  const [searchSchedulers, setSearchSchedulers] = useState('');
  const [searchSeedPeers, setSearchSeedPeer] = useState('');
  const [scheduler, setScheduler] = useState<getSchedulersResponse[]>([]);
  const [schedulerCount, setSchedulerCount] = useState<getSchedulersResponse[]>([]);
  const [allSchedulers, setAllSchedlers] = useState<getSchedulersResponse[]>([]);
  const [allInactiveError, setAllInactiveError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteAllInactiveErrorMessage, setDeleteAllInactiveErrorMessage] = useState<string[]>([]);
  const [deleteInactiveSchedulerSuccessful, setDeleteInactiveSchedulerSuccessful] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressLoading, setProgressLoading] = useState(false);
  const [searchSchedulerIconISLodaing, setSearchSchedulerIconISLodaing] = useState(false);
  const [schedulerAnchorElement, setSchedulerAnchorElement] = useState(null);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [status, setStatus] = useState<string>('ALL');
  const steps = ['Schedulers', 'Confirm delete'];
  const params = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();
  const schedulerCurrentPage = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';

  const { cluster } = useContext(MyContext);

  const schedulers = useCallback(async () => {
    if (cluster.scheduler_cluster_id) {
      const scheduler = await getSchedulers({
        scheduler_cluster_id: String(cluster.scheduler_cluster_id),
        page: 1,
        per_page: MAX_PAGE_SIZE,
      });

      setScheduler(scheduler);
      setSchedulerCount(scheduler);
    }
  }, [cluster.scheduler_cluster_id]);

  useEffect(() => {
    (async function () {
      try {
        setSeedPeerTableIsLoading(true);
        setSchedulerTableIsLoading(true);
        setSchedulerPage(schedulerCurrentPage);

        if (typeof params.id === 'string') {
          await schedulers();
          const features = await getSchedulerFeatrues();

          setSchedulerFeatures(features);
          setSchedulerTableIsLoading(false);
          setSeedPeerTableIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setSchedulerTableIsLoading(false);
          setSeedPeerTableIsLoading(false);
        }
      }
    })();
  }, [params.id, schedulerCurrentPage, schedulers]);

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

      const statusScheduler =
        (status !== 'ALL' && Array.isArray(scheduler) && scheduler.filter((item) => item.state === status)) ||
        scheduler;

      const totalPage = Math.ceil(statusScheduler.length / DEFAULT_PAGE_SIZE);
      const currentPageData = getPaginatedList(statusScheduler, schedulerPage, DEFAULT_PAGE_SIZE);

      if (currentPageData.length === 0 && schedulerPage > 1) {
        setSchedulerPage(schedulerPage - 1);
      }

      setSchedulerTotalPages(totalPage);
      setAllSchedlers(currentPageData);
    } else {
      setSchedulerTotalPages(1);
      setAllSchedlers([]);
    }
  }, [scheduler, schedulerPage, status]);

  const numberOfActiveSchedulers =
    Array.isArray(schedulerCount) && schedulerCount?.filter((item: any) => item?.state === 'active').length;

  const numberOfInactiveSchedulers =
    Array.isArray(schedulerCount) && schedulerCount?.filter((item: any) => item?.state === 'inactive').length;

  const schedulerInactive =
    Array.isArray(schedulerCount) && schedulerCount?.filter((item: any) => item?.state === 'inactive');

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
        enabled: schedulerCount.length !== 0,
      },
    },
    cutout: '60%',
  };

  const schedulerDoughnut = {
    labels: [schedulerCount.length === 0 ? '' : 'Active', 'Inactive'],
    datasets: [
      {
        data: [schedulerCount.length === 0 ? [1] : numberOfActiveSchedulers, numberOfInactiveSchedulers],
        backgroundColor: [schedulerCount.length === 0 ? '#cdcdcd' : '#2e8f79', '#1c293a'],
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
    setOpenDeleteScheduler(false);
    setSchedulerSelectedRow(null);
    setOpenSchedulerEditFeatures(false);
    setSchedulerAnchorElement(null);
    if (!progressLoading) {
      setOpenDeleteInactive(false);
      setDeleteAllInactiveErrorMessage([]);
      setDeleteInactiveSchedulerSuccessful(0);
      setActiveStep(0);
    }
  };

  const openHandleScheduler = (row: any) => {
    setSchedulerSelectedRow(row);
    setSchedulerSelectedID(row.id);
    setOpenDeleteScheduler(true);
  };

  const handleDeleteScheduler = async () => {
    setSchedulerTableIsLoading(true);
    setDeleteLoadingButton(true);

    try {
      await deleteScheduler(schedulerSelectedID);
      setOpenDeleteScheduler(false);
      setDeleteLoadingButton(false);

      await schedulers();
      setSchedulerTableIsLoading(false);
      setSuccessMessage(true);
    } catch (error) {
      if (error instanceof Error) {
        setSchedulerTableIsLoading(false);

        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  const debouncedScheduler = useMemo(
    () =>
      debounce(async (currentSearch) => {
        if (currentSearch && schedulerCount.length > 0) {
          const schedulers = fuzzySearchScheduler(currentSearch, schedulerCount);

          setScheduler(schedulers);
          setSearchSchedulerIconISLodaing(false);
        } else if (currentSearch === '' && schedulerCount.length > 0) {
          setScheduler(schedulerCount);
          setSearchSchedulerIconISLodaing(false);
        }
      }, 500),
    [schedulerCount],
  );

  const handlesearchScheduler = useCallback(
    (newSearch: any) => {
      setSearchSchedulers(newSearch);
      setSearchSchedulerIconISLodaing(true);
      debouncedScheduler(newSearch);

      const schedulerQueryString = newSearch ? `?search=${newSearch}` : '';

      navigate(`${location.pathname}${schedulerQueryString}`);
    },
    [debouncedScheduler, location.pathname, navigate],
  );

  useEffect(() => {
    if (search) {
      setSearchSchedulers(search);
      debouncedScheduler(search);
    }
  }, [search, debouncedScheduler]);

  const handleConfirmDelete = async (event: any) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const deleteAllInactive = event.currentTarget.elements.deleteAllInactive.value;

    if (deleteAllInactive !== 'DELETE') {
      setAllInactiveError(true);
    } else if (deleteAllInactive === 'DELETE') {
      setProgressLoading(true);
      handleNext();

      const schedulerID = Array.isArray(schedulerInactive) && schedulerInactive.map((item: any) => item.id);

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

      const executeDelete = async (schedulersIds: any) => {
        if (schedulerID !== false) {
          const totalApiCalls = schedulerID.length;

          const increment = 100 / totalApiCalls;
          const onDeleteSuccess = () => {
            setProgress((prevProgress) => prevProgress + increment);
          };

          try {
            await deleteSelectedSchedulers(schedulersIds, onDeleteSuccess);

            setProgressLoading(false);

            const scheduler = await getSchedulers({
              scheduler_cluster_id: String(cluster.scheduler_cluster_id),
              page: 1,
              per_page: MAX_PAGE_SIZE,
            });
            setScheduler(scheduler);
            setSchedulerCount(scheduler);
          } catch (error) {
            setProgressLoading(false);
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
            }
            try {
              const scheduler = await getSchedulers({
                scheduler_cluster_id: String(cluster.scheduler_cluster_id),
                page: 1,
                per_page: MAX_PAGE_SIZE,
              });
              setScheduler(scheduler);
              setSchedulerCount(scheduler);
            } catch (error) {
              if (error instanceof Error) {
                setErrorMessage(true);
                setErrorMessageText(error.message);
              }
            }
          }
        }
      };

      executeDelete(schedulerID);
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
  };

  const handleEditFeatures = async () => {
    setDeleteLoadingButton(true);
    setSchedulerTableIsLoading(true);

    const features = [featuresScheduler ? 'schedule' : '', featuresPreheat ? 'preheat' : ''];
    const filteredFeatures = features.filter((item) => item !== '');

    const formData = {
      features: filteredFeatures,
    };
    if (schedulerSelectedID) {
      try {
        await updateSchedulerFeatrues(schedulerSelectedID, { ...formData });
        setDeleteLoadingButton(false);
        setOpenSchedulerEditFeatures(false);

        await schedulers();
        setSchedulerTableIsLoading(false);
        setSuccessMessage(true);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setSchedulerTableIsLoading(false);
          setErrorMessageText(error.message);
          setDeleteLoadingButton(false);
        }
      }
    }
  };

  useEffect(() => {
    setFeaturesScheduler(schedulerSelectedRow?.features.includes('schedule') || false);
    setFeaturesPreheat(schedulerSelectedRow?.features.includes('preheat') || false);
  }, [schedulerSelectedRow]);

  const statusList = [
    { lable: 'All', name: 'ALL' },
    { lable: 'Active', name: 'active' },
    { lable: 'Inactive', name: 'inactive' },
  ];

  const changeStatus = (event: any) => {
    setStatus(event.target.value);
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
      <Box className={styles.openDeleteInactiveDialog}>
        <Typography variant="h6" fontFamily="mabry-bold">
          Schedulers
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
            DELETE INACTIVE schedulers
          </Button>
        </MuiTooltip>
      </Box>
      <Box sx={{ display: 'flex', mb: '3rem' }}>
        <Paper variant="outlined" sx={{ width: '50%', p: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', width: '70%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontFamily="mabry-bold" color="#637381">
                Total
              </Typography>
              <Box>
                {schedulerTableIsLoading ? (
                  <Skeleton data-testid="cluster-loading" width="2rem" />
                ) : (
                  <Typography id="total" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                    {schedulerCount.length}
                  </Typography>
                )}
                <div>number of schedulers</div>
              </Box>
            </Box>
          </Box>
          <Box component="img" src="/icons/peer/statistics.svg" sx={{ width: '5rem' }} />
        </Paper>
        <Paper
          variant="outlined"
          sx={{ width: '50%', ml: '1rem', p: '1.2rem', display: 'flex', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', width: '70%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontFamily="mabry-bold" color="#637381">
                Active
              </Typography>
              <Box>
                {seedPeerTableIsLoading ? (
                  <Skeleton data-testid="cluster-loading" width="2rem" />
                ) : (
                  <Typography id="active" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                    {numberOfActiveSchedulers}
                  </Typography>
                )}
                <div>number of active schedulers</div>
              </Box>
            </Box>
          </Box>
          <Box className={styles.doughnut}>
            {schedulerTableIsLoading ? (
              <Skeleton data-testid="cluster-loading" variant="circular" width="100%" height="100%" />
            ) : (
              <Doughnut data={schedulerDoughnut} options={schedulerDoughnutOptions} />
            )}
          </Box>
        </Paper>
      </Box>
      <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Box className={styles.searchContainer}>
          <Stack spacing={2} sx={{ width: '20rem' }}>
            <Autocomplete
              size="small"
              color="secondary"
              id="free-solo-demo"
              freeSolo
              inputValue={searchSchedulers}
              onInputChange={(_event, newInputValue) => {
                handlesearchScheduler(newInputValue);
              }}
              options={schedulerCount.map((option) => option?.host_name)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: searchSchedulerIconISLodaing ? <SearchCircularProgress /> : <SearchIcon />,
                  }}
                />
              )}
            />
          </Stack>
          <FormControl sx={{ width: '10rem' }} size="small">
            <InputLabel id="states-select">Status</InputLabel>
            <Select
              id="states-select"
              value={status}
              label="changeStatus"
              open={openStatusSelect}
              onClose={() => {
                setOpenStatusSelect(false);
              }}
              onOpen={() => {
                setOpenStatusSelect(true);
              }}
              onChange={changeStatus}
            >
              <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                Filter by status
              </Typography>
              <Divider />
              {statusList.map((item) => (
                <MenuItem key={item.name} value={item.name}>
                  {item.lable}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box width="100%">
          <Divider />
          <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="scheduler-table">
            <TableHead sx={{ backgroundColor: 'var(--table-title-color)' }}>
              <TableRow>
                <TableCell align="center">
                  <Typography variant="subtitle1" color="var(--table-title-text-color)" fontFamily="mabry-bold">
                    ID
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" color="var(--table-title-text-color)" fontFamily="mabry-bold">
                    Hostname
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" color="var(--table-title-text-color)" fontFamily="mabry-bold">
                    IP
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" color="var(--table-title-text-color)" fontFamily="mabry-bold">
                    Port
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" color="var(--table-title-text-color)" fontFamily="mabry-bold">
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" color="var(--table-title-text-color)" fontFamily="mabry-bold">
                    Features
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle1" color="var(--table-title-text-color)" fontFamily="mabry-bold">
                    Operation
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody id="scheduler-table-body">
              {schedulerTableIsLoading ? (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell align="center">
                    <Skeleton data-testid="scheduler-loading" />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton data-testid="scheduler-loading" width="4rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                      <Skeleton data-testid="scheduler-loading" width="4rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton data-testid="scheduler-loading" width="2rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton data-testid="scheduler-loading" width="3.5rem" height="2.6rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton data-testid="scheduler-loading" width="3.8rem" height="2.8rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton data-testid="scheduler-loading" width="2.5rem" height="2.5rem" />
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
                          <TableCell align="center" id={`id-${item?.id}`}>
                            {item?.id}
                          </TableCell>
                          <TableCell align="center" id={`hostname-${item?.host_name}`}>
                            <RouterLink
                              component={Link}
                              to={`/clusters/${params.id}/schedulers/${item?.id}`}
                              underline="hover"
                              sx={{ color: 'var(--description-color)' }}
                            >
                              {item?.host_name}
                            </RouterLink>
                          </TableCell>
                          <TableCell align="center" id={`ip-${item?.id}`}>
                            <Box className={styles.ipContainer}>
                              <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                              {item?.ip}
                            </Box>
                          </TableCell>
                          <TableCell align="center" id={`port-${item?.port}`}>
                            {item?.port}
                          </TableCell>
                          <TableCell align="center" id={`state-${item?.id}`}>
                            {/* <Paper
                              elevation={0}
                              sx={{
                                backgroundColor:
                                  item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                                color: item?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                                borderColor:
                                  item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                                fontWeight: 'bold',
                                p: '0.1rem',
                              }}
                            >
                              {_.upperFirst(item?.state) || ''}
                            </Paper> */}
                            <Chip
                              label={_.upperFirst(item?.state) || ''}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: '0.2rem',
                                backgroundColor:
                                  item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                                color: item?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                                borderColor:
                                  item?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                                fontWeight: 'bold',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" id={`features-${item?.id}`}>
                            <Box className={styles.features}>
                              {Array.isArray(item.features) &&
                                item.features.map((item: string, id: any) => (
                                  <Chip
                                    key={id}
                                    label={_.upperFirst(item) || ''}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderRadius: '0.2rem',
                                      background: 'var(--button-color)',
                                      color: '#FFFFFF',
                                      m: '0 0.4rem',
                                      borderColor: 'var(--button-color)',
                                      fontWeight: 'bold',
                                    }}
                                  />

                                  // <Paper
                                  //   elevation={0}
                                  //   sx={{
                                  //     backgroundColor: 'var(--button-color)',
                                  //     color: '#FFFFFF',
                                  //     borderColor: 'var(--button-color)',
                                  //     m: '0 0.4rem',
                                  //     p: '0.1rem 0.1rem',
                                  //   }}
                                  // >
                                  //   {_.upperFirst(item) || ''}
                                  // </Paper>
                                ))}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              id={`operation-${item?.id}`}
                              onClick={(event: any) => {
                                setSchedulerAnchorElement(event.currentTarget);
                                setSchedulerSelectedRow(item);
                                setSchedulerSelectedID(item.id);
                              }}
                              size="small"
                              aria-controls={Boolean(schedulerAnchorElement) ? item?.host_name : undefined}
                              aria-haspopup="true"
                              aria-expanded={Boolean(schedulerAnchorElement) ? 'true' : undefined}
                              sx={{ position: 'relative', padding: '0' }}
                            >
                              <MoreVertIcon sx={{ color: 'var(--button-color)' }} />
                            </IconButton>
                            <Menu
                              anchorEl={schedulerAnchorElement}
                              id={schedulerSelectedRow?.host_name}
                              open={Boolean(schedulerAnchorElement)}
                              onClose={handleDeleteClose}
                              sx={{
                                position: 'absolute',
                                left: '-3rem',
                                '& .MuiMenu-paper': {
                                  boxShadow:
                                    '0 0.075rem 0.2rem -0.0625rem #32325d40, 0 0.0625rem 0.0145rem -0.0625rem #0000004d;',
                                },
                                '& .MuiMenu-list': {
                                  p: 0,
                                  width: '10rem',
                                },
                              }}
                            >
                              {schedulerFeatures && schedulerFeatures.length > 0 ? (
                                <MenuItem
                                  className={styles.menuItem}
                                  id={`edit-${schedulerSelectedRow?.host_name}`}
                                  onClick={() => {
                                    setOpenSchedulerEditFeatures(true);
                                    setSchedulerAnchorElement(null);
                                  }}
                                >
                                  <ListItemIcon>
                                    <DriveFileRenameOutlineOutlinedIcon className={styles.menuItemIcon} />
                                  </ListItemIcon>
                                  Edit Features
                                </MenuItem>
                              ) : (
                                ''
                              )}
                              <MenuItem
                                className={styles.menuItem}
                                id={`delete-${schedulerSelectedRow?.host_name}`}
                                onClick={() => {
                                  openHandleScheduler(schedulerSelectedRow);
                                  setSchedulerAnchorElement(null);
                                }}
                              >
                                <ListItemIcon>
                                  <DeleteOutlineIcon className={styles.menuItemIcon} />
                                </ListItemIcon>
                                Delete
                              </MenuItem>
                            </Menu>
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
      {schedulerTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={schedulerTotalPages}
            page={schedulerPage}
            onChange={(_event: any, newPage: number) => {
              setSchedulerPage(newPage);
              navigate(`/clusters/${params.id}/schedulers${newPage > 1 ? `?page=${newPage}` : ''}`);
            }}
            color="primary"
            size="small"
            id="scheduler-pagination"
          />
        </Box>
      ) : (
        <></>
      )}
      <Dialog
        open={openDeleteInactive}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '44rem',
          },
          position: 'absolute',
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
              Delete inactive schedulers
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
                              <Typography component="div" variant="h5" fontFamily="mabry-bold">
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
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div" id="failure">
                                  Failure
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h5" fontFamily="mabry-bold">
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
                      <Box>
                        {/* <Box className={styles.logHeaderWrapper}>
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
                        </Box> */}
                        <Box sx={{ height: '7rem' }} />
                        <Box sx={{ position: 'absolute', top: '3rem', right: '13rem' }}>
                          {/* <Paper variant="outlined" className={styles.successHeaderContainer}>
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
                          </Paper> */}
                          <DeleteSuccessfullyAnimation />
                        </Box>
                        <Alert variant="outlined" severity="success">
                          You have successfully removed {deleteInactiveSchedulerSuccessful || '0'} inactive schedulers!
                        </Alert>
                      </Box>
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
                      Delete
                    </LoadingButton>
                  ) : (
                    <Button
                      disabled={Array.isArray(schedulerInactive) && schedulerInactive.length === 0}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                      id="next-button"
                      onClick={handleNext}
                      sx={{
                        '&.MuiButton-root': {
                          backgroundColor:
                            Array.isArray(schedulerInactive) && schedulerInactive.length === 0
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
            <CancelLoadingButton
              id="cancelDeleteScheduler"
              loading={deleteLoadingButton}
              onClick={() => {
                setOpenDeleteScheduler(false);
                setSchedulerSelectedRow(null);
              }}
            />
            <SavelLoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
              id="deleteScheduler"
              onClick={handleDeleteScheduler}
              text="Delete"
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openSchedulerEditFeatures}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '38rem',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: '1rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" sx={{ width: '1.8rem' }} src="/icons/cluster/features.svg" />
            <Typography variant="h6" fontFamily="mabry-bold" pl="0.5rem">
              Featrues
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            id="close-delete-icon"
            onClick={() => {
              setOpenSchedulerEditFeatures(false);
              setSchedulerSelectedRow(null);
            }}
            sx={{
              color: (theme) => theme.palette.grey[500],
              p: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{
              p: '0.2rem 0.4rem',
              m: '0.6rem 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box className={styles.featuresIconWrapper}>
                <Box className={styles.featuresIconContainer}>
                  <Box component="img" className={styles.featuresIcon} src="/icons/cluster/scheduler.svg" />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Schedule
                </Typography>
                <Typography variant="subtitle2" color="rgb(82 82 82 / 87%)">
                  If schedule feature is enabled, the scheduler can schedule download tasks.
                </Typography>
              </Box>
            </Box>
            <Checkbox
              size="small"
              id="Schedule-Checkbox"
              checked={featuresScheduler}
              onChange={(e) => {
                setFeaturesScheduler(e.target.checked);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Paper>
          <Paper
            variant="outlined"
            sx={{
              p: '0.2rem 0.4rem',
              m: '0.6rem 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box className={styles.featuresIconWrapper}>
                <Box className={styles.featuresIconContainer}>
                  <Box component="img" className={styles.featuresIcon} src="/icons/cluster/preheat.svg" />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Preheat
                </Typography>
                <Typography variant="subtitle2" color="rgb(82 82 82 / 87%)">
                  If preheat feature is enabled, the scheduler can execute preheating job.
                </Typography>
              </Box>
            </Box>
            <Checkbox
              size="small"
              id="Preheat-Checkbox"
              checked={featuresPreheat}
              onChange={(e) => {
                setFeaturesPreheat(e.target.checked);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
            <CancelLoadingButton
              id="cancelEditFeatures"
              loading={deleteLoadingButton}
              onClick={() => {
                setOpenSchedulerEditFeatures(false);
                setSchedulerSelectedRow(null);
              }}
            />
            <SavelLoadingButton
              loading={deleteLoadingButton}
              endIcon={<CheckCircleIcon />}
              id="editFeatures"
              onClick={handleEditFeatures}
              text="Save"
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Grid sx={{ height: 2 }}> </Grid>
    </ThemeProvider>
  );
}
