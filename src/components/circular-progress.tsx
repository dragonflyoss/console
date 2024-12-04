import Box from '@mui/material/Box';
import CircularProgress, { circularProgressClasses, CircularProgressProps } from '@mui/material/CircularProgress';

interface CardProps {
  className?: string;
}

const SearchCircularProgress: React.FC<CardProps> = (props: CircularProgressProps, { className }) => {
  return (
    <Box sx={{ position: 'relative', display: 'flex' }} className={className}>
      <CircularProgress
        variant="determinate"
        sx={(theme) => ({
          color: '#DAF9F2',
          ...theme.applyStyles('dark', {
            color: 'var(--description-color)',
          }),
        })}
        size={20}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={(theme) => ({
          color: 'var(--description-color)',
          animationDuration: '550ms',
          position: 'absolute',
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
          ...theme.applyStyles('dark', {
            color: '#308fe8',
          }),
        })}
        size={20}
        thickness={4}
        {...props}
      />
    </Box>
  );
};

export default SearchCircularProgress;
