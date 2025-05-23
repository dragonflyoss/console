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
} from '@mui/material';
import { useEffect, useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import { Link, useNavigate } from 'react-router-dom';
import { createJob, getClusters } from '../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import styles from './new.module.css';
import AddIcon from '@mui/icons-material/Add';
import { CancelLoadingButton, SavelLoadingButton } from '../../loading-button';

export default function NewPreheat() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setBioError] = useState(false);
  const [urlError, setURLError] = useState(false);
  const [tagError, setTagError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [pieceLengthError, setPieceLengthError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [headers, setheaders] = useState<Array<{ key: string; value: string }>>([]);
  const [cluster, setCluster] = useState([{ id: 0, name: '' }]);
  const [clusterError, setClusterError] = useState(false);
  const [filter, setFilter] = useState([]);
  const [clusterName, setClusterName] = useState<string[]>([]);
  const [clusterHelperText, setClusterHelperText] = useState('Select at least one option.');
  const [scope, setScope] = useState<string>('single_seed_peer');
  const [filterHelperText, setFilterHelperText] = useState('Fill in the characters, the length is 0-100.');

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
        autoComplete: 'family-name',
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

  const argsForm = [
    {
      formProps: {
        id: 'pieceLength',
        label: 'Piece Length',
        name: 'pieceLength',
        autoComplete: 'family-name',
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
        multiline: true,
        maxRows: 2,
        autoComplete: 'family-name',
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
        id: 'url',
        label: 'URL',
        name: 'url',
        required: true,
        autoComplete: 'family-name',
        placeholder: 'Enter your URL',
        helperText: urlError ? 'Fill in the characters, the length is 1-1000.' : '',
        error: urlError,
        InputProps: {
          endAdornment: (
            <Tooltip title={'URL address used to specify the resource to be preheat.'} placement="top">
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
      setError: setURLError,
      validate: (value: string) => {
        const reg = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s].{1,1000}$/;
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
          if (!argsForm[3].formProps.error) {
            setFilter(newValue);
          }
        },
        onInputChange: (e: any) => {
          setFilterHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, argsForm[3]);
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

  const clusterFrom = [
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
  };

  const headersKeyValidate = (key: any) => {
    const regex = /^.{1,50}$/;
    return regex.test(key);
  };

  const headersValueValidate = (value: any) => {
    const regex = /^.{1,10000}$/;
    return regex.test(value);
  };

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);

    event.preventDefault();
    const bio = event.currentTarget.elements.description.value;
    const url = event.currentTarget.elements.url.value;
    const tag = event.currentTarget.elements.tag.value;
    const filterText = event.currentTarget.elements.filteredQueryParams.value;
    const pieceLength = event.currentTarget.elements.pieceLength.value;
    const filters = filter.join('&');

    const data = new FormData(event.currentTarget);

    if (filterText) {
      setFilterError(true);
      setFilterHelperText('Please press ENTER to end the filter creation');
    } else {
      setFilterError(false);
      setFilterHelperText('Fill in the characters, the length is 0-100.');
    }

    informationForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    argsForm.forEach((item) => {
      if (item.formProps.name !== 'filteredQueryParams') {
        const value = data.get(item.formProps.name);
        item.setError(!item.validate(value as string));
        item.syncError = !item.validate(value as string);
      }
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
      !informationForm.filter((item) => item.syncError).length &&
        !argsForm.filter((item) => item.syncError).length &&
        clusterIDValidate &&
        headerValidate &&
        Boolean(!filterText),
    );

    const clusterSet = new Set(clusterName);

    const clusterID = cluster.filter((item) => clusterSet.has(item.name)).map((item) => item.id);

    const formDate = {
      bio: bio,
      type: 'preheat',
      args: {
        type: 'file',
        url: url,
        tag: tag,
        filtered_query_params: filters,
        headers: headerList,
        scope: scope,
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
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/developer/personal-access-tokens`}>
          Preheat
        </RouterLink>
        <Typography variant="body2" color="inherit">
          New preheat
        </Typography>
      </Breadcrumbs>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth>
          <Box className={styles.title}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                Information
              </Typography>
              <Tooltip title=" The information of preheat." placement="top">
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
                margin="normal"
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

            <FormControl className={styles.textField} margin="normal" required size="small" error={clusterError}>
              {clusterFrom.map((item) => (
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
          <Box className={styles.title}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                Args
              </Typography>
              <Tooltip title="Args used to pass additional configuration options to the preheat task." placement="top">
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
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
                          margin="normal"
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
                ) : item.formProps.id === 'pieceLength' ? (
                  <Box>
                    <TextField
                      color="success"
                      margin="normal"
                      size="small"
                      {...item.formProps}
                      sx={{ width: '11rem', mr: '1rem' }}
                      className={styles.textField}
                    />
                    <FormControl sx={{ width: '25rem' }} margin="normal" color="success" required size="small">
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
                          <MenuItem id={item.name} key={item.name} value={item.name} sx={{ height: '2.6rem' }}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ) : (
                  <Box key={item.formProps.id} sx={{ width: '100%' }}>
                    <TextField
                      color="success"
                      margin="normal"
                      size="small"
                      {...item.formProps}
                      className={styles.filterInput}
                    />
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
                      id={item.key}
                      error={!headersKeyValidate(item.key)}
                      helperText={!headersKeyValidate(item.key) && 'Fill in the characters, the length is 1-100.'}
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
                      size="small"
                      id={item.value}
                      multiline
                      maxRows={3}
                      error={!headersValueValidate(item.value)}
                      helperText={!headersValueValidate(item.value) && 'Fill in the characters, the length is 1-10000.'}
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
                        width: '2.4rem',
                        height: '2.4rem',
                        p: '0.2rem',
                      }}
                      onClick={() => {
                        const newheaders = [...headers];
                        newheaders.splice(index, 1);
                        setheaders(newheaders);
                      }}
                    >
                      <ClearIcon sx={{ width: '1.2rem', height: '1.2rem', color: 'var(--palette-button-color)' }} />
                    </IconButton>
                  </Grid>
                ))}
                <Button
                  sx={{
                    '&.MuiButton-root': {
                      backgroundColor: 'var(--palette-description-color)',
                      borderColor: 'var(--palette-description-color)',
                      color: '#FFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                    },
                    width: '100%',
                    mt: '1.5rem',
                  }}
                  id="add-headers"
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setheaders([...headers, { key: '', value: '' }]);
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
                  setheaders([...headers, { key: '', value: '' }]);
                }}
              >
                add headers
              </Button>
            )}
          </Box>
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
        </FormControl>
      </Box>
    </Box>
  );
}
