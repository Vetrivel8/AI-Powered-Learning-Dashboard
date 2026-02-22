# DevBeeZ 🧠✨

Welcome to DevBeeZ, a personal AI-powered learning companion built with React and the Google Gemini API. This application provides a suite of intelligent tools to create learner profiles, generate custom learning paths, create quizzes, analyze progress, and more.

## Features

DevBeeZ is equipped with a versatile toolkit to personalize and accelerate your learning journey:

-   **👤 Onboarding & Profile Generation:** Kicks off your journey by understanding your background, goals, and learning style to generate a detailed learner profile.
-   **🗺️ Adaptive Learning Plans:** Creates a customized, day-by-day learning plan tailored to your profile, breaking down complex topics into manageable tasks.
-   **💡 Micro-Lessons:** Generates concise, on-demand lessons in various formats (analogy, visual explanation, code snippets) on any topic you choose.
-   **❓ Dynamic Quizzes:** Creates custom quizzes that adapt in difficulty based on your proficiency and past performance on a topic.
-   **🚀 Project Explorer:** Helps you find real-world, open-source GitHub projects that match your interests and skill level, perfect for hands-on learning.
-   **📈 Progress Analysis:** Analyzes your activity log (completed lessons, quiz scores) to provide actionable insights and track your performance trends over time.
-   **📅 Weekly Reports:** Automatically summarizes your weekly activities, celebrates your accomplishments, identifies areas for focus, and suggests a concrete next step.
-   **✍️ Note Summarizer:** A handy floating bot that can instantly summarize any text you provide, from lecture notes to articles.

## Tech Stack

This project is built with a modern, lightweight, and build-free approach, making it incredibly simple to run and deploy.

-   **Framework:** **React 19** (served via CDN)
-   **AI Integration:** **Google Gemini API** (`@google/genai` library) for all intelligent features.
-   **Styling:** **Tailwind CSS** for a utility-first, futuristic UI design.
-   **Tooling:**
    -   **ES Modules (ESM):** The entire application is written using native browser modules.
    -   **Import Maps:** Manages dependencies like React and `@google/genai` directly in the browser, eliminating the need for a package manager or a bundler.
-   **Development:** VS Code with the **Live Server** extension for a zero-config local development experience.

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   A modern web browser (e.g., Chrome, Firefox, Edge).
-   [Visual Studio Code](https://code.visualstudio.com/) with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension installed.
-   A **Google Gemini API Key**. You can get one for free from [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key).

### Setup Instructions

#### Step 1: Set up Gemini API Key

1.  **Create `env.js`:**
    In the root of the project folder, create a new file named `env.js`.

2.  **Add Your API Key:**
    Open `env.js` and add the following code, replacing `'YOUR_GEMINI_API_KEY_HERE'` with your actual Gemini API key:

    ```javascript
    // env.js
    window.process = {
      env: {
        API_KEY: 'YOUR_GEMINI_API_KEY_HERE'
      }
    };
    ```

#### Step 2: Run the Application

1.  **Run with Live Server:**
    -   Open the project folder in VS Code.
    -   Right-click on the `index.html` file.
    -   Select **"Open with Live Server"** from the context menu.
    -   Your browser will automatically open and run the application.

That's it! You can now use DevBeeZ locally.

## Deployment

Since this is a static web application, it can be hosted on any static hosting provider (Netlify, Vercel, GitHub Pages, etc.).

> **⚠️ Security Warning:** The local development setup involves creating `env.js` with your API key. For a real-world public application, you should **never** expose your API keys on the client-side. Instead, you would build a backend proxy server to handle API requests securely. The method described here is for **personal use and prototyping only**.