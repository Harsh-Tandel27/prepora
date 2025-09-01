# 🎯 Vapi Setup Guide
## Complete Setup for Your ML-Powered Interview Platform

### 🚀 **Overview**

Vapi is the voice AI platform that powers your interview conversations. This guide will help you set up Vapi completely for your project.

---

## 📋 **Prerequisites**

### **1. Vapi Account**
- ✅ **Sign up** at [vapi.ai](https://vapi.ai)
- ✅ **Get API credentials** from your dashboard
- ✅ **Create a workflow** for interview generation

### **2. Project Setup**
- ✅ **Next.js project** (already set up)
- ✅ **Vapi SDK** installed (`@vapi-ai/web`)
- ✅ **Environment variables** configured

---

## 🔧 **Step 1: Get Vapi Credentials**

### **1.1 Sign Up for Vapi**
1. Go to [vapi.ai](https://vapi.ai)
2. Click "Sign Up" and create an account
3. Verify your email address

### **1.2 Get API Token**
1. Go to your **Vapi Dashboard**
2. Navigate to **API Keys** section
3. Copy your **Web Token** (starts with `vapi_web_`)

### **1.3 Create Workflow**
1. Go to **Workflows** in your dashboard
2. Click **"Create Workflow"**
3. Name it: `Interview Generation`
4. Copy the **Workflow ID**

---

## 🔧 **Step 2: Configure Environment Variables**

### **2.1 Create .env.local File**
Create a `.env.local` file in your project root:

```bash
# Vapi Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_web_token_here
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id_here

# Firebase Configuration (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### **2.2 Example .env.local**
```bash
# Vapi Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=vapi_web_1234567890abcdef
NEXT_PUBLIC_VAPI_WORKFLOW_ID=workflow_abc123def456

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## 🔧 **Step 3: Test Vapi Connection**

### **3.1 Create Test Script**
Create `test_vapi.js` in your project root:

```javascript
// Test Vapi Connection
const testVapiConnection = async () => {
  console.log('🧪 Testing Vapi Connection...\n');

  // Check environment variables
  const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
  const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;

  console.log('📋 Environment Variables:');
  console.log('Web Token:', webToken ? '✅ Set' : '❌ Missing');
  console.log('Workflow ID:', workflowId ? '✅ Set' : '❌ Missing');

  if (!webToken || !workflowId) {
    console.log('\n❌ Missing Vapi credentials!');
    console.log('Please set NEXT_PUBLIC_VAPI_WEB_TOKEN and NEXT_PUBLIC_VAPI_WORKFLOW_ID in your .env.local file');
    return;
  }

  try {
    // Test API connection
    console.log('\n📋 Testing Vapi API connection...');
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${webToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Vapi API connection successful!');
    } else {
      console.log('❌ Vapi API connection failed:', response.status);
    }

  } catch (error) {
    console.log('❌ Vapi connection error:', error.message);
  }

  console.log('\n🎉 Vapi connection test complete!');
};

// Run the test
testVapiConnection();
```

### **3.2 Run Test**
```bash
node test_vapi.js
```

---

## 🔧 **Step 4: Configure Vapi Workflow**

### **4.1 Interview Generation Workflow**
In your Vapi dashboard, create a workflow with this configuration:

```javascript
// Workflow Configuration
{
  "name": "Interview Generation",
  "description": "Generate interview questions using ML models",
  "steps": [
    {
      "type": "ai",
      "name": "Generate Questions",
      "prompt": "Generate {{amount}} interview questions for a {{role}} position at {{level}} level with {{techstack}} technology stack. Focus on {{type}} questions.",
      "variables": ["amount", "role", "level", "techstack", "type"]
    }
  ]
}
```

### **4.2 Voice Assistant Configuration**
Configure your voice assistant with these settings:

```javascript
// Voice Settings
{
  "provider": "11labs",
  "voiceId": "sarah",
  "stability": 0.4,
  "similarityBoost": 0.8,
  "speed": 0.9,
  "style": 0.5,
  "useSpeakerBoost": true
}
```

---

## 🔧 **Step 5: Test Complete Integration**

### **5.1 Start Development Server**
```bash
npm run dev
```

### **5.2 Test Interview Creation**
1. Go to `http://localhost:3000/interview`
2. Fill in interview details:
   - **Role**: Frontend Developer
   - **Level**: Medium
   - **Tech Stack**: JavaScript, React
   - **Type**: Technical
   - **Amount**: 5

3. Click **"Start Interview"**
4. Verify ML questions are generated
5. Test Vapi voice conversation

### **5.3 Expected Flow**
```
1. User fills form → ML generates questions
2. Vapi starts voice call → Uses ML questions
3. Real-time ML analysis → Speech quality insights
4. Interview ends → ML feedback generated
```

---

## 🎯 **Vapi Features in Your Project**

### **1. Voice Interview Generation**
```typescript
// ML generates questions, Vapi conducts interview
await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
  variableValues: {
    username: userName,
    userid: userId,
  },
});
```

### **2. Real-time Voice Conversations**
```typescript
// Vapi handles voice interactions
await vapi.start(interviewer, {
  variableValues: {
    questions: formattedQuestions, // Your ML questions!
  },
});
```

### **3. Speech-to-Text Transcription**
```typescript
// Vapi transcribes speech in real-time
const onMessage = (message: Message) => {
  if (message.type === "transcript") {
    // ML analyzes transcribed speech
    analyzeSpeechWithML(message.transcript);
  }
};
```

---

## 🚀 **Advanced Vapi Configuration**

### **1. Custom Voice Assistant**
```typescript
// In constants/index.ts
export const customInterviewer = {
  name: "ML-Powered Interviewer",
  firstMessage: "Hello! I'm your AI interviewer. Let's begin with some questions generated by our ML system.",
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an ML-powered interviewer. Use the provided questions and provide real-time feedback."
      }
    ]
  }
};
```

### **2. Error Handling**
```typescript
// Handle Vapi errors gracefully
vapi.on("error", (error: Error) => {
  console.error("Vapi Error:", error);
  // Show user-friendly error message
  setError("Voice connection failed. Please try again.");
});
```

### **3. Connection Status**
```typescript
// Track connection status
const [connectionStatus, setConnectionStatus] = useState("disconnected");

vapi.on("call-start", () => setConnectionStatus("connected"));
vapi.on("call-end", () => setConnectionStatus("disconnected"));
```

---

## 🎉 **Success Checklist**

### **✅ Environment Setup**
- [ ] Vapi account created
- [ ] API token obtained
- [ ] Workflow created
- [ ] Environment variables set
- [ ] `.env.local` file created

### **✅ Integration Testing**
- [ ] Vapi connection test passes
- [ ] ML question generation works
- [ ] Voice interview starts
- [ ] Real-time transcription works
- [ ] ML analysis displays correctly

### **✅ Production Ready**
- [ ] Error handling implemented
- [ ] Connection status tracked
- [ ] User feedback provided
- [ ] Performance optimized

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. "Vapi token not found"**
```bash
# Solution: Check .env.local file
NEXT_PUBLIC_VAPI_WEB_TOKEN=vapi_web_your_token_here
```

#### **2. "Workflow not found"**
```bash
# Solution: Verify workflow ID
NEXT_PUBLIC_VAPI_WORKFLOW_ID=workflow_your_id_here
```

#### **3. "Voice connection failed"**
- Check internet connection
- Verify microphone permissions
- Ensure browser supports WebRTC

#### **4. "ML analysis not working"**
- Check Python virtual environment
- Verify ML model files exist
- Check API endpoint responses

---

## 🎊 **Congratulations!**

Once you complete this setup, you'll have:

- ✅ **Vapi voice AI** integrated with your ML models
- ✅ **Real-time voice interviews** with ML-generated questions
- ✅ **Speech analysis** powered by your trained models
- ✅ **Complete interview workflow** from creation to feedback

**Your ML-powered interview platform is ready to go!** 🚀

---

*Next: Test your Vapi integration by creating an interview and conducting a voice conversation!*
