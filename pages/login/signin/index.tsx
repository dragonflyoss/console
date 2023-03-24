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
import Rotation from 'components/login/rotation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signIn } from 'lib/api';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [accountHelptext, setAccountHelptext] = useState('');
  const [passwordHelptext, setPasswordHelptext] = useState('');

  const theme = createTheme();
  const router = useRouter();

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

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
                handleClickShowPassword();
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

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const fromData: any = {};
    const data = new FormData(event.currentTarget);
    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      fromData[item.formProps.name] = value;
    });

    if (fromData.account !== '' && fromData.password !== '') {
      try {
        signIn({
          name: fromData.account,
          password: fromData.password,
        }).then((res) => {
          if (res.Status === 200) {
            router.push('/security');
          }
        });
      } catch (error) {
        setAccountError(true);
        setPasswordError(true);
        setPasswordHelptext('Please enter the correct password');
        setAccountHelptext('Please enter the correct account number ');
      }
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
                <img
                  style={{
                    width: '3rem',
                    height: '3rem',
                    marginBottom: '1rem',
                  }}
                  src="/logoinImage/logo.png"
                  alt=""
                />
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: '1.4rem', mb: '1.4rem' }}
                  style={{ background: '#239B56' }}
                >
                  Sign In
                </Button>
                <Box
                  sx={{
                    height: '2rem',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '9rem',
                      border: '0.08rem solid rgb(123, 123, 123)',
                    }}
                  ></span>
                  <span
                    style={{
                      margin: '0 ,15',
                      verticalAlign: 'middle',
                    }}
                  >
                    or
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '9em',
                      border: '0.08rem solid rgb(123, 123, 123)',
                    }}
                  ></span>
                </Box>
                <Box
                  sx={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontSize: 18,
                  }}
                >
                  <Grid>
                    <span>New to Dragnfly? </span>
                    <Link href="/login/signup">Create an account.</Link>
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
