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
import { useContext, useEffect, useState } from 'react';
import { getJobs } from '../../../lib/api';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../lib/constants';
import { getDatetime, getPaginatedList } from '../../../lib/utils';
import { MyContext } from '../../menu/index';

export default function Preheats() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [preheatPage, setPreheatPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('ALL');
  const [shouldPoll, setShouldPoll] = useState(false);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [allPreheats, setAllPreheats] = useState([
    {
      id: 0,
      created_at: '',
      updated_at: '',
      is_del: 0,
      task_id: '',
      bio: '',
      type: '',
      state: '',
      args: {
        filter: '',
        headers: {},
        tag: '',
        type: '',
        url: '',
      },
    },
  ]);

  const user = useContext(MyContext);
  const navigate = useNavigate();

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

        if (user.name === 'root') {
          const [jobs] = await Promise.all([
            getJobs({
              page: 1,
              per_page: MAX_PAGE_SIZE,
              state: status === 'ALL' ? undefined : status,
            }),
          ]);

          setAllPreheats(jobs.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

          const states = jobs.data.filter((obj) => obj.state !== 'SUCCESS' && obj.state !== 'FAILURE').length;
          states === 0 ? setShouldPoll(false) : setShouldPoll(true);

          setIsLoading(false);
        } else if (user.name !== '') {
          const [jobs] = await Promise.all([
            getJobs({
              page: 1,
              per_page: MAX_PAGE_SIZE,
              state: status === 'ALL' ? undefined : status,
              user_id: String(user.id),
            }),
          ]);

          setAllPreheats(jobs.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

          const states = jobs.data.filter((obj) => obj.state !== 'SUCCESS' && obj.state !== 'FAILURE').length;
          states === 0 ? setShouldPoll(false) : setShouldPoll(true);

          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, [status, user]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollPreheat = async () => {
          try {
            if (user.name === 'root') {
              const [jobs] = await Promise.all([
                getJobs({
                  page: 1,
                  per_page: MAX_PAGE_SIZE,
                  state: status === 'ALL' ? undefined : status,
                }),
              ]);

              setAllPreheats(
                jobs.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
              );

              const states = jobs.data.filter((obj) => obj.state !== 'SUCCESS' && obj.state !== 'FAILURE').length;
              states === 0 ? setShouldPoll(false) : setShouldPoll(true);
            } else if (user.name !== '') {
              const [jobs] = await Promise.all([
                getJobs({
                  page: 1,
                  per_page: MAX_PAGE_SIZE,
                  state: status === 'ALL' ? undefined : status,
                }),
              ]);

              setAllPreheats(
                jobs.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
              );

              const states = jobs.data.filter((obj) => obj.state !== 'SUCCESS' && obj.state !== 'FAILURE').length;
              states === 0 ? setShouldPoll(false) : setShouldPoll(true);
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
            }
          }
        };

        pollPreheat();
      }, 3000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [status, shouldPoll, user]);

  const statusList = [
    { lable: 'Pending', name: 'PENDING' },
    { lable: 'All', name: 'ALL' },
    { lable: 'Success', name: 'SUCCESS' },
    { lable: 'Failure', name: 'FAILURE' },
  ];

  const totalPage = Math.ceil(allPreheats.length / DEFAULT_PAGE_SIZE);
  const currentPageData = getPaginatedList(allPreheats, preheatPage, DEFAULT_PAGE_SIZE);

  const changeStatus = (event: any) => {
    setStatus(event.target.value);
    setShouldPoll(true);
    setPreheatPage(1);
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: '1rem' }}>
        <Typography>jobs</Typography>
        <Typography color="text.primary">preheats</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2rem' }}>
        <Typography variant="h5">Preheat</Typography>
        <Button
          size="small"
          sx={{
            '&.MuiButton-root': {
              backgroundColor: 'var(--button-color)',
              borderRadius: 0,
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
      <Paper variant="outlined">
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
        {currentPageData.length === 0 ? (
          <Box sx={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            You don't have any preheat tasks.
          </Box>
        ) : (
          <>
            {Array.isArray(currentPageData) &&
              currentPageData.map((item, index) => {
                return index !== currentPageData.length - 1 ? (
                  <Box key={item.id}>
                    <Box sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '60%' }}>
                        {isLoading ? (
                          <Skeleton variant="circular" width="1.4rem" height="1.4rem" />
                        ) : item.state === 'SUCCESS' ? (
                          <Box
                            component="img"
                            sx={{ width: '1.3rem', height: '1.3rem' }}
                            src="/icons/preheat/success.svg"
                          />
                        ) : item.state === 'FAILURE' ? (
                          <Box
                            component="img"
                            sx={{ width: '1.3rem', height: '1.3rem' }}
                            src="/icons/preheat/failure.svg"
                          />
                        ) : (
                          <Box
                            component="img"
                            sx={{ width: '1.3rem', height: '1.3rem' }}
                            src="/icons/preheat/pending.svg"
                          />
                        )}
                        <Box
                          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                          ml="0.6rem"
                        >
                          {isLoading ? (
                            <Skeleton width="3rem" />
                          ) : (
                            <Typography variant="body1" fontFamily="mabry-bold">
                              {item.id}
                            </Typography>
                          )}

                          {isLoading ? (
                            <Skeleton width="6rem" />
                          ) : (
                            <Typography variant="body2">{item.bio || '-'}</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box width="30%">
                        {isLoading ? (
                          <Skeleton width="40%" />
                        ) : (
                          <Chip
                            avatar={<MoreTimeIcon />}
                            label={getDatetime(item.created_at) || '-'}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                      <Box width="10%" sx={{ display: 'flex', justifyContent: 'center' }}>
                        {isLoading ? (
                          <Skeleton variant="circular" width="2em" height="2em" />
                        ) : (
                          <RouterLink
                            component={Link}
                            to={`/jobs/preheats/${item?.id}`}
                            underline="hover"
                            sx={{ color: 'var(--description-color)' }}
                          >
                            <Box component="img" sx={{ width: '2rem', height: '2rem' }} src="/icons/user/detail.svg" />
                          </RouterLink>
                        )}
                      </Box>
                    </Box>
                    <Divider />
                  </Box>
                ) : (
                  <Box key={item.id} sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '60%' }}>
                      {isLoading ? (
                        <Skeleton variant="circular" width="1.4rem" height="1.4rem" />
                      ) : item.state === 'SUCCESS' ? (
                        <Box
                          component="img"
                          sx={{ width: '1.3rem', height: '1.3rem' }}
                          src="/icons/preheat/success.svg"
                        />
                      ) : item.state === 'FAILURE' ? (
                        <Box
                          component="img"
                          sx={{ width: '1.3rem', height: '1.3rem' }}
                          src="/icons/preheat/failure.svg"
                        />
                      ) : (
                        <Box
                          component="img"
                          sx={{ width: '1.3rem', height: '1.3rem' }}
                          src="/icons/preheat/pending.svg"
                        />
                      )}
                      <Box
                        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                        ml="0.6rem"
                      >
                        {isLoading ? (
                          <Skeleton width="3rem" />
                        ) : (
                          <Typography variant="body1" fontFamily="mabry-bold">
                            {item.id}
                          </Typography>
                        )}

                        {isLoading ? (
                          <Skeleton width="6rem" />
                        ) : (
                          <Typography variant="body2">{item.bio || '-'}</Typography>
                        )}
                      </Box>
                    </Box>
                    <Box width="30%">
                      {isLoading ? (
                        <Skeleton width="40%" />
                      ) : (
                        <Chip
                          avatar={<MoreTimeIcon />}
                          label={getDatetime(item.created_at) || '-'}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                    <Box width="10%" sx={{ display: 'flex', justifyContent: 'center' }}>
                      {isLoading ? (
                        <Skeleton variant="circular" width="2em" height="2em" />
                      ) : (
                        <RouterLink
                          component={Link}
                          to={`/jobs/preheats/${item?.id}`}
                          underline="hover"
                          sx={{ color: 'var(--description-color)' }}
                        >
                          <Box component="img" sx={{ width: '2rem', height: '2rem' }} src="/icons/user/detail.svg" />
                        </RouterLink>
                      )}
                    </Box>
                  </Box>
                );
              })}
          </>
        )}
      </Paper>
      {totalPage > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={totalPage}
            onChange={(_event: any, newPage: number) => {
              setPreheatPage(newPage);
            }}
            boundaryCount={1}
            color="primary"
            size="small"
          />
        </Box>
      ) : (
        <></>
      )}
    </ThemeProvider>
  );
}
