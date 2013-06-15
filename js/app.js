// var api = "AIzaSyAbXMOmMjcXU2VkDjjYWYvRPMDyVYF8t_Q";
// var apiUrl = "https://www.googleapis.com/webfonts/v1/webfonts?key=" + api;
// var systemFonts = ['Times', 'Helvetica Neue', 'Helvetica', 'Georgia'];
// var loadedFonts = [];
// var elements = [];


// var fonts = {
//     system: {
//         families: []
//     },
//     google: {
//         families: []
//     },
//     typekit: {
//         families: []
//     }
// };


// ===================== Mediator to handle cross-view events
//http://addyosmani.com/largescalejavascript/#mediatorpattern
var mediator = (function(){
    var subscribe = function(channel, fn){
        if (!mediator.channels[channel]) mediator.channels[channel] = [];
        mediator.channels[channel].push({ context: this, callback: fn });
        return this;
    },

    publish = function(channel){
        if (!mediator.channels[channel]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
            var subscription = mediator.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        return this;
    };

    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        installTo: function(obj){
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    };

}());


// ===================== Backbone Stuff =====================

// STUFF TODO

//refactor model change functions into model and out of views

// ============

(function ($) {
// #Model
var activeModel;
Element = Backbone.Model.extend({
    defaults: {
        "tag": "h1",
        "content": "Click to begin editing..."
    },
    initialize: function(){
        console.log('Element Initialized');
        this.on('change', function(){
            console.log('Values for model changed');
        });
    },
    setType: function(newType, newValue) {
        this.set(newType, newValue);
    },
    active: function(){

        activeModel = this;
        activeCid = this.cid;
        mediator.publish('activeChange', activeCid);
        return this;
    }
});

// Font = Backbone.Model.extend({
//     defaults: {
//         'family': 'Helvetica Neue'
//     }
// });

// #Collection
Elements = Backbone.Collection.extend({
    model: Element
});
// #Views
//MONEY

PropertiesView = Backbone.View.extend({
    events: {
        "click .newElement": "createElement",
        "change input": "modifyModel"
    },
    initialize: function() {
        this.template = _.template($("#template-properties").html());
        mediator.subscribe('activeChange', this.populateFields);
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    },

    createElement: function(e) {
        var thisTag = $(e.currentTarget).data('element');
        var newEle = new Element({tag: thisTag});
        elements.add(newEle);

    },

    modifyModel: function(e) {
        var target = $(e.currentTarget);
        var styleProperty = target.data('style');
        var styleValue = target.val();
        var model = elements.get(activeCid);
        model.setType(styleProperty, styleValue);
    },

    populateFields: function() {
        var fields = $('input');
        var model = elements.get(activeCid);
        fields.each(function(){
            propType = $(this).data('style');
            if (model.get(propType) !== null) {
                $(this).val(model.get(propType));
            }
        });
    }
});

//Element View
ElementView = Backbone.View.extend({
    events: {
        "click": "activate" //select model to manipulate
    },
    initialize: function() {
        this.template = _.template($("#template-element").html());
        this.model.on('change', this.render, this);
        this.model.active();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.attr('contenteditable', true);
        this.$el = this.updateStyle(this.$el);
        activeModel = this.model; // Sets Active Model to most recently added element
        activeCid = this.model.cid;
        return this;
    },

    // Sets Active Model to the selected element
    activate: function(e) {
        this.model.active();
        return this.model;
    },

    updateStyle: function(element) {
        // Loops through each property of model
        _.each(this.model.toJSON(), function(value, key){
            //sets element style to values from model
            if (key !== 'content' && key !== 'tag') {
                element = element.css(key,value);
            }
        });
        return element;
    }
});

//Elements view
ElementsView = Backbone.View.extend({
    el: $('#content'),

    initialize: function() {
        elements = new Elements(); //define collection (this could likely use refactoring)
        this.render();
        elements.on('add', this.render, this);
        elements.on('change', this.render, this);
    },
    render: function() {
        var that = this;
        that.$el.html(''); //clears #content (could likely use refactoring)
        //Loops through elements in collection and calls render
        _.each(elements.models, function (element){
            that.renderElement(element);
        }, this);
    },

    renderElement: function(element) { //renders individual element
        var elementView = new ElementView({
            tagName: element.get('tag'),
            model: element
        });
        this.$el.append(elementView.render().el);
        console.log('rendered');
    }
});

HomeView = Backbone.View.extend({

    initialize: function() {
        console.log('home view initialized');
        this.propertiesView = new PropertiesView();
        this.elementsView = new ElementsView();
        this.render();
    },

    render: function() {
        console.log('rendering');
        $('#properties').html(this.propertiesView.render().el);
    }
});


appView = new HomeView(); //initialize app


})(jQuery);

// ===================== End Backbone Stuff =================
// function TextBlock() {
//     var $el = this;
//         this.elemStyles = {
//             elemType : 'h1',
//             elemFontSize : '',
//             elemFontFamily : 'Helvetica Neue, Helvetica, Arial, sans-serif',
//             elemFontWeight : '',
//             elemLineHeight : '',
//             elemMarginBottom : '',
//             elemMarginTop : '',
//             elemFontStyle : '',
//             elemTextAlign : ''

//         };

//     this.createElement = function() {
//         $elementList.append(this);
//     };

//     this.setStyles = function(target) {
//         $(target).css({
//             fontSize: this.elemStyles.elemFontSize,
//             fontFamily: this.elemStyles.elemFontFamily,
//             fontWeight: this.elemStyles.elemFontWeight,
//             lineHeight: this.elemStyles.elemLineHeight,
//             marginBottom: this.elemStyles.elemMarginBottom,
//             marginTop: this.elemStyles.elemMarginTop,
//             fontStyle: this.elemStyles.elemFontStyle,
//             textAlign: this.elemStyles.elemTextAlign
//         });
//     };

// }
// var header1 = new TextBlock();

// function compileFonts() {
//     var google = getGoogleFonts();
//     fonts.system.families = systemFonts;
//     fonts.google.families = google;
//     //Typekit TBD
// }

// // Get Google Webfonts

// function getGoogleFonts() {
//     var output = [];
//     $.ajax({
//         dataType: 'json',
//         // url: apiUrl,
//         url: '../google.json',
//         async: false,
//         success: function(fonts) {
//             $.each(fonts.items, function(key,val){
//             // console.log(val['family']);
//             output.push(val['family']);
//             });
//         }
//     });
//     return output;
// }

// // Combine all Fonts into single Array, write select list
// function generateFontList() {
//     var fontList = [];
//     for (var val in fonts) {
//         // console.log(fonts[val]);
//         for (var fam in fonts[val]) {
//             fontList = fontList.concat(fonts[val][fam]);
//         }
//     }
//     // console.log(fontList);
//     var select = "";
//     for (val in fontList) {
//         // select += '<option value="' + fontList[val] + '">' + fontList[val] + '</option>';
//         select += '<li data-font="' + fontList[val] + '">' + fontList[val] + '</li>';

//     }
//     $('.font-list').append(select);

// }

// //Set fields to match current element

//     function setConfig(element) {
//         elemStyles = element.css();
//         controls = $('#controls > [data-style]');
//         for (var i=0; i <= controls.length-1; i++) {
//             dataValue = $(controls[i]).data('style');
//             cleanValue = elemStyles[dataValue].replace(/'/g, "");
//             $(controls[i]).val(cleanValue);
//         }
//     }

// function loadFont(data) {
//     for (var x in fonts.google.families) {
//         if (data === fonts.google.families[x])
//         {
//             tempArray = [data];
//             WebFont.load({
//                 google: {families: tempArray}
//             });
//         }
//     }
//     }


// // check if font has already been loaded, if not load & add to loaded array
// function checkIsLoaded(fontName) {

//         if (loadedFonts.indexOf(fontName) === -1) {
//             loadedFonts.push(fontName);
//             loadFont(fontName);
//         }
// }



// $(document).ready(function() {
//     content = $('#content');
//     compileFonts();
//     generateFontList();


// //Events

// target = $('#content').children().first(); // set default target
// //Get Target

//     $('#content').on('click','h1, h2, h3, h4, h5, p' ,function() {
//         target = $(this);
//         // console.log(target.css());
//         setConfig(target);
//     });

// //Font-Family
//     $('.font-list').on("click", "li", function(){
//        family = $(this).data('font');
//         checkIsLoaded(family); //load family
//         $(target).css({
//             'fontFamily' : family
//         });
//     });
// //property change
//     $('body').on('keyup', 'input', function() {
//         property = $(this).data('style');
//         value = $(this).val();
//         $(target).css(property, value);
//     });

// //New Paragraph

//     $('#js-newElement').on('click', function(e){
//         e.preventDefault();
//         var element = $('<p contenteditable>');
//         element.text('Enter some Text');
//         content.append(element);
//     });



// //Panel Actions
// $fontPanel = $('#fonts');
// $settingsPanel = $('#settings');

// $('.toolbar a').on('click', function(e){
//     e.preventDefault();
//     switch ($(this).data('link')) {
//         case 'fonts':
//         $fontPanel.addClass('activePanel');
//         $settingsPanel.removeClass('activePanel');
//         break;

//         case 'settings':
//         $fontPanel.removeClass('activePanel');
//         $settingsPanel.addClass('activePanel');
//         break;
//     }
// });

// }); //end