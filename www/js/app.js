var MOBILE = Modernizr.touch;

var $body = null;
var $search_form = null;
var $search_query = null;
var $search_results = null;
var $search_term = null;
var $all_answers = null;
var $results_list = null;
var $faqs_wrapper = null;
var $faqs = [];

var faqs_index = null;

/*
 * Strip whitespace from strings.
 */
if (!String.prototype.trim) {  
    String.prototype.trim = function () {  
        return this.replace(/^\s+|\s+$/g,'');  
    };  
} 

/*
 * Scroll to a given element.
 */
var scroll_to = function($el) {
    var top = $el.offset().top;
    console.log(top);
    $body.scrollTop(top);
};

/*
 * Jump back to the top of the page.
 */
var back_to_top = function() {
    $body.scrollTo($content, { duration:450 }, 'y');
    return false;
};

/*
 * Create and populate the search index.
 */
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

/*
 * Execute a search.
 */
var search = function(query) {
    $search_results.hide();
    $all_answers.hide();
    $results_list.empty();
    $faqs_wrapper.empty();

    var results = faqs_index.search(query);

    for (var i = 0; i < results.length; i++) {
        var id = parseInt(results[i].ref);
        var faq = FAQS[id];

        $results_list.append('<li><a href="#answer/' + id + '">' + faq.question + '</a></li>');
        $faqs_wrapper.append($faqs.eq(id).clone());
    }  

    $search_term.text(query);
    $search_results.show();
}

/*
 * A throttled version of the search, to run
 * while typing.
 */
var throttled_search = _.throttle(search, 250);

/*
 * Execute throttled searches.
 */
var on_search_query_keyup = function(e) {
    e.preventDefault();

    var query = $search_query.val();

    if (query.length >= 3) {
        hasher.setHash('search/' + query);
        throttled_search(query);
    } else {
        $all_answers.show();
        $faqs_wrapper.html($faqs.clone());
        $search_results.hide();
    }

    return false;
}

/*
 * Respond to url changes.
 */
var on_hash_changed = function(new_hash, old_hash) {
    var bits = new_hash.split('/');
    var hash_type = bits[0];
    var hash_args = bits[1];

    if (hash_type == 'search') {
        $search_query.val(hash_args);
        throttled_search(hash_args);
    } else if (hash_type == 'answer') {
        var $faq = $('#faq-' + hash_args);
        scroll_to($faq);
    }

    // TODO: use events instead
    //_gaq.push(['_trackPageview', location.pathname + '#' + new_hash]);

    return false;
};

$(function() {
    $body = $('body');
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

    // Event handlers
    $search_query.on('keyup', on_search_query_keyup);

    // Set up the hasher bits to grab the URL hash.
    hasher.changed.add(on_hash_changed);
    hasher.initialized.add(on_hash_changed);
    hasher.init();
});
