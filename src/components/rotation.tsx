import { Box, Grid, MobileStepper, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const rotationChart = [
  {
    label: 'Dragonfly',
    imageURL: '/images/login/dragonfly.svg',
  },
  {
    label: 'Features',
    imageURL: '/images/login/features.svg',
  },
  {
    label: 'Milestones',
    imageURL: '/images/login/milestones.svg',
  },
];

const theme = createTheme({
  components: {
    MuiMobileStepper: {
      styleOverrides: {
        dotActive: {
          backgroundColor: 'var(--description-color)',
        },
      },
    },
  },
});

export default function Rotation() {
  const [imageList] = useState(rotationChart);
  const [imageIndex, setImageIndex] = useState(0);

  const handleStepChange = (step: number) => {
    setImageIndex(step);
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid sx={{ backgroundColor: '#f6f7f9' }}>
        <AutoPlaySwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={imageIndex}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {imageList.map((step, index) => (
            <div key={step.label}>
              {Math.abs(imageIndex - index) <= 2 ? (
                <Box
                  component="img"
                  sx={{
                    width: '100%',
                    height: '100vh',
                    objectFit: 'cover',
                  }}
                  src={step.imageURL}
                  alt={step.label}
                />
              ) : null}
            </div>
          ))}
        </AutoPlaySwipeableViews>
        <MobileStepper
          sx={{
            width: '50%',
            height: '6%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#f6f7f9',
          }}
          backButton={null}
          nextButton={null}
          activeStep={imageIndex}
          steps={imageList.length}
        />
      </Grid>
    </ThemeProvider>
  );
}
