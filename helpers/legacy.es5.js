// fix lazy loaded images
var lazyImages = document.querySelectorAll('img[src=""]');
for (i = 0; i < lazyImages.length; ++i) {
	lazyImages[i].setAttribute("src", lazyImages[i].dataset.src);
	console.log(lazyImages[i]);
}
