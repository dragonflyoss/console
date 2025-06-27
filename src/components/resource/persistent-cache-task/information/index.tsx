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
  TextField,
  Typography,
  Tooltip as MuiTooltip,
  Link as RouterLink,
  Chip,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  ToggleButtonGroup,
  styled,
  toggleButtonGroupClasses,
  ToggleButton,
  Pagination,
  Tooltip,
} from '@mui/material';
import { fuzzySearchPersistentCacheTask, getPaginatedList, useQuery } from '../../../../lib/utils';
import { deletePersistentCacheTask, getPersistentCacheTasksResponse } from '../../../../lib/api';
import styles from './index.module.css';
import Card from '../../../card';
import SearchCircularProgress from '../../../circular-progress';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { ReactComponent as IcContent } from '../../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as Total } from '../../../../assets/images/cluster/peer/total.svg';
import { ReactComponent as HeaderTag } from '../../../../assets/images/resource/persistent-cache-task/header-tag.svg';
import { ReactComponent as HeaderApplication } from '../../../../assets/images/resource/persistent-cache-task/header-application.svg';
import { ReactComponent as SuccessTask } from '../../../../assets/images/resource/persistent-cache-task/success-task.svg';
import { ReactComponent as FailedTask } from '../../../../assets/images/resource/persistent-cache-task/failed-task.svg';
import { ReactComponent as TaskBgcolor } from '../../../../assets/images/resource/persistent-cache-task/task-bgc.svg';
import { ReactComponent as Delete } from '../../../../assets/images/cluster/delete.svg';
import { ReactComponent as DeleteWarning } from '../../../../assets/images/cluster/delete-warning.svg';
import { ReactComponent as SelectCard } from '../../../../assets/images/cluster/scheduler/card.svg';
import { ReactComponent as SelectTable } from '../../../../assets/images/cluster/scheduler/table.svg';
import _ from 'lodash';
import { DataContext } from '..';
import { CancelLoadingButton, DeleteLoadingButton } from '../../../loading-button';
import { DEFAULT_PAGE_SIZE } from '../../../../lib/constants';
import { filesize } from 'filesize';
import ms from 'ms';

interface InformationProps {
  persistentCacheTasks: getPersistentCacheTasksResponse[];
  isLoading: boolean;
  deleteTask: boolean;
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

export default function Information(props: InformationProps) {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [searchPersistentCacheTask, setSearchPersistentCacheTask] = useState('');
  const [persistentCacheTasksCount, setPersistentCacheTasksCount] = useState<getPersistentCacheTasksResponse[]>([]);
  const [allPersistentCacheTasks, setAllPersistentCacheTasks] = useState<getPersistentCacheTasksResponse[]>([]);
  const [searchIslodaing, setSearchIconISLodaing] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);
  const [tableAnchorElement, setTableAnchorElement] = useState(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [persistentCacheTaskPage, setPersistentCacheTaskPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [selectedRow, setSelectedRow] = useState<getPersistentCacheTasksResponse | null>(null);
  const [alignment, setAlignment] = useState('card');
  const [taskIsLoading, setTaskIsLoading] = useState(false);

  const { setDeleteTask } = useContext(DataContext);
  const { persistentCacheTasks, isLoading, deleteTask } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const query = useQuery();

  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';
  const persistentCacheTasksApplication = persistentCacheTasks.filter((item) => item.application !== '');
  const persistentCacheTasksTag = persistentCacheTasks.filter((item) => item.tag !== '');

  useEffect(() => {
    setPersistentCacheTaskPage(page);
    setPersistentCacheTasksCount(persistentCacheTasks);
  }, [page, persistentCacheTasks]);

  useEffect(() => {
    setTaskIsLoading(true);
    if (Array.isArray(persistentCacheTasksCount) && persistentCacheTasksCount.length > 0) {
      persistentCacheTasksCount.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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

      const totalPage = Math.ceil(
        persistentCacheTasksCount.length / (alignment === 'card' ? pageSize : DEFAULT_PAGE_SIZE),
      );
      const currentPageData = getPaginatedList(
        persistentCacheTasksCount,
        persistentCacheTaskPage,
        alignment === 'card' ? pageSize : DEFAULT_PAGE_SIZE,
      );

      if (currentPageData.length === 0 && persistentCacheTaskPage > 1) {
        const queryParts = [];
        if (search) {
          queryParts.push(`search=${search}`);
        }

        if (page > 1) {
          queryParts.push(`page=${persistentCacheTaskPage - 1}`);
        }

        const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

        navigate(`${location.pathname}${queryString}`);
      }

      setTotalPages(totalPage);
      setAllPersistentCacheTasks(currentPageData);
      setTaskIsLoading(true);
    } else if (persistentCacheTasksCount === null || persistentCacheTasksCount) {
      setTotalPages(1);
      setAllPersistentCacheTasks([]);
    }
  }, [
    persistentCacheTaskPage,
    pageSize,
    persistentCacheTasksCount,
    searchPersistentCacheTask,
    location.pathname,
    navigate,
    page,
    search,
    alignment,
  ]);

  const debounced = useMemo(
    () =>
      debounce(async (currentSearch) => {
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

  useEffect(() => {
    if (search) {
      setSearchPersistentCacheTask(search);
      debounced(search);
    }
  }, [search, debounced]);

  const handleDelete = async (event: any) => {
    try {
      event.preventDefault();
      const delet = event.currentTarget.elements.deletCache.value;
      if (delet === 'DELETE') {
        if (selectedRow?.id && params?.id) {
          await deletePersistentCacheTask(selectedRow?.id, { scheduler_cluster_id: params?.id });

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

  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    setAlignment(newAlignment);
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setAnchorElement(null);
    setOpenDelete(false);
    setErrorMessage(false);
    setTableAnchorElement(null);
    setSelectedRow(null);
    setSuccessMessage(false);
  };

  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert id="success-message" onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert id="error-message" onClose={handleClose} severity="error" sx={{ width: '100%' }}>
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
              <Typography variant="body2" color="var(--palette-table-title-text-color)">
                number of persistent cache tasks
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
                Application
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="application" variant="h5" p="0.7rem 0">
                  {persistentCacheTasksApplication.length}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of application
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
          </Box>
          <Box className={styles.navigation} />
          <HeaderApplication className={styles.navigationIcon} />
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Tag
              </Typography>
              {isLoading ? (
                <Box p="0.4rem 0">
                  <Skeleton height={40} data-testid="isloading" width="2rem" />
                </Box>
              ) : (
                <Typography id="tag" variant="h5" p="0.7rem 0">
                  {persistentCacheTasksTag?.length}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of tag
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            <HeaderTag className={styles.navigationIcon} />
          </Box>
        </Card>
      </Box>
      <Box sx={{ mb: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Autocomplete
          size="small"
          color="secondary"
          id="search-task"
          freeSolo
          sx={{ width: '22rem' }}
          inputValue={searchPersistentCacheTask}
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
        <Paper
          elevation={0}
          sx={(theme) => ({
            display: 'flex',
            border: `1px solid var(--palette-action-hover)`,
            flexWrap: 'wrap',
            ml: '1rem',
            backgroundColor: 'var(--palette-background-paper)',
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
              <SelectCard />
            </ToggleButton>
            <ToggleButton id="table" value="table" aria-label="left aligned">
              <SelectTable />
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Paper>
      </Box>
      {alignment === 'card' ? (
        <>
          {isLoading && taskIsLoading ? (
            <Card className={styles.loadingCard}>
              <Box position="relative">
                <TaskBgcolor className={styles.taskBackground} />
                <Box className={styles.taskWrapper}>
                  <Skeleton data-testid="isloading" variant="circular" width={30} height={30} />
                </Box>
                <Box className={styles.taskHeader} />
                <Box p="1rem" pt="2rem" display="flex" alignItems="center" flexDirection="column">
                  <Skeleton data-testid="isloading" sx={{ width: '3rem' }} />
                  <Typography variant="caption" sx={{ color: '#919EAB', display: 'flex', alignItems: 'center' }}>
                    Persistent Replica Count :
                    <Skeleton data-testid="isloading" sx={{ width: '1.5rem', ml: '0.5rem' }} />
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
              <Box p="1rem">
                <Box className={styles.cardContent}>
                  <Box className={styles.portContainer}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#919EAB' }}>
                        Tag
                      </Typography>
                    </Box>

                    <Skeleton data-testid="isloading" sx={{ width: '3rem' }} />
                  </Box>
                  <Box className={styles.portContainer}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#919EAB' }}>
                        Application
                      </Typography>
                    </Box>
                    <Skeleton data-testid="isloading" sx={{ width: '3rem' }} />
                  </Box>
                  <Box className={styles.portContainer}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#919EAB' }}>
                        Content length
                      </Typography>
                    </Box>
                    <Skeleton data-testid="isloading" sx={{ width: '3rem' }} />
                  </Box>
                </Box>
              </Box>
            </Card>
          ) : Array.isArray(allPersistentCacheTasks) && allPersistentCacheTasks.length > 0 ? (
            <Box id="card-list" className={styles.cardCantainer}>
              {Array.isArray(allPersistentCacheTasks) &&
                allPersistentCacheTasks.map((item: any, index) => (
                  <Card key={index} className={styles.card}>
                    <Box position="relative">
                      <IconButton
                        id={`operation-${index}`}
                        onClick={(event: any) => {
                          setAnchorElement(event.currentTarget);
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
                            borderRadius: 'var(--menu-border-radius)',
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
                                `/resource/persistent-cache-task/clusters/${location?.pathname.split('/')[4]}/${
                                  selectedRow?.id
                                }`,
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
                      <TaskBgcolor className={styles.taskBackground} />
                      <Box className={styles.taskWrapper}>
                        {item?.state === 'Succeeded' ? (
                          <SuccessTask id={`success-task-${index}`} className={styles.task} />
                        ) : (
                          <FailedTask id={`failed-task-${index}`} className={styles.task} />
                        )}
                      </Box>
                      <Box className={styles.taskHeader} />
                      <Box p="1rem" pt="2rem" display="flex" alignItems="center" flexDirection="column">
                        <MuiTooltip title={item.id || '-'} placement="top">
                          <RouterLink
                            component={Link}
                            to={`/resource/persistent-cache-task/clusters/${location?.pathname.split('/')[4]}/${
                              item?.id
                            }`}
                            underline="hover"
                          >
                            <Typography id={`card-id-${index}`} variant="subtitle1" className={styles.idText}>
                              {item.id}
                            </Typography>
                          </RouterLink>
                        </MuiTooltip>
                        <Typography variant="caption" sx={{ color: '#919EAB' }}>
                          Persistent Replica Count : {item?.persistent_replica_count}
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
                    <Box p="1rem">
                      <Box className={styles.cardContent}>
                        <Box className={styles.portContainer}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#919EAB' }}>
                              Tag
                            </Typography>
                          </Box>
                          <Tooltip title={item?.tag || '-'} placement="top">
                            <Typography id={`tag-${index}`} variant="caption" className={styles.tetailText}>
                              {item?.tag || '-'}
                            </Typography>
                          </Tooltip>
                        </Box>
                        <Box className={styles.portContainer}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#919EAB' }}>
                              Application
                            </Typography>
                          </Box>
                          <Tooltip title={item?.application || '-'} placement="top">
                            <Typography id={`application-${index}`} variant="caption" className={styles.tetailText}>
                              {item?.application || '-'}
                            </Typography>
                          </Tooltip>
                        </Box>
                        <Box className={styles.portContainer}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#919EAB' }}>
                              Content length
                            </Typography>
                          </Box>
                          <Tooltip
                            title={
                              (item?.content_length && filesize(item?.content_length, { standard: 'jedec' })) || '-'
                            }
                            placement="top"
                          >
                            <Typography id={`piece-length-${index}`} variant="caption" className={styles.tetailText}>
                              {item?.content_length && filesize(item?.content_length, { standard: 'jedec' })}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                ))}
            </Box>
          ) : (
            <Card className={styles.noData}>
              <IcContent className={styles.nodataIcon} />
              <Typography id="no-task" variant="h6" className={styles.nodataText}>
                This scheduler cluster has no persistent cache task.
              </Typography>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="seed-peer-table">
            <TableHead sx={{ backgroundColor: 'var(--palette-table-title-color)' }}>
              <TableRow>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    ID
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Persistent Replica Count
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    TTL
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Application
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Tag
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Piece Length
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
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
                      <Skeleton data-testid="isloading" width="3.5rem" height="2.6rem" />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton data-testid="isloading" width="2.5rem" height="2.5rem" />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : persistentCacheTasksCount.length === 0 ? (
                <TableRow>
                  <TableCell id="no-task-table" colSpan={9} align="center" sx={{ border: 0 }}>
                    This scheduler cluster has no persistent cache task.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {Array.isArray(allPersistentCacheTasks) &&
                    allPersistentCacheTasks.map((item: getPersistentCacheTasksResponse, index) => {
                      return (
                        <TableRow
                          key={index}
                          selected={selectedRow === item}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                          }}
                          className={styles.tableRow}
                        >
                          <TableCell id={`id-${item?.id}`} align="center">
                            <RouterLink
                              component={Link}
                              to={`/resource/persistent-cache-task/clusters/${location?.pathname.split('/')[4]}/${
                                item?.id
                              }`}
                              underline="hover"
                              color="var(--palette-description-color)"
                            >
                              {item?.id}
                            </RouterLink>
                          </TableCell>
                          <TableCell id={`persistent-replica-count-${item?.id}`} align="center">
                            {item?.persistent_replica_count}
                          </TableCell>
                          <TableCell id={`ttl-${item?.id}`} align="center">
                            {ms(item?.ttl, { long: true })}
                          </TableCell>
                          <TableCell id={`application-${item?.id}`} align="center">
                            {item?.application || '-'}
                          </TableCell>
                          <TableCell id={`tag-${item?.id}`} align="center">
                            {item?.tag || '-'}
                          </TableCell>
                          <TableCell id={`piece-length-${item?.id}`} align="center">
                            {item?.piece_length && `${Number(item?.piece_length) / 1024 / 1024} MiB`}
                          </TableCell>
                          <TableCell id={`state-${item?.id}`} align="center">
                            <Chip
                              label={(item?.state && (item?.state === 'Succeeded' ? 'SUCCESS' : 'FAILURE')) || ''}
                              size="small"
                              variant="outlined"
                              id={`card-state-${item.id}`}
                              sx={{
                                borderRadius: '0.2rem',
                                backgroundColor: item?.state === 'Succeeded' ? '#228B22' : '#D42536',
                                color: '#FFF',
                                border: 0,
                                fontSize: '0.8rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              id={`operation-${item?.id}`}
                              onClick={(event: any) => {
                                setSelectedRow(item);
                                setTableAnchorElement(event.currentTarget);
                              }}
                              size="small"
                              aria-haspopup="true"
                            >
                              <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
                            </IconButton>
                            <Menu
                              anchorEl={tableAnchorElement}
                              open={Boolean(tableAnchorElement)}
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
                                      `/resource/persistent-cache-task/clusters/${location?.pathname.split('/')[4]}/${
                                        selectedRow?.id
                                      }`,
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
      {totalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
          <Pagination
            id="task-pagination"
            count={totalPages}
            page={persistentCacheTaskPage}
            onChange={(_event: any, newPage: number) => {
              setPersistentCacheTaskPage(newPage);
              const queryParts = [];

              if (newPage > 1) {
                queryParts.push(`page=${newPage}`);
              }

              const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

              navigate(`/resource/persistent-cache-task/clusters/${params?.id}${queryString}`);
            }}
            color="primary"
            size="small"
          />
        </Box>
      ) : (
        <></>
      )}
      <Dialog
        open={openDelete}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        id="delete-task"
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
            <Typography variant="body1" component="div" id="help-delete-task">
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
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
