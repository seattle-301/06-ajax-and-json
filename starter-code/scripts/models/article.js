function Article (opts) {
  for (var keys in opts) {
    this[keys] = opts[keys];
  }
}

/* DONE: Instead of a global `articles = []` array, let's track this list of all
 articles directly on the constructor function. Note: it is NOT on the prototype.
 In JavaScript, functions are themselves objects, which means we can add
 properties/values to them at any time. In this case, we have a key:value pair
 to track, that relates to ALL of the Article objects, so it does not belong on
 the prototype, as that would only be relevant to a single instantiated Article.
 */

Article.allArticles = [];

Article.prototype.toHtml = function(scriptTemplateId) {
  var template = Handlebars.compile($(scriptTemplateId).text());
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
  this.body = marked(this.body);
  return template(this);
};

/* NOTE: There are some other functions that also relate to all articles,
 rather than just single instances. Object-oriented programming would
 call these "class-level" functions, that are relevant to the entire "class"
 of objects that are Articles, rather than just one instance. */

/* DONE: Refactor this code into a function for greater control.
    It will take in our data, and process it via the Article constructor: */

Article.loadAll = function(inputData) {
  inputData.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  })
  .forEach(function(ele) {
    Article.allArticles.push(new Article(ele));
  });
  articleView.renderIndexPage();
};

/* This function below will retrieve the data from either a local or remote
 source, process it, then hand off control to the View: */
Article.fetchAll = function() {
  if (localStorage.hackerIpsum) {
    $.ajax({
      type: 'HEAD',
      url: '/data/hackerIpsum.json',
      success: function(data, message, xhr) {
        var eTag = xhr.getResponseHeader('eTag');
        if (!localStorage.eTag || eTag !== localStorage.eTag) {
          Article.getAll();
        } else {
          Article.loadAll(JSON.parse(localStorage.hackerIpsum));
        }
      }
    });
  } else {
    Article.getAll();
  }
};

Article.getAll = function(nextFunction) {
  $.getJSON('/data/hackerIpsum.json', function(responseData, message, xhr) {
    localStorage.eTag = xhr.getResponseHeader('eTag');
    Article.loadAll(responseData);
    localStorage.hackerIpsum = JSON.stringify(responseData);
  });
};
