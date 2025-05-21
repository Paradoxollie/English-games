/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");

admin.initializeApp();

const db = admin.firestore();
const saltRounds = 10;

/**
 * Creates a new user account with username and hashed password.
 */
exports.registerUser = functions.https.onCall(async (data, context) => {
  const {username, password} = data;

  if (!username || !password) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Username and password are required.",
    );
  }

  if (password.length < 6) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Password must be at least 6 characters long.",
    );
  }

  try {
    // Check if username already exists
    const usersRef = db.collection("users");
    const query = usersRef.where("username", "==", username).limit(1);
    const snapshot = await query.get();

    if (!snapshot.empty) {
      throw new functions.https.HttpsError(
          "already-exists",
          "Username already taken.",
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user document in Firestore, let Firestore generate the ID
    const newUserRef = usersRef.doc(); // Auto-generate ID
    const uid = newUserRef.id;

    const newUser = {
      username: username,
      hashedPassword: hashedPassword,
      isAdmin: false, // Default for new users
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      level: 1,
      xp: 0,
      coins: 100, // Default coins
      avatar: {
        head: "default_boy",
        body: "default_boy",
        accessory: "none",
        background: "default",
      },
      inventory: [
        {id: "default_boy", type: "head"},
        {id: "default_girl", type: "head"},
        {id: "default_boy", type: "body"},
        {id: "default_girl", type: "body"},
        {id: "none", type: "accessory"},
        {id: "default", type: "background"},
      ],
      achievements: [],
      settings: {
        theme: "dark",
        notifications: true,
        sound: true,
      },
      // Do NOT store email here
    };

    await newUserRef.set(newUser);

    // Create Firebase Auth user with the Firestore document ID as UID
    try {
      await admin.auth().createUser({uid: uid, displayName: username});
    } catch (authError) {
      console.error(
          "Error creating Firebase Auth user after Firestore doc:",
          authError,
      );
      throw new functions.https.HttpsError(
          "internal",
          "Failed to create full user profile.",
          authError.message,
      );
    }

    return {success: true, uid: uid, message: "User registered successfully."};
  } catch (error) {
    console.error("Error in registerUser function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError as is
    }
    const errorMessage = "An internal error occurred during registration.";
    throw new functions.https.HttpsError(
        "internal",
        error.message || errorMessage,
    );
  }
});

/**
 * Logs in a user with username and password, generates a custom token.
 * Handles migration from plaintext password to hashed password.
 */
exports.logInUser = functions.https.onCall(async (data, context) => {
  const {username, password} = data;

  if (!username || !password) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Username and password are required.",
    );
  }

  try {
    const usersRef = db.collection("users");
    const query = usersRef.where("username", "==", username).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      throw new functions.https.HttpsError(
          "not-found",
          "Invalid username or password.",
      );
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    let passwordMatch = false;

    if (userData.hashedPassword) {
      // User has a hashed password, compare with bcrypt
      passwordMatch = await bcrypt.compare(password, userData.hashedPassword);
    } else if (userData.password) {
      // Legacy user with plaintext password, attempt migration
      if (userData.password === password) {
        passwordMatch = true;
        const logMsg1 = `User ${username} (UID: ${uid}) logged in with `;
        const logMsg2 = "plaintext password. Migrating to hash.";
        console.log(logMsg1 + logMsg2);

        const newHashedPassword = await bcrypt.hash(userData.password, saltRounds);
        await usersRef.doc(uid).update({
          hashedPassword: newHashedPassword,
          password: admin.firestore.FieldValue.delete(), // Remove old password
        });
        console.log(
            `User ${username} (UID: ${uid}) migrated to hashed password.`,
        );
      } else {
        passwordMatch = false; // Plaintext password didn't match
      }
    } else {
      // No password field found (should not happen for existing users)
      const errTitle = "internal";
      const errMsg = "User record is missing password info."; // Shortened message
      throw new functions.https.HttpsError(errTitle, errMsg);
    }

    if (!passwordMatch) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Invalid username or password.",
      );
    }

    // Update last login time
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();
    await usersRef.doc(uid).update({lastLogin: serverTimestamp});

    // Create custom token
    const customToken = await admin.auth().createCustomToken(uid);

    return {success: true, token: customToken, uid: uid};
  } catch (error) {
    console.error("Error in logInUser function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError as is
    }
    const errorMessage = "An internal error occurred during login.";
    throw new functions.https.HttpsError(
        "internal",
        error.message || errorMessage,
    );
  }
});
