function toggleWaffleMenu() {
    const menu = document.getElementById('waffleMenu');
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

document.addEventListener("DOMContentLoaded", function () {
    const toggleButtons = document.querySelectorAll(".collapsible-section .toggle-button");

    toggleButtons.forEach(button => {
        button.addEventListener("click", function () {
            const collapsibleContent = this.closest(".collapsible-section").querySelector(".collapsible-content");
            const isExpanded = this.getAttribute("aria-expanded") === "true";

            this.setAttribute("aria-expanded", !isExpanded); // Toggle ARIA attribute
            collapsibleContent.style.display = isExpanded ? "none" : "block"; // Show/hide content
        });
    });
});

// Function to load and insert the waffle menu
function loadWaffleMenu() {
    fetch('menus/waffle-menu.html')
        .then(response => response.text())
        .then(data => {
            // Insert the menu at the beginning of the body
            document.body.insertAdjacentHTML('afterbegin', data);

            // Now that the menu is loaded, initialize its toggle functionality
            initWaffleMenu();
        })
        .catch(error => console.error('Error loading waffle menu:', error));
}

// Initialize waffle menu toggle functionality
function initWaffleMenu() {
    window.toggleWaffleMenu = function () {
        const menu = document.getElementById('waffleMenu');
        menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    };
}

// Load the waffle menu when the DOM is ready
document.addEventListener('DOMContentLoaded', loadWaffleMenu);

// document.addEventListener('DOMContentLoaded', function() {
//     const menuItemWithSubmenu = document.querySelector('.menu-item-with-submenu');
//     const mainLink = menuItemWithSubmenu.querySelector('a');
//     const subMenu = menuItemWithSubmenu.querySelector('.sub-menu');
//
//     mainLink.addEventListener('click', function(e) {
//         e.preventDefault(); // Prevent navigation when clicking the main link
//         const isSubMenuVisible = subMenu.style.display === 'flex';
//         subMenu.style.display = isSubMenuVisible ? 'none' : 'flex';
//     });
//
//     // Close submenu when clicking outside
//     document.addEventListener('click', function(e) {
//         if (!menuItemWithSubmenu.contains(e.target)) {
//             subMenu.style.display = 'none';
//         }
//     });
// });