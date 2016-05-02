;(function () {
  var tid = null;
  var docEl = document.documentElement;
  var BASE_WIDTH = 375;
  var ROOT_FONT_SIZE = 16;

	function refreshRem(){
    var width = docEl.getBoundingClientRect().width;
    if  ( width > 640) {
        width = width/2;
    }
    var rem = width / (BASE_WIDTH / ROOT_FONT_SIZE);
    docEl.style.fontSize = rem + 'px';
  }
  refreshRem();
  window.addEventListener('resize', function() {
    clearTimeout(tid);
    tid = setTimeout(refreshRem, 300);
  }, false);
})();