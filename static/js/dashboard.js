// Dashboard scroll functionality
document.addEventListener('DOMContentLoaded', function() {
    // Fix scroll issues on dashboard
    const dashboard = document.querySelector('.dashboard-container') || document.querySelector('.main-content') || document.body;
    
    // Ensure proper scroll behavior
    if (dashboard) {
        dashboard.style.overflowY = 'auto';
        dashboard.style.height = '100vh';
        dashboard.style.scrollBehavior = 'smooth';
    }
    
    // Fix for sticky elements interfering with scroll
    const stickyElements = document.querySelectorAll('.sticky, .fixed, .navbar-fixed');
    stickyElements.forEach(element => {
        element.style.zIndex = '1000';
    });
    
    // Handle scroll position restoration
    if (sessionStorage.getItem('dashboardScrollPosition')) {
        const scrollPos = parseInt(sessionStorage.getItem('dashboardScrollPosition'));
        dashboard.scrollTop = scrollPos;
    }
    
    // Save scroll position before page unload
    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('dashboardScrollPosition', dashboard.scrollTop);
    });
    
    // Fix for mobile scroll issues
    if (window.innerWidth <= 768) {
        document.body.style.webkitOverflowScrolling = 'touch';
        dashboard.style.webkitOverflowScrolling = 'touch';
    }
    
    // Prevent scroll jump on dynamic content loading
    const mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Maintain scroll position when content is added
                const currentScroll = dashboard.scrollTop;
                requestAnimationFrame(() => {
                    dashboard.scrollTop = currentScroll;
                });
            }
        });
    });
    
    mutationObserver.observe(dashboard, {
        childList: true,
        subtree: true
    });
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Fix scroll to top functionality
    const scrollToTopBtn = document.querySelector('.scroll-to-top, #scrollToTop, .back-to-top');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            dashboard.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show/hide scroll to top button
        dashboard.addEventListener('scroll', function() {
            if (dashboard.scrollTop > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
    }
});