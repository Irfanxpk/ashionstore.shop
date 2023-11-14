// // Function to update the image previews
// function updateImagePreviews() {
//   var imageInput = document.getElementById("imageInput");
//   var previewContainer = document.getElementById("previewContainer");

//   // Clear the existing previews
//   previewContainer.innerHTML = "";

//   if (imageInput.files) {
//     for (var i = 0; i < imageInput.files.length; i++) {
//       var reader = new FileReader();
//       var previewImage = document.createElement("img");
//       previewImage.className = "preview-image";

//       reader.onload = (function (img) {
//         return function (e) {
//           img.src = e.target.result;
//         };
//       })(previewImage);

//       reader.readAsDataURL(imageInput.files[i]);
//       previewContainer.appendChild(previewImage);
//     }
//   }
// }

// // Add an event listener to the file input
// document
//   .getElementById("imageInput")
//   .addEventListener("change", updateImagePreviews);

// // Handle form submission (you can modify this for your specific needs)
// document
//   .getElementById("imageUploadForm")
//   .addEventListener("submit", function (e) {
//     e.preventDefault();
//     // Handle image upload and other form submission logic here
//   });

//   //==================maximum image alert==========================

//     document.addEventListener('DOMContentLoaded', function () {
//         const imageInput = document.getElementById('imageInput');
//         const maxImageCount = 6;

//         imageInput.addEventListener('change', function (e) {
//             if (e.target.files.length > maxImageCount) {
//                 alert(`Maximum ${maxImageCount} images allowed.`);
//                 e.target.value = ''; // Clear the file input
//             }
//         });
//     }); 
   
document.addEventListener("DOMContentLoaded", function () {
  const maxImageCount = 6;
  const previewContainer = document.getElementById("previewContainer");

  document
    .getElementById("imageInput")
    .addEventListener("change", function (e) {
      const selectedFiles = e.target.files;
      if (selectedFiles.length > maxImageCount) {
        alert(`Maximum ${maxImageCount} images allowed.`);
        e.target.value = ""; // Clear the file input
      } else {
        updateImagePreviews(selectedFiles);
      }
    });

  function updateImagePreviews(files) {
    previewContainer.innerHTML = ""; // Clear the existing previews

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const previewImage = document.createElement("img");
      previewImage.className = "preview-image";

      reader.onload = (function (img) {
        return function (e) {
          img.src = e.target.result;
        };
      })(previewImage);

      reader.readAsDataURL(files[i]);
      previewContainer.appendChild(previewImage);
    }
  }
});