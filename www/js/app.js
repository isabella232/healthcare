var $search_form = null;
var $search_query = null;
var $search_results = null;

var faqs_index = null;


if (!String.prototype.trim) {  
    String.prototype.trim = function () {  
        return this.replace(/^\s+|\s+$/g,'');  
    };  
} 

function setup_search() {
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

function search_form_submit(e) {
    e.preventDefault();

    $search_results.empty();
    
    var query = $search_query.val().trim();
    var results = faqs_index.search(query);

    for (var i = 0; i < results.length; i++) {
        var faq = FAQS[parseInt(results[i].ref)];

        $search_results.append('<li>' + faq.question + '</li>');
    }

    return false;
}

$(function() {
    $search_form = $('#search');
    $search_query = $('#query');
    $search_results = $('#results');

    setup_search();

    $search_form.on('submit', search_form_submit); 
});
