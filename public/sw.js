self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed", event);
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated", event);
});

// self.addEventListener("fetch", (event) => {
//   console.log("Service Worker: Fetching:", event.request.url);
// });

self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("Push event received:", data); // Debug log
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    data: { url: data?.data?.url },
    // requireInteraction: true, // Forces notification to stay visible until clicked
    // vibrate: [200, 100, 200], // Adds vibration for visibility
    // priority: "high",
  });
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification click event:", event.notification.data);
  event.notification.close(); // Close the notification

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          console.log("New Client URL:", client.url, client);
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // client.focus();
            return (
              client
                .navigate(event.notification.data.url)
                // .then(() => client.focus());
                .then(() => {
                  console.log(
                    "Client redirected however client object is not accessible.",
                    client
                  );
                  client.focus();
                  console.log("Client focused after redirecting.");
                })
            );
          }
        }
        return clients.openWindow(event.notification.data.url);
      })
  );
});
