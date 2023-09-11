import {
  Box,
  Typography,
  Divider,
  FormControl,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  createTheme,
  ThemeProvider,
  Snackbar,
  Alert,
  Tooltip,
  InputLabel,
  FormGroup,
  FormHelperText,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { formatDate, getExpiredTime } from '../../../lib/utils';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken, updateTokens } from '../../../lib/api';
import HelpIcon from '@mui/icons-material/Help';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const theme = createTheme({
  palette: {
    secondary: {
      main: '#1c293a',
    },
  },
});

export default function UpdateTokens() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setBioError] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [expiredTime, setExpiredTime] = useState('');
  const [expiredTimeError, setExpiredTimeError] = useState(false);
  const [preheat, setPreheat] = useState(false);
  const [job, setJob] = useState(false);
  const [cluster, setCluster] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [tokens, setTokens] = useState({ name: '', bio: '', scopes: [''], expired_at: '', state: '', id: 0 });

  const formList = [
    {
      formProps: {
        id: 'bio',
        label: 'Description',
        name: 'bio',
        autoComplete: 'family-name',
        placeholder: 'Enter your description',
        value: tokens.bio,
        helperText: bioError ? 'The length is 1-1000' : '',
        error: bioError,

        InputProps: {
          endAdornment: (
            <Tooltip title="Personal access token description." placement="top">
              <HelpIcon
                color="disabled"
                sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
              />
            </Tooltip>
          ),
        },

        onChange: (e: any) => {
          setTokens({ ...tokens, bio: e.target.value });
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

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    (async function () {
      try {
        if (params?.id) {
          const tokens = await getToken(params?.id);
          setTokens(tokens);
          setExpiredTime(tokens.expired_at);
          setPreheat(tokens.scopes.includes('preheat'));
          setJob(tokens.scopes.includes('job'));
          setCluster(tokens.scopes.includes('cluster'));
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, [params]);

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSelectExpiredTime = (event: SelectChangeEvent) => {
    setExpiredTimeError(false);
    setSelectedTime(event.target.value);

    const time = getExpiredTime(Number(event.target.value));
    setExpiredTime(time);
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);
    event.preventDefault();

    const scopes = [preheat ? 'preheat' : '', job ? 'job' : '', cluster ? 'cluster' : ''];
    const filteredScopes = scopes.filter((item) => item !== '');

    const data = new FormData(event.currentTarget);

    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length);

    const formData = { bio: tokens.bio, expired_at: expiredTime, scopes: filteredScopes };

    if (!selectedTime) {
      setExpiredTimeError(true);
      setLoadingButton(false);
    } else {
      if (canSubmit) {
        try {
          if (params.id) {
            const tokens = await updateTokens(params.id, { ...formData });
            setLoadingButton(false);
            setSuccessMessage(true);

            const token = tokens.token;
            localStorage.setItem('token', JSON.stringify(token));
            navigate('/developer/personal-access-tokens');
          }
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
      <ThemeProvider theme={theme}>
        <Typography variant="h5" fontFamily="mabry-bold">
          Update personal access token
        </Typography>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Paper
          variant="outlined"
          sx={{ flexGrow: '1', display: 'inline-flex', alignItems: 'center', mb: '1rem', p: '1rem' }}
        >
          <Box component="img" src="/icons/tokens/key.svg" sx={{ width: '2.6rem', height: '2.6rem', mr: '1rem' }} />
          <Box>
            <Typography component="div" variant="body1" fontFamily="mabry-bold">
              ID:&nbsp;&nbsp;{tokens.id}
            </Typography>
            <Typography component="div" variant="body1" fontFamily="mabry-bold">
              Name:&nbsp;&nbsp;{tokens.name}
            </Typography>
          </Box>
        </Paper>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormControl fullWidth>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                Information
              </Typography>
              <Tooltip title="  The information of personal access token." placement="top">
                <HelpIcon
                  color="disabled"
                  sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
                />
              </Tooltip>
            </Box>
            {formList.map((item) => (
              <TextField
                margin="normal"
                color="success"
                required
                size="small"
                key={item.formProps.name}
                {...item.formProps}
                sx={{ width: '20rem' }}
              />
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: '1.4rem', mt: '1rem' }}>
              <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                Expiration
              </Typography>
              <Tooltip title="Expiration of personal access token." placement="top">
                <HelpIcon
                  color="disabled"
                  sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
                />
              </Tooltip>
            </Box>
            <FormControl size="small" error={expiredTimeError}>
              <InputLabel color="secondary" id="demo-simple-select-label">
                Expiration
              </InputLabel>
              <Box display="flex" alignItems="center">
                <Box>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedTime}
                    label="Expiration"
                    onChange={handleSelectExpiredTime}
                    color="secondary"
                    sx={{ width: '10rem' }}
                  >
                    <MenuItem value={7}>7 days</MenuItem>
                    <MenuItem value={30}>30 days</MenuItem>
                    <MenuItem value={60}>60 days</MenuItem>
                    <MenuItem value={90}>90 days</MenuItem>
                    <MenuItem value={'3650'}>10 years</MenuItem>
                  </Select>
                  {expiredTimeError && <FormHelperText>Please select an option.</FormHelperText>}
                </Box>
                <Typography variant="body2" color="text.primary" ml="1rem">
                  The token expires on {formatDate(expiredTime) || ''}.
                </Typography>
              </Box>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.8rem', mt: '1rem' }}>
              <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
                Select scopes
              </Typography>
              <Tooltip title="Scopes define the access for personal tokens." placement="top">
                <HelpIcon
                  color="disabled"
                  sx={{ width: '0.8rem', height: '0.8rem', ':hover': { color: 'var(--description-color)' } }}
                />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
              <FormGroup>
                <Box display="flex" alignItems="center">
                  <Box width="10%">
                    <FormControlLabel
                      label="preheat"
                      control={
                        <Checkbox
                          checked={preheat}
                          onChange={(event: any) => {
                            setPreheat(event.target.checked);
                          }}
                          sx={{ color: 'var(--button-color)!important' }}
                        />
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="rgb(82 82 82 / 87%)" ml="1rem">
                    Full control of preheating, it's used for preheating of harbor.
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box width="10%">
                    <FormControlLabel
                      label="job"
                      control={
                        <Checkbox
                          checked={job}
                          onChange={(event: any) => {
                            setJob(event.target.checked);
                          }}
                          sx={{ color: 'var(--button-color)!important' }}
                        />
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="rgb(82 82 82 / 87%)" ml="1rem">
                    Full control of job, if you need to call preheat job through open API, it is recommended to use
                    preheat job.
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box width="10%">
                    <FormControlLabel
                      label="cluster"
                      control={
                        <Checkbox
                          checked={cluster}
                          onChange={(event: any) => {
                            setCluster(event.target.checked);
                          }}
                          sx={{ color: 'var(--button-color)!important' }}
                        />
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="rgb(82 82 82 / 87%)" ml="1rem">
                    Full control of cluster.
                  </Typography>
                </Box>
              </FormGroup>
            </Box>
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
                  navigate('/developer/personal-access-tokens');
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
    </Box>
  );
}
