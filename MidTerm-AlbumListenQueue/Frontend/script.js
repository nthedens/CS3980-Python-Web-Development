/* script.js */

const API_URL = 'http://127.0.0.1:8000';

const albumListDiv = document.getElementById('album-list');
const listenedAlbumListDiv = document.getElementById('listened-album-list');
const addAlbumForm = document.getElementById('add-album-form');
//track if currently editing the album
let editAlbumId = undefined

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderQueue();
    fetchAndRenderListened();
});
async function fetchAndRenderQueue() {
 try {
    const response = await fetch(`${API_URL}/albums`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const albums = await response.json()

    // inital declatraation 
    albumListDiv.innerHTML = ''

    // run through each album in database for listening
    albums.forEach(album => {
        const albumItem = document.createElement('div');

        // if priority adds priority asap to div class
        albumItem.className =`album-item ${album.priority ? 'priority-asap' : ''}`;

        // starting text
        const priorityText =album.priority ? 'Listen First' : 'Listen Later';
        const priorityButtonClass = album.priority ? 'priority-asap' : '';

        // mark not applicable if year is 0/ not given
        let yearText= album.year;
        if (album.year ==0){
            yearText = 'N/A';
        }

        albumItem.innerHTML = `
            <div class="album-details">
                <span class="album-title">${album.title}</span>
                <span class="album-artist">${album.artist}</span>
                <span class="album-meta">Year: ${yearText} | Format: ${album.listen_format}</span>
            </div>
            <div class="album-controls">
                <button class="priority-toggle-btn ${priorityButtonClass}" onclick="togglePriority(${album.id})">${priorityText}</button>
                <button class="listened-btn" onclick="markAsListened(${album.id}, '${album.title.replace(/'/g, "\\'")}')">Listened</button>
                <button class="edit-btn" onclick="startEdit(${album.id})">Edit</button>
                <button class="delete-btn" onclick="deleteAlbum(${album.id})">Remove</button>
            </div>
                `;
                albumListDiv.appendChild(albumItem);
           
        


        
    });
}catch (error) {
            console.error("Failed to fetch queue:", error);
            albumListDiv.innerHTML = '<p style="color: red;">Could not load listening queue.</p>';

 }
}


 async function fetchAndRenderListened() {
    try { 
        const response = await fetch(`${API_URL}/listened-albums`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const listenedAlbums = await response.json()
        
        listenedAlbumListDiv.innerHTML= '';

        listenedAlbums.forEach(album =>{
           const listenedItem = document.createElement('div');
           listenedItem.className = 'listened-item';
           

        // mark not applicable if year is 0/ not given
        let yearText= album.year;
        if (album.year ==0){
            yearText = 'N/A';
        }

        listenedItem.innerHTML =`
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
            const response = await fetch(`${API_URL}/albums/${albumId}/mark-as-listened`, {
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
            const response = await fetch(`${API_URL}/albums/${albumId}`);
            if (!response.ok) throw new Error('Failed to fetch album details');
            const album = await response.json();

            document.getElementById('title').value = album.title;
            document.getElementById('artist').value = album.artist;

            let yearValue = album.year;
            if (album.year == 0) {
                yearValue = '';
            }
            document.getElementById('year').value = yearValue;

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

    function cancelEdit(){
        //reset variable
        editAlbumId = undefined;

        addAlbumForm.reset();
        document.getElementById('form-title').innerText = `Add to Queue`;
        document.getElementById('submit-btn').innerText = 'Add Album';
        document.getElementById('cancel-edit-btn').style.display = 'none';
    }



    async function deleteAlbum(albumId) {
        if (!confirm('Are you sure you want to remove this album')) return;
        try {
            await fetch(`${API_URL}/albums/${albumId}`,{method: 'DELETE'});
            fetchAndRenderQueue();
        }catch(error){
            console.error("Error deleteing album:", error);
        }
        
    }

    async function togglePriority(albumId) {
        try{
            await fetch(`${API_URL}/albums/${albumId}/priority`, {method: 'PATCH'});
            fetchAndRenderQueue();
        }catch(error){
            console.error("Error updating priority:", error)
        }
        
    }
