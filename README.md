![alt text](frontend/src/assets/TripTrekLogo.png) 

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
Designed for simplicity and speed-because planning should be fun, not frustrating.

## 👩‍💻 **Developers**
- Miriam Iny
- Sara Nechama Isenberg
- Temima Lewin
- Chana Leah Nissel

## 🛠️ **Development Stack**
This project uses React with Vite for a fast and modern frontend development experience, and Node.js for backend logic. It leverages AWS Lambda (via AWS SAM) and Amazon DynamoDB to support a fully serverless architecture.

## 📥 **Installation**

#### To run the app locally, follow these steps:

1. Clone the repository
   ```bash
   git clone https://github.com/WITS2025/TripTrek.git
   cd TripTrek

2. Setup frontend
   ```bash
   cd frontend
   npm install
   npm run dev

#### Steps 3 and 4 are optional

3. Setup backend
   
   Ensure you have AWS CLI and AWS SAM CLI installed.
   ```bash
   cd ../backend
   npm run install-all
   sam build
   sam deploy

4. Update frontend/pages/Trips.jsx line 11
   ```bash
   const API_Endpoint =  'https://your-api-endpoint.amazonaws.com/'

## 📌 **Why TripTrek?**
### Because life is better when it's organized. Whether you're a meticulous planner or a spontaneous adventurer, **TripTrek** gives you the flexibility to build and adjust your itinerary on the fly.
