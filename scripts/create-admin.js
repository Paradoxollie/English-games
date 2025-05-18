import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../src/config/app.config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
    try {
        const username = 'ollie';
        const password = 'admin123'; // À changer après la première connexion
        const email = `${username}@english-quest.com`;

        console.log('Creating admin user...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Admin user created:', userCredential.user.uid);

        // Créer le document utilisateur dans Firestore
        const userData = {
            username,
            isAdmin: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        console.log('Admin user document created successfully');
        console.log('Admin credentials:');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdminUser(); 