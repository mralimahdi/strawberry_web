// js/navbar.js
// Usage: Place <div id="navbar-include"></div> where you want the navbar.
// Then include this script at the end of <body>.

(function() {
  const target = document.getElementById('navbar-include');
  if (!target) return;
  
  function isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }

  function getUserRole() {
    return localStorage.getItem('userRole');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('redirectAfterLogin');
    window.location.href = 'index.html';
  }

  fetch('navbar.html')
    .then(res => res.text())
    .then(html => {
      target.innerHTML = html;
      // After navbar loads, update cart count and auth elements
      updateCartCount();
      updateNavigation();
      // Dispatch custom event to notify navbar loaded
      window.dispatchEvent(new Event('navbarLoaded'));
    });

  function updateNavigation() {
    const authLink = document.getElementById('auth-link');
    const userProfile = document.getElementById('user-profile');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const logoutLink = document.getElementById('logout-link');
    
    if (!authLink) return;
    
    if (isLoggedIn()) {
      // Hide login link
      authLink.style.display = 'none';
      
      // Show user profile
      if (userProfile) {
        userProfile.style.display = 'block';
        
        // Populate user info - handle both regular users and admins
        const userRole = localStorage.getItem('userRole');
        let userName, userEmail;
        
        if (userRole === 'admin') {
          userName = localStorage.getItem('adminName') || 'Admin';
          userEmail = localStorage.getItem('token') || 'admin@strawberryfarm.com';
        } else {
          userName = localStorage.getItem('userName') || 'User';
          userEmail = localStorage.getItem('userEmail') || '';
        }
        
        if (profileName) profileName.textContent = userName;
        if (profileEmail) profileEmail.textContent = userEmail;
        
        // Setup logout
        if (logoutLink) {
          logoutLink.onclick = function(e) {
            e.preventDefault();
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
          };
        }
      }
    } else {
      // Show login link
      authLink.style.display = 'inline-block';
      authLink.textContent = 'LOGIN';
      authLink.href = 'login.html';
      authLink.onclick = null;
      
      // Hide user profile
      if (userProfile) {
        userProfile.style.display = 'none';
      }
    }
  }
  window.updateAuthLink = updateNavigation;
  window.isLoggedIn = isLoggedIn;
  window.addEventListener('storage', function(e) {
    if (e.key === 'token') updateAuthLink();
  });

  function updateCartCount() {
    console.log('updateCartCount called');
    // Find all elements with class 'cart-count' and update
    const cartCountEls = document.getElementsByClassName('cart-count');
    console.log('cartCountEls length:', cartCountEls.length);
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {}
    const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    for (let el of cartCountEls) {
      el.textContent = count;
    }
  }
  window.updateCartCount = updateCartCount;
  // Also update on storage change (multi-tab)
  window.addEventListener('storage', function(e) {
    if (e.key === 'cart') updateCartCount();
  });
})();
