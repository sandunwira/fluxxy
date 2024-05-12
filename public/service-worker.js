// Define a name for the current cache
var cacheName = 'v1';

// List all the files you want to cache
var cacheFiles = [
	'/',
	'/index.html',
	'/css/style.css',
	'/js/script.js',
	'https://i.postimg.cc/mZJ0wS0v/logo.png'
	// Add other files and assets here
];

// Call Install Event
self.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			return cache.addAll(cacheFiles);
		})
	);
});

// Call Activate Event
self.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				cacheNames.map(function (thisCacheName) {
					if (thisCacheName !== cacheName) {
						return caches.delete(thisCacheName);
					}
				})
			)
		})
	)
});

// Call Fetch Event
self.addEventListener('fetch', function (e) {
	e.respondWith(
		caches.match(e.request).then(function (res) {
			return res || fetch(e.request).then(function (response) {
				return caches.open(cacheName).then(function (cache) {
					cache.put(e.request, response.clone());
					return response;
				});
			});
		})
	);
});