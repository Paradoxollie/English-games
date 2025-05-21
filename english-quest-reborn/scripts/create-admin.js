import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocs, updateDoc, query, where, deleteField, serverTimestamp, collection } from 'firebase/firestore';
import bcrypt from 'bcryptjs'; // Using bcryptjs for client-side compatibility
import { firebaseConfig } from '../src/config/app.config.js'; // Assuming this is your client-side config

// Initialize Firebase App (client-side)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const adminUsername = 'Ollie';
const adminPassword = 'Imyets182!'; // The password to set/hash
const saltRounds = 10; // bcryptjs uses rounds directly

async function ensureAdminSecure() {
    try {
        console.log(`Ensuring admin user "${adminUsername}" is configured securely (client-side hashing)...`);

        // Hash the password using bcryptjs
        console.log(`Hashing password for "${adminUsername}"...`);
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        console.log('Password hashed using bcryptjs.');

        // Find user in Firestore by username
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '==', adminUsername));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.error(`Error: User "${adminUsername}" not found in Firestore. Please ensure the user exists.`);
            // Note: This script is designed to update an existing admin, not create one from scratch here.
            // Creation will be handled by the main auth-service.js registration flow.
            return;
        }

        const userDocSnapshot = snapshot.docs[0];
        const userId = userDocSnapshot.id;
        console.log(`Found user "${adminUsername}" with ID: ${userId} in Firestore.`);

        // Prepare data for update
        const updateData = {
            hashedPassword: hashedPassword,
            isAdmin: true,
            password: deleteField(), // Remove the old plaintext password field
            lastPasswordUpdate: serverTimestamp() // Optional: track when password was last hashed
        };

        // Update Firestore document
        await updateDoc(doc(db, 'users', userId), updateData);
        console.log(`Firestore document for "${adminUsername}" (ID: ${userId}) updated with hashed password and isAdmin=true. Plaintext password field removed.`);

        console.log(`Admin user "${adminUsername}" (ID: ${userId}) is now securely configured with client-side compatible hash.`);
        console.log(`Username: ${adminUsername}`);
        console.log(`Password to use (will be hashed by client on login): ${adminPassword}`);

    } catch (error) {
        console.error('Error ensuring admin user (client-side script):', error);
        // Add more specific error handling if needed
    }
}

ensureAdminSecure(); 