import { Box, Grid, useTheme, MobileStepper } from '@mui/material';
import Signin from '../../component/signin';
import SignUp from 'component/signup';
import { useState } from 'react';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import React from 'react';
import styles from './login.module.css';
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const images = [
  {
    label: 'dragonflyimge',
    imgUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01oTDq7f1xhbLcUvqua_!!6000000006475-0-tps-1412-1604.jpg',
  },
  {
    label: 'Featuresimge',
    imgUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01bffQeW23c0CSXFlu8_!!6000000007275-0-tps-1370-1558.jpg',
  },
  {
    label: 'Milestonesimge',
    imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN016rBV5B1eprnTD9FPQ_!!6000000003921-0-tps-1412-1602.jpg',
  },
];
export default function Login() {
  const [cond, setCond] = useState(true);
  const theme = useTheme();
  const [imageList] = useState(images);
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
  // const handleChangeIndex = (_event: any, index: number) => {
  //   setImageIndex(index - 1);
  // };
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
                <div key={step.label}>
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
          {/* <Pagination
          className={styles.Pagination}
          page={imageIndex + 1}
          count={imageList?.length}
          onChange={handleChangeIndex}
          size='small'
          hidePrevButton
          hideNextButton 
           variant='outlined'
          
        /> */}
        </Grid>
        <Grid item xs={6}>
          {cond ? <Signin onGetcount={getcount}></Signin> : <SignUp onSetgnup={signup}></SignUp>}
        </Grid>
      </Grid>
    </div>
  );
}
// export async function getStaticProps() {
//   // const res = await fetch('http://localhost:3000/api/user/signin',{
//   //   method:'POST'
//   // })
//   // const data = await res.json();

//   const data = await rendeRHttp.post('/api/user/signin')

//   if (!data) {
//     return {
//       notFound: true,
//     };
//   }

//   return {
//     props: { data }, // will be passed to the page component as props
//   };
// }
