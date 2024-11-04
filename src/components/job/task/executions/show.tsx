import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteTaskResponse, getTaskJob } from '../../../../lib/api';
import {
  Typography,
  Box,
  IconButton,
  Paper,
  Button,
  Chip,
  Table,
  Skeleton,
  Tooltip,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  Divider,
  Drawer,
  createTheme,
  ThemeProvider,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Snackbar,
  Alert,
  tooltipClasses,
  styled,
  TooltipProps,
  Pagination,
} from '@mui/material';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import styles from './show.module.css';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getBJTDatetime, getDatetime, getPaginatedList, useQuery } from '../../../../lib/utils';
import { is } from 'cypress/types/bluebird';
import _ from 'lodash';
import { DEFAULT_SCHEDULER_TABLE_PAGE_SIZE } from '../../../../lib/constants';

export default function ShowTask() {
  const [deleteTask, setDeleteTask] = useState<deleteTaskResponse>();
  const [shouldPoll, setShouldPoll] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorLog, setErrorLog] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [failure, setFailure] = useState({});
  const [errorLogText, setErrorLogText] = useState('');
  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

  const params = useParams();

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1C293A',
      },
    },
    typography: {
      fontFamily: 'mabry-light,sans-serif',
    },
  });

  const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: '40rem',
    },
  });

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      try {
        if (params.id) {
          const job = await getTaskJob(params.id);

          setDeleteTask(job);
          setIsLoading(false);

          if (job.type === 'delete_task') {
            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setDeleteTask(job);
            } else {
              setShouldPoll(true);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error);

          setErrorMessage(true);
          setErrorMessageText(error.message);
          setShouldPoll(false);
          setIsLoading(false);
        }
      }
    })();
  }, [params.id]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollPreheat = async () => {
          try {
            const job = await getTaskJob(params.id);
            setDeleteTask(job);

            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setShouldPoll(false);
              setIsLoading(false);
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
              setShouldPoll(false);
              setIsLoading(false);
            }
          }
        };

        pollPreheat();
      }, 3000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [shouldPoll, params.id]);

  useEffect(() => {
    const result =
      deleteTask?.result?.job_states?.map((item: any) => {
        return item.results ? item.results.map((resultItem: any) => resultItem) : [];
      }) ?? [];

    const jobStates = Array.isArray(result) ? result.flat(2) : [];

    const results = jobStates.map((item: any) => item?.failure_tasks ?? []);

    const failureTasks = results.flat(2).filter((item) => item?.failure_tasks !== null);

    const totalPage =
      (Array.isArray(failureTasks) && Math.ceil(failureTasks.length / DEFAULT_SCHEDULER_TABLE_PAGE_SIZE)) || 1;
    const currentPageData =
      Array.isArray(failureTasks) && getPaginatedList(failureTasks, page, DEFAULT_SCHEDULER_TABLE_PAGE_SIZE);

    setTotalPages(totalPage);

    setFailure(currentPageData);
  }, [deleteTask?.result?.job_states, page]);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorLog(false);
    setErrorMessage(false);
  };

  return (
    <ThemeProvider theme={theme}>
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
      <Drawer anchor="right" open={errorLog} onClose={handleClose}>
        <Box role="presentation" sx={{ width: '28rem', height: '100vh', backgroundColor: '#24292f' }}>
          <Typography variant="h6" fontFamily="mabry-bold" sx={{ p: '1rem', color: '#d0d7de' }}>
            Error log
          </Typography>
          <Divider sx={{ backgroundColor: '#6c6e6f' }} />
          <Box sx={{ p: '1rem' }}>
            <Accordion
              disableGutters
              elevation={0}
              square
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
                expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem', color: '#d0d7de' }} />}
                sx={{
                  backgroundColor: '#32383f',
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
                id="panel1d-header"
              >
                <Box display="flex">
                  <Box
                    component="img"
                    sx={{ width: '1.2rem', height: '1.2rem', mr: '0.4rem' }}
                    src="/icons/job/preheat/failure.svg"
                  />
                  <Typography variant="body2" fontFamily="mabry-bold" sx={{ color: '#d0d7de' }}>
                    Error log
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  padding: '1rem',
                  backgroundColor: '#24292f',
                }}
              >
                {/* {deleteTask?.result &&
                  deleteTask?.state !== 'PENDING' &&
                  deleteTask?.result.job_states.map((job: any) => (
                    <>
                      
                    </>
                  ))} */}
                <Typography
                  variant="body2"
                  component="div"
                  fontFamily="mabry-bold"
                  color="#d0d7de"
                  mb="1rem"
                  className={styles.errorLog}
                >
                  {errorLogText}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Drawer>
      {/* <Typography variant="h5" mb="1.5rem" fontFamily="mabry-bold">
        Executions
      </Typography> */}
      <Paper variant="outlined" sx={{ p: '1rem 2rem' }}>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/id.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              ID
            </Typography>
          </Box>
          <Typography variant="body1" className={styles.informationContent}>
            {isLoading ? <Skeleton data-testid="execution-isloading" sx={{ width: '2rem' }} /> : deleteTask?.id || 0}
          </Typography>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/status.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Status
            </Typography>
          </Box>
          {deleteTask?.result && deleteTask?.result.job_states ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '2rem',
                  borderRadius: '0.3rem',
                  p: '0.4rem 0.6rem',
                  pr: deleteTask.result.state === 'FAILURE' ? '0' : '',
                  backgroundColor:
                    deleteTask.result.state === 'SUCCESS'
                      ? '#228B22'
                      : deleteTask.result.state === 'FAILURE'
                      ? '#D42536'
                      : '#DBAB0A',
                }}
                id="status"
              >
                {deleteTask.result.state === 'SUCCESS' ? (
                  <></>
                ) : deleteTask.result.state === 'FAILURE' ? (
                  <></>
                ) : (
                  <Box
                    component="img"
                    id="pending-icon"
                    className={styles.statusIcon}
                    src="/icons/job/preheat/status-pending.svg"
                  />
                )}
                <Typography
                  variant="body2"
                  fontFamily="mabry-bold"
                  sx={{
                    color: '#FFF',
                  }}
                >
                  {deleteTask?.result?.state}
                </Typography>
                {deleteTask.result.state === 'FAILURE' ? (
                  <>
                    <Box
                      sx={{
                        ml: '0.4rem',
                        mr: '0.2rem',
                        backgroundColor: '#fff',
                        height: '1rem',
                        width: '0.08rem',
                      }}
                    />
                    <Tooltip title="View error log." placement="top">
                      <IconButton
                        sx={{
                          '&.MuiIconButton-root': {
                            borderRadius: '0.3rem',
                            backgroundColor: '#D42536',
                            borderColor: '#D42536',
                            height: '2rem',
                          },
                        }}
                        onClick={() => {
                          setErrorLog(true);
                        }}
                      >
                        <Box
                          id="error-log-icon"
                          component="img"
                          sx={{ width: '1.2rem', height: '1.2rem' }}
                          src="/icons/job/preheat/error-log.svg"
                        />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <></>
                )}
              </Box>
            </Box>
          ) : (
            <></>
          )}
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/task/task-id.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Task ID
            </Typography>
          </Box>
          <Typography variant="body1" className={styles.informationContent}>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '2rem' }} />
            ) : (
              deleteTask?.args?.task_id || '-'
            )}
          </Typography>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/url.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              URL
            </Typography>
          </Box>
          {isLoading ? (
            <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
          ) : (
            <CustomWidthTooltip title={deleteTask?.args?.url || '-'} placement="bottom">
              <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.URLContent}>
                {deleteTask?.args?.url || '-'}
              </Typography>
            </CustomWidthTooltip>
          )}
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/tag.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Tag
            </Typography>
          </Box>
          <Box className={styles.informationContent}>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
            ) : deleteTask?.args?.tag ? (
              <Chip
                label={deleteTask?.args?.tag}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: '0.3rem',
                  background: 'var(--button-color)',
                  color: '#FFFFFF',
                  mr: '0.4rem',
                  borderColor: 'var(--button-color)',
                  fontWeight: 'bold',
                }}
              />
            ) : (
              <Typography variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Box>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/task/type.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Application
            </Typography>
          </Box>
          <Box className={styles.informationContent} sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <Typography variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
              ) : (
                deleteTask?.args?.application || '-'
              )}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/id.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Scheduler Clusters ID
            </Typography>
          </Box>
          <Box className={styles.schedulerClustersID}>
            {deleteTask?.scheduler_clusters?.map((item, index) => {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', p: '0.4rem', mr: '1rem' }}>
                  <Box className={styles.schedulerClustersIDContent}>
                    <Typography key={index} variant="body2" component="div" fontFamily="mabry-bold">
                      {isLoading ? (
                        <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
                      ) : (
                        item.id || '-'
                      )}
                    </Typography>
                  </Box>
                </Box>
              );
            }) || '-'}
          </Box>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/created-at.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Created At
            </Typography>
          </Box>
          <Typography variant="body1" className={styles.informationContent}>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '2rem' }} />
            ) : deleteTask?.created_at ? (
              <Chip
                avatar={<MoreTimeIcon />}
                label={getBJTDatetime(deleteTask?.created_at || '0')}
                variant="outlined"
                size="small"
              />
            ) : (
              <Typography variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Typography>
        </Box>
      </Paper>
      {failure && Array.isArray(failure) && failure.length !== 0 ? (
        <Box id="failure-tasks">
          <Box m="2.5rem 0 1.5rem 0" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: '0.8rem',
                height: '0.8rem',
                backgroundColor: '#D42536',
                borderRadius: '0.2rem',
                mr: '0.6rem',
                mb: '0.1rem',
              }}
            />
            <Typography variant="h6" fontFamily="mabry-bold">
              Failure
            </Typography>
            {/* <Box
              sx={{
                ml: '0.6rem',
                border: '1px solid #d5d2d2',
                p: '0.2rem 0.3rem',
                borderRadius: '0.3rem',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Box component="img" sx={{ width: '0.8rem', height: '0.8rem' }} src="/icons/cluster/inactive-total.svg" />
              <Typography
                id="schedulerTotal"
                variant="caption"
                fontFamily="mabry-bold"
                component="div"
                pl="0.3rem"
                lineHeight="1rem"
              >
                {(Array.isArray(failure) && failure.length) || '0'} Total
              </Typography>
            </Box> */}
          </Box>
          <Paper variant="outlined">
            <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="scheduler-table">
              <TableHead sx={{ backgroundColor: 'var(--table-title-color)' }}>
                <TableRow>
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
                      Host Type
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" fontFamily="mabry-bold">
                      Description
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="failure-tasks-list">
                {isLoading ? (
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
                ) : (
                  <>
                    {failure &&
                      Array.isArray(failure) &&
                      failure.map((item: any) => {
                        return (
                          <TableRow key={item?.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center">
                              <Typography variant="body2" component="div" fontFamily="mabry-bold">
                                {item?.hostname}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box
                                  component="img"
                                  sx={{ width: '1.5rem', mr: '0.4rem' }}
                                  src="/icons/job/task/ip.svg"
                                />

                                <Typography variant="body2" component="div">
                                  {item?.ip}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={_.upperFirst(item?.host_type) || ''}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderRadius: '0%',
                                  backgroundColor:
                                    item?.host_type === 'super' ? 'var( --description-color)' : 'var(--button-color)',
                                  color: item?.host_type === 'super' ? '#FFFFFF' : '#FFFFFF',
                                  borderColor:
                                    item?.host_type === 'super' ? 'var( --description-color)' : 'var(--button-color)',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() => {
                                  setErrorLogText(item?.description || '-');
                                  setErrorLog(true);
                                }}
                              >
                                <Box
                                  id="error-log-icon"
                                  component="img"
                                  sx={{ width: '1.8rem', height: '1.8rem' }}
                                  src="/icons/job/task/error-log.svg"
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
          </Paper>
          {/* <Paper variant="outlined">
            {failure &&
              Array.isArray(failure) &&
              failure.map((item: any) => {
                return (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: '1rem' }}>
                      <Box sx={{ width: '60%', display: 'flex', alignItems: ' flex-start' }}>
                        <Box component="img" sx={{ width: '1.5rem', mr: '0.4rem' }} src="/icons/job/task/ip.svg" />
                        <Box>
                          <Typography variant="body2" component="div" fontFamily="mabry-bold" mb="0.4rem">
                            {item?.ip}
                          </Typography>
                          <Typography variant="body2" component="div">
                            {item?.hostname}
                          </Typography>
                        </Box>
                      </Box>
                      <Box width="30%">
                        <Chip
                          label={_.upperFirst(item?.host_type) || ''}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: '0%',
                            backgroundColor:
                              item?.host_type === 'super' ? 'var( --description-color)' : 'var(--button-color)',
                            color: item?.host_type === 'super' ? '#FFFFFF' : '#FFFFFF',
                            borderColor:
                              item?.host_type === 'super' ? 'var( --description-color)' : 'var(--button-color)',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Box width="10%" sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => {
                            setErrorLogText(item?.description || '-');
                            setErrorLog(true);
                          }}
                        >
                          <Box
                            id="error-log-icon"
                            component="img"
                            sx={{ width: '1.7rem', height: '1.7rem' }}
                            src="/icons/job/task/error-log.svg"
                          />
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider />
                  </>
                );
              })}
          </Paper> */}
          {totalPages > 1 ? (
            <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_event: any, newPage: number) => {
                  navigate(`/jobs/task/executions/${params.id}${newPage > 1 ? `?page=${newPage}` : ''}`);
                }}
                boundaryCount={1}
                color="primary"
                size="small"
                id="failure-tasks-pagination"
              />
            </Box>
          ) : (
            <></>
          )}
        </Box>
      ) : (
        <></>
      )}
    </ThemeProvider>
  );
}
