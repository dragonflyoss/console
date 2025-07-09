import {
  Tooltip,
  TextField,
  Box,
  Typography,
  FormControl,
  Button,
  IconButton,
  Autocomplete,
  InputLabel,
  Select,
  MenuItem,
  Link as RouterLink,
  Grid,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Paper,
  SelectChangeEvent,
  Breadcrumbs,
  InputAdornment,
  styled,
  Slider,
  RadioGroup,
  FormControlLabel,
  Radio,
  ToggleButtonGroup,
  toggleButtonGroupClasses,
  ToggleButton,
  FormLabel,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link, useNavigate } from 'react-router-dom';
import { createJob, getClusters } from '../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import styles from './new.module.css';
import AddIcon from '@mui/icons-material/Add';
import { CancelLoadingButton, SavelLoadingButton } from '../../loading-button';
import { ReactComponent as Image } from '../../../assets/images/resource/task/image-manifest.svg';
import { ReactComponent as File } from '../../../assets/images/job/preheat/file.svg';

const PrettoSlider = styled(Slider)(({ theme }) => ({
  color: 'var(--palette-description-color)',
  padding: '12px 0',
  width: '14rem',
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
      '@media (hover: none)': {
        boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)',
      },
    },
    '&:before': {
      boxShadow: '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: theme.palette.text.primary,
    '&::before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: '#000',
      ...theme.applyStyles('dark', {
        color: '#fff',
      }),
    },
  },
  '& .MuiSlider-track': {
    border: 'none',
    height: 5,
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    boxShadow: 'inset 0px 0px 4px -2px #000',
    backgroundColor: '#d0d0d0',
  },
  ...theme.applyStyles('dark', {
    color: 'var(--palette-description-color)',
  }),
}));

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

export default function NewPreheat() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setBioError] = useState(false);
  const [urlError, setURLError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [countError, setCountError] = useState(false);
  const [clusterError, setClusterError] = useState(false);
  const [applicationError, setApplicationError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [ipsError, setIPsError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [pieceLengthError, setPieceLengthError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [headers, setHeaders] = useState<
    Array<{ key: { key: string; error: boolean }; value: { value: string; error: boolean } }>
  >([]);
  const [URLs, setURLS] = useState<Array<{ url: string; error: boolean }>>([]);
  const [cluster, setCluster] = useState([{ id: 0, name: '' }]);
  const [filter, setFilter] = useState([]);
  const [ips, setIPs] = useState([]);
  const [clusterName, setClusterName] = useState<string[]>([]);
  const [clusterHelperText, setClusterHelperText] = useState('Select at least one option.');
  const [scope, setScope] = useState<string>('single_seed_peer');
  const [count, setCount] = useState<string>('all');
  const [filterHelperText, setFilterHelperText] = useState('Fill in the characters, the length is 0-100.');
  const [ipsHelperText, setIPsHelperText] = useState('Fill in the characters, the length is 0-100.');
  const [percentage, setPercentage] = useState(50);
  const [search, setSearch] = useState('file');
  const [platform, setPlatform] = useState('linux/amd64');

  const formRef = useRef<HTMLFormElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async function () {
      try {
        const cluster = await getClusters({ page: 1, per_page: MAX_PAGE_SIZE });
        setCluster(cluster);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, []);

  const informationForm = [
    {
      formProps: {
        id: 'description',
        label: 'Description',
        name: 'description',
        multiline: true,
        maxRows: 2,
        autoComplete: 'family-bio',
        placeholder: 'Enter your description',
        helperText: bioError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: bioError,
        InputProps: {
          endAdornment: (
            <Tooltip title={'Preheat description.'} placement="top">
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
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, informationForm[0]);
        },
      },
      syncError: false,
      setError: setBioError,

      validate: (value: string) => {
        const reg = /^.{0,1000}$/;
        return reg.test(value);
      },
    },
  ];

  const urlForm = {
    formProps: {
      id: 'url',
      label: 'URL',
      name: 'url',
      required: true,
      autoComplete: 'family-url',
      placeholder: 'Enter your URL',
      helperText: urlError ? 'Fill in the characters, the length is 1-1000.' : '',
      error: urlError,

      onChange: (e: any) => {
        changeValidate(e.target.value, urlForm);
      },
    },
    syncError: false,
    setError: setURLError,
    validate: (value: string) => {
      const reg = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s].{1,1000}$/;
      return reg.test(value);
    },
  };

  const argsForm = [
    {
      formProps: {
        id: 'pieceLength',
        label: 'Piece Length',
        name: 'pieceLength',
        autoComplete: 'family-piece-length',
        placeholder: 'Piece Length',
        helperText: pieceLengthError ? 'Please enter a value between 4 and 1024 MiB.' : '',
        error: pieceLengthError,
        InputProps: {
          endAdornment: (
            <>
              <InputAdornment position="start">
                <Typography sx={{ fontFamily: 'mabry-bold', color: 'var(--palette-sidebar-menu-color)' }}>
                  MiB
                </Typography>
              </InputAdornment>
              <Tooltip
                title={
                  'By setting the piece length, you can define the size of each piece downloaded during preheating. If unspecified, it’s calculated based on content length, defaulting to 4-16 MiB.'
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
            </>
          ),
        },

        onChange: (e: any) => {
          changeValidate(e.target.value, argsForm[0]);
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
        label: 'Tag',
        name: 'tag',
        autoComplete: 'family-tag',
        placeholder: 'Enter your tag',
        helperText: tagError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: tagError,
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'When the URL of the preheat tasks are the same but the Tag are different, they will be distinguished based on the Tag and the generated preheat tasks will be different.'
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
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, argsForm[1]);
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
        autoComplete: 'family-application',
        placeholder: 'Enter your application',
        helperText: applicationError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: applicationError,
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'When the URL of the preheat tasks are the same but the Application are different, they will be distinguished based on the Application and the generated preheat tasks will be different.'
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
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, argsForm[2]);
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
      filterFormProps: {
        id: 'ips',
        name: 'ips',
        label: 'IPs',
        value: ips,
        options: [],
        onChange: (_e: any, newValue: any) => {
          if (!argsForm[3].formProps.error) {
            setIPs(newValue);
          }
        },
        onInputChange: (e: any) => {
          setIPsHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, argsForm[3]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'ips',
        name: 'ips',
        label: 'IPs',
        placeholder: 'Press the Enter key to confirm the entered value',
        error: ipsError,
        helperText: ipsError ? ipsHelperText : '',

        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setIPsError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
    },
    {
      filterFormProps: {
        id: 'filteredQueryParams',
        name: 'filteredQueryParams',
        label: 'Filter Query Params',
        value: filter,
        options: [],
        onChange: (_e: any, newValue: any) => {
          if (!argsForm[4].formProps.error) {
            setFilter(newValue);
          }
        },
        onInputChange: (e: any) => {
          setFilterHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, argsForm[4]);
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

  const imageArgsForm = [
    {
      formProps: {
        id: 'pieceLength',
        label: 'Piece Length',
        name: 'pieceLength',
        autoComplete: 'family-piece-length',
        placeholder: 'Piece Length',
        helperText: pieceLengthError ? 'Please enter a value between 4 and 1024 MiB.' : '',
        error: pieceLengthError,
        InputProps: {
          endAdornment: (
            <>
              <InputAdornment position="start">
                <Typography sx={{ fontFamily: 'mabry-bold', color: 'var(--palette-sidebar-menu-color)' }}>
                  MiB
                </Typography>
              </InputAdornment>
              <Tooltip
                title={
                  'By setting the piece length, you can define the size of each piece downloaded during preheating. If unspecified, it’s calculated based on content length, defaulting to 4-16 MiB.'
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
            </>
          ),
        },

        onChange: (e: any) => {
          changeValidate(e.target.value, imageArgsForm[0]);
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
        id: 'username',
        label: 'User Name',
        name: 'username',
        autoComplete: 'family-name',
        placeholder: 'Enter your name',
        helperText: nameError ? 'Fill in the characters, the length is 0-100.' : '',
        error: nameError,
        InputProps: {
          endAdornment: (
            <Tooltip title="The name is the username for accessing the manifest URL." placement="top">
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
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, imageArgsForm[1]);
        },
      },
      syncError: false,
      setError: setNameError,

      validate: (value: string) => {
        const reg = /^.{0,100}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'password',
        label: 'Password',
        name: 'password',
        autoComplete: 'family-password',
        placeholder: 'Enter your password',
        helperText: passwordError ? 'Fill in the characters, the length is 0-100.' : '',
        error: passwordError,
        InputProps: {
          endAdornment: (
            <Tooltip title="The password is the password for accessing the manifest URL." placement="top">
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
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, imageArgsForm[2]);
        },
      },
      syncError: false,
      setError: setPasswordError,

      validate: (value: string) => {
        const reg = /^.{0,100}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'tag',
        label: 'Tag',
        name: 'tag',
        autoComplete: 'family-tag',
        placeholder: 'Enter your tag',
        helperText: tagError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: tagError,
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'When the URL of the preheat tasks are the same but the Tag are different, they will be distinguished based on the Tag and the generated preheat tasks will be different.'
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
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, imageArgsForm[3]);
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
        autoComplete: 'family-application',
        placeholder: 'Enter your application',
        helperText: applicationError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: applicationError,
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'When the URL of the preheat tasks are the same but the Application are different, they will be distinguished based on the Application and the generated preheat tasks will be different.'
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
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, imageArgsForm[4]);
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
      filterFormProps: {
        id: 'ips',
        name: 'ips',
        label: 'IPs',
        value: ips,
        options: [],
        onChange: (_e: any, newValue: any) => {
          if (!imageArgsForm[5].formProps.error) {
            setIPs(newValue);
          }
        },
        onInputChange: (e: any) => {
          setIPsHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, imageArgsForm[5]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'ips',
        name: 'ips',
        label: 'IPs',
        placeholder: 'Press the Enter key to confirm the entered value',
        error: ipsError,
        helperText: ipsError ? ipsHelperText : '',

        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setIPsError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
    },
    {
      filterFormProps: {
        id: 'filteredQueryParams',
        name: 'filteredQueryParams',
        label: 'Filter Query Params',
        value: filter,
        options: [],
        onChange: (_e: any, newValue: any) => {
          if (!imageArgsForm[6].formProps.error) {
            setFilter(newValue);
          }
        },
        onInputChange: (e: any) => {
          setFilterHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, imageArgsForm[6]);
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

  const clusterForm = [
    {
      enterMultiple: true,
      scopesFormProps: {
        id: 'cluster',
        name: 'cluster',
        label: 'Cluster',
        value: clusterName,
        options: (Array.isArray(cluster) && cluster?.map((option) => option?.name)) || [''],

        onChange: (e: any, newValue: any) => {
          const existingNames = new Set(cluster.map((item) => item?.name));

          if (!newValue.every((item: string) => existingNames.has(item))) {
            setClusterError(true);
            setClusterHelperText(`cluster not found`);
          } else {
            setClusterName(newValue);
            setClusterError(false);
            setClusterHelperText('Select at least one option.');
          }
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip id={`cluster-${index}`} size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'cluster',
        label: 'Cluster',
        name: 'cluster',
        placeholder: 'Please enter Cluster',
        required: true,
        error: clusterError,
        helperText: clusterError && clusterHelperText,
        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },
    },
  ];

  const scopeList = [
    { label: 'Single Seed Peer', name: 'single_seed_peer' },
    { label: 'All Seed Peers', name: 'all_seed_peers' },
    { label: 'All Peers', name: 'all_peers' },
  ];

  const handleSelectScope = (event: SelectChangeEvent) => {
    const selectedValues = event.target.value;
    const currentSelection = scopeList.find((scope) => scope.name === selectedValues);
    setScope(currentSelection?.name || '');
    setCount('all');
  };

  const URLValidate = (value: any) => {
    const regex = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]{1,1000}$/;
    return regex.test(value);
  };

  const headersKeyValidate = (key: any) => {
    const regex = /^.{1,50}$/;
    return regex.test(key);
  };

  const headersValueValidate = (value: any) => {
    const regex = /^.{1,10000}$/;
    return regex.test(value);
  };

  const countValidate = (value: any) => {
    const regex = /^(?:[1-9][0-9]?|1[0-9]{2}|200)$/;
    return regex.test(value);
  };

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);

    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const bio = event.currentTarget.elements.description.value;
    const url = event.currentTarget.elements.url.value;
    const tag = event.currentTarget.elements.tag.value;
    const application = event.currentTarget.elements.application.value;
    const filterText = event.currentTarget.elements.filteredQueryParams.value;
    const ipsText = event.currentTarget.elements.ips.value;
    const pieceLength = event.currentTarget.elements.pieceLength.value;

    let percentage = null;
    let countValue = null;

    if (count !== 'all') {
      if (count === 'percentage') {
        percentage = event.currentTarget.elements.scopePercentage.value;
      } else if (count === 'count') {
        countValue = event.currentTarget.elements.scopeCount.value;
      }
    }

    informationForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const headerValidate = headers.every((item, index) => {
      const isValidKey = headersKeyValidate(item.key.key);
      const isValidValue = headersValueValidate(item.value.value);
      const newURL = [...headers];

      newURL[index].key.error = !isValidKey;
      newURL[index].value.error = !isValidValue;

      setHeaders(newURL);

      return isValidKey && isValidValue;
    });

    let clusterIDValidate = true;

    if (clusterName.length === 0) {
      setClusterError(true);
      clusterIDValidate = false;
    } else {
      clusterIDValidate = true;
    }

    const validateCount = countValidate(countValue);

    const headerList: { [key: string]: string } = headers.reduce(
      (accumulator, currentValue) => ({ ...accumulator, [currentValue.key.key]: currentValue.value.value }),
      {},
    );

    const clusterSet = new Set(clusterName);
    const clusterID = cluster.filter((item) => clusterSet.has(item.name)).map((item) => item.id);
    const filters = filter.join('&');

    if (filterText) {
      setFilterError(true);
      setFilterHelperText('Please press ENTER to end the filter creation');
    } else {
      setFilterError(false);
      setFilterHelperText('Fill in the characters, the length is 0-100.');
    }

    if (ipsText) {
      setIPsError(true);
      setIPsHelperText('Please press ENTER to end the ips creation');
    } else {
      setIPsError(false);
      setIPsHelperText('Fill in the characters, the length is 0-100.');
    }

    urlForm.setError(!urlForm.validate(url as string));
    urlForm.syncError = !urlForm.validate(url as string);

    if (search === 'file') {
      argsForm.forEach((item) => {
        if (item.formProps.name !== 'filteredQueryParams' && item.formProps.name !== 'ips') {
          const value = data.get(item.formProps.name);
          item.setError(!item.validate(value as string));
          item.syncError = !item.validate(value as string);
        }
      });

      const urlValidate = URLs.every((item: { url: any; error: boolean }, index) => {
        const isValid = URLValidate(item.url);

        const newURL = [...URLs];
        newURL[index].error = !isValid;

        setURLS(newURL);
        return isValid;
      });

      const urlList = URLs.map((item) => item.url);

      urlList.unshift(url);

      const canSubmit = Boolean(
        !informationForm.filter((item) => item.syncError).length &&
          !argsForm.filter((item) => item.syncError).length &&
          !urlForm.syncError &&
          clusterIDValidate &&
          headerValidate &&
          urlValidate &&
          Boolean(!filterText) &&
          (countValue ? validateCount : true),
      );

      const formDate = {
        bio: bio,
        type: 'preheat',
        args: {
          type: 'file',
          urls: urlList,
          tag: tag,
          application: application,
          filtered_query_params: filters,
          headers: headerList,
          ips: ips,
          scope: scope,
          ...(countValue && count === 'count' && { count: Number(countValue) }),
          ...(percentage && count === 'percentage' && { percentage: Number(percentage) }),
          ...(pieceLength && pieceLength !== 0 && { piece_length: pieceLength * 1024 * 1024 }),
        },
        scheduler_cluster_ids: clusterID,
      };

      if (canSubmit) {
        try {
          const job = await createJob({ ...formDate });

          setLoadingButton(false);
          navigate(`/jobs/preheats/${job.id}`);
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
    } else {
      const username = event.currentTarget.elements.username.value;
      const password = event.currentTarget.elements.password.value;

      imageArgsForm.forEach((item) => {
        if (item.formProps.name !== 'filteredQueryParams' && item.formProps.name !== 'ips') {
          const value = data.get(item.formProps.name);
          item.setError(!item.validate(value as string));
          item.syncError = !item.validate(value as string);
        }
      });

      const canSubmit = Boolean(
        !informationForm.filter((item) => item.syncError).length &&
          !imageArgsForm.filter((item) => item.syncError).length &&
          !urlForm.syncError &&
          clusterIDValidate &&
          headerValidate &&
          Boolean(!filterText) &&
          Boolean(!ipsText) &&
          (countValue ? validateCount : true),
      );

      const formDate = {
        bio: bio,
        type: 'preheat',
        args: {
          type: 'image',
          url: url,
          tag: tag,
          application: application,
          filtered_query_params: filters,
          ips: ips,
          headers: headerList,
          username: username,
          password: password,
          platform: platform,
          scope: scope,
          ...(countValue && count === 'count' && { count: Number(countValue) }),
          ...(percentage && count === 'percentage' && { percentage: Number(percentage) }),
          ...(pieceLength && pieceLength !== 0 && { piece_length: pieceLength * 1024 * 1024 }),
        },
        scheduler_cluster_ids: clusterID,
      };

      if (canSubmit) {
        try {
          const job = await createJob({ ...formDate });

          setLoadingButton(false);
          navigate(`/jobs/preheats/${job.id}`);
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
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
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
      <Typography variant="h5" fontFamily="mabry-bold">
        Create Preheat
      </Typography>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mt: '1rem' }}
      >
        <Typography color="text.primary">Job</Typography>
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/jobs/preheats`}>
          Preheat
        </RouterLink>
        <Typography variant="body2" color="inherit">
          New preheat
        </Typography>
      </Breadcrumbs>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box component="form" ref={formRef} onSubmit={handleSubmit} noValidate>
        <Paper
          elevation={0}
          sx={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            mb: '1rem',
            backgroundColor: 'var(--palette-grey-600Channel)',
            borderRadius: '0.4rem',
          }}
        >
          <StyledToggleButtonGroup
            size="small"
            value={search}
            exclusive
            onChange={(e, newValue) => {
              setSearch(newValue);
              if (formRef.current) {
                formRef.current.reset();
                setScope('single_seed_peer');
                setFilter([]);
                setIPs([]);
                setClusterName([]);
                setHeaders([]);
                setPlatform('linux/amd64');
              }
            }}
            aria-label="Platform"
          >
            <ToggleButton
              id="preheat-file"
              value="file"
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
              <File className={styles.fileIcon} />
              Preheat File
            </ToggleButton>
            <ToggleButton
              id="preheat-image"
              value="image"
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
              <Image className={styles.fileIcon} />
              Preheat Image
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Paper>
        <Box className={styles.title}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Information
            </Typography>
            <Tooltip title="The information of preheat." placement="top">
              <HelpIcon
                sx={{
                  color: 'var(--palette-grey-300Channel)',
                  width: '0.8rem',
                  height: '0.8rem',
                  ':hover': { color: 'var(--palette-description-color)' },
                }}
              />
            </Tooltip>
          </Box>
          {informationForm.map((item) => (
            <TextField
              color="success"
              size="small"
              key={item.formProps.name}
              {...item.formProps}
              className={styles.filterInput}
            />
          ))}
        </Box>
        <Box className={styles.title}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Clusters
            </Typography>
            <Tooltip title="Used for clusters that need to be preheating." placement="top">
              <HelpIcon
                sx={{
                  color: 'var(--palette-grey-300Channel)',
                  width: '0.8rem',
                  height: '0.8rem',
                  ':hover': { color: 'var(--palette-description-color)' },
                }}
              />
            </Tooltip>
          </Box>
          <FormControl className={styles.textField} required size="small" error={clusterError}>
            {clusterForm.map((item) => (
              <Autocomplete
                freeSolo
                multiple
                disableClearable
                {...item.scopesFormProps}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                    }}
                    color="success"
                    {...item.formProps}
                  />
                )}
              />
            ))}
          </FormControl>
        </Box>

        {search === 'file' ? (
          <>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                  URL
                </Typography>
                <Tooltip title="URL address used to specify the resource to be preheat." placement="top">
                  <HelpIcon
                    sx={{
                      color: 'var(--palette-grey-300Channel)',
                      width: '0.8rem',
                      height: '0.8rem',
                      ':hover': { color: 'var(--palette-description-color)' },
                    }}
                  />
                </Tooltip>
              </Box>
              <Box sx={{ width: '100%' }}>
                <TextField {...urlForm.formProps} color="success" className={styles.filterInput} size="small" />
              </Box>
              {URLs.map((item, index) => {
                return (
                  <Box sx={{ display: 'inline-flex', alignItems: 'flex-start', m: '0.8rem 0' }}>
                    <TextField
                      color="success"
                      id={`url-${index}`}
                      key={index}
                      size="small"
                      label="URL"
                      name="urls"
                      value={item.url}
                      error={item.error}
                      helperText={item.error && 'Fill in the characters, the length is 1-1000.'}
                      placeholder="Enter your URL"
                      className={styles.urlInput}
                      onChange={(event) => {
                        const newURL = [...URLs];
                        newURL[index].url = event.target.value;

                        const isValid = URLValidate(event.target.value);
                        newURL[index].error = !isValid;

                        setURLS(newURL);
                      }}
                    />
                    <IconButton
                      id={`clear-url-${index}`}
                      sx={{
                        width: '2.4rem',
                        height: '2.4rem',
                        p: '0.2rem',
                      }}
                      onClick={() => {
                        const newURL = [...URLs];
                        newURL.splice(index, 1);
                        setURLS(newURL);
                      }}
                    >
                      <DoNotDisturbOnOutlinedIcon
                        sx={{ width: '1.2rem', height: '1.2rem', color: 'var(--palette-button-color)' }}
                      />
                    </IconButton>
                  </Box>
                );
              })}
              <Box>
                <Button
                  sx={{
                    '&.MuiButton-root': {
                      borderColor: 'var(--palette-description-color)',
                      color: 'var(--palette-description-color)',
                      borderStyle: 'dashed',
                    },
                    width: '37rem',
                    m: '1rem 0',
                  }}
                  variant="outlined"
                  id="add-url"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setURLS([...URLs, { url: '', error: false }]);
                  }}
                >
                  add URL
                </Button>
              </Box>
            </Box>
            <Box className={styles.title}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                  Args
                </Typography>
                <Tooltip
                  title="Args used to pass additional configuration options to the preheat task."
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
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '40rem' }}>
                {argsForm.map((item) => {
                  return item?.filterFormProps?.id === 'filteredQueryParams' ? (
                    <Box key={item.formProps.id} sx={{ width: '100%' }}>
                      <Autocomplete
                        freeSolo
                        multiple
                        disableClearable
                        {...item.filterFormProps}
                        size="small"
                        className={styles.filterInput}
                        renderInput={(params) => (
                          <TextField
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
                                      sx={{
                                        color: 'var(--palette-grey-300Channel)',
                                        width: '0.8rem',
                                        height: '0.8rem',
                                        mr: '0.3rem',
                                        ':hover': { color: 'var(--palette-description-color)' },
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
                    </Box>
                  ) : item?.filterFormProps?.id === 'ips' ? (
                    <Box key={item.formProps.id} sx={{ width: '100%' }}>
                      <Autocomplete
                        freeSolo
                        multiple
                        disableClearable
                        {...item.filterFormProps}
                        size="small"
                        className={styles.filterInput}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {params.InputProps.endAdornment}
                                  <Tooltip
                                    title="By setting the IPs parameter, you can specify the IP address of the resource that needs to be preheated."
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
                                </>
                              ),
                            }}
                            color="success"
                            {...item.formProps}
                          />
                        )}
                      />
                    </Box>
                  ) : item.formProps.id === 'pieceLength' ? (
                    <Box sx={{ width: '100%' }}>
                      <TextField color="success" size="small" {...item.formProps} className={styles.pieceLengthInput} />
                      <FormControl className={styles.selectInput} color="success" required size="small">
                        <InputLabel id="scope">Scope</InputLabel>
                        <Select
                          id="select-scope"
                          label="scope"
                          value={scope}
                          onChange={handleSelectScope}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: '14rem',
                                width: '18rem',
                              },
                            },
                          }}
                        >
                          {scopeList.map((item: any) => (
                            <MenuItem
                              id={item.name}
                              key={item.name}
                              value={item.name}
                              sx={{ m: '0.3rem', borderRadius: '0.2rem' }}
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {scope !== 'single_seed_peer' ? (
                        <Paper variant="outlined" className={styles.scope} id="count-or-percentage">
                          <FormControl sx={{ p: '0.8rem 1rem' }}>
                            <RadioGroup
                              row
                              aria-labelledby="demo-row-radio-buttons-group-label"
                              name="row-radio-buttons-group"
                              value={count}
                              onChange={(_e, newValue) => {
                                setCount(newValue);
                              }}
                            >
                              <FormControlLabel
                                value="all"
                                control={
                                  <Radio
                                    sx={{ '&.MuiRadio-root': { color: 'var(--palette-description-color)' } }}
                                    size="small"
                                    id="radio-all"
                                  />
                                }
                                label="All"
                              />
                              <FormControlLabel
                                value="percentage"
                                control={
                                  <Radio
                                    sx={{ '&.MuiRadio-root': { color: 'var(--palette-description-color)' } }}
                                    size="small"
                                    id="radio-percentage"
                                  />
                                }
                                label="Percentage"
                              />
                              <FormControlLabel
                                value="count"
                                control={
                                  <Radio
                                    sx={{ '&.MuiRadio-root': { color: 'var(--palette-description-color)' } }}
                                    size="small"
                                    id="radio-count"
                                  />
                                }
                                label="Count"
                              />
                            </RadioGroup>
                          </FormControl>
                          <Divider
                            sx={{
                              borderStyle: 'dashed',
                              borderColor: 'var(--palette-palette-divider)',
                              borderWidth: '0px 0px thin',
                            }}
                          />
                          <Box
                            sx={{
                              width: '100%',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: '1.2rem 1rem',
                            }}
                          >
                            {count === 'percentage' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PrettoSlider
                                  valueLabelDisplay="auto"
                                  aria-label="pretto slider"
                                  defaultValue={30}
                                  value={percentage}
                                  onChange={(event, newValue: any) => {
                                    setPercentage(newValue);
                                  }}
                                  min={1}
                                  max={100}
                                  name="scopePercentage"
                                  id="percentage"
                                />
                                <Typography variant="body2" fontFamily="mabry-bold" ml="0.6rem">
                                  {percentage}%
                                </Typography>
                                <Tooltip
                                  title="Percentage is the percentage of peers to be preheated. It must be a value between 1 and 100 (inclusive) if provided."
                                  placement="top"
                                >
                                  <HelpIcon
                                    sx={{
                                      color: 'var(--palette-grey-300Channel)',
                                      width: '0.8rem',
                                      height: '0.8rem',
                                      ':hover': { color: 'var(--palette-description-color)' },
                                      ml: '0.6rem',
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                            ) : count === 'count' ? (
                              <TextField
                                name="scopeCount"
                                id="count"
                                label="Count"
                                size="small"
                                color="success"
                                defaultValue={1}
                                placeholder="Enter your count"
                                type="number"
                                minRows={0}
                                error={countError}
                                helperText={countError && 'Fill in the characters, the length is 1-200.'}
                                onChange={(e) => {
                                  const validate = countValidate(e.target.value);
                                  setCountError(!validate);
                                }}
                                inputProps={{
                                  min: 0,
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <Tooltip
                                      title="Count is the number of peers to be preheated.  It must be a value between 1 and 200 (inclusive) if provided."
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
                                }}
                                sx={{ width: '12rem' }}
                              />
                            ) : (
                              <Typography variant="body2" id="all">
                                {scope === 'all_seed_peers'
                                  ? 'Preheat to each seed peer in the P2P cluster.'
                                  : scope === 'all_peers'
                                  ? 'Preheat to each peer in the P2P cluster.'
                                  : ''}
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      ) : (
                        <></>
                      )}
                    </Box>
                  ) : (
                    <Box key={item.formProps.id} sx={{ mr: '1rem' }}>
                      <TextField color="success" size="small" {...item.formProps} className={styles.textField} />
                    </Box>
                  );
                })}
              </Box>
              {headers.length > 0 ? (
                <Paper variant="outlined" id="header" className={styles.headersWrapper}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" fontFamily="mabry-bold" mr="0.4rem">
                      Headers
                    </Typography>
                    <Tooltip title="Add headers for preheat request." placement="top">
                      <HelpIcon
                        sx={{
                          color: 'var(--palette-grey-300Channel)',
                          width: '0.8rem',
                          height: '0.8rem',
                          ':hover': { color: 'var(--palette-description-color)' },
                        }}
                      />
                    </Tooltip>
                  </Box>
                  {headers.map((item, index) => (
                    <Grid key={index} sx={{ display: 'flex', alignItems: 'flex-start', mt: '1.5rem', mb: '0.5rem' }}>
                      <TextField
                        label="Key"
                        color="success"
                        size="small"
                        id={`key-${index}`}
                        value={item.key.key}
                        error={item.key.error}
                        helperText={item.key.error && 'Fill in the characters, the length is 1-100.'}
                        className={styles.headersKeyInput}
                        onChange={(event) => {
                          const newHeaders = [...headers];
                          newHeaders[index].key.key = event.target.value;
                          const isValid = headersKeyValidate(event.target.value);
                          newHeaders[index].key.error = !isValid;

                          setHeaders(newHeaders);
                        }}
                      />
                      <TextField
                        label="Value"
                        color="success"
                        size="small"
                        id={`value-${index}`}
                        value={item.value.value}
                        multiline
                        maxRows={3}
                        error={item.value.error}
                        helperText={item.value.error && 'Fill in the characters, the length is 1-10000.'}
                        className={styles.headersValueInput}
                        onChange={(event) => {
                          const newHeaders = [...headers];
                          newHeaders[index].value.value = event.target.value;
                          const isValid = headersValueValidate(event.target.value);
                          newHeaders[index].value.error = !isValid;

                          setHeaders(newHeaders);
                        }}
                      />
                      <IconButton
                        id={`clear-header-${index}`}
                        sx={{
                          width: '2.4rem',
                          height: '2.4rem',
                          p: '0.2rem',
                        }}
                        onClick={() => {
                          const newheaders = [...headers];
                          newheaders.splice(index, 1);
                          setHeaders(newheaders);
                        }}
                      >
                        <DoNotDisturbOnOutlinedIcon
                          sx={{ width: '1.2rem', height: '1.2rem', color: 'var(--palette-button-color)' }}
                        />
                      </IconButton>
                    </Grid>
                  ))}
                  <Button
                    sx={{
                      '&.MuiButton-root': {
                        borderColor: 'var(--palette-description-color)',
                        color: 'var(--palette-description-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderStyle: 'dashed',
                      },
                      width: '32.6rem',
                      mt: '1.5rem',
                    }}
                    id="add-headers"
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setHeaders([...headers, { key: { key: '', error: false }, value: { value: '', error: false } }]);
                    }}
                  >
                    add headers
                  </Button>
                </Paper>
              ) : (
                <Button
                  sx={{
                    '&.MuiButton-root': {
                      backgroundColor: 'var(--palette-description-color)',
                      borderColor: 'var(--palette-description-color)',
                      color: '#FFF',
                    },
                    width: '8rem',
                    mt: '1rem',
                  }}
                  id="add-headers"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setHeaders([...headers, { key: { key: '', error: false }, value: { value: '', error: false } }]);
                  }}
                >
                  add headers
                </Button>
              )}
            </Box>
          </>
        ) : (
          <>
            <Box mb="0.5rem">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                  URL
                </Typography>
                <Tooltip title="The URL address is the manifest URL for the image." placement="top">
                  <HelpIcon
                    sx={{
                      color: 'var(--palette-grey-300Channel)',
                      width: '0.8rem',
                      height: '0.8rem',
                      ':hover': { color: 'var(--palette-description-color)' },
                    }}
                  />
                </Tooltip>
              </Box>
              <Box sx={{ width: '100%' }}>
                <TextField {...urlForm.formProps} color="success" className={styles.filterInput} size="small" />
              </Box>
            </Box>
            <Box className={styles.title}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                  Args
                </Typography>
                <Tooltip
                  title="Args used to pass additional configuration options to the preheat task."
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
              </Box>
              <Box sx={{ width: '100%', m: '0.8rem 1rem 0.8rem 0' }}>
                <FormControl>
                  <FormLabel id="Platform" sx={{ fontFamily: 'mabry-bold' }}>
                    Platform
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={platform}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setPlatform((event.target as HTMLInputElement).value);
                    }}
                  >
                    <FormControlLabel value="linux/amd64" control={<Radio id="linux/amd64" />} label="Linux AMD64" />
                    <FormControlLabel value="linux/arm64" control={<Radio id="linux/arm64" />} label="Linux ARM64" />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '40rem' }}>
                {imageArgsForm.map((item) => {
                  return item?.filterFormProps?.id === 'filteredQueryParams' ? (
                    <Box key={item.formProps.id} sx={{ width: '100%' }}>
                      <Autocomplete
                        freeSolo
                        multiple
                        disableClearable
                        {...item.filterFormProps}
                        size="small"
                        className={styles.filterInput}
                        renderInput={(params) => (
                          <TextField
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
                                      sx={{
                                        color: 'var(--palette-grey-300Channel)',
                                        width: '0.8rem',
                                        height: '0.8rem',
                                        mr: '0.3rem',
                                        ':hover': { color: 'var(--palette-description-color)' },
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
                    </Box>
                  ) : item?.filterFormProps?.id === 'ips' ? (
                    <Box key={item.formProps.id} sx={{ width: '100%' }}>
                      <Autocomplete
                        freeSolo
                        multiple
                        disableClearable
                        {...item.filterFormProps}
                        size="small"
                        className={styles.filterInput}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {params.InputProps.endAdornment}
                                  <Tooltip
                                    title="By setting the IPs parameter, you can specify the IP address of the resource that needs to be preheated."
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
                                </>
                              ),
                            }}
                            color="success"
                            {...item.formProps}
                          />
                        )}
                      />
                    </Box>
                  ) : item.formProps.id === 'pieceLength' ? (
                    <Box sx={{ width: '100%' }}>
                      <TextField color="success" size="small" {...item.formProps} className={styles.pieceLengthInput} />
                      <FormControl className={styles.selectInput} color="success" required size="small">
                        <InputLabel id="scope">Scope</InputLabel>
                        <Select
                          id="select-scope"
                          label="scope"
                          value={scope}
                          onChange={handleSelectScope}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: '14rem',
                                width: '18rem',
                              },
                            },
                          }}
                        >
                          {scopeList.map((item: any) => (
                            <MenuItem
                              id={item.name}
                              key={item.name}
                              value={item.name}
                              sx={{ m: '0.3rem', borderRadius: '0.2rem' }}
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {scope !== 'single_seed_peer' ? (
                        <Paper variant="outlined" className={styles.scope} id="count-or-percentage">
                          <FormControl sx={{ p: '0.8rem 1rem' }}>
                            <RadioGroup
                              row
                              aria-labelledby="demo-row-radio-buttons-group-label"
                              name="row-radio-buttons-group"
                              value={count}
                              onChange={(_e, newValue) => {
                                setCount(newValue);
                              }}
                            >
                              <FormControlLabel
                                value="all"
                                control={
                                  <Radio
                                    sx={{ '&.MuiRadio-root': { color: 'var(--palette-description-color)' } }}
                                    size="small"
                                    id="radio-all"
                                  />
                                }
                                label="All"
                              />
                              <FormControlLabel
                                value="percentage"
                                control={
                                  <Radio
                                    sx={{ '&.MuiRadio-root': { color: 'var(--palette-description-color)' } }}
                                    size="small"
                                    id="radio-percentage"
                                  />
                                }
                                label="Percentage"
                              />
                              <FormControlLabel
                                value="count"
                                control={
                                  <Radio
                                    sx={{ '&.MuiRadio-root': { color: 'var(--palette-description-color)' } }}
                                    size="small"
                                    id="radio-count"
                                  />
                                }
                                label="Count"
                              />
                            </RadioGroup>
                          </FormControl>
                          <Divider
                            sx={{
                              borderStyle: 'dashed',
                              borderColor: 'var(--palette-palette-divider)',
                              borderWidth: '0px 0px thin',
                            }}
                          />
                          <Box
                            sx={{
                              width: '100%',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: '1.2rem 1rem',
                            }}
                          >
                            {count === 'percentage' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PrettoSlider
                                  valueLabelDisplay="auto"
                                  aria-label="pretto slider"
                                  defaultValue={30}
                                  value={percentage}
                                  onChange={(event, newValue: any) => {
                                    setPercentage(newValue);
                                  }}
                                  min={1}
                                  max={100}
                                  name="scopePercentage"
                                  id="percentage"
                                />
                                <Typography variant="body2" fontFamily="mabry-bold" ml="0.6rem">
                                  {percentage}%
                                </Typography>
                                <Tooltip
                                  title="Percentage is the percentage of peers to be preheated. It must be a value between 1 and 100 (inclusive) if provided."
                                  placement="top"
                                >
                                  <HelpIcon
                                    sx={{
                                      color: 'var(--palette-grey-300Channel)',
                                      width: '0.8rem',
                                      height: '0.8rem',
                                      ':hover': { color: 'var(--palette-description-color)' },
                                      ml: '0.6rem',
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                            ) : count === 'count' ? (
                              <TextField
                                name="scopeCount"
                                id="count"
                                label="Count"
                                size="small"
                                color="success"
                                defaultValue={1}
                                placeholder="Enter your count"
                                type="number"
                                minRows={0}
                                error={countError}
                                helperText={countError && 'Fill in the characters, the length is 1-200.'}
                                onChange={(e) => {
                                  const validate = countValidate(e.target.value);
                                  setCountError(!validate);
                                }}
                                inputProps={{
                                  min: 0,
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <Tooltip
                                      title="Count is the number of peers to be preheated.  It must be a value between 1 and 200 (inclusive) if provided."
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
                                }}
                                sx={{ width: '12rem' }}
                              />
                            ) : (
                              <Typography variant="body2" id="all">
                                {scope === 'all_seed_peers'
                                  ? 'Preheat to each seed peer in the P2P cluster.'
                                  : scope === 'all_peers'
                                  ? 'Preheat to each peer in the P2P cluster.'
                                  : ''}
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      ) : (
                        <></>
                      )}
                    </Box>
                  ) : (
                    <Box key={item.formProps.id} sx={{ mr: '1rem' }}>
                      <TextField color="success" size="small" {...item.formProps} className={styles.textField} />
                    </Box>
                  );
                })}
              </Box>
              {headers.length > 0 ? (
                <Paper variant="outlined" id="header" className={styles.headersWrapper}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" fontFamily="mabry-bold" mr="0.4rem">
                      Headers
                    </Typography>
                    <Tooltip title="Add headers for preheat request." placement="top">
                      <HelpIcon
                        sx={{
                          color: 'var(--palette-grey-300Channel)',
                          width: '0.8rem',
                          height: '0.8rem',
                          ':hover': { color: 'var(--palette-description-color)' },
                        }}
                      />
                    </Tooltip>
                  </Box>
                  {headers.map((item, index) => (
                    <Grid key={index} sx={{ display: 'flex', alignItems: 'flex-start', mt: '1.5rem', mb: '0.5rem' }}>
                      <TextField
                        label="Key"
                        color="success"
                        size="small"
                        id={`key-${index}`}
                        value={item.key.key}
                        error={item.key.error}
                        helperText={item.key.error && 'Fill in the characters, the length is 1-100.'}
                        className={styles.headersKeyInput}
                        onChange={(event) => {
                          const newHeaders = [...headers];
                          newHeaders[index].key.key = event.target.value;
                          const isValid = headersKeyValidate(event.target.value);
                          newHeaders[index].key.error = !isValid;

                          setHeaders(newHeaders);
                        }}
                      />
                      <TextField
                        label="Value"
                        color="success"
                        size="small"
                        id={`value-${index}`}
                        value={item.value.value}
                        multiline
                        maxRows={3}
                        error={item.value.error}
                        helperText={item.value.error && 'Fill in the characters, the length is 1-10000.'}
                        className={styles.headersValueInput}
                        onChange={(event) => {
                          const newHeaders = [...headers];
                          newHeaders[index].value.value = event.target.value;
                          const isValid = headersValueValidate(event.target.value);
                          newHeaders[index].value.error = !isValid;

                          setHeaders(newHeaders);
                        }}
                      />
                      <IconButton
                        id={`clear-header-${index}`}
                        sx={{
                          width: '2.4rem',
                          height: '2.4rem',
                          p: '0.2rem',
                        }}
                        onClick={() => {
                          const newheaders = [...headers];
                          newheaders.splice(index, 1);
                          setHeaders(newheaders);
                        }}
                      >
                        <DoNotDisturbOnOutlinedIcon
                          sx={{ width: '1.2rem', height: '1.2rem', color: 'var(--palette-button-color)' }}
                        />
                      </IconButton>
                    </Grid>
                  ))}
                  <Button
                    sx={{
                      '&.MuiButton-root': {
                        borderColor: 'var(--palette-description-color)',
                        color: 'var(--palette-description-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderStyle: 'dashed',
                      },
                      width: '32.6rem',
                      mt: '1.5rem',
                    }}
                    id="add-headers"
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setHeaders([...headers, { key: { key: '', error: false }, value: { value: '', error: false } }]);
                    }}
                  >
                    add headers
                  </Button>
                </Paper>
              ) : (
                <Button
                  sx={{
                    '&.MuiButton-root': {
                      backgroundColor: 'var(--palette-description-color)',
                      borderColor: 'var(--palette-description-color)',
                      color: '#FFF',
                    },
                    width: '8rem',
                    mt: '1rem',
                  }}
                  id="add-headers"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setHeaders([...headers, { key: { key: '', error: false }, value: { value: '', error: false } }]);
                  }}
                >
                  add headers
                </Button>
              )}
            </Box>
          </>
        )}
        <Divider sx={{ mt: '1rem', mb: '1.5rem' }} />
        <Box>
          <CancelLoadingButton
            id="cancel"
            loading={loadingButton}
            onClick={() => {
              navigate('/jobs/preheats');
            }}
          />
          <SavelLoadingButton loading={loadingButton} endIcon={<CheckCircleIcon />} id="save" text="Save" />
        </Box>
      </Box>
    </Box>
  );
}
