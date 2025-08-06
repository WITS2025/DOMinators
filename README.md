![Trip Trek -- Your Itinerary Planner](frontend/src/assets/TripTrekLogo.png) 

### Welcome to **TripTrek**, the ultimate tool for organizing your day, trip, or event with ease and clarity. Whether you're planning a vacation, a conference, or just your weekend, **TripTrek** helps you stay on track and in control.


## **Features**

### 🗓️ **Plan Your Trip**
Add activities with custom details like time, location, and notes.

### 🔄 **Update with Ease**
Change plans on the go. Update any part of your itinerary as your schedule evolves

### ❌ **Easy Deletion**
Remove activities that no longer fit your travel goals.

### 🤖 Built-In AI Travel Assistant
Ask our smart chatbot for trip planning advice, restaurant suggestions, weather tips, and more—right when you need it.

### 🔐 Personal & Public Trip Modes
Sign in to manage your private trips, or contribute to a shared public itinerary with others.

### 📍 Instant Directions to Your Phone
Get real-time Google Maps directions for each day’s plans, just one tap away.

### 📋 **Clean & Intuitive Interface**
Designed for simplicity and speed -- because planning should be fun, not frustrating.

## 👩‍💻 **Developers**
- Miriam Iny
- Sara Nechama Isenberg
- Temima Lewin
- Chana Leah Nissel

## 🛠️ **Development Stack**
This project uses React with Vite for a fast and modern frontend development experience, and Node.js for backend logic. It leverages AWS Lambda (via AWS SAM), Amazon DynamoDB and API Gateway to support a fully serverless architecture.

## 📥 **Installation**

#### To run the app locally, follow these steps:

### 1. Clone the repository
   ```bash
   git clone https://github.com/WITS2025/TripTrek.git
   cd TripTrek
   ```

### 2. Setup frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
#### Steps 3 and 4 are optional

### 3. Setup backend
   
   Ensure you have AWS CLI and AWS SAM CLI installed.
   ```bash
   cd ../backend
   npm run install-all
   sam build
   sam deploy
   ```
### 4. Connect frontend to backend
   
   Update frontend/context/TripContext.jsx line 17 and frontend/context/TripContext.test.jsx line 6
   
   Set the API base URL to the deployed API Gateway URL from the SAM deploy output. Make sure to include the trailing slash.
   ```bash
   const API_Endpoint =  'https://your-api-endpoint.amazonaws.com/'
   ```

### Using the AI Travel Assistant (OpenAI API Key)

To enable the built-in AI features:

1. [Create an OpenAI API key](https://platform.openai.com/account/api-keys).
2. In the `frontend` folder, create a `.env` file:
   ```env
   VITE_OPENAI_API_KEY=your-api-key-here
3. Upload the fine-tuning files via CLI:
   ```
   openai api files upload --file training.jsonl --purpose fine-tune
   openai api files upload --file validation.jsonl --purpose fine-tune
4. Create the fine-tuned model:
   ```
   openai api fine_tunes.create \
      -t file-xxxxxxxxxxxxxxxxxxx \
      -v file-yyyyyyyyyyyyyyyyyyy \
      -m gpt-3.5-turbo
5. Replace the fine-tuned model ID in the Chatbox component line 8
   ```
   const FINETUNED_MODEL_ID = "ft:your-finetuned-model-id-here";
   ```

## 📌 **Why TripTrek?**
### Because life is better when it's organized. Whether you're a meticulous planner or a spontaneous adventurer, **TripTrek** gives you the flexibility to build and adjust your itinerary on the fly.
