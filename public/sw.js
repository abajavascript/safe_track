self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
});

// self.addEventListener("fetch", (event) => {
//   console.log("Fetching:", event.request.url);
// });

self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("Push event received:", data); // Debug log
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
  });
});
