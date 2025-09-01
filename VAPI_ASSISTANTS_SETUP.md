# 🎯 Vapi Assistants Setup Guide
## Using Assistants Instead of Workflows (Recommended by Vapi)

### 📚 **Based on Vapi Documentation:**
According to [Vapi's official documentation](https://docs.vapi.ai/workflows/quickstart), **"We no longer recommend Workflows for new builds. Use Assistants for most cases or Squads for multi-assistant setups."**

### ✅ **Your Files:**
1. **`vapi-assistant-interview-generator.json`** - Generates interviews using ML
2. **`vapi-assistant-interviewer.json`** - Conducts interviews

## 🚀 **Step-by-Step Setup:**

### **Step 1: Import Interview Generator Assistant**
1. Go to **Vapi Dashboard** → **"Assistants"**
2. Click **"Create Assistant"**
3. Look for **"Import"** or **"Import JSON"** button
4. Upload `vapi-assistant-interview-generator.json`
5. Click **"Save"** or **"Create"**
6. **Copy the Assistant ID** (starts with `assistant_`)

### **Step 2: Import Interview Assistant**
1. Go to **"Assistants"** in your Vapi dashboard
2. Click **"Create Assistant"**
3. Look for **"Import"** or **"Import JSON"** button
4. Upload `vapi-assistant-interviewer.json`
5. Click **"Save"** or **"Create"**

### **Step 3: Update Your Project**
Update your `.env.local` with the Assistant ID:
```bash
# Replace with your actual Assistant ID
NEXT_PUBLIC_VAPI_ASSISTANT_ID=assistant_your_actual_id_here
```

### **Step 4: Update Your Code**
You'll need to update your `constants/index.ts` to use the Assistant ID instead of Workflow ID:

```typescript
export const interviewer = {
  assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!,
  // ... other config
};
```

### **Step 5: Test Everything**
```bash
# Test Vapi connection
node test_vapi.js

# Start your development server
npm run dev

# Go to http://localhost:3000/interview
# Create an interview to test the complete flow
```

## 🎯 **What Each Assistant Does:**

### **Assistant 1: Interview Generator**
- ✅ **Purpose**: Collects interview requirements and generates questions
- ✅ **ML Integration**: Triggers your ML models for question generation
- ✅ **Variables**: role, level, techstack, type, amount
- ✅ **Output**: Questions stored in database

### **Assistant 2: Interviewer**
- ✅ **Purpose**: Conducts voice interviews
- ✅ **ML Integration**: Uses ML-generated questions
- ✅ **Variables**: questions (from ML system)
- ✅ **Output**: Voice conversation with candidate

## 🎉 **Success Checklist:**
- [ ] ✅ Assistant 1 imported (Interview Generator)
- [ ] ✅ Assistant 2 imported (Interviewer)
- [ ] ✅ Assistant ID copied
- [ ] ✅ .env.local updated
- [ ] ✅ Code updated to use Assistant ID
- [ ] ✅ Vapi connection tested
- [ ] ✅ Complete flow tested

**Using Assistants instead of Workflows follows Vapi's current best practices!** 🚀

### 🔍 **Why This Approach is Better:**
- ✅ **Follows Vapi's current recommendations**
- ✅ **No JSON validation issues**
- ✅ **Simpler architecture**
- ✅ **Better support and documentation**
