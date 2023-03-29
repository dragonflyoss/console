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
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signIn } from 'lib/api';
import styles from './index.module.css';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [accountHelptext, setAccountHelptext] = useState('');
  const [passwordHelptext, setPasswordHelptext] = useState('');

  const formList = [
    {
      formProps: {
        id: 'account',
        label: 'Account',
        name: 'account',
        autoComplete: 'family-name',
        placeholder: 'Enter your account',
        helperText: accountError ? accountHelptext : '',
        error: accountError,
      },
      setError: setAccountError,
    },
    {
      formProps: {
        id: 'password',
        label: 'Password',
        name: 'password',
        type: showPassword ? 'text' : 'password',
        autoComplete: 'password',
        placeholder: 'Enter your password',
        helperText: passwordError ? passwordHelptext : '',
        error: passwordError,

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
      setError: setPasswordError,
    },
  ];

  const theme = createTheme({
    palette: {
      secondary: {
        contrastText: '#fff',
        main: '#239b56',
      },
    },
  });

  const router = useRouter();

  const handlePassword = () => {
    setShowPassword((show) => !show);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const accountElement = event.currentTarget.elements.account;
    const passwordElement = event.currentTarget.elements.password;

    if (accountElement.value !== '' && passwordElement.value !== '') {
      signIn({
        name: accountElement.value,
        password: passwordElement.value,
      }).then((res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          router.push('/security');
        } else {
          setAccountError(true);
          setPasswordError(true);
          setPasswordHelptext('Please enter the correct password');
          setAccountHelptext('Please enter the correct account number ');
        }
      });
    }
  };

  return (
    <Grid
      container
      style={{
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Grid item xs={6}>
        <Rotation />
      </Grid>
      <Grid item xs={6}>
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
              <picture>
                <img className={styles.logo} src="/images/login/logo.png" alt="" />
              </picture>{' '}
              <Typography variant="h4" gutterBottom>
                Welcome back!
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                through which you can easily configure clusters and view cluster information.
              </Typography>
            </Box>
            <Box
              sx={{
                marginTop: '0.2rem',
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
                <Button type="submit" fullWidth variant="contained" sx={{ mt: '1.4rem' }} color="secondary">
                  Sign In
                </Button>
                <Box
                  sx={{
                    mt: '1.2rem',
                    mb: '0.8rem',
                    height: '2rem',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}
                >
                  <span className={styles.borderLeft}></span>
                  <span className={styles.text}>or</span>
                  <span className={styles.bordeRight}></span>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  <Grid>
                    <span>New to Dragnfly? </span>
                    <Link href="/signup">Create an account.</Link>
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
