import Paper from '@mui/material/Paper';
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
import { ReactComponent as Total } from '../../../assets/images/cluster/peer/total.svg';
import { ReactComponent as Active } from '../../../assets/images/cluster/scheduler/active.svg';
import { ReactComponent as Inactive } from '../../../assets/images/cluster/scheduler/inactive.svg';
import { ReactComponent as SelectCard } from '../../../assets/images/cluster/scheduler/card.svg';
import { ReactComponent as SelectTable } from '../../../assets/images/cluster/scheduler/table.svg';
import { ReactComponent as ID } from '../../../assets/images/cluster/id.svg';
import { ReactComponent as Status } from '../../../assets/images/cluster/status.svg';
import { ReactComponent as IP } from '../../../assets/images/cluster/ip.svg';
import { ReactComponent as CardFeatures } from '../../../assets/images/cluster/card-features.svg';
import { ReactComponent as Delete } from '../../../assets/images/cluster/delete.svg';
import { ReactComponent as IcContent } from '../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as InactiveTotal } from '../../../assets/images/cluster/inactive-total.svg';
import { ReactComponent as DeleteWarning } from '../../../assets/images/cluster/delete-warning.svg';
import { ReactComponent as DeleteInactive } from '../../../assets/images/cluster/delete-inactive.svg';
import { ReactComponent as DeleteInactiveError } from '../../../assets/images/cluster/delete-inactive-error.svg';
import { ReactComponent as Failure } from '../../../assets/images/job/preheat/failure.svg';
import { ReactComponent as Features } from '../../../assets/images/cluster/features.svg';
import { ReactComponent as Preheat } from '../../../assets/images/cluster/preheat.svg';
import { ReactComponent as Schedule } from '../../../assets/images/cluster/scheduler.svg';
import { ReactComponent as Count } from '../../../assets/images/cluster/scheduler/number.svg';

function CircularProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box className={styles.progressBarWrapper}>
      <Box className={styles.progressBar}>
        <LinearProgress
          color="error"
          sx={{ height: '0.6rem', borderRadius: '0.2rem' }}
          variant="determinate"
          {...props}
        />
      </Box>
      <Box className={styles.progressBarLabelWrapper}>
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
  const [alignment, setAlignment] = useState('card');
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

  const handleMenuItemClick = (event: any) => {
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
  }, [scheduler, schedulerPage, alignment, pageSize, page, status, location.pathname, navigate, search, statr]);

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

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box>
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
        <MuiTooltip title="Delete inactive schedulers." placement="top">
          <Button
            variant="contained"
            size="small"
            id="delete-all-inactive-instances"
            onClick={() => {
              setOpenDeleteInactive(true);
            }}
            className={styles.button}
          >
            <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            DELETE INACTIVE INSTANCES
          </Button>
        </MuiTooltip>
      </Box>
      <Box className={styles.navigationContainer}>
        <Card className={styles.navigationWrapper}>
          <Box>
            <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
              Total
            </Typography>
            {isLoading ? (
              <Box p="0.4rem 0">
                <Skeleton height={40} data-testid="isloading" width="2rem" />
              </Box>
            ) : (
              <Typography id="total" variant="h5" p="0.5rem 0">
                {schedulerCount.length}
              </Typography>
            )}
            <Box className={styles.navigationCount}>
              <span className={styles.navigationCountIcon}>
                <Count />
              </span>
              <Typography variant="body2" color="var(--palette-table-title-text-color)">
                number of schedulers
              </Typography>
            </Box>
          </Box>
          <Box className={styles.navigation} />
          <Total className={styles.navigationIcon} />
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Active
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="active" variant="h5" p="0.5rem 0">
                  {numberOfActiveSchedulers}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                <span className={styles.navigationCountIcon}>
                  <Count />
                </span>
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of active schedulers{' '}
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            <Active className={styles.navigationIcon} />
          </Box>
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Inactive
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="inactive" variant="h5" p="0.5rem 0">
                  {numberOfInactiveSchedulers}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                <span className={styles.navigationCountIcon}>
                  <Count />
                </span>
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of inactive schedulers
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            <Inactive className={styles.navigationIcon} />
          </Box>
        </Card>
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
                    <Box className={styles.searchIconContainer}>
                      <SearchCircularProgress />
                    </Box>
                  ) : (
                    <Box className={styles.searchIconContainer}>
                      <SearchIcon sx={{ color: '#919EAB' }} />
                    </Box>
                  ),
                }}
              />
            )}
          />
        </Stack>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <List component="nav" aria-label="Device settings">
            <ListItemButton
              id="lock-button"
              aria-haspopup="listbox"
              aria-controls="lock-menu"
              aria-label="when device is locked"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClickListItem}
              sx={{ borderRadius: '0.3rem' }}
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
            <Typography variant="body1" fontFamily="mabry-bold" sx={{ m: '0.4rem 1rem' }}>
              Filter by status
            </Typography>
            <Divider sx={{ mb: '0.2rem' }} />
            {statusList.map((item, index) => (
              <MenuItem
                selected={status === item.name}
                className={styles.menuItem}
                key={item.name}
                value={item.name}
                onClick={() => handleMenuItemClick(item)}
              >
                {item.lable}
              </MenuItem>
            ))}
          </Menu>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              border: `1px solid var(--palette-action-hover)`,
              flexWrap: 'wrap',
              ml: '1rem',
              backgroundColor: 'var(--palette-background-paper)',
            }}
          >
            <StyledToggleButtonGroup
              size="small"
              value={alignment}
              exclusive
              onChange={handleAlignment}
              aria-label="text alignment"
            >
              <ToggleButton id="card" value="card" aria-label="centered">
                <SelectCard />
              </ToggleButton>
              <ToggleButton id="table" value="table" aria-label="left aligned">
                <SelectTable />
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Paper>
        </Box>
      </Box>
      {alignment && alignment === 'card' ? (
        <Box>
          {isLoading ? (
            <Card className={styles.loadingCard}>
              <Box className={styles.clusterListContent}>
                <Box p="1.2rem">
                  <Box display="flex" mb="0.5rem">
                    <ID className={styles.idIcon} />
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
                    borderColor: 'var(--palette-palette-divider)',
                    borderWidth: '0px 0px thin',
                  }}
                />
                <Box p="1.2rem">
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
                    <Box p="1.2rem" position="relative">
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
                        <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
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
                          '& .MuiMenu-list': {
                            width: '10rem',
                            p: '0',
                          },
                        }}
                      >
                        <MenuItem
                          className={styles.menuItem}
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
                            className={styles.menuItem}
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
                          className={styles.menuItem}
                          id={`delete-${schedulerSelectedRow?.id}`}
                          onClick={() => {
                            openHandleScheduler(schedulerSelectedRow);
                            setSchedulerAnchorElement(null);
                          }}
                        >
                          <ListItemIcon>
                            <DeleteIcon fontSize="small" sx={{ color: 'var(--palette-delete-button-color)' }} />
                          </ListItemIcon>
                          <Typography
                            variant="body2"
                            className={styles.menuText}
                            color="var(--palette-delete-button-color)"
                          >
                            Delete
                          </Typography>
                        </MenuItem>
                      </Menu>
                      <Box display="flex">
                        <ID className={styles.idIcon} />
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
                        <Status className={styles.statusIcon} />
                        <Chip
                          label={_.upperFirst(item?.state) || ''}
                          size="small"
                          variant="outlined"
                          id={`card-state-${item.id}`}
                          sx={{
                            borderRadius: '0.2rem',
                            backgroundColor:
                              item?.state === 'active'
                                ? 'var(--palette-grey-background-color)'
                                : 'var(--palette-background-inactive)',
                            color:
                              item?.state === 'active'
                                ? 'var(--palette-text-color)'
                                : 'var(--palette-table-title-text-color)',
                            border: 0,
                            fontFamily: 'mabry-bold',
                          }}
                        />
                      </Box>
                    </Box>
                    <Divider
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: 'var(--palette-palette-divider)',
                        borderWidth: '0px 0px thin',
                      }}
                    />
                    <Box p="1.2rem">
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: '1rem' }}>
                          <IP className={styles.statusIcon} />
                          <Typography
                            id={`card-ip-${item.id}`}
                            variant="caption"
                            sx={{ display: 'block', color: '#919EAB' }}
                          >
                            {item.ip}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                          <CardFeatures className={styles.statusIcon} />
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
                                    color: 'var(--palette-table-title-text-color)',
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
              <IcContent className={styles.nodataIcon} />
              <Typography id="no-scheduler" variant="h6" className={styles.nodataText}>
                You don't have scheduler cluster.
              </Typography>
            </Card>
          )}
        </Box>
      ) : (
        <Card>
          <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="scheduler-table">
            <TableHead sx={{ backgroundColor: 'var(--palette-table-title-color)' }}>
              <TableRow>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    ID
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Hostname
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    IP
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Port
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Features
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
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
                              color="inherit"
                              component={Link}
                              to={`/clusters/${params.id}/schedulers/${item?.id}`}
                              underline="hover"
                              sx={{ color: 'var(--palette-description-color)' }}
                            >
                              {item?.host_name}
                              dragonfly-scheduler-1.scheduler.cluster-a.svc.cluster.local
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
                                  item?.state === 'active'
                                    ? 'var(--palette-description-color)'
                                    : 'var(--palette-dark-300Channel)',
                                color: item?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                                borderColor:
                                  item?.state === 'active'
                                    ? 'var(--palette-description-color)'
                                    : 'var(--palette-dark-300Channel)',
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
                                      background: 'var(--palette-dark-300Channel)',
                                      color: '#FFFFFF',
                                      m: '0 0.4rem',
                                      borderColor: 'var(--palette-dark-300Channel)',
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
                              <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
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
                                '& .MuiMenu-list': {
                                  width: '10rem',
                                  p: '0',
                                },
                              }}
                            >
                              <MenuItem
                                className={styles.menuItem}
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
                                  <DeleteIcon fontSize="small" sx={{ color: 'var(--palette-delete-button-color)' }} />
                                </ListItemIcon>
                                <Typography
                                  variant="body2"
                                  className={styles.menuText}
                                  color="var(--palette-delete-button-color)"
                                >
                                  Delete
                                </Typography>
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
        </Card>
      )}
      {schedulerTotalPages > 1 && (
        <Box id="pagination" display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
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
        <Box className={styles.deleteInactiveInstances}>
          <Box className={styles.deleteInactiveHeader}>
            <Delete className={styles.deleteIcon} />
            <Typography variant="h6" component="div" id="delete-inactive-instances-title" fontFamily="mabry-bold">
              Delete inactive instances
            </Typography>
          </Box>
          {!progressLoading && (
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
                              <Typography
                                color="var(--palette-table-title-text-color)"
                                component="div"
                                variant="subtitle2"
                              >
                                number of deleted schedulers
                              </Typography>
                            </Box>
                            <DeleteInactive className={styles.headerErrorIcon} />
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
                            <DeleteInactiveError className={styles.headerErrorIcon} />
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
                                <Failure className={styles.failureIcon} />
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
                  {!progressLoading && (
                    <Button
                      variant="contained"
                      id="cancel-button"
                      size="small"
                      onClick={handleReset}
                      className={styles.button}
                    >
                      Cancel
                    </Button>
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
                        <InactiveTotal className={styles.inactiveTotalIcon} />
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
                          <Typography variant="body2" className={styles.schedulerInactiveTable} component="div">
                            ID
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderHostname}>
                          <Typography variant="body2" className={styles.schedulerInactiveTable} component="div">
                            Hostname
                          </Typography>
                        </Box>
                        <Box className={styles.schedulerInactiveHeaderIP}>
                          <Typography variant="body2" className={styles.schedulerInactiveTable} component="div">
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
                      <DeleteWarning className={styles.deleteWarning} />
                      <Box>
                        <Typography
                          variant="body1"
                          fontFamily="mabry-bold"
                          component="span"
                          sx={{ color: 'var(--palette-delete-button-color)' }}
                        >
                          WARNING:&nbsp;
                        </Typography>
                        <Typography
                          variant="body1"
                          component="span"
                          sx={{ color: 'var(--palette-delete-button-color)' }}
                        >
                          This action CANNOT be undone.
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" component="div">
                      Inactive schedulers and will be permanently delete.
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
                        backgroundColor: activeStep === 0 ? '' : 'var(--palette-button-color)',
                        color: 'var(--palette-button-text-color)',
                        ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
                      },
                    }}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {activeStep === steps.length - 1 ? (
                    <Button
                      endIcon={<DeleteIcon />}
                      size="small"
                      variant="contained"
                      type="submit"
                      id="save-delete"
                      className={styles.deleteButton}
                    >
                      Delete
                    </Button>
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
                              : 'var(--palette-button-color)',
                          color: 'var(--palette-button-text-color)',
                          ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
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
            <Delete className={styles.deleteClusterIcon} />
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
        <Box className={styles.featuresHeader}>
          <Box className={styles.featuresHeaderTitle}>
            <Features className={styles.featuresHeaderIcon} />
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
                  <Schedule className={styles.featuresIcon} />
                </Box>
              </Box>
              <Box>
                <Typography component="div" variant="body2" fontFamily="mabry-bold">
                  Schedule
                </Typography>
                <Typography component="div" variant="caption" color="var(--palette-text-palette-text-secondary)">
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
                  <Preheat className={styles.featuresIcon} />
                </Box>
              </Box>
              <Box>
                <Typography component="div" variant="body2" fontFamily="mabry-bold">
                  Preheat
                </Typography>
                <Typography component="div" variant="caption" color="var(--palette-text-palette-text-secondary)">
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
          <Box className={styles.featuresButtonWrapper}>
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
    </Box>
  );
}
