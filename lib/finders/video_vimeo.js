var external = module.exports;
var utils = require('../utils');

external.find = function(page) {
  var list = [];

  page.dom('iframe', 'body').each(function() {
    var iframe = page.dom(this);
    var src = iframe.attr('src');
    if (!src) return;
    var result = /player\.vimeo\.com\/video\/(\d+)/i.exec(src);
    if (!result) return;

    var item = {
      //image: 'http://i.vimeocdn.com/video/'+result[1]+'_960.jpg',
      sourceId: result[1],
      sourceType: 'VIMEO'
    };

    var size = utils.getElementSize(iframe);
    if (!size || !size.width) return;

    item.width = size.width;
    item.height = size.height;

    list.push(item);
  });

  return list;
};
