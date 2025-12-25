import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInLeftAnimation = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInRightAnimation = keyframes`
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInUpAnimation = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideInDownAnimation = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const zoomInAnimation = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const zoomOutAnimation = keyframes`
  from {
    transform: scale(1.2);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const rotateInAnimation = keyframes`
  from {
    transform: rotate(-180deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
`;

const flipInXAnimation = keyframes`
  from {
    transform: perspective(400px) rotateX(90deg);
    opacity: 0;
  }
  to {
    transform: perspective(400px) rotateX(0deg);
    opacity: 1;
  }
`;

const flipInYAnimation = keyframes`
  from {
    transform: perspective(400px) rotateY(90deg);
    opacity: 0;
  }
  to {
    transform: perspective(400px) rotateY(0deg);
    opacity: 1;
  }
`;

const bounceInAnimation = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const blurInAnimation = keyframes`
  from {
    filter: blur(20px);
    opacity: 0;
  }
  to {
    filter: blur(0px);
    opacity: 1;
  }
`;

const slideFadeInLeftAnimation = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideFadeInRightAnimation = keyframes`
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const animations = {
  fade: fadeInAnimation,
  slideLeft: slideInLeftAnimation,
  slideRight: slideInRightAnimation,
  slideUp: slideInUpAnimation,
  slideDown: slideInDownAnimation,
  zoomIn: zoomInAnimation,
  zoomOut: zoomOutAnimation,
  rotateIn: rotateInAnimation,
  flipX: flipInXAnimation,
  flipY: flipInYAnimation,
  bounce: bounceInAnimation,
  blur: blurInAnimation,
  slideFadeLeft: slideFadeInLeftAnimation,
  slideFadeRight: slideFadeInRightAnimation,
};

const initialStates = {
  fade: { opacity: 0 },
  slideLeft: { transform: 'translateX(-20px)', opacity: 0 },
  slideRight: { transform: 'translateX(20px)', opacity: 0 },
  slideUp: { transform: 'translateY(20px)', opacity: 0 },
  slideDown: { transform: 'translateY(-20px)', opacity: 0 },
  zoomIn: { transform: 'scale(0.95)', opacity: 0 },
  zoomOut: { transform: 'scale(1.05)', opacity: 0 },
  rotateIn: { transform: 'rotate(-10deg) scale(0.9)', opacity: 0 },
  flipX: { transform: 'perspective(400px) rotateX(15deg)', opacity: 0 },
  flipY: { transform: 'perspective(400px) rotateY(15deg)', opacity: 0 },
  bounce: { transform: 'scale(0.8)', opacity: 0 },
  blur: { filter: 'blur(10px)', opacity: 0 },
  slideFadeLeft: { transform: 'translateX(-20px)', opacity: 0 },
  slideFadeRight: { transform: 'translateX(20px)', opacity: 0 },
};

const finalStates = {
  fade: { opacity: 1 },
  slideLeft: { transform: 'translateX(0)', opacity: 1 },
  slideRight: { transform: 'translateX(0)', opacity: 1 },
  slideUp: { transform: 'translateY(0)', opacity: 1 },
  slideDown: { transform: 'translateY(0)', opacity: 1 },
  zoomIn: { transform: 'scale(1)', opacity: 1 },
  zoomOut: { transform: 'scale(1)', opacity: 1 },
  rotateIn: { transform: 'rotate(0deg) scale(1)', opacity: 1 },
  flipX: { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 },
  flipY: { transform: 'perspective(400px) rotateY(0deg)', opacity: 1 },
  bounce: { transform: 'scale(1)', opacity: 1 },
  blur: { filter: 'blur(0px)', opacity: 1 },
  slideFadeLeft: { transform: 'translateX(0)', opacity: 1 },
  slideFadeRight: { transform: 'translateX(0)', opacity: 1 },
};

const AnimatedContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'animationType' && prop !== 'timeout' && prop !== 'show'
})<{ 
  animationType: string; 
  timeout: number;
  show: boolean;
}>(({ animationType, timeout, show }) => ({
  width: '100%',
  height: '100%',
  animation: show ? `${animations[animationType as keyof typeof animations]} ${timeout}ms ease-out forwards` : 'none',
  ...initialStates[animationType as keyof typeof initialStates],
  ...(show ? finalStates[animationType as keyof typeof finalStates] : {}),
  transition: `all ${timeout}ms ease-out`,
}));

export type AnimationType = 
  | 'fade' 
  | 'slideLeft' 
  | 'slideRight' 
  | 'slideUp' 
  | 'slideDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'rotateIn'
  | 'flipX'
  | 'flipY'
  | 'bounce'
  | 'blur'
  | 'slideFadeLeft'
  | 'slideFadeRight';

interface TransitionRouteProps {
  children: React.ReactNode;
  timeout?: number;
}

const DEFAULT_ANIMATION_TYPE: AnimationType = 'slideUp';

const TransitionRoute: React.FC<TransitionRouteProps> = ({ 
  children, 
  timeout = 100
}) => {
  const type = DEFAULT_ANIMATION_TYPE;
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 50);
    return () => {
      clearTimeout(timer);
      setShow(false);
    };
  }, []);

  return (
    <AnimatedContainer animationType={type} timeout={timeout} show={show}>
      {children}
    </AnimatedContainer>
  );
};

export default TransitionRoute;