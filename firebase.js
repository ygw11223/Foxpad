// import * as firebase from 'firebase';
const firebase = require('firebase');

// Initialize Firebase
var config = {
  apiKey: "AIzaSyB14NusDLxx5iPcdIfSdiZBN4HhiF6je1s",
  authDomain: "collaborative-drawing-d69f1.firebaseapp.com",
  databaseURL: "https://collaborative-drawing-d69f1.firebaseio.com",
  projectId: "collaborative-drawing-d69f1",
  storageBucket: "collaborative-drawing-d69f1.appspot.com",
  messagingSenderId: "957430309885"
};
firebase.initializeApp(config);

// var admin = require("firebase-admin");
//
// var serviceAccount = require("collaborative-drawing-d69f1-firebase-adminsdk-02pbp-562c33e034.json");
//
// admin.initializeApp({
// credential: admin.credential.cert(serviceAccount),
// databaseURL: "https://collaborative-drawing-d69f1.firebaseio.com"
// });

module.exports = firebase;
