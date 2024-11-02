import Box from '@mui/material/Box';
import styles from './index.module.css';
import { getDeleteTask, deleteTaskResponse } from '../../../../lib/api';
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
  Tooltip,
} from '@mui/material';
import MoreTimeIcon from '@mui/icons-material/MoreTime';

export default function LabTabs() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [preheatPage, setPreheatPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('ALL');
  const [shouldPoll, setShouldPoll] = useState(false);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [allDeleteTask, setAllDeleteTask] = useState<deleteTaskResponse[]>([]);

  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        setPreheatPage(page);

        const jobs = await getDeleteTask({
          page: preheatPage,
          per_page: DEFAULT_PAGE_SIZE,
          state: status === 'ALL' ? undefined : status,
        });

        setAllDeleteTask(jobs.data);
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
  }, [status, preheatPage, page]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollPreheat = async () => {
          try {
            const jobs = await getDeleteTask({
              page: preheatPage,
              per_page: DEFAULT_PAGE_SIZE,
              state: status === 'ALL' ? undefined : status,
            });

            setAllDeleteTask(jobs.data);
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

        pollPreheat();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [status, shouldPoll, preheatPage]);

  const statusList = [
    { lable: 'Pending', name: 'PENDING' },
    { lable: 'All', name: 'ALL' },
    { lable: 'Success', name: 'SUCCESS' },
    { lable: 'Failure', name: 'FAILURE' },
  ];

  const changeStatus = (event: any) => {
    setStatus(event.target.value);
    // navigate(`/jobs/preheats`);
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
      <Paper variant="outlined">
        <Box
          sx={{
            p: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f7f7f7',
          }}
        >
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
            <Box sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '60%' }}>
                <Skeleton data-testid="isloading" variant="circular" width="1.4rem" height="1.4rem" />
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} ml="0.6rem">
                  <Skeleton data-testid="isloading" width="3rem" />
                  <Skeleton data-testid="isloading" width="6rem" />
                </Box>
              </Box>
              <Box width="30%">
                <Skeleton data-testid="isloading" width="40%" />
              </Box>
              <Box width="10%" sx={{ display: 'flex', justifyContent: 'center' }}>
                <Skeleton data-testid="isloading" variant="circular" width="2em" height="2em" />
              </Box>
            </Box>
            <Divider />
          </Box>
        ) : allDeleteTask && allDeleteTask.length === 0 ? (
          <Box
            id="no-executions"
            sx={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            You don't have any executions.
          </Box>
        ) : (
          <Box id="executions-list">
            {allDeleteTask &&
              allDeleteTask.map((item, index) => {
                return index !== allDeleteTask.length - 1 ? (
                  <Box key={item.id} id={`list-${item.id}`}>
                    <Box sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '60%' }}>
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
                      <Box width="30%">
                        <Chip
                          avatar={<MoreTimeIcon />}
                          label={getBJTDatetime(item.created_at) || '-'}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box width="10%" sx={{ display: 'flex', justifyContent: 'center' }}>
                        <RouterLink
                          component={Link}
                          id={`executions-${item?.id}`}
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
                    <Divider />
                  </Box>
                ) : (
                  <Box key={item.id} id={`list-${item.id}`} sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '60%' }}>
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
                    <Box width="30%">
                      <Chip
                        avatar={<MoreTimeIcon />}
                        label={getBJTDatetime(item.created_at) || '-'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Box width="10%" sx={{ display: 'flex', justifyContent: 'center' }}>
                      <RouterLink
                        component={Link}
                        id={`executions-${item?.id}`}
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
      </Paper>
      {totalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={totalPages}
            page={preheatPage}
            onChange={(_event: any, newPage: number) => {
              setPreheatPage(newPage);
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
