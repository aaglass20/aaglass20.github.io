// ============================================
// BDU Soccer - Enhanced Interactive Scripts
// ============================================

// Waffle Menu Toggle with Animation
function toggleWaffleMenu() {
    const menu = document.getElementById('waffleMenu');
    const toggle = document.querySelector('.waffle-menu-toggle');
    const header = document.querySelector('.waffle-menu-header');

    if (!menu || !toggle) return;

    const isActive = menu.classList.contains('active');

    if (isActive) {
        // Closing
        menu.classList.remove('active');
        toggle.classList.remove('active');
        if (header) header.classList.remove('active');
    } else {
        // Opening
        menu.classList.add('active');
        toggle.classList.add('active');
        if (header) header.classList.add('active');
    }
}

// Submenu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to menu items with submenus
    const menuItemsWithSubmenu = document.querySelectorAll('.menu-item-with-submenu > a');

    menuItemsWithSubmenu.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            const wasActive = parent.classList.contains('active');

            // Close all other submenus
            document.querySelectorAll('.menu-item-with-submenu').forEach(menu => {
                menu.classList.remove('active');
            });

            // Toggle current submenu (unless it was already active)
            if (!wasActive) {
                parent.classList.add('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('waffleMenu');
        const toggle = document.querySelector('.waffle-menu-toggle');

        if (menu && toggle &&
            !menu.contains(e.target) &&
            !toggle.contains(e.target) &&
            menu.classList.contains('active')) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
        }
    });

    // Highlight active page in waffle menu
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();

    document.querySelectorAll('.waffle-menu a, .sub-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
            // Expand parent submenu if in submenu
            const parentSubmenu = link.closest('.menu-item-with-submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('active');
            }
        }
    });
});

// ============================================
// ENHANCED FEATURES - NEW CODE STARTS HERE
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    // ====== Enhanced Collapsible Sections with Smooth Animation ======
    const toggleButtons = document.querySelectorAll(".collapsible-section .toggle-button");

    toggleButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            e.stopPropagation();
            const section = this.closest(".collapsible-section");
            const content = section.querySelector(".collapsible-content");
            const isExpanded = this.getAttribute("aria-expanded") === "true";

            if (isExpanded) {
                // Collapse
                content.style.maxHeight = '0';
                content.style.opacity = '0';
                this.setAttribute("aria-expanded", "false");

                // Rotate icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
            } else {
                // Expand
                content.style.display = 'block';
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.opacity = '1';
                this.setAttribute("aria-expanded", "true");

                // Rotate icon
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        });
    });

    // ====== Click Section Title to Expand/Collapse ======
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        // Only make it clickable if it has a toggle button
        const button = title.querySelector('.toggle-button');
        if (button) {
            title.style.cursor = 'pointer';
            title.addEventListener('click', function(e) {
                // Don't trigger if clicking directly on the button
                if (!e.target.closest('.toggle-button')) {
                    button.click();
                }
            });
        }
    });

    // ====== Lazy Load Videos for Better Performance ======
    const videos = document.querySelectorAll('video');

    // Check if browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;

                    // Only load if not already loaded
                    if (video.readyState === 0) {
                        video.load();
                    }

                    videoObserver.unobserve(video);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before video comes into view
        });

        videos.forEach(video => {
            // Set preload to metadata initially
            video.setAttribute('preload', 'metadata');
            videoObserver.observe(video);
        });
    }

    // ====== Smooth Scroll for Anchor Links ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Skip if just "#"

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ====== Add Fade-In Animation to Sections on Page Load ======
    const sections = document.querySelectorAll('.collapsible-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';

        setTimeout(() => {
            section.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100 * index); // Stagger the animations
    });

    // ====== Close Waffle Menu When Clicking Outside ======
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('waffleMenu');
        const toggleButton = document.querySelector('.waffle-menu-toggle');

        if (menu && toggleButton) {
            // If menu is open and click is outside both menu and toggle button
            if (menu.style.display === 'flex' &&
                !menu.contains(e.target) &&
                !toggleButton.contains(e.target)) {
                menu.style.display = 'none';
            }
        }
    });

    // ====== Add Keyboard Navigation for Collapsible Sections ======
    toggleButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // ====== Enhance Video Controls (Add Loading State) ======
    videos.forEach(video => {
        video.addEventListener('loadstart', function() {
            this.style.opacity = '0.6';
        });

        video.addEventListener('loadeddata', function() {
            this.style.opacity = '1';
        });
    });

    // ====== Add Header Parallax Effect (Subtle) ======
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const header = document.querySelector('header');
                const scrolled = window.pageYOffset;

                if (header && scrolled < 300) { // Only apply for first 300px
                    header.style.transform = `translateY(${scrolled * 0.3}px)`;
                    header.style.opacity = Math.max(0.5, 1 - (scrolled / 500));
                }

                ticking = false;
            });

            ticking = true;
        }
    });

    // ====== Remember Expanded Sections (Optional - stores in localStorage) ======
    const rememberExpandedSections = true; // Set to false to disable

    if (rememberExpandedSections && typeof(Storage) !== "undefined") {
        const currentPage = window.location.pathname;

        // Restore expanded sections
        toggleButtons.forEach((button, index) => {
            const storageKey = `section_${currentPage}_${index}`;
            const wasExpanded = localStorage.getItem(storageKey) === 'true';

            if (wasExpanded) {
                button.click(); // Expand the section
            }
        });

        // Save state when toggling
        toggleButtons.forEach((button, index) => {
            button.addEventListener('click', function() {
                const storageKey = `section_${currentPage}_${index}`;
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                localStorage.setItem(storageKey, isExpanded);
            });
        });
    }
});

// // Load waffle menu when DOM is ready (keep existing)
// document.addEventListener('DOMContentLoaded', loadWaffleMenu);


// Load waffle menu
document.addEventListener('DOMContentLoaded', function() {
    fetch('../menus/plan-waffle-menu.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('waffleMenuContainer').innerHTML = data;

            // Make sure the header is accessible for toggle function
            const header = document.querySelector('.waffle-menu-header');
            if (header) {
                // Set initial state
                header.classList.remove('active');
            }
        })
        .catch(error => console.error('Error loading waffle menu:', error));
});

// ====== Console Message (Optional - shows site is loaded) ======
console.log('⚽ BDU Soccer Training Platform Loaded Successfully!');


document.addEventListener('DOMContentLoaded', function() {
    const scrollMenus = document.querySelectorAll('.scroll-menu');

    scrollMenus.forEach(menu => {
        let isDown = false;
        let startX;
        let scrollLeft;

        menu.addEventListener('mousedown', (e) => {
            isDown = true;
            menu.style.cursor = 'grabbing';
            startX = e.pageX - menu.offsetLeft;
            scrollLeft = menu.scrollLeft;
        });

        menu.addEventListener('mouseleave', () => {
            isDown = false;
            menu.style.cursor = 'grab';
        });

        menu.addEventListener('mouseup', () => {
            isDown = false;
            menu.style.cursor = 'grab';
        });

        menu.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - menu.offsetLeft;
            const walk = (x - startX) * 2;
            menu.scrollLeft = scrollLeft - walk;
        });
    });
});