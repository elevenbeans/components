let Tabs = require('./tabs');
let Sticky = require('./sticky');
let Slider = require('./slide');

    //初始化页面整体Tabs
var tabs = new Tabs('#J_nav').plug(new Sticky()).plug(new Slider());