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

export default function CreateTokens(props: any) {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setBioError] = useState(false);
  const [time, setTiem] = useState('');
  const [expiration, setExpiration] = useState('');
  const [expirationError, setExpirationError] = useState(false);
  const [preheat, setPreheat] = useState(false);
  const [job, setJob] = useState(false);
  const [editLoadingButton, setEditLoadingButton] = useState(false);
  const [token, setToken] = useState({ name: '', bio: '', scopes: [''], expired_at: '', state: '', id: 0 });
  const updateFormList = [
    {
      formProps: {
        id: 'Bio',
        label: 'Description',
        name: 'Bio',
        autoComplete: 'family-name',
        placeholder: 'Enter your Note',
        value: token.bio,
        helperText: bioError ? 'Please enter Description' : '',
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
          setToken({ ...token, bio: e.target.value });
          changeValidate(e.target.value, updateFormList[0]);
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
          const token = await getToken(params?.id);
          setToken(token);
          setExpiration(token.expired_at);
          setPreheat(token.scopes.includes('preheat'));
          setJob(token.scopes.includes('job'));
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

  const handleChangeSelect = (event: SelectChangeEvent) => {
    setExpirationError(false);
    setTiem(event.target.value);
    const time = getExpiredTime(Number(event.target.value));
    setExpiration(time);
  };

  const handleSubmit = async (event: any) => {
    setEditLoadingButton(true);
    event.preventDefault();

    const scopes = [preheat ? 'preheat' : '', job ? 'job' : ''];
    const filteredScopes = scopes.filter((item) => item !== '');

    const data = new FormData(event.currentTarget);

    updateFormList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!updateFormList.filter((item) => item.syncError).length);

    const formData = { bio: token.bio, expired_at: expiration, scopes: filteredScopes };

    if (!time) {
      setExpirationError(true);
      setEditLoadingButton(false);
    } else {
      if (canSubmit) {
        try {
          if (params.id) {
            const response = await updateTokens(params.id, { ...formData });
            setEditLoadingButton(false);
            setSuccessMessage(true);
            const token = response.token;
            localStorage.setItem('token', JSON.stringify(token));
            navigate('/developer/personal-access-tokens');
          }
        } catch (error) {
          if (error instanceof Error) {
            setEditLoadingButton(false);
            setErrorMessage(true);
            setErrorMessageText(error.message);
          }
        }
      } else {
        setEditLoadingButton(false);
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
        Update personal access token
      </Typography>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', mb: '1rem', width: '20rem', p: '1rem' }}>
          <Box component="img" src="/icons/tokens/key.svg" sx={{ width: '2.6rem', height: '2.6rem', mr: '1rem' }} />
          <Box>
            <Typography component="div" variant="body1" fontFamily="mabry-bold">
              ID:&nbsp;&nbsp;{token.id}
            </Typography>
            <Typography component="div" variant="body1" fontFamily="mabry-bold">
              Name:&nbsp;&nbsp;{token.name}
            </Typography>
          </Box>
        </Paper>
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
          {updateFormList.map((item) => (
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
          <FormControl size="small" error={expirationError}>
            <InputLabel color="secondary" id="demo-simple-select-label">
              Expiration
            </InputLabel>
            <Box display="flex" alignItems="center">
              <Box>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={time}
                  label="Expiration"
                  onChange={handleChangeSelect}
                  color="secondary"
                  sx={{ width: '10rem' }}
                >
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={60}>60 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                  <MenuItem value={'3650'}>10 years</MenuItem>
                </Select>
                {expirationError && <FormHelperText>Please select an option.</FormHelperText>}
              </Box>
              <Typography variant="body2" color="text.primary" ml="1rem">
                The token expires on {formatDate(expiration) || ''}.
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
            </FormGroup>
          </Box>
          <Box sx={{ mt: '2rem' }}>
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
                navigate('/developer/personal-access-tokens');
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
