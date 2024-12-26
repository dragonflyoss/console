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
  Menu,
  MenuItem,
  ListItemIcon,
  toggleButtonGroupClasses,
  ToggleButtonGroup,
  styled,
  ToggleButton,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSeedPeers, deleteSeedPeer, getSeedPeersResponse } from '../../../lib/api';
import DeleteIcon from '@mui/icons-material/Delete';
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
import SearchCircularProgress from '../../circular-progress';
import { CancelLoadingButton, DeleteLoadingButton } from '../../loading-button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { MyContext } from '../../clusters/show';
import DeleteSuccessfullyAnimation from '../../deleted-successfully-animation';
import Card from '../../card';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
  const [openDeleteSeedPeer, setOpenDeleteSeedPeer] = useState(false);
  const [seedPeerSelectedRow, setSeedPeerSelectedRow] = useState<getSeedPeersResponse | null>(null);
  const [seedPeerSelectedID, setSeedPeerSelectedID] = useState('');
  const [seedPeerPage, setSeedPeerPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [seedPeerTotalPages, setSeedPeerTotalPages] = useState<number>(1);
  const [searchSeedPeers, setSearchSeedPeer] = useState('');
  const [seedPeerCount, setSeedPeerCount] = useState<getSeedPeersResponse[]>([]);
  const [seedPeer, setSeedPeer] = useState<getSeedPeersResponse[]>([]);
  const [allseedPeers, setAllSeedPeers] = useState<getSeedPeersResponse[]>([]);
  const [allInactiveError, setAllInactiveError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteAllInactiveErrorMessage, setDeleteAllInactiveErrorMessage] = useState<string[]>([]);
  const [deleteInactiveSeedPeerSuccessful, setDeleteInactiveSeedPeerSuccessful] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressLoading, setProgressLoading] = useState(false);
  const [searchSeedPeerIconISLodaing, setSearchSeedPeerIconISLodaing] = useState(false);
  const [seedPeerAnchorElement, setSeedPeerAnchorElement] = useState(null);
  const [status, setStatus] = useState<string>('all');
  const [alignment, setAlignment] = useState('card');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const steps = ['Seed peers', 'Confirm delete'];
  const params = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';
  const statr = query.get('status') ? (query.get('status') as string) : 'all';
  const open = Boolean(anchorEl);

  const { cluster } = useContext(MyContext);

  const seedPeers = useCallback(async () => {
    if (cluster.seed_peer_cluster_id) {
      const seedPeer = await getSeedPeers({
        seed_peer_cluster_id: String(cluster.seed_peer_cluster_id),
        page: 1,
        per_page: MAX_PAGE_SIZE,
      });

      setSeedPeer(seedPeer);
      setSeedPeerCount(seedPeer);
    }
  }, [cluster.seed_peer_cluster_id]);

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        if (typeof params.id === 'string') {
          await seedPeers();

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
  }, [params.id, seedPeers]);

  useEffect(() => {
    setSeedPeerPage(page);
    setStatus(statr);
  }, [page, statr]);

  useEffect(() => {
    try {
      setIsLoading(true);

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

        const statusSeedPeer =
          (status !== 'all' && Array.isArray(seedPeer) && seedPeer.filter((item) => item.state === status)) || seedPeer;

        const totalPage = Math.ceil(statusSeedPeer.length / (alignment === 'card' ? pageSize : DEFAULT_PAGE_SIZE));
        const currentPageData = getPaginatedList(
          statusSeedPeer,
          seedPeerPage,
          alignment === 'card' ? pageSize : DEFAULT_PAGE_SIZE,
        );

        if (currentPageData?.length === 0 && seedPeerPage > 1) {
          const queryParts = [];
          if (search) {
            queryParts.push(`search=${search}`);
          }

          if (page > 1) {
            queryParts.push(`page=${seedPeerPage - 1}`);
          }

          if (status !== 'all') {
            queryParts.push(`status=${status}`);
          }
          const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

          navigate(`${location.pathname}${queryString}`);
        }

        setSeedPeerTotalPages(totalPage);
        setAllSeedPeers(currentPageData);
      } else {
        setSeedPeerTotalPages(1);
        setAllSeedPeers([]);
      }

      setIsLoading(false);
    } catch (error) {}
  }, [seedPeer, seedPeerPage, alignment, pageSize, page, status, location.pathname, navigate, search]);

  const numberOfActiveSeedPeers =
    Array.isArray(seedPeerCount) && seedPeerCount?.filter((item: any) => item?.state === 'active').length;

  const numberOfInactiveSeedPeers =
    Array.isArray(seedPeerCount) && seedPeerCount?.filter((item: any) => item?.state === 'inactive').length;

  const seedPeerInactive =
    Array.isArray(seedPeerCount) && seedPeerCount?.filter((item: any) => item?.state === 'inactive');

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
    setAnchorEl(null);
    setOpenDeleteSeedPeer(false);
    setSeedPeerSelectedRow(null);
    setSeedPeerAnchorElement(null);
    if (!progressLoading) {
      setOpenDeleteInactive(false);
      setDeleteAllInactiveErrorMessage([]);
      setDeleteInactiveSeedPeerSuccessful(0);
      setActiveStep(0);
    }
  };

  const openHandleSeedPeer = (row: any) => {
    setSeedPeerSelectedRow(row);
    setSeedPeerSelectedID(row.id);
    setOpenDeleteSeedPeer(true);
  };

  const handleDeleteSeedPeer = async () => {
    setDeleteLoadingButton(true);
    setIsLoading(true);

    try {
      await deleteSeedPeer(seedPeerSelectedID);

      setDeleteLoadingButton(false);
      setOpenDeleteSeedPeer(false);

      if (cluster.seed_peer_cluster_id !== 0) {
        await seedPeers();
        setIsLoading(false);

        setSuccessMessage(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
        setIsLoading(false);
      }
    }
  };

  const debouncedSeedPeer = useMemo(
    () =>
      debounce(async (currentSearch) => {
        if (currentSearch && seedPeerCount.length > 0) {
          const schedulers = fuzzySearchScheduler(currentSearch, seedPeerCount);

          setSeedPeer(schedulers);
          setSearchSeedPeerIconISLodaing(false);
        } else if (currentSearch === '' && seedPeerCount.length > 0) {
          setSeedPeer(seedPeerCount);
          setSearchSeedPeerIconISLodaing(false);
        }
      }, 500),
    [seedPeerCount],
  );

  const handleSearchSeedPeer = useCallback(
    (newSearch: any) => {
      setSearchSeedPeer(newSearch);
      setSearchSeedPeerIconISLodaing(true);
      debouncedSeedPeer(newSearch);

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
    [debouncedSeedPeer, location.pathname, navigate, statr],
  );

  useEffect(() => {
    if (search) {
      setSearchSeedPeer(search);
      debouncedSeedPeer(search);
    }
  }, [search, debouncedSeedPeer]);

  const handleConfirmDelete = async (event: any) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const deleteAllInactive = event.currentTarget.elements.deleteAllInactive.value;

    if (deleteAllInactive !== 'DELETE') {
      setAllInactiveError(true);
    } else if (deleteAllInactive === 'DELETE') {
      setProgressLoading(true);
      handleNext();

      const seedPeerID = Array.isArray(seedPeerInactive) && seedPeerInactive.map((item: any) => item.id);

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
                `Deletion of seed peer with ID ${ids[i]} failed!, error: ${error.message}.`,
              ]);
            }
            throw error;
          }
        }
      };

      const executeDelete = async (seedPeersIds: any) => {
        if (seedPeerID !== false) {
          const totalApiCalls = seedPeerID.length;

          const increment = 100 / totalApiCalls;
          const onDeleteSuccess = () => {
            setProgress((prevProgress) => prevProgress + increment);
          };

          try {
            await deleteSelectedSeedPeers(seedPeersIds, onDeleteSuccess);

            setProgressLoading(false);

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
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
            }
            try {
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

      executeDelete(seedPeerID);
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
    setDeleteInactiveSeedPeerSuccessful(0);
  };

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

    navigate(`/clusters/${params.id}/seed-peers${queryString}`);
    setSeedPeerPage(1);
    setAnchorEl(null);
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
        <Typography variant="h6" fontWeight="600">
          Seed Peers
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
                          <Paper variant="outlined" className={styles.headerContainer}>
                            <Box>
                              <Box className={styles.headerContent}>
                                <Typography fontFamily="mabry-bold" variant="subtitle2" component="div">
                                  Seed Peers
                                </Typography>
                              </Box>
                              <Typography component="div" variant="h5" fontFamily="mabry-bold">
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
                      <Box>
                        <Box sx={{ height: '7rem' }} />
                        <Box sx={{ position: 'absolute', top: '3rem', right: '13rem' }}>
                          <DeleteSuccessfullyAnimation />
                        </Box>
                        <Alert variant="outlined" severity="success">
                          You have successfully deleted {deleteInactiveSeedPeerSuccessful || '0'} inactive seed peers!
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
                      <hr className={styles.divider} />
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
                      <hr className={styles.divider} />
                      {Array.isArray(seedPeerInactive) && seedPeerInactive.length !== 0 ? (
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
                          {Array.isArray(seedPeerInactive) &&
                            seedPeerInactive.map((item, index) => {
                              return index !== seedPeerInactive.length - 1 ? (
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
                          You don't have any inactive seed peer.
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
                      disabled={Array.isArray(seedPeerInactive) && seedPeerInactive.length === 0}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                      id="next-button"
                      onClick={handleNext}
                      sx={{
                        '&.MuiButton-root': {
                          backgroundColor:
                            Array.isArray(seedPeerInactive) && seedPeerInactive.length === 0
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
      <Box sx={{ display: 'flex', mb: '2rem' }}>
        <Card className={styles.seedPeerHeader}>
          <Box sx={{ display: 'flex', width: '70%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight="600" color="#637381">
                Total
              </Typography>
              <Box>
                {isLoading ? (
                  <Box p="0.4rem 0">
                    <Skeleton height={40} data-testid="isloading" width="2rem" />
                  </Box>
                ) : (
                  <Typography id="total" variant="h5" fontWeight="600" p="0.5rem 0">
                    {seedPeerCount?.length || 0}
                  </Typography>
                )}

                <Typography variant="body2" color="var(--table-title-text-color)">
                  number of seed peers
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={styles.navigation} />
          <Box component="img" className={styles.navigationIcon} src="/icons/peer/total.svg" />
        </Card>
        <Card className={styles.activeHeader}>
          <Box sx={{ display: 'flex', width: '70%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight="600" color="#637381">
                Active
              </Typography>
              <Box>
                {isLoading ? (
                  <Box p="0.4rem 0">
                    <Skeleton height={40} data-testid="isloading" width="2rem" />
                  </Box>
                ) : (
                  <Typography id="active" variant="h5" fontWeight="600" p="0.5rem 0">
                    {numberOfActiveSeedPeers}
                  </Typography>
                )}
                <Typography variant="body2" color="var(--table-title-text-color)">
                  number of active seed peers
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={styles.navigation} />
          <Box component="img" className={styles.navigationIcon} src="/icons/cluster/scheduler/active.svg" />
        </Card>
        <Card className={styles.activeHeader}>
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="600" color="#637381">
                Inactive
              </Typography>
              <Box>
                {isLoading ? (
                  <Box p="0.4rem 0">
                    <Skeleton height={40} data-testid="isloading" width="2rem" />
                  </Box>
                ) : (
                  <Typography id="inactive" variant="h5" fontWeight="600" p="0.5rem 0">
                    {numberOfInactiveSeedPeers}
                  </Typography>
                )}
                <Typography variant="body2" color="var(--table-title-text-color)">
                  number of inactive seed peer
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={styles.navigation} />
          <Box component="img" className={styles.navigationIcon} src="/icons/cluster/scheduler/inactive.svg" />
        </Card>
      </Box>
      <Box className={styles.searchContainer}>
        <Stack spacing={2} sx={{ width: '20rem' }}>
          <Autocomplete
            size="small"
            color="secondary"
            id="seed-peer-search"
            freeSolo
            inputValue={searchSeedPeers}
            onInputChange={(_event, newInputValue) => {
              handleSearchSeedPeer(newInputValue);
            }}
            options={seedPeerCount.map((option) => option.host_name)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: searchSeedPeerIconISLodaing ? (
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
            sx={(theme) => ({
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
            <Card className={styles.card}>
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
          ) : Array.isArray(allseedPeers) && allseedPeers.length > 0 ? (
            <Box id="seed-peer-card" className={styles.cardCantainer}>
              {Array.isArray(allseedPeers) &&
                allseedPeers.map((item: any) => (
                  <Card className={styles.card}>
                    <Box p="1.5rem 1.5rem 1rem 1.5rem" position="relative">
                      <IconButton
                        onClick={(event: any) => {
                          setSeedPeerAnchorElement(event.currentTarget);
                          setSeedPeerSelectedRow(item);
                          setSeedPeerSelectedID(item.id);
                        }}
                        size="small"
                        id={`operation-${item?.id}`}
                        aria-controls={Boolean(seedPeerAnchorElement) ? item?.host_name : undefined}
                        aria-haspopup="true"
                        aria-expanded={Boolean(seedPeerAnchorElement) ? 'true' : undefined}
                        className={styles.moreVertIcon}
                      >
                        <MoreVertIcon color="action" />
                      </IconButton>
                      <Menu
                        anchorEl={seedPeerAnchorElement}
                        id={seedPeerSelectedRow?.host_name}
                        open={Boolean(seedPeerAnchorElement)}
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
                              '0 0.075rem 0.2rem -0.0625rem #32325d40, 0 0.0625rem 0.0145rem -0.0625rem #0000004d',
                          },
                          '& .MuiMenu-list': {
                            p: 0,
                            width: '9rem',
                          },
                        }}
                      >
                        <Box className={styles.menu}>
                          <MenuItem
                            id={`view-${seedPeerSelectedRow?.host_name}`}
                            onClick={() => {
                              navigate(`/clusters/${params.id}/seed-peers/${seedPeerSelectedRow?.id}`);
                              setSeedPeerAnchorElement(null);
                            }}
                          >
                            <ListItemIcon>
                              <RemoveRedEyeIcon fontSize="small" className={styles.menuItemIcon} />
                            </ListItemIcon>
                            <Typography variant="body2" className={styles.menuText}>
                              View
                            </Typography>
                          </MenuItem>
                          <MenuItem
                            id={`delete-${seedPeerSelectedRow?.host_name}`}
                            onClick={() => {
                              openHandleSeedPeer(seedPeerSelectedRow);
                              setSeedPeerAnchorElement(null);
                            }}
                          >
                            <ListItemIcon>
                              <DeleteIcon fontSize="small" sx={{ color: 'var(--delete-button-color)' }} />
                            </ListItemIcon>
                            <Typography
                              variant="body1"
                              className={styles.menuText}
                              sx={{ color: 'var(--delete-button-color)' }}
                            >
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
                          to={`/clusters/${params.id}/seed-peers/${item?.id}`}
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
                      <Box className={styles.cardContainer}>
                        <Box className={styles.portContainer}>
                          <Box component="img" className={styles.portIcon} src="/icons/cluster/ip.svg" />
                          <Typography id={`card-ip-${item.id}`} variant="caption" sx={{ color: '#919EAB' }}>
                            {item.ip}
                          </Typography>
                        </Box>
                        <Box className={styles.portContainer}>
                          <Box component="img" className={styles.portIcon} src="/icons/cluster/seed-peer/type.svg" />
                          <Typography id={`card-type-${item.id}`} variant="caption" sx={{ color: '#919EAB' }}>
                            {_.upperFirst(item?.type) || ''}
                          </Typography>
                        </Box>
                        <Box className={styles.portContainer}>
                          <Box component="img" className={styles.portIcon} src="/icons/cluster/seed-peer/port.svg" />
                          <Typography id={`card-port-${item.id}`} variant="caption" sx={{ color: '#919EAB' }}>
                            {_.upperFirst(item?.port) || ''}
                          </Typography>
                        </Box>
                        <Box className={styles.portContainer}>
                          <Box
                            component="img"
                            className={styles.portIcon}
                            src="/icons/cluster/seed-peer/download-port.svg"
                          />
                          <Typography id={`card-download-port-${item.id}`} variant="caption" sx={{ color: '#919EAB' }}>
                            {_.upperFirst(item?.download_port) || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                ))}
            </Box>
          ) : (
            <Card className={styles.noData}>
              <Box component="img" className={styles.nodataIcon} src="/icons/cluster/scheduler/ic-content.svg" />
              <Typography id="no-seed-peer" variant="h6" className={styles.nodataText}>
                You don't have seed peer cluster.
              </Typography>
            </Card>
          )}
        </Box>
      ) : (
        <Card>
          <Box width="100%">
            <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="seed-peer-table">
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
                      Download Port
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Object Storage Port
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Type
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" className={styles.tableHeader}>
                      Operation
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="seed-peer-table-body">
                {isLoading ? (
                  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
                        <Skeleton data-testid="isloading" width="2rem" />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton data-testid="isloading" width="2rem" />
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
                        <Skeleton data-testid="isloading" width="2.5rem" height="2.5rem" />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : allseedPeers.length === 0 ? (
                  <TableRow>
                    <TableCell id="no-seed-peer-table" colSpan={9} align="center" sx={{ border: 0 }}>
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
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                            }}
                            className={styles.tableRow}
                          >
                            <TableCell id={`id-${item?.id}`} align="center">
                              {item?.id}
                            </TableCell>
                            <TableCell id={`hostname-${item?.host_name}`} align="center">
                              <RouterLink
                                component={Link}
                                to={`/clusters/${params.id}/seed-peers/${item?.id}`}
                                underline="hover"
                                sx={{ color: 'var(--description-color)' }}
                              >
                                {item?.host_name}
                              </RouterLink>
                            </TableCell>
                            <TableCell id={`ip-${item?.id}`} align="center">
                              {item?.ip}
                            </TableCell>
                            <TableCell id={`port-${item?.id}`} align="center">
                              {item?.port}
                            </TableCell>
                            <TableCell id={`download-port-${item?.id}`} align="center">
                              {item?.download_port}
                            </TableCell>
                            <TableCell id={`object-storage-port-${item?.id}`} align="center">
                              {item?.object_storage_port === 0 ? '-' : item?.object_storage_port}
                            </TableCell>
                            <TableCell id={`type-${item?.id}`} align="center">
                              {_.upperFirst(item?.type) || ''}
                            </TableCell>
                            <TableCell id={`state-${item?.id}`} align="center">
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
                            <TableCell align="center">
                              <IconButton
                                onClick={(event: any) => {
                                  setSeedPeerAnchorElement(event.currentTarget);
                                  setSeedPeerSelectedRow(item);
                                  setSeedPeerSelectedID(item.id);
                                }}
                                size="small"
                                id={`operation-${item?.id}`}
                                aria-controls={Boolean(seedPeerAnchorElement) ? item?.host_name : undefined}
                                aria-haspopup="true"
                                aria-expanded={Boolean(seedPeerAnchorElement) ? 'true' : undefined}
                                sx={{ position: 'relative' }}
                              >
                                <MoreVertIcon color="action" />
                              </IconButton>
                              <Menu
                                anchorEl={seedPeerAnchorElement}
                                id={seedPeerSelectedRow?.host_name}
                                open={Boolean(seedPeerAnchorElement)}
                                onClose={handleClose}
                                sx={{
                                  position: 'absolute',
                                  left: '-4.5rem',

                                  '& .MuiMenu-paper': {
                                    boxShadow:
                                      '0 0.075rem 0.2rem -0.0625rem #32325d40, 0 0.0625rem 0.0145rem -0.0625rem #0000004d',
                                  },
                                  '& .MuiMenu-list': {
                                    p: 0,
                                    width: '9rem',
                                  },
                                }}
                              >
                                <Box className={styles.menu}>
                                  <MenuItem
                                    id={`view-${seedPeerSelectedRow?.host_name}`}
                                    onClick={() => {
                                      navigate(`/clusters/${params.id}/seed-peers/${seedPeerSelectedRow?.id}`);
                                      setSeedPeerAnchorElement(null);
                                    }}
                                  >
                                    <ListItemIcon>
                                      <RemoveRedEyeIcon fontSize="small" className={styles.menuItemIcon} />
                                    </ListItemIcon>
                                    <Typography variant="body1" className={styles.menuText}>
                                      View
                                    </Typography>
                                  </MenuItem>
                                  <MenuItem
                                    id={`delete-${seedPeerSelectedRow?.host_name}`}
                                    onClick={() => {
                                      openHandleSeedPeer(seedPeerSelectedRow);
                                      setSeedPeerAnchorElement(null);
                                    }}
                                  >
                                    <ListItemIcon>
                                      <DeleteIcon fontSize="small" sx={{ color: 'var(--delete-button-color)' }} />
                                    </ListItemIcon>
                                    <Typography
                                      variant="body2"
                                      className={styles.menuText}
                                      sx={{ color: 'var(--delete-button-color)' }}
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
      <Dialog
        open={openDeleteSeedPeer}
        onClose={handleClose}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
            <CancelLoadingButton
              id="cancelDeleteSeedPeer"
              loading={deleteLoadingButton}
              onClick={() => {
                setOpenDeleteSeedPeer(false);
                setSeedPeerSelectedRow(null);
              }}
            />
            <DeleteLoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
              id="deleteSeedPeer"
              onClick={handleDeleteSeedPeer}
              text="Delete"
            />
          </Box>
        </DialogContent>
      </Dialog>
      {seedPeerTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={seedPeerTotalPages}
            page={seedPeerPage}
            onChange={(_event: any, newPage: number) => {
              setSeedPeerPage(newPage);

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
            id="seed-peer-pagination"
          />
        </Box>
      ) : (
        <></>
      )}
    </ThemeProvider>
  );
}
