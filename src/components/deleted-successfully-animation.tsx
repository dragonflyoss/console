import Lottie from 'lottie-react';
import deleteAnimation from '../assets/lotties/deleted-successfully.json';

const Style = {
  height: '10rem',
  width: '100%',
};

const DeleteSuccessfullyAnimation = () => {
  return <Lottie animationData={deleteAnimation} style={Style}></Lottie>;
};

export default DeleteSuccessfullyAnimation;
