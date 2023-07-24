import Layout from 'components/layout';
import { NextPageWithLayout } from '../_app';
import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useState, useEffect, ReactElement } from 'react';
import { updateUser, getUser, updatePassword, signOut } from 'lib/api';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import styles from './index.module.css';
import { datetime, getUserID } from 'lib/utils';

const Profile: NextPageWithLayout = () => {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bioError, setBioError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [Bio, setBio] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoadingButton, setPasswordLoadingButton] = useState(false);
  const [personalLoadingButton, setPersonalLoadingButton] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(true);
  const [showPersonalInformation, setShowPersonalInformation] = useState(true);
  const [userID, setUserID] = useState('');
  const [user, setUser] = useState<any>({
    bio: '',
    avatar: '',
    id: '',
    name: '',
    email: '',
    location: '',
    phone: '',
    created_at: '',
    formBio: '',
  });
  const [passwordObjet, setPasswordObjet] = useState({
    old_password: '',
    new_password: '',
  });
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    const userID = getUserID();
    setUserID(userID);

    if (userID) {
      getUser(userID).then(async (response) => {
        if (response.status === 200) {
          const res = await response.json();
          setUser(res);
          setBio(res.bio);
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });
    }

    setIsLoading(false);
  }, []);

  const { bio, email, phone, location } = user;
  const { old_password, new_password } = passwordObjet;

  const userList = [
    {
      name: 'id',
      label: 'ID',
      icon: <Box component="img" className={styles.userIcon} src="/icons/user/id.svg" />,
    },
    {
      name: 'name',
      label: 'Name',
      icon: <Box component="img" className={styles.userIcon} src="/icons/user/name.svg" />,
    },
    {
      name: 'email',
      label: 'Email',
      icon: <Box component="img" className={styles.userIcon} src="/icons/user/email.svg" />,
    },
    {
      name: 'location',
      label: 'Location',
      icon: <Box component="img" className={styles.userIcon} src="/icons/user/location.svg" />,
    },
    {
      name: 'phone',
      label: 'Phone',
      icon: <Box component="img" className={styles.userIcon} src="/icons/user/phone.svg" />,
    },
    {
      name: 'created_at',
      label: 'created_at',
      icon: <Box component="img" className={styles.userIcon} src="/icons/user/created-at.svg" />,
    },
  ];

  const formList = [
    {
      formProps: {
        id: 'bio',
        label: 'Bio',
        name: 'bio',
        multiline: true,
        autoComplete: 'family-name',
        placeholder: 'Enter your Bio',
        helperText: bioError ? 'The length is 0-1000' : '',
        error: bioError,
        value: bio,

        onChange: (e: any) => {
          setUser({ ...user, bio: e.target.value });
          changeValidate(e.target.value, formList[0]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <DescriptionIcon />:
            </InputAdornment>
          ),
        },
      },

      syncError: false,
      setError: setBioError,

      validate: (value: string) => {
        const reg = /^[\s\S]{0,1000}$/;
        return reg.test(value);
      },
    },

    {
      formProps: {
        id: 'Phone',
        label: 'Phone',
        name: 'Phone',
        autoComplete: 'family-name',
        value: phone,
        placeholder: 'Enter your Phone',
        helperText: phoneError ? 'Please enter the correct phone number' : '',
        error: phoneError,

        onChange: (e: any) => {
          setUser({ ...user, phone: e.target.value });
          changeValidate(e.target.value, formList[1]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LocalPhoneIcon />:
            </InputAdornment>
          ),
        },
      },
      syncError: false,
      setError: setPhoneError,

      validate: (value: string) => {
        const reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$|^$/;
        return reg.test(value);
      },
    },

    {
      formProps: {
        id: 'location',
        label: 'Location',
        name: 'location',
        autoComplete: 'family-name',
        value: location,
        placeholder: 'Enter your location',
        helperText: locationError ? 'Please enter your address' : '',
        error: locationError,

        onChange: (e: any) => {
          setUser({ ...user, location: e.target.value });
          changeValidate(e.target.value, formList[2]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnIcon />:
            </InputAdornment>
          ),
        },
      },
      syncError: false,
      setError: setLocationError,

      validate: (value: string) => {
        const reg = /^[A-Za-z0-9]{0,1000}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'Email',
        label: 'Email',
        name: 'Email',
        autoComplete: 'family-name',
        value: email,
        placeholder: 'Enter your Email',
        helperText: emailError ? 'Please enter the correct email format' : '',
        error: emailError,

        onChange: (e: any) => {
          setUser({ ...user, email: e.target.value });
          changeValidate(e.target.value, formList[3]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon />:
            </InputAdornment>
          ),
        },
      },
      syncError: false,
      setError: setEmailError,

      validate: (value: string) => {
        const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return reg.test(value);
      },
    },
  ];

  const PasswordList = [
    {
      formProps: {
        id: 'oldPassword',
        label: 'Old password',
        name: 'oldPassword',
        autoComplete: 'family-name',
        type: showOldPassword ? 'text' : 'password',
        placeholder: 'Enter your old password',
        value: old_password,
        helperText: phoneError ? 'Please enter the correct password' : '',
        error: phoneError,

        onChange: (e: any) => {
          changeValidate(e.target.value, PasswordList[0]);
          setPasswordObjet({ ...passwordObjet, old_password: e.target.value });
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <VpnKeyIcon />
            </InputAdornment>
          ),

          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('oldPassword');
              }}
              edge="end"
            >
              {showOldPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        },
      },
      syncError: false,
      setError: setPhoneError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])[^]{0,16}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'newPassword',
        label: 'New password',
        name: 'newPassword',
        type: showNewPassword ? 'text' : 'password',
        autoComplete: 'family-name',
        placeholder: 'Enter your new password',
        helperText: locationError
          ? 'At least 8-16 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number'
          : '',
        error: locationError,
        value: new_password,

        onChange: (e: any) => {
          changeValidate(e.target.value, PasswordList[1], () => {
            setNewPassword(e.target.value);
          });
          setPasswordObjet({ ...passwordObjet, new_password: e.target.value });
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('newPassword');
              }}
              edge="end"
            >
              {showNewPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        },
      },
      syncError: false,
      setError: setLocationError,
      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'confirmPassword',
        label: 'Confirm new password',
        name: 'confirmPassword',
        type: showConfirmPassword ? 'text' : 'password',
        autoComplete: 'family-name',
        placeholder: 'Enter your account',
        helperText: emailError ? 'Please enter the same password' : '',
        error: emailError,

        onChange: (e: any) => {
          changeValidate(e.target.value, PasswordList[2]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          ),

          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('confirmPassword');
              }}
              edge="end"
            >
              {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        },
      },
      syncError: false,
      setError: setEmailError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/;
        return value === newPassword && reg.test(value);
      },
    },
  ];

  const handlePassword = (type: 'oldPassword' | 'newPassword' | 'confirmPassword') => {
    if (type == 'oldPassword') {
      setShowOldPassword((show) => !show);
    } else if (type == 'newPassword') {
      setShowNewPassword((show) => !show);
    } else {
      setShowConfirmPassword((show) => !show);
    }
  };

  const changeValidate = (value: string, data: any, cb?: () => void) => {
    const { setError, validate } = data;
    setError(!validate(value));
    cb && cb();
  };

  const changePersonal = (event: any) => {
    event.preventDefault();
    setPersonalLoadingButton(true);

    const data = new FormData(event.currentTarget);

    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length);

    const formData = {
      bio: bio,
      email: email,
      location: location,
      phone: phone,
    };

    if (canSubmit) {
      updateUser(userID, { ...formData }).then((response) => {
        if (response.status === 200) {
          setPersonalLoadingButton(false);
          setShowPersonalInformation(true);
          setSuccessMessage(true);
          setBio(bio);
        } else {
          setPersonalLoadingButton(false);
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });
    } else {
      setPersonalLoadingButton(false);
    }
  };

  const changePassword = async (event: any) => {
    setPasswordLoadingButton(true);
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    PasswordList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!PasswordList.filter((item) => item.syncError).length);

    const formData = {
      old_password: passwordObjet.old_password,
      new_password: passwordObjet.new_password,
    };

    if (canSubmit) {
      await updatePassword(userID, { ...formData }).then((response) => {
        if (response.status === 200) {
          setSuccessMessage(true);
          setPasswordLoadingButton(false);
          signOut();
          router.push('/signin');
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
          setPasswordLoadingButton(false);
        }
      });
    } else {
      setPasswordLoadingButton(false);
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
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
      <Typography sx={{ mb: '2rem' }} variant="h5">
        My Profile
      </Typography>
      <Paper variant="outlined" className={styles.profileContainer}>
        {showMyProfile ? (
          <Box className={styles.avatarContainer}>
            <Box display="flex" alignItems="center">
              <Stack direction="row" spacing={2}>
                <Avatar alt="Remy Sharp" src={user?.avatar} className={styles.avatarContent} />
              </Stack>
              <Box sx={{ pl: '1rem' }}>
                <Typography variant="h5">{isLoading ? <Skeleton /> : user?.name}</Typography>
                <Typography variant="subtitle1" component="div" width="36rem">
                  {isLoading ? <Skeleton /> : Bio || '-'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                className={styles.button}
                onClick={() => {
                  setShowMyProfile(false);
                }}
              >
                <Box
                  component="img"
                  sx={{ width: '1.4rem', height: '1.4rem', mr: '0.4rem' }}
                  src="/icons/user/change-password.svg"
                />
                Change Password
              </Button>
            </Box>
          </Box>
        ) : (
          <Grid sx={{ width: '40rem' }} onSubmit={changePassword} component="form" noValidate>
            <Typography variant="h6">Change Password</Typography>
            {PasswordList.map((item) => (
              <Box key={item.formProps.name}>
                <TextField size="small" margin="normal" color="success" fullWidth required {...item.formProps} />
              </Box>
            ))}
            <Box mt="2rem">
              <LoadingButton
                loading={passwordLoadingButton}
                endIcon={<CancelIcon sx={{ color: 'var(--save-color)' }} />}
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
                  width: '7rem',
                }}
                onClick={() => {
                  setShowMyProfile(true);
                }}
              >
                cancel
              </LoadingButton>
              <LoadingButton
                loading={passwordLoadingButton}
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
                  width: '7rem',
                }}
              >
                Save
              </LoadingButton>
            </Box>
          </Grid>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: '2rem' }}>
        {showPersonalInformation ? (
          <Box>
            <Grid className={styles.informationHeader}>
              <Typography variant="h6">Personal Information</Typography>
              <Button
                size="small"
                variant="contained"
                className={styles.button}
                onClick={() => {
                  setShowPersonalInformation(false);
                }}
              >
                <Box
                  component="img"
                  sx={{ width: '1.4rem', height: '1.4rem', mr: '0.4rem' }}
                  src="/icons/user/edit.svg"
                />
                Edit
              </Button>
            </Grid>
            <Box className={styles.informationContainer}>
              {userList.map((item) => {
                return (
                  <Box className={styles.informationContent} key={item.name}>
                    <Box display="flex" alignItems="center" mb="0.6rem">
                      {item.icon}
                      {item.name == 'created_at' ? (
                        <Typography component="div" variant="body1" fontFamily="mabry-bold" ml="0.6rem">
                          {isLoading ? <Skeleton sx={{ width: '10rem' }} /> : datetime(user?.[item.name]) || '-'}
                        </Typography>
                      ) : (
                        <Typography component="div" variant="body1" fontFamily="mabry-bold" ml="0.6rem">
                          {isLoading ? <Skeleton sx={{ width: '10rem' }} /> : user?.[item?.name] || '-'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6">Personal Information</Typography>
            <Box component="form" onSubmit={changePersonal} noValidate>
              {formList.map((item) => (
                <Box key={item.formProps.name}>
                  <TextField
                    size="small"
                    margin="normal"
                    color="success"
                    required
                    {...item.formProps}
                    sx={{ width: '18rem' }}
                  />
                </Box>
              ))}
              <Box mt="2rem">
                <LoadingButton
                  loading={personalLoadingButton}
                  endIcon={<CancelIcon sx={{ color: 'var(--save-color)' }} />}
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
                    width: '7rem',
                  }}
                  onClick={() => {
                    setShowPersonalInformation(true);
                    getUser(userID).then(async (response) => {
                      const res = await response.json();
                      setUser(res);
                      setBio(res.bio);
                    });
                  }}
                >
                  cancel
                </LoadingButton>
                <LoadingButton
                  loading={personalLoadingButton}
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
                    width: '7rem',
                  }}
                >
                  Save
                </LoadingButton>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
export default Profile;

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
