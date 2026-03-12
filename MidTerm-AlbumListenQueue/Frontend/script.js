/* script.js */

const API_URL = 'http://127.0.0.1:8000';

const albumListDiv = document.getElementById('album-list');
const listenedAlbumListDiv = document.getElementById('listened-album-list');
const addAlbumForm = document.getElementById('add-album-form');
//track if currently editing the album
// undefined in add mode
let editAlbumId = undefined

// on load, fetch all data
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderQueue();
    fetchAndRenderListened();
});

// create queue and buttons
async function fetchAndRenderQueue() {
 try {
    const response = await fetch(`${API_URL}/albums`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const albums = await response.json()

    // clear and re render
    albumListDiv.innerHTML = ''

    // run through each album in database for listening
    albums.forEach(album => {
        const albumItem = document.createElement('div');

        // if priority adds priority and highlights
        albumItem.className =`album-item ${album.priority ? 'priority-asap' : ''}`;

        // starting text
        const priorityText =album.priority ? 'Listen First' : 'Listen Later';
        const priorityButtonClass = album.priority ? 'priority-asap' : '';

        // mark not applicable if year is 0/N/A not given
        let yearText= album.year;
        if (album.year ==0){
            yearText = 'N/A';
        }
        // create new entry on page and add its controls
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


        // API gives listens albumed sorting by highest rating
        listenedAlbums.forEach(album =>{
           const listenedItem = document.createElement('div');
           listenedItem.className = 'listened-item';
           

        // mark not applicable if year is 0/ not given
        let yearText= album.year;
        if (album.year ==0){
            yearText = 'N/A';
        }
        // displayed reviewed albums
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

    // mark when an album is complete and get rating
    async function markAsListened(albumId, title) {
        let rating;
        // loop until user gives rating 1-10 or cancels
        while (true) {
            const ratingInput = prompt(`You listened to "${title}"! Please give it a rating from 1 to 10.`);
            if (ratingInput === null) return; 

            rating = parseFloat(ratingInput);
            if (!isNaN(rating) && rating >= 1 && rating <= 10) break;
            alert("Invalid rating. Please enter a number between 1 and 10.");
        }
        //post rating for album to rating database
        try {
            const response = await fetch(`${API_URL}/albums/${albumId}/mark-as-listened`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: rating })
            });
            if (!response.ok) throw new Error('Failed to mark album as listened.');

            // refresh lists (add album to one list, remove from the other)
            fetchAndRenderQueue();
            fetchAndRenderListened();
        } catch (error) {
            console.error("Error marking as listened:", error);
        }
    }

    async function startEdit(albumId) {
        // get details of album to edit 
        try {
            const response = await fetch(`${API_URL}/albums/${albumId}`);
            if (!response.ok) throw new Error('Failed to fetch album details');
            const album = await response.json();
            
            // put data in the current edit field
            document.getElementById('title').value = album.title;
            document.getElementById('artist').value = album.artist;
            
            // check if 0 blank if it is display blank
            let yearValue = album.year;
            if (album.year == 0) {
                yearValue = '';
            }
            document.getElementById('year').value = yearValue;

        
            document.getElementById('listen_format').value = album.listen_format;
            document.getElementById('priority').checked = album.priority;
            // swtich the id to edit id to maintain original id
            editAlbumId = albumId;
            // change text to task
            document.getElementById('form-title').innerText = `Edit Album: ${album.title}`;
            document.getElementById('submit-btn').innerText = 'Update Album';
            document.getElementById('cancel-edit-btn').style.display = 'block';
            
        } catch (error) {
            console.error("Error starting edit:", error);
        }
        
    }

    function cancelEdit(){
        //reset to add mode
        editAlbumId = undefined;

        addAlbumForm.reset();
        document.getElementById('form-title').innerText = `Add to Queue`;
        document.getElementById('submit-btn').innerText = 'Add Album';
        document.getElementById('cancel-edit-btn').style.display = 'none';
    }



    async function deleteAlbum(albumId) {
        if (!confirm('Are you sure you want to remove this album?')) return;
        try {
            await fetch(`${API_URL}/albums/${albumId}`,{method: 'DELETE'});
            fetchAndRenderQueue();
        }catch(error){
            console.error("Error deleting album:", error);
        }
        
    }

    async function togglePriority(albumId) {
        try{
            // flip priority, then send and update window
            await fetch(`${API_URL}/albums/${albumId}/priority`, {method: 'PATCH'});
            fetchAndRenderQueue();
        }catch(error){
            console.error("Error updating priority:", error)
        }
        
    }


addAlbumForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    
    const yearInput = document.getElementById('year').value;
    // blank =0-> N/A else take year
    const yearValue = yearInput === '' ? 0 : parseInt(yearInput);
    //pull data from user input boxes
    const albumData = {
        title: document.getElementById('title').value,
        artist: document.getElementById('artist').value,
        year: yearValue,
        listen_format: document.getElementById('listen_format').value,
        priority: document.getElementById('priority').checked
    };

    try {
        // Checks if editAlbumId is a number. Undefined evaluates to false.

         // EDIT MODE: if editing use put not post update the album
        if (editAlbumId) {
            
            //send textbox input to edit 
            const response = await fetch(`${API_URL}/albums/${editAlbumId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(albumData)
            });
            if (!response.ok) throw new Error('Failed to update album');
            cancelEdit(); // change to add mode when complete
        } else {
            // ADD MODE: POST Request add album
            const response = await fetch(`${API_URL}/albums`, {
                // send text box info to post to add album
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // change from object to string 
                body: JSON.stringify(albumData)
        
            });
            if (!response.ok) throw new Error('Failed to create album');
            addAlbumForm.reset(); // clear inputs when added
        }
        fetchAndRenderQueue(); //update windo
    } catch (error) {
        console.error("Error saving album:", error);
    }
    });


