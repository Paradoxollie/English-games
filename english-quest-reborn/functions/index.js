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
      coins: 0,
      avatar: {
        head: "default_boy_head",
        body: "default_boy_body",
        accessory: "default",
        background: "default_background",
      },
      // New inventory format
      inventory: {
        skins: {
          head: ["default_boy_head", "default_girl_head"],
          body: ["default_boy_body", "default_girl_body"],
          accessory: ["default"],
          background: ["default_background"],
        },
        items: [],
      },
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
 * Perform a Gacha draw atomically on the server.
 * Params: { uid (optional: taken from auth), boxId, count }
 * Cost: 100 coins par tirage (coins uniquement)
 * Returns: { success, results: [{type, id, rarity, isDuplicate, compensationCoins}], newTotals: { coins }, inventory }
 */
exports.performGachaDraw = functions.https.onCall(async (data, context) => {
  try {
    const count = Math.min(Math.max(parseInt(data?.count || 1, 10), 1), 10);
    const uid = context.auth?.uid || data?.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const userRef = db.collection('users').doc(uid);
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      const user = snap.data();

      // Ensure currencies
      const currentCoins = user.coins || 0;
      const costPerDraw = 100;
      const totalCost = costPerDraw * count;

      if (currentCoins < totalCost) {
        throw new functions.https.HttpsError('failed-precondition', 'Not enough coins');
      }

      // Ensure inventory structure
      const inv = user.inventory && user.inventory.skins ? user.inventory : {
        skins: { head: [], body: [], accessory: [], background: [] }, items: []
      };

      // Loot pool and rarity rates
      const pool = {
        head: [
          { id: 'default_boy_head', rarity: 'common' },
          { id: 'default_girl_head', rarity: 'common' },
          { id: 'bear_head', rarity: 'epic' }
        ],
        body: [
          { id: 'default_boy_body', rarity: 'common' },
          { id: 'default_girl_body', rarity: 'common' },
          { id: 'bear_body', rarity: 'epic' }
        ],
        accessory: [
          { id: 'default', rarity: 'common' }
        ],
        background: [
          { id: 'default_background', rarity: 'common' }
        ]
      };

      // Rarity distribution
      const rarityRates = [
        { rarity: 'legendary', rate: 0.02 },
        { rarity: 'epic', rate: 0.08 },
        { rarity: 'rare', rate: 0.25 },
        { rarity: 'common', rate: 0.65 }
      ];

      // Helper: pick rarity
      const pickRarity = () => {
        const r = Math.random();
        let acc = 0;
        for (const rr of rarityRates) {
          acc += rr.rate;
          if (r < acc) return rr.rarity;
        }
        return 'common';
      };

      // Helper: pick item by type and rarity (fallback to available)
      const pickItem = (type, targetRarity) => {
        const candidates = pool[type].filter(x => x.rarity === targetRarity);
        const list = candidates.length ? candidates : pool[type];
        return list[Math.floor(Math.random() * list.length)];
      };

      const typesCycle = ['head', 'body', 'accessory', 'background'];
      const results = [];
      let newCoins = currentCoins;

      for (let i = 0; i < count; i++) {
        const type = typesCycle[i % typesCycle.length];
        const rarity = pickRarity();
        const item = pickItem(type, rarity);

        const owned = (inv.skins[type] || []).includes(item.id);
        let compensation = 0;
        if (owned) {
          // Duplicate compensation by rarity
          compensation = rarity === 'legendary' ? 500 : rarity === 'epic' ? 150 : rarity === 'rare' ? 50 : 15;
          newCoins += compensation;
        } else {
          if (!inv.skins[type]) inv.skins[type] = [];
          inv.skins[type].push(item.id);
        }

        results.push({ type, id: item.id, rarity, isDuplicate: owned, compensationCoins: compensation });
      }

      // Deduct cost
      newCoins -= totalCost;

      tx.update(userRef, {
        inventory: inv,
        coins: newCoins,
        lastGacha: admin.firestore.FieldValue.serverTimestamp(),
        gachaStats: {
          totalDraws: (user.gachaStats?.totalDraws || 0) + count,
          lastCurrency: currency
        }
      });

      return {
        results,
        newTotals: { coins: newCoins },
        inventory: inv
      };
    });

    return { success: true, ...result };
  } catch (error) {
    console.error('performGachaDraw error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error.message || 'Gacha error');
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
