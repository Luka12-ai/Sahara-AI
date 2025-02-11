const uploadForm = document.getElementById('upload-form');
const imageUpload = document.getElementById('image-upload');
const resultContainer = document.getElementById('result');
const loadingAnimation = document.getElementById('loading');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = imageUpload.files[0];
  if (!file) {
    alert('Please upload an image first.');
    return;
  }

  // Show loading animation
  loadingAnimation.style.display = 'flex';
  resultContainer.innerHTML = '';

    // Replace the spinner with the new loader
    loadingAnimation.innerHTML = '<div class="loader loader1"></div><p>Processing your image...</p>';


  // Simulate API call delay
  setTimeout(() => {
    // Replace this with actual API call
    const imageUrl = URL.createObjectURL(file);
    displayResult(imageUrl);
    loadingAnimation.style.display = 'none';
     loadingAnimation.innerHTML = '<div class="spinner"></div> <p>Processing your image...</p>'; //Resets back to original animation if needed
  }, 3000); // Simulate 3 seconds processing time
});

function displayResult(imageUrl) {
  resultContainer.innerHTML = `
    <h3>Processed Image</h3>
    <img src="${imageUrl}" alt="Processed Image" class="result-image">
    <a href="${imageUrl}" download="processed-image.png" class="download-button">Download Image</a>
  `;
}