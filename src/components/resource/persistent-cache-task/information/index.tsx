import {
  Autocomplete,
  Box,
  debounce,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Tooltip as MuiTooltip,
  Link as RouterLink,
  Chip,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
} from '@mui/material';
import { deletePersistentCacheTask, getPersistentCacheTasksResponse } from '../../../../lib/api';
import styles from './index.module.css';
import Card from '../../../card';
import SearchCircularProgress from '../../../circular-progress';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  formatSize,
  fuzzySearch,
  fuzzySearchPersistentCacheTask,
  fuzzySearchScheduler,
  getDatetime,
  getPaginatedList,
  useQuery,
} from '../../../../lib/utils';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

import SearchIcon from '@mui/icons-material/Search';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { ReactComponent as IcContent } from '../../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as ID } from '../../../../assets/images/cluster/id.svg';
import { ReactComponent as PieceLength } from '../../../../assets/images/resource/persistent-cache-task/piece-length.svg';
import { ReactComponent as ContentLength } from '../../../../assets/images/resource/persistent-cache-task/content-length.svg';
import { ReactComponent as TotalPieceLength } from '../../../../assets/images/resource/persistent-cache-task/total-piece-length.svg';
import { ReactComponent as CotentLength } from '../../../../assets/images/resource/persistent-cache-task/content-length.svg';
import { ReactComponent as Delete } from '../../../../assets/images/cluster/delete.svg';
import { ReactComponent as DeleteWarning } from '../../../../assets/images/cluster/delete-warning.svg';
import { ReactComponent as BarChart } from '../../../../assets/images/resource/persistent-cache-task/bar-chart.svg';
import { ReactComponent as PersistentReplicaCount } from '../../../../assets/images/resource/persistent-cache-task/tab-persistent-replica-count.svg';

import _ from 'lodash';
import { DataContext } from '../show';
import { CancelLoadingButton, DeleteLoadingButton } from '../../../loading-button';

interface InformationProps {
  persistentCacheTasks: getPersistentCacheTasksResponse[];
  isLoading: boolean;
  clusterID: any;
  deleteTask: boolean;
}

export default function Information(props: InformationProps) {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [searchPersistentCacheTask, setSearchPersistentCacheTask] = useState('');
  const [persistentCacheTasksCount, setPersistentCacheTasksCount] = useState<getPersistentCacheTasksResponse[]>([]);
  const [allPersistentCacheTasks, setAllPersistentCacheTasks] = useState<getPersistentCacheTasksResponse[]>([]);
  const [searchIslodaing, setSearchIconISLodaing] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);
  const [pageSize, setPageSize] = useState<number>(9);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const [persistentCacheTaskPage, setPersistentCacheTaskPage] = useState(1);
  const [schedulerTotalPages, setSchedulerTotalPages] = useState<number>(1);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [selectedRow, setSelectedRow] = useState<getPersistentCacheTasksResponse>();
  const { persistentCacheTasks, isLoading, clusterID, deleteTask } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const query = useQuery();

  const { setDeleteTask } = useContext(DataContext);

  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';

  const persistentCacheTasksSuccess = persistentCacheTasks.filter((item) => item.state === 'Succeeded');

  // const persistentCacheTasksApplication = new Set(persistentCacheTasks.map((item) => item.application)).size;

  const persistentCacheTasksApplication = persistentCacheTasks.filter((item) => item.application !== '');

  useEffect(() => {
    setPersistentCacheTasksCount(persistentCacheTasks);
  }, [persistentCacheTasks]);

  useEffect(() => {
    if (Array.isArray(persistentCacheTasks) && persistentCacheTasks.length > 0) {
      persistentCacheTasks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      //   persistentCacheTasks.sort((a, b) => {
      //     if (a.is_default && !b.is_default) {
      //       return -1;
      //     } else if (!a.is_default && b.is_default) {
      //       return 1;
      //     } else {
      //       return 0;
      //     }
      //   });

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

      const totalPage = Math.ceil(persistentCacheTasks.length / pageSize);

      const currentPageData = getPaginatedList(persistentCacheTasks, persistentCacheTaskPage, pageSize);

      setSchedulerTotalPages(totalPage);
      setAllPersistentCacheTasks(currentPageData);
    }
    //  else if (cluster === null || cluster) {
    //   setSchedulerTotalPages(1);
    //   setAllPersistentCacheTasks([]);
    // }
  }, [persistentCacheTasks, persistentCacheTaskPage, pageSize]);

  const debounced = useMemo(
    () =>
      debounce(async (currentSearch) => {
        console.log(currentSearch);

        if (currentSearch && persistentCacheTasks.length > 0) {
          const clusters = fuzzySearchPersistentCacheTask(currentSearch, persistentCacheTasks);

          setPersistentCacheTasksCount(clusters);
          setSearchIconISLodaing(false);
        } else if (currentSearch === '' && persistentCacheTasks.length > 0) {
          setPersistentCacheTasksCount(persistentCacheTasks);
          setSearchIconISLodaing(false);
        }
      }, 500),
    [persistentCacheTasks],
  );

  const handleInputChange = useCallback(
    (newSearch: any) => {
      setSearchPersistentCacheTask(newSearch);
      setSearchIconISLodaing(true);
      debounced(newSearch);

      const queryString = newSearch ? `?search=${newSearch}` : '';
      navigate(`${location.pathname}${queryString}`);
    },
    [debounced, location.pathname, navigate],
  );

  const handleDelete = async (event: any) => {
    try {
      event.preventDefault();
      const delet = event.currentTarget.elements.deletCache.value;
      if (delet === 'DELETE') {
        if (selectedRow?.id) {
          await deletePersistentCacheTask(selectedRow?.id, { scheduler_cluster_id: clusterID });
          console.log(deleteTask);

          setDeleteTask(!deleteTask);
          setSuccessMessage(true);
          setOpenDelete(false);
          setDeleteLoadingButton(false);
        }
      } else {
        setDeleteError(true);
        setDeleteLoadingButton(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        setDeleteLoadingButton(false);
        setDeleteError(true);
        setErrorMessage(true);
        setErrorMessageText(error.message);
      }
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setAnchorElement(null);
    setOpenDelete(false);
    setErrorMessage(false);
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
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessageText}
        </Alert>
      </Snackbar>
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
              <Typography id="total" variant="h5" p="0.7rem 0">
                {persistentCacheTasks?.length}
              </Typography>
            )}
            <Box className={styles.navigationCount}>
              {/* <span className={styles.navigationCountIcon}>
                <Count />
              </span> */}
              <Typography variant="body2" color="var(--palette-table-title-text-color)">
                number of persistent cache task
              </Typography>
            </Box>
          </Box>

          <BarChart className={styles.barChart} />
          {/* <Box className={styles.navigation} /> */}
          {/* <Total className={styles.navigationIcon} /> */}
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Success
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="active" variant="h5" p="0.7rem 0">
                  {persistentCacheTasksSuccess?.length}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                {/* <span className={styles.navigationCountIcon}>
                  <Count />
                </span> */}
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of successes
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            {/* <Active className={styles.navigationIcon} /> */}
          </Box>
          <BarChart className={styles.barChart} />
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Application
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="inactive" variant="h5" p="0.7rem 0">
                  {persistentCacheTasksApplication.length}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                {/* <span className={styles.navigationCountIcon}>
                  <Count />
                </span> */}
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of application
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
          </Box>
          <BarChart className={styles.barChart} />
        </Card>
      </Box>
      <Stack spacing={2} sx={{ width: '22rem', mb: '2rem' }}>
        <Autocomplete
          size="small"
          color="secondary"
          id="free-solo-demo"
          freeSolo
          inputValue={search}
          onInputChange={(_event, newInputValue) => {
            handleInputChange(newInputValue);
          }}
          options={persistentCacheTasks.map((option) => option?.id)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search"
              InputProps={{
                ...params.InputProps,
                startAdornment: searchIslodaing ? (
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
      {isLoading ? (
        <Card className={styles.loadingCard}>
          <Box className={styles.clusterListContent}>
            <Box p="1.2rem">
              <Box display="flex" mb="0.5rem">
                <ID className={styles.idIcon} />
                <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
              </Box>
              <Typography variant="h6" mb="0.5rem">
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
      ) : Array.isArray(persistentCacheTasksCount) && persistentCacheTasksCount.length > 0 ? (
        <Box id="scheduler-card" className={styles.cardCantainer}>
          {Array.isArray(persistentCacheTasksCount) &&
            persistentCacheTasksCount.map((item: any) => (
              <Card className={styles.card}>
                <Box p="1.2rem" position="relative">
                  <IconButton
                    id={`operation-${item?.id}`}
                    onClick={(event: any) => {
                      setAnchorElement(event.currentTarget);
                      //   setSchedulerSelectedRow(item);
                      //   setSchedulerSelectedID(item.id);

                      setSelectedRow(item);
                    }}
                    size="small"
                    aria-controls={Boolean(anchorElement) ? item?.host_name : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorElement) ? 'true' : undefined}
                    className={styles.moreVertIcon}
                  >
                    <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorElement}
                    // id={schedulerSelectedRow?.host_name}
                    open={Boolean(anchorElement)}
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
                        boxShadow: 'var(--custom-shadows-dropdown)',
                        borderRadius: '0.6rem',
                      },
                      '& .MuiMenu-list': {
                        width: '9rem',
                        p: '0',
                      },
                    }}
                  >
                    <Box className={styles.menu}>
                      <MenuItem
                        className={styles.menuItem}
                        id={`view-${selectedRow?.id}`}
                        onClick={() => {
                          navigate(
                            `/resource/persistent-cache-task/cluster/${location?.pathname.split('/')[4]}/${item?.id}`,
                          );

                          setAnchorElement(null);
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
                        className={styles.menuItem}
                        id={`delete-${selectedRow?.id}`}
                        onClick={() => {
                          //   openHandleScheduler(schedulerSelectedRow);

                          setAnchorElement(null);
                          setOpenDelete(true);
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
                    </Box>
                  </Menu>
                  {/* <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: '0.3rem',
                      p: '0.2rem 0.6rem',
                      backgroundColor:
                        item?.state === 'Succeeded'
                          ? 'var(--palette-grey-background-color)'
                          : 'var(--palette-background-inactive)',
                      color:
                        item?.state === 'Succeeded'
                          ? 'var(--palette-text-color)'
                          : 'var(--palette-table-title-text-color)',
                    }}
                    id="status"
                  >
                    <Typography variant="body2" fontFamily="mabry-bold">
                      {(item?.state && (item?.state === 'Succeeded' ? 'SUCCESS' : 'FAILURE')) || ''}
                    </Typography>
                  </Box> */}
                  <Chip
                    label={(item?.state && (item?.state === 'Succeeded' ? 'SUCCESS' : 'FAILURE')) || ''}
                    size="small"
                    variant="outlined"
                    id={`card-state-${item.id}`}
                    sx={{
                      borderRadius: '0.2rem',
                      backgroundColor:
                        item?.state === 'Succeeded'
                          ? 'var(--palette-grey-background-color)'
                          : 'var(--palette-background-inactive)',
                      color:
                        item?.state === 'Succeeded'
                          ? 'var(--palette-text-color)'
                          : 'var(--palette-table-title-text-color)',
                      border: 0,
                      fontFamily: 'mabry-bold',
                    }}
                  />
                  <MuiTooltip title={item.id || '-'} placement="top">
                    <RouterLink
                      component={Link}
                      to={`/resource/persistent-cache-task/cluster/${location?.pathname.split('/')[4]}/${item?.id}`}
                      underline="hover"
                    >
                      <Typography
                        id={`card-hostname-${item.id}`}
                        variant="subtitle1"
                        m="0.7rem 0"
                        className={styles.idText}
                      >
                        {item.id}
                      </Typography>
                    </RouterLink>
                  </MuiTooltip>
                  <Box display="flex" alignItems="flex-end">
                    <MoreTimeIcon fontSize="small" />
                    <Typography variant="body2" pl="0.4rem">
                      {getDatetime(item?.created_at)}
                    </Typography>
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
                  <Box className={styles.cardContent}>
                    <Box className={styles.portContainer}>
                      <TotalPieceLength className={styles.statusIcon} />
                      <Typography id={`total-piece-count-${item.id}`} variant="caption" sx={{ color: '#919EAB' }}>
                        {item?.total_piece_count}
                      </Typography>
                    </Box>
                    <Box className={styles.portContainer}>
                      <PersistentReplicaCount className={styles.statusIcon} />
                      <Typography
                        id={`persistent-replica-count-${item.id}`}
                        variant="caption"
                        sx={{ color: '#919EAB' }}
                      >
                        {item?.persistent_replica_count}
                      </Typography>
                    </Box>
                    <Box className={styles.portContainer}>
                      <PieceLength className={styles.statusIcon} />
                      <Typography id={`piece-length-${item.id}`} variant="caption" sx={{ color: '#919EAB' }}>
                        {item?.piece_length && `${Number(item?.piece_length) / 1024 / 1024} MiB`}
                      </Typography>
                    </Box>
                    <Box className={styles.portContainer}>
                      <ContentLength className={styles.statusIcon} />
                      <Typography id={`content-length-${item.id}`} variant="caption" sx={{ color: '#919EAB' }}>
                        {item?.content_length && formatSize(item?.content_length)}
                      </Typography>
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
            This scheduler cluster has no persistent cache task.
          </Typography>
        </Card>
      )}
      <Dialog
        open={openDelete}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '40rem',
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
            <Delete className={styles.deleteIcon} />
            <Typography variant="h6" component="div" fontFamily="mabry-bold">
              Delete
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            id="close-delete-icon"
            onClick={handleClose}
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
          <Box component={'form'} onSubmitCapture={handleDelete} noValidate sx={{ mt: 1 }}>
            <Box display="flex" alignItems="flex-start" pb="1rem">
              <DeleteWarning className={styles.deleteWarningIcon} />
              <Box>
                <Typography
                  variant="body1"
                  fontFamily="mabry-bold"
                  component="span"
                  sx={{ color: 'var(--palette-delete-button-color)' }}
                >
                  WARNING:&nbsp;
                </Typography>
                <Typography variant="body1" component="span" sx={{ color: 'var(--palette-delete-button-color)' }}>
                  This action CANNOT be undone.
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" component="div">
              Persistent cache task will be permanently deleted.
            </Typography>
            <TextField
              error={deleteError}
              sx={{ pt: '1rem', width: '14rem' }}
              id="deletCache"
              name="deletCache"
              color="success"
              size="small"
              placeholder={`Type 'DELETE' to proceed`}
              autoComplete="family-name"
              helperText={deleteError ? `Please enter "DELETE"` : ''}
              onChange={(event) => {
                if (event.target.value === 'DELETE') {
                  setDeleteError(false);
                } else {
                  setDeleteError(true);
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
              <CancelLoadingButton id="cancelDeleteCluster" loading={deleteLoadingButton} onClick={handleClose} />
              <DeleteLoadingButton
                loading={deleteLoadingButton}
                endIcon={<DeleteIcon />}
                id="deleteTask"
                text="Delete"
                // onClick={handleDelete}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
