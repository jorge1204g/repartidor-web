// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, get, child } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqWxR7_ZMDLuyy5kwQnFQQXeJyqINaDiw",
  authDomain: "prueba-pedidos-597b5.firebaseapp.com",
  databaseURL: "https://prueba-pedidos-597b5-default-rtdb.firebaseio.com/",
  projectId: "prueba-pedidos-597b5",
  storageBucket: "prueba-pedidos-597b5.firebasestorage.app",
  messagingSenderId: "665969476875",
  appId: "1:665969476875:web:0a9237c6212f980c3b4e0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, set, update, get, child };