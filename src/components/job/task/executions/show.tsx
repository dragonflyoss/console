import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deleteTaskResponse, getTaskJob } from '../../../../lib/api';
import {
  Breadcrumbs,
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
  FormControlLabel,
  Divider,
  Drawer,
  createTheme,
  ThemeProvider,
  Link as RouterLink,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Snackbar,
  Alert,
  tooltipClasses,
  styled,
  TooltipProps,
} from '@mui/material';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import styles from './show.module.css';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getBJTDatetime, getDatetime } from '../../../../lib/utils';
import { is } from 'cypress/types/bluebird';
import _ from 'lodash';

export default function ShowTask() {
  const [deleteTask, setDeleteTask] = useState<deleteTaskResponse>();
  const [shouldPoll, setShouldPoll] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorLog, setErrorLog] = useState(false);

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
      }, 30000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [shouldPoll, params.id]);

  const result = deleteTask?.result?.job_states.map((item: any) => {
    return [item?.results];
  });

  const job = Array.isArray(result) && result.flat(2);

  const arr =
    Array.isArray(job) &&
    job.map((item) => {
      return [item.failure_tasks];
    });

  const failureTasks = Array.isArray(arr) && arr.flat(2).filter((item) => item !== null);

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
                {deleteTask?.result &&
                  deleteTask?.state !== 'PENDING' &&
                  deleteTask?.result.job_states.map((job: any) => (
                    <>
                      <Typography variant="body2" fontFamily="mabry-bold" color="#d0d7de" mb="1rem">
                        {job.error}
                      </Typography>
                    </>
                  ))}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Drawer>
      <Paper variant="outlined" sx={{ p: '1rem 2rem' }}>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/id.svg" />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              ID
            </Typography>
          </Box>
          <Typography variant="body1" className={styles.informationContent}>
            {isLoading ? <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} /> : deleteTask?.id || 0}
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
              <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} />
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
            <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
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
              <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
            ) : deleteTask?.args?.tag ? (
              <Chip
                label={deleteTask?.args?.tag}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: '0%',
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
                <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
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
                <>
                  {isLoading ? (
                    <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} />
                  ) : (
                    <Box className={styles.schedulerClustersIDWrapper}>
                      <Box className={styles.schedulerClustersIDContent}>
                        <Typography key={index} variant="body2" fontFamily="mabry-bold" color="var(--save-size-color)">
                          {item.id}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
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
              <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} />
            ) : (
              <Chip
                avatar={<MoreTimeIcon />}
                label={getBJTDatetime(deleteTask?.created_at || '0')}
                variant="outlined"
                size="small"
              />
            )}
          </Typography>
        </Box>
      </Paper>

      {Array.isArray(failureTasks) && failureTasks.length === 0 ? (
        <></>
      ) : (
        <Box>
          <Typography variant="subtitle1" fontFamily="mabry-bold" m="2rem 0 1rem 0">
            Failure tasks
          </Typography>
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
              <TableBody id="scheduler-table-body">
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
                    {Array.isArray(failureTasks) &&
                      failureTasks.map((item: any) => {
                        return (
                          <TableRow key={item?.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center">{item?.hostname}</TableCell>
                            <TableCell align="center">{item?.ip}</TableCell>
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
                            <TableCell align="center" width="50%">
                              <CustomWidthTooltip title={item?.description || '-'} placement="bottom">
                                <Typography variant="body2" component="div" className={styles.description}>
                                  {item?.description || '-'}
                                </Typography>
                              </CustomWidthTooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </ThemeProvider>
  );
}
