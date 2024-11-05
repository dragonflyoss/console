import Lottie from 'lottie-react';
import searchTaskAnimation from '../assets/lotties/search-task-animation.json';

const Style = {
  height: '10rem',
  width: '100%',
};

const SearchTaskAnimation = () => {
  return <Lottie animationData={searchTaskAnimation} style={Style}></Lottie>;
};

export default SearchTaskAnimation;
