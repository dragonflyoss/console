import { Box, Grid, useTheme, MobileStepper } from '@mui/material';
import Signin from '@/pages/login/signin';
import SignUp from '@/pages/login/signup';
import { useState } from 'react';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import React from 'react';
import styles from './login.module.css';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const rotationChart = [
  {
    label: 'Dragonfly',
    imgUrl: '/dragonfly.png',
  },
  {
    label: 'Features',
    imgUrl: '/features.png',
  },
  {
    label: 'Milestones',
    imgUrl: '/milestones.png',
  },
];

export default function Login() {
  const theme = useTheme();
  const [cond, setCond] = useState(true);
  const [imageList] = useState(rotationChart);
  const [imageIndex, setImageIndex] = useState(0);

  const handleStepChange = (step: number) => {
    setImageIndex(step);
  };

  const getcount = () => {
    setCond(false);
  };

  const signup = () => {
    setCond(true);
  };
  return (
    <div className={styles.container}>
      <Grid
        container
        sx={{
          overflowY: 'hidden',
        }}
      >
        <Grid item xs={6}>
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
                          height: '100%',
                        }}
                        src={step.imgUrl}
                      />
                    ) : null}
                  </div>
                </picture>
              );
            })}
          </AutoPlaySwipeableViews>
          {
            <MobileStepper
              className={styles.pagination}
              backButton={undefined}
              nextButton={undefined}
              activeStep={imageIndex}
              steps={imageList?.length}
            />
          }
        </Grid>
        <Grid item xs={6}>
          {cond ? <Signin onGetcount={getcount}></Signin> : <SignUp onSetgnup={signup}></SignUp>}
        </Grid>
      </Grid>
    </div>
  );
}
