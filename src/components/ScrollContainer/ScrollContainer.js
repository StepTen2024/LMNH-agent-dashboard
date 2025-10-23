import React, { useRef, useEffect, useState } from 'react';
import './ScrollContainer.css';

const ScrollContainer = ({ children, className = '', height = '100vh' }) => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      container.scrollTop += delta * 0.5;
    };

    const handleTouchStart = (e) => {
      container.style.scrollBehavior = 'auto';
    };

    const handleTouchEnd = (e) => {
      container.style.scrollBehavior = 'smooth';
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Prevent body scroll bounce on iOS
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`scroll-container ${className} ${isScrolling ? 'scrolling' : ''}`}
      style={{ height }}
    >
      <div className="scroll-content">
        {children}
      </div>
    </div>
  );
};

export default ScrollContainer;