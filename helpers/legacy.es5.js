// fix lazy loaded images
var lazyImages = document.querySelectorAll(
	'img[src=""],img[src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"]'
);
for (i = 0; i < lazyImages.length; ++i) {
	lazyImages[i].setAttribute('src', lazyImages[i].dataset.src);
	console.log(lazyImages[i]);
}
