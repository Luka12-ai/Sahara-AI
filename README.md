# Sahara AI

Sahara AI is a collection of web-based AI-powered tools designed to enhance and manipulate images and text. This repository contains the HTML, CSS, and JavaScript code for the Sahara AI website.

## Features

*   **Image Enhancement:** Upload an image and let AI enhance its quality.
*   **Background Removal:** Effortlessly remove the background from any image using AI.
*   **Text Humanizer:** Make AI-generated text sound more natural and bypass AI detectors.
*   **Chat:** Engage in conversations with various AI models.

## Technologies Used

*   HTML
*   CSS
*   JavaScript

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/<Luka12-ai>/Sahara-AI.git
    cd Sahara-AI
    ```

2.  **Open the HTML files in your browser:**

    *   `index.html` - Home page
    *   `background-removal.html` - Background Removal tool
    *   `ai-humanizer.html` - Text Humanizer tool
    *   `chat.html` - Chat interface

## API Keys

*   **Background Removal:** The background removal feature uses the Remove.bg API. You'll need to obtain an API key from [Remove.bg](https://www.remove.bg/) and replace the placeholder `API_KEY` in `background-removal.js` with your actual API key.

    ```javascript
    const API_KEY = 'YOUR_REMOVE_BG_API_KEY';
    ```

*   **Chat:** Chat tool uses Eduide API key for chatting. You'll need to obtain an API key from [Eduide API](https://www.eduide.cc/)

    ```javascript
    const API_URL = 'https://api.eduide.cc/v1';
    ```

## File Structure
