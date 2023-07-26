import Layout from 'components/layout';
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
import { LoadingButton } from '@mui/lab';
import styles from './index.module.css';
import HelpIcon from '@mui/icons-material/Help';
import { ReactElement, useEffect, useState } from 'react';
import { getCluster, updateCluster } from 'lib/api';
import React from 'react';
import { useRouter } from 'next/router';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CreateCluster = () => {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setbioError] = useState(false);
  const [seedPeerLoadLimitError, setSeedPeerLoadLimitError] = useState(false);
  const [peerLoadLimitError, setPeerLoadLimitError] = useState(false);
  const [numberOfConcurrentDownloadPiecesError, setNumberOfConcurrentDownloadPiecesError] = useState(false);
  const [candidateParentLimitError, setCandidateParentLimitError] = useState(false);
  const [filterParentLimitError, setFilterParentLimitError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [idcError, setIDCError] = useState(false);
  const [cidrsError, setCIDRsError] = useState(false);
  const [editLoadingButton, setEditLoadingButton] = useState(false);
  const [clusters, setClusters] = useState({
    id: '',
    bio: '',
    scopes: {
      idc: '',
      location: '',
      cidrs: [''],
    },
    scheduler_cluster_id: 0,
    seed_peer_cluster_id: 0,
    scheduler_cluster_config: {
      candidate_parent_limit: 0,
      filter_parent_limit: 0,
    },
    seed_peer_cluster_config: {
      load_limit: 0,
    },
    peer_cluster_config: {
      load_limit: 0,
      concurrent_piece_count: 0,
    },
    created_at: '',
    updated_at: '',
    is_default: true,
  });
  const cidrsOptions: never[] = [];
  const router = useRouter();

  const {
    bio,
    is_default,
    id,
    peer_cluster_config: { load_limit, concurrent_piece_count },
    scheduler_cluster_config: { candidate_parent_limit, filter_parent_limit },
    scopes: { idc, location, cidrs },
    seed_peer_cluster_config,
  } = clusters;

  useEffect(() => {
    (async function () {
      try {
        if (typeof router.query.slug === 'string') {
          const response = await getCluster(router.query.slug);
          setClusters(await response.json());
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, [router.query.slug]);

  const informationForm = [
    {
      formProps: {
        id: 'bio',
        label: 'Description',
        name: 'bio',
        autoComplete: 'family-name',
        value: bio,
        placeholder: 'Please enter Description',
        helperText: bioError ? 'Must be a number and range from 0-1000' : '',
        error: bioError,

        onChange: (e: any) => {
          setClusters({ ...clusters, bio: e.target.value });
          changeValidate(e.target.value, informationForm[0]);
        },
      },
      syncError: false,
      setError: setbioError,

      validate: (value: string) => {
        const reg = /^[A-Za-z0-9]{0,1000}$/;
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
        placeholder: 'Please enter Location',
        value: location,
        helperText: locationError ? 'Maximum length is 100' : '',
        error: locationError,

        onChange: (e: any) => {
          setClusters({ ...clusters, scopes: { ...clusters.scopes, location: e.target.value } });
          changeValidate(e.target.value, scopesForm[0]);
        },
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'The cluster needs to serve all peers in the location. When the location in the peer configuration matches the location in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. It separated by "|", for example "area|country|province|city".'
              }
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
      formProps: {
        id: 'idc',
        label: 'IDC',
        name: 'idc',
        autoComplete: 'family-name',
        placeholder: 'Please enter IDC',
        value: idc,
        helperText: idcError ? 'Maximum length is 100' : '',
        error: idcError,
        onChange: (e: any) => {
          setClusters({ ...clusters, scopes: { ...clusters.scopes, idc: e.target.value } });
          changeValidate(e.target.value, scopesForm[1]);
        },
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'String	The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.'
              }
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.descriptionIcon} />
            </Tooltip>
          ),
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
      CIDRsFormProps: {
        value: cidrs || [],
        options: cidrsOptions,

        onChange: (_e: any, newValue: any) => {
          if (!scopesForm[2].formProps.error) {
            setClusters({ ...clusters, scopes: { ...clusters.scopes, cidrs: newValue } });
          }
        },
        onInputChange: (e: any) => {
          changeValidate(e.target.value, scopesForm[2]);
        },
        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => <Chip key={index} label={option} {...getTagProps({ index })} />),
      },
      formProps: {
        id: 'cidrs',
        label: 'CIDRs',
        name: 'cidrs',
        placeholder: 'Please enter CIDRs',
        error: cidrsError,
        helperText: cidrsError ? 'Length: (0, 100]' : '',

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
        value: seed_peer_cluster_config?.load_limit,
        helperText: seedPeerLoadLimitError ? 'Must be a number and range from 0-5000' : '',
        error: seedPeerLoadLimitError,

        onChange: (e: any) => {
          setClusters({
            ...clusters,
            seed_peer_cluster_config: { ...clusters.seed_peer_cluster_config, load_limit: e.target.value },
          });
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
        helperText: peerLoadLimitError ? 'Must be a number and range from 0-2000' : '',
        error: peerLoadLimitError,
        value: load_limit,

        onChange: (e: any) => {
          setClusters({
            ...clusters,
            peer_cluster_config: { ...clusters.peer_cluster_config, load_limit: e.target.value },
          });
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
        const reg = /^0*1\d{3}$|2000|^0*[1-9]\d{0,2}$|^0*$/;
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
        value: concurrent_piece_count,
        helperText: numberOfConcurrentDownloadPiecesError ? 'Must be a number and range from 0-50' : '',
        error: numberOfConcurrentDownloadPiecesError,

        onChange: (e: any) => {
          setClusters({
            ...clusters,
            peer_cluster_config: { ...clusters.peer_cluster_config, concurrent_piece_count: e.target.value },
          });
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
        value: candidate_parent_limit,
        helperText: candidateParentLimitError ? 'Must be a number and range from 1-20' : '',
        error: candidateParentLimitError,

        onChange: (e: any) => {
          setClusters({
            ...clusters,
            scheduler_cluster_config: {
              ...clusters.scheduler_cluster_config,
              candidate_parent_limit: e.target.value,
            },
          });
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
        name: 'filter parent limit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Filter parent limit',
        value: filter_parent_limit,
        helperText: filterParentLimitError ? 'Must be a number and range from 10-1000' : '',
        error: filterParentLimitError,

        onChange: (e: any) => {
          setClusters({
            ...clusters,
            scheduler_cluster_config: {
              ...clusters.scheduler_cluster_config,
              filter_parent_limit: e.target.value,
            },
          });
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

  const handleSubmit = async (event: any) => {
    setEditLoadingButton(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    informationForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
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

    const formdata = {
      is_default: is_default,
      bio: String(bio),
      peer_cluster_config: {
        concurrent_piece_count: Number(concurrent_piece_count),
        load_limit: Number(load_limit),
      },
      scheduler_cluster_config: {
        candidate_parent_limit: Number(candidate_parent_limit),
        filter_parent_limit: Number(filter_parent_limit),
      },
      scopes: {
        cidrs: cidrs,
        idc: String(idc),
        location: String(location),
      },
      seed_peer_cluster_config: {
        load_limit: Number(seed_peer_cluster_config.load_limit),
      },
    };

    if (canSubmit && typeof router.query.slug === 'string') {
      try {
        await updateCluster(router.query.slug, { ...formdata });
        setEditLoadingButton(false);
        setSuccessMessage(true);
        router.push(`/clusters/${router.query.slug}`);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setEditLoadingButton(false);
        }
      }
    }
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
        Update Cluster
      </Typography>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Grid className={styles.container} component="form" noValidate onSubmit={handleSubmit}>
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
            control={
              <Checkbox
                checked={is_default}
                onChange={(event: { target: { checked: any } }) => {
                  setClusters({ ...clusters, is_default: event.target.checked });
                }}
                sx={{ '&.MuiCheckbox-root': { color: 'var(--button-color)' } }}
              />
            }
            label="Set cluster as your default cluster"
            name="IsDefault"
            sx={{ '&.MuiFormControlLabel-root': { mr: '0.6rem' } }}
          />
          <Tooltip
            title="When peer does not find a matching cluster based on scopes, the default cluster will be used."
            placement="top"
          >
            <HelpIcon color="disabled" className={styles.descriptionIcon} />
          </Tooltip>
        </Box>
        {informationForm.map((item) => (
          <TextField
            size="small"
            color="success"
            key={item.formProps.name}
            {...item.formProps}
            className={styles.textField}
          />
        ))}
        <Box className={styles.scopesTitle}>
          <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
            scopes
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
                    {...item.CIDRsFormProps}
                    size="small"
                    className={styles.cidrsInput}
                    renderInput={(params) => <TextField {...params} color="success" {...item.formProps} />}
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
        <Grid className={styles.configContainer}>
          {configForm.map((item) => (
            <TextField
              size="small"
              className={styles.textField}
              color="success"
              key={item.formProps.name}
              {...item.formProps}
            />
          ))}
        </Grid>
        <Box className={styles.footerButton}>
          <LoadingButton
            loading={editLoadingButton}
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
              setEditLoadingButton(true);

              router.push(`/clusters/${id}`);
            }}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={editLoadingButton}
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
};

export default CreateCluster;

CreateCluster.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
