const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('close-sidebar');

if (menuToggle && sidebar && closeSidebar) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });

    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) &&
            !menuToggle.contains(event.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
}
