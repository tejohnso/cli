/***
 * 
 * scheduler.js
 * 
 * 
 */

var currentTime,            // System Time
    currentBacklight = -1,    // Current  
    NOT_SCHEDULED = -1,        
    Backlight;                // array [24][6] : 24 hours and 0, 10, 20, 30, 40, 50 minute

// Initialize Function
function init() {

    document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 10 Min';
    
    // Initialize backllight schedule time table
    Backlight = new Array(24);
    for(var i=0; i<24; i++) {
        Backlight[i] = new Array(6);
        document.getElementById('clockHour').innerHTML += i + '<br>';
        for(var j=0; j<6; j++) {
            Backlight[i][j] = NOT_SCHEDULED;
        }        
    } 
    for(var i=0; i<6; i++) {
        document.getElementById('clockMinute').innerHTML += '<div style="float:left; margin-right: 105px;">'+ (i*10) + '</div>';
    }

    getTime(); 		
    remocon();		// Add remote controller button event handler
    drawRuler();	// Draw ruler of left side

    drawScheduleTable();
    printBacklightValue_Controller(0,0);
    setInterval(interval, 1000);	// Set interval function (Get time every 1 second
}

function interval() {
    getTime(); 
}


// Set print value and clock arrow direction
function printBacklightValue_Controller(hour, min) {
	document.getElementById('controllerArrowRotate').setAttribute("style", "-webkit-transform:rotate(" + 0.25 * selectedTime + "deg);");
	var min_index = parseInt(min / 10);
	// If current Backlight value is exists
	if (Backlight[hour][min_index] != NOT_SCHEDULED) {
		document.getElementById('controller').innerHTML = "<br><br>"
														+ (hour < 10 ? ("0" + hour) : hour) + ":"
														+ (min < 10 ? ("0" + min) : min) + "<br>Backlight : "
														+ Backlight[hour][min_index];
	}
	// Else no schedule
	else {
		document.getElementById('controller').innerHTML = "<br><br>"
														+ (hour < 10 ? ("0" + hour) : hour) + ":"
														+ (min < 10 ? ("0" + min) : min)
														+ "<br>Backlight<br>Not Scheduled";
	}
}    

function drawRuler() {
    for (var i=0; i<12; i++) {
        document.getElementById('controllerRuler').innerHTML += "<div id = controllerRuler" + i + " "
                                         + "style = 'width: 2px; height: 840px; position: absolute; left : 400px; top:  0px; background-color: #000000;"
                                         + "-webkit-transform:rotate(" + i*15 + "deg);'></div>";
    }
}

// Get device time
function getTime() {
    function successCb(cbObject) {
        var hour = cbObject.hour,
            min  = cbObject.minute;
        currentTime = cbObject;
        setBacklight(cbObject);
    }

    function failureCb(cbObject) {
       var errorCode = cbObject.errorCode;
       var errorText = cbObject.errorText;
       
       console.log ("Error Code [" + errorCode + "]: " + errorText);
    }    
        var configuration = new Configuration();
        configuration.getCurrentTime(successCb, failureCb);    
}

// If parameter value(time value) and current time is matched, do backlight scheduling
function setBacklight(time) {
    var hour   = time.hour,
        minute = time.minute,
        sec    = time.sec;
    document.getElementById('currentTime').innerHTML =        (hour<10   ? ('0' + hour)   : hour);
    document.getElementById('currentTime').innerHTML += ':' + (minute<10 ? ('0' + minute ): minute);
    document.getElementById('currentTime').innerHTML += ':' + (sec<10    ? ('0' + sec)    : sec) + "<br>";
    document.getElementById('currentTime').innerHTML += time.month + ". " + time.day + ". " + time.year;
 
    do_scheduling_by_SCAP(hour, parseInt(minute/10));
}

// Change backlight value
function do_scheduling_by_SCAP(hour, minute) {
   function successCb() {
        // Do something
        document.getElementById('popupWindow').innerHTML = "SCAP CALL";
        currentBacklight = Backlight[hour][minute];
    }

    function failureCb(cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        
        console.log ("Error Code [" + errorCode + "]: " + errorText);
        document.getElementById('popupWindow').innerHTML = "Error Code [" + errorCode + "]: " + errorText;
    }
    
    var options = {
            backlight : Backlight[hour][minute]
    }

    if ( (Backlight[hour][minute] > NOT_SCHEDULED) && (currentBacklight !== Backlight[hour][minute]) ){
        var configuration = new Configuration();
        configuration.setPictureProperty(successCb, failureCb, options);
    }    
}