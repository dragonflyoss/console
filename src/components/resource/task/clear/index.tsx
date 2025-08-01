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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import styles from './index.module.css';
import { useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  getTaskJobResponse,
  createTaskJob,
  getTaskJob,
  createGetImageDistributionJob,
  createGetImageDistributionJobResponse,
} from '../../../../lib/api';
import { extractSHA256Regex, getDatetime, getPaginatedList } from '../../../../lib/utils';
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
import { ReactComponent as SchedulerCluster } from '../../../../assets/images/resource/task/scheduler-cluster.svg';
import { ReactComponent as NoSearch } from '../../../../assets/images/resource/task/no-search.svg';
import { ReactComponent as NoTask } from '../../../../assets/images/resource/task/no-task.svg';
import { ReactComponent as DarkNoTask } from '../../../../assets/images/resource/task/dark-no-task.svg';
import { ReactComponent as Delete } from '../../../../assets/images/cluster/delete.svg';
import { ReactComponent as DeleteWarning } from '../../../../assets/images/cluster/delete-warning.svg';
import { ReactComponent as ContentForCalculatingTaskID } from '../../../../assets/images/resource/task/content-for-calculating-task-id.svg';
import { ReactComponent as ImageManifest } from '../../../../assets/images/resource/task/image-manifest.svg';
import { ReactComponent as IP } from '../../../../assets/images/resource/task/clear-ip.svg';
import { ReactComponent as Hostnames } from '../../../../assets/images/resource/task/clear-hostname.svg';
import { ReactComponent as Proportion } from '../../../../assets/images/resource/task/proportion.svg';

import { ReactComponent as Layer } from '../../../../assets/images/resource/task/layer.svg';
import ErrorHandler from '../../../error-handler';

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

type Layers = {
  url: string;
};

type Image = {
  layers: Layers[];
};

type OriginalPeer = {
  ip: string;
  hostname: string;
  layers: Layers[];
  scheduler_cluster_id?: number;
};

type ClusteredPeer = {
  peer: Omit<OriginalPeer, 'scheduler_cluster_id'>[];
  scheduler_cluster_id: number;
};

type TransformedImage = {
  peers: ClusteredPeer[];
  image: Image;
};

const transformImages = (images: createGetImageDistributionJobResponse): TransformedImage => {
  const clusters = new Map<number, Omit<OriginalPeer, 'scheduler_cluster_id'>[]>();

  for (const peer of images.peers || []) {
    const clusterId = peer.scheduler_cluster_id ?? 1;

    if (!clusters.has(clusterId)) {
      clusters.set(clusterId, []);
    }

    const cleanedPeer = {
      ip: peer.ip,
      hostname: peer.hostname,
      layers: peer.layers,
    };

    clusters.get(clusterId)!.push(cleanedPeer);
  }

  const resultPeers: ClusteredPeer[] = Array.from(clusters.entries()).map(([id, peers]) => ({
    peer: peers,
    scheduler_cluster_id: id,
  }));

  return { peers: resultPeers, image: images.image };
};

export default function Clear() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTaskISLodaing, setSearchTaskISLodaing] = useState(false);
  const [searchContentForCalculatingTaskIDISLodaing, setSearchContentForCalculatingTaskIDISLodaing] = useState(false);
  const [searchImageManifestISLodaing, setSearchImageManifestISLodaing] = useState(false);
  const [searchIconISLodaing, setSearchIconISLodaing] = useState(false);
  const [openDeleteTask, setOpenDeleteTask] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [searchTask, setSearchTask] = useState('');
  const [searchContentForCalculatingTaskID, setSearchContentForCalculatingTaskID] = useState('');
  const [searchImageManifest, setSearchImageManifest] = useState('');
  const [task, setTask] = useState<getTaskJobResponse | any>();
  const [optional, setOptional] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [schedulerClusterID, setSchedulerClusterID] = useState(0);
  const [urlError, setUrlError] = useState(false);
  const [taskIDError, setTaskIDError] = useState(false);
  const [contentForCalculatingTaskIDError, setContentForCalculatingTaskIDError] = useState(false);
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
  const [imageManifestURL, setImageManifestURL] = useState<TransformedImage>();
  const [layer, setLayer] = useState(0);
  const [pageStates, setPageStates] = useState<any>({});

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
              setSearchContentForCalculatingTaskIDISLodaing(false);

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
          setSearchContentForCalculatingTaskIDISLodaing(false);
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
              setSearchContentForCalculatingTaskIDISLodaing(false);
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
              setShouldPoll(false);
              setIsLoading(false);
              setSearchIconISLodaing(false);
              setSearchTaskISLodaing(false);
              setSearchContentForCalculatingTaskIDISLodaing(false);
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

  const urlForm = [
    {
      formProps: {
        id: 'pieceLength',
        labels: 'Piece Length',
        name: 'pieceLength',
        autoComplete: 'family-name',
        placeholder: 'Piece Length',
        helperText: pieceLengthError ? 'Please enter a value between 4 and 1024 MiB.' : '',
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
          changeValidate(e.target.value, urlForm[0]);
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
        helperText: tagError ? 'Fill in the characters, the length is 0-400.' : '',
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
          changeValidate(e.target.value, urlForm[1]);
          setSearchDada({ ...searchData, tag: e.target.value });
        },
      },
      syncError: false,
      setError: setTagError,

      validate: (value: string) => {
        const reg = /^.{0,400}$/;
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
        helperText: applicationError ? 'Fill in the characters, the length is 0-400.' : '',
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
          changeValidate(e.target.value, urlForm[2]);
          setSearchDada({ ...searchData, application: e.target.value });
        },
      },
      syncError: false,
      setError: setApplicationError,

      validate: (value: string) => {
        const reg = /^.{0,400}$/;
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
          if (!urlForm[3].formProps.error) {
            setSearchDada({ ...searchData, filtered_query_params: newValue.join('&') });
          }
        },

        onInputChange: (e: any) => {
          setFilterHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, urlForm[3]);
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

  const taskIDForm = {
    formProps: {
      id: 'task-id',
      label: 'Task ID',
      name: 'task-id',
      required: true,
      value: searchTask,
      autoComplete: 'family-name',
      placeholder: 'Enter your task id',
      helperText: taskIDError ? 'Fill in the characters, the length is 0-400.' : '',
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
              setSearchTaskISLodaing(false);
            }}
          >
            <ClearIcon />
          </IconButton>
        ) : (
          <></>
        ),
      },

      onChange: (e: any) => {
        changeValidate(e.target.value, taskIDForm);
        setSearchTask(e.target.value);

        if (e.target.value === '') {
          setSearchTaskISLodaing(false);
        }
      },
    },
    syncError: false,
    setError: setTaskIDError,

    validate: (value: string) => {
      const reg = /^.{0,400}$/;
      return reg.test(value);
    },
  };

  const calculatingTaskIDForm = {
    formProps: {
      id: 'content-for-calculating-task-id',
      label: 'Content for Calculating Task ID',
      name: 'content-for-calculating-task-id',
      required: true,
      value: searchContentForCalculatingTaskID,
      autoComplete: 'family-name',
      placeholder: 'Enter your content for calculating task id',
      helperText: contentForCalculatingTaskIDError ? 'Fill in the characters, the length is 0-400.' : '',
      error: contentForCalculatingTaskIDError,
      InputProps: {
        startAdornment: searchContentForCalculatingTaskIDISLodaing ? (
          <Box className={styles.circularProgress}>
            <SearchCircularProgress />
          </Box>
        ) : (
          <Box className={styles.circularProgress}>
            <SearchIcon sx={{ color: '#9BA0A6' }} />
          </Box>
        ),
        endAdornment: searchContentForCalculatingTaskID ? (
          <IconButton
            type="button"
            aria-label="search"
            onClick={() => {
              setSearchContentForCalculatingTaskID('');
              setSearchContentForCalculatingTaskIDISLodaing(false);
            }}
          >
            <ClearIcon />
          </IconButton>
        ) : (
          <></>
        ),
      },

      onChange: (e: any) => {
        changeValidate(e.target.value, calculatingTaskIDForm);
        setSearchContentForCalculatingTaskID(e.target.value);

        if (e.target.value === '') {
          setSearchContentForCalculatingTaskIDISLodaing(false);
        }
      },
    },
    syncError: false,
    setError: setContentForCalculatingTaskIDError,

    validate: (value: string) => {
      const reg = /^.{0,400}$/;
      return reg.test(value);
    },
  };

  const imageManifestForm = {
    formProps: {
      id: 'image-manifest-url',
      label: 'Image Manifest URL',
      name: 'image-manifest-url',
      required: true,
      value: searchImageManifest,
      autoComplete: 'family-name',
      placeholder: 'Enter your image manifest URL',
      helperText: contentForCalculatingTaskIDError ? 'Fill in the characters, the length is 1-400.' : '',
      error: contentForCalculatingTaskIDError,
      InputProps: {
        startAdornment: searchImageManifestISLodaing ? (
          <Box className={styles.circularProgress}>
            <SearchCircularProgress />
          </Box>
        ) : (
          <Box className={styles.circularProgress}>
            <SearchIcon sx={{ color: '#9BA0A6' }} />
          </Box>
        ),
        endAdornment: searchImageManifest ? (
          <IconButton
            type="button"
            aria-label="search"
            onClick={() => {
              setSearchImageManifest('');
              setSearchImageManifestISLodaing(false);
            }}
          >
            <ClearIcon />
          </IconButton>
        ) : (
          <></>
        ),
      },

      onChange: (e: any) => {
        changeValidate(e.target.value, imageManifestForm);
        setSearchImageManifest(e.target.value);

        if (e.target.value === '') {
          setSearchImageManifestISLodaing(false);
        }
      },
    },
    syncError: false,
    setError: setContentForCalculatingTaskIDError,

    validate: (value: string) => {
      const reg = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s].{1,400}$/;
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
            const urlForm = {
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

            const tasks = await createTaskJob(urlForm);

            if (tasks?.id) {
              setDeleteLoadingButton(false);
              navigate(`/resource/task/executions/${tasks?.id}`);
              setOpenDeleteTask(false);
            }
          } else if (task?.args?.task_id) {
            const urlForm = {
              args: {
                task_id: task?.args?.task_id,
              },
              scheduler_cluster_ids: [schedulerClusterID],
              type: 'delete_task',
            };

            const tasks = await createTaskJob(urlForm);
            if (tasks?.id) {
              setDeleteLoadingButton(false);
              navigate(`/resource/task/executions/${tasks?.id}`);
              setOpenDeleteTask(false);
            }
          } else if (task?.args?.content_for_calculating_task_id) {
            const urlForm = {
              args: {
                content_for_calculating_task_id: task?.args?.content_for_calculating_task_id,
              },
              scheduler_cluster_ids: [schedulerClusterID],
              type: 'delete_task',
            };

            const tasks = await createTaskJob(urlForm);
            if (tasks?.id) {
              setDeleteLoadingButton(false);
              navigate(`/resource/task/executions/${tasks?.id}`);
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

      const taskIDValue = data.get(taskIDForm.formProps.name);
      taskIDForm.setError(!taskIDForm.validate(taskIDValue as string));
      taskIDForm.syncError = !taskIDForm.validate(taskIDValue as string);

      if (searchTask !== '' && !taskIDForm.syncError) {
        const data = {
          args: {
            task_id: searchTask,
          },
          type: 'get_task',
        };

        const task = await createTaskJob(data);
        setSearchID(task?.id);
      } else {
        navigate('/resource/task/clear');
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

    urlForm.forEach((item) => {
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

    urlForm.forEach((item) => {
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
      !urlForm.filter((item) => item.syncError).length && Boolean(!filterText) && !urlList.syncError,
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

  const handleSearchBySearchContentForCalculatingTaskID = async (event: any) => {
    setIsLoading(true);
    setSearchContentForCalculatingTaskIDISLodaing(true);
    setSearchIconISLodaing(false);
    try {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      const taskIDValue = data.get(calculatingTaskIDForm.formProps.name);
      calculatingTaskIDForm.setError(!calculatingTaskIDForm.validate(taskIDValue as string));
      calculatingTaskIDForm.syncError = !calculatingTaskIDForm.validate(taskIDValue as string);

      if (searchContentForCalculatingTaskID !== '' && !calculatingTaskIDForm.syncError) {
        const data = {
          args: {
            content_for_calculating_task_id: searchContentForCalculatingTaskID,
          },
          type: 'get_task',
        };

        const task = await createTaskJob(data);
        setSearchID(task?.id);
      } else {
        navigate('/resource/task/clear');
        setTask(null);
        setIsLoading(false);
        setSearchContentForCalculatingTaskIDISLodaing(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setIsLoading(false);
        setSearchContentForCalculatingTaskIDISLodaing(false);
      }
    }
  };

  const handleSearchByImageManifestURL = async (event: any) => {
    setIsLoading(true);
    setTask({});
    setSearchImageManifestISLodaing(true);

    try {
      event.preventDefault();

      const form = {
        args: {
          url: searchImageManifest,
        },
        type: 'get_image_distribution',
      };

      const imageManifest = await createGetImageDistributionJob(form);
      const imageManifestTask = transformImages(imageManifest);

      setImageManifestURL(imageManifestTask);
      setLayer(imageManifestTask?.image?.layers?.length || 0);
      setSearchImageManifestISLodaing(false);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setIsLoading(false);
        setSearchImageManifestISLodaing(false);
      }
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
    setSearchContentForCalculatingTaskID('');
    setSearchImageManifest('');
  };

  const handlePageChange = (peerId: any, newPage: any) => {
    setTaskPages((prevPages: any) => ({
      ...prevPages,
      [peerId]: newPage,
    }));
  };

  const handleImagePageChange = (schedulerClusterId: any, page: any) => {
    setPageStates((prev: any) => ({
      ...prev,
      [schedulerClusterId]: page,
    }));
  };

  return (
    <Box>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
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
              p: '0.3rem 0.5rem',
              color: 'var(--palette-dark-400Channel)',
              textTransform: 'none',
            }}
          >
            <LinkOutlinedIcon sx={{ mr: '0.4rem' }} />
            Search by URL
          </ToggleButton>
          <ToggleButton
            id="serach-image-manifest-url"
            value="image-manifest-url"
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
              p: '0.3rem 0.5rem',
              color: 'var(--palette-dark-400Channel)',
              textTransform: 'none',
            }}
          >
            <ImageManifest className={styles.contentForCalculatingTaskIDIcon} />
            Search by Image Manifest URL
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
              p: '0.3rem 0.5rem',
              color: 'var(--palette-dark-400Channel)',
              textTransform: 'none',
            }}
          >
            <AssignmentOutlinedIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            Search by Task ID
          </ToggleButton>
          <ToggleButton
            id="serach-content-for-calculating-task-id"
            value="content-for-calculating-task-id"
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
              p: '0.3rem 0.5rem',
              color: 'var(--palette-dark-400Channel)',
              textTransform: 'none',
            }}
          >
            <ContentForCalculatingTaskID className={styles.contentForCalculatingTaskIDIcon} />
            Search by Calculating Task ID
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Paper>
      {search === 'task-id' ? (
        <Box key="task-id" component="form" onSubmit={handleSearchByTaskID} sx={{ width: '38rem', height: '3rem' }}>
          <TextField fullWidth variant="outlined" size="small" {...taskIDForm.formProps} sx={{ p: 0 }} />
        </Box>
      ) : search === 'content-for-calculating-task-id' ? (
        <Box
          key="content-for-calculating-task-id"
          component="form"
          onSubmit={handleSearchBySearchContentForCalculatingTaskID}
          sx={{ width: '38rem', height: '3rem' }}
        >
          <TextField fullWidth variant="outlined" size="small" {...calculatingTaskIDForm.formProps} sx={{ p: 0 }} />
        </Box>
      ) : search === 'image-manifest-url' ? (
        <Box
          key="image-manifest-url"
          component="form"
          onSubmit={handleSearchByImageManifestURL}
          sx={{ width: '38rem', height: '3rem' }}
        >
          <TextField fullWidth variant="outlined" size="small" {...imageManifestForm.formProps} sx={{ p: 0 }} />
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
              <Box mt="1rem">
                <Box className={styles.optionalContainer}>
                  {urlForm.map((item) => {
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
                            sx={{ width: '10.8rem' }}
                            margin="normal"
                            size="small"
                            {...item.formProps}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="start">
                                  <Typography
                                    sx={{ fontFamily: 'mabry-bold', color: 'var(--palette-sidebar-menu-color)' }}
                                  >
                                    MiB
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
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
                  <SavelLoadingButton loading={loadingButton} endIcon={<SearchIcon />} id="searchByURL" text="search" />
                </Box>
              </Box>
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
                            <Box className={styles.schedulerClusterWrapper} id={`scheduler-id-${index}`}>
                              <SchedulerCluster className={styles.schedulerClusterIcon} />
                              <Typography
                                id="schedulerTotal"
                                variant="caption"
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
                            return (
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
                                    label={getDatetime(item?.created_at || '')}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Box>
                                {index !== currentPageData.length - 1 && <Divider />}
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
      ) : Array.isArray(imageManifestURL?.peers) ? (
        imageManifestURL?.peers.length > 0 ? (
          <Box>
            <Box className={styles.cacheHeader}>
              <Typography variant="h6" fontFamily="mabry-bold">
                Cache
              </Typography>
            </Box>
            <Box className={styles.bolbWrapper}>
              <Typography variant="body2" fontFamily="mabry-bold" component="div" pr="0.4rem">
                Blobs
              </Typography>
              <Typography
                id="blobs"
                variant="caption"
                fontFamily="mabry-bold"
                component="div"
                className={styles.bolbText}
              >
                {`Total: ${layer || 0}`}
              </Typography>
            </Box>
            {imageManifestURL?.peers.map((item, index) => {
              const schedulerClusterId = item.scheduler_cluster_id;
              const totalPage = Math.ceil(item.peer.length / 5);
              const currentPage = pageStates[schedulerClusterId] || 1;
              const paginatedPeers = getPaginatedList(item.peer, currentPage, 5);
              return (
                <Box mb="2rem" key={index}>
                  <Card key={index} className={styles.imageManifestCard}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: '1rem' }}>
                      <Typography variant="subtitle1" mr="0.6rem" fontFamily="mabry-bold">
                        Scheduler Cluster
                      </Typography>
                      <Box className={styles.schedulerClusterWrapper} id={`scheduler-id-${index}`}>
                        <SchedulerCluster className={styles.schedulerClusterIcon} />
                        <Typography
                          variant="caption"
                          fontFamily="mabry-bold"
                          component="div"
                          pl="0.3rem"
                          lineHeight="1rem"
                        >
                          ID&nbsp;:&nbsp; {item?.scheduler_cluster_id || '0'}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    {paginatedPeers?.map((items, peerIndex) => {
                      return (
                        <Box key={peerIndex}>
                          <Accordion
                            disableGutters
                            elevation={0}
                            square
                            sx={{
                              '&:not(:last-child)': {
                                borderBottom: 0,
                              },
                              '&:before': {
                                display: 'none',
                              },
                              backgroundColor: 'var(--palette-background-paper)',
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1-content"
                              id={`scheduler-${item?.scheduler_cluster_id}-url-${peerIndex}`}
                            >
                              <Box className={styles.imageManifestHeader}>
                                <Box className={styles.hostnameContainer}>
                                  <Box width="18%">
                                    <Box
                                      className={styles.hostnameWrapper}
                                      id={`scheduler-${item?.scheduler_cluster_id}-hostname-${peerIndex}`}
                                    >
                                      <Hostnames className={styles.hostnameIcon} />
                                      <Typography variant="subtitle2" ml="0.4rem" fontFamily="mabry-bold">
                                        {items?.hostname}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    className={styles.hostnameWrapper}
                                    id={`scheduler-${item?.scheduler_cluster_id}-ip-${peerIndex}`}
                                  >
                                    <IP className={styles.hostnameIcon} />
                                    <Typography variant="subtitle2" ml="0.4rem" fontFamily="mabry-bold">
                                      {items?.ip}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box
                                  className={styles.bolbProportionContainer}
                                  id={`scheduler-${item?.scheduler_cluster_id}-proportion-${peerIndex}`}
                                >
                                  <Proportion className={styles.bolbIcon} />
                                  <Typography
                                    component="div"
                                    variant="body2"
                                    fontFamily="mabry-bold"
                                    className={styles.bolbProportionText}
                                  >
                                    {`${((items?.layers?.length / layer) * 100).toFixed(2) || 0}%`}
                                  </Typography>
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails
                              key={peerIndex}
                              sx={{
                                padding: '1rem',
                                backgroundColor: 'var(--palette-background-paper)',
                              }}
                            >
                              <Box>
                                <Box className={styles.layerWrapper}>
                                  <Paper variant="outlined" className={styles.bolbIconWrapper}>
                                    <Layer className={styles.layerIcon} />
                                  </Paper>
                                  <Typography component="div" variant="body2" fontFamily="mabry-bold" ml="0.5rem">
                                    Blobs
                                  </Typography>
                                </Box>
                                <Box className={styles.cardCantainer}>
                                  {items?.layers.map((item: any, bolbIndex: any) => (
                                    <Box key={bolbIndex} className={styles.urlsWrapper}>
                                      <Tooltip title={extractSHA256Regex(item?.url || '-') || '-'} placement="top">
                                        <Typography
                                          id={`url-${bolbIndex}`}
                                          className={styles.url}
                                          fontFamily="mabry-bold"
                                          variant="body2"
                                        >
                                          {extractSHA256Regex(item?.url || '-') || '-'}
                                        </Typography>
                                      </Tooltip>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                          {peerIndex !== paginatedPeers.length - 1 && <Divider />}
                        </Box>
                      );
                    })}
                  </Card>
                  {totalPage > 1 && (
                    <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
                      <Pagination
                        id={`pagination-${index}`}
                        count={Math.ceil(item.peer.length / 5)}
                        page={currentPage}
                        onChange={(e, page) => handleImagePageChange(schedulerClusterId, page)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            id="no-image-manifest-URL-task"
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '6rem' }}
          >
            <NoSearch className={styles.noSearch} />
            <Box>
              <Typography variant="h5" component="span">
                You don't find any results!
              </Typography>
            </Box>
          </Box>
        )
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
