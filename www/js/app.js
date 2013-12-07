var $search_form = null;
var $search_query = null;
var $search_results = null;
var $results_list = null;
var $faqs = [];

var faqs_index = null;

if (!String.prototype.trim) {  
    String.prototype.trim = function () {  
        return this.replace(/^\s+|\s+$/g,'');  
    };  
} 

var setup_search = function() {
    faqs_index = lunr(function () {
        this.field('question', { boost: 10 })
        this.field('answer')
        this.ref('id')
    });

    for (var i = 0; i < FAQS.length; i++) 
    {
        var faq = FAQS[i];

        faqs_index.add({
            id: i,
            question: faq['question'],
            answer: faq['answer']
        });
    }
}

var search = function(query) {
    $results_list.empty();
    //$faqs.hide();

    var results = faqs_index.search(query);

    for (var i = 0; i < results.length; i++) {
        var id = parseInt(results[i].ref);
        var faq = FAQS[id];

        $results_list.append('<li><a href="#faq-' + id + '">' + faq.question + '</a></li>');
        //$faqs.eq(i).show();
    }  

    $search_results.show();
}

var throttled_search = _.throttle(search, 250);

var search_query_keyup = function(e) {
    e.preventDefault();

    var query = $search_query.val().trim();

    if (query.length >= 3) {
        throttled_search(query);
    } else if (query.length == 0) {
        $search_results.hide();
    }

    return false;
}

$(function() {
    $search_form = $('#search');
    $search_query = $('#query');
    $search_results = $('#results');
    $results_list = $('#results ul');
    $faqs = $('.faq');

    setup_search();

    $search_query.on('keyup', search_query_keyup);
});
