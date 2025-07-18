import { Alert, Snackbar } from '@mui/material';

interface ErrorHandlerProps {
  errorMessage: boolean;
  errorMessageText: string;
  onClose: (event: any, reason?: string) => void;
}

const ErrorHandler = ({ errorMessage, errorMessageText, onClose }: ErrorHandlerProps) => {
  return (
    <Snackbar
      open={errorMessage}
      autoHideDuration={30000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
        {errorMessageText}
      </Alert>
    </Snackbar>
  );
};

export default ErrorHandler;
