import {
  Breadcrumbs,
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
  ListSubheader,
  Drawer,
  createTheme,
  ThemeProvider,
  TextField,
  styled,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import styles from './index.module.css';
import { MouseEvent, useEffect, useState } from 'react';
import InputBase from '@mui/material/InputBase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { deleteTaskResponse, createTaskJob, createGetTaskJobResponse, getTaskJob, taskJob } from '../../../../lib/api';
import { getBJTDatetime, getDatetime, useQuery } from '../../../../lib/utils';
import _ from 'lodash';
import SearchTaskAnimation from '../../../search-task-animation';
import { useNavigate } from 'react-router-dom';
import { CancelLoadingButton, SavelLoadingButton } from '../../../loading-button';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';

const Accordion = styled((props: AccordionProps) => <MuiAccordion defaultExpanded disableGutters square {...props} />)(
  ({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&::before': {
      display: 'none',
    },
    marginBottom: '1rem',
  }),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: '#F8F8FB',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: 0,
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export default function Task() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openClearAllClear, setOpenClearAllClear] = useState(false);
  const [openClearClear, setOpenClearClear] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [searchTask, setSearchTask] = useState('');
  const [task, setTask] = useState<deleteTaskResponse | any>();
  const [openDeleteBackdrop, setOpenDeleteBackdrop] = useState(false);
  const [input, setInput] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [deleteTask, setDeleteTask] = useState<deleteTaskResponse | null>();
  const [shouldPoll, setShouldPoll] = useState(false);
  const [schedulerClusterID, setSchedulerClusterID] = useState(0);
  const [noTask, setNOTask] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [application, setApplicationError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [filter, setFilter] = useState([]);
  const [filterHelperText, setFilterHelperText] = useState('Fill in the characters, the length is 0-100.');
  const [buttonloading, setButtonloading] = useState(false);
  const [search, setSearch] = useState(false);

  const query = useQuery();
  const page = parseInt(query.get('id') as string, 10);

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
        if (page) {
          const job = await getTaskJob(page);

          if (job.type === 'get_task') {
            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setIsLoading(false);
              setTask(job);
              setOpenDeleteBackdrop(false);
            } else {
              setShouldPoll(true);
              setOpenDeleteBackdrop(true);
            }
          }
        }
      } catch (error) {}
    })();
  }, [page]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollPreheat = async () => {
          try {
            const job = await getTaskJob(page);

            if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
              setTask(job);
              setShouldPoll(false);
              setIsLoading(false);
              setOpenDeleteBackdrop(false);
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
      }, 30000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [shouldPoll, page]);

  const searchTaskJob = async () => {
    try {
      if (searchTask !== '') {
        setNOTask(searchTask);
        const data = {
          args: {
            task_id: searchTask,
          },
          type: 'get_task',
        };

        const task = await createTaskJob(data);
        setIsLoading(true);
        navigate(`/jobs/task/clear${task?.id ? `?id=${task?.id}` : ''}`);
      } else {
        navigate('/jobs/task/clear');
        setTask(null);
        setDeleteTask(null);
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

  const filteredResults =
    task && task.result.job_states.flatMap((job: any) => job.results).filter((result: { peers: any }) => result.peers);

  const clusterID =
    filteredResults && filteredResults.map((item: { scheduler_cluster_id: any }) => item.scheduler_cluster_id);

  const handleClearCache = async () => {
    try {
      if (schedulerClusterID) {
        const formList = {
          args: {
            task_id: task?.args?.task_id,
          },
          scheduler_cluster_ids: [schedulerClusterID],
          type: 'delete_task',
        };

        const deleteTak = await createTaskJob(formList);

        if (deleteTak?.id) {
          const delete_task = await getTaskJob(deleteTak?.id);
          setDeleteTask(delete_task);
          setTask(null);
          navigate(`/jobs/task/executions/${delete_task?.id}`);
          setOpenClearClear(false);
          setOpenDeleteBackdrop(true);
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

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenClearAllClear(false);
    setOpenClearClear(false);
    setErrorMessage(false);
  };

  const searchTaskKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const submitButton = document.getElementById('submit-button');
      // submitButton?.click();
      searchTaskJob();
    }
  };

  const formList = [
    {
      formProps: {
        id: 'url',
        label: 'URL',
        name: 'url',
        required: true,
        autoComplete: 'family-name',
        placeholder: 'Enter your url',
        helperText: urlError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: urlError,
        InputProps: {
          endAdornment: (
            <Tooltip title={'URL address used to specify the resource to be get task.'} placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          ),
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
        },
      },
      syncError: false,
      setError: setUrlError,

      validate: (value: string) => {
        const reg = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s].{1,1000}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'tag',
        label: 'Tag',
        name: 'tag',
        autoComplete: 'family-name',
        placeholder: 'Enter your tag',
        helperText: tagError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: tagError,
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'When the URL of the get tasks are the same but the Tag are different, they will be distinguished based on the Tag and the generated preheat tasks will be different.'
              }
              placement="top"
            >
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          ),
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
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
        label: 'Application',
        name: 'application',
        autoComplete: 'family-name',
        placeholder: 'Enter your application',
        helperText: application ? 'Fill in the characters, the length is 0-1000.' : '',
        error: application,
        InputProps: {
          endAdornment: (
            <Tooltip title={'Preheat application.'} placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          ),
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, formList[2]);
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
        value: filter,
        options: [],
        onChange: (_e: any, newValue: any) => {
          if (!formList[2].formProps.error) {
            setFilter(newValue);
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
        label: 'Filter Query Params',
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

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);
    event.preventDefault();
    // const data = new formList(event.currentTarget);

    const url = event.currentTarget.elements.url.value;
    const tag = event.currentTarget.elements.tag.value;
    const application = event.currentTarget.elements.application.value;
    const filterText = event.currentTarget.elements.filteredQueryParams.value;
    const filters = filter.join('&');

    const data = new FormData(event.currentTarget);

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

    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length && Boolean(!filterText));
    const formDate = {
      args: {
        url: url,
        tag: tag,
        application: application,
        filtered_query_params: filters,
      },
      type: 'get_task',
    };

    if (canSubmit) {
      try {
        const task = await taskJob({ ...formDate });
        setLoadingButton(false);
        navigate(`/jobs/task/clear${task?.id ? `?id=${task?.id}` : ''}`);
      } catch (error) {
        if (error instanceof Error) {
          setLoadingButton(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    } else {
      setLoadingButton(false);
    }
  };

  const handleSearch = () => {
    if (search) {
      setSearch(false);
    } else {
      setSearch(true);
    }
  };

  // const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
  //   setSearch(newAlignment);
  // };
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
      {!search ? (
        <Box component="form" onSubmit={searchTaskJob} sx={{ display: 'flex', alignItems: 'center', mb: '1rem' }}>
          <Paper
            component="form"
            variant="outlined"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              width: '50%',

              borderColor: input ? 'var(--button-color)' : '',
              ':hover': { borderColor: 'var(--button-color)' },
            }}
          >
            <SearchIcon sx={{ m: '0.2rem', color: '#5F6367' }} />
            <InputBase
              onFocus={() => {
                setInput(true);
              }}
              onBlur={() => {
                setInput(false);
              }}
              size="small"
              sx={{ flex: 1, mr: '1rem', '& .MuiInputBase-input': { p: '0' } }}
              placeholder="Please enter task id"
              value={searchTask}
              onKeyDown={searchTaskKeyDown}
              inputProps={{ 'aria-label': 'Please enter task id' }}
              onChange={(event) => {
                setSearchTask(event.target.value);
              }}
            />
            {searchTask ? (
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
            )}
            {/* <Button
                variant="contained"
                id="submit-button"
                size="small"
                sx={{
                  borderRadius: '4px',
                  backgroundColor: 'var(--button-color)',
                  ':hover': { backgroundColor: 'var(--save-hover-corlor)', borderColor: 'var(--save-hover-corlor)' },
                }}
                onClick={searchTaskJob}
              >
                find
              </Button> */}
            <Tooltip title="Search by URL">
              <IconButton aria-label="menu" onClick={handleSearch}>
                <Box component="img" className={styles.clusterIcon} src="/icons/job/task/search.svg" />
              </IconButton>
            </Tooltip>
          </Paper>
          {/* <Button
            size="small"
            sx={{ borderRadius: '0', ml: '1rem', textTransform: 'none' }}
            variant="outlined"
            onClick={handleSearch}
          >
            <Typography variant="subtitle2">Advanced search</Typography>
          </Button> */}
        </Box>
      ) : (
        <Box>
          <Paper variant="outlined" component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" m="1rem" fontFamily="mabry-bold">
              Advanced Search
            </Typography>
            <Box className={styles.formWrapper}>
              {formList.map((item) => {
                return (
                  <Box key={item.formProps.id} className={styles.filterInput}>
                    {item.id === 'filteredQueryParams' ? (
                      <Autocomplete
                        freeSolo
                        multiple
                        disableClearable
                        {...item.filterFormProps}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            // className={styles.filterInput}
                            {...params}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {params.InputProps.endAdornment}
                                  <Tooltip
                                    title={
                                      'By setting the filter parameter, you can specify the file type of the resource that needs to be preheated. The filter is used to generate a unique preheat task and filter unnecessary query parameters in the URL, separated by & characters.'
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
                                </>
                              ),
                            }}
                            color="success"
                            {...item.formProps}
                          />
                        )}
                      />
                    ) : item.id === 'url' ? (
                      <TextField fullWidth color="success" size="small" {...item.formProps} />
                    ) : (
                      <TextField fullWidth color="success" size="small" {...item.formProps} />
                    )}
                  </Box>
                );
              })}
            </Box>
            <Divider />
            <Box sx={{ m: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              {/* <LoadingButton
                  loading={loadingButton}
                  endIcon={<SearchIcon />}
                  size="small"
                  variant="outlined"
                  type="submit"
                  loadingPosition="end"
                  id="search"
                  sx={{
                    '&.MuiLoadingButton-root': {
                      backgroundColor: 'var(--save-color)',
                      borderRadius: 0,
                      color: 'var(--save-size-color)',
                      borderColor: 'var(--save-color)',
                    },
                    ':hover': {
                      backgroundColor: 'var(--save-hover-corlor)',
                      borderColor: 'var(--save-hover-corlor)',
                    },
                    '&.MuiLoadingButton-loading': {
                      backgroundColor: 'var(--button-loading-color)',
                      color: 'var(--button-loading-size-color)',
                      borderColor: 'var(--button-loading-color)',
                    },
                    // width: '7rem',
                  }}
                >
                  find
                </LoadingButton> */}

              <Box>
                <CancelLoadingButton id="cancel" loading={loadingButton} onClick={handleSearch} />
                <SavelLoadingButton loading={loadingButton} endIcon={<SearchIcon />} id="save" text="search" />
              </Box>
            </Box>
          </Paper>
          {/* <Box display="flex" justifyContent="flex-end">
              <Button
                size="small"
                sx={{ borderRadius: '0', mt: '1rem', textTransform: 'none' }}
                variant="text"
                onClick={handleSearch}
              >
                <Typography variant="subtitle2">Advanced search</Typography>
              </Button>
            </Box> */}
        </Box>
      )}
      {isLoading ? (
        <Box sx={{ mt: '4rem' }}>
          <SearchTaskAnimation />
        </Box>
      ) : task && task?.type === 'get_task' ? (
        <Box sx={{ width: '100%', typography: 'body1', mt: '1rem' }}>
          {filteredResults && filteredResults?.length > 0 ? (
            <>
              {filteredResults.map((peer: any) => {
                return (
                  <>
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '1rem' }} />}
                        aria-controls="panel1d-content"
                        id="panel1d-header"
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* <Box component="img" className={styles.clusterIcon} src="/icons/cluster/cluster.svg" /> */}
                            <Typography variant="subtitle1" m="0 0.6rem" fontFamily="mabry-bold">
                              Scheduler Cluster
                            </Typography>
                            {isLoading ? (
                              <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                            ) : (
                              <Box
                                sx={{
                                  ml: '0.6rem',
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
                            )}
                          </Box>

                          <Button
                            size="small"
                            sx={{ background: 'var(--button-color)', borderRadius: '0' }}
                            variant="contained"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSchedulerClusterID(peer?.scheduler_cluster_id);
                              setOpenClearClear(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
                            delete
                          </Button>
                          {/* <IconButton
                            className={styles.buttonContent}
                            sx={{
                              '&.MuiButton-root': {
                                backgroundColor: '#fff',
                              },
                              p: 0,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSchedulerClusterID(peer?.scheduler_cluster_id);
                              setOpenClearClear(true);
                            }}
                          >
                            <DeleteIcon fontSize="large" sx={{ color: 'var(--button-color)' }} />
                          </IconButton> */}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          {peer?.peers?.map((item: any, index: number) => {
                            return index !== peer?.peers.length - 1 ? (
                              <>
                                <Box sx={{ p: '1rem', display: 'flex', alignItems: 'center' }}>
                                  <Box width="50%" sx={{ display: 'flex', alignItems: 'center', pb: '0.4rem' }}>
                                    <Box
                                      sx={{
                                        mr: '0.6rem',
                                        // border: '1px solid #d5d2d2',
                                        p: '0.3rem',
                                        borderRadius: '0.4rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        backgroundColor: 'var(--button-color)',
                                      }}
                                    >
                                      <Box
                                        component="img"
                                        className={styles.hostname}
                                        src="/icons/job/task/hostname.svg"
                                      />
                                    </Box>
                                    <Box>
                                      {isLoading ? (
                                        <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                      ) : (
                                        <Tooltip title={item?.hostname || '-'} placement="top">
                                          <Typography variant="body1" fontFamily="mabry-bold" mr="1rem">
                                            {item?.hostname}
                                          </Typography>
                                        </Tooltip>
                                      )}
                                      {isLoading ? (
                                        <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                      ) : (
                                        <Tooltip title={item?.id || '-'} placement="top">
                                          <Typography
                                            variant="body2"
                                            component="div"
                                            className={styles.locationContent}
                                          >
                                            {item?.id || '-'}
                                          </Typography>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </Box>
                                  <Box width="20%" className={styles.ipWrapper}>
                                    <Box className={styles.ipContainer}>
                                      <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                                      {isLoading ? (
                                        <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                      ) : (
                                        <Typography
                                          variant="subtitle2"
                                          component="div"
                                          className={styles.locationContent}
                                        >
                                          {item?.ip || '-'}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                  <Box width="10%" className={styles.ipWrapper}>
                                    {isLoading ? (
                                      <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                    ) : (
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
                                    )}
                                  </Box>
                                  <Box width="20%" display="flex" alignItems="flex-end" justifyContent="flex-end">
                                    <Chip
                                      avatar={<MoreTimeIcon />}
                                      label={getBJTDatetime(item?.created_at || '')}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Box>
                                </Box>
                                <Divider />
                              </>
                            ) : (
                              <Box sx={{ p: '1rem', display: 'flex', alignItems: 'center' }}>
                                <Box width="50%" sx={{ display: 'flex', alignItems: 'center', pb: '0.4rem' }}>
                                  <Box
                                    sx={{
                                      mr: '0.6rem',
                                      // border: '1px solid #d5d2d2',
                                      p: '0.4rem',
                                      borderRadius: '0.4rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      backgroundColor: 'var(--button-color)',
                                    }}
                                  >
                                    <Box
                                      component="img"
                                      className={styles.hostname}
                                      src="/icons/job/task/hostname.svg"
                                    />
                                  </Box>
                                  <Box>
                                    {isLoading ? (
                                      <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                    ) : (
                                      <Tooltip title={item?.hostname || '-'} placement="top">
                                        <Typography variant="body1" fontFamily="mabry-bold" mr="1rem">
                                          {item?.hostname}
                                        </Typography>
                                      </Tooltip>
                                    )}
                                    {isLoading ? (
                                      <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                    ) : (
                                      <Tooltip title={item?.id || '-'} placement="top">
                                        <Typography variant="body2" component="div" className={styles.locationContent}>
                                          {item?.id || '-'}
                                        </Typography>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Box>
                                <Box width="20%" className={styles.ipWrapper}>
                                  <Box className={styles.ipContainer}>
                                    <Box component="img" className={styles.ipIcon} src="/icons/cluster/ip.svg" />
                                    {isLoading ? (
                                      <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                    ) : (
                                      <Typography
                                        variant="subtitle2"
                                        component="div"
                                        className={styles.locationContent}
                                      >
                                        {item?.ip || '-'}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Box width="10%" className={styles.ipWrapper}>
                                  {isLoading ? (
                                    <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                  ) : (
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
                                  )}
                                </Box>
                                <Box width="20%" display="flex" alignItems="flex-end" justifyContent="flex-end">
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
                      </AccordionDetails>
                    </Accordion>
                  </>
                );
              })}
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '6rem' }}>
              <Box component="img" sx={{ width: '4rem', mb: '3rem' }} src="/icons/job/task/no-search.svg" />
              <Box>
                <Typography variant="h5" component="span">
                  No results for&nbsp;
                </Typography>
                <Typography variant="h5" component="span" fontFamily="mabry-bold">
                  "{noTask}"
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
        open={openClearClear}
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
            id="deleteAllInactive"
            name="deleteAllInactive"
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
              onClick={handleClearCache}
              text="Delete"
            />
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
