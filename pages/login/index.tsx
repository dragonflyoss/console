import { Box, Grid, useTheme, Pagination } from '@mui/material';
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
    label: 'homeimge',
    imgPath: '/images/homepage.png',
  },
  {
    label: 'Featuresimge',
    imgPath: '/images/features.png',
  },
  {
    label: 'Milestonesimge',
    imgPath: '/images/homepage.png',
  },
];
export default function Login() {
  const [cond, setCond] = useState(true);
  const theme = useTheme();
  const [imageList, setImageList] = useState(images);
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
  const handleChangeIndex = (event: any, index: number) => {
    setImageIndex(index - 1);
  };
  return (
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
                    src={step.imgPath}
                  />
                ) : null}
              </div>
            );
          })}
        </AutoPlaySwipeableViews>
        <Pagination
          className={styles.Pagination}
          page={imageIndex + 1}
          count={imageList?.length}
          onChange={handleChangeIndex}
          hidePrevButton
          hideNextButton
          color="primary"
        />
      </Grid>
      <Grid item xs={6}>
        {cond ? <Signin onGetcount={getcount}></Signin> : <SignUp onSetgnup={signup}></SignUp>}
      </Grid>
    </Grid>
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
