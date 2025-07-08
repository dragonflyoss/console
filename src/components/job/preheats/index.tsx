import {
  Button,
  Typography,
  Box,
  Pagination,
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
  Tooltip,
  TextField,
  debounce,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { useNavigate, Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getJob, getJobs, JobsResponse } from '../../../lib/api';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants';
import { getDatetime, useQuery } from '../../../lib/utils';
import styles from './index.module.css';
import Card from '../../card';
import { ReactComponent as IcContent } from '../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as Success } from '../../../assets/images/job/preheat/success.svg';
import { ReactComponent as Failure } from '../../../assets/images/job/preheat/failure.svg';
import { ReactComponent as Pending } from '../../../assets/images/job/preheat/pending.svg';
import { ReactComponent as Detail } from '../../../assets/images/job/preheat/detail.svg';
import SearchCircularProgress from '../../circular-progress';

export default function Preheats() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [preheatTotalPages, setPreheatTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('ALL');
  const [shouldPoll, setShouldPoll] = useState(false);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [allPreheats, setAllPreheats] = useState<JobsResponse[]>([]);
  const [search, setSearch] = useState<string>('');
  const [preheatID, setPreheatID] = useState('');
  const [searchLodaing, setSearchLodaing] = useState(false);

  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        if (preheatID === '') {
          const jobs = await getJobs({
            page: page,
            per_page: DEFAULT_PAGE_SIZE,
            state: status === 'ALL' ? undefined : status,
          });

          setAllPreheats(jobs.data);
          setPreheatTotalPages(jobs.total_page || 1);

          const states = jobs.data.filter(
            (obj) => obj?.result?.state !== 'SUCCESS' && obj?.result?.state !== 'FAILURE',
          ).length;

          states === 0 ? setShouldPoll(false) : setShouldPoll(true);

          setIsLoading(false);
        } else {
          const job = await getJob(preheatID);

          if (job.type === 'preheat') {
            setAllPreheats([job]);
            setPreheatTotalPages(1);

            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setShouldPoll(false);
            }
          } else {
            setAllPreheats([]);
            setPreheatTotalPages(1);
          }

          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
          setAllPreheats([]);
          setPreheatTotalPages(1);
        }
      }
    })();
  }, [status, page, preheatID]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollPreheat = async () => {
          try {
            if (preheatID === '') {
              const jobs = await getJobs({
                page: page,
                per_page: DEFAULT_PAGE_SIZE,
                state: status === 'ALL' ? undefined : status,
              });

              setAllPreheats(jobs.data);
              setPreheatTotalPages(jobs.total_page || 1);

              const states = jobs.data.filter(
                (obj) => obj?.result?.state !== 'SUCCESS' && obj?.result?.state !== 'FAILURE',
              ).length;

              states === 0 ? setShouldPoll(false) : setShouldPoll(true);
            } else {
              const job = await getJob(preheatID);
              setAllPreheats([job]);
              setPreheatTotalPages(1);

              if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
                setShouldPoll(false);
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
              setShouldPoll(false);
            }
          }
        };

        pollPreheat();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [status, shouldPoll, preheatID, page]);

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

  const debounced = useMemo(
    () =>
      debounce(async (currentSearch) => {
        setPreheatID(currentSearch);
        setSearchLodaing(false);
      }, 500),
    [],
  );

  const handleSearch = useCallback(
    (newSearch: any) => {
      debounced(newSearch);
      setSearchLodaing(true);
    },
    [debounced],
  );

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '1rem' }}>
        <Typography variant="h5">Preheats</Typography>
        <Button
          id="new-preheat"
          size="small"
          sx={{
            background: 'var(--palette-button-color)',
            color: 'var(--palette-button-text-color)',
            ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
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
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1.5rem' }}
      >
        <Typography color="text.primary">Job</Typography>
        <Typography color="inherit">Preheat</Typography>
      </Breadcrumbs>
      <FormControl className={styles.search} size="small">
        <TextField
          sx={{
            '& .MuiInputBase-input': {
              padding: '0.7rem 0.6rem',
            },
          }}
          value={search}
          label="Search"
          id="search"
          name="search"
          placeholder="Search by ID"
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            handleSearch(value);
          }}
          InputProps={{
            startAdornment: searchLodaing ? (
              <Box className={styles.searchIconContainer}>
                <SearchCircularProgress />
              </Box>
            ) : (
              <Box className={styles.searchIconContainer}>
                <SearchIcon sx={{ color: '#919EAB' }} />
              </Box>
            ),
          }}
        />
      </FormControl>
      <Card>
        <Box
          sx={{
            p: '0.8rem',
            backgroundColor: 'var(--palette-table-title-color)',
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
                <MenuItem
                  key={item.name}
                  value={item.name}
                  sx={{
                    m: '0.3rem',
                    borderRadius: '4px',
                  }}
                >
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
              <Box className={styles.information}>
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
            <IcContent className={styles.nodataIcon} />
            <Typography id="no-preheat" variant="h6" className={styles.nodataText}>
              You don't have any preheat tasks.
            </Typography>
          </Box>
        ) : (
          <Box id="preheats-list">
            {Array.isArray(allPreheats) &&
              allPreheats.map((item, index) => {
                return (
                  <Box key={item.id} id={`list-${item.id}`}>
                    <Box sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
                      <Box className={styles.information}>
                        {item?.result?.state === 'SUCCESS' ? (
                          <Success id={`SUCCESS-${item.id}`} className={styles.statusIcon} />
                        ) : item?.result?.state === 'FAILURE' ? (
                          <Failure id={`FAILURE-${item.id}`} className={styles.statusIcon} />
                        ) : (
                          <Pending id={`PENDING-${item.id}`} className={styles.pendingIcon} />
                        )}
                        <Box className={styles.informationContent}>
                          <RouterLink
                            component={Link}
                            id={`preheat-${item?.id}`}
                            to={`/jobs/preheats/${item?.id}`}
                            underline="hover"
                          >
                            <Typography id={`id-${item?.id}`} variant="body1" fontFamily="mabry-bold">
                              {item.id}
                            </Typography>
                          </RouterLink>
                          <Tooltip title={item.bio || '-'} placement="top" arrow>
                            <Typography
                              id={`description-${item?.id || 0}`}
                              variant="body2"
                              className={styles.description}
                            >
                              {item.bio || '-'}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box width="30%">
                        <Chip
                          id={`created_at-${item?.id}`}
                          avatar={<MoreTimeIcon />}
                          label={getDatetime(item.created_at) || '-'}
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
                          sx={{ color: 'var(--palette-description-color)' }}
                        >
                          <Detail className={styles.detailIcon} />
                        </RouterLink>
                      </Box>
                    </Box>
                    {index !== allPreheats.length - 1 && (
                      <Divider
                        sx={{
                          borderStyle: 'dashed',
                          borderColor: 'var(--palette-palette-divider)',
                          borderWidth: '0px 0px thin',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
          </Box>
        )}
      </Card>
      {preheatTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
          <Pagination
            count={preheatTotalPages}
            page={page}
            onChange={(_event: any, newPage: number) => {
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
    </Box>
  );
}
