import Lottie from 'lottie-react';
import deleteAnimation from '../assets/lotties/delete-animation.json';

const Style = {
  height: '6rem',
  width: '100%',
};

interface layoutProps {
  className?: string;
}

const DeleteAnimation: React.FC<layoutProps> = ({ className }) => {
  return <Lottie animationData={deleteAnimation} style={Style} className={className} />;
};

export default DeleteAnimation;
