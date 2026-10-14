/* Firebase Cloud Messaging background handler.
   Service workers can't read process.env, so the config is inlined here.
   These values are public by design. */
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDDZ0F5lLkryOQE6z94cHTbeJ32yrSUEHY",
  authDomain: "arise-699d5.firebaseapp.com",
  projectId: "arise-699d5",
  storageBucket: "arise-699d5.firebasestorage.app",
  messagingSenderId: "240250068289",
  appId: "1:240250068289:web:e31e2cff46cc5db59ed5c0",
});

firebase.messaging().onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "Ritualz";
  self.registration.showNotification(title, {
    body: payload.notification?.body ?? "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: payload.data?.tag ?? "ritualz",
    data: payload.data ?? {},
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      return clients.openWindow("/");
    }),
  );
});
