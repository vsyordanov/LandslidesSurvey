<h4 align="center">
<img src="https://github.com/epessina/LandslidesSurvey/blob/master/App/screens/logo.png" width="144" alt="Logo">
</h4>

# LandslidesSurvey

### Table of Contents

-  [What is LandlidesSurvey?](#what-is-landlidessurvey)
-  [Technologies](#technologies)
-  [Installation](#installation)
-  [Demo](#demo)
-  [Next features](#next-features)
-  [Technical difficulties](#technical-difficulties)
-  [License](#license)


## What is LandlidesSurvey?

LandslidesSurvey is a *cross-platform mobile application* that allows users with any level of competence to **map
landslides** on the field in an easy and guided way.

All the collected data are stored in a database through a **publicly open API** that provides endpoints for retrieving,
inserting and modifying the landslides. 

### Features

- Secure authentication method through [Oauth 2.0](https://oauth.net/2/) protocol.
- User's position always visible on a map.
- Possibility to insert new landslides in the system through a flow of questions (type of hazard, presence of
vegetation, monitoring systems in the area, picture of the landslide, etc.).
- Two different modes: *simple* and *expert*. Users with little to no geological background can use the simple mode to
answer fewer and less detailed questions, while expert mode allows a complete identification and description of the
phenomena.
- Possibility to update or delete mapped landslides.
- Application usable also offline with the possibility to temporarily save the data in the local storage and later sync
them with the main database.


## Technologies

### Client

HTML5, SCSS and JavaScript code wrapped with [Apache Cordova](https://cordova.apache.org/) to create a native,
cross-platform mobile application.

#### Dependencies

- [jQuery](https://jquery.com/) 
- [Leaflet](https://leafletjs.com/)
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- [i18next](https://www.i18next.com/)
- [Babel](https://babeljs.io/)

### Server

RESTFull API written using [Node.js](https://nodejs.org/it/) and [Express.js](https://expressjs.com/it/).

### Database

[MongoDB](https://www.mongodb.com/).


## Installation

### Android

The minimum version required is **Android 7.0 (API level 24)**.

1. Download [LandslidesSurvey-x.x.x.apk](https://github.com/epessina/LandslidesSurvey/releases).
2. Place the file in your phone.
3. Install the apk.
4. Done!

### iOS

Coming soon...


## Demo

#### Login screen

<img src="https://github.com/epessina/LandslidesSurvey/blob/master/App/screens/01-login.png" width="250" alt="Login screen">

The login screen allows to:
- login into the system;
- navigate to the registration page
- reset the password.

---

#### Map screen

<img src="https://github.com/epessina/LandslidesSurvey/blob/master/App/screens/04-map.png" width="250" alt="Map screen">

1. **Map**. Centered on the user's position, it can be moved and zoomed freely.
2. **User marker**. Shows the current position of the user. It can be moved if the location is not accurate.
3. **Remote landslide marker**. Shows a mapped landslide that is saved remotely on the main database. A click
on one of those markers opens a screen that shows the information about the correspondent landslide and allows to delete
or modify it.
4. **Local landslide marker**. Works like the remote one but shows a landslide that is saved in the local database.
5. **Settings button**. Opens the application settings.
6. **Sync button**. Transfers on the main database all the landslides saved in the local one. 
7. **GPS button**. Centers the map and the user marker on the current location of the user.
8. **New landslide button**. Opens the screen that allows to insert a new landslide.

---

#### Insert screen

<img src="https://github.com/epessina/LandslidesSurvey/blob/master/App/screens/06-insert-simple.png" width="250" alt="Insert screen">

Simple version of the insert screen. From here the user can insert all the details about a new landslide and save it in
the database.

The only required fields are the landslide type and a photo of the area.


## Next features

##### Make all the landslides accessible to every user

Right now a user can only see the landslides he has mapped. In future releases we will add the possibility to
visualize and download also the data inserted by other users.

- Create the proper route on the server.
- (Create a system of keys to limit the access to the API form third party applications.)
- Add in the application the possibility to show or hide the data of the other users.
- Limit the number of markers visualized based on the map boundaries.
- Add the possibility to download the data in JSON format.


##### Add satellite-based landslide detection

Apply state of the art remote sensing techniques for landslide detection. A new entry from the application will activate background server-based processing using optical and radar satellite images for the current location.

-	A comparison with local landslide inventory (if available) will be performed for preliminary confirmation whether the entry is new or existing. If new, the server will return a message to the user asking for additional photos of the landslide.
- Change detection methodologies will be implemented: differences in products derived from optical satellite images (e.g. NDVI) and radar satellite images (e.g. Land cover).
- Implementing coherence change detection based on radar satellite data and machine learning techniques for landslide detection.
- Final comparison between the user entry and EO derived product will be performed, notifying the user and applying a note to the entry, with the consistency of all observations.


##### Implement susceptibility mapping

An option for generating a susceptibility map for a certain area will be added, based on machine learning approaches.

- The user will be notified whether the available landslide inventory and other satellite derived products are sufficient for such mapping.
-	Generating products derived from optical and radar images related to landslide susceptibility mapping.
-	Option for uploading additional data which can be helpful for the susceptibility analysis (e.g. geological map, elevation data etc.)
-	Notifying the user for the accuracy of the map.


##### Improve the possibility to insert picture of the landslide

A proper visual documentation of the site is key for a good analysis of the phenomena. So we plan to improve the photo
mechanism in the following ways.

- Add the possibility to take up to three photo of the hazard.
- Register the orientation of the phone when the photo is taken.
- Save the inclination of the phone when the photo is taken.


##### Enhance the offline usability

The application is usable offline, but if no Internet connection is available the map can't load,  posing a usability
issue.

What we plan to do is to add the possibility to select an area of the map and cache the tiles so that they will be
displayed also in absence of connection.


##### Improve the documentation

The code is entirely commented, but we plan to extract those comments to create a proper documentation.

- Using [JSDoc](https://github.com/jsdoc/jsdoc) extract the documentation of the client from the source code.
- Create the API documentation using [APIDoc](http://apidocjs.com/).


##### Add more languages


## Technical difficulties

In this section are highlighted some of the technical difficulties which have emerged during the development, together
with the solutions we came up with.


##### Singleton pattern

To make the code more structured, we wanted to create a class for each one of the *Activities* of the application.
To avoid conflicts, however, it was crucial to guarantee that at any time only one instance of a certain Activity was
instantiated.

To solve this problem we have decided to implement the *Singleton pattern* by not using the constructor of the class
directly and defining a public static method that returns the sole instance of the class. In this way, the instantiation
of the class is restricted and only one instance can exist at any time. 

The implementation for a generic Activity is shown below:

```javascript
class Singleton {

    static _instance;

    // The constructor should never be called directly
    constructor(){
        // Initialization of the activity...
    }
   
    static getInstance() {
        if (!Singleton._instance)
            Singleton._instance = new Singleton();
        
        return Singleton._instance;
  	}
  	
}

let first  = new Singleton();
let second = new Singleton();

console.log(first === second); // Output: true
```



##### Photo saved in cache

Cordova by default saves all the photo taken with the camera in the *cache* folder of the application. This is not a
problem if the landslide is uploaded to the server. However, if the entry is saved locally, there is the chance that the
cache is cleaned before the user synchronizes the databases causing an error, since the photo cannot found anymore. 

The solution we came up with consists in moving the photos of the local landslides to the "image" folder in the private
data storage within the application's sandbox. In this way, the photo cannot be deleted by the system and is not
directly accessible by the user.

The method that performs this task is `moveImage(imageUrl)` in `App/www/js/namespace/utils.js`. Here are reported just
the lines that performs the task.

```javascript
window.resolveLocalFileSystemURL(
    imageUrl,
    fileEntry => {
            utils.getLocalDirectory() // Returns the directory in which the file has to be moved
                .then(dir => { fileEntry.moveTo(dir, fileEntry.name, file => onSuccess(file), err => onError(err)) })
                .catch(err => onError(err)) 
    },
    err => onError(err)
);
```


##### Database inconsistency on sign up error  

On the server side an issue we had to face was a possible misbehaviour during the sign up procedure. The steps that the
system performs are the following:

1. validate the data sent by the client;
2. encrypt the password;
3. save the new user into the database;
4. send a confirmation email to the new user's address;
5. send back a successful response.

The problem is that, if an error occurs between point 3 and point 4, we end up with a user saved in the database who
has not received a confirmation email. Therefor, the user cannot login with the account, since it is not confirmed, and
he cannot create a new, since the mail is already registered.

The solution of this problem can be seen in the method `signup` of `Server/controllers/auth.js`. It consists in creating
a temporary variable `newUser` where the newly create user is stored after point 3. Then. the catch block looks like this:

 ```javascript
[...]
    .catch(err => {
       
        [...]
        
        if (!newUser) {
            next(err);
            return;
        }
        
        console.log("User already created. Rolling back...");
        
        User.findByIdAndRemove(newUser._id)
            .then(() => onSuccess())
            .catch(err => onError());
        
    });
 ```




## License
[MIT](https://choosealicense.com/licenses/mit/) © [Edoardo Pessina](edoardo2.pessina@mail.polimi.it)