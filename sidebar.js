document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        body.classList.toggle('sidebar-active');
    });

    // Ferme le sidebar si on clique en dehors
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggleButton = sidebarToggle.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnToggleButton && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            body.classList.remove('sidebar-active');
        }
    });
});