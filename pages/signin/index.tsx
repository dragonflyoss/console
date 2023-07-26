import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import Rotation from 'components/rotation';
import { useState } from 'react';
import { signIn } from 'lib/api';
import styles from './index.module.css';
import { Alert, Backdrop, Snackbar } from '@mui/material';
import { useRouter } from 'next/dist/client/router';
import React from 'react';

export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [pageLoding, setPageLoding] = useState(false);
  const formList = [
    {
      formProps: {
        id: 'account',
        label: 'Account',
        name: 'account',
        autoComplete: 'family-name',
        placeholder: 'Enter your account',
        helperText: accountError ? 'Please enter the correct account number' : '',
        error: accountError,

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
        },
      },
      syncError: false,
      setError: setAccountError,

      validate: (value: string) => {
        const reg = /^[A-Za-z\d]{4,10}$/;
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
        helperText: passwordError ? 'Please enter the correct password ' : '',
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
              {showPassword ? <Visibility /> : <VisibilityOff />}
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

  const theme = createTheme({
    palette: {
      secondary: {
        contrastText: '#fff',
        main: '#2E8F79',
      },
    },
  });

  const router = useRouter();

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
        setPageLoding(true);
        router.push('/clusters');
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
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        <Box component="img" sx={{ width: '4rem', height: '4rem' }} src="/icons/cluster/page-loading.svg" />
      </Backdrop>
      <Grid item xs={6}>
        <Rotation />
      </Grid>
      <Grid item xs={6} className={styles.container}>
        <ThemeProvider theme={theme}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                marginTop: '5rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box component="img" className={styles.logo} src="/images/login/login.svg" />
              <Typography variant="h4" gutterBottom>
                Welcome back!
              </Typography>
              <Typography variant="subtitle1" gutterBottom fontFamily="mabry-light,sans-serif">
                Through which you can easily configure clusters and view cluster information.
              </Typography>
            </Box>
            <Box
              sx={{
                mt: '0.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
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
                <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ mt: '1.4rem' }}>
                  <Typography variant="button">Sign In</Typography>
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
                    <Typography component="span">New to Dragnfly?</Typography>
                    <Link
                      underline="hover"
                      href="/signup"
                      onClick={() => {
                        setPageLoding(true);
                      }}
                      sx={{ color: '#2E8F79', ml: '0.4rem' }}
                    >
                      <Typography component="span">Create an account.</Typography>
                    </Link>
                  </Grid>
                </Box>
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
      </Grid>
    </Grid>
  );
}
