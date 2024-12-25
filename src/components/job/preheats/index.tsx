import {
  Button,
  Paper,
  Typography,
  Box,
  Pagination,
  ThemeProvider,
  createTheme,
  Chip,
  Link as RouterLink,
  Divider,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Snackbar,
  Alert,
  Skeleton,
  Breadcrumbs,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getJobs, JobsResponse } from '../../../lib/api';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants';
import { getBJTDatetime, useQuery } from '../../../lib/utils';
import styles from './index.module.css';
import Card from '../../card';

export default function Preheats() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [preheatPage, setPreheatPage] = useState(1);
  const [preheatTotalPages, setPreheatTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('ALL');
  const [shouldPoll, setShouldPoll] = useState(false);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [allPreheats, setAllPreheats] = useState<JobsResponse[]>([]);

  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

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

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        setPreheatPage(page);

        const jobs = await getJobs({
          page: preheatPage,
          per_page: DEFAULT_PAGE_SIZE,
          state: status === 'ALL' ? undefined : status,
        });

        setAllPreheats(jobs.data);
        setPreheatTotalPages(jobs.total_page || 1);

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
            const jobs = await getJobs({
              page: preheatPage,
              per_page: DEFAULT_PAGE_SIZE,
              state: status === 'ALL' ? undefined : status,
            });

            setAllPreheats(jobs.data);
            setPreheatTotalPages(jobs.total_page || 1);

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
    navigate(`/jobs/preheats`);
  };

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
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1rem' }}
      >
        <Typography color="text.primary">jobs</Typography>
        <Typography color="inherit">preheats</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2rem' }}>
        <Typography variant="h5">Preheats</Typography>
        <Button
          size="small"
          sx={{
            '&.MuiButton-root': {
              backgroundColor: 'var(--button-color)',
              color: '#fff',
            },
          }}
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            navigate('/jobs/preheats/new');
          }}
        >
          add preheat
        </Button>
      </Box>
      <Card>
        <Box
          sx={{
            p: '0.8rem',
            backgroundColor: 'var(--table-title-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
        ) : allPreheats.length === 0 ? (
          <Box className={styles.noData}>
            <Box component="img" className={styles.nodataIcon} src="/icons/cluster/scheduler/ic-content.svg" />
            <Typography variant="h6" className={styles.nodataText}>
              You don't have any preheat tasks.
            </Typography>
          </Box>
        ) : (
          <Box id="preheats-list">
            {Array.isArray(allPreheats) &&
              allPreheats.map((item, index) => {
                return index !== allPreheats.length - 1 ? (
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
                          <Typography variant="body2">{item.bio || '-'}</Typography>
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
                          id={`preheat-${item?.id}`}
                          to={`/jobs/preheats/${item?.id}`}
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
                        <Typography variant="body2">{item.bio || '-'}</Typography>
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
                        id={`preheat-${item?.id}`}
                        to={`/jobs/preheats/${item?.id}`}
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
      {preheatTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={preheatTotalPages}
            page={preheatPage}
            onChange={(_event: any, newPage: number) => {
              setPreheatPage(newPage);
              navigate(`/jobs/preheats${newPage > 1 ? `?page=${newPage}` : ''}`);
            }}
            boundaryCount={1}
            color="primary"
            size="small"
            id="preheat-pagination"
          />
        </Box>
      ) : (
        <></>
      )}
    </ThemeProvider>
  );
}
