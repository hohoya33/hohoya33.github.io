window.m = _.extend({
    $window: $(window),
    appView: "",
    globals: {},
    models: {},
    collect: {},
    views: {},
    addins: {},
    utils: {},
    bootstrappers: {}
}, Backbone.Events), Backbone.View = function(e) {
    return e.extend({
        constructor: function(t) {
            this.options = t || {}, e.apply(this, arguments)
        }
    })
}(Backbone.View);



m.models.Customization = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage("customization"),
    defaults: {
        weatherVisible: !0
    },
    initialize: function() {
        var e = this;
        e.fetching = !1, window.addEventListener("storage", function(t) {
            t.key && 0 === t.key.indexOf("customization-1") && (e.fetching = !0, e.fetch({
                success: function() {
                    e.fetching = !1
                },
                error: function() {
                    e.fetching = !1
                },
                reset: !0
            }))
        }, !1)
    },
    migrateOldSettings: function() {
        if (void 0 === this.get("temperatureUnit")) {
            var e = JSON.parse(localStorage.getItem("weather-1"));
            if (e) {
                var t = e.unit;
                this.save(t ? {
                    temperatureUnit: t
                } : {
                    temperatureUnit: "c"
                })
            } else this.save({
                temperatureUnit: "c"
            })
        }
    }
}),

m.models.Weather = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage("weather"),
    defaults: {
        location: "",
        woeid: "",
        fetchUnit: "c"
    }
}),

m.views.Weather = Backbone.View.extend({
    attributes: {
        id: "weather",
        "class": "metric weather"
    },
    template: Handlebars.compile($("#weather-template").html()),
    events: {
        "dblclick .metric-stat": "toggleUnit",
        "dblclick .location": "editLocation",
        "blur .location": "saveLocation",
        "webkitAnimationEnd .location": "onAnimationEnd"
    },
    initialize: function() {
        this.renderedOnce = !1;
        var e = (this.options.order || "append") + "To";
        this.$el[e]("#" + this.options.region).fadeTo(0, 0),
        this.listenTo(this.model, "change:updated", this.render),
        this.listenTo(m.models.customization, "change:temperatureUnit", this.render),
        this.listenTo(this.model, "change:manualLocation", this.updateWeather),
        this.updateWeather(), this.render(this.options.unitClass = "hide"),
        this.listenTo(m.models.customization, "change:weatherVisible", this.visibleChanged);
        setInterval(function() {
            this.updateWeather()
        }.bind(this), 6e5)
    },
    render: function() {
        var e = this.calculateDisplayTemperature(),
            t = {
                temperature: e,
                location: this.model.get("location"),
                unit: this.displayUnit(),
                condition: this.model.get("condition"),
                code: this.getConditionFromCode(this.model.get("code")),
                unitClass: this.options.unitClass
            },
            i = (this.options.order || "append") + "To";
        return this.$el[i]("#" + this.options.region).html(this.template(t)).fadeTo(500, 1), this.$location = this.$(".location"), this.renderedOnce = !0, this
    },
    visibleChanged: function() {
        var e = m.models.customization.get("weatherVisible");
        e ? this.renderedOnce ? this.$el.fadeIn(500) : this.render() : this.$el.fadeOut(500)
    },
    calculateDisplayTemperature: function() {
        var e = this.model.get("fetchTemperature"),
            t = this.model.get("fetchUnit");
        return "c" === this.displayUnit() ? "c" === t ? e : Math.round(5 * (e - 32) / 9) : "c" === t ? Math.round(9 * e / 5 + 32) : e
    },
    displayUnit: function() {
        var e = m.models.customization.get("temperatureUnit");
        return e ? e : "c"
    },
    editLocation: function() {
        this.$el.hasClass("editing") || (this.$location.attr("contenteditable", !0).addClass("editing pulse").focus(), setEndOfContenteditable(this.$location.get(0)))
    },
    onAnimationEnd: function(e) {
        "pulse" === e.originalEvent.animationName && this.$location.removeClass("pulse")
    },
    saveLocation: function() {
        this.model.save("manualLocation", this.$location.html()),
        this.doneEditingLocation()
    },
    doneEditingLocation: function() {
        this.$location.attr("contenteditable", !1).removeClass("editing").addClass("pulse")
    },
    toggleUnit: function() {
        this.options.unitClass = "", "c" === this.displayUnit() ? m.models.customization.save("temperatureUnit", "f") : m.models.customization.save("temperatureUnit", "c")
    },
    setUnit: function(e) {
        var t = ["US", "BM", "BZ", "JM", "PW"];
        t.indexOf(e) >= 0 ? this.model.save("fetchUnit", "f") : this.model.save("fetchUnit", "c")
    },
    updateWeather: function() {
        function e() {
            navigator.geolocation.getCurrentPosition(t, i)
        }

        function t(e) {
            o(e.coords.latitude + "," + e.coords.longitude)
        }

        function i(e) {
            console.log("Error getting location: " + e.code + ", msg: " + e.message), s.model.get("manualLocation") && o("")
        }

        function o(e) {
            s.model.get("manualLocation") && (e = s.model.get("manualLocation"));

            var t = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22" + encodeURIComponent(e) + "%22%20and%20gflags%3D%22R%22&format=json&diagnostics=true&callback=";

            $.getJSON(t, function(e) {
                var t = e.query.count;
                if (t > 1) var i = e.query.results.Result[0];
                else if (1 == t) var i = e.query.results.Result;
                else {
                    s.$location.append("<br>not found");
                    var i = ""
                }
                s.model.get("location") || s.setUnit(i.countrycode), localStorage.country = i.countrycode;
                var o = i.city,
                    a = i.woeid;
                s.model.save("location", o), s.model.save("woeid", a), n(a)
            }).error(function() {
                console.log("Error getting WoeID")
            })
        }

        function n(e) {
            var t = s.displayUnit();
            t || (t = "c");
            var i = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent("select * from weather.forecast where woeid=" + e + ' and u="' + t + '"') + "&format=json&callback=?";
            $.getJSON(i, function(e) {
                if (e && e.query && 1 == e.query.count) {
                    var i = e.query.results.channel.item.condition;
                    i && s.model.save({
                        fetchTemperature: i.temp,
                        fetchUnit: t,
                        code: i.code,
                        condition: i.text,
                        updated: new Date
                    })
                } else console.log("Error getting weather data: Result count not equal to one")
            }).error(function(e) {
                console.log("Error getting weather data: " + e)
            })
        }
        var s = this;
        e()
    },
    getConditionFromCode: function(e) {
        var t = {};
        return t[0] = "F", t[1] = "F", t[2] = "F", t[3] = "O", t[4] = "P", t[5] = "X", t[6] = "X", t[7] = "X", t[8] = "X", t[9] = "Q", t[10] = "X", t[11] = "R", t[12] = "R", t[13] = "U", t[14] = "U", t[15] = "U", t[16] = "W", t[17] = "X", t[18] = "X", t[19] = "J", t[20] = "M", t[21] = "J", t[22] = "M", t[23] = "F", t[24] = "F", t[25] = "G", t[26] = "Y", t[27] = "I", t[28] = "H", t[29] = "E", t[30] = "H", t[31] = "C", t[32] = "B", t[33] = "C", t[34] = "B", t[35] = "X", t[36] = "B", t[37] = "O", t[38] = "O", t[39] = "O", t[40] = "R", t[41] = "W", t[42] = "U", t[43] = "W", t[44] = "H", t[45] = "O", t[46] = "W", t[47] = "O", t[3200] = ")", t[e]
    }
}),


m.views.Dashboard = Backbone.View.extend({
    initialize: function() {
        m.widgets = [], m.addins = [], m.models.customization = new m.models.Customization({
            id: 1
        }), m.models.customization.fetch({
            error: function() {
                m.models.customization.save()
            }
        }),
        this.render()
    },
    render: function(e) {
        m.models.weather = new m.models.Weather({
            id: 1
        }), m.models.weather.fetch(), m.views.weather = new m.views.Weather({
            model: m.models.weather,
            region: "top-right",
            order: "append"
        }), m.widgets.push(m.views.weather)

    }

}), $(function() {
    m.appView = new m.views.Dashboard();
});







/*
ho.models.Weather = Backbone.Model.extend({
    parse: function(response) {
        this.set({
            'icon': response['current_observation']['icon'],
            'weather': response['current_observation']['weather'],
            'temp': response['current_observation']['temp_c'],
            'place': response['current_observation']['display_location']['full'],
            'date': response['current_observation']['observation_time_rfc822']
        });
    }
});

ho.collect.Weather = Backbone.Collection.extend({
    model: ho.models.Weather,
    url: 'http://api.wunderground.com/api/72e123c4670a2669/geolookup/conditions/q/Korea/Seoul.json',
    parse: function (response) {
        return response;
    }
});

ho.views.Weather = Backbone.View.extend({
    id: 'weather',
    template: Handlebars.compile( $("#weather-template").html() ),
    initialize: function () {
        var that = this;
        this.collection.fetch({
            success: function () {
                that.render();
            }
        });
    },
    render: function () {
        var icon = this.collection.pluck('icon');
        var weather = this.collection.pluck('weather');
        var temp = this.collection.pluck('temp');
        var place = this.collection.pluck('place');
        var date = this.collection.pluck('date');

        var variables = { icon: icon, weather: weather, temp: temp, place: place, date: date };
        var order = (this.options.order  || 'append') + 'To';

        this.$el[order]('#' + this.options.region).html( this.template(variables) ).fadeTo(500, 1);

        if (weather === 'rain'){
            this.rainDay();
        } else if (weather === 'snow') {
            this.snowDay();
        }
    },
    rainDay: function() {
        this.initRainyDay();
        this.rainyDayBg();
        $(window).on('debouncedresize', $.proxy(this.rainyDayBg, this));
    },
    initRainyDay: function() {
        var image = document.getElementById('rainBg');
        image.onload = function() {
            var welRainBg = $('#rainBg');
            var oRainyday = new RainyDay( 'canvas', 'rainBg', welRainBg.outerWidth(), ( welRainBg.outerHeight() ), 1, 20 );
            var preset = 3;
            if (preset == 1) {
                oRainyday.gravity = oRainyday.GRAVITY_NON_LINEAR;
                oRainyday.trail = oRainyday.TRAIL_DROPS;
                oRainyday.rain([ oRainyday.preset(3, 3, 0.88), oRainyday.preset(5, 5, 0.9), oRainyday.preset(6, 2, 1) ], 100);
            } else if (preset == 2) {
                oRainyday.gravity = oRainyday.GRAVITY_NON_LINEAR;
                oRainyday.trail = oRainyday.TRAIL_SMUDGE;
                oRainyday.VARIABLE_GRAVITY_ANGLE = Math.PI / 2;
                oRainyday.rain([ oRainyday.preset(4, 4, 0.5), oRainyday.preset(4, 4, 1) ], 50);
            } else if (preset == 3) {
                oRainyday.gravity = oRainyday.GRAVITY_NON_LINEAR;
                oRainyday.trail = oRainyday.TRAIL_SMUDGE;
                oRainyday.rain([ oRainyday.preset(0, 2, 0.5), oRainyday.preset(4, 4, 1) ], 50);
            }
        };
        image.crossOrigin = 'anonymous';
        //image.src = $('#rainBg').attr('src');
        image.src = $('#background li').css('background-image').replace(/^url|[\(\)]/g, '');
    },
    rainyDayBg: function() {
        var win_height = $(window).outerHeight(),
            win_width = $(window).outerWidth(),
            img_height = $('#rainBg').outerHeight(),
            img_width = $('#rainBg').outerWidth(),
            fraction_height = win_height / img_height,
            fraction_width = win_width / img_width,
            fraction_result = ( fraction_height > fraction_width ) ? fraction_height : fraction_width;

        $('#canvas').css({
            'width': Math.ceil( fraction_result * img_width ) + 'px',
            'height': Math.ceil( fraction_result * img_height ) + 'px',
            'top': Math.floor( (win_height - fraction_result * img_height) / 2 ) + 'px',
            'left': Math.floor( (win_width - fraction_result * img_width) / 2 ) + 'px'
        });
    },
    snowDay: function() {
        $('body').wpSuperSnow({
            flakes: ['img/snowflake.png','img/snowball.png'],
            totalFlakes: '50',
            zIndex: '999999',
            maxSize: '50',
            maxDuration: '35',
            useFlakeTrans: true
        });
    }
});
*/