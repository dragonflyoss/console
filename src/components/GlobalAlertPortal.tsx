import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface GlobalAlertPortalProps {
  children: React.ReactNode;
}

const GlobalAlertPortal: React.FC<GlobalAlertPortalProps> = ({ children }) => {
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alertContainer = document.getElementById('global-alert-container');
    
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'global-alert-container';
      alertContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(alertContainer);
    }

    portalRef.current = alertContainer as HTMLDivElement;

    return () => {
    };
  }, []);

  if (typeof window === 'undefined' || !portalRef.current) {
    return null;
  }

  return createPortal(children, portalRef.current);
};

export default GlobalAlertPortal;