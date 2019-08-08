"use strict";

$(() => {

    let $flashMessage = $("#flash-message");

    $("#button").click(() => {

        $flashMessage.hide().html("").removeClass("success error");
        openLoader();

        $(".form-field").removeClass("error");
        $(".form-field-error").html("");

        const password        = $("#new-password").val(),
              confirmPassword = $("#confirm-password").val(),
              email           = $("#email").val(),
              token           = $("#token").val();

        let $pwField        = $("#password-field"),
            $confirmPwField = $("#confirm-password-field");

        if (password === "" || password.length < 8 || !(/\d/.test(password))) {
            closeLoader();
            $pwField.find(".form-field").addClass("error");
            $pwField.find(".form-field-error").html(
                "Password must be at least 8 characters long and must contain at least one number.");
            return;
        }

        if (password !== confirmPassword) {
            closeLoader();
            $confirmPwField.find(".form-field").addClass("error");
            $confirmPwField.find(".form-field-error").html("Passwords don't match.");
            return;
        }

        fetch(`${window.location.origin}/auth/new-password`, {
            method : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body   : JSON.stringify({
                password       : password,
                confirmPassword: confirmPassword,
                email          : email,
                token          : token
            })
        })
            .then(res => {

                if (res.status !== 201) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

                closeLoader();
                resetFields();
                showFlashMessage(true, "<strong>Success!</strong> Password reset.")
            })
            .catch(err => {
                console.error(err);

                let msg = "<strong>Error!</strong> ";

                if (err.code === 400)
                    msg = msg + "Token expired.";
                else if (err.code === 404)
                    msg = msg + "User not found.";
                else if (err.code === 422) {
                    msg = msg + "The entered data are incorrect.";
                } else
                    msg = msg + "Something went wrong on the server. Please, try again later.";

                closeLoader();
                resetFields();
                showFlashMessage(false, msg);
            });

    });

    function resetFields() {
        $(".form-field").removeClass("error");
        $(".form-field-error").html("");
        $("#new-password").val("");
        $("#confirm-password").val("");
    }

    function showFlashMessage(isSuccess, msg) {
        if (isSuccess)
            $flashMessage.addClass("success");
        else
            $flashMessage.addClass("error");

        $flashMessage.html(msg).show();
    }

    function openLoader() { $("#loader-overlay").show().find(".spinner-wrapper").show() }

    function closeLoader() { $("#loader-overlay").hide().find(".spinner-wrapper").hide() }

});