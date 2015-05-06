var external = module.exports;

external.filter = function(feed) {
  return feed.title && !/\b(comments|comentarii)\b/gi.test(feed.title);
};
