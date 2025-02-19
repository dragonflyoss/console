import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { Alert, Backdrop, Box, Grid, InputAdornment, Snackbar, Link as RouterLink } from '@mui/material';
import Rotation from '../rotation';
import { signUp } from '../../lib/api';
import styles from './index.module.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../lib/utils';
import { ReactComponent as Login } from '../../assets/images/login/login.svg';
import HeaderLayout from '../dark-layout';

export default function SignUp() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [accountError, setAccountError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPassworError, setConfirmPassworError] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoding, setPageLoding] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const formList = [
    {
      formProps: {
        name: 'username',
        label: 'Account',
        autoComplete: 'family-name',
        id: 'account',
        placeholder: 'Enter your account',
        error: accountError,
        helperText: accountError ? 'Fill in the characters, the length is 3-10.' : '',

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
        name: 'email',
        label: 'Email',
        autoComplete: 'email',
        id: 'email',
        placeholder: 'Enter your email',
        error: emailError,
        helperText: emailError ? 'Email is invalid or already taken.' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
        },
      },
      syncError: false,
      setError: setEmailError,

      validate: (value: string) => {
        const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'password',
        label: 'Password',
        id: 'password',
        placeholder: 'Enter your password',
        autoComplete: 'new-password',
        helperText: passwordError ? `At least 8-16 characters, with at least 1 lowercase letter and 1 number.` : '',
        type: showPassword ? 'text' : 'password',
        error: passwordError,
        InputProps: {
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('password');
              }}
              edge="end"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        },

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[2], () => {
            setPassword(e.target.value);
          });
        },
      },
      syncError: false,
      setError: setPasswordError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'confirmPassword',
        label: 'ConfirmPassword',
        id: 'confirmPassword',
        type: showConfirmPassword ? 'text' : 'password',
        autoComplete: 'new-password',
        placeholder: 'Repeat your new password',
        error: confirmPassworError,
        helperText: confirmPassworError ? 'Please enter the same password.' : '',

        InputProps: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => {
                  handlePassword('confirmPassword');
                }}
                edge="end"
              >
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        },

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[3]);
        },
      },

      syncError: false,
      setError: setConfirmPassworError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return value === password && reg.test(value);
      },
    },
  ];

  useEffect(() => {
    setPageTitle(location.pathname);
  }, [location]);

  const handlePassword = (type: 'password' | 'confirmPassword') => {
    if (type === 'password') {
      setShowPassword((show) => !show);
    } else {
      setShowConfirmPassword((show) => !show);
    }
  };

  const changeValidate = (value: string, data: any, cb?: () => void) => {
    const { setError, validate } = data;
    setError(!validate(value));
    cb && cb();
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const accountElement = event.currentTarget.elements.username;
    const emailElement = event.currentTarget.elements.email;
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
        await signUp({
          name: accountElement.value,
          password: passwordElement.value,
          email: emailElement.value,
        });

        setPageLoding(true);
        navigate('/signin');
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
      <Backdrop
        open={pageLoding}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      >
        <Box component="img" sx={{ width: '4rem', height: '4rem' }} src="/icons/cluster/page-loading.svg" />
      </Backdrop>
      <Grid item xs={6}>
        <Rotation />
      </Grid>
      <Grid item xs={6} className={styles.container}>
        <Box className={styles.header}>
          <HeaderLayout />
        </Box>
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              mt: '5rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Login className={styles.logo} />
            <Typography variant="h5" gutterBottom>
              Registered Account
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: '1rem' }}>
              <Grid container spacing={3}>
                {formList.map((item) => (
                  <Grid item key={item.formProps.name} xs={12}>
                    <TextField required fullWidth color="success" {...item.formProps} />
                  </Grid>
                ))}
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: '1.4rem',
                  background: 'var(--description-color)',
                  color: 'var(--button-text-color)',
                  ':hover': { backgroundColor: 'var(--hover-button-text-color)' },
                }}
              >
                <Typography variant="button">Sign Up</Typography>
              </Button>
              <Box className={styles.separationLineContainer}>
                <Typography component="span" className={styles.separationLine}></Typography>
                <Typography component="span" className={styles.text}>
                  or
                </Typography>
                <Typography component="span" className={styles.separationLine}></Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Grid>
                  <Typography component="span">Already have an account?</Typography>
                  <RouterLink
                    underline="hover"
                    component={Link}
                    to="/signin"
                    onClick={() => {
                      setPageLoding(true);
                    }}
                    sx={{ color: '#2E8F79', ml: '0.4rem' }}
                  >
                    <Typography component="span">Sign in</Typography>
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
