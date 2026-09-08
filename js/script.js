// js/script.js

// js/script.js

// Function to handle cookie acceptance

// Change relative paths from:
// fetch('index.php')

// To your absolute HostAfrica domain:


function acceptCookies() {
    localStorage.setItem('cookieAccepted', 'true');
    const cookieNotice = document.getElementById('cookie-notice');
    if (cookieNotice) {
        cookieNotice.style.display = 'none';
    }
}

/**
 * Renders the overall page layout including header, given content, and footer.
 * This helps keep the header/footer consistent across different dynamic pages.
 * @param {string} contentHtml - The HTML content to be injected into the main body area.
 */
function renderPageLayout(contentHtml) {
    const bodycontentDiv = document.getElementById("bodycontent");
    bodycontentDiv.innerHTML = `
        <div id="cookie-notice" style="background: #222; color: white; padding: 10px; text-align: center; display: none;">
            This device uses cookies to improve your experience. <button onclick="acceptCookies()" style="margin-left: 10px;">Got it</button>
        </div>

        <header style="width:100%; display: flex; justify-content: space-between; align-items: center; padding: 0 15px;" id="main-app-header">
            <a onclick="showNewNotifications()" style="font-size: 25px; cursor: pointer;"><i class='bx bxs-bell'></i></a>
            <center>
                <a href="#"><img src="https://see.fontimg.com/api/renderfont4/p72nK/eyJyIjoiZnMiLCJoIjo4MSwidyI6MTI1MCwiZnMiOjY1LCJmZ2MiOiIjMDAwMDAwIiwiYmdjIjoiI0ZGRkZGRiIsInQiOjF9/bUZPQ0FO/dripinkpersonaluse-black.png" alt="Dripping fonts"></a>
                <strong><p style="color: black">System Integrations</p></strong>
            </center>
            <div id="auth-status">
            </div>
        </header>

        ${contentHtml}

    `;

    const cookieNotice = document.getElementById('cookie-notice');
    if (cookieNotice) {
        if (!localStorage.getItem('cookieAccepted')) {
            cookieNotice.style.display = 'block';
        }
    }

    // Automatically re-inject "Welcome, [user]" or "Login / Sign In" into #auth-status on every page render
    if (typeof updateAuthStatus === 'function') {
        updateAuthStatus();
    }
}

/**
 * Updates the authentication status display in the header.
 * @param {object} sessionData - Object containing loggedIn, username, isAdmin.
 */
function updateAuthStatus(sessionData = {}) {
    const authStatusDiv = document.getElementById('auth-status');
    if (!authStatusDiv) {
        console.warn("auth-status div not found.");
        return;
    }

    // Check server session state or fallback to local persistence for mobile WebViews
    const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const localUsername = localStorage.getItem('username');

    const isLoggedIn = sessionData.loggedIn || localLoggedIn;
    const username = sessionData.username || localUsername;

    if (isLoggedIn && username) {
        authStatusDiv.innerHTML = `
            <span style="color: black; margin-right: 10px; font-weight: 600;">Welcome, ${username}!</span>
            <button id="register-business-btn" class="menu-button1" style="font-size:16px; width:auto; margin-left: 10px;">Register Business</button>
            <button id="logout-btn" class="menu-button1" style="font-size:16px; width:auto; margin-left: 10px;">Logout</button>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    const endpoint = CONFIG?.getApiUrl ? CONFIG.getApiUrl('api/index.php?path=logout') : 'api/index.php?path=logout';
                    
                    await fetch(endpoint, { 
                        method: 'POST', 
                        ...CONFIG?.FETCH_OPTIONS,
                        credentials: 'include' 
                    });
                } catch (err) {
                    console.error('Logout request error:', err);
                } finally {
                    // Clear local persistence on logout
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userToken');

                    // Re-evaluate auth status to transition back to guest view immediately
                    updateAuthStatus({ loggedIn: false });

                    if (typeof showHomePage === 'function') {
                        showHomePage();
                    } else if (typeof checkAuthState === 'function') {
                        await checkAuthState();
                    } else {
                        window.location.reload();
                    }
                }
            });
        }

        const registerBusinessBtn = document.getElementById('register-business-btn');
        if (registerBusinessBtn && typeof showRegisterBusinessPage === 'function') {
            registerBusinessBtn.addEventListener('click', showRegisterBusinessPage);
        }

    } else {
        authStatusDiv.innerHTML = `<button id="login-btn" class="menu-button1" style="font-size:20px; width:auto;">Login / Sign Up</button>`;
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn && typeof showSignInPage === 'function') {
            loginBtn.addEventListener('click', showSignInPage);
        }
    }
}


// Function to show the default main page content
function mainPageContent() {
    console.log("Rendering Main Page Content...");
    const contentHtml = `
        <section class="menu-body">
            <div class="menu-container-wrapper">
                <div class="menu-content">
                    <a id="business-supply" onclick="businessSupply()" class="menu-card">
                        <div class="row">
                            <img src="bus.png" alt="Business Supply">
                            <div class="layer">
                                <h5>BUSINESS SUPPLY</h5>
                            </div>
                        </div>
                    </a>
                    
                    <a onclick="businessAd()" class="menu-card">
                        <div class="row">
                            <img src="ad.jpg" alt="Business Advertisement">
                            <div class="layer">
                                <h5>BUSINESS AD</h5>
                            </div>
                        </div>
                    </a>
                    
                    <a onclick="requestPage()" class="menu-card">
                        <div class="row">
                            <img src="SERV.jpeg" alt="Service Request">
                            <div class="layer">
                                <h5>SERVICE REQUEST</h5>
                            </div>
                        </div>
                    </a>
                    
                    <a onclick="showServices()" class="menu-card">
                        <div class="row">
                            <img src="tender.jpeg" alt="Tender">
                            <div class="layer">
                                <h5>TENDER</h5>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    `;
    renderPageLayout(contentHtml);
}


// Function to show the Sign In page
function showSignInPage() {
    console.log("Rendering Sign In page...");
    
    const contentHtml = `
        <div class="sign" style="min-height: 80vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; padding: 20px; box-sizing: border-box;">
            <form id="loginForm" action="javascript:void(0);" method="POST" class="sign-form" style="
                width: 100%;
                max-width: 400px;
                padding: 30px 24px; 
                background: rgba(255, 255, 255, 0.08); 
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 16px; 
                color: #ffffff;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                display: flex;
                flex-direction: column;
                gap: 18px;
                box-sizing: border-box;
            ">
                <h2 style="margin: 0 0 5px 0; font-size: 1.75rem; font-weight: 600; text-align: center; letter-spacing: -0.5px;">Sign In</h2>
                
                <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                    <input type="text" class="enter-form" placeholder="Username" name="username" required style="
                        width: 100%;
                        padding: 14px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        color: #ffffff;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                        -webkit-appearance: none;
                    " onfocus="this.style.borderColor='#3b82f6'; this.style.backgroundColor='rgba(255,255,255,0.1)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.backgroundColor='rgba(255,255,255,0.05)';">
                </div>

                <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                    <input type="password" class="enter-form" placeholder="Password" name="password" required style="
                        width: 100%;
                        padding: 14px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        color: #ffffff;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                        -webkit-appearance: none;
                    " onfocus="this.style.borderColor='#3b82f6'; this.style.backgroundColor='rgba(255,255,255,0.1)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.backgroundColor='rgba(255,255,255,0.05)';">
                </div>

                <button class="btn" type="submit" style="
                    width: 100%;
                    padding: 14px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s ease, transform 0.1s ease;
                    box-sizing: border-box;
                    -webkit-appearance: none;
                    -webkit-tap-highlight-color: transparent;
                " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                    Sign In
                </button>

                <p id="loginMessage" style="color: #ef4444; margin: 0; font-size: 0.9rem; text-align: center; min-height: 20px; font-weight: 500; word-break: break-word;"></p>
                
                <p style="margin: 4px 0 0 0; text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 0.95rem; line-height: 1.4;">
                    Don't have an account? <br style="display: none;" class="mobile-break">
                    <a href="#" id="show-signup-form" style="color: #60a5fa; text-decoration: none; font-weight: 500; transition: color 0.2s; display: inline-block; padding: 5px;" onmouseover="this.style.color='#93c5fd'" onmouseout="this.style.color='#60a5fa'">Sign Up</a>
                </p>
            </form>
        </div>
    `;
    renderPageLayout(contentHtml);

    const loginForm = document.getElementById('loginForm');
    const loginMessageDisplay = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            loginMessageDisplay.textContent = '';
            loginMessageDisplay.style.color = '#ef4444';

            const username = loginForm.username.value.trim();
            const password = loginForm.password.value;

            try {
                const endpoint = CONFIG?.getApiUrl ? CONFIG.getApiUrl('api/index.php?path=login') : 'api/index.php?path=login';
                
                const response = await fetch(endpoint, {
                    ...CONFIG?.FETCH_OPTIONS,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(CONFIG?.FETCH_OPTIONS?.headers || {})
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok) {
                    loginMessageDisplay.style.color = '#10b981';
                    loginMessageDisplay.textContent = result.message || 'Login successful!';

                    const activeUser = result.username || result.user?.username || username;

                    // 1. Persist login details locally
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', activeUser);

                    // 2. Force immediate header UI sync
                    if (typeof updateAuthStatus === 'function') {
                        updateAuthStatus({ loggedIn: true, username: activeUser });
                    }

                    // 3. Robust redirect execution with fallback routing
                    setTimeout(() => {
                        try {
                            if (typeof showHomePage === 'function') {
                                showHomePage();
                            } else if (typeof renderHomePage === 'function') {
                                renderHomePage();
                            } else if (typeof showMainPage === 'function') {
                                showMainPage();
                            } else if (typeof loadHomePage === 'function') {
                                loadHomePage();
                            } else {
                                // Fallback: Reload root path to render home view with saved session
                                window.location.href = window.location.pathname;
                            }
                        } catch (routingError) {
                            console.error("Home navigation error, executing fallback reload:", routingError);
                            window.location.href = window.location.pathname;
                        }
                    }, 300);

                } else {
                    loginMessageDisplay.textContent = result.message || 'Login failed. Please try again.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                loginMessageDisplay.textContent = 'Network error. Please try again.';
            }
        });
    }

    const showSignupFormLink = document.getElementById('show-signup-form');
    if (showSignupFormLink) {
        showSignupFormLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof showSignUpPage === 'function') {
                showSignUpPage();
            }
        });
    }
}

// Function to show the Sign Up page
function showSignUpPage() {
    console.log("Rendering Sign Up page...");
    
    const contentHtml = `
        <div class="sign" style="min-height: 80vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; padding: 20px; box-sizing: border-box;">
            <form id="signupForm" action="javascript:void(0);" method="POST" class="sign-form" style="
                width: 100%;
                max-width: 400px;
                padding: 30px 24px; 
                background: rgba(255, 255, 255, 0.08); 
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 16px; 
                color: #ffffff;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                display: flex;
                flex-direction: column;
                gap: 18px;
                box-sizing: border-box;
            ">
                <h2 style="margin: 0 0 5px 0; font-size: 1.75rem; font-weight: 600; text-align: center; letter-spacing: -0.5px;">Sign Up</h2>
                
                <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                    <input type="text" class="enter-form" placeholder="Username" name="username" required style="
                        width: 100%;
                        padding: 14px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        color: #ffffff;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                        -webkit-appearance: none;
                    " onfocus="this.style.borderColor='#3b82f6'; this.style.backgroundColor='rgba(255,255,255,0.1)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.backgroundColor='rgba(255,255,255,0.05)';">
                </div>

                <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                    <input type="password" class="enter-form" placeholder="Password" name="password" required style="
                        width: 100%;
                        padding: 14px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        color: #ffffff;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                        -webkit-appearance: none;
                    " onfocus="this.style.borderColor='#3b82f6'; this.style.backgroundColor='rgba(255,255,255,0.1)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.backgroundColor='rgba(255,255,255,0.05)';">
                </div>

                <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                    <input type="password" class="enter-form" placeholder="Confirm Password" name="confirmPassword" required style="
                        width: 100%;
                        padding: 14px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 8px;
                        color: #ffffff;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        box-sizing: border-box;
                        -webkit-appearance: none;
                    " onfocus="this.style.borderColor='#3b82f6'; this.style.backgroundColor='rgba(255,255,255,0.1)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.backgroundColor='rgba(255,255,255,0.05)';">
                </div>

                <button class="btn" type="submit" style="
                    width: 100%;
                    padding: 14px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s ease, transform 0.1s ease;
                    box-sizing: border-box;
                    -webkit-appearance: none;
                    -webkit-tap-highlight-color: transparent;
                " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                    Sign Up
                </button>

                <p id="signupMessage" style="color: #ef4444; margin: 0; font-size: 0.9rem; text-align: center; min-height: 20px; font-weight: 500; word-break: break-word;"></p>
                
                <p style="margin: 4px 0 0 0; text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 0.95rem; line-height: 1.4;">
                    Already have an account? 
                    <a href="#" id="show-login-form" style="color: #60a5fa; text-decoration: none; font-weight: 500; transition: color 0.2s; display: inline-block; padding: 5px;" onmouseover="this.style.color='#93c5fd'" onmouseout="this.style.color='#60a5fa'">Sign In</a>
                </p>
            </form>
        </div>
    `;
    renderPageLayout(contentHtml);

    const signupForm = document.getElementById('signupForm');
    const signupMessageDisplay = document.getElementById('signupMessage');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            signupMessageDisplay.textContent = '';
            signupMessageDisplay.style.color = '#ef4444';

            const username = signupForm.username.value.trim();
            const password = signupForm.password.value;
            const confirmPassword = signupForm.confirmPassword.value;

            if (password !== confirmPassword) {
                signupMessageDisplay.textContent = 'Passwords do not match.';
                return;
            }

            try {
                const endpoint = typeof CONFIG !== 'undefined' && CONFIG.getApiUrl 
                    ? CONFIG.getApiUrl('api/index.php?path=signup') 
                    : 'api/index.php?path=signup';

                const fetchOptions = typeof CONFIG !== 'undefined' && CONFIG.FETCH_OPTIONS 
                    ? CONFIG.FETCH_OPTIONS 
                    : {};

                const response = await fetch(endpoint, {
                    ...fetchOptions,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(fetchOptions.headers || {})
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password, confirmPassword })
                });

                const result = await response.json();

                if (response.ok) {
                    signupMessageDisplay.style.color = '#10b981';
                    signupMessageDisplay.textContent = result.message || 'Account created! Redirecting to home...';

                    const activeUser = result.username || result.user?.username || username;

                    // 1. Commit active session state directly to local cache
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', activeUser);

                    // 2. Refresh top navbar / header UI
                    if (typeof updateAuthStatus === 'function') {
                        updateAuthStatus({ loggedIn: true, username: activeUser });
                    }

                    // 3. Direct route to main/home page with window.location fallback
                    setTimeout(() => {
                        try {
                            if (typeof showHomePage === 'function') {
                                showHomePage();
                            } else if (typeof renderHomePage === 'function') {
                                renderHomePage();
                            } else if (typeof showMainPage === 'function') {
                                showMainPage();
                            } else if (typeof loadHomePage === 'function') {
                                loadHomePage();
                            } else {
                                window.location.href = window.location.pathname;
                            }
                        } catch (routingError) {
                            console.error("Home navigation failed post-signup:", routingError);
                            window.location.href = window.location.pathname;
                        }
                    }, 300);

                } else {
                    signupMessageDisplay.textContent = result.message || 'Sign up failed. Please try again.';
                }
            } catch (error) {
                console.error('Error during sign up:', error);
                signupMessageDisplay.textContent = 'An unexpected error occurred. Please try again.';
            }
        });
    }

    const showLoginFormLink = document.getElementById('show-login-form');
    if (showLoginFormLink) {
        showLoginFormLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof showSignInPage === 'function') {
                showSignInPage();
            } else {
                console.error("Error: showSignInPage function is missing globally.");
            }
        });
    }
}

function showAdminPage() {
    console.log("Rendering Admin page...");
    
    const contentHtml = `
        <div style="min-height: 80vh; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box;">
            <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
                
                <!-- Header Controls -->
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <button id="adminBackBtn" class="btn" style="
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        color: #ffffff;
                        padding: 10px 18px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                        &larr; Back to Main
                    </button>
                    <h1 style="margin: 0; color: #ffffff; font-size: 2rem; font-weight: 700; letter-spacing: -0.5px;">ADMIN PANEL</h1>
                </div>

                <!-- === BUSINESS SUPPLY SECTION === -->
                <section style="display: flex; flex-direction: column; gap: 20px;">
                    <h2 style="color: #93c5fd; font-size: 1.4rem; margin: 10px 0 0 0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                        Manage Business Supply
                    </h2>

                    <!-- Form: Add Supply Name -->
                    <div style="
                        background: rgba(255, 255, 255, 0.08); 
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 16px;
                        padding: 24px;
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    ">
                        <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 1.15rem; font-weight: 600;">Add New Business Supply</h3>
                        <form id="addBusinessSupplyForm" action="javascript:void(0);" style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <label style="color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500;">Business Supply Name:</label>
                                <input type="text" id="newBusinessSupplyName" class="enter-form" required style="
                                    width: 100%;
                                    padding: 12px;
                                    background: rgba(255, 255, 255, 0.05);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 8px;
                                    color: #ffffff;
                                    font-size: 16px;
                                    box-sizing: border-box;
                                " onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                            </div>
                            <button type="submit" class="btn" style="
                                background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Add Supply Name</button>
                            <p id="addSupplyMessage" style="margin: 0; font-size: 0.9rem; font-weight: 500; min-height: 20px; text-align: center;"></p>
                        </form>
                    </div>

                    <!-- Form: Add Supply Details -->
                    <div style="
                        background: rgba(255, 255, 255, 0.08); 
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 16px;
                        padding: 24px;
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    ">
                        <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 1.15rem; font-weight: 600;">Add Business Supply Details</h3>
                        <form id="addSupplyDetailsForm" action="javascript:void(0);" style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <label style="color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500;">Supply Category:</label>
                                <input type="text" id="detailSupplyCategory" class="enter-form" required style="
                                    width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #ffffff; font-size: 16px; box-sizing: border-box;
                                " onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <label style="color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500;">Supply Name:</label>
                                <select id="detailBusinessSupplyName" class="enter-form" required style="
                                    width: 100%; padding: 12px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #ffffff; font-size: 16px; box-sizing: border-box;
                                ">
                                    <option value="">Loading...</option>
                                </select>
                            </div>

                            <button type="submit" class="btn" style="
                                background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Add Supply Detail</button>
                            <p id="addDetailsMessage" style="margin: 0; font-size: 0.9rem; font-weight: 500; min-height: 20px; text-align: center;"></p>
                        </form>
                    </div>
                </section>

                <!-- === BUSINESS AD SECTION === -->
                <section style="display: flex; flex-direction: column; gap: 20px; margin-top: 10px;">
                    <h2 style="color: #93c5fd; font-size: 1.4rem; margin: 10px 0 0 0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                        Manage Business Advertisement
                    </h2>

                    <!-- Form: Add Business Ad -->
                    <div style="
                        background: rgba(255, 255, 255, 0.08); 
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 16px;
                        padding: 24px;
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    ">
                        <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 1.15rem; font-weight: 600;">Add New Business Ad</h3>
                        <form id="addBusinessAdForm" action="javascript:void(0);" style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <label style="color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500;">Ad Name:</label>
                                <input type="text" id="newBusinessAdName" class="enter-form" required style="
                                    width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #ffffff; font-size: 16px; box-sizing: border-box;
                                " onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                            </div>
                            <button type="submit" class="btn" style="
                                background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Add Business Ad</button>
                            <p id="addAdMessage" style="margin: 0; font-size: 0.9rem; font-weight: 500; min-height: 20px; text-align: center;"></p>
                        </form>
                    </div>

                    <!-- Form: Add Business Ad Details -->
                    <div style="
                        background: rgba(255, 255, 255, 0.08); 
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 16px;
                        padding: 24px;
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    ">
                        <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 1.15rem; font-weight: 600;">Add Business Ad Details</h3>
                        <form id="addBusinessAdDetailsForm" action="javascript:void(0);" style="display: flex; flex-direction: column; gap: 16px;">
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <label style="color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500;">Ad Category:</label>
                                <input type="text" id="adCategory" class="enter-form" required style="
                                    width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #ffffff; font-size: 16px; box-sizing: border-box;
                                " onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <label style="color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500;">Ad Name:</label>
                                <select id="adParentName" class="enter-form" required style="
                                    width: 100%; padding: 12px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #ffffff; font-size: 16px; box-sizing: border-box;
                                ">
                                    <option value="">Loading...</option>
                                </select>
                            </div>

                            <button type="submit" class="btn" style="
                                background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Add Ad Detail</button>
                            <p id="addAdDetailsMessage" style="margin: 0; font-size: 0.9rem; font-weight: 500; min-height: 20px; text-align: center;"></p>
                        </form>
                    </div>
                </section>

            </div>
        </div>
    `;
    renderPageLayout(contentHtml);

    // === Navigation Handler ===
    const backBtn = document.getElementById('adminBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof showHomePage === 'function') {
                showHomePage();
            } else {
                window.location.reload();
            }
        });
    }

    // === Load Dropdowns ===
    async function loadBusinessSupplyNames() {
        const select = document.getElementById('detailBusinessSupplyName');
        select.innerHTML = '<option value="">Loading...</option>';
        try {
            const endpoint = CONFIG.getApiUrl('api/index.php?path=business-supply-names');
            const res = await fetch(endpoint, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'GET'
            });
            const { success, data } = await res.json();
            if (success) {
                select.innerHTML = '<option value="">-- Select --</option>';
                data.forEach(name => {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    select.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Failed to load supply names', err);
            select.innerHTML = '<option value="">Error loading</option>';
        }
    }

    async function loadBusinessAdNames() {
        const select = document.getElementById('adParentName');
        select.innerHTML = '<option value="">Loading...</option>';
        try {
            const endpoint = CONFIG.getApiUrl('api/index.php?path=business-ad-names');
            const res = await fetch(endpoint, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'GET'
            });
            const { success, data } = await res.json();
            if (success) {
                select.innerHTML = '<option value="">-- Select --</option>';
                data.forEach(name => {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    select.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Failed to load ad names', err);
            select.innerHTML = '<option value="">Error loading</option>';
        }
    }

    loadBusinessSupplyNames();
    loadBusinessAdNames();

    // === SUBMIT: Add Business Supply ===
    document.getElementById('addBusinessSupplyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('newBusinessSupplyName').value;
        const msg = document.getElementById('addSupplyMessage');
        msg.textContent = '';
        try {
            const endpoint = CONFIG.getApiUrl('api/index.php?path=admin/business-supply');
            const res = await fetch(endpoint, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'POST',
                body: JSON.stringify({ businessSupplyName: name })
            });
            const result = await res.json();
            msg.style.color = res.ok ? '#10b981' : '#ef4444';
            msg.textContent = result.message || (res.ok ? 'Added successfully.' : 'Failed to add.');
            if (res.ok) {
                document.getElementById('newBusinessSupplyName').value = '';
                loadBusinessSupplyNames();
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = 'Error occurred.';
        }
    });

    // === SUBMIT: Add Supply Details ===
    document.getElementById('addSupplyDetailsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('detailSupplyCategory').value;
        const name = document.getElementById('detailBusinessSupplyName').value;
        const msg = document.getElementById('addDetailsMessage');
        msg.textContent = '';
        try {
            const endpoint = CONFIG.getApiUrl('api/index.php?path=admin/business-supply-details');
            const res = await fetch(endpoint, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'POST',
                body: JSON.stringify({ supplyCategory: category, businessSupplyName: name })
            });
            const result = await res.json();
            msg.style.color = res.ok ? '#10b981' : '#ef4444';
            msg.textContent = result.message || (res.ok ? 'Details added successfully.' : 'Failed to add details.');
            if (res.ok) {
                document.getElementById('detailSupplyCategory').value = '';
                document.getElementById('detailBusinessSupplyName').value = '';
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = 'Error occurred.';
        }
    });

    // === SUBMIT: Add Business Ad ===
    document.getElementById('addBusinessAdForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('newBusinessAdName').value;
        const msg = document.getElementById('addAdMessage');
        msg.textContent = '';
        try {
            const endpoint = CONFIG.getApiUrl('api/index.php?path=admin/business-ad');
            const res = await fetch(endpoint, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'POST',
                body: JSON.stringify({ businessAdName: name })
            });
            const result = await res.json();
            msg.style.color = res.ok ? '#10b981' : '#ef4444';
            msg.textContent = result.message || (res.ok ? 'Ad added successfully.' : 'Failed to add ad.');
            if (res.ok) {
                document.getElementById('newBusinessAdName').value = '';
                loadBusinessAdNames();
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = 'Error occurred.';
        }
    });

    // === SUBMIT: Add Business Ad Details ===
    document.getElementById('addBusinessAdDetailsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('adCategory').value;
        const name = document.getElementById('adParentName').value;
        const msg = document.getElementById('addAdDetailsMessage');
        msg.textContent = '';
        try {
            const endpoint = CONFIG.getApiUrl('api/index.php?path=admin-business-ad-details');
            const res = await fetch(endpoint, {
                ...CONFIG.FETCH_OPTIONS,
                method: 'POST',
                body: JSON.stringify({ adCategory: category, businessAdName: name })
            });
            const result = await res.json();
            msg.style.color = res.ok ? '#10b981' : '#ef4444';
            msg.textContent = result.message || (res.ok ? 'Ad details added successfully.' : 'Failed to add ad details.');
            if (res.ok) {
                document.getElementById('adCategory').value = '';
                document.getElementById('adParentName').value = '';
            }
        } catch (err) {
            msg.style.color = '#ef4444';
            msg.textContent = 'Error occurred.';
        }
    });
}

// Function to dynamically generate buttons from tblBusinessSupply
async function businessSupply() {
    // Shared button style definitions to prevent redundant allocations in loops
    const baseButtonStyle = {
        width: '100%',
        padding: '16px 24px',
        background: '#ff3c00',
        border: 'none',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '1.05rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(255, 60, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.15s ease',
        textAlign: 'center',
        boxSizing: 'border-box'
    };

    const businessSupplyPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #ffeae3 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
        ">
            <header style="
                max-width: 500px; 
                margin: 0 auto 30px auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            " id="business-supply-page-header">
                
                <div style="width: 100%; display: flex; justify-content: flex-start;">
                    <button type="button" class="menu-button" id="business-back-btn" style="
                        cursor: pointer; 
                        padding: 6px 14px; 
                        background: #ffffff; 
                        border: 1px solid #d1d5db; 
                        border-radius: 6px; 
                        color: #1f2937; 
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        transition: all 0.2s ease;
                        display: inline-flex;
                        align-items: center;
                    ">
                        &larr; Back
                    </button>
                </div>
                
                <h2 style="
                    color: #111827; 
                    margin: 0; 
                    font-size: 1.4rem; 
                    font-weight: 700; 
                    text-align: center;
                    line-height: 1.3;
                ">Business Supply Categories</h2>
            </header>

            <section class="business-menu" style="max-width: 500px; margin: 0 auto;">
                <form action="#" method="get" id="businessSupplyForm" style="margin: 0;">
                    <div id="business-supply-names-container" style="
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        width: 100%;
                        box-sizing: border-box;
                    ">
                        <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 30px 0;">
                            Loading business supply names...
                        </p>
                    </div>
                </form>
            </section>
        </section>
    `;

    const bodyContentContainer = document.getElementById("bodycontent");
    if (!bodyContentContainer) {
        console.error("Error: #bodycontent element not found.");
        return;
    }

    renderPageLayout(businessSupplyPageContent);

    // Prevent default form submissions
    document.getElementById('businessSupplyForm')?.addEventListener('submit', (e) => e.preventDefault());

    // Back button event binding
    document.getElementById('business-back-btn')?.addEventListener('click', () => {
        mainPageContent();
    });

    const businessSupplyNamesContainer = document.getElementById('business-supply-names-container');
    if (!businessSupplyNamesContainer) {
        console.error("Error: #business-supply-names-container missing post-render.");
        return;
    }

    // Fetch Supply Categories via global CONFIG helpers
    try {
        const response = await fetch(
            CONFIG.getApiUrl('api/index.php?path=business-supply-names'), 
            CONFIG.FETCH_OPTIONS
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            businessSupplyNamesContainer.innerHTML = '';

            const fragment = document.createDocumentFragment();

            data.data.forEach(name => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'menu-button';
                button.textContent = name;
                
                Object.assign(button.style, baseButtonStyle);

                // Dynamic interactions
                button.addEventListener('mouseenter', () => {
                    button.style.background = '#e03500'; 
                    button.style.transform = 'translateY(-1px)';
                    button.style.boxShadow = '0 6px 8px -1px rgba(255, 60, 0, 0.3)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.background = '#ff3c00';
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = '0 4px 6px -1px rgba(255, 60, 0, 0.2)';
                });
                
                button.addEventListener('mousedown', () => {
                    button.style.transform = 'translateY(1px)';
                    button.style.boxShadow = '0 2px 4px -1px rgba(255, 60, 0, 0.2)';
                });

                button.addEventListener('click', () => {
                    if (typeof showSupplyCategoryPage === 'function') {
                        showSupplyCategoryPage(name);
                    } else {
                        console.error("Error: showSupplyCategoryPage function is missing.");
                    }
                });
                
                fragment.appendChild(button);
            });

            businessSupplyNamesContainer.appendChild(fragment);

        } else if (data.data && data.data.length === 0) {
            businessSupplyNamesContainer.innerHTML = '<p style="color: #4b5563; text-align: center; font-weight: 500;">No business supply names found.</p>';
        } else {
            businessSupplyNamesContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Failed to load business supply names.</p>';
            console.error('API response error:', data.message);
        }
    } catch (error) {
        console.error('Error fetching business supply names:', error);
        businessSupplyNamesContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Error loading business supply names. Please check network logs.</p>';
    }

    // Fetch and sync Auth/Session State via global CONFIG helpers
    try {
        const response = await fetch(
            CONFIG.getApiUrl('api/index.php?path=session-data'), 
            CONFIG.FETCH_OPTIONS
        );
        if (response.ok) {
            const currentSessionData = await response.json();
            
            if (typeof updateAuthStatus === 'function') {
                updateAuthStatus(currentSessionData);
            }

            if (currentSessionData.loggedIn) {
                document.getElementById('logout-btn')?.remove();
            }
        }
    } catch (error) {
        console.error('Error syncing session state:', error);
    }
}


// Function to show supply categories for a specific business supply name
// MODIFIED FUNCTION: showSupplyCategoryPage
// Now calls showBusinessesByCategoryPage when a category button is clicked
async function showSupplyCategoryPage(businessSupplyName) {
    const pageTitle = `${businessSupplyName} Categories`;

    // Matches the safe header structure and layout theme perfectly
    const supplyCategoryPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #ffeae3 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
        ">
            <header style="
                max-width: 500px; 
                margin: 0 auto 30px auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            " id="category-page-header">
                
                <div style="width: 100%; display: flex; justify-content: flex-start;">
                    <button type="button" class="menu-button" id="category-back-btn" style="
                        cursor: pointer; 
                        padding: 6px 14px; 
                        background: #ffffff; 
                        border: 1px solid #d1d5db; 
                        border-radius: 6px; 
                        color: #1f2937; 
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        transition: all 0.2s ease;
                        display: inline-flex;
                        align-items: center;
                    ">
                        &larr; Back
                    </button>
                </div>
                
                <h2 style="
                    color: #111827; 
                    margin: 0; 
                    font-size: 1.4rem; 
                    font-weight: 700; 
                    text-align: center;
                    line-height: 1.3;
                ">${pageTitle}</h2>
            </header>

            <section class="business-menu" style="max-width: 500px; margin: 0 auto;">
                <form action="#" method="get" id="supplyCategoryForm" style="margin: 0;">
                    <div id="dynamic-category-buttons-container" style="
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        width: 100%;
                        box-sizing: border-box;
                    ">
                        <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 30px 0;">
                            Loading categories for ${businessSupplyName}...
                        </p>
                    </div>
                </form>
            </section>
        </section>
    `;

    const bodyContentContainer = document.getElementById("bodycontent");
    if (!bodyContentContainer) {
        console.error("Error: #bodycontent not found! Cannot render supply category page.");
        return;
    }

    renderPageLayout(supplyCategoryPageContent);

    // Form behavior cleanup
    const supplyCategoryForm = document.getElementById('supplyCategoryForm');
    if (supplyCategoryForm) {
        supplyCategoryForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // Modern isolated Back click router
    const backBtn = document.getElementById('category-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof businessSupply === 'function') {
                businessSupply();
            } else {
                console.error("Error: businessSupply function is missing globally.");
            }
        });
    }

    const dynamicCategoryButtonsContainer = document.getElementById('dynamic-category-buttons-container');
    if (!dynamicCategoryButtonsContainer) {
        console.error("Error: #dynamic-category-buttons-container not found after rendering content for supply categories!");
        return;
    }

    try {
        // Resolved API call using CONFIG helper and default fetch settings
        const categoryEndpoint = CONFIG.getApiUrl(`api/index.php?path=supply-categories&businessSupplyName=${encodeURIComponent(businessSupplyName)}`);
        const response = await fetch(categoryEndpoint, { ...CONFIG.FETCH_OPTIONS });
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            dynamicCategoryButtonsContainer.innerHTML = '';

            data.data.forEach(category => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'menu-button';
                button.textContent = category;
                
                // Solid brand-colored layout styles
                Object.assign(button.style, {
                    width: '100%',
                    padding: '16px 24px',
                    background: '#ff3c00', 
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff', 
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(255, 60, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                });

                // Mouse Event Listeners (Desktop)
                button.addEventListener('mouseenter', () => {
                    button.style.background = '#e03500'; 
                    button.style.transform = 'translateY(-1px)';
                    button.style.boxShadow = '0 6px 8px -1px rgba(255, 60, 0, 0.3)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.background = '#ff3c00';
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = '0 4px 6px -1px rgba(255, 60, 0, 0.2)';
                });
                
                button.addEventListener('mousedown', () => {
                    button.style.transform = 'translateY(1px)';
                    button.style.boxShadow = '0 2px 4px -1px rgba(255, 60, 0, 0.2)';
                });

                // Touch Event Listeners (Mobile / Capacitor WebView)
                button.addEventListener('touchstart', () => {
                    button.style.background = '#e03500';
                    button.style.transform = 'translateY(1px)';
                }, { passive: true });

                button.addEventListener('touchend', () => {
                    button.style.background = '#ff3c00';
                    button.style.transform = 'translateY(0)';
                }, { passive: true });

                button.addEventListener('click', () => {
                    if (typeof showBusinessesByCategoryPage === 'function') {
                        showBusinessesByCategoryPage(category, businessSupplyName);
                    } else {
                        console.error("Error: showBusinessesByCategoryPage function is missing globally.");
                    }
                });
                
                dynamicCategoryButtonsContainer.appendChild(button);
            });

        } else if (data.data && data.data.length === 0) {
            dynamicCategoryButtonsContainer.innerHTML = `<p style="color: #4b5563; text-align: center; font-weight: 500;">No categories found for "${businessSupplyName}".</p>`;
        } else {
            dynamicCategoryButtonsContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Failed to load categories.</p>';
            console.error('API response error:', data.message);
        }
    } catch (error) {
        console.error('Error fetching supply categories:', error);
        dynamicCategoryButtonsContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Error loading categories. Please check server logs.</p>';
    }

    let currentSessionData = { loggedIn: false, isAdmin: false, username: null };
    try {
        // Resolved session fetch using CONFIG helper and default fetch settings
        const sessionEndpoint = CONFIG.getApiUrl('api/index.php?path=session-data');
        const response = await fetch(sessionEndpoint, { ...CONFIG.FETCH_OPTIONS });
        currentSessionData = await response.json();
    } catch (error) {
        console.error('Error re-fetching session data for updateAuthStatus in showSupplyCategoryPage:', error);
    }

    if (typeof updateAuthStatus === 'function') {
        updateAuthStatus(currentSessionData);
    }

    if (currentSessionData.loggedIn) {
        const authStatusDiv = document.getElementById('auth-status');
        if (authStatusDiv) {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.remove();
            }
        }
    }
}

// FIXED FUNCTION: Added businessSupplyName parameter to handle targeted back navigation
async function showBusinessesByCategoryPage(categoryName, businessSupplyName) {
    const pageTitle = `Businesses in ${categoryName}`;

    // Helper to safely escape user strings against XSS
    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, match => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[match]));
    };

    const businessesPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #ffeae3 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
        ">
            <header style="
                max-width: 500px; 
                margin: 0 auto 30px auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            " id="businesses-page-header">
                
                <div style="width: 100%; display: flex; justify-content: flex-start;">
                    <button type="button" class="menu-button" id="businesses-back-btn" style="
                        cursor: pointer; 
                        padding: 6px 14px; 
                        background: #ffffff; 
                        border: 1px solid #d1d5db; 
                        border-radius: 6px; 
                        color: #1f2937; 
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        display: inline-flex;
                        align-items: center;
                    ">
                        &larr; Back to Categories
                    </button>
                </div>
                
                <h2 style="
                    color: #111827; 
                    margin: 0; 
                    font-size: 1.4rem; 
                    font-weight: 700; 
                    text-align: center;
                    line-height: 1.3;
                ">${escapeHtml(pageTitle)}</h2>
            </header>

            <section class="business-menu" style="max-width: 500px; margin: 0 auto;">
                <div id="dynamic-businesses-container" style="
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                    box-sizing: border-box;
                ">
                    <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 30px 0;">
                        Loading businesses for ${escapeHtml(categoryName)}...
                    </p>
                </div>
            </section>
        </section>
    `;

    const bodyContentContainer = document.getElementById("bodycontent");
    if (!bodyContentContainer) {
        console.error("Error: #bodycontent not found!");
        return;
    }

    renderPageLayout(businessesPageContent);

    // Back navigation handler
    const backBtn = document.getElementById('businesses-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (businessSupplyName && typeof showSupplyCategoryPage === 'function') {
                showSupplyCategoryPage(businessSupplyName);
            } else if (typeof businessSupply === 'function') {
                businessSupply();
            } else {
                console.error("Error: Back navigation target function missing globally.");
            }
        });
    }

    const dynamicBusinessesContainer = document.getElementById('dynamic-businesses-container');
    if (!dynamicBusinessesContainer) return;

    // Fetch and render business list
    try {
        const fetchUrl = CONFIG.getApiUrl(`api/index.php?path=businesses-by-category&category=${encodeURIComponent(categoryName)}`);
        
        // GET requests omit standard JSON body headers while keeping credentials
        const response = await fetch(fetchUrl, { credentials: CONFIG.FETCH_OPTIONS.credentials });
        
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            dynamicBusinessesContainer.innerHTML = ''; 

            const fragment = document.createDocumentFragment();

            data.data.forEach(business => {
                const businessDiv = document.createElement('div');
                businessDiv.className = 'menu-item'; 
                
                Object.assign(businessDiv.style, {
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '500px',
                    boxSizing: 'border-box',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                });

                businessDiv.addEventListener('mouseenter', () => businessDiv.style.transform = 'translateY(-2px)');
                businessDiv.addEventListener('mouseleave', () => businessDiv.style.transform = 'translateY(0)');

                // Integrated CONFIG.getImageUrl for asset resolution
                const imageUrl = CONFIG.getImageUrl(business.BusinessImageURL, 'placeholder.png');
                const statusText = business.statusMessage || business.Status || (business.isOpen ? 'Open' : 'Closed');

                businessDiv.innerHTML = `
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(business.BusinessName)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-right: 15px; flex-shrink: 0;" onerror="this.src='placeholder.png';">
                    <div style="flex-grow: 1; min-width: 0;">
                        <h4 style="margin: 0; color: white; font-size: 1.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(business.BusinessName)}</h4>
                        <p style="margin: 5px 0 0; font-size: 0.9em; font-weight: 600; color: ${business.isOpen ? '#86efac' : '#fca5a5'};">
                            Status: ${escapeHtml(statusText)}
                        </p>
                        <p style="margin: 0; font-size: 0.8em; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(business.Address || 'No address')}</p>
                    </div>
                `;

                businessDiv.addEventListener('click', () => {
                    if (typeof showBusinessDetails === 'function') {
                        showBusinessDetails(business);
                    } else {
                        console.error("Error: showBusinessDetails function is missing globally.");
                    }
                });

                fragment.appendChild(businessDiv);
            });

            dynamicBusinessesContainer.appendChild(fragment);

        } else if (data.data && data.data.length === 0) {
            dynamicBusinessesContainer.innerHTML = `<p style="color: #4b5563; text-align: center; font-weight: 500;">No businesses found for "${escapeHtml(categoryName)}".</p>`;
        } else {
            dynamicBusinessesContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Failed to load businesses for this category.</p>';
        }
    } catch (error) {
        console.error(`Error fetching businesses for category ${categoryName}:`, error);
        dynamicBusinessesContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Error loading businesses. Please check network connection.</p>';
    }

    // Non-blocking background session update utilizing CONFIG
    const sessionUrl = CONFIG.getApiUrl('api/index.php?path=session-data');
    fetch(sessionUrl, { credentials: CONFIG.FETCH_OPTIONS.credentials })
        .then(res => res.json())
        .then(sessionData => {
            if (typeof updateAuthStatus === 'function') {
                updateAuthStatus(sessionData);
            }
        })
        .catch(err => console.error('Error re-fetching session data:', err));
}
// NEW FUNCTION: showBusinessDetails (using your provided template)
// MODIFIED FUNCTION: showBusinessDetails (make it async)
// script.js (Modify this existing function)

async function showBusinessDetails(businessData) {
    const isBusinessOpen = businessData.isOpen;
    const openCloseColor = isBusinessOpen ? '#16a34a' : '#dc2626';
    const businessName = businessData.BusinessName || businessData.EventPerformerName;
    const categoryName = businessData.SupplyCategory || businessData.AdCategory;

    const contactClickAction = `showMessageModal('Contact ${businessName}', 'This will take you to the contact page. You can reach them at ${businessData.Email || 'N/A'} or ${businessData.PhoneNumber || 'N/A'}.')`;
    const profileClickAction = `showMessageModal('Profile', 'This will take you to the Profile Page.')`;

    // Resolve Image via Global Config
    const rawImage = businessData.BusinessImageURL || businessData.EventPerformerImageURL;
    const businessImageUrl = CONFIG.getImageUrl(rawImage, 'placeholder.png');

    // Format operating hours and days
    let operatingHoursText = "Hours not specified";
    if (businessData.OpenFromTime || businessData.OpenFrom) {
        const from = businessData.OpenFromTime || businessData.OpenFrom;
        const till = businessData.OpenTillTime || businessData.OpenTill;
        operatingHoursText = `Open: ${from.substring(0, 5)} - ${till.substring(0, 5)}`;
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const operatingDays = days.filter(day => businessData[day] == 1);
    const operatingDaysText = operatingDays.length > 0 ? `Operates: ${operatingDays.join(', ')}` : "No operating days specified";

    // Re-rendering layout
    document.getElementById("bodycontent").innerHTML = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #ffeae3 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
        ">
            <header style="
                max-width: 500px; 
                margin: 0 auto 24px auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            " id="business-details-header">
                
                <div style="width: 100%; display: flex; justify-content: flex-start;">
                    <button type="button" class="menu-button" id="details-back-btn" style="
                        cursor: pointer; 
                        padding: 6px 14px; 
                        background: #ffffff; 
                        border: 1px solid #d1d5db; 
                        border-radius: 6px; 
                        color: #1f2937; 
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        transition: all 0.2s ease;
                        display: inline-flex;
                        align-items: center;
                    ">
                        &larr; Back
                    </button>
                </div>
                
                <div style="text-align: center; width: 100%;">
                    <h1 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin: 0 0 4px 0; letter-spacing: -0.5px;">${businessName}</h1>
                    <span style="color: #ff3c00; font-weight: 700; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px;">${categoryName}</span>
                </div>
            </header>

            <section class="business-menu" style="max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
                
                <div style="
                    background: #ffffff; 
                    border: 1px solid #e5e7eb; 
                    border-radius: 16px; 
                    padding: 24px; 
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
                    text-align: center;
                ">
                    <div style="
                        display: inline-block; 
                        color: ${openCloseColor}; 
                        background: ${isBusinessOpen ? '#e6f4ea' : '#fce8e6'};
                        padding: 6px 12px; 
                        border-radius: 20px; 
                        font-weight: 700; 
                        font-size: 0.85rem; 
                        margin-bottom: 20px;
                    ">
                        Status: ${businessData.statusMessage || businessData.Status || (isBusinessOpen ? 'Open' : 'Closed')}
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; color: #4b5563; font-size: 0.95rem; margin-bottom: 20px; text-align: left;">
                        <p style="margin: 0;"><strong style="color: #111827;">Address:</strong> ${businessData.Address || 'Not available'}</p>
                        <p style="margin: 0;"><strong style="color: #111827;">Email:</strong> ${businessData.Email || 'Not available'}</p>
                        <p style="margin: 0;"><strong style="color: #111827;">Phone:</strong> ${businessData.PhoneNumber || 'Not available'}</p>
                        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 8px 0;" />
                        <p style="margin: 0; font-size: 0.9rem; color: #6b7280; display: flex; align-items: center; gap: 6px;">🕒 ${operatingHoursText}</p>
                        <p style="margin: 0; font-size: 0.9rem; color: #6b7280; display: flex; align-items: center; gap: 6px;">📅 ${operatingDaysText}</p>
                    </div>

                    <div style="margin-bottom: 24px; font-weight: 600; font-size: 0.95rem;">
                        <a onclick="${contactClickAction}" style="color: #ff3c00; cursor: pointer; text-decoration: none; margin-right: 16px;">Contact</a>
                        <span style="color: #d1d5db;">|</span>
                        <a onclick="${profileClickAction}" style="color: #ff3c00; cursor: pointer; text-decoration: none; margin-left: 16px;">View Profile</a>
                    </div>

                    <img class="order-image" src="${businessImageUrl}" alt="Business Image" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; border: 1px solid #f3f4f6; margin-bottom: 24px;">

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button type="button" class="menu-button1" id="requestOrderBtn" style="
                            width: 100%; padding: 14px; background: #ff3c00; border: none; border-radius: 10px; color: #ffffff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
                        ">Request Service</button>
                        
                        <button type="button" class="menu-button1" id="viewPricelistBtn" style="
                            width: 100%; padding: 14px; background: #f3f4f6; border: none; border-radius: 10px; color: #1f2937; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
                        ">View Pricelist</button>
                    </div>

                    <div id="embeddedRequestFormContainer" style="
                        display: none; 
                        background: #ffffff; 
                        color: #111827; 
                        padding: 20px; 
                        border-radius: 12px; 
                        width: 100%;
                        box-sizing: border-box;
                        margin-top: 24px; 
                        border: 1px solid #e5e7eb;
                        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                        text-align: left;
                    ">
                        <h4 style="margin: 0 0 4px 0; text-align: center; font-size: 1.15rem; font-weight: 700; color: #111827;">Send Request</h4>
                        <p id="embeddedRequestMessage" style="color: #dc2626; font-size: 0.85rem; text-align: center; margin: 0 0 16px 0; min-height: 18px; font-weight: 600;"></p>

                        <form id="directRequestForm" onsubmit="event.preventDefault();" style="margin: 0; display: flex; flex-direction: column; gap: 14px;">
                            <div>
                                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #4b5563; text-transform: uppercase; margin-bottom: 6px;">Job Description</label>
                                <textarea id="directJobDescription" name="jobDescription" class="enter-form" placeholder="Describe what you need..." rows="3" required style="width:100%; box-sizing:border-box; padding:10px; border-radius:6px; border:1px solid #d1d5db; font-family:inherit;"></textarea>
                            </div>

                            <div>
                                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #4b5563; text-transform: uppercase; margin-bottom: 6px;">Location</label>
                                <input type="text" id="directLocation" name="location" class="enter-form" placeholder="e.g., Pretoria, SA" required style="width:100%; box-sizing:border-box; padding:10px; border-radius:6px; border:1px solid #d1d5db;">
                            </div>

                            <div>
                                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #4b5563; text-transform: uppercase; margin-bottom: 6px;">Date and Time</label>
                                <input type="datetime-local" name="dateTime" id="directDateTime" class="enter-form" required style="width:100%; box-sizing:border-box; padding:10px; border-radius:6px; border:1px solid #d1d5db; background:#ffffff; color:#111827;">
                            </div>

                            <div style="display: flex; gap: 12px; margin-top: 4px;">
                                <button type="submit" class="btn" id="submitDirectRequestBtn" style="flex: 1; padding: 12px; background: #ff3c00; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Send Request</button>
                                <button type="button" class="btn" id="cancelDirectRequestBtn" style="padding: 12px 16px; background: #e5e7eb; color: #1f2937; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </section>
    `;

    // Fire original page rendering hooks explicitly
    if (typeof renderPageLayout === 'function') {
        renderPageLayout(document.getElementById("bodycontent").innerHTML);
    }

    const requestOrderBtn = document.getElementById('requestOrderBtn');
    const viewPricelistBtn = document.getElementById('viewPricelistBtn');
    const embeddedRequestFormContainer = document.getElementById('embeddedRequestFormContainer');
    const directRequestForm = document.getElementById('directRequestForm');
    const cancelDirectRequestBtn = document.getElementById('cancelDirectRequestBtn');
    const embeddedRequestMessage = document.getElementById('embeddedRequestMessage');

    // Dynamic mouse action hover effects
    if (requestOrderBtn) {
        requestOrderBtn.addEventListener('mouseenter', () => requestOrderBtn.style.background = '#e03500');
        requestOrderBtn.addEventListener('mouseleave', () => requestOrderBtn.style.background = '#ff3c00');
    }
    if (viewPricelistBtn) {
        viewPricelistBtn.addEventListener('mouseenter', () => viewPricelistBtn.style.background = '#e5e7eb');
        viewPricelistBtn.addEventListener('mouseleave', () => viewPricelistBtn.style.background = '#f3f4f6');
    }

    const backBtn = document.getElementById('details-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof showBusinessesByCategoryPage === 'function') {
                showBusinessesByCategoryPage(categoryName);
            } else {
                console.error("Error: showBusinessesByCategoryPage execution context target was missing.");
            }
        });
    }

    let currentLoggedInUsername = null;

    // Fetch session data with credentials included for mobile webviews & cross-origin contexts
    try {
        const response = await fetch(CONFIG.getApiUrl('api/index.php?path=session-data'), {
            method: 'GET',
            credentials: 'include'
        });
        const currentSessionData = await response.json();
        if (currentSessionData && currentSessionData.loggedIn) {
            currentLoggedInUsername = currentSessionData.username;
        }
    } catch (error) {
        console.error('Session fetch error:', error);
    }

    // Fallback: Check local or session storage if cookies are restricted in WebView
    if (!currentLoggedInUsername) {
        currentLoggedInUsername = localStorage.getItem('username') || sessionStorage.getItem('username');
    }

    if (requestOrderBtn) {
        requestOrderBtn.addEventListener('click', () => {
            if (!currentLoggedInUsername) {
                if (typeof showMessageModal === 'function') {
                    showMessageModal('Login Required', 'You must be logged in to send a request.');
                } else {
                    alert('You must be logged in to send a request.');
                }
                return;
            }
            embeddedRequestFormContainer.style.display = embeddedRequestFormContainer.style.display === 'none' ? 'block' : 'none';
            if (embeddedRequestFormContainer.style.display === 'block') {
                embeddedRequestFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    if (cancelDirectRequestBtn) {
        cancelDirectRequestBtn.addEventListener('click', () => {
            embeddedRequestFormContainer.style.display = 'none';
            directRequestForm.reset();
            embeddedRequestMessage.textContent = '';
        });
    }

    if (directRequestForm) {
        directRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const jobDescription = document.getElementById('directJobDescription').value.trim();
            const location = document.getElementById('directLocation').value.trim();
            const dateTime = document.getElementById('directDateTime').value.trim();

            const targetUser = businessData.users || businessData.username;

            if (!jobDescription || !location || !dateTime) {
                embeddedRequestMessage.style.color = '#dc2626';
                embeddedRequestMessage.textContent = 'Please fill in all fields.';
                return;
            }

            if (!targetUser) {
                embeddedRequestMessage.style.color = '#dc2626';
                embeddedRequestMessage.textContent = 'Error: Recipient username not found.';
                return;
            }

            const formData = new FormData();
            formData.append('supplyCategory', categoryName);
            formData.append('jobDescription', jobDescription);
            formData.append('location', location);
            formData.append('dateTime', dateTime);
            formData.append('userSentFrom', currentLoggedInUsername);
            formData.append('userSentTo', targetUser);

            embeddedRequestMessage.textContent = 'Sending request...';
            embeddedRequestMessage.style.color = '#ea580c';

            try {
                // Post form using FormData directly with credentials included
                const response = await fetch(CONFIG.getApiUrl('api/index.php?path=submit-request-to-user'), {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    embeddedRequestMessage.style.color = '#16a34a';
                    embeddedRequestMessage.textContent = 'Success!';
                    setTimeout(() => {
                        embeddedRequestFormContainer.style.display = 'none';
                        directRequestForm.reset();
                        embeddedRequestMessage.textContent = '';
                        if (typeof showMessageModal === 'function') {
                            showMessageModal('Success', 'Request sent to ' + businessName);
                        }
                    }, 1000);
                } else {
                    embeddedRequestMessage.style.color = '#dc2626';
                    embeddedRequestMessage.textContent = result.message || 'Error sending request.';
                }
            } catch (err) {
                embeddedRequestMessage.style.color = '#dc2626';
                embeddedRequestMessage.textContent = 'Connection error.';
            }
        });
    }
}

// NEW/MODIFIED FUNCTION: showRegisterBusinessPage (with cascading dropdowns and any image type)
async function showRegisterBusinessPage() {
    const registerBusinessPageContent = `
        <section style="background: linear-gradient(white, #ff3c00ad); padding: 40px 20px; min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <header style="max-width: 850px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: space-between;" id="register-business-page-header">
                <a class="menu-button" style="cursor:pointer; background: #333; color: white; padding: 10px 22px; border-radius: 5px; text-decoration:none; font-weight:bold;" onclick="window.location.reload()">Back to Main</a>
                <h2 style="color: #222; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Register Business</h2>
            </header>

            <section style="display: flex; justify-content: center; padding-bottom: 50px;">
                <form id="registerBusinessForm" enctype="multipart/form-data" class="sign-form" 
                    style="background: rgba(0,0,0,0.85); color: white; padding: 35px; border-radius: 15px; width: 100%; max-width: 700px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); border: 1px solid rgba(255,60,0,0.2);">
                    
                    <h3 style="color: #ff3c00; border-bottom: 2px solid #ff3c00; padding-bottom: 10px; margin-top: 0; margin-bottom: 25px;">Business Information</h3>
                    <p id="registerBusinessMessage" style="font-weight: bold; text-align: center; margin-bottom: 15px;"></p>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        
                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:8px;">Business Name:</label>
                            <input type="text" name="businessName" placeholder="Enter formal name" class="enter-form" required 
                                style="width:100%; padding: 12px; border-radius: 5px; border: none; background: #fff; color: #000;">
                        </div>

                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:8px;">Business Image (max 5MB):</label>
                            <input type="file" name="businessImage" accept="image/*" class="enter-form" required 
                                style="width:100%; padding: 8px; border-radius: 5px; border: none; background: #fff; color: #000;">
                            <img id="businessImagePreview" style="display:none; width:100%; max-height:220px; object-fit:cover; border-radius:8px; margin-top:12px; border: 2px solid #ff3c00;">
                        </div>

                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:8px;">Physical Address:</label>
                            <input type="text" name="address" placeholder="e.g. 456 Umgeni Rd, Durban" class="enter-form" required 
                                style="width:100%; padding: 12px; border-radius: 5px; border: none;">
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:8px;">Email:</label>
                            <input type="email" name="email" placeholder="office@business.co.za" class="enter-form" required 
                                style="width:100%; padding: 12px; border-radius: 5px; border: none;">
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:8px;">Phone Number:</label>
                            <input type="tel" name="phoneNumber" placeholder="031 000 0000" class="enter-form" required 
                                style="width:100%; padding: 12px; border-radius: 5px; border: none;">
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:8px;">Supply Type:</label>
                            <select name="businessSupplyName" id="regBusinessSupplyNameDropdown" class="enter-form" required 
                                style="width:100%; height: 45px; border-radius: 5px; border: none; background: white; color: black;">
                                <option value="">Loading...</option>
                            </select>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:8px;">Specific Category:</label>
                            <select name="supplyCategory" id="regSupplyCategoryDropdown" class="enter-form" disabled required 
                                style="width:100%; height: 45px; border-radius: 5px; border: none; background: white; color: black;">
                                <option value="">-- Select type first --</option>
                            </select>
                        </div>

                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:10px; color: #ff3c00; font-weight: bold;">Operating Hours:</label>
                            <div style="display:flex; align-items:center; gap:15px; background: #222; padding: 15px; border-radius: 8px;">
                                <input type="time" name="openFromTime" required style="padding: 8px; border-radius: 4px; flex:1;">
                                <span>to</span>
                                <input type="time" name="openTillTime" required style="padding: 8px; border-radius: 4px; flex:1;">
                            </div>
                        </div>

                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:10px; color: #ff3c00; font-weight: bold;">Operating Days:</label>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; background: #222; padding: 15px; border-radius: 8px;">
                                ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => `
                                    <label style="display:flex; align-items:center; gap:8px; font-size: 14px; cursor:pointer;">
                                        <input type="checkbox" name="${day}" value="1" style="accent-color:#ff3c00; width:18px; height:18px;"> ${day}
                                    </label>`).join('')}
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn" 
                        style="width:100%; margin-top:30px; background:#ff3c00; color:white; border:none; padding:18px; font-size: 18px; font-weight: bold; border-radius: 8px; cursor:pointer; transition: 0.3s;">
                        Complete Business Registration
                    </button>
                </form>
            </section>
        </section>
    `;

    renderPageLayout(registerBusinessPageContent);

    // --- DOM Elements ---
    const form = document.getElementById('registerBusinessForm');
    const imageInput = document.querySelector('[name="businessImage"]');
    const imagePreview = document.getElementById('businessImagePreview');
    const message = document.getElementById('registerBusinessMessage');
    const regBusinessSupplyNameDropdown = document.getElementById('regBusinessSupplyNameDropdown');
    const regSupplyCategoryDropdown = document.getElementById('regSupplyCategoryDropdown');

    // --- Image Preview Logic ---
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => { 
                imagePreview.src = e.target.result; 
                imagePreview.style.display = 'block'; 
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Dropdown Loading Logic ---
    async function loadBusinessSupplyNames() {
        try {
            const res = await fetch(CONFIG.getApiUrl('api/index.php?path=business-supply-names'), {
                credentials: CONFIG.FETCH_OPTIONS.credentials
            });
            const data = await res.json();
            regBusinessSupplyNameDropdown.innerHTML = '<option value="">-- Select Type --</option>';
            data.data?.forEach(name => regBusinessSupplyNameDropdown.appendChild(new Option(name, name)));
        } catch { 
            regBusinessSupplyNameDropdown.innerHTML = '<option value="">Error loading</option>'; 
        }
    }

    async function loadSupplyCategories(name) {
        if (!name) {
            regSupplyCategoryDropdown.disabled = true;
            return;
        }
        try {
            const endpoint = `api/index.php?path=supply-categories&businessSupplyName=${encodeURIComponent(name)}`;
            const res = await fetch(CONFIG.getApiUrl(endpoint), {
                credentials: CONFIG.FETCH_OPTIONS.credentials
            });
            const data = await res.json();
            regSupplyCategoryDropdown.innerHTML = '<option value="">-- Select Category --</option>';
            data.data?.forEach(cat => regSupplyCategoryDropdown.appendChild(new Option(cat, cat)));
            regSupplyCategoryDropdown.disabled = false;
        } catch { }
    }

    regBusinessSupplyNameDropdown.addEventListener('change', e => loadSupplyCategories(e.target.value));
    loadBusinessSupplyNames();

    // --- Submission Logic ---
    form.addEventListener('submit', async e => {
        e.preventDefault();
        message.textContent = 'Registering...';
        message.style.color = 'white';

        const formData = new FormData(form);
        
        ['openFromTime', 'openTillTime'].forEach(k => {
            let val = formData.get(k);
            if (val && val.length === 5) formData.set(k, val + ':00');
        });

        try {
            // Note: Omit 'Content-Type' header when passing FormData so the browser automatically sets the multipart boundary
            const res = await fetch(CONFIG.getApiUrl('api/index.php?path=register-business'), { 
                method: 'POST',
                credentials: CONFIG.FETCH_OPTIONS.credentials,
                body: formData 
            });
            const result = await res.json();

            if (result.success) {
                message.style.color = 'lime';
                message.textContent = 'Registration Successful!';
                form.reset();
                imagePreview.style.display = 'none';
                setTimeout(() => window.location.reload(), 2000);
            } else {
                message.style.color = '#ff4444';
                message.textContent = 'Error: ' + result.message;
            }
        } catch (err) {
            message.style.color = '#ff4444';
            message.textContent = 'Connection error.';
        }
    });
}



// Main logic on page load
document.addEventListener('DOMContentLoaded', async () => {
    let sessionData = { loggedIn: false, isAdmin: false, username: null };
    try {
        const response = await fetch('api/index.php?path=session-data', { credentials: 'include' });
        sessionData = await response.json();
    } catch (error) {
        console.error('Error checking session status:', error);
    }

    // Function to decide which main page to show based on admin status
    function showMainOrAdminPage() {
        if (sessionData.loggedIn && sessionData.isAdmin) {
            showAdminPage();
        } else {
            mainPageContent();
        }
    }

    // Call this function at the start to render the appropriate main page
    showMainOrAdminPage();

    // Update auth status to show login/signup or welcome/logout/register buttons
    updateAuthStatus(sessionData);
});


// --- REAL login status check using fetch
async function checkLoginStatus() {
    try {
        const response = await fetch('api/index.php?path=auth-status', {
            credentials: 'include' // allow sending cookies
        });

        const loginBtn = document.getElementById("login-btn");

        if (response.ok) {
            const data = await response.json();

            if (data.loggedIn) {
                loginBtn.textContent = `Welcome, ${data.username}`;
                loginBtn.disabled = true;
            } else {
                loginBtn.textContent = "Login / Sign In";
                loginBtn.disabled = false;
            }
        } else {
            throw new Error("Failed to check login status.");
        }
    } catch (err) {
        console.error("Login check failed:", err);
    }
}

// --- REAL login action: redirect to login page
function handleLogin() {
    try {
        window.location.href = "/Sign-In.html"; // or your actual login route
    } catch (err) {
        console.error("Redirect to login failed:", err);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    // 1. Immediately sync UI from local storage to prevent getting kicked to guest mode on reload
    if (typeof updateAuthStatus === 'function') {
        updateAuthStatus();
    }

    // 2. Validate session with the backend using your centralized CONFIG URL helper
    try {
        const endpoint = typeof CONFIG !== 'undefined' && CONFIG.getApiUrl 
            ? CONFIG.getApiUrl('api/index.php?path=session-data') 
            : 'api/index.php?path=session-data';

        const res = await fetch(endpoint, {
            ...(typeof CONFIG !== 'undefined' ? CONFIG.FETCH_OPTIONS : {}),
            credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            if (data.loggedIn) {
                // Keep local state in sync if server session is active
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', data.username);
                if (typeof updateAuthStatus === 'function') {
                    updateAuthStatus(data);
                }
            }
        }
    } catch (err) {
        console.warn("Backend session check failed (running offline or native WebView mode):", err);
    }
});


var transportJob = 0;
var cateringJob=0;
var constructionJob=0;
var beautyJob=0;
var cleaningJob = 0;
var signed = false;
var user;
var pass;
var cpass;
const Jobs = [];
console.log(Jobs);


// js/script.js - Locate your businessSupply function and replace it with this:


function mainPage() {
    document.getElementById("bodycontent").innerHTML=`
      <!-- ✅ Cookie Message -->
    <div id="cookie-notice" style="background: #222; color: white; padding: 10px; text-align: center; display: none;">
        This device uses cookies to improve your experience. <button onclick="acceptCookies()" style="margin-left: 10px;">Got it</button>
    </div>

    <!-- ✅ Header with Login/Sign-in Button -->
    <header style="width:100%" id="#">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 15px;">
            <a onclick="showNewNotifications()" style="font-size: 25px;"><i class='bx bxs-bell'></i></a>
            <center>
                <a href="#"><img src="https://see.fontimg.com/api/renderfont4/p72nK/eyJyIjoiZnMiLCJoIjo4MSwidyI6MTI1MCwiZnMiOjY1LCJmZ2MiOiIjMDAwMDAwIiwiYmdjIjoiI0ZGRkZGRiIsInQiOjF9/bUZPQ0FO/dripinkpersonaluse-black.png" alt="Dripping fonts"></a>
                <strong><p style="color: black">System Integrations</p></strong>
            </center>
            <button id="login-btn" onclick="handleLogin()" style="font-size:20px; width:auto;" class="menu-button1">Login / Sign In</button>
        </div>
    </header>
    <section class="menu-body" style="padding-bottom: 30px; width: 100%;">
        <center>
       
        <div class="menu-content">
          
            <a  id="business-supply" onclick="businessSupply()">
             <div class="row">
                 <img src="bus.png">
                 <div class="layer">
                     <h5 style="color: black;">BUSINESS SUPPLY</h5>
                 </div>
             </div>
            </a>
 
            <a onclick="businessAd()">
             <div class="row">
                 <img src="ad.jpg">
                 <div class="layer">
                    
                 </div>
             </div>
            </a>
         
 
            <a onclick="requestPage()">
             <div class="row">
                 <img src="SERV.jpeg">
                 <div class="layer">
                     <h5 style="color: black;">SERVICE REQUEST</h5>
                 </div>
             </div>
            </a>
 
            <a onclick="showServices()">
             <div class="row">
                 <img src="tender.jpeg">
                 <div class="layer">
                     <h5 style="color: black;">TENDER</h5>
                 </div>
             </div>
            </a>
       
 
         </div>
        </center>
    </section>

     <section  class="end">
    <div class="last-text">
    <p>&COPY;Copyrighted by MFOCAN 2024. All Rights Reserved</p>
    </div>

    <div class="top">
        <a href="#"><i class="bx bx-up-arrow-alt"></i></a>
    </div>
</section>
    `;
    
}

// --- Start of businessAd() (Override behavior) ---
async function businessAd() {
    // Elegant, high-contrast layout template with structural row partitioning
    const businessAdPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #ffeae3 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
        ">
            <header style="
                max-width: 500px; 
                margin: 0 auto 30px auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            " id="business-ad-page-header">
                
                <div style="width: 100%; display: flex; justify-content: flex-start;">
                    <button type="button" class="menu-button" id="ad-page-back-btn" style="
                        cursor: pointer; 
                        padding: 6px 14px; 
                        background: #ffffff; 
                        border: 1px solid #d1d5db; 
                        border-radius: 6px; 
                        color: #1f2937; 
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        transition: all 0.2s ease;
                        display: inline-flex;
                        align-items: center;
                    ">
                        &larr; Back
                    </button>
                </div>
                
                <h2 style="
                    color: #111827; 
                    margin: 0; 
                    font-size: 1.4rem; 
                    font-weight: 700; 
                    text-align: center;
                    line-height: 1.3;
                ">Business Advertising Categories</h2>
            </header>

            <section class="business-menu" style="max-width: 500px; margin: 0 auto;">
                <form action="#" method="get" id="businessAdForm" style="margin: 0;">
                    <div id="business-ad-names-container" style="
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        width: 100%;
                        box-sizing: border-box;
                    ">
                        <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 30px 0;">
                            Loading business ad names...
                        </p>
                    </div>
                </form>
            </section>
        </section>
    `;

    const bodyContentContainer = document.getElementById("bodycontent");
    if (!bodyContentContainer) {
        console.error("Error: #bodycontent not found! Cannot render business ad page.");
        return;
    }

    renderPageLayout(businessAdPageContent);

    // Prevent random browser form submittal loops
    const businessAdForm = document.getElementById('businessAdForm');
    if (businessAdForm) {
        businessAdForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // Attach native click listener routing to back button element
    const backBtn = document.getElementById('ad-page-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            mainPageContent();
        });
    }

    const businessAdNamesContainer = document.getElementById('business-ad-names-container');
    if (!businessAdNamesContainer) {
        console.error("Error: #business-ad-names-container not found!");
        return;
    }

    try {
        const response = await fetch(CONFIG.getApiUrl('api/index.php?path=business-ad-names'), { 
            credentials: CONFIG.FETCH_OPTIONS.credentials 
        });
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            businessAdNamesContainer.innerHTML = '';

            data.data.forEach(adType => {
                const button = document.createElement('button');
                button.type = 'button'; // Explicit type initialization
                button.className = 'menu-button';
                button.textContent = adType;
                
                // Solid high-visibility brand style matching previous views
                Object.assign(button.style, {
                    width: '100%',
                    padding: '16px 24px',
                    background: '#ff3c00', 
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff', 
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(255, 60, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                });

                // Secure script listener callbacks 
                button.addEventListener('mouseenter', () => {
                    button.style.background = '#e03500'; 
                    button.style.transform = 'translateY(-1px)';
                    button.style.boxShadow = '0 6px 8px -1px rgba(255, 60, 0, 0.3)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.background = '#ff3c00';
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = '0 4px 6px -1px rgba(255, 60, 0, 0.2)';
                });
                
                button.addEventListener('mousedown', () => {
                    button.style.transform = 'translateY(1px)';
                    button.style.boxShadow = '0 2px 4px -1px rgba(255, 60, 0, 0.2)';
                });

                button.addEventListener('click', () => {
                    if (typeof showAdCategoryPage === 'function') {
                        showAdCategoryPage(adType);
                    } else {
                        console.error("Error: showAdCategoryPage function is missing globally.");
                    }
                });
                
                businessAdNamesContainer.appendChild(button);
            });

        } else {
            businessAdNamesContainer.innerHTML = '<p style="color: #4b5563; text-align: center; font-weight: 500;">No business ads found.</p>';
        }
    } catch (error) {
        console.error('Error fetching business ad names:', error);
        businessAdNamesContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Error loading business ads. Please check server logs.</p>';
    }

    let currentSessionData = { loggedIn: false, isAdmin: false, username: null };
    try {
        const sessionResponse = await fetch(CONFIG.getApiUrl('api/index.php?path=session-data'), { 
            credentials: CONFIG.FETCH_OPTIONS.credentials 
        });
        currentSessionData = await sessionResponse.json();
    } catch (error) {
        console.error('Error re-fetching session data:', error);
    }

    if (typeof updateAuthStatus === 'function') {
        updateAuthStatus(currentSessionData); 
    }

    // Context-specific layout button overrides with standard safety hooks
    const registerBusinessButton = document.getElementById('register-business-btn');
    if (registerBusinessButton) {
        if (typeof showRegisterBusinessPage === 'function') {
            registerBusinessButton.removeEventListener('click', showRegisterBusinessPage);
        }
        
        registerBusinessButton.addEventListener('click', () => {
            if (typeof showRegisterBusinessAdPage === 'function') {
                showRegisterBusinessAdPage({});
            } else {
                console.error("Error: showRegisterBusinessAdPage execution engine target is missing.");
            }
        });
        console.log("Global 'Register Business' button onclick *overridden* for Business Ad page.");
    }
}
// --- End of businessAd() ---


// --- Start of showAdCategoryPage() (Override behavior) ---
// Modify existing function:
async function showAdCategoryPage(businessAdName) {
    const pageTitle = `${businessAdName} Categories`;

    // High-visibility, crisp structural template layout matching your theme configuration
    const adCategoryPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #ffeae3 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
        ">
            <header style="
                max-width: 500px; 
                margin: 0 auto 30px auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            " id="ad-category-page-header">
                
                <div style="width: 100%; display: flex; justify-content: flex-start;">
                    <button type="button" class="menu-button" id="ad-category-back-btn" style="
                        cursor: pointer; 
                        padding: 6px 14px; 
                        background: #ffffff; 
                        border: 1px solid #d1d5db; 
                        border-radius: 6px; 
                        color: #1f2937; 
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        transition: all 0.2s ease;
                        display: inline-flex;
                        align-items: center;
                    ">
                        &larr; Back
                    </button>
                </div>
                
                <h2 style="
                    color: #111827; 
                    margin: 0; 
                    font-size: 1.4rem; 
                    font-weight: 700; 
                    text-align: center;
                    line-height: 1.3;
                ">${pageTitle}</h2>
            </header>

            <section class="business-menu" style="max-width: 500px; margin: 0 auto;">
                <form action="#" method="get" id="adCategoryForm" style="margin: 0;">
                    <div id="ad-category-buttons-container" style="
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        width: 100%;
                        box-sizing: border-box;
                    ">
                        <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 30px 0;">
                            Loading ad categories for ${businessAdName}...
                        </p>
                    </div>
                </form>
            </section>
        </section>
    `;

    const bodyContentContainer = document.getElementById("bodycontent");
    if (!bodyContentContainer) {
        console.error("Error: #bodycontent not found! Cannot render ad category page.");
        return;
    }

    renderPageLayout(adCategoryPageContent);

    // Prevent dynamic form post runtime disruptions
    const adCategoryForm = document.getElementById('adCategoryForm');
    if (adCategoryForm) {
        adCategoryForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // Direct isolated navigation back button listener injection
    const backBtn = document.getElementById('ad-category-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof businessAd === 'function') {
                businessAd();
            } else {
                console.error("Error: businessAd function is missing globally.");
            }
        });
    }

    const adCategoryButtonsContainer = document.getElementById('ad-category-buttons-container');
    if (!adCategoryButtonsContainer) {
        console.error("Error: #ad-category-buttons-container not found!");
        return;
    }

    try {
        const endpoint = `api/index.php?path=ad-categories&businessAdName=${encodeURIComponent(businessAdName)}`;
        const response = await fetch(CONFIG.getApiUrl(endpoint), { 
            credentials: CONFIG.FETCH_OPTIONS.credentials 
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            adCategoryButtonsContainer.innerHTML = '';

            data.data.forEach(category => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'menu-button';
                button.textContent = category;
                
                // Solid, high-contrast signature style assignment
                Object.assign(button.style, {
                    width: '100%',
                    padding: '16px 24px',
                    background: '#ff3c00', 
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff', 
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(255, 60, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                });

                // Micro-interaction animation state logic
                button.addEventListener('mouseenter', () => {
                    button.style.background = '#e03500'; 
                    button.style.transform = 'translateY(-1px)';
                    button.style.boxShadow = '0 6px 8px -1px rgba(255, 60, 0, 0.3)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.background = '#ff3c00';
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = '0 4px 6px -1px rgba(255, 60, 0, 0.2)';
                });
                
                button.addEventListener('mousedown', () => {
                    button.style.transform = 'translateY(1px)';
                    button.style.boxShadow = '0 2px 4px -1px rgba(255, 60, 0, 0.2)';
                });

                button.addEventListener('click', () => {
                    if (typeof showPerformersByAdCategoryPage === 'function') {
                        // Pass businessAdName along to maintain context
                        showPerformersByAdCategoryPage(category, businessAdName);
                    } else {
                        console.error("Error: showPerformersByAdCategoryPage function is missing globally.");
                    }
                });
                
                adCategoryButtonsContainer.appendChild(button);
            });
        } else {
            adCategoryButtonsContainer.innerHTML = `<p style="color: #4b5563; text-align: center; font-weight: 500;">No ad categories found for "${businessAdName}".</p>`;
        }
    } catch (error) {
        console.error('Error fetching ad categories:', error);
        adCategoryButtonsContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Error loading ad categories. Please check server logs.</p>';
    }

    try {
        const sessionResponse = await fetch(CONFIG.getApiUrl('api/index.php?path=session-data'), { 
            credentials: CONFIG.FETCH_OPTIONS.credentials 
        });
        const sessionData = await sessionResponse.json();
        
        if (typeof updateAuthStatus === 'function') {
            updateAuthStatus(sessionData); 
        }
    } catch (err) {
        console.error("Error updating auth status in showAdCategoryPage:", err);
    }

    // Context-specific layout business button runtime configuration override
    const registerBusinessButton = document.getElementById('register-business-btn');
    if (registerBusinessButton) {
        if (typeof showRegisterBusinessPage === 'function') {
            registerBusinessButton.removeEventListener('click', showRegisterBusinessPage);
        }
        
        registerBusinessButton.addEventListener('click', () => {
            if (typeof showRegisterBusinessAdPage === 'function') {
                showRegisterBusinessAdPage({});
            } else {
                console.error("Error: showRegisterBusinessAdPage execution engine target is missing.");
            }
        });
        console.log("Global 'Register Business' button onclick *overridden* for Ad Category page.");
    }
}


// FIX: Added businessAdName parameter to retain dynamic parent routing state
async function showPerformersByAdCategoryPage(adCategory, businessAdName = null) {
    const pageTitle = `Performers in ${adCategory}`;

    // Clean structural layout featuring an engineered, non-overlapping header configuration
    const performersPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #ffeae3 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
        ">
            <header style="
                max-width: 500px; 
                margin: 0 auto 30px auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            " id="performers-page-header">
                
                <div style="width: 100%; display: flex; justify-content: flex-start;">
                    <button type="button" class="menu-button" id="performers-back-btn" style="
                        cursor: pointer; 
                        padding: 6px 14px; 
                        background: #ffffff; 
                        border: 1px solid #d1d5db; 
                        border-radius: 6px; 
                        color: #1f2937; 
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        transition: all 0.2s ease;
                        display: inline-flex;
                        align-items: center;
                    ">
                        ${businessAdName ? `&larr; Back to ${businessAdName}` : '&larr; Back'}
                    </button>
                </div>
                
                <h2 style="
                    color: #111827; 
                    margin: 0; 
                    font-size: 1.4rem; 
                    font-weight: 700; 
                    text-align: center;
                    line-height: 1.3;
                ">${pageTitle}</h2>
            </header>

            <section class="business-menu" style="max-width: 500px; margin: 0 auto;">
                <div id="dynamic-performers-container" style="
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                    box-sizing: border-box;
                ">
                    <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 30px 0;">
                        Loading performers for ${adCategory}...
                    </p>
                </div>
            </section>
        </section>
    `;

    renderPageLayout(performersPageContent);

    // Modern back navigation event listener registration
    const backBtn = document.getElementById('performers-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (businessAdName && typeof showAdCategoryPage === 'function') {
                showAdCategoryPage(businessAdName);
            } else if (typeof businessAd === 'function') {
                businessAd();
            } else {
                console.error("Error: Back navigation function missing.");
            }
        });
    }

    const dynamicPerformersContainer = document.getElementById('dynamic-performers-container');
    if (!dynamicPerformersContainer) {
        console.error("Error: #dynamic-performers-container not found!");
        return;
    }

    try {
        const endpoint = `api/index.php?path=performers-by-ad-category&adCategory=${encodeURIComponent(adCategory)}`;
        const response = await fetch(CONFIG.getApiUrl(endpoint), {
            credentials: CONFIG.FETCH_OPTIONS.credentials
        });
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            dynamicPerformersContainer.innerHTML = ''; // Clear loading message

            data.data.forEach(performer => {
                const performerDiv = document.createElement('div');
                performerDiv.className = 'menu-item';
                
                // Retains your exact original styling theme and button color palettes intact
                Object.assign(performerDiv.style, {
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '500px',
                    boxSizing: 'border-box',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                });

                // Micro-hover action feedback loops that do not break original theme designs
                performerDiv.addEventListener('mouseenter', () => {
                    performerDiv.style.transform = 'translateY(-2px)';
                });
                
                performerDiv.addEventListener('mouseleave', () => {
                    performerDiv.style.transform = 'translateY(0)';
                });

                // Uses CONFIG.getImageUrl to handle fallback resolution securely across environments
                const imageUrl = CONFIG.getImageUrl(
                    performer.EventPerformerImageURL, 
                    'https://placehold.co/80x80/cccccc/ffffff?text=No+Image'
                );

                // Structured interior data markup nodes matching original visual theme definitions
                performerDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${performer.EventPerformerName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-right: 15px; flex-shrink: 0;">
                    <div style="flex-grow: 1; min-width: 0;">
                        <h4 style="margin: 0; color: white; font-size: 1.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${performer.EventPerformerName}</h4>
                        <p style="margin: 5px 0 0; font-size: 0.9em; color: white;">
                            Category: ${performer.AdCategory || adCategory}
                        </p>
                        <p style="margin: 3px 0 0; font-size: 0.8em; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${performer.Address || 'No address'}</p>
                        <p style="margin: 3px 0 0; font-size: 0.8em; color: #ccc;">
                            Event Date: ${performer.EventPerformerDate ? new Date(performer.EventPerformerDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p style="margin: 3px 0 0; font-size: 0.8em; font-weight: 600; color: ${performer.isHappeningNow ? 'lightgreen' : '#ccc'};">
                            Status: ${performer.statusMessage || 'Unknown'}
                        </p>
                    </div>
                `;

                // Safe programmatic action execution assignment configuration
                performerDiv.addEventListener('click', () => {
                    if (typeof showPerformerDetails === 'function') {
                        showPerformerDetails(performer);
                    } else if (typeof showBusinessDetails === 'function') {
                        showBusinessDetails(performer);
                    } else {
                        console.log('Clicked performer details fallback:', performer);
                    }
                });

                dynamicPerformersContainer.appendChild(performerDiv);
            });

        } else if (data.data && data.data.length === 0) {
            dynamicPerformersContainer.innerHTML = `<p style="color: #4b5563; text-align: center; font-weight: 500;">No performers found for "${adCategory}".</p>`;
        } else {
            dynamicPerformersContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Failed to load performers for this category.</p>';
            console.error('API response error:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.error(`Error fetching performers for category ${adCategory}:`, error);
        dynamicPerformersContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600;">Error loading performers. Please check server logs.</p>';
    }

    // Refresh application session states securely using global CONFIG
    let currentSessionData = { loggedIn: false, isAdmin: false, username: null };
    try {
        const sessionResponse = await fetch(CONFIG.getApiUrl('api/index.php?path=session-data'), { 
            credentials: CONFIG.FETCH_OPTIONS.credentials 
        });
        currentSessionData = await sessionResponse.json();
    } catch (error) {
        console.error('Error re-fetching session data for updateAuthStatus:', error);
    }

    if (typeof updateAuthStatus === 'function') {
        updateAuthStatus(currentSessionData);
    }

    if (currentSessionData.loggedIn) {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }
}

// =========================================================
// SCRIPT.JS - Frontend Code
// =========================================================

async function showRegisterBusinessAdPage(prefillData = {}) {
    const registerPageContent = `
        <section style="background: linear-gradient(white, #ff3c00ad); padding: 20px; min-height: 80vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <header style="width:100%; margin-bottom: 20px;" id="register-ad-page-header">
                <a class="menu-button" style="cursor:pointer; background: #333; color: white; padding: 10px 20px; border-radius: 5px;" onclick="window.location.reload()">Back to Main</a>
                <center><h2 style="color: #222; margin-top: 20px;">Business Registration Portal</h2></center>
            </header>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 30px; padding: 20px;">
                
                <form id="registerEstablishmentForm" class="sign-form" style="display: block !important; background: rgba(0,0,0,0.85); color: white; padding: 30px; border-radius: 15px; width: 100%; max-width: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                    <h3 style="color: #ff3c00; border-bottom: 1px solid #444; padding-bottom: 10px;">Establishment Details</h3>
                    <p id="finalStatusMessage" style="font-weight: bold; margin-bottom: 10px;"></p>
                    
                    <label>Establishment Name:</label>
                    <input type="text" name="establishmentName" class="enter-form" placeholder="e.g. The Jazz Room" required style="width:100%; margin-bottom:15px; padding: 10px; border-radius: 5px; border: none;">

                    <label>Establishment Image:</label>
                    <input type="file" name="performerImage" accept="image/*" class="enter-form" required style="width:100%; margin-bottom:15px; background:white; color:black; padding: 5px; border-radius: 5px;">

                    <label>Address:</label>
                    <input type="text" name="address" class="enter-form" placeholder="e.g. 123 Florida Rd, Durban" required style="width:100%; margin-bottom:15px; padding: 10px; border-radius: 5px; border: none;">

                    <label>Contact Number:</label>
                    <input type="tel" name="phoneNumber" class="enter-form" placeholder="e.g. 031 555 1234" required style="width:100%; margin-bottom:15px; padding: 10px; border-radius: 5px; border: none;">

                    <label>Business Email:</label>
                    <input type="email" name="email" class="enter-form" placeholder="venue@example.com" required style="width:100%; margin-bottom:15px; padding: 10px; border-radius: 5px; border: none;">

                    <label>Business Category:</label>
                    <select id="estMainCategory" name="businessAdName" class="enter-form" required style="width:100%; height: 40px; margin-bottom:15px; background:white; color:black; border-radius: 5px;">
                        <option value="">-- Select Type --</option>
                    </select>

                    <div id="subCategoryContainer" style="display:none;">
                        <label>Sub-Category:</label>
                        <select id="estSubCategory" name="adCategory" class="enter-form" style="width:100%; height: 40px; margin-bottom:15px; background:white; color:black; border-radius: 5px;">
                        </select>
                    </div>

                    <label>Days of Operation:</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 15px 0; background: #222; padding: 10px; border-radius: 5px;">
                        <label><input type="checkbox" name="Sunday" value="1"> Sunday</label>
                        <label><input type="checkbox" name="Monday" value="1"> Monday</label>
                        <label><input type="checkbox" name="Tuesday" value="1"> Tuesday</label>
                        <label><input type="checkbox" name="Wednesday" value="1"> Wednesday</label>
                        <label><input type="checkbox" name="Thursday" value="1"> Thursday</label>
                        <label><input type="checkbox" name="Friday" value="1"> Friday</label>
                        <label><input type="checkbox" name="Saturday" value="1"> Saturday</label>
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                        <input type="checkbox" id="regBookable" name="bookable" value="1" style="width: 20px; height: 20px; accent-color: #ff3c00;">
                        <label for="regBookable">Allow Online Bookings?</label>
                    </div>

                    <button type="submit" id="submitAllBtn" class="btn" style="width:100%; background:#ff3c00; border:none; color:white; padding:15px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor:pointer;">
                        Complete Registration
                    </button>
                </form>
            </div>
        </section>
    `;

    renderPageLayout(registerPageContent);

    const estForm = document.getElementById('registerEstablishmentForm');
    const estMainCategory = document.getElementById('estMainCategory');
    const subCategoryContainer = document.getElementById('subCategoryContainer');
    const estSubCategory = document.getElementById('estSubCategory');
    const statusMsg = document.getElementById('finalStatusMessage');

    async function loadMainCategories() {
        try {
            const res = await fetch(CONFIG.getApiUrl('api/index.php?path=business-ad-names'), {
                credentials: CONFIG.FETCH_OPTIONS.credentials
            });
            const data = await res.json();
            if (data.success) {
                data.data.forEach(name => {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    estMainCategory.appendChild(opt);
                });
            }
        } catch (err) { console.error('Failed to load types', err); }
    }

    estMainCategory.addEventListener('change', async (e) => {
        const val = e.target.value;
        if (!val) {
            subCategoryContainer.style.display = 'none';
            estSubCategory.required = false;
            return;
        }
        try {
            const endpoint = `api/index.php?path=ad-categories&businessAdName=${encodeURIComponent(val)}`;
            const res = await fetch(CONFIG.getApiUrl(endpoint), {
                credentials: CONFIG.FETCH_OPTIONS.credentials
            });
            const data = await res.json();
            estSubCategory.innerHTML = '';
            if (data.success && data.data.length > 0) {
                data.data.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = cat;
                    estSubCategory.appendChild(opt);
                });
                subCategoryContainer.style.display = 'block';
                estSubCategory.required = true;
            } else {
                subCategoryContainer.style.display = 'none';
                estSubCategory.required = false;
            }
        } catch (err) { console.error('Error loading sub-cats', err); }
    });

    loadMainCategories();

    estForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        statusMsg.textContent = "Processing Registration...";
        statusMsg.style.color = "white";

        const finalFormData = new FormData(estForm);
        const estName = finalFormData.get('establishmentName');
        finalFormData.set('performerName', estName);
        finalFormData.set('bookable', document.getElementById('regBookable').checked ? '1' : '0');

        try {
            const res = await fetch(CONFIG.getApiUrl('api/index.php?path=admin/register-performer'), {
                method: 'POST',
                credentials: CONFIG.FETCH_OPTIONS.credentials,
                body: finalFormData
                // Note: Do NOT set Content-Type header when sending FormData; browser auto-sets boundary
            });

            const result = await res.json();

            if (result.success) {
                statusMsg.textContent = "Registration Successful!";
                statusMsg.style.color = "lime";
                setTimeout(() => window.location.reload(), 2000);
            } else {
                statusMsg.textContent = "Error: " + result.message;
                statusMsg.style.color = "#ff4444";
            }
        } catch (err) {
            statusMsg.textContent = "Network error. Please try again.";
            statusMsg.style.color = "red";
        }
    });
}

function showMessageModal(title, message) {
    // Implement a simple modal or message box here.
    // For now, let's just log to console and optionally append to body
    console.log(`[MESSAGE] ${title}: ${message}`);

    const modalHtml = `
        <div id="custom-message-modal" style="
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        ">
            <div style="
                background: white;
                color: black;
                padding: 20px;
                border-radius: 10px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            ">
                <h3 style="margin-top: 0; color: #ff3c00;">${title}</h3>
                <p>${message}</p>
                <button onclick="document.getElementById('custom-message-modal').remove()"
                        style="
                            background: #ff3c00;
                            color: white;
                            padding: 8px 15px;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-top: 15px;
                        ">
                    OK
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// --- Helper function for "sent" confirmation (replaces showSentScreen with a modal) ---
function showSentScreen(message = "Your request has been sent!") {
    showMessageModal("Confirmation", message);
}

// --- MODIFIED: showPerformersByAdCategoryPage ---
// Now makes each performer pressable to show details



// --- NEW FUNCTION: showPerformerDetails(performer) ---
// Displays detailed info for a single performer/event.
async function showPerformerDetails(performer) {
    const cat = performer.AdCategory;

    // --- 1. Define UI Personas based on Category ---
    const isTalent = ['DJs', 'Vocalists', 'Music Producers', 'Entertainers', 'Stand Up Comedy', 'Motivation and Poetry'].includes(cat);
    const isEvent = ['Social Events', 'Business Events', 'Recreational Events', 'Religious Events', 'Cultural Events'].includes(cat);
    const isVenue = ['Pub & Grills', 'Lodges', 'Resorts', 'Record Labels'].includes(cat);
    const isCreative = ['Graphic Designers', 'Photographers', 'Sketchers', 'Painters', 'Writers/Authors'].includes(cat);

    // --- 2. Contextual UI Elements & Color Matching ---
    let headerLabel = "Promoter Profile";
    let actionText = "Inquire";
    let updatesLabel = "Updates";
    let icon = "📣";
    let themeColor = "#ff3c00"; 

    if (isTalent) {
        headerLabel = "Artist Profile";
        actionText = "Book Performance";
        updatesLabel = "Repertoire & Tracks";
        icon = "🎤";
        themeColor = "#ff3c00"; 
    } else if (isEvent) {
        headerLabel = "Promoter Details";
        actionText = "RSVP / Tickets";
        updatesLabel = "Event Schedule";
        icon = "📅";
        themeColor = "#2c3e50"; 
    } else if (isVenue) {
        headerLabel = "Establishment";
        actionText = "Reserve / Book Stay";
        updatesLabel = "Menu & Amenities";
        icon = "🏨";
        themeColor = "#8e44ad"; 
    } else if (isCreative) {
        headerLabel = "Portfolio";
        actionText = "Hire Creator";
        updatesLabel = "Work Gallery";
        icon = "🎨";
        themeColor = "#27ae60"; 
    }

    // --- 3. Action Button HTML ---
    const actionColor = performer.bookable == 1 ? "#28a745" : themeColor;
    const actionButtonHtml = `
        <button class="menu-button1" style="
            background: ${actionColor}; 
            color: white; 
            border: none; 
            padding: 14px 20px; 
            border-radius: 8px; 
            font-weight: bold; 
            width: 100%; 
            font-size: 1rem;
            cursor: pointer;
            box-sizing: border-box;
        " onclick="showSentScreen('Your request for ${performer.EventPerformerName} has been submitted!')">
            ${actionText}
        </button>
    `;

    // Process image URL through CONFIG.getImageUrl with a fallback
    const performerImageUrl = CONFIG.getImageUrl(performer.EventPerformerImageURL, 'https://placehold.co/600x400');

    const detailsPageContent = `
        <section style="
            background: #f4f7f6; 
            min-height: 100vh; 
            padding-bottom: 50px; 
            font-family: system-ui, -apple-system, sans-serif;
            box-sizing: border-box;
        ">
            <div style="
                background: white; 
                padding: 16px; 
                border-bottom: 1px solid #ddd; 
                position: sticky; 
                top: 0; 
                z-index: 10; 
                display: flex; 
                align-items: center; 
                justify-content: space-between;
                box-sizing: border-box;
            ">
                <a onclick="showPerformersByAdCategoryPage('${performer.AdCategory}')" style="cursor: pointer; color: #ff3c00; font-weight: bold; text-decoration: none; font-size: 0.95rem;">&larr; Back</a>
                <span style="font-weight: bold; color: #333; font-size: 1rem; text-align: center; flex: 1; margin: 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${headerLabel}</span>
                <span style="width: 45px;"></span> 
            </div>

            <div style="
                width: 100%;
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                overflow: hidden; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.06);
                box-sizing: border-box;
            " id="performer-main-card">
                <div style="position: relative; width: 100%;">
                    <img src="${performerImageUrl}" style="width: 100%; height: auto; aspect-ratio: 4/3; max-height: 320px; object-fit: cover; display: block;">
                    <div style="position: absolute; bottom: 16px; left: 16px; background: rgba(0,0,0,0.75); color: white; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">
                        ${icon} ${cat.toUpperCase()}
                    </div>
                </div>

                <div style="padding: 20px; box-sizing: border-box;">
                    <h1 style="margin: 0 0 16px 0; font-size: 1.5rem; font-weight: 800; color: #111827; letter-spacing: -0.5px; line-height: 1.2; word-wrap: break-word;">${performer.EventPerformerName}</h1>
                    
                    <div style="height: 1px; background: #eee; margin: 16px 0;"></div>

                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; width: 100%; box-sizing: border-box;">
                        <a href="mailto:${performer.Email}" style="flex: 1; min-width: 75px; text-align: center; border: 1.5px solid #eee; padding: 12px 8px; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; font-size: 0.9rem; box-sizing: border-box;">Email</a>
                        <a href="tel:${performer.PhoneNumber}" style="flex: 1; min-width: 75px; text-align: center; border: 1.5px solid #eee; padding: 12px 8px; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; font-size: 0.9rem; box-sizing: border-box;">Call</a>
                        <a href="#" id="music-updates-link" style="flex: 2; min-width: 160px; text-align: center; background: #222; color: white; padding: 12px 8px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${updatesLabel}</a>
                    </div>

                    ${actionButtonHtml}

                    <div id="performer-menu-items-container" style="margin-top: 24px; border-top: 2px dashed #eee; padding-top: 16px; box-sizing: border-box; width: 100%;">
                        <p style="text-align: center; color: #9ca3af; font-style: italic; font-size: 13px; margin: 0;">Tap "${updatesLabel}" to see available offerings.</p>
                    </div>
                </div>
            </div>
            
            <p style="text-align: center; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 0 0; padding: 0 16px;">ID: ${performer.EventPerformerID} &bull; Verified Promoter</p>
        </section>
    `;

    renderPageLayout(detailsPageContent);

    // --- 4. Dynamic Offerings UI Node Loop Rendering Architecture ---
    const menuItemsContainer = document.getElementById('performer-menu-items-container');
    const updatesLink = document.getElementById('music-updates-link');

    if (updatesLink && menuItemsContainer) {
        updatesLink.addEventListener('click', async (e) => {
            e.preventDefault();
            menuItemsContainer.innerHTML = `<p style="text-align: center; color: ${themeColor}; font-weight: 600; font-size: 14px;">Fetching ${updatesLabel.toLowerCase()}...</p>`;
            
            try {
                // Resolved endpoint using CONFIG.getApiUrl
                const endpoint = CONFIG.getApiUrl(`api/index.php?path=performer-menu&performerId=${performer.EventPerformerID}`);
                
                // Included CONFIG.FETCH_OPTIONS to pass session credentials and headers
                const res = await fetch(endpoint, CONFIG.FETCH_OPTIONS);
                const data = await res.json();
                
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    menuItemsContainer.innerHTML = `<h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #374151;">Portfolio & Services</h3>`;
                    
                    data.data.forEach(item => {
                        const itemCard = document.createElement('div');
                        Object.assign(itemCard.style, {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f9f9f9',
                            padding: '12px',
                            borderRadius: '10px',
                            marginBottom: '10px',
                            borderLeft: `4px solid ${themeColor}`,
                            boxSizing: 'border-box',
                            width: '100%',
                            gap: '12px'
                        });

                        // Resolved audio track URL using CONFIG.getImageUrl
                        const downloadUrl = item.SongDownloadURL ? CONFIG.getImageUrl(item.SongDownloadURL) : null;

                        itemCard.innerHTML = `
                            <div style="flex-grow: 1; min-width: 0; word-wrap: break-word;">
                                <b style="display: block; color: #333; font-size: 0.95rem; line-height: 1.3; margin-bottom: 2px;">${item.MenuItem}</b>
                                <small style="color: #6b7280; font-weight: 500;">${item.Price ? 'R' + item.Price : 'View Details'}</small>
                            </div>
                            ${downloadUrl ? 
                                `<a href="${downloadUrl}" style="background: ${themeColor}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 14px; flex-shrink: 0; font-weight: bold;" download>&darr;</a>` 
                                : `<span style="color: ${themeColor}; font-weight: bold; flex-shrink: 0; font-size: 1.1rem; padding-right: 4px;">&#10142;</span>`
                            }
                        `;
                        menuItemsContainer.appendChild(itemCard);
                    });
                } else {
                    menuItemsContainer.innerHTML = `<p style="text-align: center; color: #6b7280; font-size: 13px; margin: 0;">No additional ${updatesLabel.toLowerCase()} provided.</p>`;
                }
            } catch (err) {
                menuItemsContainer.innerHTML = '<p style="color: #dc2626; text-align: center; font-weight: 600; font-size: 13px; margin: 0;">Connection error.</p>';
            }
        });
    }
}
// =========================================================
// SCRIPT.JS - Frontend Code (Updated showServices function - Links instead of Buttons)
// =========================================================

// Ensure mainPage, renderPageLayout, updateAuthStatus, showMessageModal are defined.

async function showServices() {
    // Elegant layout with a professional aesthetic that fluidly downscales onto small mobile screens
    const servicesPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #f4eae6 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        ">
            <div style="width: 100%; max-width: 500px; margin: 0 auto;">
                <header style="
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                " id="services-page-header">
                    
                    <div style="width: 100%; display: flex; justify-content: flex-start;">
                        <button type="button" class="menu-button" id="services-back-btn" style="
                            cursor: pointer; 
                            padding: 6px 14px; 
                            background: #ffffff; 
                            border: 1px solid #d1d5db; 
                            border-radius: 6px; 
                            color: #1f2937; 
                            font-size: 0.85rem;
                            font-weight: 600;
                            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                            transition: all 0.2s ease;
                            display: inline-flex;
                            align-items: center;
                        ">
                            &larr; Back
                        </button>
                    </div>
                    
                    <div style="text-align: center;">
                        <span style="
                            font-size: 0.75rem; 
                            text-transform: uppercase; 
                            letter-spacing: 1.5px; 
                            color: #ff3c00; 
                            font-weight: 800;
                            display: block;
                            margin-bottom: 4px;
                        ">Notifications</span>
                        <h2 style="
                            color: #111827; 
                            margin: 0; 
                            font-size: 1.4rem; 
                            font-weight: 700; 
                            line-height: 1.3;
                        ">Services Available</h2>
                    </div>
                </header>

                <section class="business-menu">
                    <p id="servicesMessage" style="
                        margin: 0 0 16px 0; 
                        text-align: center; 
                        font-size: 0.95rem; 
                        font-weight: 600;
                        box-sizing: border-box;
                    "></p>
                    
                    <div id="business-supply-buttons-container" style="
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        width: 100%;
                        box-sizing: border-box;
                    ">
                        <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 20px 0;">
                            Loading service types...
                        </p>
                    </div>
                </section>
            </div>

            <footer style="
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid rgba(0, 0, 0, 0.05);
                text-align: center;
                width: 100%;
            ">
                <p style="font-size: 11px; color: #6b7280; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    &copy; ${new Date().getFullYear()} MFOCAN. All Rights Reserved
                </p>
            </footer>
        </section>
    `;

    renderPageLayout(servicesPageContent);

    // Dynamic Back Navigation Hook
    const backBtn = document.getElementById('services-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof mainPage === 'function') {
                mainPage();
            } else {
                console.error("Error: mainPage function is missing globally.");
            }
        });
    }

    const businessSupplyButtonsContainer = document.getElementById('business-supply-buttons-container');
    const servicesMessage = document.getElementById('servicesMessage');
    let currentLoggedInUsername = null; 

    // Fetch session data safely with CONFIG
    try {
        const sessionResponse = await fetch(
            CONFIG.getApiUrl('api/index.php?path=session-data'), 
            CONFIG.FETCH_OPTIONS
        );
        const sessionData = await sessionResponse.json();
        
        if (typeof updateAuthStatus === 'function') {
            updateAuthStatus(sessionData);
        }
        
        if (sessionData.loggedIn) {
            currentLoggedInUsername = sessionData.username;
        } else {
            servicesMessage.textContent = 'You must be logged in to view services.';
            servicesMessage.style.color = '#dc2626';
            businessSupplyButtonsContainer.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; text-align: center;">
                    <p style="color: #991b1b; font-weight: 500; margin: 0;">Please log in to view services.</p>
                </div>
            `;
            return;
        }
    } catch (err) {
        console.error('Session fetch error in showServices:', err);
        servicesMessage.textContent = 'Error retrieving session data.';
        servicesMessage.style.color = '#dc2626';
        return;
    }

    // Fetch and dynamically display business supplies with CONFIG
    try {
        const response = await fetch(
            CONFIG.getApiUrl('api/index.php?path=business-supply-pending-counts'), 
            CONFIG.FETCH_OPTIONS
        );
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            businessSupplyButtonsContainer.innerHTML = ''; 

            data.data.forEach(item => {
                const itemRow = document.createElement('div');
                
                Object.assign(itemRow.style, {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                    borderLeft: '4px solid #ff3c00',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    width: '100%',
                    boxSizing: 'border-box',
                    gap: '10px'
                });

                // Micro-interactions for desktop components
                itemRow.addEventListener('mouseenter', () => {
                    itemRow.style.transform = 'translateX(2px)';
                    itemRow.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                    itemRow.style.background = '#fafafa';
                });
                itemRow.addEventListener('mouseleave', () => {
                    itemRow.style.transform = 'translateX(0)';
                    itemRow.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    itemRow.style.background = '#ffffff';
                });

                itemRow.innerHTML = `
                    <span style="
                        color: #1f2937; 
                        font-weight: 600; 
                        font-size: 1rem;
                        line-height: 1.4;
                        flex: 1;
                        min-width: 150px;
                        white-space: normal;
                        word-break: normal;
                    ">${item.BusinessSupplyName}</span>
                    <span style="
                        background: #fff5f2;
                        color: #ff3c00;
                        font-size: 0.85rem;
                        font-weight: 700;
                        padding: 4px 10px;
                        border-radius: 9999px;
                        border: 1px solid #ffe3db;
                        flex-shrink: 0;
                        white-space: nowrap;
                    ">
                        ${item.PendingRequestCount} pending
                    </span>
                `;

                itemRow.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (typeof showCategoryRequestsPage === 'function') {
                        showCategoryRequestsPage(item.BusinessSupplyName);
                    } else {
                        console.error("Error: showCategoryRequestsPage function is missing globally.");
                    }
                });

                businessSupplyButtonsContainer.appendChild(itemRow);
            });
        } else {
            businessSupplyButtonsContainer.innerHTML = `
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center;">
                    <p style="color: #4b5563; font-weight: 500; margin: 0;">No business types with pending requests found.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching business supply pending counts:', error);
        servicesMessage.textContent = 'Error loading service types. Please check server logs.';
        servicesMessage.style.color = '#dc2626';
    }
}
// =========================================================
// SCRIPT.JS - Frontend Code (NEW showCategoryRequestsPage function)
// =========================================================

async function showCategoryRequestsPage(businessSupplyName) {
    const pageTitle = `Requests for ${businessSupplyName}`;

    // Elegant structural background layout with an organized mobile-first typography block
    const requestsPageContent = `
        <section style="
            background: linear-gradient(180deg, #ffffff 0%, #f4eae6 100%); 
            padding: 24px 16px; 
            min-height: 100vh; 
            box-sizing: border-box; 
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        ">
            <div style="width: 100%; max-width: 600px; margin: 0 auto;">
                <header style="
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                " id="requests-category-page-header">
                    
                    <div style="width: 100%; display: flex; justify-content: flex-start;">
                        <button type="button" class="menu-button" id="requests-back-btn" style="
                            cursor: pointer; 
                            padding: 6px 14px; 
                            background: #ffffff; 
                            border: 1px solid #d1d5db; 
                            border-radius: 6px; 
                            color: #1f2937; 
                            font-size: 0.85rem;
                            font-weight: 600;
                            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                            transition: all 0.2s ease;
                            display: inline-flex;
                            align-items: center;
                        ">
                            &larr; Back to Service Types
                        </button>
                    </div>
                    
                    <div style="text-align: center;">
                        <h2 style="
                            color: #111827; 
                            margin: 0; 
                            font-size: 1.35rem; 
                            font-weight: 700; 
                            line-height: 1.3;
                        ">${pageTitle}</h2>
                    </div>
                </header>

                <section class="business-menu">
                    <p id="requestsMessage" style="
                        margin: 0 0 16px 0; 
                        text-align: center; 
                        font-size: 0.95rem; 
                        font-weight: 600;
                        box-sizing: border-box;
                    "></p>
                    
                    <div id="requests-list-container" style="width: 100%; box-sizing: border-box;">
                        <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 20px 0;">
                            Loading requests for ${businessSupplyName}...
                        </p>
                    </div>
                </section>
            </div>

            <footer style="
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid rgba(0, 0, 0, 0.05);
                text-align: center;
                width: 100%;
            ">
                <p style="font-size: 11px; color: #6b7280; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    &copy; ${new Date().getFullYear()} MFOCAN. All Rights Reserved
                </p>
            </footer>
        </section>
    `;

    renderPageLayout(requestsPageContent);

    // Manual listener deployment for programmatic route management
    const backBtn = document.getElementById('requests-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof showServices === 'function') {
                showServices();
            } else {
                console.error("Error: showServices function is missing globally.");
            }
        });
    }

    const requestsListContainer = document.getElementById('requests-list-container');
    const requestsMessage = document.getElementById('requestsMessage');
    let currentLoggedInUsername = null;

    // Fetch session data first
    try {
        const sessionResponse = await fetch(
            CONFIG.getApiUrl('api/index.php?path=session-data'), 
            CONFIG.FETCH_OPTIONS
        );
        const sessionData = await sessionResponse.json();
        
        if (typeof updateAuthStatus === 'function') {
            updateAuthStatus(sessionData);
        }

        if (sessionData.loggedIn) {
            currentLoggedInUsername = sessionData.username;
        } else {
            requestsMessage.textContent = 'You must be logged in to manage requests.';
            requestsMessage.style.color = '#dc2626';
            requestsListContainer.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; text-align: center;">
                    <p style="color: #991b1b; font-weight: 500; margin: 0;">Please log in to manage requests.</p>
                </div>
            `;
            return;
        }
    } catch (err) {
        console.error('Session fetch error:', err);
        requestsMessage.textContent = 'Error retrieving session data.';
        requestsMessage.style.color = '#dc2626';
        return;
    }

    // Fetch and display requests for the selected business supply
    async function fetchAndDisplayRequestsForCategory(businessSupplyName) {
        requestsListContainer.innerHTML = `
            <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 20px 0;">
                Fetching requests...
            </p>
        `;
        requestsMessage.textContent = '';

        try {
            const endpoint = `api/index.php?path=requests-by-business-supply-name&businessSupplyName=${encodeURIComponent(businessSupplyName)}`;
            const response = await fetch(
                CONFIG.getApiUrl(endpoint), 
                CONFIG.FETCH_OPTIONS
            );

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Invalid JSON from server:", text);
                throw new Error("Server returned invalid JSON");
            }

            if (data.success && data.data && data.data.length > 0) {
                // Group by category (SupplyCategory)
                const requestsBySupplyCategory = data.data.reduce((acc, request) => {
                    const category = request.SupplyCategory || 'Uncategorized';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(request);
                    return acc;
                }, {});

                requestsListContainer.innerHTML = '';

                for (const supplyCategory in requestsBySupplyCategory) {
                    const categoryDiv = document.createElement('div');
                    
                    // Styled grouping block element with a modern layout look
                    Object.assign(categoryDiv.style, {
                        marginBottom: '24px',
                        padding: '16px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                        width: '100%',
                        boxSizing: 'border-box'
                    });

                    categoryDiv.innerHTML = `
                        <h3 style="
                            color: #111827; 
                            border-bottom: 2px solid #ff3c00; 
                            padding-bottom: 8px; 
                            margin: 0 0 16px 0;
                            font-size: 1.05rem;
                            font-weight: 700;
                        ">
                            Supply Category: ${supplyCategory}
                        </h3>
                        <div id="requests-for-supply-${supplyCategory.replace(/\s/g, '-')}" style="
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            width: 100%;
                            box-sizing: border-box;
                        "></div>
                    `;
                    requestsListContainer.appendChild(categoryDiv);

                    const currentSupplyCategoryRequestsContainer = categoryDiv.querySelector(`#requests-for-supply-${supplyCategory.replace(/\s/g, '-')}`);

                    requestsBySupplyCategory[supplyCategory].forEach(request => {
                        const requestDiv = document.createElement('div');
                        
                        // Clean card with soft styling to prevent text wrapping clipping
                        Object.assign(requestDiv.style, {
                            background: '#f9fafb',
                            color: '#374151',
                            padding: '14px',
                            borderRadius: '8px',
                            border: `1px solid ${request.Accepted ? '#bbf7d0' : '#fee2e2'}`,
                            borderLeft: `4px solid ${request.Accepted ? '#22c55e' : '#ff3c00'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            width: '100%',
                            boxSizing: 'border-box'
                        });
                        requestDiv.setAttribute('data-request-id', request.RequestID);

                        const dateTime = new Date(request.DateTime).toLocaleDateString('en-ZA', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });

                        // Structured detail parameters featuring normal horizontal formatting rules
                        requestDiv.innerHTML = `
                            <div style="font-size: 0.95rem; line-height: 1.4;">
                                <p style="margin: 0 0 4px 0;"><strong style="color: #111827;">Job:</strong> ${request.JobDescription || 'N/A'}</p>
                                <p style="margin: 0 0 4px 0;"><strong style="color: #111827;">Location:</strong> ${request.Location || 'N/A'}</p>
                                <p style="margin: 0 0 4px 0;"><strong style="color: #111827;">Date/Time:</strong> ${dateTime}</p>
                                <p style="margin: 0 0 6px 0;"><strong style="color: #111827;">Sent By:</strong> ${request.userSentFrom || 'N/A'}</p>
                            </div>
                            
                            <div style="
                                display: flex; 
                                flex-wrap: wrap; 
                                justify-content: space-between; 
                                align-items: center; 
                                gap: 10px;
                                margin-top: 4px;
                                padding-top: 10px;
                                border-top: 1px dashed #e5e7eb;
                            ">
                                <span style="
                                    font-size: 0.85rem; 
                                    font-weight: 700;
                                    color: ${request.Accepted ? '#16a34a' : '#dc2626'};
                                    background: ${request.Accepted ? '#f0fdf4' : '#fef2f2'};
                                    padding: 4px 10px;
                                    border-radius: 6px;
                                    border: 1px solid ${request.Accepted ? '#dcfce7' : '#fee2e2'};
                                ">
                                    Status: ${request.Accepted ? `Accepted by ${request.userAccepted || 'Unknown'}` : 'Pending'}
                                </span>
                                
                                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                                    ${!request.Accepted ? `
                                        <button class="accept-btn" style="
                                            background: #22c55e; 
                                            color: white; 
                                            border: none; 
                                            padding: 6px 14px; 
                                            border-radius: 6px; 
                                            font-weight: 600; 
                                            font-size: 0.85rem; 
                                            cursor: pointer;
                                            box-shadow: 0 1px 2px rgba(34,197,94,0.2);
                                        ">Accept</button>
                                        <button class="ignore-btn" style="
                                            background: #ef4444; 
                                            color: white; 
                                            border: none; 
                                            padding: 6px 14px; 
                                            border-radius: 6px; 
                                            font-weight: 600; 
                                            font-size: 0.85rem; 
                                            cursor: pointer;
                                            box-shadow: 0 1px 2px rgba(239,68,68,0.2);
                                        ">Ignore</button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                        currentSupplyCategoryRequestsContainer.appendChild(requestDiv);
                    });
                }

                requestsListContainer.addEventListener('click', async (event) => {
                    const target = event.target;
                    const requestCard = target.closest('[data-request-id]');
                    if (!requestCard) return;
                    
                    const requestId = requestCard.dataset.requestId;

                    if (target.classList.contains('accept-btn')) {
                        await handleAcceptReject(requestId, true);
                    } else if (target.classList.contains('ignore-btn')) {
                        await handleAcceptReject(requestId, false);
                    }
                });

            } else {
                requestsListContainer.innerHTML = `
                    <div style="background: #ffffff; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <p style="color: #4b5563; font-weight: 500; margin: 0;">No requests found for this business supply type.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching requests by business supply name:', error);
            requestsMessage.textContent = 'Error loading requests. Please check server logs.';
            requestsMessage.style.color = '#dc2626';
        }
    }

    // Handle Accept/Ignore actions
    async function handleAcceptReject(requestId, accepted) {
        requestsMessage.textContent = 'Processing...';
        requestsMessage.style.color = '#ea580c';

        try {
            const response = await fetch(CONFIG.getApiUrl(`api/index.php?path=requests&id=${requestId}`), {
                method: 'PUT',
                ...CONFIG.FETCH_OPTIONS,
                body: JSON.stringify({
                    accepted: accepted,
                    userAccepted: accepted ? currentLoggedInUsername : null
                })
            });
            const result = await response.json();

            if (response.ok) {
                requestsMessage.textContent = result.message || `Request ${accepted ? 'accepted' : 'ignored'} successfully!`;
                requestsMessage.style.color = '#16a34a';
                await fetchAndDisplayRequestsForCategory(businessSupplyName); 
            } else {
                requestsMessage.textContent = result.message || 'Failed to update request.';
                requestsMessage.style.color = '#dc2626';
            }
        } catch (error) {
            console.error(`Error updating request ${requestId}:`, error);
            requestsMessage.textContent = 'Unexpected error during request update.';
            requestsMessage.style.color = '#dc2626';
        }
    }

    // Initial load orchestration call
    fetchAndDisplayRequestsForCategory(businessSupplyName);
}

function request() {
    var selectElement = document.getElementById("request");
    const jobselected = selectElement.value;

    selectElement = document.getElementById("location");
    const locationselected = selectElement.value;

    selectElement = document.getElementById("schedule");
    const dateselected = selectElement.value;

    
  
    switch (jobselected) {
      case "transport":
         transportJob++;
         Jobs.push({ job: jobselected, location: locationselected, date: dateselected });
        
         showSentScreen();
        break;
      case "construction":
          constructionJob++;
          Jobs.push({ job: jobselected, location: locationselected, date: dateselected });
          //alert('Your request has been sent, await feedback from receiving company');
          showSentScreen();
        break;
        case "beauty":
          beautyJob++;
          Jobs.push({ job: jobselected, location: locationselected, date: dateselected });
          //alert('Your request has been sent, await feedback from receiving company');
          showSentScreen();
        break;
        case "cleaning":
          cleaningJob++;
          Jobs.push({ job: jobselected, location: locationselected, date: dateselected });
          //alert('Your request has been sent, await feedback from receiving company');
          showSentScreen();
        break;
        case "catering":
          cateringJob++;
          Jobs.push({ job: jobselected, location: locationselected, date: dateselected });
          showSentScreen();
        break;
     
      default:
         alert("nothing was selected");
        break;
    }
    
    console.log("Selected value:", selectedValue); 
      
}
function showThumbsUp() {
    const thumbsUpContainer = document.getElementById('thumbs-up-container');
    thumbsUpContainer.style.display = 'block';

    // Hide the GIF after 2 seconds
    setTimeout(() => {
        thumbsUpContainer.style.display = 'none';
    }, 2000);
}





// =========================================================
// SCRIPT.JS - Frontend Code
// =========================================================

async function requestPage() {
    const requestPageContent = `
    <section class="page-container">
        <header class="request-header" id="request-page-header">
            <button class="back-btn" onclick="mainPageContent()">
                <i class='bx bx-chevron-left'></i> Back
            </button>
            <div class="header-titles">
                <h1>BUSINESS</h1>
                <p>Tender Request</p>
            </div>
        </header>

        <section class="form-section">
            <form id="requestForm" class="modern-form">
                <p id="requestMessage" class="status-message"></p>

                <div class="input-group">
                    <label for="businessSupplyName">Business Supply Type</label>
                    <select name="businessSupplyName" id="businessSupplyName" required>
                        <option value="">Loading business types...</option>
                    </select>
                </div>

                <div class="input-group" id="supply-category-dropdown-container" style="display: none;">
                    <label for="supplyCategory">Supply Category</label>
                    <select name="supplyCategory" id="supplyCategory" required>
                        <option value="">-- Select Supply Category --</option>
                    </select>
                </div>

                <div class="input-group">
                    <label for="jobDescription">Job Description</label>
                    <textarea id="jobDescription" name="jobDescription" 
                        placeholder="e.g., Need 5 tons of cement delivered by 3 PM" rows="3" required></textarea>
                </div>

                <div class="input-group">
                    <label for="location">Location</label>
                    <input type="text" id="location" name="location" placeholder="e.g., Cape Town, SA" required>
                </div>

                <div class="input-group">
                    <label for="dateTime">Date and Time</label>
                    <input type="datetime-local" name="dateTime" id="dateTime" required>
                </div>

                <button type="submit" class="submit-btn">Submit Request</button>
            </form>
        </section>

        <footer class="modern-footer">
            <p>&copy; ${new Date().getFullYear()} MFOCAN. All Rights Reserved</p>
            <a href="#" class="scroll-top"><i class="bx bx-up-arrow-alt"></i></a>
        </footer>
    </section>
`;

    renderPageLayout(requestPageContent);

    const businessSupplyNameDropdown = document.getElementById('businessSupplyName');
    const supplyCategoryDropdownContainer = document.getElementById('supply-category-dropdown-container');
    const supplyCategoryDropdown = document.getElementById('supplyCategory');
    const requestForm = document.getElementById('requestForm');
    const requestMessage = document.getElementById('requestMessage');
    
    // Check localStorage cache immediately
    let currentLoggedInUsername = localStorage.getItem('username') || null;
    let isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Verify/Sync session data from server with local cache fallback
    try {
        const sessionResponse = await fetch(
            CONFIG.getApiUrl('api/index.php?path=session-data'), 
            CONFIG.FETCH_OPTIONS
        );
        const sessionData = await sessionResponse.json();
        
        if (typeof updateAuthStatus === 'function') {
            updateAuthStatus(sessionData);
        }

        if (sessionData && sessionData.loggedIn) {
            currentLoggedInUsername = sessionData.username;
            isUserLoggedIn = true;
        }
    } catch (err) {
        console.warn('Session endpoint check failed, using local session state:', err);
    }

    // Final auth verification before proceeding
    if (!isUserLoggedIn || !currentLoggedInUsername) {
        showMessageModal('Authentication Required', 'You must be logged in to make a request.');
        return;
    }

    // Function to load Business Supply Names
    async function loadBusinessSupplyNames() {
        try {
            const response = await fetch(
                CONFIG.getApiUrl('api/index.php?path=business-supply-names'), 
                CONFIG.FETCH_OPTIONS
            );
            const data = await response.json();
            businessSupplyNameDropdown.innerHTML = '<option value="">-- Select Business Supply Type --</option>';
            if (data.success && data.data.length > 0) {
                data.data.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    businessSupplyNameDropdown.appendChild(option);
                });
            } else {
                businessSupplyNameDropdown.innerHTML = '<option value="">No business types found</option>';
            }
        } catch (err) {
            console.error('Error loading business supply names:', err);
            businessSupplyNameDropdown.innerHTML = '<option value="">Error loading types.</option>';
        }
    }

    // Function to load Supply Categories based on selected Business Supply Name
    async function loadSupplyCategories(selectedBusinessSupplyName) {
        if (!selectedBusinessSupplyName) {
            supplyCategoryDropdownContainer.style.display = 'none';
            supplyCategoryDropdown.innerHTML = '<option value="">-- Select Supply Category --</option>';
            return;
        }

        try {
            const endpoint = `api/index.php?path=supply-categories&businessSupplyName=${encodeURIComponent(selectedBusinessSupplyName)}`;
            const response = await fetch(
                CONFIG.getApiUrl(endpoint), 
                CONFIG.FETCH_OPTIONS
            );
            const data = await response.json();

            supplyCategoryDropdown.innerHTML = '<option value="">-- Select Supply Category --</option>';
            if (data.success && data.data.length > 0) {
                data.data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    supplyCategoryDropdown.appendChild(option);
                });
                supplyCategoryDropdownContainer.style.display = 'block';
            } else {
                supplyCategoryDropdownContainer.style.display = 'none';
                supplyCategoryDropdown.innerHTML = '<option value="">No categories found</option>';
            }
        } catch (err) {
            console.error('Error loading supply categories:', err);
            supplyCategoryDropdownContainer.style.display = 'none';
            supplyCategoryDropdown.innerHTML = '<option value="">Error loading categories.</option>';
        }
    }

    // Event listener for the Business Supply Name dropdown
    businessSupplyNameDropdown.addEventListener('change', (event) => {
        const selectedName = event.target.value;
        loadSupplyCategories(selectedName);
    });

    // Initial load of business supply names
    loadBusinessSupplyNames();

    // Form submission handler
    requestForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        requestMessage.textContent = '';
        requestMessage.style.color = 'red';

        if (!currentLoggedInUsername) {
            requestMessage.textContent = 'You must be logged in to submit a request.';
            return;
        }

        const formData = new FormData(requestForm);
        formData.append('userSentFrom', currentLoggedInUsername);

        try {
            const response = await fetch(CONFIG.getApiUrl('api/index.php?path=submit-request'), {
                method: 'POST',
                credentials: CONFIG.FETCH_OPTIONS.credentials,
                body: formData
            });
            const result = await response.json();

            if (response.ok) {
                requestMessage.style.color = 'green';
                requestMessage.textContent = result.message || 'Request submitted successfully!';
                requestForm.reset();
                supplyCategoryDropdown.innerHTML = '<option value="">-- Select Supply Category --</option>';
                supplyCategoryDropdownContainer.style.display = 'none';
            } else {
                requestMessage.textContent = result.message || 'Failed to submit request.';
            }
        } catch (err) {
            console.error('Request submission error:', err);
            requestMessage.textContent = 'Unexpected error during request submission. Check console for details.';
        }
    });
}


async function showNewNotifications() {
    const escapeHTML = (str) => {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Date unavailable';
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? escapeHTML(dateStr) : parsed.toLocaleDateString('en-ZA', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Rendered Page Content (Includes auth-status container to fix JS error)
    const notificationsPageContent = `
        <section style="background: linear-gradient(180deg, #ffffff 0%, #f4eae6 100%); padding: 24px 16px; min-height: 100vh; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="width: 100%; max-width: 600px; margin: 0 auto;">
                <div id="auth-status" style="display:none;"></div>
                <header style="margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;" id="notifications-page-header">
                    <div style="width: 100%; display: flex; justify-content: flex-start;">
                        <button type="button" class="menu-button" id="notifications-back-btn" style="cursor: pointer; padding: 6px 14px; background: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; color: #1f2937; font-size: 0.85rem; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: inline-flex; align-items: center;">
                            &larr; Back
                        </button>
                    </div>
                    <div style="text-align: center;">
                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #ff3c00; font-weight: 800; display: block; margin-bottom: 4px;">Your Updates</span>
                        <h2 style="color: #111827; margin: 0; font-size: 1.4rem; font-weight: 700; line-height: 1.3;">Notifications</h2>
                    </div>
                </header>

                <section class="business-menu">
                    <p id="notificationsMessage" style="margin: 0 0 16px 0; text-align: center; font-size: 0.95rem; font-weight: 600; box-sizing: border-box;"></p>
                    <div id="notifications-container" style="width: 100%; box-sizing: border-box;">
                        <p style="color: #4b5563; text-align: center; font-size: 1rem; font-weight: 500; padding: 20px 0;">Loading notifications...</p>
                    </div>
                </section>
            </div>
            <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(0, 0, 0, 0.05); text-align: center; width: 100%;">
                <p style="font-size: 11px; color: #6b7280; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    &copy; ${new Date().getFullYear()} MFOCAN. All Rights Reserved
                </p>
            </footer>
        </section>
    `;

    renderPageLayout(notificationsPageContent);

    const backBtn = document.getElementById('notifications-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof mainPage === 'function') mainPageContent();
        });
    }

    const notificationsContainer = document.getElementById('notifications-container');
    const notificationsMessage = document.getElementById('notificationsMessage');
    
    let currentLoggedInUsername = '';
    try {
        currentLoggedInUsername = localStorage.getItem('username') || localStorage.getItem('user') || sessionStorage.getItem('username') || '';
    } catch (e) {
        console.warn("Storage restricted:", e);
    }

    const getUrl = (path) => typeof CONFIG !== 'undefined' && CONFIG.getApiUrl ? CONFIG.getApiUrl(path) : path;

    // Check session data first
    try {
        const sessionRes = await fetch(getUrl('api/index.php?path=session-data'), { 
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });
        if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            const authEl = document.getElementById('auth-status');
            if (typeof updateAuthStatus === 'function' && authEl) {
                updateAuthStatus(sessionData);
            }
            if (sessionData && (sessionData.username || sessionData.user)) {
                currentLoggedInUsername = sessionData.username || sessionData.user;
            }
        }
    } catch (e) {
        console.warn("Session check skipped:", e);
    }

    async function handleAcceptReject(requestId, accepted) {
        if (!notificationsMessage) return;
        notificationsMessage.textContent = 'Processing...';
        notificationsMessage.style.color = '#ea580c';

        try {
            const res = await fetch(getUrl(`api/index.php?path=requests&id=${requestId}`), {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    accepted: accepted,
                    userAccepted: accepted ? currentLoggedInUsername : null,
                    username: currentLoggedInUsername
                }),
                credentials: 'include'
            });
            const result = await res.json().catch(() => ({}));
            if (res.ok) {
                notificationsMessage.textContent = result.message || `Request ${accepted ? 'accepted' : 'declined'} successfully!`;
                notificationsMessage.style.color = '#16a34a';
                await fetchAndDisplayAllNotifications(); 
            } else {
                notificationsMessage.textContent = result.message || 'Operation failed.';
                notificationsMessage.style.color = '#dc2626';
            }
        } catch (err) {
            notificationsMessage.textContent = 'Unexpected error updating request.';
            notificationsMessage.style.color = '#dc2626';
        }
    }

    async function fetchAndDisplayAllNotifications() {
        if (!notificationsContainer) return;
        notificationsContainer.innerHTML = '';

        const upcomingEventsSection = document.createElement('div');
        upcomingEventsSection.style.cssText = 'margin-bottom: 24px; padding: 16px; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); width: 100%; box-sizing: border-box;';
        upcomingEventsSection.innerHTML = `
            <h3 style="color: #111827; border-bottom: 2px solid #22c55e; padding-bottom: 8px; margin: 0 0 16px 0; font-size: 1.05rem; font-weight: 700;">Upcoming Events (Next 2 Weeks)</h3>
            <div id="upcoming-events-list" style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;"></div>
        `;

        const incomingRequestsSection = document.createElement('div');
        incomingRequestsSection.style.cssText = 'margin-bottom: 24px; padding: 16px; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); width: 100%; box-sizing: border-box;';
        incomingRequestsSection.innerHTML = `
            <h3 style="color: #111827; border-bottom: 2px solid #ff3c00; padding-bottom: 8px; margin: 0 0 16px 0; font-size: 1.05rem; font-weight: 700;">Incoming Tender Requests for You</h3>
            <div id="incoming-requests-list" style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;"></div>
        `;

        const sentRequestsSection = document.createElement('div');
        sentRequestsSection.style.cssText = 'margin-bottom: 24px; padding: 16px; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); width: 100%; box-sizing: border-box;';
        sentRequestsSection.innerHTML = `
            <h3 style="color: #111827; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin: 0 0 16px 0; font-size: 1.05rem; font-weight: 700;">Status of Your Sent Tender Requests</h3>
            <div id="sent-requests-list" style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;"></div>
        `;

        notificationsContainer.appendChild(upcomingEventsSection);
        notificationsContainer.appendChild(incomingRequestsSection);
        notificationsContainer.appendChild(sentRequestsSection);

        const upcomingEventsList = document.getElementById('upcoming-events-list');
        const incomingRequestsList = document.getElementById('incoming-requests-list');
        const sentRequestsList = document.getElementById('sent-requests-list');

        // Dynamically resolve active username right before dispatching network calls
        const activeUser = currentLoggedInUsername || localStorage.getItem('username') || localStorage.getItem('user') || '';
        const userParam = activeUser ? `&username=${encodeURIComponent(activeUser)}&user=${encodeURIComponent(activeUser)}` : '';
        
        const fetchOpts = { 
            method: 'GET', 
            credentials: 'include',
            headers: { 
                'Accept': 'application/json',
                'X-User-Name': activeUser
            }
        };

        const results = await Promise.allSettled([
            fetch(getUrl(`api/index.php?path=upcoming-events${userParam}`), fetchOpts).catch(() => null),
            fetch(getUrl(`api/index.php?path=user-pending-requests${userParam}`), fetchOpts).catch(() => null),
            fetch(getUrl(`api/index.php?path=user-sent-requests${userParam}`), fetchOpts).catch(() => null)
        ]);

        const extractArray = async (settledResult) => {
            if (!settledResult || settledResult.status !== 'fulfilled' || !settledResult.value || !settledResult.value.ok) return [];
            try {
                const res = await settledResult.value.json();
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (Array.isArray(res.requests)) return res.requests;
            } catch (e) {}
            return [];
        };

        const eventsList = await extractArray(results[0]);
        const incomingList = await extractArray(results[1]);
        const sentList = await extractArray(results[2]);

        // 1. Render Events
        if (eventsList.length > 0) {
            eventsList.forEach(event => {
                const div = document.createElement('div');
                div.style.cssText = 'background: #f9fafb; color: #374151; padding: 14px; border-radius: 8px; border: 1px solid #dcfce7; border-left: 4px solid #22c55e; width: 100%; box-sizing: border-box;';
                div.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.95rem;">
                        <p style="margin: 0; font-weight: 700; color: #111827;">EVENT: ${escapeHTML((event.EventPerformerName || event.title || event.name || 'Event').toUpperCase())}</p>
                        <p style="margin: 0;"><strong>Category:</strong> ${escapeHTML(event.AdCategory || event.category || 'General')}</p>
                        <p style="margin: 0;"><strong>Location:</strong> ${escapeHTML(event.Address || event.location || 'N/A')}</p>
                    </div>
                `;
                upcomingEventsList.appendChild(div);
            });
        } else {
            upcomingEventsList.innerHTML = '<p style="color: #6b7280; font-size: 0.95rem; margin: 8px 0;">No upcoming events in the next two weeks.</p>';
        }

        // 2. Render Incoming Requests
        if (incomingList.length > 0) {
            incomingList.forEach(request => {
                const div = document.createElement('div');
                div.style.cssText = 'background: #f9fafb; color: #374151; padding: 14px; border-radius: 8px; border: 1px solid #fef08a; border-left: 4px solid #ff3c00; width: 100%; box-sizing: border-box;';
                
                const category = escapeHTML((request.SupplyCategory || request.category || request.type || 'General').toUpperCase());
                const sender = escapeHTML(request.userSentFrom || request.username || request.from || request.sender || 'Unknown Sender');
                const jobDesc = escapeHTML(request.JobDescription || request.job || request.description || 'No description');
                const loc = escapeHTML(request.Location || request.location || 'N/A');
                const formattedDate = formatDate(request.DateTime || request.date || request.created_at);
                const requestId = request.RequestID || request.id;

                div.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.95rem; line-height: 1.4;">
                        <p style="margin: 0 0 4px 0; font-weight: 700; color: #111827;">NEW REQUEST: ${category} Tender</p>
                        <p style="margin: 0;"><strong style="color: #111827;">From:</strong> ${sender}</p>
                        <p style="margin: 0;"><strong style="color: #111827;">Job:</strong> ${jobDesc}</p>
                        <p style="margin: 0;"><strong style="color: #111827;">Location:</strong> ${loc}</p>
                        <p style="margin: 0;"><strong style="color: #111827;">Date/Time:</strong> ${formattedDate}</p>
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; border-top: 1px dashed #e5e7eb; padding-top: 10px;">
                        <button class="accept-btn" style="background: #22c55e; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer;">Accept</button>
                        <button class="decline-btn" style="background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer;">Decline</button>
                    </div>
                `;
                div.querySelector('.accept-btn').addEventListener('click', () => handleAcceptReject(requestId, true));
                div.querySelector('.decline-btn').addEventListener('click', () => handleAcceptReject(requestId, false));
                incomingRequestsList.appendChild(div);
            });
        } else {
            incomingRequestsList.innerHTML = '<p style="color: #6b7280; font-size: 0.95rem; margin: 8px 0;">No incoming tender requests at this time.</p>';
        }

        // 3. Render Sent Requests
        if (sentList.length > 0) {
            sentList.forEach(request => {
                const div = document.createElement('div');
                const category = escapeHTML((request.SupplyCategory || request.category || request.type || 'General').toUpperCase());
                const recipient = escapeHTML(request.userSentTo || request.to || request.recipient || 'General Businesses');
                const jobDesc = escapeHTML(request.JobDescription || request.job || request.description || 'N/A');

                let statusText = `PENDING response from ${recipient}`;
                let statusColor = '#ca8a04';
                let statusBg = '#fefce8';
                let borderColor = '#fef08a';

                if (request.Accepted || request.accepted === true || request.accepted == 1) {
                    const acceptedUser = escapeHTML(request.userAccepted || 'User');
                    statusText = `ACCEPTED by ${acceptedUser}`;
                    statusColor = '#16a34a'; 
                    statusBg = '#f0fdf4'; 
                    borderColor = '#bbf7d0';
                }

                div.style.cssText = `background: #f9fafb; color: #374151; padding: 14px; border-radius: 8px; border: 1px solid ${borderColor}; border-left: 4px solid ${request.Accepted ? '#16a34a' : '#3b82f6'}; width: 100%; box-sizing: border-box;`;

                div.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.95rem; line-height: 1.4;">
                        <p style="margin: 0 0 4px 0; font-weight: 700; color: #111827;">Your Request: ${category} Tender</p>
                        <p style="margin: 0;"><strong style="color: #111827;">To:</strong> ${recipient}</p>
                        <p style="margin: 0;"><strong style="color: #111827;">Job:</strong> ${jobDesc}</p>
                        <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed #e5e7eb;">
                            <span style="font-size: 0.85rem; font-weight: 700; color: ${statusColor}; background: ${statusBg}; padding: 4px 10px; border-radius: 6px; border: 1px solid ${borderColor}; display: inline-block;">
                                Status: ${statusText}
                            </span>
                        </div>
                    </div>
                `;
                sentRequestsList.appendChild(div);
            });
        } else {
            sentRequestsList.innerHTML = '<p style="color: #6b7280; font-size: 0.95rem; margin: 8px 0;">You have not sent any tender requests yet.</p>';
        }
    }

    fetchAndDisplayAllNotifications();
}














