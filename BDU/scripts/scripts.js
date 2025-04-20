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
