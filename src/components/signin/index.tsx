import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import Rotation from '../rotation';
import { useEffect, useState } from 'react';
import { signIn } from '../../lib/api';
import styles from './index.module.css';
import { Alert, Backdrop, Snackbar, Link as RouterLink, Button } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../lib/utils';
import { ReactComponent as Login } from '../../assets/images/login/login.svg';
import { ReactComponent as PageLoading } from '../../assets/images/login/page-loading.svg';
import { DarkMode } from '../dark-layout';
import ErrorHandler from '../error-handler';

export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [pageLoding, setPageLoding] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const formList = [
    {
      formProps: {
        id: 'account',
        label: 'Account',
        name: 'account',
        autoComplete: 'family-name',
        placeholder: 'Enter your account',
        helperText: accountError ? 'Fill in the characters, the length is 3-10.' : '',
        error: accountError,

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
        },
      },
      syncError: false,
      setError: setAccountError,

      validate: (value: string) => {
        const reg = /^(?=.*[A-Za-z0-9@$!%*?&._-])[A-Za-z0-9@$!%*?&._-]{3,10}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'password',
        label: 'Password',
        name: 'password',
        type: showPassword ? 'text' : 'password',
        autoComplete: 'password',
        placeholder: 'Enter your password',
        helperText: passwordError ? 'Fill in the characters, the maximum length is 16.' : '',
        error: passwordError,

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
        },

        InputProps: {
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword();
              }}
              edge="end"
            >
              {showPassword ? <Visibility id="visibility" /> : <VisibilityOff id="visibility-off" />}
            </IconButton>
          ),
        },
      },
      syncError: false,
      setError: setPasswordError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])[^]{0,16}$/;
        return reg.test(value);
      },
    },
  ];

  useEffect(() => {
    setPageTitle(location.pathname);
  }, [location]);

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handlePassword = () => {
    setShowPassword((show) => !show);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const accountElement = event.currentTarget.elements.account;
    const passwordElement = event.currentTarget.elements.password;

    const data = new FormData(event.currentTarget);

    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length);
    if (canSubmit) {
      try {
        await signIn({
          name: accountElement.value,
          password: passwordElement.value,
        });

        if (accountElement.value === 'root' && passwordElement.value === 'dragonfly') {
          navigate('/clusters', { state: { firstLogin: true } });
        } else {
          navigate('/clusters');
        }

        setPageLoding(true);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    }
  };

  const handleClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Grid container className={styles.page}>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Backdrop
        open={pageLoding}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      >
        <PageLoading className={styles.pageLoading} />
      </Backdrop>
      <Grid size={6}>
        <Rotation />
      </Grid>
      <Grid size={6} className={styles.container}>
        <DarkMode className={styles.header} />
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: '5rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Login className={styles.logo} />
            <Typography variant="h4" gutterBottom>
              Welcome back!
            </Typography>
            <Typography variant="body1" gutterBottom fontFamily="mabry-light,sans-serif">
              Through which you can easily configure clusters and view cluster information.
            </Typography>
          </Box>
          <Box className={styles.formWrapper}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {formList.map((item) => (
                <TextField
                  margin="normal"
                  color="success"
                  required
                  fullWidth
                  key={item.formProps.name}
                  {...item.formProps}
                />
              ))}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: '1.4rem',
                  background: 'var(--palette-description-color)',
                  color: 'var(--palette-button-text-color)',
                  ':hover': { backgroundColor: 'var(--palette-sign-hover-button-text-color)' },
                }}
              >
                <Typography variant="button">Sign In</Typography>
              </Button>
              <Box className={styles.separationLineContainer}>
                <Typography component="span" className={styles.separationLine}></Typography>
                <Typography component="span" className={styles.text}>
                  or
                </Typography>
                <Typography component="span" className={styles.separationLine}></Typography>
              </Box>
              <Box className={styles.createAccountWrapper}>
                <Grid>
                  <Typography component="span" fontFamily="-moz-initial">
                    New to Dragonfly?
                  </Typography>
                  <RouterLink
                    id="create-account"
                    underline="hover"
                    component={Link}
                    to="/signup"
                    onClick={() => {
                      setPageLoding(true);
                    }}
                    sx={{ color: '#2E8F79', ml: '0.4rem' }}
                  >
                    <Typography component="span">Create an account.</Typography>
                  </RouterLink>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
}
