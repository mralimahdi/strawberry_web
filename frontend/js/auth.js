// Authentication helper functions

async function login(email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and role
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);

        // Redirect based on role
        if (data.role === 'admin') {
            window.location.href = '/admin/dashboard.html';
        } else {
            window.location.href = '/user-dashboard.html';
        }

    } catch (error) {
        throw new Error(error.message || 'Login failed');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login.html';
}

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getUserRole() {
    return localStorage.getItem('userRole');
}

// Protected route helper
function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    
    // For admin pages
    if (window.location.pathname.startsWith('/admin/') && getUserRole() !== 'admin') {
        window.location.href = '/login.html';
    }
}
