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

var mitMask = {
  'position': 'fixed',
  'width':'100%',
  'height':'100%',
  'left': '0',
  'bottom': '0',
  'z-index': '99999',
  'padding': '0',
  'background-color': 'rgba(0,0,0,.65)',
  'color': '#fff',
  'font-size': '1rem',
  'line-height': '1.5',
  'text-align':'center',
  'display': '-webkit-box',
  'display': '-webkit-flex',
  'display': 'flex',
  '-webkit-box-align': 'center',    
  '-webkit-justify-content': 'center',
  'justify-content': 'center',/* IE 11+,Firefox 22+,Chrome 29+,Opera 12.1*/
  '-webkit-box-pack': 'center',
  '-webkit-align-items': 'center',
  'align-items': 'center'
};

function Toast(text, type, disappearTime) {
  var self = this;
  text = text || '';
  if(type) {
    registerCss('mitMask', mitMask);
  }else{
    registerCss('mit-toast', mitToast);
  }
  disappearTime = disappearTime || 3500;
  self._init(text, type, disappearTime);
}

Toast.prototype = {
  _init: function(info,type, disappearTime) {
    var self = this;
    if(type){
      $('.mitMask').remove();
    }else{
      $('.mit-toast').remove();
    }
    self.show(info,type);

    if (disappearTime) {
      self.timer = setTimeout(function(){
        self.hide();
      }, disappearTime);
    }
  },
  show: function(info,type) {
    var self = this;
    var infoCon, infoWrap, toastCon;

    if (self.timer) {
      clearTimeout(self.timer);
    }

    infoCon = document.createTextNode(info);
    infoWrap = document.createElement('span');
    toastCon = document.createElement('div');
    if(type){
      toastCon.className = 'mitMask';
    }else{
      toastCon.className = 'mit-toast';
    }
    infoWrap.appendChild(infoCon);
    toastCon.appendChild(infoWrap);
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