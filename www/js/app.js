var $search_form = null;
var $search_query = null;
var $search_results = null;
var $search_term = null;
var $all_answers = null;
var $results_list = null;
var $faqs_wrapper = null;
var $faqs = [];

var faqs_index = null;

if (!String.prototype.trim) {  
    String.prototype.trim = function () {  
        return this.replace(/^\s+|\s+$/g,'');  
    };  
} 

var setup_search = function() {
    faqs_index = lunr(function () {
        this.field('tags', { boost: 100 })
        this.field('question', { boost: 10 })
        this.field('answer')
        this.ref('id')
    });

    for (var i = 0; i < FAQS.length; i++) 
    {
        var faq = FAQS[i];

        faqs_index.add({
            id: i,
            tags: faq['tags'],
            question: faq['question'],
            answer: faq['answer']
        });
    }
}

var search = function(query) {
    $search_results.hide();
    $all_answers.hide();
    $results_list.empty();
    $faqs_wrapper.empty();

    var results = faqs_index.search(query);

    for (var i = 0; i < results.length; i++) {
        var id = parseInt(results[i].ref);
        var faq = FAQS[id];

        $results_list.append('<li><a href="#faq-' + id + '">' + faq.question + '</a></li>');
        $faqs_wrapper.append($faqs.eq(id).clone());
    }  

    $search_term.text(query);
    $search_results.show();
}

var throttled_search = _.throttle(search, 250);

var search_query_keyup = function(e) {
    e.preventDefault();

    var query = $search_query.val().trim();

    if (query.length >= 3) {
        throttled_search(query);
    } else {
        $all_answers.show();
        $faqs_wrapper.html($faqs.clone());
        $search_results.hide();
    }

    return false;
}

$(function() {
    $search_form = $('#search');
    $search_query = $('#query');
    $search_results = $('#results');
    $search_term = $('#term');
    $all_answers = $('#all-answers');
    $results_list = $('#results ul');
    $faqs_wrapper = $('#faqs');

    // Make a copy of all FAQs on the page so we can easily
    // recreate them when we reorder them
    $faqs = $('.faq').clone();

    setup_search();

    $search_query.on('keyup', search_query_keyup);
});
