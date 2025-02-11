const backgroundForm = document.getElementById('background-removal-form');
const backgroundUpload = document.getElementById('background-upload');
const backgroundResult = document.getElementById('background-result');
const loadingAnimation = document.getElementById('loading');

const API_KEY = 'ERhS76GuBh5fTQDj4Bhf32SV'; // Replace with your Remove.bg API key
const API_URL = 'https://api.remove.bg/v1.0/removebg';

// Show preview of the uploaded image
backgroundUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            backgroundResult.innerHTML = `
                <h3>Preview</h3>
                <img src="${event.target.result}" alt="Preview" class="preview-image">
            `;
        };
        reader.readAsDataURL(file);
    }
});

// Handle form submission
backgroundForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = backgroundUpload.files[0];
    if (!file) {
        alert('Please upload an image first.');
        return;
    }

    // Show loading animation and message
    loadingAnimation.style.display = 'flex';
    backgroundResult.innerHTML = ''; //Clear the previous result

    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors[0].title || 'Failed to remove background.');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        displayResult(imageUrl);

    } catch (error) {
        console.error('Error:', error);
        backgroundResult.innerHTML = `<p class="error">${error.message}</p>`;
    } finally {
        loadingAnimation.style.display = 'none'; // Hide loading animation
    }
});

// Display the result
function displayResult(imageUrl) {
    backgroundResult.innerHTML = `
        <h3>Background Removed</h3>
        <img src="${imageUrl}" alt="Background Removed Image" class="result-image">
        <a href="${imageUrl}" download="no-bg.png" class="download-button">Download Image</a>
    `;
}