
	function isSupportStorage(cb) {
		var val = window.localStorage && window.localStorage.getItem('webpsupport');
		if (val !== null) {
			cb(val === 'true');
			return;
		}
		isSupportTest(function (isSupport) {
			try {
				window.localStorage && window.localStorage.setItem('webpsupport', isSupport);
			} catch (error) {
				console.log(error);
			}

			cb(isSupport);
		});
	}

	function isSupportTest(cb) {
		var img = new Image(), loaded;
		img.onload = img.onerror = function () {
			if (!loaded) {
				loaded = true;
				cb(img.width === 2 && img.height === 2);
			}
		};
		setTimeout(function () {
			if (!loaded) {
				loaded = true;
				cb(false);
			}
		}, 16);
		img.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
	}

	var WebP = window.WebP = {};
	WebP.isSupport = function (cb) {
		if (!cb) return;
		if (WebP._isSupport === undefined) {
			isSupportStorage(function (isSupport) {
				cb(WebP._isSupport = isSupport);
			});
			return;
		}
		cb(WebP._isSupport);
	};

	module.exports= WebP;