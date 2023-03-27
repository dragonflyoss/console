import { Box, Grid, MobileStepper, useTheme } from '@mui/material';
import { useState } from 'react';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import styles from './rotation.module.css';
import React from 'react';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const rotationChart = [
  {
    label: 'Dragonfly',
    imageURL: '/images/login/dragonfly.png',
  },
  {
    label: 'Features',
    imageURL: '/images/login/features.png',
  },
  {
    label: 'Milestones',
    imageURL: '/images/login/milestones.png',
  },
];

export default function Rotation() {
  const theme = useTheme();

  const [imageList] = useState(rotationChart);
  const [imageIndex, setImageIndex] = useState(0);

  const handleStepChange = (step: number) => {
    setImageIndex(step);
  };

  return (
    <div>
      <Grid>
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
            className={styles.mobileStepper}
            backButton={undefined}
            nextButton={undefined}
            activeStep={imageIndex}
            steps={imageList?.length}
          />
        }
      </Grid>
    </div>
  );
}
