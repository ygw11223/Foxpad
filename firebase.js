import apiConfig from 'apiKeys';
const firebase = require('firebase');

// Initialize Firebase
var config = {
  apiKey: apiConfig.apiKey,
  authDomain: apiConfig.authDomain,
  databaseURL: apiConfig.databaseURL,
  projectId: apiConfig.projectId,
  storageBucket: apiConfig.storageBucket,
  messagingSenderId: apiConfig.messagingSenderId
};
firebase.initializeApp(config);

module.exports = firebase;
