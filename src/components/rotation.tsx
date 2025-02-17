import { Box, Grid, MobileStepper, ThemeProvider, createTheme, useTheme } from '@mui/material';
import { useState } from 'react';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import { ReactComponent as Dragonfly } from '../assets/images/login/dragonfly.svg';
import { ReactComponent as DarkDragonfly } from '../assets/images/login/dark-dragonfly.svg';
import { ReactComponent as Features } from '../assets/images/login/features.svg';
import { ReactComponent as DarkFeatures } from '../assets/images/login/dark-features.svg';
import { ReactComponent as Milestones } from '../assets/images/login/milestones.svg';
import { ReactComponent as DarkMilestones } from '../assets/images/login/dark-milestones.svg';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default function Rotation() {
  // const [imageList] = useState(rotationChart);
  const [imageIndex, setImageIndex] = useState(0);
  const theme = useTheme();

  const rotationChart = [
    {
      label: 'Dragonfly',
      imageURL: <Dragonfly style={{ width: '100%', height: '100vh' }} />,
    },
    {
      label: 'Features',
      imageURL: <Features style={{ width: '100%', height: '100vh' }} />,
    },
    {
      label: 'Milestones',
      imageURL: <Milestones style={{ width: '100%', height: '100vh' }} />,
    },
  ];

  const darkRotationChart = [
    {
      label: 'Dragonfly',
      imageURL: <DarkDragonfly style={{ width: '100%', height: '100vh' }} />,
    },
    {
      label: 'Features',
      imageURL: <DarkFeatures style={{ width: '100%', height: '100vh' }} />,
    },
    {
      label: 'Milestones',
      imageURL: <DarkMilestones style={{ width: '100%', height: '100vh' }} />,
    },
  ];

  const handleStepChange = (step: number) => {
    setImageIndex(step);
  };

  return (
    <Grid sx={{ backgroundColor: 'var(--palette-background-rotation)' }}>
      <AutoPlaySwipeableViews
        // axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={imageIndex}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        {theme.palette.mode === 'light'
          ? rotationChart.map((step, index) => {
              return (
                <picture key={step.label}>
                  <div>{Math.abs(imageIndex - index) <= 2 ? step.imageURL : null}</div>
                </picture>
              );
            })
          : darkRotationChart.map((step, index) => {
              return (
                <picture key={step.label}>
                  <div>{Math.abs(imageIndex - index) <= 2 ? step.imageURL : null}</div>
                </picture>
              );
            })}
      </AutoPlaySwipeableViews>
      <MobileStepper
        sx={{
          width: '50%',
          height: '6%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: 'var(--palette-background-rotation)',
        }}
        backButton={undefined}
        nextButton={undefined}
        activeStep={imageIndex}
        steps={theme.palette.mode === 'light' ? rotationChart?.length : darkRotationChart?.length}
      />
    </Grid>
  );
}
