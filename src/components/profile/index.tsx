import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useState, useEffect, useContext } from 'react';
import { updateUser, getUser, updatePassword, signOut, getUserResponse } from '../../lib/api';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import styles from './index.module.css';
import { getDatetime } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../menu/index';
import { CancelLoadingButton, SavelLoadingButton } from '../loding-button';

export default function Profile() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setBioError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmNewPasswordError, setConfirmNewPasswordErrorError] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoadingButton, setPasswordLoadingButton] = useState(false);
  const [personalLoadingButton, setPersonalLoadingButton] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(true);
  const [showPersonalInformation, setShowPersonalInformation] = useState(true);
  const [bio, setBio] = useState('');
  const [users, setUsers] = useState<getUserResponse>({
    id: 0,
    created_at: '',
    updated_at: '',
    is_del: 0,
    email: '',
    name: '',
    avatar: '',
    phone: '',
    state: '',
    location: '',
    bio: '',
  });
  const [password, setPassword] = useState({
    old_password: '',
    new_password: '',
  });

  const { user, handleUserUpdate } = useContext(MyContext);

  const navigate = useNavigate();

  useEffect(() => {
    setUsers(user);
    setBio(user.bio);
  }, [user]);

  const { old_password, new_password } = password;

  const userLable = [
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
      label: 'Created At',
      icon: <Box component="img" className={styles.userIcon} src="/icons/user/created-at.svg" />,
    },
  ];

  const profileForm = [
    {
      formProps: {
        id: 'bio',
        label: 'Bio',
        name: 'bio',
        multiline: true,
        maxRows: 2,
        autoComplete: 'family-name',
        placeholder: 'Enter your description',
        helperText: bioError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: bioError,
        value: users.bio,

        onChange: (e: any) => {
          setUsers({ ...users, bio: e.target.value });
          changeValidate(e.target.value, profileForm[0]);
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
        const reg = /^.{0,1000}$/;
        return reg.test(value);
      },
    },

    {
      formProps: {
        id: 'phone',
        label: 'Phone',
        name: 'phone',
        autoComplete: 'family-name',
        value: users.phone,
        placeholder: 'Enter your Phone',
        helperText: phoneError ? 'Invalid phone number.' : '',
        error: phoneError,

        onChange: (e: any) => {
          setUsers({ ...users, phone: e.target.value });
          changeValidate(e.target.value, profileForm[1]);
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
        value: users.location,
        placeholder: 'Enter your location',
        helperText: locationError ? 'Fill in the characters, the length is 0-100.' : '',
        error: locationError,

        onChange: (e: any) => {
          setUsers({ ...users, location: e.target.value });
          changeValidate(e.target.value, profileForm[2]);
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
        const reg = /^[A-Za-z0-9]{0,100}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'email',
        label: 'Email',
        name: 'email',
        required: true,
        autoComplete: 'family-name',
        value: users.email,
        placeholder: 'Enter your Email',
        helperText: emailError ? 'Email is invalid or already taken.' : '',
        error: emailError,

        onChange: (e: any) => {
          setUsers({ ...users, email: e.target.value });
          changeValidate(e.target.value, profileForm[3]);
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
        const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(value);
      },
    },
  ];

  const passwordForm = [
    {
      formProps: {
        id: 'oldPassword',
        label: 'Old password',
        name: 'oldPassword',
        autoComplete: 'family-name',
        type: showOldPassword ? 'text' : 'password',
        placeholder: 'Enter your old password',
        value: old_password,
        helperText: oldPasswordError ? 'Fill in the characters, the maximum length is 16.' : '',
        error: oldPasswordError,

        onChange: (e: any) => {
          changeValidate(e.target.value, passwordForm[0]);
          setPassword({ ...password, old_password: e.target.value });
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
      setError: setOldPasswordError,

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
        helperText: newPasswordError ? `At least 8-16 characters, with at least 1 lowercase letter and 1 number.` : '',
        error: newPasswordError,
        value: new_password,

        onChange: (e: any) => {
          changeValidate(e.target.value, passwordForm[1], () => {
            setNewPassword(e.target.value);
          });
          setPassword({ ...password, new_password: e.target.value });
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
      setError: setNewPasswordError,
      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'confirmNewPassword',
        label: 'Confirm new password',
        name: 'confirmNewPassword',
        type: showConfirmPassword ? 'text' : 'password',
        autoComplete: 'family-name',
        placeholder: 'Enter your payload',
        helperText: confirmNewPasswordError ? 'Please enter the same password.' : '',
        error: confirmNewPasswordError,

        onChange: (e: any) => {
          changeValidate(e.target.value, passwordForm[2]);
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
      setError: setConfirmNewPasswordErrorError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return value === newPassword && reg.test(value);
      },
    },
  ];

  const handlePassword = (type: 'oldPassword' | 'newPassword' | 'confirmPassword') => {
    if (type === 'oldPassword') {
      setShowOldPassword((show) => !show);
    } else if (type === 'newPassword') {
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

  const handlePersonalInformation = async (event: any) => {
    event.preventDefault();
    setPersonalLoadingButton(true);

    const data = new FormData(event.currentTarget);

    profileForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!profileForm.filter((item) => item.syncError).length);

    const formData = {
      bio: users.bio,
      email: users.email,
      location: users.location,
      phone: users.phone,
    };

    if (canSubmit) {
      try {
        if (users.id) {
          await updateUser(String(users.id), { ...formData });

          const user = await getUser(String(users.id));

          handleUserUpdate(user);
          setPersonalLoadingButton(false);
          setShowPersonalInformation(true);
          setSuccessMessage(true);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setPersonalLoadingButton(false);
        }
      }
    } else {
      setPersonalLoadingButton(false);
    }
  };

  const cancelHandlePersonalInformation = async () => {
    setUsers(user);
    setBio(user.bio);
    setShowPersonalInformation(true);
  };

  const handleChangePassword = async (event: any) => {
    setPasswordLoadingButton(true);
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    passwordForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!passwordForm.filter((item) => item.syncError).length);

    const formData = {
      old_password: password.old_password,
      new_password: password.new_password,
    };

    if (canSubmit) {
      try {
        if (user.id) {
          await updatePassword(String(user.id), { ...formData });

          setSuccessMessage(true);
          setPasswordLoadingButton(false);
          await signOut();
          navigate('/signin');
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setPasswordLoadingButton(false);
        }
      }
    } else {
      setPasswordLoadingButton(false);
    }
  };

  const cancelChangePassword = () => {
    setShowMyProfile(true);
    setPassword({ ...password, old_password: '', new_password: '' });
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
                <Avatar alt="Remy Sharp" src={users?.avatar} className={styles.avatarContent} />
              </Stack>
              <Box sx={{ pl: '1rem' }}>
                <Typography variant="h5">{users?.name || '-'}</Typography>
                <Typography variant="subtitle1" component="div" width="36rem">
                  {bio || '-'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                sx={{
                  background: 'var(--button-color)',
                  borderRadius: '0',
                  ':hover': { background: 'var(--button-color)' },
                }}
                variant="contained"
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
          <Grid sx={{ width: '40rem' }} onSubmit={handleChangePassword} component="form" noValidate>
            <Typography variant="h6" fontFamily="mabry-bold" mb="1rem">
              Change Password
            </Typography>
            {passwordForm.map((item) => (
              <Box key={item.formProps.name}>
                <TextField size="small" margin="normal" color="success" fullWidth required {...item.formProps} />
              </Box>
            ))}
            <Box mt="2rem">
              <CancelLoadingButton id="cancel" loading={passwordLoadingButton} onClick={cancelChangePassword} />
              <SavelLoadingButton
                loading={passwordLoadingButton}
                endIcon={<CheckCircleIcon />}
                id="change-password"
                text="Save"
              />
            </Box>
          </Grid>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: '2rem' }}>
        {showPersonalInformation ? (
          <Box>
            <Grid className={styles.informationHeader}>
              <Typography variant="h6" fontFamily="mabry-bold">
                Personal Information
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{
                  background: 'var(--button-color)',
                  borderRadius: '0',
                  ':hover': { background: 'var(--button-color)' },
                }}
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
              {userLable.map((item) => {
                return (
                  <Box className={styles.informationContent} key={item.name}>
                    <Box display="flex" alignItems="center" mb="0.6rem">
                      {item.icon}
                      {item.name === 'created_at' ? (
                        users?.[item.name] ? (
                          <Typography
                            id={item.name}
                            component="div"
                            variant="body1"
                            fontFamily="mabry-bold"
                            ml="0.6rem"
                          >
                            {getDatetime(users?.[item.name]) || '-'}
                          </Typography>
                        ) : (
                          <Typography
                            id={item.name}
                            component="div"
                            variant="body1"
                            fontFamily="mabry-bold"
                            ml="0.6rem"
                          >
                            -
                          </Typography>
                        )
                      ) : (
                        <Typography id={item.name} component="div" variant="body1" fontFamily="mabry-bold" ml="0.6rem">
                          {users?.[item?.name as keyof typeof users] || '-'}
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
            <Typography variant="h6" fontFamily="mabry-bold" mb="1rem">
              Update Personal Information
            </Typography>
            <Box component="form" onSubmit={handlePersonalInformation} noValidate>
              {profileForm.map((item) => (
                <Box key={item.formProps.name}>
                  <TextField
                    size="small"
                    margin="dense"
                    color="success"
                    variant="outlined"
                    {...item.formProps}
                    className={styles.textField}
                  />
                </Box>
              ))}
              <Box mt="2rem">
                <CancelLoadingButton
                  id="cancel-change-password"
                  loading={personalLoadingButton}
                  onClick={cancelHandlePersonalInformation}
                />
                <SavelLoadingButton
                  loading={personalLoadingButton}
                  endIcon={<CheckCircleIcon />}
                  id="save"
                  text="Save"
                />
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
