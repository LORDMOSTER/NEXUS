# NexusOBE 🎓✨

Welcome to **NexusOBE**! This is a super cool web app for teachers and college staff. 

Imagine you are a teacher and you have to create a big, scary question paper for your students. It normally takes hours of typing, thinking, and checking rules, right? 
NexusOBE acts like a magical assistant! It uses AI to instantly generate exam questions (Part A, Part B, and Part C) that follow strict college rules (Bloom's Taxonomy). Once generated, you can edit it, generate a grading key, and download it as a PDF or Word document. 

---

## 🚀 How to Run the App (Super Easy!)

We made two simple buttons (Batch files) for you so you don't have to type commands every time.

1. **Start the Backend (The Brain 🧠):** 
   Double-click the `run-backend.bat` file in this folder. A black window will open. Leave it open!
   
2. **Start the Frontend (The Face 🧑‍💻):**
   Double-click the `run-frontend.bat` file. Another window will open. It will give you a link (like `http://localhost:5173/`). Copy and paste that link into your browser to see the app!

---

## 🔑 Setting up the Secret Keys (.env file)

For the AI to work, it needs a magical password (an API Key) from NVIDIA. Without this key, the AI will stay asleep!

Here is how you set it up:

1. Open the `server` folder.
2. Look for a file named exactly `.env`. (If it doesn't exist, create a new text file and name it `.env`).
3. Open the `.env` file with Notepad (or VS Code).
4. Inside the file, you need to paste your NVIDIA API Key like this:

\`\`\`env
# MongoDB Connection String
MONGO_URI=mongodb://127.0.0.1:27017/nexusobe

# JWT Secret for Login
JWT_SECRET=supersecret123

# NVIDIA API KEY - THIS IS THE MOST IMPORTANT ONE!
NVIDIA_API_KEY=nvapi-your-secret-key-goes-here
\`\`\`

**Where does the API key go?**
It goes right after `NVIDIA_API_KEY=`. Do not put quotes or spaces around it! Just paste the long string of letters and numbers provided by NVIDIA.

Once you save the `.env` file, **close the backend black window and run `run-backend.bat` again** so it can read the new secret key!

---

## 🛠️ What's Inside?
- **MongoDB**: Used to remember all the subjects, syllabus, and exams.
- **Neo4j**: A graph database used to connect teachers to subjects.
- **React + Vite**: Makes the website look beautiful and fast.
- **NVIDIA AI**: The super-smart brain that generates the questions.

Enjoy creating exams the easy way! 🎉
