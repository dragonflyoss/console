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
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  createTheme,
  ThemeProvider,
  FormHelperText,
  Grid,
  Chip,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { useEffect, useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { createJob, getClusters } from '../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import styles from './new.module.css';

export default function NewPreheat() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setBioError] = useState(false);
  const [urlError, setURLError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [headers, setheaders] = useState<Array<{ key: string; value: string }>>([]);
  const [cluster, setCluster] = useState([{ id: 0, name: '' }]);
  const [clusterError, setClusterError] = useState(false);
  const [filter, setFilter] = useState([]);
  const [clusterName, setClusterName] = useState<string[]>([]);
  const [clusterID, setClusterID] = useState<number[]>([]);

  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      secondary: {
        main: '#1c293a',
      },
    },
  });

  const formList = [
    {
      formProps: {
        id: 'bio',
        label: 'Description',
        name: 'bio',
        multiline: true,
        autoComplete: 'family-name',
        placeholder: 'Enter your description',
        helperText: bioError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: bioError,
        InputProps: {
          endAdornment: (
            <Tooltip title={'Cluster preheat description.'} placement="top">
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
      setError: setBioError,

      validate: (value: string) => {
        const reg = /^.{0,1000}$/;
        return reg.test(value);
      },
    },
  ];

  const argsForm = [
    {
      formProps: {
        id: 'url',
        label: 'URL',
        name: 'url',
        autoComplete: 'family-name',
        placeholder: 'Enter your URL',
        helperText: urlError ? 'Please enter the correct URL.' : '',
        error: urlError,
        InputProps: {
          endAdornment: (
            <Tooltip title={'URL address used to specify the resource to be preheat'} placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          ),
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, argsForm[0]);
        },
      },
      syncError: false,
      setError: setURLError,
      validate: (value: string) => {
        const reg = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
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
            <Tooltip title={'Tag used to specify the resources to preheat'} placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
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
      name: 'filter',
      label: 'Filter',
      filterFormProps: {
        value: filter,
        options: [],
        onChange: (_e: any, newValue: any) => {
          if (!argsForm[2].formProps.error) {
            setFilter(newValue);
          }
        },

        onInputChange: (e: any) => {
          changeValidate(e.target.value, argsForm[2]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'filter',
        label: 'Filter',
        name: 'filter',
        placeholder: 'Please enter Filter',
        error: filterError,
        helperText: filterError ? 'Fill in the characters, the length is 0-1000.' : '',
        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setFilterError,

      validate: (value: string) => {
        const reg = /^(.{0,1000})$/;
        return reg.test(value);
      },
    },
  ];

  const handleSelectCluster = (event: any) => {
    const selectedValues = event.target.value;
    const selectedNames = selectedValues.map((item: any) => item.name);
    const selectedIds = selectedValues.map((item: any) => item.id);
    setClusterName(selectedNames);
    setClusterID(selectedIds);
    setClusterError(false);
  };

  useEffect(() => {
    (async function () {
      const cluster = await getClusters({ page: 1, per_page: MAX_PAGE_SIZE });
      setCluster(cluster.data);
    })();
  }, []);

  const headersKeyValidate = (key: any) => {
    const regex = /^.{1,50}$/;
    return regex.test(key);
  };

  const headersValueValidate = (value: any) => {
    const regex = /^.{1,1000}$/;
    return regex.test(value);
  };

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);

    event.preventDefault();
    const bio = event.currentTarget.elements.bio;
    const url = event.currentTarget.elements.url;
    const tag = event.currentTarget.elements.tag;
    const filters = filter.join('&');

    const data = new FormData(event.currentTarget);

    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    argsForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const headerValidate = headers.every((item) => {
      const isValidKey = headersKeyValidate(item.key);
      const isValidValue = headersValueValidate(item.value);

      return isValidKey && isValidValue;
    });

    const headerList: { [key: string]: string } = headers.reduce(
      (accumulator, currentValue) => ({ ...accumulator, [currentValue.key]: currentValue.value }),
      {},
    );

    let clusterIDValidate = true;

    if (clusterName.length === 0) {
      setClusterError(true);
      clusterIDValidate = false;
    } else {
      clusterIDValidate = true;
    }

    const canSubmit = Boolean(
      !formList.filter((item) => item.syncError).length &&
        !argsForm.filter((item) => item.syncError).length &&
        clusterIDValidate &&
        headerValidate,
    );

    const formDate = {
      bio: bio.value,
      type: 'preheat',
      args: {
        type: 'file',
        url: url.value,
        tag: tag.value,
        filter: filters,
        headers: headerList,
      },
      cdn_cluster_ids: clusterID,
    };

    if (canSubmit) {
      try {
        await createJob({ ...formDate });
        setLoadingButton(false);
        navigate('/jobs/preheats');
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

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  return (
    <ThemeProvider theme={theme}>
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
        Create preheat
      </Typography>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Information
            </Typography>
            <Tooltip title=" The information of preheat." placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          </Box>
          {formList.map((item) => (
            <TextField
              color="success"
              required
              size="small"
              margin="normal"
              key={item.formProps.name}
              {...item.formProps}
              className={styles.textField}
            />
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '1rem' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Clusters
            </Typography>
            <Tooltip title="Used for clusters that need to be preheating." placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          </Box>
          <FormControl sx={{ width: '20rem' }} size="small" color="secondary" error={clusterError}>
            <InputLabel id="demo-multiple-checkbox-label">Clusters</InputLabel>
            <Select
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={clusterName.map((name) => cluster.find((item) => item.name === name))}
              onChange={handleSelectCluster}
              input={<OutlinedInput label="clusters" />}
              renderValue={(selected) => selected.map((item: any) => item.name).join(', ')}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: '14rem',
                    width: '18rem',
                  },
                },
              }}
            >
              {cluster.map((item: any) => (
                <MenuItem key={item.id} value={item} sx={{ height: '2.6rem' }}>
                  <Checkbox
                    size="small"
                    sx={{ '&.MuiCheckbox-root': { color: 'var(--button-color)' } }}
                    checked={clusterName.indexOf(item.name) > -1}
                  />
                  <ListItemText primary={item.name} />
                </MenuItem>
              ))}
            </Select>
            {clusterError && <FormHelperText>Select at least one option.</FormHelperText>}
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: '1rem' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Args
            </Typography>
            <Tooltip title="Args used to pass additional configuration options to the preheat task" placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          </Box>
          {argsForm.map((item) => {
            return (
              <Box key={item.formProps.name}>
                {item.label === 'Filter' ? (
                  <Autocomplete
                    freeSolo
                    multiple
                    {...item.filterFormProps}
                    size="small"
                    className={styles.filterInput}
                    renderInput={(params) => (
                      <TextField margin="normal" {...params} color="success" {...item.formProps} />
                    )}
                  />
                ) : (
                  <TextField
                    color="success"
                    required
                    margin="normal"
                    size="small"
                    {...item.formProps}
                    className={styles.filterInput}
                  />
                )}
              </Box>
            );
          })}
          <Button
            sx={{
              '&.MuiButton-root': {
                backgroundColor: 'var(--button-color)',
                borderRadius: 0,
                color: '#fff',
                width: '10rem',
                mt: '1rem',
                mb: '1rem',
              },
            }}
            variant="contained"
            size="small"
            onClick={() => {
              setheaders([...headers, { key: '', value: '' }]);
            }}
          >
            <AddIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            add headers
          </Button>
          {headers.map((item, index) => (
            <Grid key={index} sx={{ display: 'flex', alignItems: 'flex-start', mt: '1rem', mb: '0.5rem' }}>
              <TextField
                label="Key"
                color="success"
                required
                size="small"
                error={!headersKeyValidate(item.key)}
                helperText={!headersKeyValidate(item.key) && 'Fill in the characters, the length is 1-50.'}
                className={styles.headersKeyInput}
                value={item.key}
                onChange={(event) => {
                  const newheaders = [...headers];
                  newheaders[index].key = event.target.value;
                  setheaders(newheaders);
                }}
              />
              <TextField
                label="Value"
                color="success"
                required
                size="small"
                error={!headersValueValidate(item.value)}
                helperText={!headersValueValidate(item.value) && 'Fill in the characters, the length is 1-1000.'}
                className={styles.headersValueInput}
                value={item.value}
                onChange={(event) => {
                  const newheaders = [...headers];

                  newheaders[index].value = event.target.value;
                  setheaders(newheaders);
                }}
              />
              <IconButton
                sx={{
                  width: '2.6rem',
                  height: '2.6rem',
                }}
                onClick={() => {
                  const newheaders = [...headers];
                  newheaders.splice(index, 1);
                  setheaders(newheaders);
                }}
              >
                <RemoveCircleIcon sx={{ color: 'var(--button-color)', width: '1.6rem', height: '1.6rem' }} />
              </IconButton>
            </Grid>
          ))}
          <Box sx={{ mt: '2rem' }}>
            <LoadingButton
              loading={loadingButton}
              endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
              size="small"
              variant="outlined"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  color: 'var(--calcel-size-color)',
                  borderRadius: 0,
                  borderColor: 'var(--calcel-color)',
                },
                ':hover': {
                  backgroundColor: 'var( --calcel-hover-corlor)',
                  borderColor: 'var( --calcel-hover-corlor)',
                },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                mr: '1rem',
                width: '8rem',
              }}
              onClick={() => {
                navigate('/jobs/preheats');
              }}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={loadingButton}
              endIcon={<CheckCircleIcon />}
              size="small"
              variant="outlined"
              type="submit"
              loadingPosition="end"
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
                width: '8rem',
              }}
            >
              Save
            </LoadingButton>
          </Box>
        </FormControl>
      </Box>
    </ThemeProvider>
  );
}
