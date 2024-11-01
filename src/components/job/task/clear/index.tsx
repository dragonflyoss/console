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
  Menu,
  InputAdornment,
  toggleButtonGroupClasses,
} from '@mui/material';
import styles from './index.module.css';
import { MouseEvent, SetStateAction, useEffect, useRef, useState } from 'react';
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
import _, { values } from 'lodash';
import SearchTaskAnimation from '../../../search-task-animation';
import { useNavigate } from 'react-router-dom';
import { CancelLoadingButton, SavelLoadingButton } from '../../../loading-button';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import SearchCircularProgress from '../../../circular-progress';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';

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
  const [applicationError, setApplicationError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [filter, setFilter] = useState([]);
  const [filterHelperText, setFilterHelperText] = useState('Fill in the characters, the length is 0-100.');
  const [search, setSearch] = useState<string | null>('url');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchID, setSearchID] = useState(0);
  // const [tag, setTag] = useState('');
  // const [application, setApplication] = useState('');

  const [searchData, setSearchDada] = useState({ url: '', tag: '', application: '', filtered_query_params: '' });

  const { url, tag, application, filtered_query_params } = searchData;
  const open = Boolean(anchorEl);
  const handleClick = (event: { currentTarget: SetStateAction<HTMLElement | null> }) => {
    setAnchorEl(event.currentTarget);
    // console.log(event.currentTarget);
  };

  const query = useQuery();
  const page = parseInt(query.get('id') as string, 10);

  const navigate = useNavigate();

  // console.log(data);

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

  useEffect(() => {
    (async function () {
      try {
        if (searchID) {
          const job = await getTaskJob(searchID);

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
  }, [searchID]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollPreheat = async () => {
          try {
            const job = await getTaskJob(searchID);

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
              setIsLoading(false);
            }
          }
        };

        pollPreheat();
      }, 30000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [shouldPoll, searchID]);

  const searchTaskJob = async () => {
    try {
      if (searchTask !== '') {
        setIsLoading(true);
        setNOTask(searchTask);
        const data = {
          args: {
            task_id: searchTask,
          },
          type: 'get_task',
        };
        const task = await createTaskJob(data);
        // navigate(`/jobs/task/clear${task?.id ? `?id=${task?.id}` : ''}`);

        setSearchID(task?.id);
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

  const urlData = {
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
          <IconButton
            type="button"
            sx={{ p: 0 }}
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
        changeValidate(e.target.value, urlData);
        setSearchDada({ ...searchData, url: e.target.value });
      },
    },
    syncError: false,
    setError: setUrlError,

    validate: (value: string) => {
      const reg = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s].{1,10000}$/;
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
              'When the URL of the tasks are the same but the Tag are different, they will be distinguished based on the Tag and the generated preheat tasks will be different.'
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
          // setTag(e.target.value);
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
          // setApplication(e.target.value);
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
            // setFilter(newValue);
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

  const filteredResults =
    task && task.result.job_states.flatMap((job: any) => job.results).filter((result: { peers: any }) => result.peers);

  const handleClearCache = async () => {
    try {
      if (schedulerClusterID) {
        if (task?.args?.url !== '') {
          const formList = {
            args: {
              url: task?.args?.url,
              tag: task?.args?.tag,
              application: task?.args?.application,
              filtered_query_params: task?.args?.filtered_query_params,
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
        } else {
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
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setIsLoading(false);
      }
    }
  };

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const url = event.currentTarget.elements.url.value;
    const tag = event.currentTarget.elements.tag.value;
    const application = event.currentTarget.elements.application.value;
    const filterText = event.currentTarget.elements.filteredQueryParams.value;
    // const filters = searchData.filtered_query_params.join('&');

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

    const urlValue = data.get(urlData.formProps.name);

    urlData.setError(!urlData.validate(urlValue as string));

    urlData.syncError = !urlData.validate(urlValue as string);

    const canSubmit = Boolean(
      !formList.filter((item) => item.syncError).length && Boolean(!filterText) && !urlData.syncError,
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
      try {
        const task = await taskJob({ ...formDate });
        setLoadingButton(false);
        // navigate(`/jobs/task/clear${task?.id ? `?id=${task?.id}` : ''}`);
        setSearchID(task?.id);
        setInput(false);
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

  const searchTaskKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const submitButton = document.getElementById('submit-button');
      // submitButton?.click();
      searchTaskJob();
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenClearAllClear(false);
    setOpenClearClear(false);
    setErrorMessage(false);
    setAnchorEl(null);
  };

  const handleCloseSearch = () => {
    setInput(false);
    setSearchDada({ url: '', tag: '', application: '', filtered_query_params: '' });
  };

  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment) {
      setSearch(newAlignment);
    }
    setInput(false);
    setSearchTask('');
    setSearchDada({ url: '', tag: '', application: '', filtered_query_params: '' });
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
        // elevation={0}
        variant="outlined"
        sx={(theme) => ({
          display: 'inline-flex',
          // border: `1px solid #BEBCBC`,
          flexWrap: 'wrap',
          mb: '2rem',
          backgroundColor: '#EEEEEE',
        })}
      >
        <StyledToggleButtonGroup
          size="small"
          // color="success"
          value={search}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton
            value="url"
            size="small"
            sx={{
              // textTransform: 'none',
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
            {/* <Box component="img" className={styles.toggleButtonIcon} src="/icons/job/task/url.svg" /> */}
            {/* <Typography variant="body2" ml="0.4rem" component="span">
            
            </Typography> */}
            Search by URL
          </ToggleButton>
          <ToggleButton
            value="task-id"
            size="small"
            sx={{
              // textTransform: 'none',
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
              // ':hover': {
              //   background: 'var(--button-color)',
              //   color: '#FFF',
              // },
            }}
          >
            <AssignmentOutlinedIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            {/* <Box component="img" className={styles.toggleButtonIcon} src="/icons/job/task/task-id.svg" /> */}
            {/* <Typography variant="body2" ml="0.4rem" component="span">
            
            </Typography> */}
            Search by task id
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Paper>
      {search === 'task-id' ? (
        <Box component="form" onSubmit={searchTaskJob} sx={{ width: '38rem', height: '3rem' }}>
          {/* <Paper
            component="form"
            variant="outlined"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              width: '38rem',
              borderColor: input ? 'var(--button-color)' : '',
              ':hover': { borderColor: 'var(--button-color)' },
            }}
          >
            {isLoading ? (
              <Box sx={{ m: '0.5rem' }}>
                <SearchCircularProgress />
              </Box>
            ) : (
              <SearchIcon sx={{ m: '0.5rem', color: '#9BA0A6' }} />
            )}
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
              <>
                <IconButton
                  type="button"
                  aria-label="search"
                  onClick={() => {
                    setSearchTask('');
                  }}
                >
                  <ClearIcon />
                </IconButton>
                <Box sx={{ m: '0 0.3rem', backgroundColor: '#d7d7d7', height: '1.5rem', width: '0.08rem' }} />
              </>
            ) : (
              <></>
            )}
          </Paper> */}

          <TextField
            fullWidth
            id="task-id"
            name="task-id"
            label="Task ID"
            size="small"
            required
            sx={{ pr: 0 }}
            placeholder="Please enter task id"
            InputProps={{
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
            }}
            value={searchTask}
            onKeyDown={searchTaskKeyDown}
            inputProps={{ 'aria-label': 'Please enter URL' }}
            // onFocus={(e) => {
            //   setInput(true);
            //   // setAnchorEl(e.currentTarget);
            // }}
            onChange={(event) => {
              setSearchTask(event.target.value);
            }}
          />
        </Box>
      ) : (
        <>
          <Box sx={{ position: 'relative', height: '3rem' }}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={input ? 3 : 0}
              // variant={input ? 'outlined' : undefined}
              sx={{
                p: input ? '1rem' : '',
                // display: 'flex',
                // alignItems: 'center',
                borderRadius: '4px',
                width: input ? '45rem' : '36rem',
                // borderColor: input ? 'var(--button-color)' : '',
                // ':hover': { borderColor: 'var(--button-color)' },
                position: 'absolute',
                // right: '0',
              }}
            >
              <TextField
                {...urlData.formProps}
                fullWidth
                size="small"
                // id="url"
                // name="url"
                // label="Search"
                // // sx={{ '&.MuiTextField-root': { p: '1rem' } }}
                // placeholder="Please enter URL"
                // value={searchTask}
                // onKeyDown={searchTaskKeyDown}
                onFocus={(e) => {
                  setInput(true);
                }}
                // onChange={(event) => {
                //   setSearchTask(event.target.value);
                // }}
              />

              {/* <Paper
                variant="outlined"
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  // borderColor: input ? 'var(--button-color)' : '',
                }}
              >
                {isLoading ? (
                  <Box sx={{ m: '0.5rem' }}>
                    <SearchCircularProgress />
                  </Box>
                ) : (
                  <SearchIcon sx={{ m: '0.5rem', color: '#9BA0A6' }} />
                )}
                <InputBase
                  onFocus={(e) => {
                    setInput(true);
                    // setAnchorEl(e.currentTarget);
                    console.log(input);
                  }}
                  // onClick={handleClick}
                  size="small"
                  sx={{ flex: 1, mr: '1rem', '& .MuiInputBase-input': { p: '0' } }}
                  placeholder="Please enter URL"
                  value={searchTask}
                  onKeyDown={searchTaskKeyDown}
                  inputProps={{ 'aria-label': 'Please enter URL' }}
                  onChange={(event) => {
                    setSearchTask(event.target.value);
                  }}
                />
                {searchTask ? (
                  <>
                    <IconButton
                      type="button"
                      aria-label="search"
                      onClick={() => {
                        setSearchTask('');
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </>
                ) : (
                  <></>
                )}
              </Paper> */}
              {input ? (
                <>
                  {/* <Divider sx={{ m: '1rem 0' }} /> */}
                  <Divider sx={{ m: '1rem 0' }} />
                  <Typography variant="subtitle1" fontFamily="mabry-bold" component="div">
                    Optional
                  </Typography>
                  <Paper elevation={0} sx={{ top: '2rem', backgroundColor: '#FFF' }}>
                    <Box className={styles.filterContainer}>
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
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    // InputProps={{
                                    //   ...params.InputProps,
                                    //   endAdornment: <>{params.InputProps.endAdornment}</>,
                                    // }}
                                    margin="normal"
                                    {...item.formProps}
                                  />
                                )}
                              />
                            ) : (
                              <TextField
                                margin="normal"
                                // fullWidth
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
                      <CancelLoadingButton
                        id="cancelDeleteCluster"
                        loading={deleteLoadingButton}
                        onClick={handleCloseSearch}
                      />
                      <SavelLoadingButton
                        loading={deleteLoadingButton}
                        endIcon={<SearchIcon />}
                        id="deleteTask"
                        // onClick={handleSubmit}
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
          {/* <Paper elevation={0} component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Box display="flex">
                <Box className={styles.filterContainer}>
                  {formList.map((item) => {
                    return (
                      <Box key={item.formProps.id} className={styles.filterInput}>
                        {item.id === 'filteredQueryParams' ? (
                          <Autocomplete
                            freeSolo
                            multiple
                            disableClearable
                            size="small"
                            {...item.filterFormProps}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                sx={{ '& .MuiAutocomplete-input': { pl: '0 !important' } }}
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
                <Box className={styles.filterButtonWrapper}>
                  <Button
                    variant="outlined"
                    endIcon={<RestartAltIcon />}
                    size="small"
                    id="next-button"
                    // onClick={handleNext}

                    sx={{
                      '&.MuiButton-root': {
                        color: 'var(--calcel-size-color)',
                        borderRadius: 0,
                        borderColor: 'var(--calcel-color)',
                      },
                      width: '7rem',
                      mr: '1rem',
                    }}
                  >
                    reset
                  </Button>

                  <SavelLoadingButton loading={isLoading} endIcon={<SearchIcon />} id="save" text="search" />
                </Box>
              </Box>
            </Paper> */}
        </>
      )}
      {isLoading ? (
        <Box sx={{ mt: '4rem' }}>
          <SearchTaskAnimation />
        </Box>
      ) : task && task?.type === 'get_task' ? (
        <Box sx={{ width: '100%', typography: 'body1', mt: '2rem' }}>
          <Typography variant="h6" m="1rem 0" fontFamily="mabry-bold">
            Cache
          </Typography>
          {filteredResults && filteredResults?.length > 0 ? (
            <>
              {filteredResults.map((peer: any) => {
                return (
                  <Paper elevation={3} sx={{ mb: '3rem' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        // width: '100%',
                        p: '1rem',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <Box component="img" className={styles.clusterIcon} src="/icons/cluster/cluster.svg" /> */}
                        <Typography variant="subtitle1" mr="0.6rem" fontFamily="mabry-bold">
                          Scheduler Cluster
                        </Typography>
                        {isLoading ? (
                          <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                        ) : (
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
                    </Box>
                    <Divider />
                    <Box>
                      <Box sx={{ p: '1rem 0.8rem', display: 'flex', alignItems: 'center', backgroundColor: '#f6f6f6' }}>
                        <Box width="20%" sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* <Box component="img" className={styles.hostname} src="/icons/job/task/hostname.svg" /> */}
                          <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                            Hostname
                          </Typography>
                        </Box>
                        <Box width="35%" sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* <Box component="img" className={styles.hostname} src="/icons/job/task/id.svg" /> */}
                          <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                            ID
                          </Typography>
                        </Box>
                        <Box width="15%" sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* <Box component="img" className={styles.hostname} src="/icons/job/task/ip.svg" /> */}
                          <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                            IP
                          </Typography>
                        </Box>
                        <Box width="15%" sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* <Box component="img" className={styles.hostname} src="/icons/job/task/host-type.svg" /> */}
                          <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                            Host type
                          </Typography>
                        </Box>
                        <Box width="15%" sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* <Box component="img" className={styles.hostname} src="/icons/job/task/created.svg" /> */}
                          <Typography variant="body2" fontFamily="mabry-bold" className={styles.hostnameTitle}>
                            Created at
                          </Typography>
                        </Box>
                      </Box>
                      <Divider />
                      {peer?.peers?.map((item: any, index: number) => {
                        return index !== peer?.peers.length - 1 ? (
                          <>
                            <Box sx={{ p: '1rem', display: 'flex', alignItems: 'center' }}>
                              <Box width="20%" sx={{ display: 'flex', alignItems: 'center', pb: '0.4rem' }}>
                                <Box>
                                  {isLoading ? (
                                    <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                  ) : (
                                    <Tooltip title={item?.hostname || '-'} placement="top">
                                      <Typography variant="body1">{item?.hostname}</Typography>
                                    </Tooltip>
                                  )}
                                </Box>
                              </Box>
                              <Box width="35%">
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
                              <Box width="15%">
                                <Box className={styles.ipContainer}>
                                  {isLoading ? (
                                    <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                  ) : (
                                    <Typography variant="subtitle2" component="div">
                                      {item?.ip || '-'}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box width="15%">
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
                              <Box width="15%">
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
                            <Box width="20%" sx={{ display: 'flex', alignItems: 'center', pb: '0.4rem' }}>
                              <Box>
                                {isLoading ? (
                                  <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                ) : (
                                  <Tooltip title={item?.hostname || '-'} placement="top">
                                    <Typography variant="body1" mr="1rem">
                                      {item?.hostname}
                                    </Typography>
                                  </Tooltip>
                                )}
                              </Box>
                            </Box>
                            <Box width="35%">
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
                            <Box width="15%">
                              <Box className={styles.ipContainer}>
                                {isLoading ? (
                                  <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                                ) : (
                                  <Typography variant="subtitle2" component="div">
                                    {item?.ip || '-'}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Box width="15%">
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
                                      item?.host_type === 'super' ? 'var( --description-color)' : 'var(--button-color)',
                                    color: item?.host_type === 'super' ? '#FFFFFF' : '#FFFFFF',
                                    borderColor:
                                      item?.host_type === 'super' ? 'var( --description-color)' : 'var(--button-color)',
                                    fontWeight: 'bold',
                                  }}
                                />
                              )}
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
          <Box onSubmit={handleClearCache}>
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
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
