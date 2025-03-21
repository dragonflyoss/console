import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTaskJobResponse, getTaskJob } from '../../../../lib/api';
import {
  Typography,
  Box,
  IconButton,
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
import { getBJTDatetime, getPaginatedList, useQuery } from '../../../../lib/utils';
import _ from 'lodash';
import { DEFAULT_SCHEDULER_TABLE_PAGE_SIZE } from '../../../../lib/constants';
import Card from '../../../card';
import { ReactComponent as PreheatID } from '../../../../assets/images/job/preheat/id.svg';
import { ReactComponent as Status } from '../../../../assets/images/job/preheat/status.svg';
import { ReactComponent as URL } from '../../../../assets/images/job/preheat/url.svg';
import { ReactComponent as Tag } from '../../../../assets/images/job/preheat/tag.svg';
import { ReactComponent as CreatedAt } from '../../../../assets/images/job/preheat/created-at.svg';
import { ReactComponent as Failure } from '../../../../assets/images/job/preheat/failure.svg';
import { ReactComponent as Pending } from '../../../../assets/images/job/preheat/pending.svg';
import { ReactComponent as ErrorLog } from '../../../../assets/images/job/preheat/error-log.svg';
import { ReactComponent as TaskID } from '../../../../assets/images/job/task/task-id.svg';
import { ReactComponent as Application } from '../../../../assets/images/job/task/type.svg';
import { ReactComponent as IP } from '../../../../assets/images/job/task/ip.svg';
import { ReactComponent as CheckLog } from '../../../../assets/images/job/task/error-log.svg';

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: '40rem',
  },
});

export default function ShowExecutions() {
  const [executions, setExecutions] = useState<getTaskJobResponse>();
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

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      try {
        if (params.id) {
          const job = await getTaskJob(params.id);

          setExecutions(job);
          setIsLoading(false);

          if (job.type === 'delete_task') {
            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setExecutions(job);
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
        const pollExecutions = async () => {
          try {
            const job = await getTaskJob(params.id);
            setExecutions(job);

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

        pollExecutions();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [shouldPoll, params.id]);

  useEffect(() => {
    const result =
      (Array.isArray(executions?.result?.job_states) &&
        executions?.result?.job_states?.map((item: any) => {
          return item.results ? item.results.map((resultItem: any) => resultItem) : [];
        })) ??
      [];

    const jobStates = Array.isArray(result) ? result.flat(2) : [];

    const results = jobStates.map((item: any) => item?.failure_tasks ?? []);

    const failureTasks = results.flat(2).filter((item) => item?.failure_tasks !== null);

    const totalPage =
      (Array.isArray(failureTasks) && Math.ceil(failureTasks.length / DEFAULT_SCHEDULER_TABLE_PAGE_SIZE)) || 1;
    const currentPageData =
      Array.isArray(failureTasks) && getPaginatedList(failureTasks, page, DEFAULT_SCHEDULER_TABLE_PAGE_SIZE);

    setTotalPages(totalPage);

    setFailure(currentPageData);
  }, [executions, page]);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorLog(false);
    setErrorMessage(false);
  };

  const jobStates =
    (Array.isArray(executions?.result?.job_states) &&
      executions?.result?.job_states.map((job: any) => {
        return job.error;
      })) ||
    [];

  const errorlog = Array.from(new Set(jobStates.filter((items: string) => items !== '')));

  return (
    <Box>
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
                <Box display="flex" alignItems="center">
                  <Failure id="error-log-icon" className={styles.statusIcon} />
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
      <Card className={styles.container}>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <PreheatID className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              ID
            </Typography>
          </Box>
          <Typography variant="body1" className={styles.informationContent}>
            {isLoading ? <Skeleton data-testid="execution-isloading" sx={{ width: '2rem' }} /> : executions?.id || 0}
          </Typography>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Status className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Status
            </Typography>
          </Box>
          {executions?.result && executions?.result?.job_states ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '2rem',
                  borderRadius: '0.3rem',
                  p: '0.4rem 0.6rem',
                  pr: executions?.result.state === 'FAILURE' ? '0' : '',
                  backgroundColor:
                    executions?.result.state === 'SUCCESS'
                      ? '#228B22'
                      : executions?.result.state === 'FAILURE'
                      ? '#D42536'
                      : '#DBAB0A',
                  color: 'var(var(--palette-button-text-color)',
                }}
                id="status"
              >
                {executions?.result?.state === 'SUCCESS' ? (
                  <></>
                ) : executions?.result?.state === 'FAILURE' ? (
                  <></>
                ) : (
                  <Pending id="pending-icon" className={styles.pendingIcon} />
                )}
                <Typography
                  variant="body2"
                  fontFamily="mabry-bold"
                  sx={{
                    color: '#FFF',
                  }}
                >
                  {executions?.result?.state}
                </Typography>
                {executions.result.state === 'FAILURE' ? (
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
                          setErrorLogText(errorlog.toString() || '');
                        }}
                      >
                        <ErrorLog id="error-log-icon" className={styles.errorIcon} />
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
            <TaskID className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Task ID
            </Typography>
          </Box>
          <Typography variant="body1" className={styles.informationContent}>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '2rem' }} />
            ) : (
              executions?.args?.task_id || '-'
            )}
          </Typography>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <URL className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              URL
            </Typography>
          </Box>
          {isLoading ? (
            <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
          ) : (
            <CustomWidthTooltip title={executions?.args?.url || '-'} placement="bottom">
              <Typography variant="body1" component="div" className={styles.urlContent}>
                {executions?.args?.url || '-'}
              </Typography>
            </CustomWidthTooltip>
          )}
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Tag className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Tag
            </Typography>
          </Box>
          <Box className={styles.informationContent}>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
            ) : executions?.args?.tag ? (
              <Chip
                label={executions?.args?.tag}
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
              <Typography variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Box>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Application className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Application
            </Typography>
          </Box>
          <Box className={styles.informationContent} sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <Typography variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
              ) : (
                executions?.args?.application || '-'
              )}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <PreheatID className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Scheduler Clusters ID
            </Typography>
          </Box>
          <Box className={styles.schedulerClustersID}>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
            ) : (
              executions?.scheduler_clusters?.map((item: any, index: number) => {
                return (
                  <Box className={styles.schedulerClustersIDContent}>
                    <Typography key={index} variant="body2" component="div" fontFamily="mabry-bold">
                      {item.id || '-'}
                    </Typography>
                  </Box>
                );
              }) || '-'
            )}
          </Box>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <CreatedAt className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Created At
            </Typography>
          </Box>
          <Typography variant="body1" className={styles.informationContent}>
            {isLoading ? (
              <Skeleton data-testid="execution-isloading" sx={{ width: '2rem' }} />
            ) : executions?.created_at ? (
              <Chip
                avatar={<MoreTimeIcon />}
                label={getBJTDatetime(executions?.created_at || '0')}
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
      </Card>
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
          </Box>
          <Card>
            <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="scheduler-table">
              <TableHead sx={{ backgroundColor: 'var(--palette-table-title-color)' }}>
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
                        <IP className={styles.informationTitleIcon} />
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
                          <TableRow
                            key={item?.id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                            }}
                            className={styles.tableRow}
                          >
                            <TableCell align="center">
                              <Typography variant="body2" component="div" fontFamily="mabry-bold">
                                {item?.hostname}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IP className={styles.IPIcon} />
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
                                  borderRadius: '0.2rem',
                                  backgroundColor:
                                    item?.host_type === 'super'
                                      ? 'var( --palette-description-color)'
                                      : 'var(--palette-button-color)',
                                  color: item?.host_type === 'super' ? '#FFFFFF' : '#FFFFFF',
                                  borderColor:
                                    item?.host_type === 'super'
                                      ? 'var( --palette-description-color)'
                                      : 'var(--palette-button-color)',
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
                                <CheckLog id="error-log-icon" className={styles.errorLogIcon} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </>
                )}
              </TableBody>
            </Table>
          </Card>
          {totalPages > 1 ? (
            <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
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
    </Box>
  );
}
