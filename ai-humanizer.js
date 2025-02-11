const humanizerForm = document.getElementById('humanizer-form');
const textInput = document.getElementById('text-input');
const readability = document.getElementById('readability');
const mode = document.getElementById('mode');
const humanizerResult = document.getElementById('humanizer-result');
const loadingAnimation = document.getElementById('loading');

humanizerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = textInput.value;
  if (!text) {
    alert('Please enter some text to humanize.');
    return;
  }

  // Show loading animation
  loadingAnimation.style.display = 'flex';
  humanizerResult.innerHTML = '';

    // Replace the spinner with the new loader
    loadingAnimation.innerHTML = '<div class="loader loader1"></div><p>Processing your text...</p>';


  // Simulate API call delay
  setTimeout(() => {
    // Replace this with actual API call
    const humanizedText = `Humanized Text: ${text}`; // Placeholder response
    displayResult(humanizedText);
    loadingAnimation.style.display = 'none';
     loadingAnimation.innerHTML = '<div class="spinner"></div> <p>Processing your text...</p>'; //Resets back to original animation if needed
  }, 3000); // Simulate 3 seconds processing time
});

function displayResult(text) {
  humanizerResult.innerHTML = `
    <h3>Humanized Text</h3>
    <p>${text}</p>
  `;
}