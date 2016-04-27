'use strict';

require('../../zepto/zepto');

function registerCss(className, styles ){

  var cssText = "", styleArray = [];
  for ( var key in styles ){
    styleArray.push(key + ':' + styles[key]);
  }
  cssText = '.' + className + '{' +styleArray.join(';') + '}';
  var style=document.createElement("style");
  var head=document.getElementsByTagName("head")[0];
  if(!head){
    return;
  };
  if(document.all){
    style.setAttribute("type","text/css");
    style.styleSheet.cssText=cssText;
  }else{
    style.appendChild(document.createTextNode(cssText));
  };
  if(head.firstChild){
    head.insertBefore(style,head.firstChild);
  }else{
    head.appendChild(style);
  };
};

var mitToast = {
  'position': 'fixed',
  'left': '50%',
  'bottom': '50%',
  'z-index': '99999',
  'padding': '1rem 3rem',
  'background-color': 'rgba(0,0,0,.65)',
  'color': '#fff',
  'font-size': '1rem',
  'line-height': '1.5',
  'border-radius': '0.5rem',
  '-webkit-transform': 'translateX(-50%)',
  'transform': 'translateX(-50%)'
};

registerCss('mit-toast', mitToast);

function Toast(text, disappearTime) {
  var self = this;
  text = text || '';
  disappearTime = disappearTime || 3500;
  self._init(text, disappearTime);
}
Toast.prototype = {
  _init: function(info, disappearTime) {
    var self = this;

    $('.mit-toast').remove();
    self.show(info);
    if (disappearTime) {
      self.timer = setTimeout(function(){
        self.hide();
      }, disappearTime);
    }
  },
  show: function(info) {
    var self = this;
    var infoCon, toastCon;

    if (self.timer) {
      clearTimeout(self.timer);
    }

    infoCon = document.createTextNode(info);
    toastCon = document.createElement('div');
    toastCon.className = 'mit-toast';
    toastCon.appendChild(infoCon);
    document.body.appendChild(toastCon);

    self.toastCon = toastCon;
  },
  hide: function() {
    var self = this;
    if (self.toastCon) {
      $(self.toastCon).remove();
    }
  }
};

module.exports = Toast;