/* script.js */

const API_URL = 'http://127.0.0.1:8000';

const albumListDiv = document.getElementById('album-list');
const listenedAlbumListDiv = document.getElementById('listened-album-list');
const addAlbumForm = document.getElementById('add-album-form');
const authSection = document.getElementById('auth-section');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

let editAlbumId = undefined;
let token = localStorage.getItem('token');
let username = localStorage.getItem('username');

// on load, fetch all data
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showMainApp();
    } else {
        showLogin();
    }
});

function showMainApp() {
    authSection.style.display = 'none';
    mainContent.style.display = 'block';
    document.getElementById('current-username').innerText = username;
    fetchAndRenderQueue();
    fetchAndRenderListened();
}
// added login functionality
function showLogin() {
    authSection.style.display = 'block';
    mainContent.style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('register-form-container').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
}
//liogout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    token = null;
    username = null;
    showLogin();
}

// Helper for authorized fetch
async function authFetch(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    const response = await fetch(url, options);
    if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }
    return response;
}
// check login info reject in login not found
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        if (!response.ok) throw new Error('Login failed');
        const data = await response.json();
        token = data.access_token;
        username = user;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        showMainApp();
    } catch (error) {
        alert(error.message);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, email: email, password: pass })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Registration failed');
        }
        alert('Registration successful! Please login.');
        showLogin();
    } catch (error) {
        alert(error.message);
    }
});

async function fetchAndRenderQueue() {
    try {
        const response = await authFetch(`${API_URL}/albums`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const albums = await response.json();

        albumListDiv.innerHTML = '';
        albums.forEach(album => {
            const albumItem = document.createElement('div');
            albumItem.className = `album-item ${album.priority ? 'priority-asap' : ''}`;

            const priorityText = album.priority ? 'Listen First' : 'Listen Later';
            const priorityButtonClass = album.priority ? 'priority-asap' : '';

            let yearText = album.year == 0 ? 'N/A' : album.year;

            albumItem.innerHTML = `
                <div class="album-details">
                    <span class="album-title">${album.title}</span>
                    <span class="album-artist">${album.artist}</span>
                    <span class="album-meta">Year: ${yearText} | Format: ${album.listen_format}</span>
                </div>
                <div class="album-controls">
                    <button class="priority-toggle-btn ${priorityButtonClass}" onclick="togglePriority('${album.id}')">${priorityText}</button>
                    <button class="listened-btn" onclick="markAsListened('${album.id}', '${album.title.replace(/'/g, "\\'")}')">Listened</button>
                    <button class="edit-btn" onclick="startEdit('${album.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteAlbum('${album.id}')">Remove</button>
                </div>
            `;
            albumListDiv.appendChild(albumItem);
        });
    } catch (error) {
        console.error("Failed to fetch queue:", error);
    }
}

async function fetchAndRenderListened() {
    try {
        const response = await authFetch(`${API_URL}/listened-albums`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const listenedAlbums = await response.json();
        
        listenedAlbumListDiv.innerHTML = '';
        listenedAlbums.forEach(album => {
            const listenedItem = document.createElement('div');
            listenedItem.className = 'listened-item';
            
            let yearText = album.year == 0 ? 'N/A' : album.year;

            listenedItem.innerHTML = `
                <div class="album-details">
                    <span class="album-title">${album.title}</span>
                    <span class="album-artist">${album.artist}</span>
                    <span class="album-meta">Year: ${yearText} | Format: ${album.listen_format}</span>
                </div>
                <div class="rating-display">
                    <span>${album.rating}/10</span>
                </div>
            `;
            listenedAlbumListDiv.appendChild(listenedItem);
        });
    } catch (error) {
        console.error("Failed to fetch listened albums:", error);
    }
}

async function markAsListened(albumId, title) {
    let rating;
    while (true) {
        const ratingInput = prompt(`You listened to "${title}"! Please give it a rating from 1 to 10.`);
        if (ratingInput === null) return;
        rating = parseFloat(ratingInput);
        if (!isNaN(rating) && rating >= 1 && rating <= 10) break;
        alert("Invalid rating. Please enter a number between 1 and 10.");
    }
    try {
        const response = await authFetch(`${API_URL}/albums/${albumId}/mark-as-listened`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: rating })
        });
        if (!response.ok) throw new Error('Failed to mark album as listened.');
        fetchAndRenderQueue();
        fetchAndRenderListened();
    } catch (error) {
        console.error("Error marking as listened:", error);
    }
}

async function startEdit(albumId) {
    try {
        const response = await authFetch(`${API_URL}/albums/${albumId}`);
        if (!response.ok) throw new Error('Failed to fetch album details');
        const album = await response.json();
        
        document.getElementById('title').value = album.title;
        document.getElementById('artist').value = album.artist;
        document.getElementById('year').value = album.year == 0 ? '' : album.year;
        document.getElementById('listen_format').value = album.listen_format;
        document.getElementById('priority').checked = album.priority;
        
        editAlbumId = albumId;
        document.getElementById('form-title').innerText = `Edit Album: ${album.title}`;
        document.getElementById('submit-btn').innerText = 'Update Album';
        document.getElementById('cancel-edit-btn').style.display = 'block';
    } catch (error) {
        console.error("Error starting edit:", error);
    }
}

function cancelEdit() {
    editAlbumId = undefined;
    addAlbumForm.reset();
    document.getElementById('form-title').innerText = `Add to Queue`;
    document.getElementById('submit-btn').innerText = 'Add Album';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

async function deleteAlbum(albumId) {
    if (!confirm('Are you sure you want to remove this album?')) return;
    try {
        await authFetch(`${API_URL}/albums/${albumId}`, { method: 'DELETE' });
        fetchAndRenderQueue();
    } catch (error) {
        console.error("Error deleting album:", error);
    }
}

async function togglePriority(albumId) {
    try {
        await authFetch(`${API_URL}/albums/${albumId}/priority`, { method: 'PATCH' });
        fetchAndRenderQueue();
    } catch (error) {
        console.error("Error updating priority:", error);
    }
}

addAlbumForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const yearInput = document.getElementById('year').value;
    const yearValue = yearInput === '' ? 0 : parseInt(yearInput);
    const albumData = {
        title: document.getElementById('title').value,
        artist: document.getElementById('artist').value,
        year: yearValue,
        listen_format: document.getElementById('listen_format').value,
        priority: document.getElementById('priority').checked
    };

    try {
        if (editAlbumId) {
            const response = await authFetch(`${API_URL}/albums/${editAlbumId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(albumData)
            });
            if (!response.ok) throw new Error('Failed to update album');
            cancelEdit();
        } else {
            const response = await authFetch(`${API_URL}/albums`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(albumData)
            });
            if (!response.ok) throw new Error('Failed to create album');
            addAlbumForm.reset();
        }
        fetchAndRenderQueue();
    } catch (error) {
        console.error("Error saving album:", error);
    }
});
