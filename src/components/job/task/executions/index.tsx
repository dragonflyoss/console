import Box from '@mui/material/Box';
import styles from './index.module.css';
import { getDeleteTaskJob, getTaskJobResponse } from '../../../../lib/api';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBJTDatetime, useQuery } from '../../../../lib/utils';
import { DEFAULT_PAGE_SIZE } from '../../../../lib/constants';
import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Link as RouterLink,
  Chip,
  Pagination,
  ThemeProvider,
  createTheme,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import Card from '../../../card';

export default function Executions() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [executionsPage, setExecutionsPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('ALL');
  const [shouldPoll, setShouldPoll] = useState(false);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [executions, setExecutions] = useState<getTaskJobResponse[]>([]);

  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        setExecutionsPage(page);

        const jobs = await getDeleteTaskJob({
          page: page,
          per_page: DEFAULT_PAGE_SIZE,
          state: status === 'ALL' ? undefined : status,
        });

        setExecutions(jobs.data);
        setTotalPages(jobs.total_page || 1);

        const states = jobs.data.filter(
          (obj) => obj.result.state !== 'SUCCESS' && obj.result.state !== 'FAILURE',
        ).length;

        states === 0 ? setShouldPoll(false) : setShouldPoll(true);

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [status, executionsPage, page]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollExecutions = async () => {
          try {
            const jobs = await getDeleteTaskJob({
              page: executionsPage,
              per_page: DEFAULT_PAGE_SIZE,
              state: status === 'ALL' ? undefined : status,
            });

            setExecutions(jobs.data);
            setTotalPages(jobs.total_page || 1);

            const states = jobs.data.filter(
              (obj) => obj.result.state !== 'SUCCESS' && obj.result.state !== 'FAILURE',
            ).length;

            states === 0 ? setShouldPoll(false) : setShouldPoll(true);
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
            }
          }
        };

        pollExecutions();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [status, shouldPoll, executionsPage]);

  const statusList = [
    { lable: 'Pending', name: 'PENDING' },
    { lable: 'All', name: 'ALL' },
    { lable: 'Success', name: 'SUCCESS' },
    { lable: 'Failure', name: 'FAILURE' },
  ];

  const changeStatus = (event: any) => {
    setStatus(event.target.value);
  };

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

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

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
      <Card>
        <Box className={styles.titleContainer}>
          <Typography variant="body1" fontFamily="mabry-bold">
            Workflow runs
          </Typography>
          <FormControl sx={{ width: '10rem' }} size="small">
            <InputLabel id="states-select">Status</InputLabel>
            <Select
              id="states-select"
              value={status}
              label="changeStatus"
              open={openStatusSelect}
              onClose={() => {
                setOpenStatusSelect(false);
              }}
              onOpen={() => {
                setOpenStatusSelect(true);
              }}
              onChange={changeStatus}
            >
              <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                Filter by status
              </Typography>
              <Divider />
              {statusList.map((item) => (
                <MenuItem key={item.name} value={item.name}>
                  {item.lable}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Divider />
        {isLoading ? (
          <Box>
            <Box className={styles.isLoadingWrapper}>
              <Box className={styles.statusContainer}>
                <Skeleton data-testid="isloading" variant="circular" width="1.4rem" height="1.4rem" />
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} ml="0.6rem">
                  <Skeleton data-testid="isloading" width="3rem" />
                  <Skeleton data-testid="isloading" width="6rem" />
                </Box>
              </Box>
              <Box className={styles.timeContainer}>
                <Skeleton data-testid="isloading" width="40%" />
              </Box>
              <Box className={styles.iconButton}>
                <Skeleton data-testid="isloading" variant="circular" width="2em" height="2em" />
              </Box>
            </Box>
          </Box>
        ) : executions && executions.length === 0 ? (
          <Box id="no-executions" className={styles.noData}>
            <Box component="img" className={styles.nodataIcon} src="/icons/cluster/scheduler/ic-content.svg" />
            <Typography variant="h6" className={styles.nodataText}>
              You don't have any executions.
            </Typography>
          </Box>
        ) : (
          <Box id="executions-list">
            {executions &&
              executions.map((item, index) => {
                return index !== executions.length - 1 ? (
                  <Box key={item.id} id={`list-${item.id}`}>
                    <Box sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
                      <Box className={styles.statusContainer}>
                        {item.result.state === 'SUCCESS' ? (
                          <Box
                            id={`SUCCESS-${item.id}`}
                            component="img"
                            sx={{ width: '1.3rem', height: '1.3rem' }}
                            src="/icons/job/preheat/success.svg"
                          />
                        ) : item.result.state === 'FAILURE' ? (
                          <Box
                            id={`FAILURE-${item.id}`}
                            component="img"
                            sx={{ width: '1.3rem', height: '1.3rem' }}
                            src="/icons/job/preheat/failure.svg"
                          />
                        ) : (
                          <Box
                            id={`PENDING-${item.id}`}
                            component="img"
                            sx={{ width: '1.3rem', height: '1.3rem' }}
                            src="/icons/job/preheat/pending.svg"
                          />
                        )}
                        <Box
                          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                          ml="0.6rem"
                        >
                          <Typography variant="body1" fontFamily="mabry-bold">
                            {item.id}
                          </Typography>
                          <Typography variant="body2">{item?.args?.task_id || '-'}</Typography>
                        </Box>
                      </Box>
                      <Box className={styles.timeContainer}>
                        <Chip
                          avatar={<MoreTimeIcon />}
                          label={getBJTDatetime(item.created_at) || '-'}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box className={styles.iconButton}>
                        <RouterLink
                          component={Link}
                          id={`execution-${item?.id}`}
                          to={`/jobs/task/executions/${item?.id}`}
                          underline="hover"
                          sx={{ color: 'var(--description-color)' }}
                        >
                          <Box
                            component="img"
                            sx={{ width: '2rem', height: '2rem' }}
                            src="/icons/job/preheat/detail.svg"
                          />
                        </RouterLink>
                      </Box>
                    </Box>
                    <Divider
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: 'var(--palette-divider)',
                        borderWidth: '0px 0px thin',
                      }}
                    />
                  </Box>
                ) : (
                  <Box key={item.id} id={`list-${item.id}`} className={styles.listWrapper}>
                    <Box className={styles.statusContainer}>
                      {item.result.state === 'SUCCESS' ? (
                        <Box
                          id={`SUCCESS-${item.id}`}
                          component="img"
                          sx={{ width: '1.3rem', height: '1.3rem' }}
                          src="/icons/job/preheat/success.svg"
                        />
                      ) : item.result.state === 'FAILURE' ? (
                        <Box
                          id={`FAILURE-${item.id}`}
                          component="img"
                          sx={{ width: '1.3rem', height: '1.3rem' }}
                          src="/icons/job/preheat/failure.svg"
                        />
                      ) : (
                        <Box
                          id={`PENDING-${item.id}`}
                          component="img"
                          sx={{ width: '1.3rem', height: '1.3rem' }}
                          src="/icons/job/preheat/pending.svg"
                        />
                      )}
                      <Box
                        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                        ml="0.6rem"
                      >
                        <Typography variant="body1" fontFamily="mabry-bold">
                          {item.id}
                        </Typography>
                        <Typography variant="body2">{item.args?.task_id || '-'}</Typography>
                      </Box>
                    </Box>
                    <Box className={styles.timeContainer}>
                      <Chip
                        avatar={<MoreTimeIcon />}
                        label={getBJTDatetime(item.created_at) || '-'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Box className={styles.iconButton}>
                      <RouterLink
                        component={Link}
                        id={`execution-${item?.id}`}
                        to={`/jobs/task/executions/${item?.id}`}
                        underline="hover"
                        sx={{ color: 'var(--description-color)' }}
                      >
                        <Box
                          component="img"
                          sx={{ width: '2rem', height: '2rem' }}
                          src="/icons/job/preheat/detail.svg"
                        />
                      </RouterLink>
                    </Box>
                  </Box>
                );
              })}
          </Box>
        )}
      </Card>
      {totalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={totalPages}
            page={executionsPage}
            onChange={(_event: any, newPage: number) => {
              setExecutionsPage(newPage);
              navigate(`/jobs/task/executions${newPage > 1 ? `?page=${newPage}` : ''}`);
            }}
            boundaryCount={1}
            color="primary"
            size="small"
            id="executions-pagination"
          />
        </Box>
      ) : (
        <></>
      )}
    </ThemeProvider>
  );
}
