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
import HelpIcon from '@mui/icons-material/Help';
import { useContext, useEffect, useState } from 'react';
import { createGCJob, getConfigs, getConfigsResponse, getGC, getGCReaonse, updateConfig } from '../../../lib/api';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../lib/constants';
import styles from './index.module.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Card from '../../card';
import { formatDuring, formatTime, formatNano, getDatetime, getPaginatedList } from '../../../lib/utils';
import _ from 'lodash';
import { MyContext } from '../../menu';
import GC from '../../garbage-collection-animation';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import CloseIcon from '@mui/icons-material/Close';
import { CancelLoadingButton, SavelLoadingButton } from '../../loading-button';
import DeleteSuccessfullyAnimation from '../../deleted-successfully-animation';
import { ReactComponent as DeleteWarning } from '../../../assets/images/cluster/delete-warning.svg';
import { ReactComponent as GCIcon } from '../../../assets/images/gc/gc.svg';
import { ReactComponent as Update } from '../../../assets/images/gc/update.svg';
import { ReactComponent as TTL } from '../../../assets/images/gc/ttl.svg';
import { ReactComponent as History } from '../../../assets/images/gc/history.svg';
import { ReactComponent as Last } from '../../../assets/images/gc/last-completed.svg';
import { ReactComponent as ErrorLast } from '../../../assets/images/gc/error-last-completed.svg';
import { ReactComponent as GCHeader } from '../../../assets/images/gc/gc-header.svg';
import { ReactComponent as Edit } from '../../../assets/images/user/edit.svg';
import { ReactComponent as Executions } from '../../../assets/images/resource/task/executions.svg';
import { ReactComponent as Failure } from '../../../assets/images/job/preheat/failure.svg';
import { ReactComponent as DialogTTL } from '../../../assets/images/gc/dialog-ttl.svg';

export default function AuditGC() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState<getConfigsResponse[]>([]);
  const [auditLogTTL, setAudiLogTTL] = useState('');
  const [audit, setAudit] = useState(0);
  const [update, setUpdate] = useState(false);
  const [gcIsloading, setGcIsLoading] = useState(false);
  const [history, setHistory] = useState<getGCReaonse[]>([]);
  const [ttlError, setTTLError] = useState(false);
  const [gcTTL, setGCTTL] = useState(0);
  const [jobTTL, setJobTTL] = useState('');
  const [currentHistory, setCurrentHistory] = useState<getGCReaonse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPages] = useState(1);
  const [openGCAudit, setOpenGCAudit] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [gcError, setGCError] = useState(false);
  const [openEditTTL, setOpenEditTTL] = useState(false);
  const [ttlLoading, setTTLLoading] = useState(false);

  const [purgeds, setPurgeds] = useState(0);
  const { user } = useContext(MyContext);

  const userID = user?.id;
  const unit = ['Days', 'Hours', 'Minutes'];

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      try {
        const config = await getConfigs({ page: 1, per_page: MAX_PAGE_SIZE });

        setConfigs(config);
        const history = await getGC({ page: 1, per_page: MAX_PAGE_SIZE });

        const auditGC = history.filter((item) => item?.args?.type === 'audit');

        setHistory(auditGC);

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [update, gcIsloading]);

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
    const parseTTL = () => {
      if (!configs || configs.length === 0) return 1;

      const valueStr = configs[0].value;
      if (typeof valueStr !== 'string') return 1;

      const parsed = JSON.parse(valueStr);
      return parsed.audit?.ttl || 1;
    };

    const gcTTL = () => {
      if (!configs || configs.length === 0) return 1;

      const valueStr = configs[0].value;
      if (typeof valueStr !== 'string') return 1;

      const parsed = JSON.parse(valueStr);
      return parsed.job?.ttl || 1;
    };

    const ttl = formatTime(parseTTL());

    setJobTTL(formatDuring(parseTTL()));

    setGCTTL(gcTTL());
    setAudiLogTTL(ttl.suffix);
    setAudit(ttl.value);
  }, [configs]);

  const handleChangeTTL = async () => {
    setTTLLoading(true);

    const ttlValidate = /^(1000|[1-9]\d{2}|[1-9]\d|[1-9])$/;
    const maxTTLValidate = /^(30|[12]\d|[1-9])$/;

    let validate = false;

    if (auditLogTTL === 'Days') {
      validate = !maxTTLValidate.test(String(audit));
      setTTLError(!maxTTLValidate.test(String(audit)));
    } else {
      validate = !ttlValidate.test(String(audit));
      setTTLError(!ttlValidate.test(String(audit)));
    }

    try {
      const ttl = formatNano(Number(audit), auditLogTTL);

      if (!validate && configs?.[0]?.id) {
        await updateConfig(String(configs?.[0]?.id), { value: `{"audit":{"ttl":${ttl}},"job":{"ttl":${gcTTL}}}` });

        setTTLLoading(false);
        setUpdate(!update);
        setSuccessMessage(true);
        setOpenEditTTL(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        setTTLLoading(false);
        setErrorMessage(true);
        setErrorMessageText(error.message);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setGcIsLoading(true);

      const reauest = {
        type: 'gc',
        args: {
          type: 'audit',
        },
        user_id: userID,
      };
      const gc = await createGCJob(reauest);

      setClearSuccess(true);
      setPurgeds(gc?.result?.purged || 0);
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

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
    setClearSuccess(false);
    setOpenGCAudit(false);
    setOpenEditTTL(false);
    setOpenEditTTL(false);
    setGCError(false);
  };

  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
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
      <Dialog
        open={openEditTTL}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '32rem',
          },
          position: 'absolute',
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: '#D3D3D3',
                    border: '0.1rem solid #D3D3D3',
                    width: '2.8rem',
                    height: '2.8rem',
                    borderRadius: '0.3rem',
                    mb: '.8rem',
                  }}
                >
                  <DialogTTL className={styles.TTLICon} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: '1rem', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" fontFamily="mabry-bold" component="div" pr="0.3rem" pt="0.1rem">
                    Keep the records in this interval
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', pt: '1rem' }}>
                <TextField
                  id="audit-ttl-input"
                  name="audit"
                  size="small"
                  variant="outlined"
                  type="number"
                  color="success"
                  sx={{ mr: '1rem', width: '14rem' }}
                  value={audit}
                  onChange={(e) => {
                    setAudit(Number(e.target.value));
                  }}
                />
                <Select
                  size="small"
                  name="auditUnit"
                  color="success"
                  id="audit-unit"
                  sx={{ width: '14rem' }}
                  value={auditLogTTL}
                  onChange={(e) => {
                    setAudiLogTTL(e.target.value);
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
                <FormHelperText id="ttl-error" error>
                  {ttlError
                    ? auditLogTTL === 'Days'
                      ? 'Fill in the number, and the time value must be greater than 0 and less than 30 days.'
                      : 'Fill in the number, the length is 1-1000.'
                    : ''}
                </FormHelperText>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '2rem' }}>
            <CancelLoadingButton loading={ttlLoading} id="cancel-ttl" onClick={onclose} />
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
        open={openGCAudit}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '36rem',
          },
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
                    You have successfully recycled {purgeds} audit logs!
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
                      <Typography sx={{ color: '#d0d7de' }}>Audit log execution failed.</Typography>
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
                    Audit log will immediately execute GC.
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
          Audit
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
              setOpenEditTTL(true);
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
            disabled={Boolean(gcIsloading)}
            onClick={() => {
              setOpenGCAudit(true);
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
            <Typography component="div" id="audit-ttl" variant="subtitle1" className={styles.informationContent}>
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
      <Typography variant="body1" id="token-title" m="1.5rem 0" fontFamily="mabry-bold">
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
                    <Skeleton data-testid="isloading" width="2rem" />
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
                    <Skeleton data-testid="isloading" width="3.8rem" />
                  </Box>
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableCell id="no-history" colSpan={9} align="center" sx={{ border: 0 }}>
                You don't have GC history.
              </TableCell>
            ) : (
              Array.isArray(currentHistory) &&
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
                    <TableCell align="center" id={`trigger-${item?.id}`}>
                      <Chip
                        label={item?.task_id === 'audit' ? 'Auto' : 'Manual'}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '0.2rem',
                          background:
                            item?.task_id === 'audit'
                              ? 'var(--palette-dark-300Channel)'
                              : 'var(--palette-description-color) ',
                          color: '#FFFFFF',
                          borderColor:
                            item?.task_id === 'audit'
                              ? 'var(--palette-dark-300Channel)'
                              : 'var(--palette-description-color) ',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" id={`ttl-${item?.id}`}>
                      <Typography variant="body1" component="div">
                        {formatDuring(item?.args?.ttl || '')}
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
                            item?.state === 'SUCCESS' ? '#228B22' : item?.state === 'FAILURE' ? '#D42536' : '#DBAB0A',
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
              })
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
