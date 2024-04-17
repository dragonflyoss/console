import { Backdrop, Box } from '@mui/material';

interface LoadingBackdropProps {
  open: boolean;
}

const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ open }) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
    >
      <Box component="img" sx={{ width: '4rem', height: '4rem' }} src="/icons/cluster/page-loading.svg" />
    </Backdrop>
  );
};

export default LoadingBackdrop;
