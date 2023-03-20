import { Box, Grid, useTheme, MobileStepper } from '@mui/material';
import Signin from '@/pages/login/signin';
import SignUp from '@/pages/login/signup';
import { useState } from 'react';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import React from 'react';
import styles from './login.module.css';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const rotationchart = [
  {
    label: 'dragonflyimge',
    imgUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01oTDq7f1xhbLcUvqua_!!6000000006475-0-tps-1412-1604.jpg',
  },
  {
    label: 'Featuresimge',
    imgUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01slyJkB1ydJFjcDbZi_!!6000000006601-0-tps-1352-1536.jpg',
  },
  {
    label: 'Milestonesimge',
    imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN016rBV5B1eprnTD9FPQ_!!6000000003921-0-tps-1412-1602.jpg',
  },
];
export default function Login() {
  const [cond, setCond] = useState(true);
  const theme = useTheme();
  const [imageList] = useState(rotationchart);
  const [imageIndex, setImageIndex] = useState(0);
  const handleStepChange = (step: number) => {
    // setActiveStep(step);
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
                  <div >
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
              className={styles.Pagination}
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
