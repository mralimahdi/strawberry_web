(function() {
    const protectedPages = [
        'cart.html',
        'book_tour.html',
        'checkout.html',
        'ordernow.html',
        'tours.html'
    ];
    const authPages = [
        'login.html',
        'register.html'
    ];

    function getPageName() {
        const name = window.location.pathname.split('/').pop();
        return name || 'index.html';
    }

    function getToken() {
        return localStorage.getItem('token');
    }

    function getUserRole() {
        return localStorage.getItem('userRole');
    }

    function isLoggedIn() {
        return !!getToken();
    }

    function redirectToLogin(pageName) {
        localStorage.setItem('redirectAfterLogin', pageName);
        window.location.href = 'login.html';
    }

    function handleProtectedPage(pageName) {
        if (!protectedPages.includes(pageName)) return true;

        if (!isLoggedIn()) {
            redirectToLogin(pageName);
            return false;
        }

        if (getUserRole() === 'admin') {
            window.location.href = 'admin/dashboard.html';
            return false;
        }

        return true;
    }

    function handleAuthPage(pageName) {
        if (!authPages.includes(pageName)) return true;

        if (!isLoggedIn()) return true;

        const redirectPage = localStorage.getItem('redirectAfterLogin');
        if (redirectPage && redirectPage !== pageName) {
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectPage;
            return false;
        }

        window.location.href = 'cart.html';
        return false;
    }

    function updateNavigation() {
        const token = getToken();
        const userRole = getUserRole();
        const authLinks = document.querySelectorAll('.auth-nav-item');
        const nonAuthLinks = document.querySelectorAll('.non-auth-nav-item');
        const adminLinks = document.querySelectorAll('.admin-nav-item');

        if (token) {
            authLinks.forEach(link => link.style.display = 'block');
            nonAuthLinks.forEach(link => link.style.display = 'none');
            if (userRole === 'admin') {
                adminLinks.forEach(link => link.style.display = 'block');
            }
        } else {
            authLinks.forEach(link => link.style.display = 'none');
            nonAuthLinks.forEach(link => link.style.display = 'block');
            adminLinks.forEach(link => link.style.display = 'none');
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('adminName');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('lastLoginTime');
        localStorage.removeItem('cart');
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = 'index.html';
    }

    function onPageLoad() {
        const pageName = getPageName();
        if (!handleProtectedPage(pageName)) return;
        if (!handleAuthPage(pageName)) return;
        updateNavigation();
    }

    window.authHelpers = {
        getToken,
        getUserRole,
        isLoggedIn,
        logout,
        redirectToLogin,
        getRedirectAfterLogin: () => localStorage.getItem('redirectAfterLogin'),
        clearRedirectAfterLogin: () => localStorage.removeItem('redirectAfterLogin')
    };

    document.addEventListener('DOMContentLoaded', onPageLoad);
})();
