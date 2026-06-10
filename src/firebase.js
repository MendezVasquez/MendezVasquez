import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  query,
  where
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCreCWQ0h9l7s3-vr0fisghqmaTVbfvXYs",
  authDomain: "mendezvasquez-ebcb3.firebaseapp.com",
  projectId: "mendezvasquez-ebcb3",
  storageBucket: "mendezvasquez-ebcb3.firebasestorage.app",
  messagingSenderId: "1095757592237",
  appId: "1:1095757592237:web:8495d15d901ef2d7433824",
  measurementId: "G-9CH4144SK1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  query,
  where,
  ref,
  uploadBytes,
  getDownloadURL
};