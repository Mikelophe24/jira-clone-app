# 🔒 FIRESTORE SECURITY RULES - DEPLOYMENT GUIDE

> **Created**: 06/01/2026  
> **File**: `firestore.rules`

---

## 📋 OVERVIEW

Firestore Security Rules đã được tạo để bảo vệ data trong multi-project system.

### 🔐 Security Features:

1. **Users Collection**

   - ✅ Anyone authenticated can read user profiles
   - ✅ Users can only edit their own profile

2. **Projects Collection**

   - ✅ Only project members can read project
   - ✅ Any authenticated user can create project
   - ✅ Only owner can update/delete project

3. **Tasks Collection**

   - ✅ Only project members can read/write tasks
   - ✅ Backward compatible (tasks without projectId)

4. **Comments Collection**
   - ✅ Any authenticated user can read
   - ✅ Only author can update/delete their comments

---

## 🚀 HOW TO DEPLOY

### Option 1: Firebase Console (Recommended for first time)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ngrx-jira-clone-app-7804a`
3. Navigate to **Firestore Database** → **Rules**
4. Copy content from `firestore.rules`
5. Paste into the editor
6. Click **Publish**

### Option 2: Firebase CLI

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

## 📝 RULES EXPLANATION

### Users Collection

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && isOwner(userId);
}
```

- Anyone logged in can see user profiles
- Users can only modify their own profile

### Projects Collection

```javascript
match /projects/{projectId} {
  allow read: if isProjectMember();
  allow create: if isAuthenticated();
  allow update, delete: if isProjectOwner();
}
```

- Only members can view project
- Anyone can create new project
- Only owner can modify/delete

### Tasks Collection

```javascript
match /tasks/{taskId} {
  allow read: if hasProjectAccess();
  allow create: if isAuthenticated();
  allow update, delete: if hasProjectAccess();
}
```

- Tasks are protected by project membership
- Backward compatible with tasks without projectId

---

## ✅ TESTING SECURITY RULES

### Test Scenarios:

1. **User Profile**

   - ✅ Can read other users' profiles
   - ❌ Cannot edit other users' profiles
   - ✅ Can edit own profile

2. **Projects**

   - ✅ Can create new project
   - ✅ Can read projects where I'm member
   - ❌ Cannot read projects where I'm not member
   - ✅ Owner can delete project
   - ❌ Member cannot delete project

3. **Tasks**
   - ✅ Can create task in my project
   - ✅ Can read tasks in my project
   - ❌ Cannot read tasks in other projects
   - ✅ Can update/delete tasks in my project

---

## 🧪 FIREBASE RULES SIMULATOR

Use Firebase Console Rules Simulator to test:

1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground**
3. Test different scenarios:

```
// Test: Read project as member
Location: /projects/PROJECT_ID
Auth: Authenticated user (member)
Operation: get
Expected: ✅ Allow

// Test: Read project as non-member
Location: /projects/PROJECT_ID
Auth: Authenticated user (not member)
Operation: get
Expected: ❌ Deny

// Test: Delete project as owner
Location: /projects/PROJECT_ID
Auth: Authenticated user (owner)
Operation: delete
Expected: ✅ Allow

// Test: Delete project as member
Location: /projects/PROJECT_ID
Auth: Authenticated user (member, not owner)
Operation: delete
Expected: ❌ Deny
```

---

## ⚠️ IMPORTANT NOTES

### Before Deploying:

1. **Backup existing rules** (if any)
2. **Test in Firebase Console** first
3. **Verify all scenarios** work correctly
4. **Monitor Firestore logs** after deployment

### After Deploying:

1. Test login/logout
2. Test create project
3. Test add member
4. Test create task
5. Verify permissions work correctly

---

## 🔧 TROUBLESHOOTING

### Issue: "Permission denied" errors

**Solution**:

- Check if user is authenticated
- Verify user is member of the project
- Check Firestore logs in Firebase Console

### Issue: Can't read tasks

**Solution**:

- Ensure task has `projectId` field
- Verify user is member of that project
- Check if project exists

### Issue: Can't add member

**Solution**:

- Ensure you're the project owner
- Verify member's email exists in users collection
- Check network logs for errors

---

## 📊 SECURITY CHECKLIST

Before going to production:

- [ ] Deploy Firestore security rules
- [ ] Test all CRUD operations
- [ ] Test permissions (owner vs member)
- [ ] Test with multiple users
- [ ] Monitor Firestore usage
- [ ] Set up budget alerts
- [ ] Enable Firestore backups

---

## 🎯 NEXT STEPS

After deploying rules:

1. ✅ Test the application thoroughly
2. ✅ Monitor Firestore logs
3. ✅ Add more granular permissions if needed
4. ✅ Consider adding rate limiting
5. ✅ Set up monitoring alerts

---

**File location**: `firestore.rules`  
**Deploy command**: `firebase deploy --only firestore:rules`
