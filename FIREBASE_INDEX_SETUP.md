# Firebase Index Setup Guide

## 🚨 Current Issues Fixed

Your frontend was failing due to missing Firestore composite indexes. I've implemented temporary fixes, but you should create the proper indexes for production.

## 🔧 Temporary Fixes Applied

I've modified these functions to work without indexes:
- `getInterviewsByUserId()` - Removed `orderBy("createdAt", "desc")`
- `getLatestInterviews()` - Removed `orderBy("createdAt", "desc")`

Both now sort results in memory instead of database-level ordering.

## 📋 Required Indexes

### 1. User Interviews Index
**Collection**: `interviews`
**Fields**:
- `userId` (Ascending)
- `createdAt` (Descending)

**Direct Link**:
```
https://console.firebase.google.com/v1/r/project/prepora-789dc/firestore/indexes?create_composite=ClBwcm9qZWN0cy9wcmVwb3JhLTc4OWRjL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkVsL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

### 2. Latest Interviews Index
**Collection**: `interviews`
**Fields**:
- `finalized` (Ascending)
- `userId` (Ascending)
- `createdAt` (Descending)

## 🚀 How to Create Indexes

### Option 1: Use Direct Links (Recommended)
Click the links above - they'll pre-fill the index creation form.

### Option 2: Manual Creation
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `prepora-789dc`
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Fill in the fields as specified above

## ⏱️ Index Build Time
- **Small collections**: 1-5 minutes
- **Large collections**: 10-30 minutes
- **Very large**: 1-2 hours

## 🔄 After Index Creation

Once indexes are built, you can restore the original queries by:
1. Uncomment the `.orderBy("createdAt", "desc")` lines
2. Remove the in-memory sorting code
3. Restart your Next.js server

## 📊 Current Status

✅ **Frontend**: Working (no more index errors)
✅ **Temporary Fix**: Applied (in-memory sorting)
⚠️ **Production**: Need to create indexes
⚠️ **Performance**: Slightly slower due to in-memory sorting

## 🎯 Next Steps

1. **Immediate**: Your frontend should now work without errors
2. **Short-term**: Create the required indexes using the links above
3. **Long-term**: Restore database-level ordering for better performance
