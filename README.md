<h4 align="center">
<img src="https://github.com/epessina/LandslidesSurvey/blob/master/App/screens/logo.png" width="144" alt="Logo">
</h4>

# LandslidesSurvey

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

1. Download [LandslidesSurvey-x.x.x.apk](https://github.com/epessina/LandslidesSurvey/tree/master/App/releases).
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


## License
[MIT](https://choosealicense.com/licenses/mit/) © [Edoardo Pessina](edoardo2.pessina@mail.polimi.it)