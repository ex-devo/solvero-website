/* Prevent FOUC - show page when ready */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.style.visibility = 'visible';
  document.documentElement.style.opacity = '1';
});

/* Initialize Lenis smooth scroll */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1,
      wheelMultiplier: 1,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
});

/* Initialize GSAP animations */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined') {
    /* Register ScrollTrigger plugin */
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    } else {
      console.warn('ScrollTrigger plugin not found');
    }
    
    /* Animate hero elements on load */
    gsap.utils.toArray('.animate-fade-in-up').forEach((el) => {
      const animProps = {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      };
      
      // Add ScrollTrigger if available
      if (typeof ScrollTrigger !== 'undefined') {
        animProps.scrollTrigger = { trigger: el, start: "top 80%" };
      }
      
      gsap.fromTo(el, { opacity: 0, y: 20 }, animProps);
    });

    /* Scroll-triggered reveals for sections */
    gsap.utils.toArray('section').forEach((section) => {
      const animProps = {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      };
      
      // Add ScrollTrigger if available
      if (typeof ScrollTrigger !== 'undefined') {
        animProps.scrollTrigger = {
          trigger: section,
          start: "top 80%",
        };
      }
      
      gsap.from(section, {
        opacity: 0,
        y: 50,
        ...animProps
      });
    });

    /* Interactive service cards hover effect */
    gsap.utils.toArray('.service-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  /* Optional: subtle cursor effect */
  document.addEventListener('mousemove', (e) => {
    if (typeof gsap !== 'undefined') {
      gsap.to('body', {
        cursor: 'circle',
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  });

  /* Parallax background effect */
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.parallax').forEach(el => {
      const speed = el.getAttribute('data-speed') || 0.5;
      const yPos = -(window.scrollY * speed);
      el.style.backgroundPosition = `center ${yPos}px`;
    });
  });

  /* Initialize Lottie animations (if any) */
  if (typeof lottie !== 'undefined') {
    document.querySelectorAll('.lottie-animation').forEach(container => {
      const path = container.getAttribute('data-lottie');
      lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: path
      });
    });
  }

  /* Accessibility: focus outlines for keyboard users */
  document.addEventListener('keydown', function(e) {
    if(e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });
});

/* Initialize particles.js */
document.addEventListener('DOMContentLoaded', function() {
    // The service page has no hero particles; reduced-motion users see the static hero.
    if (!document.getElementById('particles-js') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Initialize particles for hero section
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
    console.log('Hero particles.js initialized');
});

/* Smart header hide/show on scroll */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('nav');
  let lastScrollTop = 0;
  let ticking = false;

  if (header) {
    // Make header sticky and add smooth transitions
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '50';
    header.style.transition = 'transform 0.3s ease-out';
    
    function updateHeader() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const mobileMenu = document.getElementById('mobile-menu');
      const isMobileMenuOpen = mobileMenu && mobileMenu.classList.contains('show');
      
      // Don't hide header if mobile menu is open
      if (isMobileMenuOpen) {
        header.style.transform = 'translateY(0)';
        lastScrollTop = currentScrollTop;
        ticking = false;
        return;
      }
      
      // Hide header when scrolling down (past a small threshold to avoid jitter)
      if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
        header.style.transform = 'translateY(-100%)';
      }
      // Show header when scrolling up or near top
      else if (currentScrollTop < lastScrollTop || currentScrollTop <= 50) {
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = currentScrollTop;
      ticking = false;
    }
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }
});