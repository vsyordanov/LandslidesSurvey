"use strict";

/**
 * Unicode code converter: https://r12a.github.io/app-conversion/.
 * ISO 639-1 codes: http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes.
 */

let ln = {

    language: "en",

    init: function () {
        i18n.init({
            ns         : "general",
            lng        : "en",
            resGetPath : "locales/__ns__.__lng__.json",
            fallbackLng: "en",
            useCookie  : false
        }, function () {
            ln.getLanguage();
        });
    },

    getLanguage: function () {
        // navigator.globalization.getLocaleName(
        //     function (lang) {
        //         ln.language = lang.value.substring(0, 2);
        //         i18n.setLng(ln.language, function () {
        //             $("body").i18n();
        //         });
        //         init();
        //     },
        //     function (error) {
        //         console.log(error);
        //     }
        // );
        i18n.setLng("en-US", function () {
            $("body").i18n();
        });
        init();
    }

};
