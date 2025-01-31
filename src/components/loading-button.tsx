import React from 'react';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import { ButtonProps } from '@mui/material/Button';

interface cancelLoadingButtonProps extends ButtonProps {
  loading: boolean;
  onClick: any;
  id: string;
}

export const CancelLoadingButton: React.FC<cancelLoadingButtonProps> = ({ loading, onClick, id, ...rest }) => (
  <LoadingButton
    loading={loading}
    endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
    size="small"
    variant="outlined"
    type="reset"
    loadingPosition="end"
    id={id}
    sx={{
      '&.MuiLoadingButton-root': {
        color: 'var(--calcel-size-color)',
        borderColor: 'var(--calcel-color)',
      },
      ':hover': {
        backgroundColor: 'var(--calcel-hover-corlor)',
        borderColor: 'var(--calcel-hover-corlor)',
      },
      '&.MuiLoadingButton-loading': {
        backgroundColor: 'var(--button-loading-color)',
        color: 'var(--button-loading-size-color)',
        borderColor: 'var(--button-loading-color)',
      },
      mr: '1rem',
      width: '7rem',
    }}
    onClick={onClick}
    {...rest}
  >
    Cancel
  </LoadingButton>
);

interface saveLoadingButtonProps {
  loading: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  id: string;
  endIcon?: React.ReactNode;
  text: string;
}

export const SavelLoadingButton: React.FC<saveLoadingButtonProps> = ({
  loading,
  onClick,
  id,
  endIcon,
  text,
  ...rest
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <LoadingButton
      loading={loading}
      endIcon={endIcon}
      size="small"
      variant="outlined"
      type="submit"
      loadingPosition="end"
      id={id}
      sx={{
        '&.MuiLoadingButton-root': {
          backgroundColor: 'var(--save-color)',
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
        width: '7rem',
      }}
      onClick={handleClick}
      {...rest}
    >
      {text}
    </LoadingButton>
  );
};

export const DeleteLoadingButton: React.FC<saveLoadingButtonProps> = ({
  loading,
  onClick,
  id,
  endIcon,
  text,
  ...rest
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <LoadingButton
      loading={loading}
      endIcon={endIcon}
      size="small"
      variant="outlined"
      type="submit"
      loadingPosition="end"
      id={id}
      sx={{
        '&.MuiLoadingButton-root': {
          backgroundColor: 'var(--delete-button-color)',
          color: 'var(--save-size-color)',
          borderColor: 'var(--delete-button-color)',
        },
        ':hover': {
          backgroundColor: 'var(--delete-button-hover-color)',
          borderColor: 'var(--delete-button-hover-color)',
        },
        '&.MuiLoadingButton-loading': {
          backgroundColor: 'var(--delete-button-color)',

          borderColor: 'var(--delete-button-color)',
        },
        width: '7rem',
      }}
      onClick={handleClick}
      {...rest}
    >
      {text}
    </LoadingButton>
  );
};
