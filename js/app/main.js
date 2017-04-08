// debouncedresize: special jQuery event that happens once after a window resize
(function(a){var d=a.event,b,c;b=d.special.debouncedresize={setup:function(){a(this).on("resize",b.handler)},teardown:function(){a(this).off("resize",b.handler)},handler:function(a,f){var g=this,h=arguments,e=function(){a.type="debouncedresize";d.dispatch.apply(g,h)};c&&clearTimeout(c);f?e():c=setTimeout(e,b.threshold)},threshold:150}})(jQuery);

// Main Dashboard Page Script
ho.isValidDate = function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" ) {
    return false;
  }
  return !isNaN(d.getTime());
};

function isNewDay(date) {
  var today = new Date(localStorage.today);

  if ((today.getDate() !== date.getDate() && date.getHours() >= 5) || (today.getDate() == date.getDate() && date.getHours() >= 5 && today.getHours() < 5)) {
    return true;
  }

  return false;
}

function isDateInFuture(date) {
  return Date.parse(date) > Date.parse(new Date());
}

function ensureLocalStorageDatesAreValid() {
  var date = new Date();
  var dateKeys = ['today', 'backgroundUpdate'];

  for (var i in dateKeys) {
    var lsDate = new Date(localStorage[dateKeys[i]]);
    if (!ho.isValidDate(lsDate) || isDateInFuture(lsDate)) {
      console.log('resetting ' + dateKeys[i]);
      localStorage[dateKeys[i]] = date;
    }
  }
}

/** Models **/
ho.models.Date = Backbone.Model.extend({
    defaults: function () {
        var date = new Date();
        var hour12clock = JSON.parse(localStorage.hour12clock);
        return {
            date: date,
            hour12clock: hour12clock
        };
    },
    initialize: function(){
        this.listenTo(this, 'change:date', this.updateTime, this);
    },
    getTimeString: function(date) {
        var hour12clock = this.get('hour12clock');
        date = date || this.get('date');
        var hour = date.getHours();
        var minute = date.getMinutes();
        if (hour12clock == true) {
            hour = ((hour + 11) % 12 + 1);
        }
        if (hour < 10 && !hour12clock) { hour = "0" + hour; }
        if (minute < 10) { minute = "0" + minute; }
        return hour + ':' + minute;
    },
    getTimePeriod: function() {
        if (this.get('date').getHours() >= 12) { return 'PM'; } else { return 'AM' };
    },
    updateTime: function() {
        var now = this.getTimeString();
        if (this.get('time') != now) {
            this.set('time', now);
        }
    }
});


/** Collections **/



/** Views **/
ho.views.CenterClock = Backbone.View.extend({
    id: 'centerclock',
    template: Handlebars.compile( $("#centerclock-template").html() ),
    events: {
        "dblclick": "toggleFormat",
    },
    initialize: function () {
        this.render();
        this.listenTo(this.model, 'change:time', this.updateTime, this);
    },
    render: function () {
        var time = this.model.getTimeString();

        var variables = { time: time };
        var order = (this.options.order  || 'append') + 'To';

        this.$el[order]('#' + this.options.region).html( this.template(variables) ).fadeTo(500, 1);
        this.$time = this.$('.time');
        this.$format = this.$('.format');
    },
    toggleFormat: function () {
        var hour12clock = !this.model.get('hour12clock');
        this.model.set({ hour12clock: hour12clock });
        localStorage.hour12clock = hour12clock;
        if (hour12clock) {
            setTimeout(function(){
                $('.format').addClass('show');
            }, 40);
            this.$format.html(this.model.getTimePeriod());
        } else {
            $('.format').removeClass('show');
        }
    },
    updateTime: function () {
        this.$time.html(this.model.getTimeString());
    }
});

function setEndOfContenteditable(contentEditableElement) {
    var range, selection;
    if (document.createRange) { //Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
}

ho.views.Greeting = Backbone.View.extend({
    id: 'greeting',
    template: Handlebars.compile( $("#greeting-template").html() ),
    events: {
        "dblclick .name": "editName",
        "keypress .name": "onKeypress",
        "keydown .name": "onKeydown",
        "blur .name": "saveName",
        "webkitAnimationEnd .name": "onAnimationEnd"
    },
    initialize: function () {
        this.render();
        this.listenTo(this.model, 'change:time', this.updatePeriod, this);
    },
    render: function () {
        var period = this.getPeriod();
        var name = localStorage.name;
        var variables = { period: period, name: name };
        var order = (this.options.order  || 'append') + 'To';

        this.$el[order]('#' + this.options.region).html( this.template(variables) ).fadeTo(500, 1);

        this.$period = this.$('.period');
        this.$name = this.$('.name');
    },
    getPeriod: function () {
        var now = this.model.get('date');
        var hour = now.getHours();
        var period;
        if (hour >= 3 && hour < 12) period = 'morning';
        if (hour >= 12 && hour < 17) period = 'afternoon';
        if (hour >= 17 || hour < 3) period = 'evening';
        return period;
    },
    updatePeriod: function () {
        this.$period.html(this.getPeriod());
    },
    editName: function () {
        if (!this.$name.hasClass('editing')) {
          this.$name.attr('contenteditable', true).addClass('editing pulse').focus();
          setEndOfContenteditable(this.$name.get(0));
        }
    },
    onAnimationEnd: function (e) {
      if (e.originalEvent.animationName === "pulse") {
        this.$name.removeClass('pulse');
      }
    },
    onKeypress: function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            this.saveName();
        }
    },
    onKeydown: function (e) {
        if (e.keyCode === 27) {
            this.$name.html(localStorage.name); //revert
            this.doneEditingName();
        }
    },
    saveName: function () {
        var newName = this.$name.html();
        if (newName === "") {
          this.$name.html(localStorage.name); //revert
        } else {
          localStorage.name = newName;
        }
        this.doneEditingName();
    },
    doneEditingName: function () {
        this.$name.attr('contenteditable', false).removeClass('editing').addClass('pulse');
    }
});



// Parent view
ho.views.Dashboard = Backbone.View.extend({
    initialize: function () {
        // set up empty localstorage variables for JSON.parse
        // remove this one we get sync set up
        if (!localStorage.hour12clock) {
            localStorage.hour12clock = false;
        }
        if (!localStorage['messageRead']) {
            localStorage['messageRead'] = JSON.stringify({ version: "0" });
        }
        if (!localStorage.name) {
            localStorage.name = "awesome person";
        }

        ho.models.date = new ho.models['Date']();

        ho.collect.backgrounds = new ho.collect.Backgrounds();
        ho.collect.backgrounds.fetch({async: false});
        ho.views.background = new ho.views.Background({
          collection: ho.collect.backgrounds,
          model: ho.models.date,
          region: 'background'
        });

/*
        ho.collect.weather = new ho.collect.Weather();
        ho.collect.weather.fetch({dataType: 'jsonp', async: false});
        ho.views.weather = new ho.views.Weather({
            collection: ho.collect.weather,
            model: ho.models.date,
            region: 'top-right'
        });
*/

        this.render();

        ensureLocalStorageDatesAreValid();

        this.dateIntervalId = setInterval(function () {
          ho.models.date.set('date', new Date());
        }, 100);
    },
    render: function () {
        // Load widgets
        ho.views.greeting = new ho.views.Greeting({ model: ho.models.date, region: 'center', order: 'prepend' });
        ho.views.centerClock = new ho.views.CenterClock({ model: ho.models.date, region: 'center', order: 'prepend' });
    }
});


$(function() {
    /* Create parent AppView */
    ho.appView = new ho.views.Dashboard();
});