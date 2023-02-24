function ValidateEmail(input) {

    var validRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

    if (input.value.match(validRegex)) {

        alert("Valid email address!");

        document.form1.text1.focus();

        return true;

    } else {

        alert("Invalid email address!");

        document.form1.text1.focus();
        $(this).attr("placeholder", "Please complete field");
        return false;

    }

}
function CheckPassword(inputtxt) {
    var passw = /^[A-Za-z]\w{7,14}$/;
    if (inputtxt.value.match(passw)) {
        alert('Correct, try another...')
        return true;
    }
    else {
        alert('Wrong...!')
        return false;
    }
}
