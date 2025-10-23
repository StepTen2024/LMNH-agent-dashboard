export const scrollUtils = {
  // Disable scroll bounce on iOS and other platforms
  disableScrollBounce: () => {
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    
    // Additional iOS specific fixes
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  },

  // Enable smooth scrolling
  enableSmoothScrolling: () => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // CSS custom properties for consistent scroll behavior
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      .scroll-container {
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        scroll-snap-type: y proximity;
      }
      
      .smooth-scroll {
        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
    `;
    document.head.appendChild(style);
  },

  // Prevent layout jumps during scroll
  preventLayoutJumps: () => {
    let ticking = false;
    
    const updateLayout = () => {
      // Force layout calculations to happen in a single frame
      document.querySelectorAll('[data-scroll-observe]').forEach(el => {
        el.style.willChange = 'transform';
      });
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateLayout);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Debounced resize handler to recalculate layouts
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.recalculateLayout();
      }, 150);
    });
  },

  // Recalculate layout dimensions
  recalculateLayout: () => {
    document.querySelectorAll('[data-scroll-container]').forEach(container => {
      const height = container.scrollHeight;
      container.style.minHeight = `${height}px`;
    });
  },

  // Smooth scroll to element
  scrollToElement: (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Lock scroll position
  lockScroll: () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    window.onscroll = () => {
      window.scrollTo(scrollLeft, scrollTop);
    };
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollTop}px`;
    document.body.style.width = '100%';
    
    return scrollTop;
  },

  // Unlock scroll position
  unlockScroll: (scrollTop = 0) => {
    window.onscroll = null;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    window.scrollTo(0, scrollTop);
  },

  // Initialize all scroll fixes
  initialize: () => {
    scrollUtils.disableScrollBounce();
    scrollUtils.enableSmoothScrolling();
    scrollUtils.preventLayoutJumps();
    
    // Set up intersection observer for performance
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        } else {
          entry.target.classList.remove('in-viewport');
        }
      });
    }, observerOptions);
    
    // Observe elements that need scroll optimization
    document.querySelectorAll('[data-scroll-observe]').forEach(el => {
      observer.observe(el);
    });
    
    // Add momentum scrolling for iOS
    document.addEventListener('touchstart', {}, { passive: true });
    document.addEventListener('touchmove', {}, { passive: true });
  },

  // Custom scroll handler with throttling
  createScrollHandler: (callback, throttleMs = 16) => {
    let isThrottled = false;
    
    return () => {
      if (isThrottled) return;
      
      isThrottled = true;
      requestAnimationFrame(() => {
        callback();
        setTimeout(() => {
          isThrottled = false;
        }, throttleMs);
      });
    };
  },

  // Get scroll position with cross-browser compatibility
  getScrollPosition: () => {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
      y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    };
  },

  // Set scroll position smoothly
  setScrollPosition: (x, y, smooth = true) => {
    const options = {
      left: x,
      top: y
    };
    
    if (smooth) {
      options.behavior = 'smooth';
    }
    
    window.scrollTo(options);
  }
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollUtils.initialize);
  } else {
    scrollUtils.initialize();
  }
}