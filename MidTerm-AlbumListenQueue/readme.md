 # MidTerm Album Listen Queue

  This application is designed to manage a personalized album listening queue. Users can track albums they want to hear,
  mark them as listened, and provide ratings. The program features a FastAPI backend integrated with MongoDB for
  persistent storage and a responsive HTML/CSS/JavaScript frontend.

  ### Key Transitions: MongoDB & Auth
   - The program now has persistent storage, authentication, and pairing data with users

  ## Backend Components

  ### Main (main.py)
  Initializes the FastAPI application, includes the API routers, and serves the static frontend files. It also handles
  basic routing for the home page.

  ### Authentication (auth.py)
  Handles the security logic of the app, including:
   - Password hashing and verification.
   - JWT token generation and validation.
   - Dependency injection to retrieve the current_user for protected routes.
   - Establishes the connection to the MongoDB client.

  ### Models (model.py)
  Defines the Pydantic schemas used for data validation and serialization:
   - User Models: Handles registration, login, and token data.
   - Album Models: Defines the structure for albums in the queue, uses PyObjectId to help in trasition to Mogodb
   - Serialization: Uses Pydantic V2 validation_alias to ensure the frontend receives standard id fields while the
     backend communicates with MongoDB's _id.

  ### API (api.py)
  Implements the CRUD (Create, Read, Update, Delete) operations. All album endpoints are now protected, requiring a
  valid login token to access. It manages:
   - User registration and login.
   - Moving albums from the "Queue" to the "Listened" collection with a rating.
   - Priority toggling and album editing.

 ### Configuration (config.py & .env)
  Manages environment variables such as the MongoDB URI and Secret Key for JWT.

##  Frontend Components

 ### index.html
  Provides the structure added (Login/Register) to existing program

  ### style.css
  Defines the visual aesthetic, heavily inspired by the clean and modern layout of the YouTube Music interface.

 ### script.js
   - Communicates with the FastAPI backend using fetch and authFetch (helper for sending JWT headers).
   - Manages local storage for user tokens to keep sessions active.
   - renders the album queue and listened list.
   - Implements UI logic for editing, deleting, and rating albums, including "N/A" handling for missing release years.

## extra notes
### image of need login window:
<img width="958" height="750" alt="image" src="https://github.com/user-attachments/assets/f66d6fb0-75fa-4ae6-89d3-d138089efbcc" />

### New window appearance:

<img width="1340" height="906" alt="image" src="https://github.com/user-attachments/assets/3444f4ec-d033-4af6-a615-069a28ecfe73" />

### MongoDB end of App:

<img width="1546" height="356" alt="image" src="https://github.com/user-attachments/assets/d54151f5-5ecd-43ae-b01f-d6be369f40fa" />

