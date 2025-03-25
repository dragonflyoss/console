import {
  Typography,
  Box,
  IconButton,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  TextField,
  styled,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  toggleButtonGroupClasses,
  Pagination,
  useTheme,
  InputAdornment,
} from '@mui/material';
import styles from './index.module.css';
import { useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getTaskJobResponse, createTaskJob, getTaskJob } from '../../../../lib/api';
import { getBJTDatetime, getPaginatedList } from '../../../../lib/utils';
import _ from 'lodash';
import SearchTaskAnimation from '../../../search-task-animation';
import { useNavigate } from 'react-router-dom';
import { CancelLoadingButton, DeleteLoadingButton, SavelLoadingButton } from '../../../loading-button';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import SearchCircularProgress from '../../../circular-progress';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import Card from '../../../card';
import { ReactComponent as SchedulerCluster } from '../../../../assets/images/job/task/scheduler-cluster.svg';
import { ReactComponent as NoSearch } from '../../../../assets/images/job/task/no-search.svg';
import { ReactComponent as NoTask } from '../../../../assets/images/job/task/no-task.svg';
import { ReactComponent as DarkNoTask } from '../../../../assets/images/job/task/dark-no-task.svg';
import { ReactComponent as Delete } from '../../../../assets/images/cluster/delete.svg';
import { ReactComponent as DeleteWarning } from '../../../../assets/images/cluster/delete-warning.svg';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.7),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
    marginLeft: -1,
    border: 0,
  },
}));

export default function Clear() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTaskISLodaing, setSearchTaskISLodaing] = useState(false);
  const [searchIconISLodaing, setSearchIconISLodaing] = useState(false);
  const [openDeleteTask, setOpenDeleteTask] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [searchTask, setSearchTask] = useState('');
  const [task, setTask] = useState<getTaskJobResponse | any>();
  const [optional, setOptional] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [schedulerClusterID, setSchedulerClusterID] = useState(0);
  const [urlError, setUrlError] = useState(false);
  const [taskIDError, setTaskIDError] = useState(false);
  const [applicationError, setApplicationError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [pieceLengthError, setPieceLengthError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [filterHelperText, setFilterHelperText] = useState('Fill in the characters, the length is 0-100.');
  const [search, setSearch] = useState<string | null>('url');
  const [searchID, setSearchID] = useState(0);
  const [taskPages, setTaskPages] = useState<any>({});
  const [searchData, setSearchDada] = useState({
    url: '',
    tag: '',
    application: '',
    filtered_query_params: '',
    piece_length: 0,
  });

  const { url, tag, application, filtered_query_params } = searchData;
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (searchID) {
          const job = await getTaskJob(searchID);

          if (job?.type === 'get_task') {
            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setIsLoading(false);
              setSearchIconISLodaing(false);
              setSearchTaskISLodaing(false);

              setTask(job);
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
          setSearchIconISLodaing(false);
          setSearchTaskISLodaing(false);
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
            const job = await getTaskJob(searchID);

            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setTask(job);
              setShouldPoll(false);
              setIsLoading(false);
              setSearchIconISLodaing(false);
              setSearchTaskISLodaing(false);
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
              setShouldPoll(false);
              setIsLoading(false);
              setSearchIconISLodaing(false);
              setSearchTaskISLodaing(false);
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
        startAdornment: searchIconISLodaing ? (
          <Box className={styles.circularProgress}>
            <SearchCircularProgress />
          </Box>
        ) : (
          <Box className={styles.circularProgress}>
            <SearchIcon sx={{ color: '#919EAB' }} />
          </Box>
        ),
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
        id: 'pieceLength',
        labels: 'Piece Length',
        name: 'pieceLength',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Piece length',
        helperText: pieceLengthError ? 'Fill in the number, the length is 4-1024 MiB.' : '',
        error: pieceLengthError,
        InputProps: (
          <Tooltip
            title={
              'When the task URLs are the same but the Piece Length is different, they will be distinguished based on the Piece Length, and the queried tasks will also be different.'
            }
            placement="top"
          >
            <HelpIcon
              sx={{
                color: 'var(--palette-grey-300Channel)',
                width: '0.8rem',
                height: '0.8rem',
                ':hover': { color: 'var(--palette-description-color)' },
              }}
            />
          </Tooltip>
        ),
        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
          setSearchDada({ ...searchData, piece_length: e.target.value });
        },
      },
      syncError: false,
      setError: setPieceLengthError,

      validate: (value: string) => {
        const reg = /^(?:|[4-9]|[1-9]\d{1,2}|10[0-1]\d|102[0-4])$/;
        return reg.test(value);
      },
    },
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
              'When the task URL is the same but the tags are different, they will be distinguished based on the tags, and the queried tasks will also be different.'
            }
            placement="top"
          >
            <HelpIcon
              sx={{
                color: 'var(--palette-grey-300Channel)',
                width: '0.8rem',
                height: '0.8rem',
                ':hover': { color: 'var(--palette-description-color)' },
              }}
            />
          </Tooltip>
        ),

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
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
          <Tooltip title={'Caller application which is used for statistics and access control.'} placement="top">
            <HelpIcon
              sx={{
                color: 'var(--palette-grey-300Channel)',
                width: '0.8rem',
                height: '0.8rem',
                ':hover': { color: 'var(--palette-description-color)' },
              }}
            />
          </Tooltip>
        ),

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[2]);
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
          if (!formList[3].formProps.error) {
            setSearchDada({ ...searchData, filtered_query_params: newValue.join('&') });
          }
        },

        onInputChange: (e: any) => {
          setFilterHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, formList[3]);
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
        startAdornment: searchTaskISLodaing ? (
          <Box className={styles.circularProgress}>
            <SearchCircularProgress />
          </Box>
        ) : (
          <Box className={styles.circularProgress}>
            <SearchIcon sx={{ color: '#9BA0A6' }} />
          </Box>
        ),
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
    task?.result?.job_states?.map((item: any) => {
      return item.results ? item.results.map((resultItem: any) => resultItem) : [];
    }) ?? [];

  const jobStates = Array.isArray(result) ? result.flat(2) : [];
  const results = Array.isArray(jobStates) ? jobStates.flat(2).filter((item) => item.peers !== null) : [];
  const peers = Array.isArray(results)
    ? Array.from(new Set(results.map((item) => JSON.stringify(item)))).map((str) => JSON.parse(str))
    : [];

  const handleDeleteTask = async (event: any) => {
    try {
      setDeleteLoadingButton(true);

      setLoadingButton(true);
      event.preventDefault();

      const delet = event.currentTarget.elements.deletCache.value;

      if (delet === 'DELETE') {
        if (schedulerClusterID && !deleteError) {
          if (task?.args?.url && task?.args?.url !== '') {
            const formList = {
              args: {
                url: task?.args?.url,
                tag: task?.args?.tag,
                application: task?.args?.application,
                filtered_query_params: task?.args?.filtered_query_params,
                ...(searchData.piece_length &&
                  searchData.piece_length !== 0 && { piece_length: searchData.piece_length * 1024 * 1024 }),
              },
              scheduler_cluster_ids: [schedulerClusterID],
              type: 'delete_task',
            };

            const tasks = await createTaskJob(formList);

            if (tasks?.id) {
              setDeleteLoadingButton(false);
              navigate(`/jobs/task/executions/${tasks?.id}`);
              setOpenDeleteTask(false);
            }
          } else if (task?.args?.task_id) {
            const formList = {
              args: {
                task_id: task?.args?.task_id,
              },
              scheduler_cluster_ids: [schedulerClusterID],
              type: 'delete_task',
            };

            const tasks = await createTaskJob(formList);
            if (tasks?.id) {
              setDeleteLoadingButton(false);
              navigate(`/jobs/task/executions/${tasks?.id}`);
              setOpenDeleteTask(false);
            }
          }
        }
      } else {
        setDeleteError(true);
        setDeleteLoadingButton(false);
        setIsLoading(false);
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
    setIsLoading(true);
    setSearchTaskISLodaing(true);
    setSearchIconISLodaing(false);
    try {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      const taskIDValue = data.get(taskIDList.formProps.name);
      taskIDList.setError(!taskIDList.validate(taskIDValue as string));
      taskIDList.syncError = !taskIDList.validate(taskIDValue as string);

      if (searchTask !== '' && !taskIDList.syncError) {
        const data = {
          args: {
            task_id: searchTask,
          },
          type: 'get_task',
        };

        const task = await createTaskJob(data);
        setSearchID(task?.id);
      } else {
        navigate('/jobs/task/clear');
        setTask(null);
        setIsLoading(false);
        setSearchTaskISLodaing(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setIsLoading(false);
        setSearchTaskISLodaing(false);
      }
    }
  };

  const handleSearchByURL = async (event: any) => {
    setSearchTaskISLodaing(false);
    setLoadingButton(true);
    setIsLoading(true);
    setSearchIconISLodaing(true);
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const filterText = event.currentTarget.elements.filteredQueryParams?.value;

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
        ...(searchData.piece_length &&
          searchData.piece_length !== 0 && { piece_length: searchData.piece_length * 1024 * 1024 }),
      },
      type: 'get_task',
    };

    if (canSubmit) {
      setOptional(false);
      try {
        const task = await createTaskJob({ ...formDate });
        setLoadingButton(false);
        setSearchID(task?.id);
      } catch (error) {
        if (error instanceof Error) {
          setIsLoading(false);
          setSearchIconISLodaing(false);
          setLoadingButton(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    } else {
      setIsLoading(false);
      setSearchIconISLodaing(false);
      setLoadingButton(false);
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenDeleteTask(false);
    setErrorMessage(false);
    setDeleteError(false);
    setDeleteLoadingButton(false);
    setIsLoading(false);
  };

  const handleCloseSearch = () => {
    setOptional(false);
    setSearchDada({ url: '', tag: '', application: '', filtered_query_params: '', piece_length: 0 });
    setPieceLengthError(false);
    setUrlError(false);
  };

  const handleChangeSearch = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment) {
      setSearch(newAlignment);
    }
    setOptional(false);
    setSearchTask('');
    setSearchDada({ url: '', tag: '', application: '', filtered_query_params: '', piece_length: 0 });
  };

  const handlePageChange = (peerId: any, newPage: any) => {
    setTaskPages((prevPages: any) => ({
      ...prevPages,
      [peerId]: newPage,
    }));
  };

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
      <Paper
        elevation={0}
        sx={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          mb: '2rem',
          backgroundColor: 'var(--palette-grey-600Channel)',
          borderRadius: '0.4rem',
        }}
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
                backgroundColor: 'var(--palette-save-color)',
                color: '#FFFFFF',
                boxShadow: 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
                '&:hover': {
                  backgroundColor: 'var(--palette-save-color)',
                },
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
              // textTransform: 'none',
              p: '0.3rem 0.5rem',
              // width: '11.5rem',
              color: 'var(--palette-dark-400Channel)',
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
                backgroundColor: 'var(--palette-save-color)',
                color: '#FFFFFF',
                boxShadow: 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
                '&:hover': {
                  backgroundColor: 'var(--palette-save-color)',
                },
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
              // textTransform: 'none',
              p: '0.3rem 0.5rem',
              // width: '11.5rem',
              color: 'var(--palette-dark-400Channel)',
            }}
          >
            <AssignmentOutlinedIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            Search by task id
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Paper>
      {search === 'task-id' ? (
        <Box key="task-id" component="form" onSubmit={handleSearchByTaskID} sx={{ width: '38rem', height: '3rem' }}>
          <TextField fullWidth variant="outlined" size="small" {...taskIDList.formProps} sx={{ p: 0 }} />
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: '3rem' }}>
          <Paper
            component="form"
            onSubmit={handleSearchByURL}
            elevation={optional ? 3 : 0}
            sx={{
              p: optional ? '1rem' : '',
              borderRadius: '0.2rem',
              width: optional ? '45rem' : '36rem',
              position: 'absolute',
              backgroundColor: 'var(--palette-background-menu-paper)',
            }}
          >
            <TextField
              {...urlList.formProps}
              fullWidth
              size="small"
              onFocus={(e) => {
                setOptional(true);
              }}
              key="url"
            />

            {optional ? (
              <>
                <Divider sx={{ m: '1rem 0' }} />
                <Typography variant="subtitle1" fontFamily="mabry-bold" component="div">
                  Optional
                </Typography>
                <Box>
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
                                  'Filter the query parameters of the downloaded URL. If the download URL is the same, it will be scheduled as the same task.'
                                }
                                placement="top"
                              >
                                <HelpIcon
                                  sx={{
                                    color: 'var(--palette-grey-300Channel)',
                                    width: '0.8rem',
                                    height: '0.8rem',
                                    mr: '0.3rem',
                                    ':hover': { color: 'var(--palette-description-color)' },
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
                          ) : item.formProps.id === 'pieceLength' ? (
                            <TextField
                              sx={{ width: '10.5rem' }}
                              margin="normal"
                              size="small"
                              {...item.formProps}
                              InputProps={{ endAdornment: <InputAdornment position="start">MiB</InputAdornment> }}
                            />
                          ) : (
                            <TextField margin="normal" size="small" {...item.formProps} className={styles.textField} />
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
                </Box>
              </>
            ) : (
              ''
            )}
          </Paper>
        </Box>
      )}
      {isLoading ? (
        <Box id="isLoading" sx={{ mt: '4rem' }}>
          <SearchTaskAnimation />
        </Box>
      ) : task && task?.type === 'get_task' ? (
        <Box sx={{ width: '100%', typography: 'body1', mt: '2rem' }}>
          {Array.isArray(peers) && peers?.length > 0 ? (
            <>
              <Typography variant="h6" m="1rem 0" fontFamily="mabry-bold">
                Cache
              </Typography>
              <Box id="cache">
                {peers.map((peer: any, index: any) => {
                  const peerId = peer?.scheduler_cluster_id;
                  const totalPage = Math.ceil(peer?.peers.length / 5);
                  const taskPage = taskPages[peerId] || 1;
                  const currentPageData = getPaginatedList(peer?.peers, taskPage, 5);
                  return (
                    <Box mb="2rem" key={index}>
                      <Card>
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
                                borderRadius: '0.2rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <SchedulerCluster className={styles.schedulerClusterIcon} />
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
                            sx={{
                              background: 'var(--palette-button-color)',
                              color: 'var(--palette-button-text-color)',
                              ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
                            }}
                            variant="contained"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSchedulerClusterID(peer?.scheduler_cluster_id);
                              setOpenDeleteTask(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
                            delete
                          </Button>
                        </Box>
                        <Divider />
                        <Box
                          sx={{
                            p: '1rem 0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'var(--palette-table-title-color)',
                          }}
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
                              <Box key={index} sx={{ p: '1rem', display: 'flex', alignItems: 'center' }}>
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
                            ) : (
                              <Box key={index} sx={{ p: '1rem', display: 'flex', alignItems: 'center' }}>
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
                      </Card>
                      {totalPage > 1 ? (
                        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
                          <Pagination
                            id={`pagination-${index}`}
                            count={totalPage}
                            page={taskPage}
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
            <Box id="no-task" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '6rem' }}>
              <NoSearch className={styles.noSearch} />
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
          {theme.palette.mode === 'light' ? (
            <NoTask id="no-task-image" className={styles.noTask} />
          ) : (
            <DarkNoTask id="dark-no-task-image" className={styles.noTask} />
          )}
        </Box>
      )}
      <Dialog
        open={openDeleteTask}
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
            <Delete className={styles.deleteIcon} />
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
          <Box component="form" onSubmit={handleDeleteTask}>
            <Box display="flex" alignItems="flex-start" pb="1rem">
              <DeleteWarning className={styles.deleteWarningIcon} />
              <Box>
                <Typography
                  variant="body1"
                  fontFamily="mabry-bold"
                  component="span"
                  sx={{ color: 'var(--palette-delete-button-color)' }}
                >
                  WARNING:&nbsp;
                </Typography>
                <Typography variant="body1" component="span" sx={{ color: 'var(--palette-delete-button-color)' }}>
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
              <DeleteLoadingButton
                loading={deleteLoadingButton}
                endIcon={<DeleteIcon />}
                id="deleteTask"
                text="Delete"
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
