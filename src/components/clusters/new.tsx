import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import styles from './new.module.css';
import { useState } from 'react';
import { createCluster } from '../../lib/api';
import HelpIcon from '@mui/icons-material/Help';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

export default function NewCluster() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [nameError, setNameError] = useState(false);
  const [bioError, setBioError] = useState(false);
  const [seedPeerLoadLimitError, setSeedPeerLoadLimitError] = useState(false);
  const [peerLoadLimitError, setPeerLoadLimitError] = useState(false);
  const [numberOfConcurrentDownloadPiecesError, setNumberOfConcurrentDownloadPiecesError] = useState(false);
  const [candidateParentLimitError, setCandidateParentLimitError] = useState(false);
  const [filterParentLimitError, setFilterParentLimitError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [idcError, setIDCError] = useState(false);
  const [cidrsError, setCIDRsError] = useState(false);
  const [cidrs, setCIDRs] = useState([]);
  const [idc, setIDC] = useState([]);
  const [loadingButton, setLoadingButton] = useState(false);
  const cidrsOptions = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];
  const navigate = useNavigate();

  const informationForm = [
    {
      formProps: {
        id: 'name',
        label: 'Name',
        name: 'name',
        required: true,
        autoComplete: 'family-name',
        placeholder: 'Enter your name',
        helperText: nameError ? 'Fill in the characters, the length is 1-40.' : '',
        error: nameError,

        onChange: (e: any) => {
          changeValidate(e.target.value, informationForm[0]);
        },
      },
      syncError: false,
      setError: setNameError,

      validate: (value: string) => {
        const reg = /^(?=.*[A-Za-z0-9@$!%*?&._-])[A-Za-z0-9@$!%*?&._-]{1,40}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'description',
        label: 'Description',
        name: 'description',
        autoComplete: 'family-name',
        placeholder: 'Enter a cluster description',
        helperText: bioError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: bioError,

        onChange: (e: any) => {
          changeValidate(e.target.value, informationForm[1]);
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

  const scopesForm = [
    {
      formProps: {
        id: 'location',
        label: 'Location',
        name: 'location',
        autoComplete: 'family-name',
        placeholder: 'Please enter location',
        helperText: locationError ? 'Fill in the characters, the length is 0-100.' : '',
        error: locationError,

        onChange: (e: any) => {
          changeValidate(e.target.value, scopesForm[0]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The cluster needs to serve all peers in the location. When the location in the peer configuration matches the location in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. It separated by "|", for example "area|country|province|city".`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setLocationError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
    },
    {
      name: 'idc',
      label: 'IDC',
      scopesFormProps: {
        value: idc,
        options: [],
        onChange: (_e: any, newValue: any) => {
          if (!scopesForm[1].formProps.error) {
            setIDC(newValue);
          }
        },

        onInputChange: (e: any) => {
          changeValidate(e.target.value, scopesForm[1]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'idc',
        label: 'IDC',
        name: 'idc',
        placeholder: 'Please enter IDC',
        error: idcError,
        helperText: idcError ? 'Fill in the characters, the length is 0-100.' : '',

        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setIDCError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
    },
    {
      name: 'cidrs',
      label: 'CIDRs',
      scopesFormProps: {
        value: cidrs,
        options: cidrsOptions,

        onChange: (_e: any, newValue: any) => {
          if (!scopesForm[2].formProps.error) {
            setCIDRs(newValue);
          }
        },

        onInputChange: (e: any) => {
          changeValidate(e.target.value, scopesForm[2]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'cidrs',
        label: 'CIDRs',
        name: 'cidrs',
        placeholder: 'Please enter CIDRs',
        error: cidrsError,
        helperText: cidrsError ? 'Fill in the characters, the length is 0-1000.' : '',

        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setCIDRsError,

      validate: (value: string) => {
        const reg = /^(.{0,1000})$/;
        return reg.test(value);
      },
    },
  ];

  const configForm = [
    {
      formProps: {
        id: 'seed peer load limit',
        label: 'Seed Peer load limit',
        name: 'seedPeerLoadLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Seed Peer load limit',
        defaultValue: 300,
        helperText: seedPeerLoadLimitError ? 'Fill in the number, the length is 0-5000.' : '',
        error: seedPeerLoadLimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configForm[0]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`If other peers download from the seed peer, the load of the seed peer will increase. When the load limit of the seed peer is reached, the scheduler will no longer schedule other peers to download from the seed peer until the it has the free load.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setSeedPeerLoadLimitError,

      validate: (value: string) => {
        const reg = /^\+?(\d|[1-4]\d{1,3}|[5-9]\d{1,2}|5000)(\.\d*)?$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'peer load limit',
        label: 'Peer load limit',
        name: 'peerLoadLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Peer load limit',
        defaultValue: 50,
        helperText: peerLoadLimitError ? 'Fill in the number, the length is 0-2000.' : '',
        error: peerLoadLimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configForm[1]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'If other peers download from the peer, the load of the peer will increase. When the load limit of the peer is reached, the scheduler will no longer schedule other peers to download from the peer until the it has the free load.'
              }
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setPeerLoadLimitError,

      validate: (value: string) => {
        const reg = /^(?:[1-9]|[1-9][0-9]{1,2}|2000|0)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'number of concurrent download pieces',
        label: 'Number of concurrent download pieces',
        name: 'numberOfConcurrentDownloadPieces',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Number of concurrent download pieces',
        defaultValue: 4,
        helperText: numberOfConcurrentDownloadPiecesError ? 'Fill in the number, the length is 0-50.' : '',
        error: numberOfConcurrentDownloadPiecesError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configForm[2]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The number of pieces that a peer can concurrent download from other peers.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setNumberOfConcurrentDownloadPiecesError,

      validate: (value: string) => {
        const reg = /^(?:[0-9]|[1-4][0-9]|50)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'candidate parent limit',
        label: 'Candidate parent limit',
        name: 'candidateParentLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Candidate parent limit',
        defaultValue: 4,
        helperText: candidateParentLimitError ? 'Fill in the number, the length is 1-20.' : '',
        error: candidateParentLimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configForm[3]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The maximum number of parents that the scheduler can schedule for download peer.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setCandidateParentLimitError,

      validate: (value: string) => {
        const reg = /^([1-9]|1[0-9]|20)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'filter parent limit',
        label: 'Filter parent limit',
        name: 'filterParentLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Filter parent limit',
        defaultValue: 40,
        fullWidth: false,
        helperText: filterParentLimitError ? 'Fill in the number, the length is 10-1000.' : '',
        error: filterParentLimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configForm[4]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The scheduler will randomly select the  number of parents from all the parents according to the filter parent limit and evaluate the optimal parents in selecting parents for the peer to download task. The number of optimal parent is the scheduling parent limit.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setFilterParentLimitError,

      validate: (value: string) => {
        const reg = /^([1-9][0-9]{1,2}|1000)$/;
        return reg.test(value);
      },
    },
  ];

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);

    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const name = event.currentTarget.elements.name.value;
    const isDefault = event.currentTarget.elements.isDefault.checked;
    const description = event.currentTarget.elements.description.value;
    const location = event.currentTarget.elements.location.value;
    const seedPeerLoadLimit = event.currentTarget.elements.seedPeerLoadLimit.value;
    const peerLoadLimit = event.currentTarget.elements.peerLoadLimit.value;
    const numberOfConcurrentDownloadPieces = event.currentTarget.elements.numberOfConcurrentDownloadPieces.value;
    const candidateParentLimit = event.currentTarget.elements.candidateParentLimit.value;
    const filterParentLimit = event.currentTarget.elements.filterParentLimit.value;

    informationForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const idcs = idc.join('|');

    scopesForm.forEach((item) => {
      if (item.formProps.name === 'location') {
        const value = data.get(item.formProps.name);
        item.setError(!item.validate(value as string));
        item.syncError = !item.validate(value as string);
      }
    });

    configForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(
      !informationForm.filter((item) => item.syncError).length &&
        !scopesForm.filter((item) => item.syncError).length &&
        !configForm.filter((item) => item.syncError).length,
    );

    const formData = {
      name: String(name),
      peer_cluster_config: {
        concurrent_piece_count: Number(numberOfConcurrentDownloadPieces),
        load_limit: Number(peerLoadLimit),
      },
      scheduler_cluster_config: {
        candidate_parent_limit: Number(candidateParentLimit),
        filter_parent_limit: Number(filterParentLimit),
      },
      seed_peer_cluster_config: {
        load_limit: Number(seedPeerLoadLimit),
      },
      bio: description,
      is_default: isDefault,
      scopes: {
        cidrs: cidrs,
        idc: idcs,
        location: location,
      },
    };

    if (canSubmit) {
      try {
        await createCluster({ ...formData });
        setLoadingButton(false);
        setSuccessMessage(true);
        navigate('/clusters');
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setLoadingButton(false);
        }
      }
    } else {
      setLoadingButton(false);
    }
  };

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
  };

  return (
    <Grid>
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
        Create Cluster
      </Typography>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Grid component="form" onSubmit={handleSubmit} noValidate>
        <Box className={styles.container}>
          <Box className={styles.informationTitle}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Information
            </Typography>
            <Tooltip title="The information of cluster." placement="top">
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          <Box className={styles.defaultContainer}>
            <FormControlLabel
              control={<Checkbox sx={{ '&.MuiCheckbox-root': { color: 'var(--button-color)' } }} />}
              label="Set cluster as your default cluster"
              name="isDefault"
              sx={{ '&.MuiFormControlLabel-root': { mr: '0.6rem' } }}
            />
            <Tooltip
              title="When peer does not find a matching cluster based on scopes, the default cluster will be used."
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          <Grid sx={{ display: 'flex' }}>
            {informationForm.map((item) => (
              <TextField
                className={styles.textField}
                color="success"
                size="small"
                key={item.formProps.name}
                {...item.formProps}
              />
            ))}
          </Grid>
          <Box className={styles.scopesTitle}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Scopes
            </Typography>
            <Tooltip
              title="The cluster needs to serve the scope. It wil provide scheduler services and seed peer services to peers in
            the scope."
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          <Grid className={styles.scopesContainer}>
            {scopesForm.map((item) => {
              return (
                <Box key={item.formProps.name}>
                  {item.label === 'CIDRs' ? (
                    <Autocomplete
                      freeSolo
                      multiple
                      disableClearable
                      {...item.scopesFormProps}
                      size="small"
                      className={styles.cidrsInput}
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
                                    'The cluster needs to serve all peers in the CIDRs. The advertise IP will be reported in the peer configuration when the peer is started, and if the advertise IP is empty in the peer configuration, peer will automatically get expose IP as advertise IP. When advertise IP of the peer matches the CIDRs in cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. CIDRs has higher priority than IDC in the scopes.'
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
                  ) : item.label === 'IDC' ? (
                    <Autocomplete
                      freeSolo
                      multiple
                      disableClearable
                      {...item.scopesFormProps}
                      size="small"
                      className={styles.cidrsInput}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                                <Tooltip
                                  title={`The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.`}
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
                  ) : (
                    <TextField size="small" className={styles.textField} color="success" {...item.formProps} />
                  )}
                </Box>
              );
            })}
          </Grid>
          <Box className={styles.configTitle}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Config
            </Typography>
            <Tooltip title=" The configuration for P2P downloads." placement="top">
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          <Grid sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {configForm.map((item) => (
              <TextField
                className={styles.textField}
                color="success"
                size="small"
                required
                key={item.formProps.name}
                {...item.formProps}
              />
            ))}
          </Grid>
        </Box>
        <Divider sx={{ mt: '1rem', mb: '2rem' }} />
        <Box>
          <LoadingButton
            loading={loadingButton}
            endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
            size="small"
            variant="outlined"
            loadingPosition="end"
            id="cancel"
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
              setLoadingButton(true);
              navigate(`/clusters`);
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
            id="save"
            sx={{
              '&.MuiLoadingButton-root': {
                backgroundColor: 'var(--save-color)',
                borderRadius: 0,
                color: 'var(--save-size-color)',
                borderColor: 'var(--save-color)',
              },
              ':hover': { backgroundColor: 'var(--save-hover-corlor)', borderColor: 'var(--save-hover-corlor)' },
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
      </Grid>
    </Grid>
  );
}
