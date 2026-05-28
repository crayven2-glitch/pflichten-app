// ── Firebase Cloud Messaging ──
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC_FCW4xncM1O4Yq9f5sHjNF5f7UFnHUXA",
  authDomain: "pflichten-app-f1ebe.firebaseapp.com",
  databaseURL: "https://pflichten-app-f1ebe-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pflichten-app-f1ebe",
  storageBucket: "pflichten-app-f1ebe.firebasestorage.app",
  messagingSenderId: "83874401171",
  appId: "1:83874401171:web:485509d6dc9d790978b666"
});

const messaging = firebase.messaging();

// FCM auto-displays notification from the notification field,
// so we don't call showNotification() here to avoid duplicates
messaging.onBackgroundMessage((payload) => {
  console.log('Push: background message received');
});

// ── Notification Click → open app ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      return clients.openWindow('./');
    })
  );
});

// ── Cache (PWA offline) ──
const CACHE_NAME = 'pflichten-v32';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebasedatabase') || e.request.url.includes('gstatic.com') || e.request.url.includes('fcmregistrations')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
