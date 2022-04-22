"use strict";

let app;

$(() => document.addEventListener("deviceready", () => app = new App(), false));


/**
 *  Main activity of the application. It starts the whole system as soon as the DOM is fully loaded.
 *
 * @author Edoardo Pessina
 */
class App {

    static get appLanguage() {

        const localStorageLng = localStorage.getItem("lng");
        console.log("Local stored language: ", localStorageLng);
        if (localStorageLng)
            return localStorageLng;

        const phoneLang = navigator.language;
        console.log("Phone language: ", phoneLang);
		if (phoneLang === "it" || phoneLang === "it-IT")
            return "it";
		else
			return "en";
		
        if (phoneLang === "vi" || phoneLang === "vi-VN")
            return "vi";
		else
			return "en";
	
    }

    /** Flag that states the application is in expert mode. */
    static get isExpertMode() { return localStorage.getItem("mode") === "true" };

    /** The name of the local database. */
    static get localDbName() { return "LandslideSurvey" };

    /** The current version of the local database. */
    static get localDbVersion() { return 1 }


    /**
     * Creates and initializes the activity as well as the internationalization service.
     *
     * @constructor
     */
    constructor() {

        // If the mode is not stored in the local storage, set it to false
        if (!localStorage.getItem("mode")) localStorage.setItem("mode", "false");

        // Flag that states if the position watcher has to be reattached after a "pause" event
        this._toReattachPositionWatcher = false;

        // The number of time the back button has been sequentially pressed
        this._backPressedCount = 0;

        // Flag that states if the user is using the application as a guest (i.e. no internet connection so no login)
        this.isGuest = false;


        // Array with the stack of activities currently open
        this.activityStack = [];


        // Attach the function to be fired when a "pause" or a "resume" event occurs
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);

        // Add a listener for the click of the black button
        document.addEventListener("backbutton", () => this.onBackPressed(), false);

        // Initialize the local database
        this.initLocalDb()
            .then(() => {

                // Initialize the internationalization service
                this.initInternationalization();

            })
            .catch(() => {

                // Set the db to null
                this.db = null;

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.openLocalDbError"), i18next.t("dialogs.btnOk"));

                // Initialize the internationalization service
                this.initInternationalization();

            });

    }


    /** Defines the behaviour of the back button for the whole application. */
    onBackPressed() {

        // If any loader or alert dialog is open, return
        if (utils.isLoaderOpen || utils.isAlertOpen) return;

        // If the image screen is open
        if (utils.isImgScreenOpen) {

            // Close the image screen
            utils.closeImgScreen();

            // Return
            return;

        }

        // Perform the "onBackPressed" method of the last activity in the stack
        app.activityStack[app.activityStack.length - 1].onBackPressed();

    }


    /** Opens the first activity based on the authentication status. */
    open() {

        // If there is not a valid session stored, open the login page
        if (!LoginActivity.getInstance().getAuthStatus()) LoginActivity.getInstance().open();

        // If there is a valid session in storage, open the map
        else MapActivity.getInstance().open();

        // Hide the splash screen
        $("#splash").hide();

    }


    /** Initializes the internationalization service using i18next. */
    initInternationalization() {

        console.log("Setting language to: ", App.appLanguage);

        // Initialize the internationalization service
        i18next
            .use(i18nextXHRBackend)
            .init({
                lng        : App.appLanguage,
                fallbackLng: "en",
                ns         : "general",
                defaultNS  : "general",
                backend    : { loadPath: "./locales/{{lng}}/{{ns}}.json" }
            })
            .then(() => {

                // Attach the function to be fired when the language is changed
                i18next.on("languageChanged", () => console.log(`lng changed to ${i18next.language}`));

                // Initialize the jQuery plugin
                jqueryI18next.init(i18next, $);

                // Translate the body
                $("body").localize();

                // Open the first  activity
                this.open();

            });

    }


    /** Initializes the local database using the IndexedDB API. */
    initLocalDb() {

        // Initialize the database variable
        this.db = null;

        return new Promise((resolve, reject) => {

            // Create an open request
            const dbOpenRequest = window.indexedDB.open(App.localDbName, App.localDbVersion);

            // Fired if an error occurs
            dbOpenRequest.onerror = err => {

                console.error("Error opening the db", err);

                // Reject the promise
                reject();

            };

            // Fired if the opening is successful
            dbOpenRequest.onsuccess = () => {

                console.log("Db opened");

                // Save the result in the database variable
                this.db = dbOpenRequest.result;

                // Resolve the promise
                resolve();

            };


            // Fired if the db needs to be upgraded or created
            dbOpenRequest.onupgradeneeded = () => {

                console.log("Upgrading or creating db...");

                // Save the result in the database variable
                this.db = dbOpenRequest.result;

                // Fired if an error occurs
                this.db.onerror = err => {

                    console.error("Error upgrading or creating the db", err);

                    // Reject the promise
                    reject();

                };


                // Create a new object store
                const objectStore = this.db.createObjectStore("landslides", { keyPath: "_id" });

                // Fired if an error occurs
                objectStore.transaction.onerror = err => {

                    console.error("Error creating the object store", err);

                    // Alert the user
                    // utils.createAlert("", i18next.t("dialogs.createLocalDbError"), i18next.t("dialogs.btnOk"));

                    // Reject the promise

                    reject();

                };

                // Fired if the creation is successful
                objectStore.transaction.oncomplete = () => {

                    console.log("Object store created");

                    // Resolve the promise
                    resolve();

                }

            }

        });

    }


    /** When the application is paused, it detaches the position watcher. */
    onPause() {

        console.log("onPause");

        // If an instance of MapActivity has already been created
        if (MapActivity.hasInstance()) {

            // If the position watcher was attached before the pause event
            if (MapActivity.getInstance().isPositionWatcherAttached) {

                // Set the flag to true
                app._toReattachPositionWatcher = true;

                // Detach the position watcher
                MapActivity.getInstance().detachPositionWatcher();

            }

        }

    }

    /** When the application is resumed, it re-attaches the position watcher. */
    onResume() {

        console.log("onResume");

        // If the position watcher has to be re-attached
        if (app._toReattachPositionWatcher) {

            // Check if the gps is on and eventually attach the position watcher
            MapActivity.getInstance().checkGPSOn(() => MapActivity.getInstance().attachPositionWatcher());

            // Set the flag to false
            app._toReattachPositionWatcher = false;

        }

    }

}
