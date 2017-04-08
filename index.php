<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
<title> HO 'ㅡ')g</title>
<style type="text/css">
html, body{background-color:black;color:white;margin:0;padding:0}
body{font-size:0.9em;font-family:Century Gothic,Arial,Helvetica,sans-serif}
a{display:inline-block;padding:0 2px;color:white;text-decoration:none}
a:hover{color:black;background-color:white}
h1{font-size:1.5em;font-weight:bold}
ul{list-style:none;padding:0}
#content{display:none;position:absolute;text-align:center;opacity:0;z-index:999}
.blind{display:block;overflow:hidden;position:absolute;top:-1000em;left:0}
.weather {width:100%;position:absolute;top:0;left:0;z-index:999}
.weather dl {float:right;margin:0px;padding:30px 35px 0 0;font-family:"Century Gothic",sans-serif;color:#fff;font-weight:bold;}
.weather dd{padding:0;margin:0;display:inline-block;vertical-align:bottom}
.weather .ico{width:60px;height:60px;text-align:right;}
.weather .ico em{display:block;overflow:hidden;position:absolute;top:-1000em;left:0;}
.weather .ico span{display:block;height:100%;background-position:center center;background-repeat:no-repeat}
.weather .ico span.cloudy{background-image:url(img/ico/cloudy.png)}
.weather .ico span.clear, .weather .ico span.sunny{background-image:url(img/ico/sunny.png)}
.weather .ico span.rain{background-image:url(img/ico/rain.png)}
.weather .ico span.snow{background-image:url(img/ico/snow.png)}
.weather .ico span.fog{background-image:url(img/ico/fog.png)}
.weather .ico span.tstorms{background-image:url(img/ico/fog.png)}
.weather .ico span.flurries{background-image:url(img/ico/flurries.png)}
.weather .ico span.hazy{background-image:url(img/ico/hazy.png)}
.weather .ico span.sleet{background-image:url(img/ico/sleet.png)}
.weather .ico span.mostlysunny, .weather .ico span.mostlycloudy, .weather .ico span.partlycloudy{background-image:url(img/ico/mostlysunny.png)}
.weather .ico span.nt_snow{background-image:url(img/ico/nt_snow.png)}
.weather .ico span.nt_fog{background-image:url(img/ico/nt_fog.png)}
.weather .ico span.nt_tstorms{background-image:url(img/ico/nt_tstorms.png)}
.weather .ico span.nt_flurries{background-image:url(img/ico/flurries.png)}
.weather .ico span.nt_hazy{background-image:url(img/ico/nt_hazy.png)}
.weather .ico span.nt_sleet{background-image:url(img/ico/nt_sleet.png)}
.weather .ico span.nt_mostlysunny, .weather .ico span.nt_partlycloudy{background-image:url(img/ico/nt_mostlysunny.png)}
.weather .temp {padding:0 0 0 12px;font-size:2.95em}
.weather .temp span{position:relative;left:-9px;font-size:0.6em}
.weather .location{height:40px}
.weather .location span{display:block}
.weather .place{font-size:1.2em;}
.weather .date{font-size:0.95em;line-height:1}
#rainBg{position:fixed;left:0;z-index:0;width:100%;height:100%;background-size:cover}
#cholder{width:100%;height:100%;position:relative;overflow:hidden}
#canvas{position:relative;top:0;left:0}
</style>
</head>
<body>
<?$year = date("Y"); $month = date("n"); $day = date("j");?>
<div id="rainBg" data-bg="rain_bg.jpg">
	<div style="overflow:hidden;position:absolute;top:0;left:0px;height:0;width:0;"><img crossorigin="anonymous" id="site-bg-image" alt="background" src="img/bg_rain.jpg" /></div>
	<div id="cholder"><canvas id="canvas"></canvas></div>
</div>


<div class="weather">
	<dl>
		<dt class="blind">현재날씨</dt>
		<dd class="ico"></dd>
		<dd class="temp"></dd>
		<dt class="blind">기준위치</dt>
		<dd class="location">
			<span class="place">Seoul, South Korea</span>
			<span class="date"><?echo("$month");?>/<?echo("$day");?>/<?echo("$year");?></span>
		</dd>
	</dl>
</div>

<div id="content">
    <h1>Welcome @hohoya33's</h1>
	<ul>
		<li><a href="http://hohoya33.cafe24.com/work/">Portfolio</a></li>
		<li><a href="http://hohoya33.tistory.com">Blog</a></li>
	</ul>
</div>


<script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>
<script type="text/javascript" src="js/lib/rainyday.js"></script>
<script type="text/javascript" src="js/lib/snowday.min.js"></script>
<script type="text/javascript">
/*
 * debouncedresize: special jQuery event that happens once after a window resize
 */
(function(a){var d=a.event,b,c;b=d.special.debouncedresize={setup:function(){a(this).on("resize",b.handler)},teardown:function(){a(this).off("resize",b.handler)},handler:function(a,f){var g=this,h=arguments,e=function(){a.type="debouncedresize";d.dispatch.apply(g,h)};c&&clearTimeout(c);f?e():c=setTimeout(e,b.threshold)},threshold:150}})(jQuery);

var ho = ho || {};
	ho.util = ho.util || {};
	ho.util = {
		hasElement: function(el) {
			return ($(el).length > 0);
		}
	};
	ho.intro = ho.intro || {};


ho.intro.reposition = function(){
    this.init();
};
ho.intro.reposition.prototype = {
    init: function() {
        this._assignElement();
		this._attachEvents();
    },
	_assignElement: function(){
        this.$win = $(window);
        this.$doc = $(document);
		this.welContent = $('#content');
	},
	_attachEvents: function() {
		this.$win.on('load', $.proxy(this._onload, this));
		this.$win.on('debouncedresize', $.proxy(this._reposition, this));
	},
	_onload: function() {
		this._reposition();
		this._fadeshow();
	},
	_reposition: function() {
		this.welContent.css({
			top:(this.$doc.height() - this.welContent.height()) / 2,
			left:(this.$doc.width() - this.welContent.width()) / 2
		});
	},
	_fadeshow: function() {
		this.welContent.css({opacity:0}).animate({opacity:1}, 1000).show();
	}
};


ho.intro.weather = function(){
    this.init();
};
ho.intro.weather.prototype = {
    init: function() {
        this._assignElement();
		this._attachEvents();
    },
	_assignElement: function(){
        this.$win = $(window);
        this.$doc = $(document);
        this.welWeather = $('.weather');
		this.welTemp = this.welWeather.find('.temp');
		this.welIcon = this.welWeather.find('.ico');
	},
	_attachEvents: function() {
		this.$win.on('load', $.proxy(this._onload, this));
	},
	_onload: function() {
		var oSelf = this;
		$.ajax({
			url : "http://api.wunderground.com/api/72e123c4670a2669/geolookup/conditions/lang:KR/q/Korea/Seoul.json",
			dataType : "jsonp",
			success : function(parsed_json) {
				var observ = parsed_json.current_observation,
					temp_c = observ.temp_c +'˚<span>C</span>',
					icon = '<span class="'+ observ.icon +'"><em>'+ observ.weather +'</em></span>';

				oSelf.welTemp.append(temp_c);
				oSelf.welIcon.append(icon);

				if (observ.icon == 'rain'){
					oSelf._rainDay();
				} else if (observ.icon == 'snow') {
					oSelf._snowDay();
				}
			}
		});
	},
	_rainDay: function() {
		/*
			Main JS file for RAIN behaviours
			http://maroslaw.github.io/rainyday.js/
		*/
		this._init_RainyDay();
		this._rainyDay_Bg();
		this.$win.on('debouncedresize', $.proxy(this._rainyDay_Bg, this));
	},
	_init_RainyDay: function() {
		// Initialization
		// RAIN background
		var image = document.getElementById('site-bg-image'),
			engineRainyDay = new RainyDay('canvas', 'site-bg-image', $('#site-bg-image').outerWidth(), ($('#site-bg-image').outerHeight()), 1, 20);

		var preset = 3;
		if (preset == 1) {
			engineRainyDay.gravity = engineRainyDay.GRAVITY_NON_LINEAR;
			engineRainyDay.trail = engineRainyDay.TRAIL_DROPS;
			engineRainyDay.rain([ engineRainyDay.preset(3, 3, 0.88), engineRainyDay.preset(5, 5, 0.9), engineRainyDay.preset(6, 2, 1) ], 100);
		} else if (preset == 2) {
			engineRainyDay.gravity = engineRainyDay.GRAVITY_NON_LINEAR;
			engineRainyDay.trail = engineRainyDay.TRAIL_SMUDGE;
			engineRainyDay.VARIABLE_GRAVITY_ANGLE = Math.PI / 2;
			engineRainyDay.rain([ engineRainyDay.preset(4, 4, 0.5), engineRainyDay.preset(4, 4, 1) ], 50);
		} else if (preset == 3) {
			engineRainyDay.gravity = engineRainyDay.GRAVITY_NON_LINEAR;
			engineRainyDay.trail = engineRainyDay.TRAIL_SMUDGE;
			engineRainyDay.rain([ engineRainyDay.preset(0, 2, 0.5), engineRainyDay.preset(4, 4, 1) ], 50);
		}

		image.crossOrigin = 'anonymous';
		image.src = $('#site-bg-image').attr('src');
	},
	_rainyDay_Bg: function() {
		var win_height = this.$win.outerHeight();
		var win_width = this.$win.outerWidth();

		var img_height = $('#site-bg-image').outerHeight();
		var img_width = $('#site-bg-image').outerWidth();

		var fraction_height = win_height / img_height;
		var fraction_width = win_width / img_width;

		var fraction_result = ( fraction_height > fraction_width ) ? fraction_height : fraction_width;

		$('canvas').css('height', Math.ceil( fraction_result * img_height ) + 'px' );
		$('canvas').css('width', Math.ceil( fraction_result * img_width ) + 'px' );

		$('canvas').css('top', Math.floor( (win_height - fraction_result * img_height) / 2 ) + 'px' );
		$('canvas').css('left', Math.floor( (win_width - fraction_result * img_width) / 2 ) + 'px' );

	},

	_snowDay: function() {
		$('body').wpSuperSnow({
			flakes: ['img/snowflake.png','img/snowball.png'],
			totalFlakes: '50',
			zIndex: '999999',
			maxSize: '50',
			maxDuration: '35',
			useFlakeTrans: true
		});
	}
};

$(function(){
    if(ho.util.hasElement('#content')){
        var oHoIntroReposition = new ho.intro.reposition();
    }

	if(ho.util.hasElement('.weather')){
        window.oHoIntroWeather = new ho.intro.weather();
    }
});
</script>


<!-- 트위터 타임라인 가져오기 -->
<script src="http://oauth.googlecode.com/svn/code/javascript/oauth.js"></script>
<script src="http://oauth.googlecode.com/svn/code/javascript/sha1.js"></script>
<script type="text/javascript">
function fn_twitterTimeline() {
	var twitterPrm = {
		api: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
		count: 5, //불러올 타임라인 수
		callback: "fn_makedocTwitter", //함수를 호출하여JSON데이터를 넘겨줍니다.
		consumerKey: "oU9eVRxiqtUBPvuOPJbSrA", //트위터개발자페이지에서 생성한 자신의 어플리케이션 정보를 입력하시기 바랍니다.
		consumerSecret: "pUmRLZnsaDY5D89mO98DnLrUpYqH4RY8SWr5X7e4KeA",
		accessToken: "173676174-g2WsAVXSAoBRL7lA3DLQNh78cjuNEUczRpLPwR0k",
		tokenSecret: "wbvMnT9H7Mx8UfvIeAgSnYTY9K0IfqpwuSml3gfQ"
	}
	var oauthMessage = {
		method: "GET",
		action: twitterPrm.api,
		parameters: {
			count: twitterPrm.count,
			callback: twitterPrm.callback,
			oauth_version: "1.0",
			oauth_signature_method: "HMAC-SHA1",
			oauth_consumer_key: twitterPrm.consumerKey,
			oauth_token: twitterPrm.accessToken
		}
	}
	//Outh인증관련
	OAuth.setTimestampAndNonce(oauthMessage);
	OAuth.SignatureMethod.sign(oauthMessage, {
		consumerSecret: twitterPrm.consumerSecret,
		tokenSecret: twitterPrm.tokenSecret
	});
	//Outh인증끝
	//Outh인증하여 URL리턴(jsonType)
	var twJsonPath = OAuth.addToURL(oauthMessage.action, oauthMessage.parameters);
	//alert(twJsonPath);
	$.ajax({
		type: oauthMessage.method,
		url: twJsonPath,
		dataType: "jsonp",
		jsonp: false,
		cache: true
	});
}

function fn_makedocTwitter(data){
	var timeLine='';
	var text;
	var dateObj = new Date;
		for(var i=0, len=data.length;i<len;i++) {
			text = data[i].text;
			//URL링크
			text = text.replace(/(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:@&=+$,%#]+)/gi,'<a href="$1">$1</a>');
			//헤시테그연결
			text = text.replace(/#(\w+)/gi,'<a href="http://twitter.com/search?q=%23$1">#$1</a>');
			//멘션연결
			text = text.replace(/@(\w+)/gi,'<a href="http://twitter.com/$1">@$1</a>');
			timeLine += "<p>"+dateObj+":"+text+"</p>";
		}
	$('#snsTwitter').html(timeLine);
}

$(function(){
	fn_twitterTimeline();
});

</script>
<!--
<h1>Hello Twitter!</h1>
<div id="snsTwitter"></div>
<a class="twitter-timeline" href="https://twitter.com/hohoya33" data-widget-id="372591678529368064">@hohoya33 님의 트윗</a>

<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
 -->

<!--
<? header("Location:http://hohoya33.cafe24.com/wp/"); ?>
<?
$home_url = 'http://'.$_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']).'ho/01.main/';
header('Location:'.$home_url);
?>
-->
</body>
</html>
