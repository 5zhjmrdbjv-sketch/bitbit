importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// 🔴 取得した鍵①（firebaseConfigの中身）をここにも上書きしてください
const firebaseConfig = {
  apiKey: "AIzaSyADifxTaToaXXNOZe3eQy8vDvXazMYpnXo",
  authDomain: "btc-alert-app.firebaseapp.com",
  projectId: "btc-alert-app",
  storageBucket: "btc-alert-app.firebasestorage.app",
  messagingSenderId: "133245742001",
  appId: "1:133245742001:web:57400351affca95901eb90",
  measurementId: "G-KJ5BBLBESG"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// バックグラウンドで通知を受け取って表示する処理
messaging.onBackgroundMessage(function(payload) {
  console.log('バックグラウンド通知を受信しました: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png' // PWAのアイコンを使用
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
