import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormHelperText,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { useContext, useEffect, useState } from 'react';
import { createGCJob, getConfigs, getConfigsResponse, getGC, getGCReaonse, updateConfig } from '../../../lib/api';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../lib/constants';
import styles from './index.module.css';
import Card from '../../card';
import { getDatetime, getPaginatedList, parseTimeDuration } from '../../../lib/utils';
import _ from 'lodash';
import { MyContext } from '../../menu';
import GC from '../../garbage-collection-animation';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSuccessfullyAnimation from '../../deleted-successfully-animation';
import { ReactComponent as DeleteWarning } from '../../../assets/images/cluster/delete-warning.svg';
import { CancelLoadingButton, SavelLoadingButton } from '../../loading-button';
import { ReactComponent as GCHeader } from '../../../assets/images/gc/gc-header.svg';
import { ReactComponent as GCIcon } from '../../../assets/images/gc/gc.svg';
import { ReactComponent as Update } from '../../../assets/images/gc/update.svg';
import { ReactComponent as TTL } from '../../../assets/images/gc/ttl.svg';
import { ReactComponent as History } from '../../../assets/images/gc/history.svg';
import { ReactComponent as Last } from '../../../assets/images/gc/last-completed.svg';
import { ReactComponent as ErrorLast } from '../../../assets/images/gc/error-last-completed.svg';
import { ReactComponent as Edit } from '../../../assets/images/user/edit.svg';
import { ReactComponent as Executions } from '../../../assets/images/resource/task/executions.svg';
import { ReactComponent as Failure } from '../../../assets/images/job/preheat/failure.svg';
import { ReactComponent as DialogTTL } from '../../../assets/images/gc/dialog-ttl.svg';
import ms from 'ms';
import ErrorHandler from '../../error-handler';

export default function JobGC() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState<getConfigsResponse[]>([]);
  const [jobUnit, setJobUnit] = useState('days');
  const [job, setJob] = useState(0);
  const [update, setUpdate] = useState(false);
  const [gcIsloading, setGcIsLoading] = useState(false);
  const [history, setHistory] = useState<getGCReaonse[]>([]);
  const [ttlError, setTTLError] = useState(false);
  const [auditTTL, setAuditTTL] = useState(0);
  const [currentHistory, setCurrentHistory] = useState<getGCReaonse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPages] = useState(1);
  const [purgeds, setPurgeds] = useState(0);
  const [openGCJob, setOpenGCJob] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [openExecuteGC, setOpenExecuteGC] = useState(false);
  const [jobTTL, setJobTTL] = useState('');
  const [ttlLoading, setTTLLoading] = useState(false);
  const [gcError, setGCError] = useState(false);

  const { user } = useContext(MyContext);
  const userID = user?.id;

  const unit = ['days', 'hours', 'minutes', 'seconds'];
  const ttlValidate = /^(1000|[1-9]\d{2}|[1-9]\d|[1-9])$/;
  const maxTTLValidate = /^(30|[12]\d|[1-9])$/;

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      try {
        const config = await getConfigs({ page: 1, per_page: MAX_PAGE_SIZE });

        setConfigs(config);
        const history = await getGC({ page: 1, per_page: MAX_PAGE_SIZE });

        const jobGC = history.filter((item) => item?.args?.type === 'job');

        setHistory(jobGC);

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [update]);

  useEffect(() => {
    if (Array.isArray(history) && history.length >= 1) {
      const totalPage = Math.ceil(history.length / DEFAULT_PAGE_SIZE);
      const currentPageData = getPaginatedList(history, page, DEFAULT_PAGE_SIZE);

      if (currentPageData.length === 0 && page > 1) {
        setPage(page - 1);
      }

      setTotalPages(totalPage || 1);
      setCurrentHistory(currentPageData);
    } else {
      setTotalPages(1);
      setCurrentHistory([]);
    }
  }, [page, history]);

  useEffect(() => {
    try {
      const jobTTL = () => {
        if (!configs || configs.length === 0) return 0;

        const valueStr = configs[0].value;
        if (typeof valueStr !== 'string') return 0;

        const parsed = JSON.parse(valueStr);
        return parsed.job?.ttl || 0;
      };

      const auditTTL = () => {
        if (!configs || configs.length === 0) return 0;

        const valueStr = configs[0].value;
        if (typeof valueStr !== 'string') return 0;

        const parsed = JSON.parse(valueStr);
        return parsed.audit?.ttl || 0;
      };

      setAuditTTL(auditTTL());

      if (jobTTL() !== 0) {
        setJobTTL(ms(jobTTL() / 1000000, { long: true }));

        const result = parseTimeDuration(ms(jobTTL() / 1000000, { long: true }));

        setJobUnit(result?.unit || '');
        setJob(Number(result?.number || 0));
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
      }
    }
  }, [configs]);

  const onChangeTTL = (number: number, unit: string) => {
    let validate = false;
    if (unit === 'days') {
      validate = !maxTTLValidate.test(String(number));
      setTTLError(!maxTTLValidate.test(String(number)));
    } else {
      validate = !ttlValidate.test(String(number));
      setTTLError(!ttlValidate.test(String(number)));
    }
  };

  const handleSubmit = async () => {
    try {
      setGcIsLoading(true);

      const reauest = {
        type: 'gc',
        args: {
          type: 'job',
        },
        user_id: userID,
      };

      const gc = await createGCJob(reauest);

      setPurgeds(gc?.result?.purged || 0);
      setUpdate(!update);
      setClearSuccess(true);

      setGcIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setGcIsLoading(false);
        setGCError(true);
        setErrorMessage(true);
        setErrorMessageText(error.message);
      }
    }
  };

  const handleChangeTTL = async () => {
    setTTLLoading(true);

    let validate = false;

    if (jobUnit === 'days') {
      validate = !maxTTLValidate.test(String(job));
      setTTLError(!maxTTLValidate.test(String(job)));
    } else {
      validate = !ttlValidate.test(String(job));
      setTTLError(!ttlValidate.test(String(job)));
    }

    if (job !== 0 && jobUnit) {
      try {
        const formattedStr = `${job}${jobUnit}`;
        const ttl = ms(formattedStr as ms.StringValue) * 1000000;

        if (!validate && configs?.[0]?.id) {
          await updateConfig(String(configs?.[0]?.id), { value: `{"audit":{"ttl":${auditTTL}},"job":{"ttl":${ttl}}}` });

          setTTLLoading(false);
          setUpdate(!update);
          setSuccessMessage(true);
          setOpenGCJob(false);
        } else {
          setTTLLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setTTLLoading(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setClearSuccess(false);
    setOpenGCJob(false);
    setGcIsLoading(false);
    setOpenExecuteGC(false);
    setGCError(false);
  };

  const onClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={onClose} />
      <Dialog
        open={openGCJob}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '32rem',
          },
        }}
      >
        <Box className={styles.gcAuditHeaderWrapper}>
          <Box className={styles.gcAuditHeader}>
            <Update className={styles.dialogIcon} />
            <Typography variant="h6" component="div" id="delete-inactive-instances-title" fontFamily="mabry-bold">
              Update Garbage Collection
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
          <Box>
            <Box className={styles.ttlContainer}>
              <Box className={styles.ttlWrapper}>
                <DialogTTL className={styles.ttlICon} />
              </Box>
              <Box textAlign="center" mb="1rem">
                <Typography variant="subtitle1" fontFamily="mabry-bold" component="div" pr="0.3rem">
                  Keep records in
                </Typography>
              </Box>
            </Box>
            <Box className={styles.ttlInputWrapper}>
              <TextField
                id="job-ttl-input"
                name="job"
                size="small"
                variant="outlined"
                type="number"
                color="success"
                sx={{ mr: '1rem', width: '14rem' }}
                value={job}
                inputProps={{
                  min: 0,
                }}
                onChange={(e: any) => {
                  setJob(e.target.value);
                  onChangeTTL(Number(e.target.value), jobUnit);
                }}
              />
              <Select
                size="small"
                name="auditUnit"
                color="success"
                id="job-unit"
                sx={{ width: '14rem' }}
                value={jobUnit}
                onChange={(e) => {
                  setJobUnit(e.target.value);
                  onChangeTTL(Number(job), e.target.value);
                }}
              >
                {unit.map((item) => (
                  <MenuItem
                    key={item}
                    value={item}
                    sx={{
                      m: '0.3rem',
                      borderRadius: '4px',
                    }}
                  >
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <FormHelperText id="ttl-error" error sx={{ pt: '0.5rem' }}>
              {ttlError
                ? jobUnit === 'days'
                  ? 'Fill in the number, and the time value must be greater than 0 and less than 30 days.'
                  : 'Fill in the number, the length is 1-1000.'
                : ''}
            </FormHelperText>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '2rem' }}>
            <CancelLoadingButton loading={ttlLoading} id="cancel-ttl" onClick={handleClose} />
            <SavelLoadingButton
              loading={ttlLoading}
              endIcon={<CheckCircleIcon />}
              id="save-ttl"
              onClick={handleChangeTTL}
              text="save"
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openExecuteGC}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '36rem',
          },
          position: 'absolute',
        }}
      >
        <Box id="execute">
          <Box className={styles.gcAuditHeaderWrapper}>
            <Box className={styles.gcAuditHeader}>
              <GCHeader className={styles.dialogIcon} />
              <Typography variant="h6" component="div" id="delete-inactive-instances-title" fontFamily="mabry-bold">
                Execute GC
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              id="close-execut-icon"
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
            <Box>
              {gcIsloading ? (
                <Box id="execute-loading">
                  <GC />
                  <Typography variant="subtitle1" component="div" fontFamily="mabry-bold" textAlign="center" mb="1rem">
                    LOADING...
                  </Typography>
                </Box>
              ) : clearSuccess ? (
                <Box id="success-execute-gc">
                  <Box sx={{ height: '7rem' }} />
                  <Box sx={{ position: 'absolute', top: '3rem', right: '10rem' }}>
                    <DeleteSuccessfullyAnimation />
                  </Box>
                  <Alert variant="outlined" severity="success">
                    You have successfully recycled {purgeds} job!
                  </Alert>
                </Box>
              ) : gcError ? (
                <Paper id="execute-error" variant="outlined" className={styles.gcErrorWrapper}>
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
                      <Box className={styles.errorLogHeader}>
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
                      <Typography sx={{ color: '#d0d7de' }}>Job execution failed.</Typography>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              ) : (
                <Box>
                  <Box display="flex" alignItems="flex-start" pb="1rem">
                    <DeleteWarning className={styles.deleteWarning} />
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
                    Job will immediately execute GC.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '2rem' }}>
                    <CancelLoadingButton loading={gcIsloading} id="cancel-execute" onClick={handleClose} />
                    <SavelLoadingButton
                      loading={gcIsloading}
                      endIcon={<Executions className={styles.gcIcon} />}
                      id="save-execute"
                      text="execute"
                      onClick={handleSubmit}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Box>
      </Dialog>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '1.5rem' }}>
        <Typography variant="h6" id="token-title" fontFamily="mabry-bold">
          Job
        </Typography>
        <Box>
          <Button
            id="update"
            size="small"
            loadingPosition="end"
            sx={{
              background: 'var(--palette-button-color)',
              color: 'var(--palette-button-text-color)',
              ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
              mr: '1.5rem',
            }}
            variant="contained"
            onClick={() => {
              setOpenGCJob(true);
            }}
          >
            <Edit className={styles.gcIcon} />
            update
          </Button>
          <Button
            loading={gcIsloading}
            id="execute-gc"
            size="small"
            loadingPosition="end"
            sx={{
              background: 'var(--palette-button-color)',
              color: 'var(--palette-button-text-color)',
              ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
            }}
            variant="contained"
            onClick={() => {
              setOpenExecuteGC(true);
            }}
          >
            <GCIcon className={styles.gcIcon} />
            Execute GC
          </Button>
        </Box>
      </Box>
      <Box className={styles.card}>
        <Card className={styles.cardWrapper}>
          <Box>
            <Typography variant="subtitle2" component="div" className={styles.informationTitleText}>
              TTL
            </Typography>
            <Typography component="div" id="job-ttl" variant="subtitle1" className={styles.informationContent}>
              {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : jobTTL || '-'}
            </Typography>
          </Box>
          <Box className={styles.navigation} />
          <TTL className={styles.navigationIcon} />
        </Card>
        <Card className={styles.cardWrapper}>
          <Box>
            <Typography variant="subtitle2" component="div" className={styles.informationTitleText}>
              History
            </Typography>
            <Typography component="div" id="history" variant="subtitle1" className={styles.informationContent}>
              {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : history?.length || 0}
            </Typography>
          </Box>
          <Box className={styles.navigation} />
          <History className={styles.navigationIcon} />
        </Card>
        <Card className={styles.cardWrapper}>
          <Box>
            <Typography variant="subtitle2" component="div" className={styles.informationTitleText}>
              Last Completed
            </Typography>
            <Typography component="div" id="last-completed" variant="subtitle1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton sx={{ width: '4rem' }} />
              ) : history?.[0]?.created_at ? (
                getDatetime(history?.[0]?.created_at || '0')
              ) : (
                '-'
              )}
            </Typography>
          </Box>
          <Box className={history?.[0]?.state === 'FAILURE' ? styles.errorNavigation : styles.navigation} />
          {history?.[0]?.state === 'FAILURE' ? (
            <ErrorLast className={styles.errorNavigationIcon} />
          ) : (
            <Last className={styles.navigationIcon} />
          )}
        </Card>
      </Box>
      <Typography variant="h6" id="token-title" m="1.5rem 0" fontFamily="mabry-bold">
        History
      </Typography>
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
                  Executor
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="subtitle1" className={styles.tableHeaderText}>
                  Trigger
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="subtitle1" className={styles.tableHeaderText}>
                  TTL
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="subtitle1" className={styles.tableHeaderText}>
                  Purged
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="subtitle1" className={styles.tableHeaderText}>
                  Status
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="subtitle1" className={styles.tableHeaderText}>
                  Create At
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
                    <Skeleton data-testid="isloading" width="3.8rem" />
                  </Box>
                </TableCell>
              </TableRow>
            ) : currentHistory.length === 0 ? (
              <TableRow>
                <TableCell id="no-history" colSpan={9} align="center" sx={{ border: 0 }}>
                  You don't have GC history.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {Array.isArray(currentHistory) &&
                  currentHistory.map((item: any) => {
                    return (
                      <TableRow
                        key={item?.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                        }}
                        className={styles.tableRow}
                      >
                        <TableCell align="center" id={`id-${item?.id}`}>
                          {item?.id}
                        </TableCell>
                        <TableCell align="center" id={`id-${item?.id}`}>
                          <Typography variant="body1" fontFamily="mabry-bold">
                            {item?.user?.name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" id={`trigger-${item?.id}`}>
                          <Chip
                            label={item?.task_id === 'job' ? 'Auto' : 'Manual'}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: '0.2rem',
                              background:
                                item?.task_id === 'job'
                                  ? 'var(--palette-dark-300Channel)'
                                  : 'var(--palette-description-color) ',
                              color: '#FFFFFF',
                              borderColor:
                                item?.task_id === 'job'
                                  ? 'var(--palette-dark-300Channel)'
                                  : 'var(--palette-description-color) ',
                              fontWeight: 'bold',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" id={`ttl-${item?.id}`}>
                          <Typography variant="body1" component="div">
                            {ms(item?.args?.ttl / 1000000, { long: true }) || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" id={`purged-${item?.port}`}>
                          <Typography variant="body1" fontFamily="mabry-bold" component="div">
                            {item?.result?.purged}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" id={`state-${item?.id}`}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              borderRadius: '0.3rem',
                              p: '0.2rem 0.5rem',
                              backgroundColor:
                                item?.state === 'SUCCESS'
                                  ? '#228B22'
                                  : item?.state === 'FAILURE'
                                  ? '#D42536'
                                  : '#DBAB0A',
                              color: '#FFF',
                              fontFamily: 'mabry-bold',
                            }}
                            id="status"
                          >
                            {item?.state}
                          </Box>
                        </TableCell>
                        <TableCell align="center" id={`create-at-${item?.id}`}>
                          {getDatetime(item.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </>
            )}
          </TableBody>
        </Table>
      </Card>
      {totalPage > 1 && (
        <Box className={styles.pagination}>
          <Pagination
            id="pagination"
            count={totalPage}
            page={page}
            onChange={(_event: any, newPage: number) => {
              setPage(newPage);
            }}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
