import { Box, Grid, MobileStepper, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import styles from './rotation.module.scss';
import React from 'react';
import { makeStyles } from '@mui/styles';

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
          backgroundColor: '#2E8F79',
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
      <Grid className={styles.container}>
        <AutoPlaySwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={imageIndex}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {imageList.map((step, index) => {
            return (
              <picture key={step.label}>
                <div>
                  {Math.abs(imageIndex - index) <= 2 ? (
                    <Box
                      component="img"
                      sx={{
                        width: '100%',
                        height: '100vh',
                      }}
                      src={step.imageURL}
                    />
                  ) : null}
                </div>
              </picture>
            );
          })}
        </AutoPlaySwipeableViews>
        {
          <MobileStepper
            className={styles.scroll}
            backButton={undefined}
            nextButton={undefined}
            activeStep={imageIndex}
            steps={imageList?.length}
          />
        }
      </Grid>
    </ThemeProvider>
  );
}
