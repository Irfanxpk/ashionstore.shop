$(document).ready(function () {
  // Function to clear error messages
  function clearErrors() {
    $(".text-danger").text("");
  }

  // Event handler to clear errors when input fields gain focus
  $("input").focus(function () {
    clearErrors();
  });

  $("form").submit(function (event) {
    // Reset any previous error messages
    clearErrors();

    // Get form field values
    var password = $("input[name='password']").val();
    var confirmPassword = $("input[name='confirmPassword']").val();
    var phone = $("input[name='phone']").val();

    // Validate password length (at least 6 characters)
    if (password.length < 6) {
      $("#passwordError").text("Password must be at least 6 characters");
      event.preventDefault();
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      $("#confirmPasswordError").text("Passwords do not match");
      event.preventDefault();
    }

    // Validate phone number (must be exactly 10 digits)
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      $("#phoneError").text("Phone number must be 10 digits");
      event.preventDefault();
    }

    // Check if any required fields are empty
    var requiredFields = ["firstName", "lastName", "email", "gender"];
    var emptyField = false;

    requiredFields.forEach(function (fieldName) {
      var fieldValue = $("input[name='" + fieldName + "']").val();
      if (!fieldValue.trim()) {
        $("#" + fieldName + "Error").text("This field is required");
        event.preventDefault();
        emptyField = true;
      }
    });

    if (emptyField) {
      event.preventDefault();
    }
  });
});
