# MidTerm Album Listen Queue
This program is design to create an album Queue that gives albums to listen to, as well as review list when the album
is listened to. The program uses FastAPI on the backend of the program, javascript and html for the frontend. The program allows users the Create, Read, Update and Delete albums in their Queue. The user gives the album title, artist, year (optional), format (digital,CD etc.) and the priority of listening and it is added the the database.

## Backend
### Main
this simply initializes the app with its FileResponse router and mounts the app to frontend

### Database
Database creates the lists for each album queue and listened as well as default entries for reference

### model
model defines 4 class models, Album for the album list, AlbumCreate for the creating of an album, ListenedAlbum for the listen Album list and AlbumRating which simply holds the albym rating so only the rating needs to be sent in the case of rating an album.

## api
api implements CRUD operations for the Album Queue database, as well as add and get operations for the ListenedAlbum database.


## Frontend
### index.html 
The html file implements the base structure of the frontend and calls the css file and java script 

### style.css
style defines the look the of html objects and is heavily based around the youtube music interface 

### script.js
the script file communicates with the backend of the program using the fetch to call for data. The script renders all the entries given from the database and injects them into the html. It implements the logic for each button, such as the edit functionality and prepares and sends the data to the backend to perform the operation, then updates the frontend accordingly. the script also includes small logic check for sentinel value of 0 and displays N/A if a year was not given.

# Extra notes
Images of the frontend are shown below 

