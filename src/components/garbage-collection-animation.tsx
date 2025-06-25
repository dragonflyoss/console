import Lottie from 'lottie-react';
import gc from '../assets/lotties/gc.json';

const Style = {
  height: '8rem',
  width: '100%',
};

interface layoutProps {
  className?: string;
}

const GC: React.FC<layoutProps> = ({ className }) => {
  return <Lottie animationData={gc} style={Style} className={className} />;
};

export default GC;
