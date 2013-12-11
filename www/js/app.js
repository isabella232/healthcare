var MOBILE = Modernizr.touch;

var $body = null;
var $content = null;
var $search_form = null;
var $search_query = null;
var $search_results = null;
var $search_term = null;
var $all_answers = null;
var $results_list = null;
var $faqs_wrapper = null;
var $faqs = [];
var $questions = null;

var faqs_index = null;
var first_hash = true;

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
    $body.scrollTop(top);
};

/*
 * Scroll to a given element.
 */
var toggle_answer = function() {
    event.preventDefault();
    $(this).parent().next().toggleClass('closed');
    $(this).find('span').text(function(){
        if ($(this).text() == '+'){
            return '–';
        } else {
            return '+';
        }
    });
        
};

/*
 * Jump back to the top of the page.
 */
var back_to_top = function() {
    scroll_to($content);

    return true;
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

    $search_term.text(query);
    $search_results.show();

    $faqs_wrapper.css('height', $faqs_wrapper.height() + 'px');

    $faqs_wrapper.find('.faq').removeClass('new-item').addClass('remove-item').delay(1000).queue(function(){
        $faqs_wrapper.empty();

        var results = faqs_index.search(query);

        for (var i = 0; i < results.length; i++) {
            var id = parseInt(results[i].ref);
            var faq = FAQS[id];
            var delay = (i + 1) * 250;

            $faqs_wrapper.append($faqs.eq(id).clone().addClass('hide').delay(delay).queue(function(next){
                $(this).removeClass('hide').addClass('new-item');
                next();
            }));


            if (i == results.length - 1){
                $faqs_wrapper.delay(delay).queue(function(next){
                    $(this).css('height', 'auto');
                    next();
                });
            }
        }

    });
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
    $content = $('#content');
    $search_form = $('#search');
    $search_query = $('#query');
    $search_results = $('#results');
    $search_term = $('#term');
    $all_answers = $('#all-answers');
    $results_list = $('#results ul');
    $faqs_wrapper = $('#faqs');
    $questions = $('.question a');

    // Make a copy of all FAQs on the page so we can easily
    // recreate them when we reorder them
    $faqs = $('.faq').clone();

    setup_search();

    // Event handlers
    $search_query.on('keyup', on_search_query_keyup);
    $faqs_wrapper.on('click', '.question a', toggle_answer);

    $faqs_wrapper.on('click', '.tags a', back_to_top)

    // Set up the hasher bits to grab the URL hash.
    hasher.changed.add(on_hash_changed);
    hasher.initialized.add(on_hash_changed);
    hasher.init();
});
