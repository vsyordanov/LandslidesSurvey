"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var app;
$(function () {
  if (window.cordova) document.addEventListener("deviceready", function () {
    return app = new App();
  }, false);else app = new App();
});

var App = function () {
  _createClass(App, null, [{
    key: "isCordova",
    get: function get() {
      return window.cordova;
    }
  }, {
    key: "isExpertMode",
    get: function get() {
      return localStorage.getItem("mode") === "true";
    }
  }, {
    key: "localDbName",
    get: function get() {
      return "LandslideSurvey";
    }
  }, {
    key: "localDbVersion",
    get: function get() {
      return 1;
    }
  }]);

  function App() {
    var _this = this;

    _classCallCheck(this, App);

    if (!localStorage.getItem("mode")) localStorage.setItem("mode", "false");
    this._toReattachPositionWatcher = false;
    this._backPressedCount = 0;
    this.isGuest = false;
    document.addEventListener("pause", this.onPause, false);
    document.addEventListener("resume", this.onResume, false);

    if (App.isCordova) {
      document.addEventListener("backbutton", function () {
        console.log(_this);

        if (_this._backPressedCount === 0) {
          utils.logOrToast("Press again to leave", "short");
          _this._backPressedCount++;
          setInterval(function () {
            return _this._backPressedCount = 0;
          }, 2000);
        } else navigator.app.exitApp();
      }, false);
    }

    this.initLocalDb().then(function () {
      _this.initInternationalization();
    })["catch"](function () {
      _this.db = null;
      utils.createAlert("", i18next.t("dialogs.openLocalDbError"), i18next.t("dialogs.btnOk"));

      _this.initInternationalization();
    });
  }

  _createClass(App, [{
    key: "open",
    value: function open() {
      if (!LoginActivity.getInstance().getAuthStatus()) LoginActivity.getInstance().open();else MapActivity.getInstance().open();
      $("#splash").hide();
    }
  }, {
    key: "initInternationalization",
    value: function initInternationalization() {
      var _this2 = this;

      i18next.use(i18nextXHRBackend).init({
        lng: "en",
        fallbackLng: "en",
        ns: "general",
        defaultNS: "general",
        backend: {
          loadPath: "./locales/{{lng}}/{{ns}}.json"
        }
      }).then(function () {
        i18next.on("languageChanged", function () {
          return console.log("lng changed to ".concat(i18next.language));
        });
        jqueryI18next.init(i18next, $);
        $("body").localize();

        _this2.open();
      });
    }
  }, {
    key: "initLocalDb",
    value: function initLocalDb() {
      var _this3 = this;

      this.db = null;
      return new Promise(function (resolve, reject) {
        var dbOpenRequest = window.indexedDB.open(App.localDbName, App.localDbVersion);

        dbOpenRequest.onerror = function (err) {
          console.error("Error opening the db", err);
          reject();
        };

        dbOpenRequest.onsuccess = function () {
          console.log("Db opened");
          _this3.db = dbOpenRequest.result;
          resolve();
        };

        dbOpenRequest.onupgradeneeded = function () {
          console.log("Upgrading or creating db...");
          _this3.db = dbOpenRequest.result;

          _this3.db.onerror = function (err) {
            console.error("Error upgrading or creating the db", err);
            reject();
          };

          var objectStore = _this3.db.createObjectStore("landslides", {
            keyPath: "_id"
          });

          objectStore.transaction.onerror = function (err) {
            console.error("Error creating the object store", err);
            reject();
          };

          objectStore.transaction.oncomplete = function () {
            console.log("Object store created");
            resolve();
          };
        };
      });
    }
  }, {
    key: "onPause",
    value: function onPause() {
      console.log("onPause");

      if (MapActivity.hasInstance()) {
        if (MapActivity.getInstance().isPositionWatcherAttached) {
          app._toReattachPositionWatcher = true;
          MapActivity.getInstance().detachPositionWatcher();
        }
      }
    }
  }, {
    key: "onResume",
    value: function onResume() {
      console.log("onResume");

      if (app._toReattachPositionWatcher) {
        MapActivity.getInstance().checkGPSOn(function () {
          return MapActivity.getInstance().attachPositionWatcher();
        });
        app._toReattachPositionWatcher = false;
      }
    }
  }]);

  return App;
}();
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LoginActivity = function () {
  function LoginActivity() {
    var _this = this;

    _classCallCheck(this, LoginActivity);

    this.screen = $("#page--log-in");
    this.token = null;
    this.userId = null;
    var $authFooter = $(".auth-footer");
    window.addEventListener("keyboardWillShow", function () {
      return $authFooter.hide();
    });
    window.addEventListener("keyboardWillHide", function () {
      return $authFooter.show();
    });
    $("#link--reset-password").click(function () {
      if (!navigator.onLine) {
        _this.openOfflineDialog();

        return;
      }

      utils.switchActivity(ResetPasswordActivity.getInstance());
    });
    $("#btn--login").click(function () {
      if (!navigator.onLine) {
        _this.openOfflineDialog();

        return;
      }

      _this.login();
    });
    $("#link--register").click(function () {
      if (!navigator.onLine) {
        _this.openOfflineDialog();

        return;
      }

      utils.switchActivity(RegisterActivity.getInstance(), true, _this);
    });
  }

  _createClass(LoginActivity, [{
    key: "open",
    value: function open() {
      this.screen.show();
      if (!navigator.onLine) this.openOfflineDialog();
    }
  }, {
    key: "close",
    value: function close() {
      this.screen.scrollTop(0).hide();
      $("#field--login-email").val("");
      $("#field--login-password").val("");
    }
  }, {
    key: "getAuthStatus",
    value: function getAuthStatus() {
      var token = localStorage.getItem("token"),
          expireDate = localStorage.getItem("expireDate");
      if (!token || !expireDate) return false;

      if (new Date(expireDate) <= new Date()) {
        this.logout();
        return false;
      }

      this.token = token;
      this.userId = localStorage.getItem("userId");
      this.setAutoLogout(new Date(expireDate).getTime() - new Date().getTime());
      return true;
    }
  }, {
    key: "login",
    value: function login() {
      var _this2 = this;

      utils.openLoader();
      var email = $("#field--login-email").val(),
          password = $("#field--login-password").val();

      if (email === "" || password === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.validCredentials"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (resData) {
        _this2.token = resData.token;
        _this2.userId = resData.userId;
        localStorage.setItem("token", resData.token);
        localStorage.setItem("userId", resData.userId);
        var remainingMilliseconds = 24 * 60 * 60 * 1000,
            expireDate = new Date(new Date().getTime() + remainingMilliseconds);
        localStorage.setItem("expireDate", expireDate.toISOString());

        _this2.setAutoLogout(remainingMilliseconds);

        utils.switchActivity(MapActivity.getInstance(), true, _this2);
        utils.closeLoader();
      })["catch"](function (err) {
        console.error(err);
        $("#field--login-password").val("");
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.logOrToast(i18next.t("messages.login401"), "long");
            break;

          case 460:
            _this2.createResendEmailDialog();

            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }, {
    key: "createResendEmailDialog",
    value: function createResendEmailDialog() {
      var $alertOverlay = $("#alert-dialog-overlay");
      $alertOverlay.find(".dialog-title").html(i18next.t("auth.login.notVerifiedTitle"));
      $alertOverlay.find(".dialog-text").html("\n            <p>".concat(i18next.t("auth.login.notVerifiedMessage"), "</p>\n            <p class=\"dialog-link\" onclick=\"LoginActivity.getInstance().resendConfirmationEmail()\">\n                ").concat(i18next.t("auth.login.resendEmailLink"), "\n            </p>\n        "));
      $("#alert-first-button").html(i18next.t("dialogs.btnOk")).unbind("click").click(function () {
        return utils.closeAlert();
      });
      $alertOverlay.find(".dialog-wrapper").show();
      $alertOverlay.show();
    }
  }, {
    key: "resendConfirmationEmail",
    value: function resendConfirmationEmail() {
      utils.closeAlert();
      utils.openLoader();
      var email = $("#field--login-email").val();

      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/confirmation/resend"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        utils.closeLoader();
        utils.createAlert(i18next.t("auth.login.resendEmailSuccessTitle"), i18next.t("auth.register.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resendConfEmail404"), i18next.t("dialogs.btnOk"));
            break;

          case 409:
            utils.createAlert(i18next.t("dialogs.titleResendConfEmail409"), i18next.t("dialogs.resendConfEmail409"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resendConfEmail500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }, {
    key: "logout",
    value: function logout() {
      this.token = null;
      this.userId = null;
      localStorage.removeItem("token");
      localStorage.removeItem("expireDate");
      localStorage.removeItem("userId");
    }
  }, {
    key: "setAutoLogout",
    value: function setAutoLogout(milliseconds) {
      var _this3 = this;

      setTimeout(function () {
        _this3.logout();
      }, milliseconds);
    }
  }, {
    key: "openOfflineDialog",
    value: function openOfflineDialog() {
      var _this4 = this;

      utils.createAlert("", i18next.t("auth.login.loginGuest"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
        app.isGuest = true;
        utils.switchActivity(MapActivity.getInstance(), true, _this4);
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!LoginActivity._instance) LoginActivity._instance = new LoginActivity();
      return LoginActivity._instance;
    }
  }]);

  return LoginActivity;
}();

_defineProperty(LoginActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RegisterActivity = function () {
  function RegisterActivity() {
    var _this = this;

    _classCallCheck(this, RegisterActivity);

    this.disclaimer = $("#page--register-disclaimer");
    this.screen = $("#page--register");
    $("#btn--register-disclaimer-accept").click(function () {
      _this.screen.show();

      _this.disclaimer.scrollTop(0).hide();
    });
    $("#link--register-disclaimer-back").click(function () {
      utils.switchActivity(LoginActivity.getInstance());

      _this.disclaimer.scrollTop(0).hide();
    });
    $("#btn--register-done").click(function () {
      return _this.register();
    });
    $("#link--login").click(function () {
      return utils.switchActivity(LoginActivity.getInstance(), true, _this);
    });
    $("#register-age").change(function () {
      return utils.changeSelectorLabel("register-age", true);
    });
    $("#register-gender").change(function () {
      return utils.changeSelectorLabel("register-gender", true);
    });
    $("#register-occupation").change(function () {
      return utils.changeSelectorLabel("register-occupation", true);
    });
  }

  _createClass(RegisterActivity, [{
    key: "open",
    value: function open() {
      this.disclaimer.show();
    }
  }, {
    key: "close",
    value: function close() {
      this.screen.scrollTop(0).hide();
      $("#field--register-email").val("");
      $("#field--register-password").val("");
      $("#field--register-confirm-password").val("");
      utils.resetSelector("register-age");
      utils.resetSelector("register-gender");
      utils.resetSelector("register-occupation");
    }
  }, {
    key: "register",
    value: function register() {
      var _this2 = this;

      utils.openLoader();
      var email = $("#field--register-email").val(),
          password = $("#field--register-password").val(),
          confirmPassword = $("#field--register-confirm-password").val(),
          age = $("#register-age").val(),
          gender = $("#register-gender").val(),
          occupation = $("#register-occupation").val();

      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }

      if (password === "" || password.length < 8 || !/\d/.test(password.toString())) {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.weakPassword"), "long");
        return;
      }

      if (password !== confirmPassword) {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/signup"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirmPassword: confirmPassword,
          age: age,
          gender: gender,
          occupation: occupation
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        utils.closeLoader();
        utils.switchActivity(LoginActivity.getInstance(), true, _this2);
        utils.createAlert(i18next.t("auth.register.successTitle"), i18next.t("auth.register.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 409:
            utils.logOrToast(i18next.t("messages.register409"), "long");
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.register422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.register500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!RegisterActivity._instance) RegisterActivity._instance = new RegisterActivity();
      return RegisterActivity._instance;
    }
  }]);

  return RegisterActivity;
}();

_defineProperty(RegisterActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ResetPasswordActivity = function () {
  function ResetPasswordActivity() {
    var _this = this;

    _classCallCheck(this, ResetPasswordActivity);

    this.screen = $("#page--reset-pw");
    $("#btn--reset-pw-close").click(function () {
      return _this.close();
    });
    $("#btn--reset-pw-done").click(function () {
      return _this.resetPassword();
    });
  }

  _createClass(ResetPasswordActivity, [{
    key: "open",
    value: function open() {
      this.screen.show();
    }
  }, {
    key: "close",
    value: function close() {
      this.screen.scrollTop(0).hide();
      $("#field--reset-pw-email").val("");
    }
  }, {
    key: "resetPassword",
    value: function resetPassword() {
      var _this2 = this;

      utils.openLoader();
      var email = $("#field--reset-pw-email").val();

      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        _this2.close();

        utils.closeLoader();
        utils.createAlert(i18next.t("auth.login.resetPassword.successTitle"), i18next.t("auth.login.resetPassword.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resetPw404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resetPw500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!ResetPasswordActivity._instance) ResetPasswordActivity._instance = new ResetPasswordActivity();
      return ResetPasswordActivity._instance;
    }
  }]);

  return ResetPasswordActivity;
}();

_defineProperty(ResetPasswordActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var InfoActivity = function () {
  _createClass(InfoActivity, null, [{
    key: "dateOpts",
    get: function get() {
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      };
    }
  }]);

  function InfoActivity() {
    var _this = this;

    _classCallCheck(this, InfoActivity);

    this._screen = $("#page--info");
    this._placeholders = $("#page--info .placeholder");
    $("#info-close").click(function () {
      return _this.close();
    });
    $("#info-photo-thm").click(function () {
      utils.openImgScreen($(this).attr("src"));
    });
  }

  _createClass(InfoActivity, [{
    key: "open",
    value: function open(id, isLocal) {
      if (!isLocal && !navigator.onLine) {
        this.close();
        utils.createAlert("", i18next.t("dialogs.infoRemoteOffline"), i18next.t("dialogs.btnOk"));
        return;
      }

      if (isLocal) utils.createAlert("", i18next.t("dialogs.openLocalInfo"), i18next.t("dialogs.btnOk"));

      this._placeholders.addClass("ph-animate");

      this._screen.show();

      this.getLandslide(id, isLocal);
    }
  }, {
    key: "close",
    value: function close() {
      this._screen.scrollTop(0).hide();

      $("#page--info .ph-hidden-content").hide();

      this._placeholders.removeClass("ph-animate").show();

      $("#info-delete").hide();
      $("#info-edit").hide();
      $(".info-block").show();
      $("#info-createdAt .info-content").html("");
      $("#info-updatedAt .info-content").html("");
      $("#info-coordinates .info-content").html("");
      $("#info-coordinatesAccuracy .info-content").html("");
      $("#info-altitude .info-content").html("");
      $("#info-altitudeAccuracy .info-content").html("");
      $("#info-type .info-content").html("");
      $("#info-materialType .info-content").html("");
      $("#info-hillPosition .info-content").html("");
      $("#info-water .info-content").html("");
      $("#info-vegetation .info-content").html("");
      $("#info-mitigation .info-content").html("");
      $("#info-mitigationsList .info-content").html("");
      $("#info-monitoring .info-content").html("");
      $("#info-monitoringList .info-content").html("");
      $("#info-damages .info-content").html("");
      $("#info-damagesList .info-content").html("");
      $("#info-notes .info-content").html("");
      $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");
    }
  }, {
    key: "getLandslide",
    value: function getLandslide(id, isLocal) {
      var _this2 = this;

      landslide.get(id, isLocal).then(function (data) {
        $("#info-delete").show().unbind("click").click(function () {
          utils.createAlert("", i18next.t("dialogs.deleteConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
            utils.openLoader();
            landslide["delete"](id, isLocal, data.imageUrl).then(function () {
              utils.closeLoader();

              _this2.close();
            })["catch"](function () {
              utils.closeLoader();
            });
          });
        });
        $("#info-edit").show().unbind("click").click(function () {
          InsertActivity.getInstance().openPut(data, isLocal);

          _this2._screen.scrollTop(0);
        });

        _this2.show(data, isLocal);
      })["catch"](function () {
        _this2.close();
      });
    }
  }, {
    key: "show",
    value: function show(data, isLocal) {
      $(".info-block").show();

      if (!data.expert || isLocal && data.expert !== "true") {
        $("#info-hillPosition").hide();
        $("#info-vegetation").hide();
        $("#info-mitigationList").hide();
        $("#info-monitoring").hide();
        $("#info-monitoringList").hide();
        $("#info-damages").hide();
        $("#info-damagesList").hide();
        $("#info-notes").hide();
      } else {
          if (data.mitigation !== "yes") $("#info-mitigationList").hide();
          if (data.monitoring !== "yes") $("#info-monitoringList").hide();
          if (data.damages !== "directDamage") $("#info-damagesList").hide();
        }

      var _loop = function _loop(key) {
        if (data.hasOwnProperty(key)) $("#info-" + key + " .info-content").html(function () {
            var val = data[key];
            if (val === "") return "-";

            switch (key) {
              case "createdAt":
              case "updatedAt":
                return new Date(val).toLocaleDateString(i18next.language, InfoActivity.dateOpts);

              case "coordinates":
                return val[0] + ", " + val[1];

              case "coordinatesAccuracy":
              case "altitudeAccuracy":
                if (val === 0 || val === null) return i18next.t("info.unknown");
                return val + " " + i18next.t("info.accuracyUnit");

              case "altitude":
                if (val === -999) return i18next.t("info.unknown");
                return val + " " + i18next.t("info.altitudeUnit");

              case "mitigationList":
                if (val.length === 0) return "-";
                var mitigationContent = "<ul class='info-list'>";

                for (var i = 0; i < val.length; i++) {
                  mitigationContent += "<li>".concat(i18next.t("insert.mitigation.enum." + val[i].type), "</li>");
                }

                mitigationContent = mitigationContent + "</ul>";
                return mitigationContent;

              case "monitoringList":
                if (val.length === 0) return "-";
                var monitoringContent = "<ul class='info-list'>";

                for (var _i = 0; _i < val.length; _i++) {
                  monitoringContent += "<li>\n                                        ".concat(i18next.t("insert.monitoring.enum." + val[_i].type), " (").concat(i18next.t("insert.monitoring.enum." + val[_i].status), ")\n                                    </li>");
                }

                monitoringContent = monitoringContent + "</ul>";
                return monitoringContent;

              case "damagesList":
                if (val.length === 0) return "-";
                var damagesContent = "<ul class='info-list'>";

                for (var _i2 = 0; _i2 < val.length; _i2++) {
                  damagesContent = damagesContent + "<li>";
                  if (val[_i2].type === "other") damagesContent = damagesContent + val[_i2].specification;else damagesContent = damagesContent + i18next.t("insert.damages.enum." + val[_i2].type);
                  damagesContent = damagesContent + "</li>";
                }

                damagesContent = damagesContent + "</ul>";
                return damagesContent;

              case "notes":
                return val;

              default:
                return i18next.t("insert." + key + ".enum." + val);
            }
          });
      };

      for (var key in data) {
        _loop(key);
      }

      var photoSrc;
      if (isLocal) photoSrc = data.imageUrl;else photoSrc = "".concat(settings.serverUrl, "/").concat(data.imageUrl);
      $("#info-photo-thm").attr("src", photoSrc);

      this._placeholders.hide().removeClass("ph-animate");

      $("#page--info .ph-hidden-content").show();
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!InfoActivity._instance) InfoActivity._instance = new InfoActivity();
      return InfoActivity._instance;
    }
  }]);

  return InfoActivity;
}();

_defineProperty(InfoActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var InsertActivity = function () {
  function InsertActivity() {
    _classCallCheck(this, InsertActivity);

    this._screen = $("#page--insert");
    this._$photoThm = $("#photo-thm");
    this._lsId = null;
    this._isExpert = null;
    this._isLocal = null;
    this._oldPhoto = null;
    this._vals = {
      coordinates: "",
      coordinatesAccuracy: "",
      altitude: "",
      altitudeAccuracy: "",
      presence: "",
      type: "",
      materialType: "",
      hillPosition: "",
      water: "",
      vegetation: "",
      mitigation: "",
      mitigationList: [],
      monitoring: "",
      monitoringList: [],
      damages: "",
      damagesList: [],
      notes: "",
      photo: ""
    };
    this._newMitigationList = [];
    this._newMonitoringList = [];
    this._newDamagesList = [];
    this.initUI();
  }

  _createClass(InsertActivity, [{
    key: "open",
    value: function open() {
      if (this._lsId && this._isExpert || !this._lsId && App.isExpertMode) {
        $("#hill-position-request-wrapper").show();
        $("#vegetation-request-wrapper").show();
        $("#monitoring-request-wrapper").show();
        $("#damages-request-wrapper").show();
        $("#notes-request-wrapper").show();
      }

      this._screen.show();

      if (!this._lsId) {
        utils.createAlert("", i18next.t("dialogs.insert.positionAlert"), i18next.t("dialogs.btnOk"));
        this._vals.coordinates = MapActivity.getInstance().currLatLng;
        this._vals.coordinatesAccuracy = MapActivity.getInstance().currLatLngAccuracy;
        this._vals.altitude = MapActivity.getInstance().currAltitude;
        this._vals.altitudeAccuracy = MapActivity.getInstance().currAltitudeAccuracy;
      }
    }
  }, {
    key: "openPut",
    value: function openPut(ls, isLocal) {
      this._lsId = ls._id;
      this._isExpert = ls.expert === "true";
      this._isLocal = isLocal;
      this._vals.type = ls.type;
      this._vals.materialType = ls.materialType;
      this._vals.hillPosition = ls.hillPosition;
      this._vals.water = ls.water;
      this._vals.vegetation = ls.vegetation;
      this._vals.mitigation = ls.mitigation;
      this._vals.mitigationList = ls.mitigationList;
      this._vals.monitoring = ls.monitoring;
      this._vals.monitoringList = ls.monitoringList;
      this._vals.damages = ls.damages;
      this._vals.damagesList = ls.damagesList;
      this._vals.notes = ls.notes;
      if (isLocal) this._vals.photo = ls.imageUrl;else this._vals.photo = "".concat(settings.serverUrl, "/").concat(ls.imageUrl);
      this._oldPhoto = this._vals.photo;
      $("#ls-type-text").html(i18next.t("insert.type.enum." + this._vals.type));
      if (this._vals.materialType !== "") $("#material-type-text").html(i18next.t("insert.materialType.enum." + this._vals.materialType));
      if (this._vals.hillPosition !== "") $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + this._vals.hillPosition));
      if (this._vals.water !== "") $("#water-text").html(i18next.t("insert.water.enum." + this._vals.water));
      if (this._vals.vegetation !== "") $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + this._vals.vegetation));
      if (this._vals.mitigation !== "") $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + this._vals.mitigation));
      if (this._vals.monitoring !== "") $("#monitoring-text").html(i18next.t("insert.monitoring.enum." + this._vals.monitoring));
      if (this._vals.damages !== "") $("#damages-text").html(i18next.t("insert.damages.enum." + this._vals.damages));
      if (this._vals.notes !== "") $("#notes-text").html(i18next.t("insert.notes.editText"));

      this._$photoThm.find("img").attr("src", this._vals.photo).show();

      this._$photoThm.find("i").hide();

      this.open();
    }
  }, {
    key: "close",
    value: function close() {
      var _this = this;

      this._lsId = null;
      this._isExpert = null;
      this._oldPhoto = null;
      this._isLocal = null;

      this._screen.scrollTop(0).hide();

      Object.keys(this._vals).forEach(function (v) {
        return _this._vals[v] = "";
      });
      this._vals.mitigationList = [];
      this._vals.monitoringList = [];
      this._vals.damagesList = [];
      $("#hill-position-request-wrapper").hide();
      $("#vegetation-request-wrapper").hide();
      $("#monitoring-request-wrapper").hide();
      $("#damages-request-wrapper").hide();
      $("#notes-request-wrapper").hide();
      $("#ls-type-text").html(i18next.t("insert.type.defaultText"));
      $("#material-type-text").html(i18next.t("insert.materialType.defaultText"));
      $("#hill-position-text").html(i18next.t("insert.hillPosition.defaultText"));
      $("#water-text").html(i18next.t("insert.water.defaultText"));
      $("#vegetation-text").html(i18next.t("insert.vegetation.defaultText"));
      $("#mitigation-text").html(i18next.t("insert.mitigation.defaultText"));
      $("#monitoring-text").html(i18next.t("insert.monitoring.defaultText"));
      $("#damages-text").html(i18next.t("insert.damages.defaultText"));
      $("#notes-text").html(i18next.t("insert.notes.defaultText"));

      this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

      this._$photoThm.find("i").show();
    }
  }, {
    key: "initUI",
    value: function initUI() {
      var _this2 = this;

      $("#new-ls-close").click(function () {
        utils.createAlert("", i18next.t("dialogs.insert.confirmClose"), i18next.t("dialogs.insert.btnKeepEditing"), null, i18next.t("dialogs.insert.btnDiscard"), function () {
          _this2.close();
        });
      });
      $("#new-ls-done").click(function () {
        if (_this2._vals.type === "") {
          utils.logOrToast(i18next.t("messages.mandatoryLsType"), "long");
          return;
        }

        if (_this2._vals.photo === "") {
          utils.logOrToast(i18next.t("messages.mandatoryPhoto"), "long");
          return;
        }

        if (App.isExpertMode) {
          if (_this2._vals.mitigation !== "yes") _this2._vals.mitigationList = [];
          if (_this2._vals.monitoring !== "yes") _this2._vals.monitoringList = [];
          if (_this2._vals.damages !== "directDamage") _this2._vals.damagesList = [];
        }

        if (!_this2._lsId) {
          if (app.isGuest) {
            utils.createAlert("", i18next.t("dialogs.postGuest"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
              return _this2.postLocal();
            });
            return;
          }

          if (!navigator.onLine) {
            utils.createAlert("", i18next.t("dialogs.postOffline"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
              return _this2.postLocal();
            });
            return;
          }

          _this2.postRemote();
        } else {
            if (!_this2._isLocal) _this2.putRemote();else _this2.putLocal();
          }
      });
      $("#ls-type-request").click(function () {
        var toSelect = _this2._vals.type;
        if (_this2._vals.type === "") toSelect = "rockfall";
        $("input[name='type'][value='" + toSelect + "']").prop("checked", "true");

        _this2.openFullscreenDialog($("#dialog-ls-type"));
      });
      $("#ls-type-close").click(function () {
        return _this2.closeFullscreenDialog($("#dialog-ls-type"));
      });
      $("#ls-type-done").click(function () {
        _this2._vals.type = $("input[name='type']:checked").val();
        $("#ls-type-text").html(i18next.t("insert.type.enum." + _this2._vals.type));

        _this2.closeFullscreenDialog($("#dialog-ls-type"));
      });
      $("#material-type-request").click(function () {
        var toSelect = _this2._vals.materialType;
        if (_this2._vals.materialType === "") toSelect = "rock";
        $("input[name='materialType'][value='" + toSelect + "']").prop("checked", "true");

        _this2.openDialog($("#dialog-material-type"));
      });
      $("#material-type-cancel").click(function () {
        return _this2.closeDialog($("#dialog-material-type"));
      });
      $("#material-type-ok").click(function () {
        _this2._vals.materialType = $("input[name='materialType']:checked").val();
        $("#material-type-text").html(i18next.t("insert.materialType.enum." + _this2._vals.materialType));

        _this2.closeDialog($("#dialog-material-type"));
      });
      $("#hill-position-request").click(function () {
        var toSelect = _this2._vals.hillPosition;
        if (_this2._vals.hillPosition === "") toSelect = "atTheTop";
        $("input[name='hillPosition'][value='" + toSelect + "']").prop("checked", "true");

        _this2.openDialog($("#dialog-hill-position"));
      });
      $("#hill-position-cancel").click(function () {
        return _this2.closeDialog($("#dialog-hill-position"));
      });
      $("#hill-position-ok").click(function () {
        _this2._vals.hillPosition = $("input[name='hillPosition']:checked").val();
        $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + _this2._vals.hillPosition));

        _this2.closeDialog($("#dialog-hill-position"));
      });
      $("#water-request").click(function () {
        var toSelect = _this2._vals.water;
        if (_this2._vals.water === "") toSelect = "dry";
        $("input[name='water'][value='" + toSelect + "']").prop("checked", "true");

        _this2.openDialog($("#dialog-water"));
      });
      $("#water-cancel").click(function () {
        return _this2.closeDialog($("#dialog-water"));
      });
      $("#water-ok").click(function () {
        _this2._vals.water = $("input[name='water']:checked").val();
        $("#water-text").html(i18next.t("insert.water.enum." + _this2._vals.water));

        _this2.closeDialog($("#dialog-water"));
      });
      $("#vegetation-request").click(function () {
        var toSelect = _this2._vals.vegetation;
        if (_this2._vals.vegetation === "") toSelect = "grass";
        $("input[name='vegetation'][value='" + toSelect + "']").prop("checked", "true");

        _this2.openDialog($("#dialog-vegetation"));
      });
      $("#vegetation-cancel").click(function () {
        return _this2.closeDialog($("#dialog-vegetation"));
      });
      $("#vegetation-ok").click(function () {
        _this2._vals.vegetation = $("input[name='vegetation']:checked").val();
        $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + _this2._vals.vegetation));

        _this2.closeDialog($("#dialog-vegetation"));
      });
      $("#mitigation-request").click(function () {
        var toSelect = _this2._vals.mitigation;
        if (_this2._vals.mitigation === "") toSelect = "yes";

        if (App.isExpertMode || _this2._isExpert) {
          $("input[name='mitigationExpert'][value='" + toSelect + "']").prop("checked", "true");
          if (toSelect === "yes") $("#mitigations-wrapper").show();else $("#mitigations-wrapper").hide();
          _this2._newMitigationList = [];

          _this2.clearDomList("mitigation-list");

          _this2._vals.mitigationList.forEach(function (item) {
            return _this2.createMitigationItem(item.type);
          });

          _this2.openFullscreenDialog($("#dialog-mitigation-expert"));
        } else {
            $("input[name='mitigationBase'][value='" + toSelect + "']").prop("checked", "true");

            _this2.openDialog($("#dialog-mitigation-base"));
          }
      });
      $("#mitigation-base-cancel").click(function () {
        return _this2.closeDialog($("#dialog-mitigation-base"));
      });
      $("#mitigation-base-ok").click(function () {
        _this2._vals.mitigation = $("input[name='mitigationBase']:checked").val();
        $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + _this2._vals.mitigation));

        _this2.closeDialog($("#dialog-mitigation-base"));
      });
      $("#mitigation-expert-close").click(function () {
        return _this2.closeFullscreenDialog($("#dialog-mitigation-expert"));
      });
      $("#mitigation-expert-done").click(function () {
        _this2._vals.mitigation = $("input[name='mitigationExpert']:checked").val();
        _this2._vals.mitigationList = _this2._newMitigationList.filter(function (e) {
          return e !== "";
        });
        $("#mitigation-text").html(i18next.t("insert.mitigation.editText"));

        _this2.closeFullscreenDialog($("#dialog-mitigation-expert"));
      });
      $("input[name='mitigationExpert']").change(function () {
        var checked = $("input[name='mitigationExpert']:checked").val();
        if (checked === "yes") $("#mitigations-wrapper").show();else $("#mitigations-wrapper").hide();
      });
      $("#mitigation-add").click(function () {
        return _this2.openDialog($("#dialog-mitigation-expert-new"));
      });
      $("#mitigation-type-select").change(function () {
        return utils.changeSelectorLabel("mitigation-type-select");
      });
      $("#mitigation-expert-new-cancel").click(function () {
        _this2.closeDialog($("#dialog-mitigation-expert-new"));

        utils.resetSelector("mitigation-type-select");
      });
      $("#mitigation-expert-new-ok").click(function () {
        var type = $("#mitigation-type-select").val();

        if (type === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
          return;
        }

        _this2.createMitigationItem(type);

        _this2.closeDialog($("#dialog-mitigation-expert-new"));

        utils.resetSelector("mitigation-type-select");
      });
      $("#monitoring-request").click(function () {
        var toSelect = _this2._vals.monitoring;
        if (_this2._vals.monitoring === "") toSelect = "yes";
        $("input[name='monitoring'][value='" + toSelect + "']").prop("checked", "true");
        if (toSelect === "yes") $("#monitoring-wrapper").show();else $("#monitoring-wrapper").hide();
        _this2._newMonitoringList = [];

        _this2.clearDomList("monitoring-list");

        _this2._vals.monitoringList.forEach(function (item) {
          return _this2.createMonitoringItem(item.type, item.status);
        });

        _this2.openFullscreenDialog($("#dialog-monitoring"));
      });
      $("#monitoring-close").click(function () {
        return _this2.closeFullscreenDialog($("#dialog-monitoring"));
      });
      $("#monitoring-done").click(function () {
        _this2._vals.monitoring = $("input[name='monitoring']:checked").val();
        _this2._vals.monitoringList = _this2._newMonitoringList.filter(function (e) {
          return e !== "";
        });
        $("#monitoring-text").html(i18next.t("insert.monitoring.editText"));

        _this2.closeFullscreenDialog($("#dialog-monitoring"));
      });
      $("input[name='monitoring']").change(function () {
        var checked = $("input[name='monitoring']:checked").val();
        if (checked === "yes") $("#monitoring-wrapper").show();else $("#monitoring-wrapper").hide();
      });
      $("#monitoring-add").click(function () {
        return _this2.openDialog($("#dialog-monitoring-new"));
      });
      $("#monitoring-type-select").change(function () {
        return utils.changeSelectorLabel("monitoring-type-select");
      });
      $("#monitoring-status-select").change(function () {
        return utils.changeSelectorLabel("monitoring-status-select");
      });
      $("#monitoring-new-cancel").click(function () {
        _this2.closeDialog($("#dialog-monitoring-new"));

        utils.resetSelector("monitoring-type-select");
        utils.resetSelector("monitoring-status-select");
      });
      $("#monitoring-new-ok").click(function () {
        var type = $("#monitoring-type-select").val(),
            status = $("#monitoring-status-select").val();

        if (type === "none" || status === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryMonitoringFields"), "long");
          return;
        }

        _this2.createMonitoringItem(type, status);

        _this2.closeDialog($("#dialog-monitoring-new"));

        utils.resetSelector("monitoring-type-select");
        utils.resetSelector("monitoring-status-select");
      });
      $("#damages-request").click(function () {
        var toSelect = _this2._vals.damages;
        if (_this2._vals.damages === "") toSelect = "noDamage";
        $("input[name='damages'][value='" + toSelect + "']").prop("checked", "true");
        if (toSelect === "directDamage") $("#damages-wrapper").show();else $("#damages-wrapper").hide();
        _this2._newDamagesList = [];

        _this2.clearDomList("damages-list");

        _this2._vals.damagesList.forEach(function (item) {
          return _this2.createDamagesItem(item.type, item.specification);
        });

        _this2.openFullscreenDialog($("#dialog-damages"));
      });
      $("#damages-close").click(function () {
        return _this2.closeFullscreenDialog($("#dialog-damages"));
      });
      $("#damages-done").click(function () {
        _this2._vals.damages = $("input[name='damages']:checked").val();
        _this2._vals.damagesList = _this2._newDamagesList.filter(function (e) {
          return e !== "";
        });
        $("#damages-text").html(i18next.t("insert.damages.editText"));

        _this2.closeFullscreenDialog($("#dialog-damages"));
      });
      $("input[name='damages']").change(function () {
        var checked = $("input[name='damages']:checked").val();
        if (checked === "directDamage") $("#damages-wrapper").show();else $("#damages-wrapper").hide();
      });
      $("#damages-add").click(function () {
        return _this2.openDialog($("#dialog-damages-new"));
      });
      $("#damages-type-select").change(function () {
        utils.changeSelectorLabel("damages-type-select");
        if ($("#damages-type-select").val() === "other") $("#damage-other-input-wrapper").show();else $("#damage-other-input-wrapper").hide();
      });
      $("#damages-new-cancel").click(function () {
        _this2.closeDialog($("#dialog-damages-new"));

        utils.resetSelector("damages-type-select");
        $("#damage-other-input").val("");
        $("#damage-other-input-wrapper").hide();
      });
      $("#damages-new-ok").click(function () {
        var type = $("#damages-type-select").val(),
            $otherInput = $("#damage-other-input");

        if (type === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
          return;
        }

        if (type === "other" && $otherInput.val() === "") {
          utils.logOrToast(i18next.t("messages.mandatoryDamageOther"), "long");
          return;
        }

        var specification = "";
        if (type === "other") specification = $otherInput.val().toString();

        _this2.createDamagesItem(type, specification);

        _this2.closeDialog($("#dialog-damages-new"));

        utils.resetSelector("damages-type-select");
        $otherInput.val("");
        $("#damage-other-input-wrapper").hide();
      });
      $("#notes-request").click(function () {
        $("#notes").val(_this2._vals.notes);

        _this2.openFullscreenDialog($("#dialog-notes"));
      });
      $("#notes-close").click(function () {
        return _this2.closeFullscreenDialog($("#dialog-notes"));
      });
      $("#notes-done").click(function () {
        _this2._vals.notes = $("#notes").val();
        $("#notes-text").html(i18next.t("insert.notes.editText"));

        _this2.closeFullscreenDialog($("#dialog-notes"));
      });

      this._$photoThm.click(function () {
        if (_this2._vals.photo === "") _this2.getPicture();else utils.openImgScreen(_this2._$photoThm.find("img").attr("src"), true, function () {
            return _this2.getPicture();
          }, function () {
            _this2._vals.photo = "";

            _this2._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

            _this2._$photoThm.find("i").show();
          });
      });

      $("#tmp-photo-input").change(function () {
        _this2._vals.photo = $("#tmp-photo-input")[0].files[0];
        var reader = new FileReader();

        reader.onloadend = function (e) {
          _this2._$photoThm.find("img").attr("src", e.target.result).show();

          _this2._$photoThm.find("i").hide();
        };

        reader.readAsDataURL(_this2._vals.photo);
      });
    }
  }, {
    key: "getPicture",
    value: function getPicture() {
      var _this3 = this;

      if (!App.isCordova) {
        $("#tmp-photo-input").click();
        return;
      }

      var opt = {
        quality: 30,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true
      };
      navigator.camera.getPicture(function (fileURI) {
        console.log(fileURI);
        _this3._vals.photo = fileURI;

        _this3._$photoThm.find("img").attr("src", _this3._vals.photo).show();

        _this3._$photoThm.find("i").hide();
      }, function (err) {
        console.log("Error taking picture ".concat(err));
        utils.createAlert("", i18next.t("dialogs.insert.pictureError"), i18next.t("dialogs.btnOk"));
      }, opt);
    }
  }, {
    key: "postLocal",
    value: function postLocal() {
      var _this4 = this;

      utils.openLoader();
      var data = {
        _id: utils.generateUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expert: App.isExpertMode.toString(),
        coordinates: this._vals.coordinates,
        coordinatesAccuracy: this._vals.coordinatesAccuracy,
        altitude: this._vals.altitude,
        altitudeAccuracy: this._vals.altitudeAccuracy,
        type: this._vals.type,
        materialType: this._vals.materialType,
        hillPosition: this._vals.hillPosition,
        water: this._vals.water,
        vegetation: this._vals.vegetation,
        mitigation: this._vals.mitigation,
        mitigationList: this._vals.mitigationList,
        monitoring: this._vals.monitoring,
        monitoringList: this._vals.monitoringList,
        damages: this._vals.damages,
        damagesList: this._vals.damagesList,
        notes: this._vals.notes,
        imageUrl: this._vals.photo
      };

      if (!App.isCordova) {
        landslide.postLocal(data).then(function (data) {
          utils.closeLoader();
          landslide.show(data.id, data.coords, true);
          $("#sync-notification").show();

          _this4.close();
        });
        return;
      }

      utils.moveImage(data.imageUrl).then(function (url) {
        data.imageUrl = url;
        return landslide.postLocal(data);
      }).then(function (data) {
        utils.closeLoader();
        landslide.show(data.id, data.coords, true);
        $("#sync-notification").show();

        _this4.close();
      });
    }
  }, {
    key: "postRemote",
    value: function postRemote() {
      var _this5 = this;

      utils.openLoader();
      var formData = new FormData();
      formData.append("expert", App.isExpertMode.toString());
      formData.append("coordinates", JSON.stringify(this._vals.coordinates));
      formData.append("coordinatesAccuracy", this._vals.coordinatesAccuracy);
      formData.append("altitude", this._vals.altitude);
      formData.append("altitudeAccuracy", this._vals.altitudeAccuracy);
      formData.append("type", this._vals.type);
      formData.append("materialType", this._vals.materialType);
      formData.append("hillPosition", this._vals.hillPosition);
      formData.append("water", this._vals.water);
      formData.append("vegetation", this._vals.vegetation);
      formData.append("mitigation", this._vals.mitigation);
      formData.append("mitigationList", JSON.stringify(this._vals.mitigationList));
      formData.append("monitoring", this._vals.monitoring);
      formData.append("monitoringList", JSON.stringify(this._vals.monitoringList));
      formData.append("damages", this._vals.damages);
      formData.append("damagesList", JSON.stringify(this._vals.damagesList));
      formData.append("notes", this._vals.notes);

      if (!App.isCordova) {
        formData.append("image", this._vals.photo);
        landslide.post(formData).then(function (data) {
          utils.closeLoader();
          landslide.show(data.id, data.coords, false);
          InsertActivity.getInstance().close();
        });
        return;
      }

      utils.appendFile(formData, this._vals.photo).then(function (formData) {
        return landslide.post(formData);
      }).then(function (data) {
        utils.closeLoader();
        landslide.show(data.id, data.coords, false);

        _this5.close();
      });
    }
  }, {
    key: "putLocal",
    value: function putLocal() {
      var _this6 = this;

      utils.openLoader();
      var data = {
        updatedAt: new Date().toISOString(),
        type: this._vals.type,
        materialType: this._vals.materialType,
        hillPosition: this._vals.hillPosition,
        water: this._vals.water,
        vegetation: this._vals.vegetation,
        mitigation: this._vals.mitigation,
        mitigationList: this._vals.mitigationList,
        monitoring: this._vals.monitoring,
        monitoringList: this._vals.monitoringList,
        damages: this._vals.damages,
        damagesList: this._vals.damagesList,
        notes: this._vals.notes
      };

      var put = function put(removeOld) {
        landslide.putLocal(_this6._lsId, data).then(function () {
          if (removeOld) utils.deleteImage(_this6._oldPhoto, false);
          utils.closeLoader();
          InfoActivity.getInstance().getLandslide(data.id, true);
          InsertActivity.getInstance().close();
        });
      };

      if (this._vals.photo === this._oldPhoto) put(false);else {
          utils.moveImage(this._vals.photo).then(function (url) {
            data.imageUrl = url;
            put(true);
          });
        }
    }
  }, {
    key: "putRemote",
    value: function putRemote() {
      utils.openLoader();
      var formData = new FormData();
      formData.append("type", this._vals.type);
      formData.append("materialType", this._vals.materialType);
      formData.append("hillPosition", this._vals.hillPosition);
      formData.append("water", this._vals.water);
      formData.append("vegetation", this._vals.vegetation);
      formData.append("mitigation", this._vals.mitigation);
      formData.append("mitigationList", JSON.stringify(this._vals.mitigationList));
      formData.append("monitoring", this._vals.monitoring);
      formData.append("monitoringList", JSON.stringify(this._vals.monitoringList));
      formData.append("damages", this._vals.damages);
      formData.append("damagesList", JSON.stringify(this._vals.damagesList));
      formData.append("notes", this._vals.notes);

      if (!App.isCordova) {
        if (this._vals.photo !== this._oldPhoto) formData.append("image", this._vals.photo);
        landslide.put(this._lsId, formData).then(function (data) {
          utils.closeLoader();
          InfoActivity.getInstance().getLandslide(data.id, false);
          InsertActivity.getInstance().close();
        })["catch"](function () {
          utils.closeLoader();
        });
        return;
      }

      var file = null;
      if (this._vals.photo !== this._oldPhoto) file = this._vals.photo;
      utils.appendFile(formData, file).then(function (formData) {
        return landslide.put(InsertActivity.getInstance()._lsId, formData);
      }).then(function (data) {
        InfoActivity.getInstance().getLandslide(data.id);
        utils.closeLoader();
        InsertActivity.getInstance().close();
      });
    }
  }, {
    key: "openFullscreenDialog",
    value: function openFullscreenDialog(dialog) {
      dialog.show();
    }
  }, {
    key: "closeFullscreenDialog",
    value: function closeFullscreenDialog(dialog) {
      dialog.scrollTop(0).hide();
    }
  }, {
    key: "openDialog",
    value: function openDialog(toOpen) {
      $("#opaque-overlay").show();
      $("#page--insert").css("overflow-y", "hidden");
      toOpen.show();
    }
  }, {
    key: "closeDialog",
    value: function closeDialog(toClose) {
      toClose.hide();
      $("#opaque-overlay").hide();
      $("#page--insert").css("overflow-y", "scroll");
    }
  }, {
    key: "clearDomList",
    value: function clearDomList(listId) {
      $("#" + listId).html("");
    }
  }, {
    key: "deleteListItem",
    value: function deleteListItem(list, listId, idx) {
      $("#".concat(idx)).parent().remove();
      idx = idx.substring(idx.indexOf("-") + 1);
      list[idx] = "";
    }
  }, {
    key: "createMitigationItem",
    value: function createMitigationItem(type) {
      var _this7 = this;

      var btnId = "mitigation-" + this._newMitigationList.length;
      $("#mitigation-list").append("\n\n            <section class='list-item no-padding'>\n            \n                <div class='list-item-text'>\n                    <p class='list-item-text-p'>".concat(i18next.t("insert.mitigation.enum." + type), "</p>\n                </div>\n                \n                <div id='").concat(btnId, "' class='details-list-item-delete'>\n                    <i class='material-icons'>cancel</i>\n                </div>\n                \n            </section>\n            \n        "));
      $("#".concat(btnId)).click(function () {
        return _this7.deleteListItem(_this7._newMitigationList, "mitigation-list", btnId);
      });

      this._newMitigationList.push({
        type: type
      });
    }
  }, {
    key: "createMonitoringItem",
    value: function createMonitoringItem(type, status) {
      var _this8 = this;

      var btnId = "monitoring-" + this._newMonitoringList.length;
      $("#monitoring-list").append("\n\n            <section class='list-item'>\n            \n                <div class='list-item-text padding-start'>\n                \n                    <p class='list-item-text-p'>\n                    \n                        <span class='list-item-entry-title' data-i18n='insert.monitoring.type'>Type: </span>\n                        ".concat(i18next.t("insert.monitoring.enum." + type), "\n                        \n                    </p>\n                    \n                    <p class='list-item-text-p'>\n                    \n                        <span class='list-item-entry-title' data-i18n='insert.monitoring.status'>Status: </span>\n                        ").concat(i18next.t("insert.monitoring.enum." + status), "\n                        \n                    </p>\n            \n                </div>\n                \n                <div id='").concat(btnId, "' class='details-list-item-delete'><i class='material-icons'>cancel</i></div>\n                \n            </section>\n            \n        "));
      $("#".concat(btnId)).click(function () {
        return _this8.deleteListItem(_this8._newMonitoringList, "monitoring-list", btnId);
      });

      this._newMonitoringList.push({
        type: type,
        status: status
      });
    }
  }, {
    key: "createDamagesItem",
    value: function createDamagesItem(type, specification) {
      var _this9 = this;

      var btnId = "mitigation-" + this._newDamagesList.length;
      var info = i18next.t("insert.damages.enum." + type);
      if (specification !== "") info = specification;
      $("#damages-list").append("\n\n            <section class='list-item no-padding'>\n            \n                <div class='list-item-text padding-start'>\n                    <p class='list-item-text-p'>".concat(info, "</p>\n                </div>\n                \n                <div id='").concat(btnId, "' class='details-list-item-delete'>\n                    <i class='material-icons'>cancel</i>\n                </div>\n                \n            </section>\n            \n        "));
      $("#".concat(btnId)).click(function () {
        return _this9.deleteListItem(_this9._newDamagesList, "damages-list", btnId);
      });

      this._newDamagesList.push({
        type: type,
        specification: specification
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!InsertActivity._instance) InsertActivity._instance = new InsertActivity();
      return InsertActivity._instance;
    }
  }]);

  return InsertActivity;
}();

_defineProperty(InsertActivity, "_instance", void 0);
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MapActivity = function () {
  _createClass(MapActivity, null, [{
    key: "defaultLatLng",
    get: function get() {
      return [45.464161, 9.190336];
    }
  }, {
    key: "defaultZoom",
    get: function get() {
      return 11;
    }
  }, {
    key: "watcherZoom",
    get: function get() {
      return 17;
    }
  }]);

  function MapActivity() {
    var _this = this;

    _classCallCheck(this, MapActivity);

    this._screen = $("#page--map");

    this._screen.height($(window).height());

    this._map = L.map("page--map", {
      zoomSnap: 0,
      zoomAnimation: true,
      zoomAnimationThreshold: 4,
      fadeAnimation: true,
      markerZoomAnimation: true,
      touchZoom: "center"
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      errorTileUrl: "img/errorTile.png"
    }).addTo(this._map);
    this._centerMap = true;
    this._autoZoom = true;
    this._clusterClick = false;
    this._isFirstPositionFound = true;
    this.isPositionWatcherAttached = false;
    this.initUI();
    this.markersLayer = L.markerClusterGroup();
    this.markersLayer.on("clusterclick", function () {
      return _this._clusterClick = true;
    });
    this.markersLayer.on("animationend", function () {
      return _this._clusterClick = false;
    });

    this._map.addLayer(this.markersLayer);

    this.initPositionMarker();
    if (!App.isCordova) return;
    this._d = cordova.plugins.diagnostic;
    this.registerGPSWatcher();
  }

  _createClass(MapActivity, [{
    key: "open",
    value: function open() {
      this._screen.show();

      this._map.setView(MapActivity.defaultLatLng, MapActivity.defaultZoom);

      this.positionMarker.setLatLng(MapActivity.defaultLatLng);
      if (App.isCordova) this.checkLocationPermissions();
      landslide.showAll();
    }
  }, {
    key: "close",
    value: function close() {
      this._screen.hide();

      this.detachPositionWatcher();
    }
  }, {
    key: "initUI",
    value: function initUI() {
      var _this2 = this;

      $(".leaflet-control-container").hide();
      $("#map-control-settings").click(function () {
        return SettingsActivity.getInstance().open();
      });
      $("#map-control-sync").click(function () {
        if (app.isGuest) {
          utils.createAlert("", i18next.t("dialogs.syncGuest"), i18next.t("dialogs.btnOk"));
          return;
        }

        if (!navigator.onLine) {
          utils.createAlert("", i18next.t("dialogs.syncOffline"), i18next.t("dialogs.btnOk"));
          return;
        }

        if (landslide.localMarkers.length === 0) {
          utils.logOrToast(i18next.t("messages.localDbEmpty"), "long");
          return;
        }

        utils.createAlert("", i18next.t("dialogs.syncConfirmation", {
          number: landslide.localMarkers.length
        }), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
          var res;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  utils.openLoader();
                  _context.next = 3;
                  return landslide.sync();

                case 3:
                  res = _context.sent;
                  landslide.showAll();
                  utils.closeLoader();
                  utils.createAlert("", "<p style=\"margin-bottom: 8px\">".concat(res.successes, "/").concat(res.total, " ").concat(i18next.t("dialogs.syncSuccesses"), "</p>\n                         <p style=\"margin-bottom: 8px\">").concat(res.insertErrors, "/").concat(res.total, " ").concat(i18next.t("dialogs.syncInsertErr"), "</p>\n                         <p>").concat(res.deleteErrors, "/").concat(res.total, " ").concat(i18next.t("dialogs.syncDeleteErr"), "</p>"), i18next.t("dialogs.btnOk"));

                case 7:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        })));
      });
      this._$gps = $("#map-control-gps");

      this._$gps.click(function () {
        return _this2.handleGPSButton();
      });

      $("#map-new-ls").click(function () {
        return InsertActivity.getInstance().open();
      });

      this._map.on("dragstart", function () {
        return _this2.freeMap();
      });

      this._map.on("zoomstart", function () {
        if (!_this2._autoZoom || _this2._clusterClick) _this2.freeMap();
      });

      this._map.on("moveend", function () {
        if (_this2._clusterClick) return;

        if (!_this2._centerMap && _this2._autoZoom) {
          _this2._centerMap = true;
          _this2._autoZoom = false;
        }
      });
    }
  }, {
    key: "initPositionMarker",
    value: function initPositionMarker() {
      var _this3 = this;

      var positionMarkerIcon = L.icon({
        iconUrl: "img/user-marker.png",
        iconRetinaUrl: "img/user-marker-2x.png",
        iconSize: [37, 37],
        iconAnchor: [19, 19]
      });
      this.positionMarker = L.marker(MapActivity.defaultLatLng, {
        icon: positionMarkerIcon,
        draggable: true,
        zIndexOffset: 1000
      });
      this.currLatLng = MapActivity.defaultLatLng;
      this.currLatLngAccuracy = 0;
      this.currAltitude = -999;
      this.currAltitudeAccuracy = 0;
      this._accuracyCircle = undefined;
      this.positionMarker.on("dragstart", function () {
        _this3._isFirstPositionFound = true;

        _this3.detachPositionWatcher();

        if (_this3._accuracyCircle !== undefined) {
          _this3._map.removeLayer(_this3._accuracyCircle);

          _this3._accuracyCircle = undefined;
        }
      });
      this.positionMarker.on("dragend", function (e) {
        _this3.currLatLng = [e.target.getLatLng().lat, e.target.getLatLng().lng];
        _this3.currLatLngAccuracy = 0;
        _this3.currAltitude = -999;
        _this3.currAltitudeAccuracy = 0;
        console.log("Position marker dragged to ".concat(_this3.currLatLng));
      });
      this.positionMarker.addTo(this._map);
    }
  }, {
    key: "freeMap",
    value: function freeMap() {
      this._centerMap = false;

      this._$gps.removeClass("gps-on");
    }
  }, {
    key: "registerGPSWatcher",
    value: function registerGPSWatcher() {
      var _this4 = this;

      this._d.registerLocationStateChangeHandler(function (state) {
        if (device.platform === "Android" && state !== _this4._d.locationMode.LOCATION_OFF || device.platform === "iOS" && (state === _this4._d.permissionStatus.GRANTED || state === _this4._d.permissionStatus.GRANTED_WHEN_IN_USE)) {
          console.log("GPS turned on");

          _this4._$gps.children("i").html("gps_fixed");

          _this4._isFirstPositionFound = true;
          _this4._centerMap = true;
          _this4._autoZoom = true;

          _this4.attachPositionWatcher();
        } else {
            console.log("GPS turned off");

            _this4._$gps.removeClass("gps-on").children("i").html("gps_off");

            _this4.detachPositionWatcher();

            utils.createAlert(i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
          }
      });
    }
  }, {
    key: "checkLocationPermissions",
    value: function checkLocationPermissions() {
      var _this5 = this;

      this._d.getLocationAuthorizationStatus(function (status) {
        console.log(status);

        if (status === _this5._d.permissionStatus.NOT_REQUESTED || device.platform === "Android" && status === _this5._d.permissionStatus.DENIED_ALWAYS) {
          console.log("Permission not requested");

          _this5.requestLocationPermission();
        } else if (status === _this5._d.permissionStatus.DENIED) {
            console.log("Permission denied");

            _this5._$gps.removeClass("gps-on").children("i").html("gps_off");
          } else if (status === _this5._d.permissionStatus.GRANTED || device.platform === "iOS" && status === _this5._d.permissionStatus.GRANTED_WHEN_IN_USE) {
              console.log("Permission granted");

              _this5.checkGPSOn(function () {
                return _this5.attachPositionWatcher();
              });
            }
      }, function (err) {
        console.error("Error checking the permissions: ".concat(err));

        _this5._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "requestLocationPermission",
    value: function requestLocationPermission() {
      var _this6 = this;

      this._d.requestLocationAuthorization(function (status) {
        if (status === _this6._d.permissionStatus.GRANTED || device.platform === "iOS" && status === _this6._d.permissionStatus.GRANTED_WHEN_IN_USE) {
          console.log("Permission granted");

          _this6.checkGPSOn(function () {
            return _this6.attachPositionWatcher();
          });
        } else {
            console.log("Permission denied");

            _this6._$gps.removeClass("gps-on").children("i").html("gps_off");
          }
      }, function (err) {
        console.error("Error requesting the location authorization", err);

        _this6._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert(i18next.t("dialogs.map.permissionsRequestError"), i18next.t("dialogs.btnOk"));
      }, this._d.locationAuthorizationMode.ALWAYS);
    }
  }, {
    key: "checkGPSOn",
    value: function checkGPSOn(callback) {
      var _this7 = this;

      this._d.isLocationEnabled(function (enabled) {
        if (enabled) {
          console.log("GPS on");

          _this7._$gps.children("i").html("gps_fixed");

          callback();
        } else {
            console.log("GPS off");

            _this7._$gps.removeClass("gps-on").children("i").html("gps_off");

            utils.createAlert(i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
          }
      }, function (err) {
        console.error("Cannot determine if the location is enabled", err);

        _this7._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert(i18next.t("dialogs.map.gpsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "handleGPSButton",
    value: function handleGPSButton() {
      var _this8 = this;

      if (!App.isCordova) return;

      if (this._$gps.hasClass("gps-on")) {
        console.log("Watcher already on");
        return;
      }

      this._d.getLocationAuthorizationStatus(function (status) {
        if (device.platform === "Android" && status === _this8._d.permissionStatus.DENIED) {
          console.log("Permission denied but can be requested");

          _this8.requestLocationPermission();
        } else if (device.platform === "Android" && status === _this8._d.permissionStatus.DENIED_ALWAYS || device.platform === "iOS" && status === _this8._d.permissionStatus.DENIED) {
            console.log("Cannot request the permission again.");

            _this8._$gps.removeClass("gps-on").children("i").html("gps_off");

            utils.createAlert(i18next.t("dialogs.map.cannotRequestPermissions"), i18next.t("dialogs.btnOk"));
          } else {
              console.log("Permission granted");

              _this8.checkGPSOn(function () {
                _this8._autoZoom = true;

                if (_this8._isFirstPositionFound) {
                  _this8._centerMap = true;

                  _this8.attachPositionWatcher();

                  return;
                }

                if (_this8._map.getZoom() < 15) _this8._map.flyTo(_this8.currLatLng, MapActivity.watcherZoom);else _this8._map.flyTo(_this8.currLatLng);

                _this8.attachPositionWatcher();
              });
            }
      }, function (err) {
        console.error("Error checking the permissions ".concat(err));

        _this8._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert(i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "attachPositionWatcher",
    value: function attachPositionWatcher() {
      this._$gps.addClass("gps-on");

      if (this.isPositionWatcherAttached) return;
      $("#finding-position-msg").show();
      this._positionWatcherId = navigator.geolocation.watchPosition(this.onPositionSuccess.bind(this), function (err) {
        return console.error("Error finding the position ".concat(err));
      }, {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
      this.isPositionWatcherAttached = true;
      console.log("Position watcher attached");
    }
  }, {
    key: "detachPositionWatcher",
    value: function detachPositionWatcher() {
      if (!this.isPositionWatcherAttached) return;

      this._$gps.removeClass("gps-on");

      navigator.geolocation.clearWatch(this._positionWatcherId);
      this.isPositionWatcherAttached = false;
      console.log("Position watcher detached");
    }
  }, {
    key: "onPositionSuccess",
    value: function onPositionSuccess(pos) {
      this.currLatLng = [pos.coords.latitude, pos.coords.longitude];
      this.currLatLngAccuracy = pos.coords.accuracy;
      this.currAltitude = pos.coords.altitude || -999;
      this.currAltitudeAccuracy = pos.coords.altitude || 0;
      console.log("Position found");
      $("#finding-position-msg").hide();

      if (this._isFirstPositionFound) {
        this._map.setView(this.currLatLng, MapActivity.watcherZoom);

        this._isFirstPositionFound = false;
        this._autoZoom = false;
      } else if (this._centerMap) {
          this._map.panTo(this.currLatLng);
        }

      this.positionMarker.setLatLng(this.currLatLng);
      if (this._accuracyCircle !== undefined) this._map.removeLayer(this._accuracyCircle);
      this._accuracyCircle = L.circle(this.currLatLng, {
        radius: this.currLatLngAccuracy / 2,
        color: "green",
        opacity: .5
      }).addTo(this._map);
    }
  }], [{
    key: "hasInstance",
    value: function hasInstance() {
      return !!MapActivity._instance;
    }
  }, {
    key: "getInstance",
    value: function getInstance() {
      if (!MapActivity._instance) MapActivity._instance = new MapActivity();
      return MapActivity._instance;
    }
  }]);

  return MapActivity;
}();

_defineProperty(MapActivity, "_instance", void 0);
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var landslide = {
  _iconRemote: L.icon({
    iconUrl: "img/ls-marker-remote.png",
    iconRetinaUrl: "img/ls-marker-remote-2x.png",
    shadowUrl: "img/ls-marker-shadow.png",
    shadowRetinaUrl: "img/ls-marker-shadow-2x.png",
    iconSize: [31, 37],
    shadowSize: [31, 19],
    iconAnchor: [31, 37],
    shadowAnchor: [18, 18]
  }),
  _iconLocal: L.icon({
    iconUrl: "img/ls-marker-local.png",
    iconRetinaUrl: "img/ls-marker-local-2x.png",
    shadowUrl: "img/ls-marker-shadow.png",
    shadowRetinaUrl: "img/ls-marker-shadow-2x.png",
    iconSize: [31, 37],
    shadowSize: [31, 19],
    iconAnchor: [31, 37],
    shadowAnchor: [18, 18]
  }),
  remoteMarkers: [],
  localMarkers: [],
  show: function show(id, coordinates, isLocal) {
    var marker = L.marker(coordinates, {
      icon: landslide._iconRemote,
      draggable: false
    });
    marker._id = id;
    marker.on("click", function () {
      return InfoActivity.getInstance().open(id, isLocal);
    });
    MapActivity.getInstance().markersLayer.addLayer(marker);

    if (isLocal) {
      marker.setIcon(landslide._iconLocal);
      landslide.localMarkers.push(marker);
    } else landslide.remoteMarkers.push(marker);
  },
  showAll: function showAll() {
    MapActivity.getInstance().markersLayer.clearLayers();
    landslide.remoteMarkers = [];
    landslide.localMarkers = [];
    $("#sync-notification").hide();
    var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").getAll();

    request.onerror = function (err) {
      console.error("Error getting data", err);
      utils.createAlert("", i18next.t("dialogs.getLocalLsError"), i18next.t("dialogs.btnOk"));
    };

    request.onsuccess = function (e) {
      e.target.result.forEach(function (ls) {
        return landslide.show(ls._id, ls.coordinates, true);
      });
      if (landslide.localMarkers.length !== 0) $("#sync-notification").show();
    };

    if (!navigator.onLine || app.isGuest) return;
    fetch("".concat(settings.serverUrl, "/landslide/get-all"), {
      headers: {
        Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
      }
    }).then(function (res) {
      if (res.status !== 200) {
        var err = new Error();
        err.code = res.status;
        throw err;
      }

      return res.json();
    }).then(function (data) {
      data.landslides.forEach(function (d) {
        return landslide.show(d._id, d.coordinates, false);
      });
    })["catch"](function (err) {
      console.error(err);
      if (err.code === 401) utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslides401"), i18next.t("dialogs.btnOk"));else utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslides500"), i18next.t("dialogs.btnOk"));
    });
  },
  get: function get(id, isLocal) {
    var showError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    return new Promise(function (resolve, reject) {
      if (isLocal) {
        var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").get(id);

        request.onerror = function (err) {
          console.error("Retrieving ls failed", err);
          if (!showError) reject();
          utils.closeLoader();
          utils.createAlert("", i18next.t("dialogs.info.getLocalLsError"), i18next.t("dialogs.btnOk"));
          reject();
        };

        request.onsuccess = function (e) {
          resolve(e.target.result);
        };
      } else {
          fetch("".concat(settings.serverUrl, "/landslide/").concat(id), {
            headers: {
              Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
            }
          }).then(function (res) {
            if (res.status !== 200) {
              var err = new Error();
              err.code = res.status;
              throw err;
            }

            return res.json();
          }).then(function (data) {
            resolve(data.landslide);
          })["catch"](function (err) {
            console.error(err);
            if (!showError) reject();
            utils.closeLoader();

            switch (err.code) {
              case 401:
                utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslide401"), i18next.t("dialogs.btnOk"));
                break;

              case 404:
                utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getLandslide404"), i18next.t("dialogs.btnOk"));
                break;

              default:
                utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslide500"), i18next.t("dialogs.btnOk"));
                break;
            }

            reject();
          });
        }
    });
  },
  post: function post(formData) {
    var showError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return new Promise(function (resolve, reject) {
      fetch("".concat(settings.serverUrl, "/landslide/post"), {
        method: "POST",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        },
        body: formData
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve({
          id: data.landslide._id,
          coords: data.landslide.coordinates
        });
      })["catch"](function (err) {
        console.error(err);
        if (!showError) reject();
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.postLandslide401"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.postLandslide422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.postLandslide500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  postLocal: function postLocal(data) {
    return new Promise(function (resolve, reject) {
      var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").add(data);

      request.onerror = function (err) {
        console.log("An error occurred during the insert", err);
        utils.closeLoader();
        utils.createAlert("", i18next.t("dialogs.insert.insertError"), i18next.t("dialogs.btnOk"));
        reject();
      };

      request.onsuccess = function () {
        console.log("Insert done");
        resolve({
          id: data._id,
          coords: data.coordinates
        });
      };
    });
  },
  sync: function () {
    var _sync = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
      var total, success, insertErrors, deleteErrors, _loop, i;

      return regeneratorRuntime.wrap(function _callee5$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              total = landslide.localMarkers.length;
              success = 0, insertErrors = 0, deleteErrors = 0;
              _loop = regeneratorRuntime.mark(function _loop(i) {
                return regeneratorRuntime.wrap(function _loop$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        console.log("Start ".concat(i));
                        _context5.next = 3;
                        return landslide.get(landslide.localMarkers[i]._id, true, false).then(function () {
                          var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(ls) {
                            var formData;
                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                              while (1) {
                                switch (_context4.prev = _context4.next) {
                                  case 0:
                                    console.log("Found ".concat(i));
                                    formData = new FormData();
                                    formData.append("expert", ls.expert.toString());
                                    formData.append("coordinates", JSON.stringify(ls.coordinates));
                                    formData.append("coordinatesAccuracy", ls.coordinatesAccuracy);
                                    formData.append("altitude", ls.altitude);
                                    formData.append("altitudeAccuracy", ls.altitudeAccuracy);
                                    formData.append("type", ls.type);
                                    formData.append("materialType", ls.materialType);
                                    formData.append("hillPosition", ls.hillPosition);
                                    formData.append("water", ls.water);
                                    formData.append("vegetation", ls.vegetation);
                                    formData.append("mitigation", ls.mitigation);
                                    formData.append("mitigationList", JSON.stringify(ls.mitigationList));
                                    formData.append("monitoring", ls.monitoring);
                                    formData.append("monitoringList", JSON.stringify(ls.monitoringList));
                                    formData.append("damages", ls.damages);
                                    formData.append("damagesList", JSON.stringify(ls.damagesList));
                                    formData.append("notes", ls.notes);

                                    if (App.isCordova) {
                                      _context4.next = 24;
                                      break;
                                    }

                                    formData.append("image", ls.imageUrl);
                                    _context4.next = 23;
                                    return landslide.post(formData, false).then(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                                      return regeneratorRuntime.wrap(function _callee$(_context) {
                                        while (1) {
                                          switch (_context.prev = _context.next) {
                                            case 0:
                                              console.log("Posted ".concat(i));
                                              _context.next = 3;
                                              return landslide["delete"](ls._id, true, ls.imageUrl, false).then(function () {
                                                return success++;
                                              })["catch"](function () {
                                                return deleteErrors++;
                                              });

                                            case 3:
                                            case "end":
                                              return _context.stop();
                                          }
                                        }
                                      }, _callee);
                                    })))["catch"](function () {
                                      return insertErrors++;
                                    });

                                  case 23:
                                    return _context4.abrupt("return");

                                  case 24:
                                    _context4.next = 26;
                                    return utils.appendFile(formData, ls.imageUrl, false).then(function () {
                                      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(formData) {
                                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                          while (1) {
                                            switch (_context2.prev = _context2.next) {
                                              case 0:
                                                _context2.next = 2;
                                                return landslide.post(formData, false);

                                              case 2:
                                                return _context2.abrupt("return", _context2.sent);

                                              case 3:
                                              case "end":
                                                return _context2.stop();
                                            }
                                          }
                                        }, _callee2);
                                      }));

                                      return function (_x2) {
                                        return _ref3.apply(this, arguments);
                                      };
                                    }()).then(_asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
                                      return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                        while (1) {
                                          switch (_context3.prev = _context3.next) {
                                            case 0:
                                              console.log("Posted ".concat(i));
                                              _context3.next = 3;
                                              return landslide["delete"](ls._id, true, ls.imageUrl, false).then(function () {
                                                return success++;
                                              })["catch"](function () {
                                                return deleteErrors++;
                                              });

                                            case 3:
                                            case "end":
                                              return _context3.stop();
                                          }
                                        }
                                      }, _callee3);
                                    })))["catch"](function () {
                                      return insertErrors++;
                                    });

                                  case 26:
                                  case "end":
                                    return _context4.stop();
                                }
                              }
                            }, _callee4);
                          }));

                          return function (_x) {
                            return _ref.apply(this, arguments);
                          };
                        }())["catch"](function () {
                          return insertErrors++;
                        });

                      case 3:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _loop);
              });
              i = 0;

            case 4:
              if (!(i < total)) {
                _context6.next = 9;
                break;
              }

              return _context6.delegateYield(_loop(i), "t0", 6);

            case 6:
              i++;
              _context6.next = 4;
              break;

            case 9:
              console.log("Done ls");
              return _context6.abrupt("return", {
                total: total,
                successes: success,
                insertErrors: insertErrors,
                deleteErrors: deleteErrors
              });

            case 11:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee5);
    }));

    function sync() {
      return _sync.apply(this, arguments);
    }

    return sync;
  }(),
  put: function put(id, formData) {
    return new Promise(function (resolve, reject) {
      fetch("".concat(settings.serverUrl, "/landslide/").concat(id), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        },
        body: formData
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve({
          id: data.landslide._id
        });
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putLandslide401"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putLandslide404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.putLandslide422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.putLandslide500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putLocal: function putLocal(id, data) {
    return new Promise(function (resolve, reject) {
      var getRequest = app.db.transaction("landslides", "readwrite").objectStore("landslides").get(id);

      getRequest.onerror = function (err) {
        console.error("Cannot get the landslide", err);
        utils.closeLoader();
        utils.createAlert("", i18next.t("dialogs.insert.putLocalError"), i18next.t("dialogs.btnOk"));
        reject();
      };

      getRequest.onsuccess = function (e) {
        var ls = Object.assign(e.target.result, data);
        var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").put(ls);

        request.onerror = function (err) {
          console.log("An error occurred during the insert", err);
          utils.closeLoader();
          utils.createAlert("", i18next.t("dialogs.insert.putLocalError"), i18next.t("dialogs.btnOk"));
          reject();
        };

        request.onsuccess = function (e) {
          resolve({
            id: e.target.result._id
          });
        };
      };
    });
  },
  "delete": function _delete(id, isLocal) {
    var localPhotoURL = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var showError = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    return new Promise(function (resolve, reject) {
      if (isLocal) {
        var request = app.db.transaction("landslides", "readwrite").objectStore("landslides")["delete"](id);

        request.onerror = function (err) {
          console.error("Deleting failed", err);
          if (!showError) reject();
          utils.closeLoader();
          utils.createAlert("", i18next.t("dialogs.deleteLocalLsError"), i18next.t("dialogs.btnOk"));
          reject();
        };

        request.onsuccess = function () {
          landslide.removeMarker(id, true);
          if (landslide.localMarkers.length === 0) $("#sync-notification").hide();
          utils.deleteImage(localPhotoURL, showError).then(function () {
            resolve();
          });
          resolve();
        };
      } else {
          fetch("".concat(settings.serverUrl, "/landslide/").concat(id), {
            method: "DELETE",
            headers: {
              Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
            }
          }).then(function (res) {
            if (res.status !== 200) {
              var err = new Error();
              err.code = res.status;
              throw err;
            }

            landslide.removeMarker(id, false);
            resolve();
          })["catch"](function (err) {
            console.error(err);
            if (!showError) reject();
            utils.closeLoader();

            switch (err.code) {
              case 401:
                utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.deleteLandslide401"), i18next.t("dialogs.btnOk"));
                break;

              case 404:
                utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.deleteLandslide404"), i18next.t("dialogs.btnOk"));
                break;

              default:
                utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.deleteLandslide500"), i18next.t("dialogs.btnOk"));
                break;
            }

            reject();
          });
        }
    });
  },
  removeMarker: function removeMarker(id, isLocal) {
    var clear = function clear(array) {
      var newMarkers = [];
      array.forEach(function (m) {
        if (m._id === id) MapActivity.getInstance().markersLayer.removeLayer(m);else newMarkers.push(m);
      });
      array = newMarkers;
    };

    if (isLocal) clear(landslide.localMarkers);else clear(landslide.remoteMarkers);
  }
};
"use strict";

var settings = {
  serverUrl: "http://192.168.1.100:8080"
};
"use strict";

var user = {
  get: function get(id) {
    return new Promise(function (resolve, reject) {
      fetch("".concat(settings.serverUrl, "/profile/").concat(id), {
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        }
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve(data.user);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getUser401"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getUser404"), i18next.t("dialogs.btnOk"));
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getUser500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putEmail: function putEmail(id, newEmail) {
    return new Promise(function (resolve, reject) {
      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/change-email"), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: newEmail
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        resolve();
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changeEmail401"), i18next.t("dialogs.btnOk"));
            break;

          case 409:
            utils.logOrToast(i18next.t("messages.register409"), "long");
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changeEmail404"), i18next.t("dialogs.btnOk"));
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changeEmail500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putPassword: function putPassword(id, oldPw, newPw, confirmPw) {
    return new Promise(function (resolve, reject) {
      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/change-password"), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oldPassword: oldPw,
          newPassword: newPw,
          confirmPassword: confirmPw
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        resolve();
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changePw401"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changePw404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.changePw422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changePw500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putProfile: function putProfile(id, json) {
    return new Promise(function (resolve, reject) {
      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/update-profile"), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: json
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve(data.user);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.editProfile401"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.editProfile404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.editProfile422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.editProfile500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  }
};
"use strict";

var utils = {
  _$alertOverlay: $("#alert-dialog-overlay"),
  switchActivity: function switchActivity(toOpen) {
    var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var toClose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    toOpen.open();
    if (close) toClose.close();
  },
  generateUID: function generateUID() {
    var array = new Uint32Array(6),
        uid = '';
    window.crypto.getRandomValues(array);

    for (var i = 0; i < array.length; i++) {
      uid += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
    }

    return uid;
  },
  getLocalDirectory: function getLocalDirectory() {
    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (rootDir) {
        rootDir.getDirectory("images", {
          create: true
        }, function (dir) {
          return resolve(dir);
        }, function (err) {
          console.error("Fail to get or create main directory", err);
          reject();
        });
      }, function (err) {
        console.error("Fail to resolve root directory", err);
        reject();
      });
    });
  },
  moveImage: function moveImage(imageUrl) {
    return new Promise(function (resolve, reject) {
      var onError = function onError() {
        utils.closeLoader();
        utils.createAlert("", i18next.t("dialogs.insert.movePictureError"), i18next.t("dialogs.btnOk"));
        reject();
      };

      window.resolveLocalFileSystemURL(imageUrl, function (fileEntry) {
        utils.getLocalDirectory().then(function (dir) {
          fileEntry.moveTo(dir, fileEntry.name, function (file) {
            console.log("File moved!", file);
            resolve(file.nativeURL);
          }, function (err) {
            console.error("Fail to move the file", err);
            onError();
          });
        })["catch"](function () {
          onError();
        });
      }, function (err) {
        console.error("Failed to resolve the file", err);
        onError();
      });
    });
  },
  deleteImage: function deleteImage(imageUrl, showError) {
    return new Promise(function (resolve) {
      var onError = function onError() {
        if (showError) utils.createAlert("", i18next.t("dialogs.deleteLocalPhotoError"), i18next.t("dialogs.btnOk"));
        resolve();
      };

      window.resolveLocalFileSystemURL(imageUrl, function (file) {
        file.remove(function () {
          console.log("Photo removed successfully");
          resolve();
        }, function (err) {
          console.error("Error removing photo", err);
          onError();
        });
      }, function (err) {
        console.error("Error getting the photo", err);
        onError();
      });
    });
  },
  appendFile: function appendFile(formData, fileUri, showError) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      if (!fileUri) resolve(formData);
      window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
        fileEntry.file(function (file) {
          var reader = new FileReader();

          reader.onloadend = function () {
            var blob = new Blob([_this.result], {
              type: "image/png"
            });
            formData.append("image", blob);
            resolve(formData);
          };

          reader.onerror = function (fileReadResult) {
            console.error("Reader error ".concat(fileReadResult));
            utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
            reject();
          };

          reader.readAsArrayBuffer(file);
        }, function (err) {
          console.error("Error getting the fileEntry file ".concat(err));
          if (!showError) reject();
          utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
          reject();
        });
      }, function (err) {
        console.error("Error getting the file ".concat(err));
        if (!showError) reject();
        utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
        reject();
      });
    });
  },
  createAlert: function createAlert(title, msg, btn1) {
    var clbBtn1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var btn2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var clbBtn2 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    if (title === "") utils._$alertOverlay.find(".dialog-title").hide();else utils._$alertOverlay.find(".dialog-title").html(title);

    utils._$alertOverlay.find(".dialog-text").html(msg);

    $("#alert-first-button").html(btn1).unbind("click").click(function () {
      utils.closeAlert();
      if (clbBtn1) clbBtn1();
    });

    if (btn2) {
      $("#alert-second-button").show().html(btn2).unbind("click").click(function () {
        utils.closeAlert();
        if (clbBtn2) clbBtn2();
      });
    }

    utils._$alertOverlay.find(".dialog-wrapper").show();

    utils._$alertOverlay.show();
  },
  closeAlert: function closeAlert() {
    utils._$alertOverlay.hide().children(".dialog-text").html("");

    utils._$alertOverlay.find(".dialog-title").show().html("");

    $("#alert-second-button").hide();

    utils._$alertOverlay.find(".dialog-wrapper").hide();
  },
  openLoader: function openLoader() {
    utils._$alertOverlay.find(".spinner-wrapper").show();

    utils._$alertOverlay.show();
  },
  closeLoader: function closeLoader() {
    utils._$alertOverlay.hide();

    utils._$alertOverlay.find(".spinner-wrapper").hide();
  },
  logOrToast: function logOrToast(msg, duration) {
    if (!App.isCordova) {
      console.log(msg);
      return;
    }

    window.plugins.toast.show(msg, duration, "bottom");
  },
  changeSelectorLabel: function changeSelectorLabel(selectorId) {
    var changeColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var $selector = $("#" + selectorId),
        $label = $("[for='" + selectorId + "'").find(".label-description");

    if ($selector.val() === "none") {
      $label.html(i18next.t("selectors." + selectorId + "DefLabel"));
      if (changeColor) $label.css("color", "#757575");
    } else {
        $label.html($selector.find("option:selected").text());
        if (changeColor) $label.css("color", "#000000");
      }
  },
  resetSelector: function resetSelector(selectorId) {
    $("#" + selectorId).get(0).selectedIndex = 0;
    utils.changeSelectorLabel(selectorId);
  },
  openImgScreen: function openImgScreen(scr) {
    var editable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var clbEdit = arguments.length > 2 ? arguments[2] : undefined;
    var clbCancel = arguments.length > 3 ? arguments[3] : undefined;
    $("#img-screen-container img").attr("src", scr);
    $("#img-screen-close").click(function () {
      return utils.closeImgScreen();
    });

    if (editable) {
      $("#img-screen-edit").unbind("click").click(function () {
        utils.closeImgScreen();
        clbEdit();
      }).parent().show();
      $("#img-screen-delete").show().unbind("click").click(function () {
        utils.createAlert("", i18next.t("dialogs.photoScreen.deletePictureConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
          clbCancel();
          utils.closeImgScreen();
        });
      }).parent().show();
    }

    $("#img-screen").show();
  },
  closeImgScreen: function closeImgScreen() {
    $("#img-screen").hide();
    $("#img-screen-container img").attr("src", "");
    $("#img-screen-edit").parent().hide();
    $("#img-screen-delete").parent().hide();
  },
  r: function r(url) {
    return window.resolveLocalFileSystemURL(url, function (fileEntry) {
      return console.log(fileEntry);
    }, function (err) {
      return console.error(err);
    });
  }
};
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SettingsActivity = function () {
  function SettingsActivity() {
    _classCallCheck(this, SettingsActivity);

    this._screen = $("#page--settings");
    this.initSettingsUi();
    this.initAccountUi();
  }

  _createClass(SettingsActivity, [{
    key: "open",
    value: function open() {
      $("#expert-cbx").prop("checked", App.isExpertMode);

      this._screen.show();
    }
  }, {
    key: "close",
    value: function close() {
      this._screen.scrollTop(0).hide();
    }
  }, {
    key: "initSettingsUi",
    value: function initSettingsUi() {
      var _this = this;

      $("#settings-close").click(function () {
        return _this.close();
      });
      $("#settings-account-wrapper").click(function () {
        if (app.isGuest) {
          utils.createAlert("", i18next.t("dialogs.profileGuest"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
            _this.logout();

            app.isGuest = false;
          });
          return;
        }

        if (!navigator.onLine) {
          utils.createAlert("", i18next.t("dialogs.profileOffline"), i18next.t("dialogs.btnOk"));
          return;
        }

        $("#page--account-settings").show();
      });
      $("#expert-cbx").click(function () {
        localStorage.setItem("mode", (!App.isExpertMode).toString());
      });
      $("#settings-language-wrapper").click(function () {
        utils.logOrToast(i18next.t("settings.notImplemented"), "long");
      });
      $("#settings-help-wrapper").click(function () {
        utils.logOrToast(i18next.t("settings.notImplemented"), "long");
      });
    }
  }, {
    key: "initAccountUi",
    value: function initAccountUi() {
      var _this2 = this;

      var screen = $("#page--account-settings");
      $("#account-close").click(function () {
        return screen.scrollTop(0).hide();
      });
      $("#account-edit-profile").click(function () {
        utils.openLoader();
        user.get(LoginActivity.getInstance().userId).then(function (data) {
          $("#edit-profile-age").val(data.age);
          utils.changeSelectorLabel("edit-profile-age", true);
          $("#edit-profile-gender").val(data.gender);
          utils.changeSelectorLabel("edit-profile-gender", true);
          $("#edit-profile-occupation").val(data.occupation);
          utils.changeSelectorLabel("edit-profile-occupation", true);
          $("#page--edit-profile").show();
          utils.closeLoader();
        });
      });
      $("#account-change-mail").click(function () {
        return $("#change-email").show();
      });
      $("#account-change-pw").click(function () {
        $("#change-pw").show();
      });
      $("#account-logout").click(function () {
        utils.createAlert("", i18next.t("settings.account.logoutConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
          screen.scrollTop(0).hide();

          _this2.logout();
        });
      });
      this.initChangeEmail();
      this.initChangePw();
      this.initEditProfile();
    }
  }, {
    key: "initChangeEmail",
    value: function initChangeEmail() {
      var _this3 = this;

      var close = function close() {
        $("#change-email").scrollTop(0).hide();
        $("#new-email").val("");
      };

      $("#change-email-close").click(function () {
        return close();
      });
      $("#change-email-done").click(function () {
        utils.openLoader();
        var email = $("#new-email").val();

        if (email === "") {
          utils.closeLoader();
          utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
          return;
        }

        user.putEmail(LoginActivity.getInstance().userId, email).then(function () {
          utils.closeLoader();
          close();
          $("#page--account-settings").scrollTop(0).hide();

          _this3.logout();

          utils.createAlert(i18next.t("settings.account.changeEmail.successTitle"), i18next.t("settings.account.changeEmail.successMessage"), i18next.t("dialogs.btnOk"));
        });
      });
    }
  }, {
    key: "initChangePw",
    value: function initChangePw() {
      var close = function close() {
        $("#change-pw").scrollTop(0).hide();
        $("#change-pw-old-password").val("");
        $("#change-pw-new-password").val("");
        $("#change-pw-confirm-password").val("");
      };

      $("#change-pw-close").click(function () {
        return close();
      });
      $("#change-pw-done").click(function () {
        utils.openLoader();
        var oldPassword = $("#change-pw-old-password").val(),
            newPassword = $("#change-pw-new-password").val(),
            confirmPassword = $("#change-pw-confirm-password").val();

        if (oldPassword === "") {
          utils.logOrToast(i18next.t("messages.insertOldPassword"), "long");
          utils.closeLoader();
          return;
        }

        if (newPassword === "" || newPassword.length < 8 || !/\d/.test(newPassword)) {
          utils.logOrToast(i18next.t("messages.weakNewPassword"), "long");
          utils.closeLoader();
          return;
        }

        if (oldPassword === newPassword) {
          utils.logOrToast(i18next.t("messages.samePassword"), "long");
          utils.closeLoader();
          return;
        }

        if (newPassword !== confirmPassword) {
          utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
          utils.closeLoader();
          return;
        }

        user.putPassword(LoginActivity.getInstance().userId, oldPassword, newPassword, confirmPassword).then(function () {
          utils.closeLoader();
          close();
          utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");
        });
      });
    }
  }, {
    key: "initEditProfile",
    value: function initEditProfile() {
      var close = function close() {
        $("#page--edit-profile").scrollTop(0).hide();
        $("#edit-profile-age").val("");
        utils.changeSelectorLabel("edit-profile-age", true);
        $("#edit-profile-gender").val("");
        utils.changeSelectorLabel("edit-profile-gender", true);
        $("#edit-profile-occupation").val("");
        utils.changeSelectorLabel("edit-profile-occupation", true);
      };

      $("#edit-profile-close").click(function () {
        return close();
      });
      $("#edit-profile-done").click(function () {
        utils.openLoader();
        var age = $("#edit-profile-age").val(),
            gender = $("#edit-profile-gender").val(),
            occupation = $("#edit-profile-occupation").val();
        user.putProfile(LoginActivity.getInstance().userId, JSON.stringify({
          age: age,
          gender: gender,
          occupation: occupation
        })).then(function (data) {
          $("#edit-profile-age").val(data.age);
          utils.changeSelectorLabel("edit-profile-age", true);
          $("#edit-profile-gender").val(data.gender);
          utils.changeSelectorLabel("edit-profile-gender", true);
          $("#edit-profile-occupation").val(data.occupation);
          utils.changeSelectorLabel("edit-profile-occupation", true);
          utils.closeLoader();
          close();
          utils.logOrToast(i18next.t("messages.editProfileSuccess"), "long");
        });
      });
      $("#edit-profile-age").change(function () {
        return utils.changeSelectorLabel("edit-profile-age", true);
      });
      $("#edit-profile-gender").change(function () {
        return utils.changeSelectorLabel("edit-profile-gender", true);
      });
      $("#edit-profile-occupation").change(function () {
        return utils.changeSelectorLabel("edit-profile-occupation", true);
      });
    }
  }, {
    key: "logout",
    value: function logout() {
      this.close();
      MapActivity.getInstance().close();
      LoginActivity.getInstance().logout();
      LoginActivity.getInstance().open();
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!SettingsActivity._instance) SettingsActivity._instance = new SettingsActivity();
      return SettingsActivity._instance;
    }
  }]);

  return SettingsActivity;
}();

_defineProperty(SettingsActivity, "_instance", void 0);
