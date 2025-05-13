import {
  Breadcrumbs,
  Typography,
  Box,
  Skeleton,
  Chip,
  Link as RouterLink,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Snackbar,
  Alert,
  Paper,
  TextField,
  Dialog,
  IconButton,
  DialogContent,
  Button,
  Pagination,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  deletePersistentCacheTask,
  getPersistentCacheTask,
  getPersistentCacheTasksResponse,
  persistentCacheTasksPeersResponse,
} from '../../../../lib/api';
import Card from '../../../card';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { ReactComponent as Tag } from '../../../../assets/images/resource/persistent-cache-task/detail-tag.svg';
import { ReactComponent as Application } from '../../../../assets/images/resource/persistent-cache-task/detail-application.svg';
import { ReactComponent as PersistentReplicaCount } from '../../../../assets/images/resource/persistent-cache-task/detail-persistent-replica-count.svg';
import { ReactComponent as PieceLength } from '../../../../assets/images/resource/persistent-cache-task/detail-piece-length.svg';
import { ReactComponent as ContentLength } from '../../../../assets/images/resource/persistent-cache-task/detail-content-length.svg';
import { ReactComponent as TTL } from '../../../../assets/images/resource/persistent-cache-task/ttl.svg';
import { ReactComponent as Delete } from '../../../../assets/images/cluster/delete.svg';
import { ReactComponent as DeleteWarning } from '../../../../assets/images/cluster/delete-warning.svg';
import { CancelLoadingButton, DeleteLoadingButton } from '../../../loading-button';
import { ReactComponent as Task } from '../../../../assets/images/resource/persistent-cache-task/task.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDuring, formatSize, getDatetime, getPaginatedList } from '../../../../lib/utils';
import styles from './show.module.css';
import _ from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import { DEFAULT_PERSISTENT_CACHE_TASK_PERRS_PAGE_SIZE } from '../../../../lib/constants';

export default function PersistentCachetask() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persistentCacheTask, setPersistentCacheTask] = useState<getPersistentCacheTasksResponse>();
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [peers, setPeers] = useState<any>([]);
  const [allPeers, setAllPerrs] = useState<persistentCacheTasksPeersResponse[] | null>(null);

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const clusterID = location?.pathname.split('/')[4];

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        if (clusterID && params?.id) {
          const persistentCacheTask = await getPersistentCacheTask(params?.id, { scheduler_cluster_id: clusterID });
          setPersistentCacheTask(persistentCacheTask);
          setAllPerrs(persistentCacheTask?.peers);

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
  }, [navigate, params?.id, location?.pathname, clusterID]);

  useEffect(() => {
    if (Array.isArray(allPeers) && allPeers.length > 0) {
      const currentPeers =
        Array.isArray(allPeers) &&
        allPeers.sort((a, b) => {
          if (a.persistent && !b.persistent) {
            return -1;
          } else if (!a.persistent && b.persistent) {
            return 1;
          } else {
            return 0;
          }
        });

      const totalPage =
        (Array.isArray(currentPeers) &&
          Math.ceil(currentPeers.length / DEFAULT_PERSISTENT_CACHE_TASK_PERRS_PAGE_SIZE)) ||
        1;

      const currentPageData =
        Array.isArray(currentPeers) &&
        getPaginatedList(currentPeers, page, DEFAULT_PERSISTENT_CACHE_TASK_PERRS_PAGE_SIZE);

      setTotalPages(totalPage);

      setPeers(currentPageData);
    } else {
      setTotalPages(1);
      setPeers([]);
    }
  }, [persistentCacheTask?.peers, page, allPeers]);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);

    setOpenDelete(false);
  };

  const handleDelete = async (event: any) => {
    try {
      event.preventDefault();
      const delet = event.currentTarget.elements.deleteTask.value;

      if (delet === 'DELETE') {
        if (persistentCacheTask?.id && clusterID) {
          await deletePersistentCacheTask(persistentCacheTask?.id, { scheduler_cluster_id: clusterID });

          setOpenDelete(false);
          setDeleteLoadingButton(false);
          navigate(`/resource/persistent-cache-task/clusters/${clusterID}`);
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

  return (
    <div>
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
      <Dialog
        id="open-dialog"
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
              id="delete-task-input"
              name="deleteTask"
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
              <CancelLoadingButton id="cancel-delete-task" loading={deleteLoadingButton} onClick={handleClose} />
              <DeleteLoadingButton
                loading={deleteLoadingButton}
                endIcon={<DeleteIcon />}
                id="save-delete-task"
                text="Delete"
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Typography variant="h5" mb="1rem">
        Persistent Cache Task
      </Typography>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1rem' }}
      >
        <Typography color="text.primary">Resource</Typography>
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/resource/persistent-cache-task`}>
          Persistent Cache Task
        </RouterLink>
        {params?.id ? (
          <RouterLink
            component={Link}
            underline="hover"
            color="text.primary"
            id={`scheduler-cluster-${location?.pathname.split('/')[4]}`}
            to={`/resource/persistent-cache-task/clusters/${location?.pathname.split('/')[4]}`}
          >
            scheduler-cluster-{location?.pathname.split('/')[4]}
          </RouterLink>
        ) : (
          ''
        )}
        {params?.id ? (
          <Typography color="inherit" id={`task-id-${params?.id}`}>
            {params?.id || '-'}
          </Typography>
        ) : (
          ''
        )}
      </Breadcrumbs>
      <Box display="flex" justifyContent="flex-end">
        <Button
          id="delete-task"
          size="small"
          sx={{
            background: 'var(--palette-button-color)',
            color: 'var(--palette-button-text-color)',
            ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
          }}
          variant="contained"
          onClick={() => {
            setOpenDelete(true);
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
          Delete
        </Button>
      </Box>
      <Card className={styles.container}>
        <Box p="1.5rem" display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.6rem' }}>
              <Paper
                variant="outlined"
                sx={{
                  backgroundColor: 'var(--palette-background-paper)',
                  boxShadow: 'var(--palette-card-box-shadow)',
                  borderRadius: '0.6rem',
                  transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 0,
                  color: 'var(--palette-color)',
                  backgroundImage: 'none',
                  overflow: 'hidden',
                  mr: '0.6rem',
                  p: '0.3rem',
                  display: 'inline-flex',
                }}
              >
                <Task className={styles.Icon} />
              </Paper>

              <Box>
                <Typography id="id" variant="subtitle1" className={styles.idContent}>
                  {isLoading ? (
                    <Skeleton data-testid="isloading" sx={{ width: '2rem' }} />
                  ) : (
                    persistentCacheTask?.id || 0
                  )}
                </Typography>
              </Box>
            </Box>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem', height: '2.5rem' }} />
            ) : persistentCacheTask?.created_at ? (
              <Chip
                avatar={<MoreTimeIcon />}
                label={persistentCacheTask?.created_at && getDatetime(persistentCacheTask?.created_at)}
                variant="outlined"
                size="small"
                id="crate-at"
              />
            ) : (
              <Box id="crate-at">-</Box>
            )}
          </Box>
          <Box className={styles.statusContent}>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '4rem' }} />
            ) : persistentCacheTask?.state ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '0.4rem',
                  p: '0.2rem 0.5rem',
                  backgroundColor: persistentCacheTask?.state === 'Succeeded' ? '#228B22' : '#D42536',
                  color: '#FFF',
                }}
                id="status"
              >
                <Typography variant="caption" fontFamily="mabry-bold">
                  {(persistentCacheTask?.state &&
                    (persistentCacheTask?.state === 'Succeeded' ? 'SUCCESS' : 'FAILURE')) ||
                    ''}
                </Typography>
              </Box>
            ) : (
              <Box id="status">-</Box>
            )}
          </Box>
        </Box>
        <Divider
          sx={{
            borderStyle: 'dashed',
            borderColor: 'var(--palette-palette-divider)',
            borderWidth: '0px 0px thin',
          }}
        />
        <Box className={styles.informationWrapper}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box className={styles.informationTitle}>
              <PersistentReplicaCount className={styles.informationTitleIcon} />
              <Typography variant="body2" component="div" className={styles.informationTitleText}>
                Persistent Replica Count :
              </Typography>
            </Box>
            <Typography
              component="div"
              id="persistent-replica-count"
              variant="body1"
              className={styles.informationContent}
            >
              {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : persistentCacheTask?.persistent_replica_count || '-'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box className={styles.informationTitle}>
              <TTL className={styles.informationTitleIcon} />
              <Typography variant="body2" component="div" className={styles.informationTitleText}>
                TTL :
              </Typography>
            </Box>
            <Typography component="div" id="ttl" variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
              ) : persistentCacheTask?.ttl ? (
                formatDuring(persistentCacheTask?.ttl || 0)
              ) : (
                '-'
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box className={styles.informationTitle}>
              <ContentLength className={styles.informationTitleIcon} />
              <Typography variant="body2" component="div" className={styles.informationTitleText}>
                Content Length :
              </Typography>
            </Box>
            <Typography component="div" id="content-length" variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton sx={{ width: '4rem' }} />
              ) : persistentCacheTask?.content_length ? (
                formatSize(String(persistentCacheTask?.content_length))
              ) : (
                '-'
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box className={styles.informationTitle}>
              <PieceLength className={styles.informationTitleIcon} />
              <Typography variant="body2" component="div" className={styles.informationTitleText}>
                Piece Length :
              </Typography>
            </Box>
            <Typography component="div" id="piece-length" variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton sx={{ width: '4rem' }} />
              ) : persistentCacheTask?.piece_length ? (
                `${Number(persistentCacheTask?.piece_length) / 1024 / 1024} MiB`
              ) : (
                '-'
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box className={styles.informationTitle}>
              <Application className={styles.informationTitleIcon} />
              <Typography variant="body2" component="div" className={styles.informationTitleText}>
                Application :
              </Typography>
            </Box>
            <Typography component="div" id="application" variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
              ) : (
                persistentCacheTask?.application || '-'
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box className={styles.informationTitle}>
              <Tag className={styles.informationTitleIcon} />
              <Typography variant="body2" component="div" className={styles.informationTitleText}>
                Tag :
              </Typography>
            </Box>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
            ) : persistentCacheTask?.tag ? (
              <Chip
                id="tag"
                label={persistentCacheTask?.tag}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: '0.3rem',
                  background: 'var(--palette-button-color)',
                  color: '#FFFFFF',
                  mr: '0.4rem',
                  borderColor: 'var(--palette-button-color)',
                  fontWeight: 'bold',
                }}
              />
            ) : (
              <Typography id="tag" variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Box>
        </Box>
        {peers.length > 0 && (
          <Box id="peers" p="1.5rem">
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette-palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <Typography variant="h6" fontFamily="mabry-bold" p="1rem 0">
              Peers
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                backgroundColor: 'var(--palette-background-paper)',
                zIndex: 0,
                color: 'var(--palette-color)',
                backgroundImage: 'none',
                overflow: 'hidden',
              }}
            >
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
                        Hostname
                      </Typography>
                    </TableCell>
                    <TableCell align="center" className={styles.tableHeader}>
                      <Typography variant="subtitle1" className={styles.tableHeaderText}>
                        OS
                      </Typography>
                    </TableCell>
                    <TableCell align="center" className={styles.tableHeader}>
                      <Typography variant="subtitle1" className={styles.tableHeaderText}>
                        Platform
                      </Typography>
                    </TableCell>
                    <TableCell align="center" className={styles.tableHeader}>
                      <Typography variant="subtitle1" className={styles.tableHeaderText}>
                        Persistent
                      </Typography>
                    </TableCell>
                    <TableCell align="center" className={styles.tableHeader}>
                      <Typography variant="subtitle1" className={styles.tableHeaderText}>
                        Type
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
                        Download port
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody id="seed-peer-table-body">
                  {Array.isArray(peers) &&
                    peers.map((item: persistentCacheTasksPeersResponse, index) => {
                      return (
                        <TableRow
                          key={index}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                          }}
                          className={styles.tableRow}
                        >
                          <TableCell id={`id-${index}`} align="center">
                            {item?.id}
                          </TableCell>
                          <TableCell id={`hostname-${index}`} align="center">
                            {item?.host?.hostname}
                          </TableCell>
                          <TableCell id={`os-${index}`} align="center">
                            {item?.host?.os}
                          </TableCell>
                          <TableCell id={`platform-${index}`} align="center">
                            {item?.host?.platform}
                          </TableCell>
                          <TableCell id={`persistent-${index}`} align="center">
                            <Chip
                              id="tag"
                              label={item?.persistent ? 'Yes' : 'No'}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: '0.3rem',
                                background: item?.persistent
                                  ? 'var(--palette-description-color)'
                                  : 'var(--palette-table-title-text-color)',
                                color: '#FFFFFF',
                                mr: '0.4rem',
                                border: 'none',
                                fontWeight: 'bold',
                              }}
                            />
                          </TableCell>
                          <TableCell id={`type-${index}`} align="center">
                            {_.upperFirst(item?.host?.type)}
                          </TableCell>
                          <TableCell id={`ip-${index}`} align="center">
                            {item?.host?.ip}
                          </TableCell>
                          <TableCell id={`port-${index}`} align="center">
                            {item?.host?.port}
                          </TableCell>
                          <TableCell id={`download-port-${index}`} align="center">
                            {item?.host?.download_port}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Paper>
            {totalPages > 1 ? (
              <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
                <Pagination
                  id="task-pagination"
                  count={totalPages}
                  page={page}
                  onChange={(_event: any, newPage: number) => {
                    setPage(newPage);
                  }}
                  color="primary"
                  size="small"
                />
              </Box>
            ) : (
              <></>
            )}
          </Box>
        )}
      </Card>
    </div>
  );
}
