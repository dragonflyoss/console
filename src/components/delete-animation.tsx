import Lottie from 'lottie-react';
import deleteAnimation from '../assets/lotties/delete-animation.json';

const Style = {
  height: '6rem',
  width: '100%',
};

const Delete = () => {
  return <Lottie animationData={deleteAnimation} style={Style}></Lottie>;
};

export default Delete;
