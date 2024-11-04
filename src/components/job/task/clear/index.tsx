import {
  Typography,
  Box,
  IconButton,
  Paper,
  Button,
  Chip,
  Skeleton,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  createTheme,
  ThemeProvider,
  TextField,
  styled,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  toggleButtonGroupClasses,
  Pagination,
} from '@mui/material';
import styles from './index.module.css';
import { useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getCacheJobResponse, createCacheJob, getCacheJob } from '../../../../lib/api';
import { getBJTDatetime, getPaginatedList, useQuery } from '../../../../lib/utils';
import _ from 'lodash';
import SearchTaskAnimation from '../../../search-task-animation';
import { useNavigate } from 'react-router-dom';
import { CancelLoadingButton, SavelLoadingButton } from '../../../loading-button';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import SearchCircularProgress from '../../../circular-progress';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
    marginLeft: -1,
    borderLeft: '1px solid transparent',
  },
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1C293A',
    },
    success: {
      main: '#2e8f79',
    },
  },
  typography: {
    fontFamily: 'mabry-light,sans-serif',
  },
});

export default function Clear() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openDeleteCache, setOpenDeleteCache] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [searchTask, setSearchTask] = useState('');
  const [cache, setCache] = useState<getCacheJobResponse | any>();
  const [input, setInput] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [schedulerClusterID, setSchedulerClusterID] = useState(0);
  const [urlError, setUrlError] = useState(false);
  const [taskIDError, setTaskIDError] = useState(false);
  const [applicationError, setApplicationError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [filterHelperText, setFilterHelperText] = useState('Fill in the characters, the length is 0-100.');
  const [search, setSearch] = useState<string | null>('url');
  const [searchID, setSearchID] = useState(0);
  const [cachePages, setCachePages] = useState<any>({});
  const [searchData, setSearchDada] = useState({ url: '', tag: '', application: '', filtered_query_params: '' });

  const { url, tag, application, filtered_query_params } = searchData;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (searchID) {
          const job = await getCacheJob(searchID);

          if (job.type === 'get_task') {
            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setIsLoading(false);
              setCache(job);
            } else {
              setShouldPoll(true);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    };
    fetchJob();
  }, [searchID]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollClear = async () => {
          try {
            const job = await getCacheJob(searchID);

            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setCache(job);
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

        pollClear();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [shouldPoll, searchID]);

  const urlList = {
    formProps: {
      id: 'url',
      label: 'URL',
      name: 'url',
      required: true,
      value: url,
      autoComplete: 'family-name',
      placeholder: 'Enter your URL',
      helperText: urlError ? 'Fill in the characters, the length is 0-1000.' : '',
      error: urlError,
      InputProps: {
        startAdornment: <SearchIcon sx={{ color: '#9BA0A6' }} />,
        endAdornment: searchTask ? (
          <IconButton type="button" sx={{ p: 0 }} aria-label="search">
            <ClearIcon />
          </IconButton>
        ) : (
          <></>
        ),
      },

      onChange: (e: any) => {
        changeValidate(e.target.value, urlList);
        setSearchDada({ ...searchData, url: e.target.value });
      },
    },
    syncError: false,
    setError: setUrlError,

    validate: (value: string) => {
      const reg = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s].{1,1000}$/;
      return reg.test(value);
    },
  };

  const formList = [
    {
      formProps: {
        id: 'tag',
        labels: 'Tag',
        name: 'tag',
        value: tag,
        autoComplete: 'family-name',
        placeholder: 'Enter your tag',
        helperText: tagError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: tagError,
        InputProps: (
          <Tooltip
            title={
              'When the task URLs are the same but the tags are different, they are differentiated based on the tags and the query caches are also different.'
            }
            placement="top"
          >
            <HelpIcon
              color="disabled"
              sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
            />
          </Tooltip>
        ),

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
          setSearchDada({ ...searchData, tag: e.target.value });
        },
      },
      syncError: false,
      setError: setTagError,

      validate: (value: string) => {
        const reg = /^.{0,1000}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'application',
        labels: 'Application',
        name: 'application',
        value: application,
        autoComplete: 'family-name',
        placeholder: 'Enter your application',
        helperText: applicationError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: applicationError,
        InputProps: (
          <Tooltip title={'Application is the application of the task.'} placement="top">
            <HelpIcon
              color="disabled"
              sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
            />
          </Tooltip>
        ),

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
          setSearchDada({ ...searchData, application: e.target.value });
        },
      },
      syncError: false,
      setError: setApplicationError,

      validate: (value: string) => {
        const reg = /^.{0,1000}$/;
        return reg.test(value);
      },
    },
    {
      id: 'filteredQueryParams',
      name: 'filteredQueryParams',
      label: 'Filter Query Params',
      filterFormProps: {
        value: (filtered_query_params && filtered_query_params.split('&')) || [],
        options: [],

        onChange: (_e: any, newValue: any) => {
          if (!formList[2].formProps.error) {
            setSearchDada({ ...searchData, filtered_query_params: newValue.join('&') });
          }
        },

        onInputChange: (e: any) => {
          setFilterHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, formList[2]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'filteredQueryParams',
        name: 'filteredQueryParams',
        labels: 'Filter Query Params',
        placeholder: 'Press the Enter key to confirm the entered value',
        error: filterError,
        helperText: filterError ? filterHelperText : '',

        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setFilterError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
    },
  ];

  const taskIDList = {
    formProps: {
      id: 'task-id',
      label: 'Task ID',
      name: 'task-id',
      required: true,
      value: searchTask,
      autoComplete: 'family-name',
      placeholder: 'Enter your URL',
      helperText: taskIDError ? 'Fill in the characters, the length is 0-1000.' : '',
      error: taskIDError,
      InputProps: {
        startAdornment: isLoading ? <SearchCircularProgress /> : <SearchIcon sx={{ color: '#9BA0A6' }} />,
        endAdornment: searchTask ? (
          <IconButton
            type="button"
            aria-label="search"
            onClick={() => {
              setSearchTask('');
            }}
          >
            <ClearIcon />
          </IconButton>
        ) : (
          <></>
        ),
      },

      onChange: (e: any) => {
        changeValidate(e.target.value, taskIDList);
        setSearchTask(e.target.value);
      },
    },
    syncError: false,
    setError: setTaskIDError,

    validate: (value: string) => {
      const reg = /^.{0,1000}$/;
      return reg.test(value);
    },
  };

  const result =
    cache?.result?.job_states?.map((item: any) => {
      return item.results ? item.results.map((resultItem: any) => resultItem) : [];
    }) ?? [];

  const jobStates = Array.isArray(result) ? result.flat(2) : [];
  const results = Array.isArray(jobStates) ? jobStates.flat(2).filter((item) => item.peers !== null) : [];
  const peers = Array.isArray(results)
    ? Array.from(new Set(results.map((item) => JSON.stringify(item)))).map((str) => JSON.parse(str))
    : [];

  const handleDeleteCache = async () => {
    try {
      setDeleteLoadingButton(true);
      if (schedulerClusterID && !deleteError) {
        if (cache?.args?.url && cache?.args?.url !== '') {
          const formList = {
            args: {
              url: cache?.args?.url,
              tag: cache?.args?.tag,
              application: cache?.args?.application,
              filtered_query_params: cache?.args?.filtered_query_params,
            },
            scheduler_cluster_ids: [schedulerClusterID],
            type: 'delete_task',
          };

          const tasks = await createCacheJob(formList);

          if (tasks?.id) {
            setDeleteLoadingButton(false);
            navigate(`/jobs/task/executions/${tasks?.id}`);
            setOpenDeleteCache(false);
          }
        } else if (cache?.args?.task_id) {
          const formList = {
            args: {
              task_id: cache?.args?.task_id,
            },
            scheduler_cluster_ids: [schedulerClusterID],
            type: 'delete_task',
          };

          const tasks = await createCacheJob(formList);
          if (tasks?.id) {
            setDeleteLoadingButton(false);
            setCache(null);
            navigate(`/jobs/task/executions/${tasks?.id}`);
            setOpenDeleteCache(false);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
        setIsLoading(false);
      }
    }
  };

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSearchByTaskID = async (event: any) => {
    try {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      const taskIDValue = data.get(taskIDList.formProps.name);
      taskIDList.setError(!taskIDList.validate(taskIDValue as string));
      taskIDList.syncError = !taskIDList.validate(taskIDValue as string);

      if (searchTask !== '' && !taskIDList.syncError) {
        setIsLoading(true);
        const data = {
          args: {
            task_id: searchTask,
          },
          type: 'get_task',
        };

        const task = await createCacheJob(data);
        setSearchID(task?.id);
      } else {
        navigate('/jobs/task/clear');
        setCache(null);
        setIsLoading(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setIsLoading(false);
      }
    }
  };

  const handleSearchByURL = async (event: any) => {
    setLoadingButton(true);
    setIsLoading(true);
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const filterText = event.currentTarget.elements.filteredQueryParams.value;
    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    if (filterText) {
      setFilterError(true);
      setFilterHelperText('Please press ENTER to end the filter creation');
    } else {
      setFilterError(false);
      setFilterHelperText('Fill in the characters, the length is 0-100.');
    }

    formList.forEach((item) => {
      if (item.formProps.name !== 'filteredQueryParams') {
        const value = data.get(item.formProps.name);
        item.setError(!item.validate(value as string));
        item.syncError = !item.validate(value as string);
      }
    });

    const urlValue = data.get(urlList.formProps.name);

    urlList.setError(!urlList.validate(urlValue as string));

    urlList.syncError = !urlList.validate(urlValue as string);

    const canSubmit = Boolean(
      !formList.filter((item) => item.syncError).length && Boolean(!filterText) && !urlList.syncError,
    );

    const formDate = {
      args: {
        url: searchData.url,
        tag: searchData.tag,
        application: searchData.application,
        filtered_query_params: searchData.filtered_query_params,
      },
      type: 'get_task',
    };

    if (canSubmit) {
      setInput(false);
      try {
        const task = await createCacheJob({ ...formDate });
        setLoadingButton(false);
        setSearchID(task?.id);
      } catch (error) {
        if (error instanceof Error) {
          setIsLoading(false);
          setLoadingButton(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    } else {
      setIsLoading(false);
      setLoadingButton(false);
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenDeleteCache(false);
    setErrorMessage(false);
  };

  const handleCloseSearch = () => {
    setInput(false);
    setSearchDada({ url: '', tag: '', application: '', filtered_query_params: '' });
  };

  const handleChangeSearch = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment) {
      setSearch(newAlignment);
    }
    setInput(false);
    setSearchTask('');
    setSearchDada({ url: '', tag: '', application: '', filtered_query_params: '' });
  };

  const handlePageChange = (peerId: any, newPage: any) => {
    setCachePages((prevPages: any) => ({
      ...prevPages,
      [peerId]: newPage,
    }));
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
      <Paper
        variant="outlined"
        sx={(theme) => ({
          display: 'inline-flex',
          flexWrap: 'wrap',
          mb: '2rem',
          backgroundColor: '#EEEEEE',
        })}
      >
        <StyledToggleButtonGroup
          size="small"
          value={search}
          exclusive
          onChange={handleChangeSearch}
          aria-label="Platform"
        >
          <ToggleButton
            id="serach-url"
            value="url"
            size="small"
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'var(--button-color)',
                color: 'var(--table-title-color)',
                boxShadow: 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
                '&:hover': {
                  backgroundColor: 'var(--button-color)',
                },
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
              p: '0.3rem 0.6rem',
              width: '11.5rem',
            }}
          >
            <LinkOutlinedIcon sx={{ mr: '0.4rem' }} />
            Search by URL
          </ToggleButton>
          <ToggleButton
            id="serach-task-id"
            value="task-id"
            size="small"
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'var(--button-color)',
                color: 'var(--table-title-color)',
                boxShadow: 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
                '&:hover': {
                  backgroundColor: 'var(--button-color)',
                },
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
              p: '0.3rem 0.6rem',
              width: '11.5rem',
            }}
          >
            <AssignmentOutlinedIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            Search by task id
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Paper>
      {search === 'task-id' ? (
        <Box component="form" onSubmit={handleSearchByTaskID} sx={{ width: '38rem', height: '3rem' }}>
          <TextField fullWidth size="small" {...taskIDList.formProps} />
        </Box>
      ) : (
        <>
          <Box sx={{ position: 'relative', height: '3rem' }}>
            <Paper
              component="form"
              onSubmit={handleSearchByURL}
              elevation={input ? 3 : 0}
              sx={{
                p: input ? '1rem' : '',
                borderRadius: '4px',
                width: input ? '45rem' : '36rem',
                position: 'absolute',
              }}
            >
              <TextField
                {...urlList.formProps}
                fullWidth
                size="small"
                onFocus={(e) => {
                  setInput(true);
                }}
              />

              {input ? (
                <>
                  <Divider sx={{ m: '1rem 0' }} />
                  <Typography variant="subtitle1" fontFamily="mabry-bold" component="div">
                    Optional
                  </Typography>
                  <Paper elevation={0} sx={{ top: '2rem', backgroundColor: '#FFF' }}>
                    <Box className={styles.optionalContainer}>
                      {formList.map((item) => {
                        return (
                          <Box key={item.formProps.id} className={styles.filterInput}>
                            <Box width="30%" display="flex" alignItems="center">
                              <Typography variant="body2" color="#5e5e5e" fontFamily="mabry-bold" mr="0.4rem">
                                {item?.formProps?.labels}
                              </Typography>
                              {item?.id === 'filteredQueryParams' ? (
                                <Tooltip
                                  title={
                                    'By setting the filter parameter, you can specify the file type of the resource that needs to be searched for cache. This filter is used to generate a unique cache and filter out unnecessary query parameters in the URL, separated by the & character.'
                                  }
                                  placement="top"
                                >
                                  <HelpIcon
                                    color="disabled"
                                    sx={{
                                      width: '0.8rem',
                                      height: '0.8rem',
                                      mr: '0.3rem',
                                      ':hover': { color: 'var(--description-color)' },
                                    }}
                                  />
                                </Tooltip>
                              ) : (
                                item.formProps?.InputProps
                              )}
                            </Box>
                            {item.id === 'filteredQueryParams' ? (
                              <Autocomplete
                                freeSolo
                                multiple
                                disableClearable
                                {...item.filterFormProps}
                                className={styles.textField}
                                size="small"
                                renderInput={(params) => <TextField {...params} margin="normal" {...item.formProps} />}
                              />
                            ) : (
                              <TextField
                                margin="normal"
                                size="small"
                                {...item.formProps}
                                className={styles.textField}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                    <Divider sx={{ pb: '1rem' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1rem' }}>
                      <CancelLoadingButton id="cancelSearchByURL" loading={loadingButton} onClick={handleCloseSearch} />
                      <SavelLoadingButton
                        loading={loadingButton}
                        endIcon={<SearchIcon />}
                        id="searchByURL"
                        text="search"
                      />
                    </Box>
                  </Paper>
                </>
              ) : (
                ''
              )}
            </Paper>
          </Box>
        </>
      )}
      {isLoading ? (
        <Box id="isLoading" sx={{ mt: '4rem' }}>
          <SearchTaskAnimation />
        </Box>
      ) : cache && cache?.type === 'get_task' ? (
        <Box sx={{ width: '100%', typography: 'body1', mt: '2rem' }}>
          {peers && peers?.length > 0 ? (
            <>
              <Typography variant="h6" m="1rem 0" fontFamily="mabry-bold">
                Cache
              </Typography>
              <Box id="cache">
                {peers.map((peer: any, index: any) => {
                  const peerId = peer.scheduler_cluster_id;
                  const totalPage = Math.ceil(peer?.peers.length / 5);
                  const cachePage = cachePages[peerId] || 1;
                  const currentPageData = getPaginatedList(peer?.peers, cachePage, 5);
                  return (
                    <Box mb="2rem" key={index}>
                      <Paper variant="outlined">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: '1rem',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" mr="0.6rem" fontFamily="mabry-bold">
                              Scheduler Cluster
                            </Typography>
                            <Box
                              sx={{
                                border: '1px solid #d5d2d2',
                                p: '0.2rem 0.3rem',
                                borderRadius: '0.4rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Box
                                component="img"
                                sx={{ width: '0.6rem', height: '0.6rem' }}
                                src="/icons/job/task/scheduler-cluster.svg"
                              />
                              <Typography
                                id="schedulerTotal"
                                variant="subtitle2"
                                fontFamily="mabry-bold"
                                component="div"
                                pl="0.3rem"
                                lineHeight="1rem"
                              >
                                ID&nbsp;:&nbsp; {peer?.scheduler_cluster_id || '0'}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            sx={{ background: 'var(--button-color)', borderRadius: '0' }}
                            variant="contained"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSchedulerClusterID(peer?.scheduler_cluster_id);
                              setOpenDeleteCache(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
                            delete
                          </Button>
                        </Box>
                        <Divider />
                        <Box
                          sx={{ p: '1rem 0.8rem', display: 'flex', alignItems: 'center', backgroundColor: '#f6f6f6' }}
                        >
                          <Box width="20%" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                              Hostname
                            </Typography>
                          </Box>
                          <Box width="35%" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                              ID
                            </Typography>
                          </Box>
                          <Box width="15%" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                              IP
                            </Typography>
                          </Box>
                          <Box width="15%" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                              Host type
                            </Typography>
                          </Box>
                          <Box width="15%" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                              Created at
                            </Typography>
                          </Box>
                        </Box>
                        <Divider />
                        <Box id={`cache-${index}`}>
                          {currentPageData?.map((item: any, index: number) => {
                            return index !== currentPageData.length - 1 ? (
                              <>
                                <Box sx={{ p: '1rem', display: 'flex', alignItems: 'center' }}>
                                  <Box width="20%" sx={{ display: 'flex', alignItems: 'center', pb: '0.4rem' }}>
                                    <Box>
                                      <Tooltip title={item?.hostname || '-'} placement="top">
                                        <Typography variant="body1">{item?.hostname}</Typography>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                  <Box width="35%">
                                    <Tooltip title={item?.id || '-'} placement="top">
                                      <Typography variant="body2" component="div" className={styles.text}>
                                        {item?.id || '-'}
                                      </Typography>
                                    </Tooltip>
                                  </Box>
                                  <Box width="15%">
                                    <Box className={styles.ipContainer}>
                                      <Typography variant="subtitle2" component="div">
                                        {item?.ip || '-'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box width="15%">
                                    <Chip
                                      label={_.upperFirst(item?.host_type) || ''}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderRadius: '0%',
                                        backgroundColor:
                                          item?.host_type === 'super'
                                            ? 'var( --description-color)'
                                            : 'var(--button-color)',
                                        color: item?.host_type === 'super' ? '#FFFFFF' : '#FFFFFF',
                                        borderColor:
                                          item?.host_type === 'super'
                                            ? 'var( --description-color)'
                                            : 'var(--button-color)',
                                        fontWeight: 'bold',
                                      }}
                                    />
                                  </Box>
                                  <Box width="15%">
                                    <Chip
                                      avatar={<MoreTimeIcon />}
                                      label={getBJTDatetime(item?.created_at || '')}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Box>
                                  <Divider />
                                </Box>
                              </>
                            ) : (
                              <Box sx={{ p: '1rem', display: 'flex', alignItems: 'center' }}>
                                <Box width="20%" sx={{ display: 'flex', alignItems: 'center', pb: '0.4rem' }}>
                                  <Box>
                                    <Tooltip title={item?.hostname || '-'} placement="top">
                                      <Typography variant="body1" mr="1rem">
                                        {item?.hostname}
                                      </Typography>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                <Box width="35%">
                                  <Tooltip title={item?.id || '-'} placement="top">
                                    <Typography variant="body2" component="div" className={styles.text}>
                                      {item?.id || '-'}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                                <Box width="15%">
                                  <Box className={styles.ipContainer}>
                                    <Typography variant="subtitle2" component="div">
                                      {item?.ip || '-'}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box width="15%">
                                  <Chip
                                    label={_.upperFirst(item?.host_type) || ''}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderRadius: '0%',
                                      backgroundColor:
                                        item?.host_type === 'super'
                                          ? 'var( --description-color)'
                                          : 'var(--button-color)',
                                      color: item?.host_type === 'super' ? '#FFFFFF' : '#FFFFFF',
                                      borderColor:
                                        item?.host_type === 'super'
                                          ? 'var( --description-color)'
                                          : 'var(--button-color)',
                                      fontWeight: 'bold',
                                    }}
                                  />
                                </Box>
                                <Box width="15%">
                                  <Chip
                                    avatar={<MoreTimeIcon />}
                                    label={getBJTDatetime(item?.created_at || '')}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Paper>
                      {totalPage > 1 ? (
                        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
                          <Pagination
                            id={`pagination-${index}`}
                            count={totalPage}
                            page={cachePage}
                            onChange={(_event, newPage) => handlePageChange(peerId, newPage)}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      ) : (
                        <></>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '6rem' }}>
              <Box component="img" sx={{ width: '4rem', mb: '3rem' }} src="/icons/job/task/no-search.svg" />
              <Box>
                <Typography variant="h5" component="span">
                  You don't find any results!
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            p: '3rem 2rem 2rem 2rem',
          }}
        >
          <Box component="img" style={{ width: '30rem', height: '30rem' }} src="/icons/job/task/no-task.svg" />
        </Box>
      )}
      <Dialog
        open={openDeleteCache}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '40rem',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            p: '1rem',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src="/icons/cluster/delete.svg"
              sx={{ width: '1.8rem', height: '1.8rem', mr: '0.4rem' }}
            />
            <Typography variant="h6" component="div" fontFamily="mabry-bold">
              Delete
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
          <Box onSubmit={handleDeleteCache}>
            <Box display="flex" alignItems="flex-start" pb="1rem">
              <Box
                component="img"
                src="/icons/cluster/delete-warning.svg"
                sx={{ width: '1.4rem', height: '1.4rem', pr: '0.2rem' }}
              />
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
              The cache will be permanently delete.
            </Typography>
            <TextField
              error={deleteError}
              sx={{ pt: '1rem', width: '14rem' }}
              id="deletCache"
              name="deletCache"
              color="success"
              size="small"
              placeholder={`Type 'DELETE' to proceed`}
              autoComplete="family-name"
              helperText={deleteError ? `Please enter "DELETE"` : ''}
              onChange={(event) => {
                if (event.target.value === 'DELETE') {
                  setDeleteError(false);
                } else {
                  setDeleteError(true);
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
              <CancelLoadingButton id="cancelDeleteCluster" loading={deleteLoadingButton} onClick={handleClose} />
              <SavelLoadingButton
                loading={deleteLoadingButton}
                endIcon={<DeleteIcon />}
                id="deleteTask"
                onClick={handleDeleteCache}
                text="Delete"
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
