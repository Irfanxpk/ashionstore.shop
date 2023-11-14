
    // Set the OTP countdown duration in seconds
const otpDuration = 120;

let timer = otpDuration;
let timerInterval;
//otp = 1234

// Function to update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  document.getElementById('timer').innerText = `Time Left: ${timerDisplay}`;
}

// Function to start the countdown timer
function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    updateTimerDisplay();
    if (timer === 0) {
      clearInterval(timerInterval);
      document.getElementById("message").innerText =
        "⏳Time is up. Please request a new OTP.";
        document.getElementById("resendOtp").style.display = 'block';
    }
  }, 1000);
}

alertOver=function( id) { 
setTimeout(() => {
	
	document.getElementById((id)).style.display = 'none';
}, 5000);
}

// Start the timer when the page loads
startTimer();

$(document).ready(function() {
	$('#digit-group').find('input').each(function() {
		
		$(this).attr('maxlength', 1);
		$(this).on('keyup', function(e) {
			var parent = $($(this).parent());
			if(e.keyCode === 8 || e.keyCode === 37) {
				var prev = parent.find('input#' + $(this).data('previous'));
				if(prev.length) {
				$(prev).select();
			}
		} else if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 39) {
			var next = parent.find('input#' + $(this).data('next'));
			if(next.length) {
				$(next).select();
			} else {
				if(parent.data('autosubmit')) {
					parent.submit();
				}
			}
		}
	});
});
});



//===================resend otp===============

document.addEventListener("DOMContentLoaded", function () {
  const resendOtpButton = document.getElementById("resendOtp");

  resendOtpButton.addEventListener("click", function (event) {
    event.preventDefault();

    fetch("/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json(); // Parse the JSON response
        } else {
          throw new Error("Error resending OTP");
        }
      })
      .then((data) => {
        if (data.message) {
          document.getElementById("otpmsg").innerHTML = data.message;
          alert(data.message); // Display the success message
        } else {
          alert("Unexpected response format"); // Handle other response formats
        }
      })
      .catch((error) => {
        alert(error.message); // Display an error message
      });
  });
  
});