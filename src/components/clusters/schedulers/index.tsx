import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Link as RouterLink,
  Skeleton,
  Snackbar,
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
  toggleButtonGroupClasses,
  ToggleButtonGroup,
  ToggleButton,
  styled,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ListItemButton,
  ListItemText,
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
import {
  getSchedulers,
  deleteScheduler,
  getSchedulersResponse,
  getSchedulerFeatrues,
  updateSchedulerFeatrues,
} from '../../../lib/api';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import styles from './index.module.css';
import _ from 'lodash';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '../../../lib/constants';
import { fuzzySearchScheduler, getPaginatedList, useQuery } from '../../../lib/utils';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import DeleteAnimation from '../../delete-animation';
import DeleteSuccessfullyAnimation from '../../deleted-successfully-animation';
import SearchCircularProgress from '../../circular-progress';
import { CancelLoadingButton, DeleteLoadingButton, SavelLoadingButton } from '../../loading-button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { MyContext } from '../../clusters/show';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Card from '../../card';

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
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
    marginLeft: -1,
    borderLeft: '1px solid transparent',
  },
}));

export default function ShowCluster() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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
  const [pageSize, setPageSize] = useState<number>(9);
  const [searchSchedulers, setSearchSchedulers] = useState('');
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
  const [status, setStatus] = useState<string>('all');
  const [alignment, setAlignment] = useState('card');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const steps = ['Schedulers', 'Confirm delete'];
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';
  const statr = query.get('status') ? (query.get('status') as string) : 'all';

  const open = Boolean(anchorEl);
  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: any, index: number) => {
    setStatus(event.name);

    const queryParts = [];
    if (search) {
      queryParts.push(`search=${search}`);
    }

    if (event.name !== 'all') {
      queryParts.push(`status=${event.name}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    navigate(`${location.pathname}${queryString}`);

    setSchedulerPage(1);
    setAnchorEl(null);
  };

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
        setIsLoading(true);

        if (typeof params.id === 'string') {
          await schedulers();
          const features = await getSchedulerFeatrues();

          setSchedulerFeatures(features);
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
  }, [params.id, schedulers]);

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
    setAnchorEl(null);
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
    setIsLoading(true);
    setDeleteLoadingButton(true);

    try {
      await deleteScheduler(schedulerSelectedID);
      setOpenDeleteScheduler(false);
      setDeleteLoadingButton(false);

      await schedulers();
      setIsLoading(false);
      setSuccessMessage(true);
    } catch (error) {
      if (error instanceof Error) {
        setIsLoading(false);

        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  useEffect(() => {
    setSchedulerPage(page);
    setStatus(statr);

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

      if (alignment === 'card') {
        const updatePageSize = () => {
          if (window.matchMedia('(max-width: 1440px)').matches) {
            setPageSize(9);
          } else if (window.matchMedia('(max-width: 1600px)').matches) {
            setPageSize(9);
          } else if (window.matchMedia('(max-width: 1920px)').matches) {
            setPageSize(12);
          } else if (window.matchMedia('(max-width: 2048px)').matches) {
            setPageSize(12);
          } else if (window.matchMedia('(max-width: 2560px)').matches) {
            setPageSize(15);
          }
        };

        updatePageSize();

        window.addEventListener('resize', updatePageSize);
      }

      const statusScheduler =
        statr !== 'all' && Array.isArray(scheduler) ? scheduler.filter((item) => item.state === statr) : scheduler;

      const totalPage = Math.ceil(statusScheduler.length / (alignment === 'card' ? pageSize : DEFAULT_PAGE_SIZE));
      const currentPageData = getPaginatedList(
        statusScheduler,
        schedulerPage,
        alignment === 'card' ? pageSize : DEFAULT_PAGE_SIZE,
      );

      if (currentPageData.length === 0 && schedulerPage > 1) {
        const queryParts = [];
        if (search) {
          queryParts.push(`search=${search}`);
        }

        if (page > 1) {
          queryParts.push(`page=${schedulerPage - 1}`);
        }

        if (status !== 'all') {
          queryParts.push(`status=${status}`);
        }
        const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

        navigate(`${location.pathname}${queryString}`);
      }

      setSchedulerTotalPages(totalPage);
      setAllSchedlers(currentPageData);
    } else {
      setSchedulerTotalPages(1);
      setAllSchedlers([]);
    }
  }, [scheduler, schedulerPage, status, pageSize, alignment, page, statr, location.pathname, navigate, search]);

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

      const queryParts = [];
      if (newSearch) {
        queryParts.push(`search=${newSearch}`);
      }

      if (statr !== 'all') {
        queryParts.push(`status=${statr}`);
      }

      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

      navigate(`${location.pathname}${queryString}`);
    },
    [debouncedScheduler, navigate, statr, location.pathname],
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
    setIsLoading(true);

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
        setIsLoading(false);
        setSuccessMessage(true);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setIsLoading(false);
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
    { lable: 'All', name: 'all' },
    { lable: 'Active', name: 'active' },
    { lable: 'Inactive', name: 'inactive' },
  ];

  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    setAlignment(newAlignment);
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
                color: '#fff',
              },
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            DELETE INACTIVE INSTANCES
          </Button>
        </MuiTooltip>
      </Box>
      <Box sx={{ display: 'flex', mb: '2rem' }}>
        <Box sx={{ width: '33.33%', mr: '1.6rem' }}>
          <Card className={styles.navigationWrapper}>
            <Box className={styles.navigationContent}>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold" color="#637381">
                  Total
                </Typography>
                {isLoading ? (
                  <Box p="0.4rem 0">
                    <Skeleton height={40} data-testid="isloading" width="2rem" />
                  </Box>
                ) : (
                  <Typography id="total" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                    {schedulerCount.length}
                  </Typography>
                )}
                <Typography variant="body2" color="var(--table-title-text-color)">
                  number of schedulers
                </Typography>
              </Box>
              <Box className={styles.navigation} />
              <Box component="img" className={styles.navigationIcon} src="/icons/peer/total.svg" />
            </Box>
          </Card>
        </Box>
        <Box sx={{ width: '33.33%', mr: '1.6rem' }}>
          <Card className={styles.navigationWrapper}>
            <Box className={styles.navigationContent}>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold" color="#637381">
                  Active
                </Typography>
                {isLoading ? (
                  <Box p="0.4rem 0">
                    <Skeleton height={40} data-testid="isloading" width="2rem" />
                  </Box>
                ) : (
                  <Typography id="active" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                    {numberOfActiveSchedulers}
                  </Typography>
                )}
                <Typography variant="body2" color="var(--table-title-text-color)">
                  number of active schedulers
                </Typography>
              </Box>
              <Box className={styles.navigation} />
              <Box component="img" className={styles.navigationIcon} src="/icons/cluster/scheduler/active.svg" />
            </Box>
          </Card>
        </Box>
        <Box sx={{ width: '33.33%' }}>
          <Card className={styles.navigationWrapper}>
            <Box className={styles.navigationContent}>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold" color="#637381">
                  Inactive
                </Typography>
                {isLoading ? (
                  <Box p="0.4rem 0">
                    <Skeleton height={40} data-testid="isloading" width="2rem" />
                  </Box>
                ) : (
                  <Typography id="inactive" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                    {numberOfInactiveSchedulers}
                  </Typography>
                )}
                <Typography variant="body2" color="var(--table-title-text-color)">
                  number of inactive schedulers
                </Typography>
              </Box>
              <Box className={styles.navigation} />
              <Box component="img" className={styles.navigationIcon} src="/icons/cluster/scheduler/inactive.svg" />
            </Box>
          </Card>
        </Box>
      </Box>
      <Box className={styles.searchWrapper}>
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
                  startAdornment: searchSchedulerIconISLodaing ? (
                    <Box
                      sx={{
                        width: '2.2rem',
                        height: '2.2rem',
                        pl: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SearchCircularProgress />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '2.2rem',
                        height: '2.2rem',
                        pl: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SearchIcon sx={{ color: '#919EAB' }} />
                    </Box>
                  ),
                }}
              />
            )}
          />
        </Stack>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <List component="nav" aria-label="Device settings" sx={{ bgcolor: 'background.paper' }}>
            <ListItemButton
              id="lock-button"
              aria-haspopup="listbox"
              aria-controls="lock-menu"
              aria-label="when device is locked"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClickListItem}
            >
              <ListItemText sx={{ pr: '0.6rem' }}>
                <Typography variant="body1" fontFamily="mabry-bold">
                  {`Filter : ${statusList.find((item) => item.name === status)?.lable || 'All'}`}
                </Typography>
              </ListItemText>
              {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </List>
          <Menu
            id="lock-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'lock-button',
              role: 'listbox',
            }}
            sx={{
              '& .MuiMenu-list': {
                p: 0,
                width: '10rem',
              },
            }}
          >
            <Box className={styles.menu}>
              <Typography variant="body1" fontFamily="mabry-bold" sx={{ m: '0.4rem 1rem' }}>
                Filter by status
              </Typography>
              <Divider sx={{ mb: '0.2rem' }} />
              {statusList.map((item, index) => (
                <MenuItem key={item.name} value={item.name} onClick={() => handleMenuItemClick(item, index)}>
                  {item.lable}
                </MenuItem>
              ))}
            </Box>
          </Menu>
          <Paper
            elevation={0}
            sx={() => ({
              display: 'flex',
              border: `1px solid var(--palette-action-hover)`,
              flexWrap: 'wrap',
              ml: '1rem',
            })}
          >
            <StyledToggleButtonGroup
              size="small"
              value={alignment}
              exclusive
              onChange={handleAlignment}
              aria-label="text alignment"
            >
              <ToggleButton id="card" value="card" aria-label="centered">
                <Box component="img" src="/icons/cluster/scheduler/card.svg" />
              </ToggleButton>
              <ToggleButton id="table" value="table" aria-label="left aligned">
                <Box component="img" src="/icons/cluster/scheduler/table.svg" />
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Paper>
        </Box>
      </Box>
      {alignment === 'card' ? (
        <Box>
          {isLoading ? (
            <Card className={styles.loadingCard}>
              <Box className={styles.clusterListContent}>
                <Box p="1.2rem 1.2rem 0 1.2rem">
                  <Box display="flex" mb="0.5rem">
                    <img className={styles.idIcon} src="/icons/cluster/id.svg" alt="" />
                    <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                  </Box>
                  <Typography variant="h6" mb="0.5rem" className={styles.nameText}>
                    <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                  </Typography>
                  <Box display="flex">
                    <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                  </Box>
                </Box>
                <Divider
                  sx={{
                    borderStyle: 'dashed',
                    borderColor: 'var(--palette-divider)',
                    borderWidth: '0px 0px thin',
                    m: '1rem 0',
                  }}
                />
                <Box p="0 1.2rem 1.2rem 1.2rem">
                  <Skeleton data-testid="isloading" sx={{ width: '4rem', height: '1.4rem', mb: '0.8rem' }} />
                  <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                </Box>
              </Box>
            </Card>
          ) : Array.isArray(allSchedulers) && allSchedulers.length > 0 ? (
            <Box id="scheduler-card" className={styles.cardCantainer}>
              {Array.isArray(allSchedulers) &&
                allSchedulers.map((item: any) => (
                  <Card className={styles.card}>
                    <Box p="1.5rem 1.5rem 1rem 1.5rem" position="relative">
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
                        className={styles.moreVertIcon}
                      >
                        <MoreVertIcon color="action" />
                      </IconButton>
                      <Menu
                        anchorEl={schedulerAnchorElement}
                        id={schedulerSelectedRow?.host_name}
                        open={Boolean(schedulerAnchorElement)}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        sx={{
                          '& .MuiMenu-paper': {
                            boxShadow:
                              '0 0.075rem 0.2rem -0.0625rem #32325d40, 0 0.0625rem 0.0145rem -0.0625rem #0000004d;',
                          },
                          '& .MuiMenu-list': {
                            p: 0,
                            width: '11rem',
                          },
                          right: 0,
                        }}
                      >
                        <Box className={styles.menu}>
                          <MenuItem
                            id={`view-${schedulerSelectedRow?.id}`}
                            onClick={() => {
                              navigate(`/clusters/${params.id}/schedulers/${schedulerSelectedRow?.id}`);
                              setSchedulerAnchorElement(null);
                            }}
                          >
                            <ListItemIcon>
                              <RemoveRedEyeIcon fontSize="small" className={styles.menuItemIcon} />
                            </ListItemIcon>
                            <Typography variant="body2" className={styles.menuText}>
                              View
                            </Typography>
                          </MenuItem>
                          {schedulerFeatures && schedulerFeatures.length > 0 ? (
                            <MenuItem
                              id={`edit-${schedulerSelectedRow?.id}`}
                              onClick={() => {
                                setOpenSchedulerEditFeatures(true);
                                setSchedulerAnchorElement(null);
                              }}
                            >
                              <ListItemIcon>
                                <ModeEditIcon fontSize="small" className={styles.menuItemIcon} />
                              </ListItemIcon>
                              <Typography variant="body2" className={styles.menuText}>
                                Edit Features
                              </Typography>
                            </MenuItem>
                          ) : (
                            ''
                          )}
                          <MenuItem
                            id={`delete-${schedulerSelectedRow?.id}`}
                            onClick={() => {
                              openHandleScheduler(schedulerSelectedRow);
                              setSchedulerAnchorElement(null);
                            }}
                          >
                            <ListItemIcon>
                              <DeleteIcon fontSize="small" sx={{ color: 'var(--delete-button-color)' }} />
                            </ListItemIcon>
                            <Typography variant="body2" className={styles.menuText} color="var(--delete-button-color)">
                              Delete
                            </Typography>
                          </MenuItem>
                        </Box>
                      </Menu>
                      <Box display="flex">
                        <img className={styles.idIcon} src="/icons/cluster/id.svg" alt="" />
                        {isLoading ? (
                          <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                        ) : (
                          <Typography id={`card-id-${item.id}`} className={styles.idText}>
                            {item.id}
                          </Typography>
                        )}
                      </Box>
                      <MuiTooltip title={item.host_name || '-'} placement="top">
                        <RouterLink
                          component={Link}
                          to={`/clusters/${params.id}/schedulers/${item?.id}`}
                          underline="hover"
                        >
                          <Typography
                            id={`card-hostname-${item.host_name}`}
                            variant="subtitle1"
                            m="0.5rem 0"
                            className={styles.hostnameCardText}
                          >
                            {item.host_name}
                          </Typography>
                        </RouterLink>
                      </MuiTooltip>
                      <Box sx={{ display: 'flex', width: '50%', alignItems: 'center' }}>
                        <Box component="img" className={styles.statusIcon} src="/icons/cluster/status.svg" />
                        <Chip
                          label={_.upperFirst(item?.state) || ''}
                          size="small"
                          variant="outlined"
                          id={`card-state-${item.id}`}
                          sx={{
                            borderRadius: '0.2rem',
                            backgroundColor:
                              item?.state === 'active'
                                ? 'var(--menu-background-color)'
                                : 'var(--palette-background-inactive)',
                            color:
                              item?.state === 'active' ? 'var(--description-color)' : 'var(--table-title-text-color)',
                            border: 0,
                            fontFamily: 'mabry-bold',
                          }}
                        />
                      </Box>
                    </Box>
                    <Divider
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: 'var(--palette-divider)',
                        borderWidth: '0px 0px thin',
                      }}
                    />
                    <Box p="1.5rem">
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: '1rem' }}>
                          <Box component="img" className={styles.statusIcon} src="/icons/cluster/ip.svg" />
                          <Typography
                            id={`card-ip-${item.id}`}
                            variant="caption"
                            sx={{ display: 'block', color: '#919EAB' }}
                          >
                            {item.ip}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                          <Box component="img" className={styles.statusIcon} src="/icons/cluster/card-features.svg" />
                          <Box className={styles.features} id={`card-features-${item.id}`}>
                            {Array.isArray(item.features) &&
                              item.features.map((features: string, id: any) => (
                                <Chip
                                  key={id}
                                  label={_.upperFirst(features) || ''}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderRadius: '0.2rem',
                                    background: 'var(--palette-background-inactive)',
                                    color: 'var(--table-title-text-color)',
                                    mr: '0.4rem',
                                    border: '0',
                                    fontFamily: 'mabry-bold',
                                  }}
                                />
                              ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                ))}
            </Box>
          ) : (
            <Card className={styles.noData}>
              <Box component="img" className={styles.nodataIcon} src="/icons/cluster/scheduler/ic-content.svg" />
              <Typography id="no-scheduler" variant="h6" className={styles.nodataText}>
                You don't have scheduler cluster.
              </Typography>
            </Card>
          )}
        </Box>
      ) : (
        <Card>
          <Box width="100%">
            <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="scheduler-table">
              <TableHead sx={{ backgroundColor: 'var(--table-title-color)' }}>
                <TableRow>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      ID
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Hostname
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      IP
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Port
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Features
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Operation
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="scheduler-table-body" sx={{ border: 'none' }}>
                {isLoading ? (
                  <TableRow
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell align="center">
                      <Skeleton data-testid="isloading" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton data-testid="isloading" width="4rem" />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton data-testid="isloading" width="4rem" />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton data-testid="isloading" width="2rem" />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton data-testid="isloading" width="3.5rem" height="2.6rem" />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton data-testid="isloading" width="3.8rem" height="2.8rem" />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton data-testid="isloading" width="2.5rem" height="2.5rem" />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : allSchedulers.length === 0 ? (
                  <TableCell id="no-scheduler-table" colSpan={9} align="center" sx={{ border: 0 }}>
                    You don't have scheduler cluster.
                  </TableCell>
                ) : (
                  <>
                    {Array.isArray(allSchedulers) &&
                      allSchedulers.map((item: any) => {
                        return (
                          <TableRow
                            key={item?.id}
                            selected={schedulerSelectedRow === item}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                            }}
                            className={styles.tableRow}
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
                              {item?.ip}
                            </TableCell>
                            <TableCell align="center" id={`port-${item?.port}`}>
                              {item?.port}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                id={`state-${item?.id}`}
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
                                  item.features.map((features: string, id: any) => (
                                    <Chip
                                      key={id}
                                      label={_.upperFirst(features) || ''}
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
                              >
                                <MoreVertIcon color="action" />
                              </IconButton>
                              <Menu
                                anchorEl={schedulerAnchorElement}
                                id={schedulerSelectedRow?.host_name}
                                open={Boolean(schedulerAnchorElement)}
                                onClose={handleClose}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right',
                                }}
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right',
                                }}
                                sx={{
                                  '& .MuiMenu-paper': {
                                    boxShadow:
                                      '0 0.075rem 0.2rem -0.0625rem #32325d40, 0 0.0625rem 0.0145rem -0.0625rem #0000004d;',
                                  },
                                  '& .MuiMenu-list': {
                                    p: 0,
                                    width: '11rem',
                                  },
                                }}
                              >
                                <Box className={styles.menu}>
                                  <MenuItem
                                    id={`view-${schedulerSelectedRow?.host_name}`}
                                    onClick={() => {
                                      navigate(`/clusters/${params.id}/schedulers/${schedulerSelectedRow?.id}`);
                                      setSchedulerAnchorElement(null);
                                    }}
                                  >
                                    <ListItemIcon>
                                      <RemoveRedEyeIcon fontSize="small" className={styles.menuItemIcon} />
                                    </ListItemIcon>
                                    <Typography variant="body2" className={styles.menuText}>
                                      View
                                    </Typography>
                                  </MenuItem>
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
                                        <ModeEditIcon fontSize="small" className={styles.menuItemIcon} />
                                      </ListItemIcon>
                                      <Typography variant="body2" className={styles.menuText}>
                                        Edit Features
                                      </Typography>
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
                                      <DeleteIcon fontSize="small" sx={{ color: 'var(--delete-button-color)' }} />
                                    </ListItemIcon>
                                    <Typography
                                      variant="body2"
                                      className={styles.menuText}
                                      color="var(--delete-button-color)"
                                    >
                                      Delete
                                    </Typography>
                                  </MenuItem>
                                </Box>
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
        </Card>
      )}
      {schedulerTotalPages > 1 ? (
        <Box id="pagination" display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={schedulerTotalPages}
            page={schedulerPage}
            onChange={(_event: any, newPage: number) => {
              setSchedulerPage(newPage);

              const queryParts = [];
              if (search) {
                queryParts.push(`search=${search}`);
              }
              if (newPage > 1) {
                queryParts.push(`page=${newPage}`);
              }

              if (statr !== 'all') {
                queryParts.push(`status=${statr}`);
              }

              const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

              navigate(`${location.pathname}${queryString}`);
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
        onClose={handleClose}
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
              Delete inactive instances
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
                          <Card className={styles.headerContainer}>
                            <Box>
                              <Box className={styles.headerContent}>
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div">
                                  Schedulers
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h5" fontFamily="mabry-bold">
                                {deleteInactiveSchedulerSuccessful || '0'}
                              </Typography>
                              <Typography color="var(--table-title-text-color)" component="div" variant="subtitle2">
                                number of deleted schedulers
                              </Typography>
                            </Box>
                            <Box
                              component="img"
                              className={styles.headerErrorIcon}
                              src="/icons/cluster/delete-inactive.svg"
                            />
                          </Card>
                          <Card className={styles.headerContainer}>
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
                          </Card>
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
                        <Box sx={{ height: '7rem' }} />
                        <Box sx={{ position: 'absolute', top: '3rem', right: '13rem' }}>
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
                  <Card>
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
                    <hr className={styles.divider} />
                    <Box>
                      <ListSubheader color="inherit" className={styles.schedulerInactiveListTitle}>
                        <Box className={styles.schedulerInactiveHeaderID}>
                          <Typography
                            variant="body2"
                            fontFamily="mabry-bold"
                            color="var(--table-title-text-color)"
                            component="div"
                          >
                            ID
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderHostname}>
                          <Typography
                            variant="body2"
                            fontFamily="mabry-bold"
                            color="var(--table-title-text-color)"
                            component="div"
                          >
                            Hostname
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderIP}>
                          <Typography
                            variant="body2"
                            fontFamily="mabry-bold"
                            color="var(--table-title-text-color)"
                            component="div"
                          >
                            IP
                          </Typography>
                        </Box>
                      </ListSubheader>
                      <hr className={styles.divider} />
                      {Array.isArray(schedulerInactive) && schedulerInactive.length !== 0 ? (
                        <List
                          sx={{
                            width: '100%',
                            bgcolor: 'background.Card',
                            overflow: 'auto',
                            maxHeight: 300,
                            padding: '0',
                          }}
                          subheader={<li />}
                        >
                          {Array.isArray(schedulerInactive) &&
                            schedulerInactive.map((item, index) => {
                              return index !== schedulerInactive.length - 1 ? (
                                <Box key={item.id}>
                                  <ListItem className={styles.schedulerInactiveList}>
                                    <MuiTooltip title={item.id || '-'} placement="top">
                                      <Typography
                                        variant="body2"
                                        component="div"
                                        className={styles.schedulerInactiveID}
                                      >
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
                                      <Typography
                                        variant="body2"
                                        component="div"
                                        className={styles.schedulerInactiveIP}
                                      >
                                        {item.ip}
                                      </Typography>
                                    </MuiTooltip>
                                  </ListItem>
                                  <hr className={styles.divider} />
                                </Box>
                              ) : (
                                <Box key={item.id}>
                                  <ListItem className={styles.schedulerInactiveList}>
                                    <MuiTooltip title={item.id || '-'} placement="top">
                                      <Typography
                                        variant="body2"
                                        component="div"
                                        className={styles.schedulerInactiveID}
                                      >
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
                                      <Typography
                                        variant="body2"
                                        component="div"
                                        className={styles.schedulerInactiveIP}
                                      >
                                        {item.ip}
                                      </Typography>
                                    </MuiTooltip>
                                  </ListItem>
                                </Box>
                              );
                            })}
                        </List>
                      ) : (
                        <Typography variant="subtitle2" component="div" className={styles.noInactiveScheduler}>
                          You don't have any inactive scheduler.
                        </Typography>
                      )}
                    </Box>
                  </Card>
                ) : activeStep === 1 ? (
                  <Box>
                    <Box display="flex" alignItems="flex-start" pb="1rem">
                      <Box
                        component="img"
                        src="/icons/cluster/delete-warning.svg"
                        sx={{ width: '1.4rem', height: '1.4rem', pr: '0.2rem' }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          fontFamily="mabry-bold"
                          component="span"
                          sx={{ color: 'var(--delete-button-color)' }}
                        >
                          WARNING:&nbsp;
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ color: 'var(--delete-button-color)' }}>
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
                          backgroundColor: 'var(--delete-button-color)',
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
        onClose={handleClose}
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
            <DeleteLoadingButton
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
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '36rem',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: '0.8rem 1rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" sx={{ width: '1.6rem' }} src="/icons/cluster/features.svg" />
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
          <Card className={styles.featuresEdit}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box className={styles.featuresIconWrapper}>
                <Box className={styles.featuresIconContainer}>
                  <Box component="img" className={styles.featuresIcon} src="/icons/cluster/scheduler.svg" />
                </Box>
              </Box>
              <Box>
                <Typography component="div" variant="body2" fontFamily="mabry-bold">
                  Schedule
                </Typography>
                <Typography component="div" variant="caption" color="rgb(82 82 82 / 87%)">
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
          </Card>
          <Card className={styles.featuresEdit}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box className={styles.featuresIconWrapper}>
                <Box className={styles.featuresIconContainer}>
                  <Box component="img" className={styles.featuresIcon} src="/icons/cluster/preheat.svg" />
                </Box>
              </Box>
              <Box>
                <Typography component="div" variant="body2" fontFamily="mabry-bold">
                  Preheat
                </Typography>
                <Typography component="div" variant="caption" color="rgb(82 82 82 / 87%)">
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
          </Card>
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
    </ThemeProvider>
  );
}
