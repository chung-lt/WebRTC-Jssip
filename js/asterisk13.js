JsSIP.debug.enable('JsSIP:*');
const domain = 'dev-v5-mon.infinitalk.net';
const port = '8089';

let callbtn = document.getElementById("callbtn");
let answerbtn = document.getElementById("answerbtn");
let terminatebtn = document.getElementById("terminatebtn");
let exten = document.getElementById("extension");
let regbtn = document.getElementById("regbtn");
let phone = document.getElementById("phone");
let pass = document.getElementById("pass");
let transfertg = document.getElementById("transfertg");

let transferbtn = document.getElementById("transferbtn");
let holdbtn = document.getElementById("holdbtn");
// let holdbtn2 = document.getElementById("holdbtn2");

let socket = new JsSIP.WebSocketInterface('wss://' + domain + ':' + port + '/ws');
let DTMFbtn =document.getElementById("DTMFbtn");
DTMFbtn.style.display = "none";
let mutebtn = document.getElementById("mutebtn");

let caller_name = document.getElementById("caller_name");
hide_btn();

let caller;

let current_session = "";
let hold_session ="";
let holded_session2 = "";
let ua = "";
let sipAudio = new Audio();
let session2 = "";
let checkBusy = false;
// let reciever_name = "";
let holded_name = "";


function register() {
    let configuration = {
        sockets: [socket],
        uri: 'sip:' + phone.value + '@' + domain,
        password: pass.value,
        register: true,
        contact_uri : 'sip:' + phone.value + '@' + domain + ';transport=wss',
        session_timers: false,
    };
    ua = new JsSIP.UA(configuration);

    ua.on('connected', function(e) {
        regbtn.textContent = 'Connected';
        console.log('agent is connected');
    });
    
    ua.on('registered', function(e) {
        regbtn.textContent = 'UnRegister';
        console.log('agent is registered');
    });
    
    ua.on('sipEvent', function(e) {
        console.log('sipEvent');
    });
    ua.on('newRTCSession', function(e) {
          
        console.log("newRTCSession");
        console.log(e);
        // console.log(session);
        if(checkBusy === false){
            current_session = e.session;
            console.log("Current session initialize");
        }else{
            session2 = e.session;
            console.log("session initialize");
        }
        caller = e.request.from._display_name;
        // reciever_name = current_session._remote_identity._uri._user;
        // console.log(current_session.remote_identity.uri);

        if(session2.direction ==="incoming" && checkBusy === true ){
            terminate_busy(session2);
            console.log("session2 terminated");      
        }
        
        if (current_session.direction === "incoming" && checkBusy === false) {
            telephonering.play();
            caller_name.style.display = "inline";
            caller_name.innerHTML = "Caller : " + caller;
            answerbtn.classList.add("button");
            answerbtn.style.display = "inline";
            console.log("derection incoming");
            current_session.on('peerconnection', function(e) {
                add_stream();
            });  
        } else if(current_session.direction === "outgoing" && checkBusy === false) {
            if(exten.value.length < 5){
                ringback.play();
            }
            terminatebtn.style.display = "inline";
            console.log("out going");
            current_session.connection.addEventListener('addstream', function(e) {
                console.log("Stream added");
                
            });
        }
           

    current_session.on('confirmed', function(e) {
        telephonering.pause();
        ringback.pause();
        checkBusy = true;
        // display_btn();
        console.log("session confirmed");
        console.log("checkBusy",checkBusy);
        console.log("current session :",current_session);
        // if(holded_name !=="" && reciever_name !==""){
        //     transferbtn.innerHTML = "Transfer " + holded_name +" to " + reciever_name;
        // }
    });
    current_session.on('failed', function(e) {
        telephonering.pause();
        ringback.pause();
        endcall.play();
        hide_btn();
        console.log("session failed");
    });
    current_session.on('ended', function(e) {
        endcall.play();
        console.log("session ended");
        callbtn.textContent = 'Call';
        // holdbtn.textContent = 'Hold';
        hide_btn();
        checkBusy = false;
        console.log("checkBusy :",checkBusy);
        // alert("Call with "+current_session.remote_identity.uri.user+" is Ended");
        current_session = null;
        // reciever_name= "";
    });
    current_session.on('accepted', function(e) {
        console.log("session accepted");
    });
    current_session.on('update', function(e){
        console.log('update');
    });
       

    });
    ua.on('registrationFailed', function(e) {
        regbtn.textContent = 'Register Failed';
        console.log('agent register failed : ' + e.request + e.response);
    });
    ua.on('sipEvent', function(e) {
        console.log('Sip Event');
        console.log(e);
    });
    ua.on('newMessage', function(e) {
        console.log('New Message');
        console.log(e);
    });
    ua.start();
    regbtn.onclick =  function(){
       unregister();
    };
}
function unregister(){
    let options = {
        all : true
    };
    ua.unregister();
    ua.on('unregistered', function(e) {
        regbtn.textContent = 'Register';
        console.log('agent is unregistered');
    });

    ua.on('disconnected', function(e) {
        console.log('agent is disconnected');
    });
    ua.stop();
    regbtn.onclick = function(){
        register();
    };
}
function call() {
    let eventHandlers = {
        'progress': function(e) {   
            callbtn.textContent = 'Call in Progress';
            console.log('call is in progress');
            console.log(e);
        },
        'failed': function(e) {
            alert("Call failed");
            callbtn.textContent = 'Call';
            console.log('call failed');
            console.log(e);
        },
        'ended': function(e) {
            callbtn.textContent = 'Call';
            console.log('call ended');
            console.log(e);
        },
        'confirmed': function(e) {
            // display_btn();
            callbtn.textContent = 'Call';
            console.log('call confirmed');
        },
    };
    let options = {
        'eventHandlers': eventHandlers,
        'mediaConstraints': {
            'audio': true,
            'video': false
        },
        'pcConfig': {
            'rtcpMuxPolicy': 'negotiate',
        },
       'fromDisplayName' : phone.value,
       'sessionTimersExpires' : 600,
    };

    ua.call('sip:' + exten.value + '@' + domain, options);
    callbtn.textContent = 'Dailing';
    add_stream();
    
}


function refer() {
    let eventHandlers = {
        'requestSucceeded': function(e) {
            // transferbtn.textContent = 'requestSucceeded';
            console.log('requestSucceeded');
        },
        'requestFailed': function(e) {
            // transferbtn.textContent = 'requestFailed';
            console.log('requestFailed');
            console.log(e);
        },
        'trying': function(e) {
            // transferbtn.textContent = 'trying';
            console.log('trying');
        },
        'progress': function(e) {
            // transferbtn.textContent = 'progress';
            console.log('progress');
        },
        'accepted': function(e) {
            unhold();
            terminate_busy(hold_session);
            transferbtn.textContent = "Transfer";
            console.log('accepted');
            alert("転送成功");
            console.log("hold_session", hold_session);
            console.log("current ss", current_session);
            
        },
        'failed': function(e) {
            // transferbtn.textContent = 'Transfer failed';
            alert("転送出来ない!!");
            transferbtn.textContent = "Transfer";
            console.log('failed');
            console.log(e);
           
        },
    };
    let options = {
        'replaces' : current_session,
        'eventHandlers': eventHandlers,
        'mediaConstraints' : { 'audio': true, 'video': false },
        'pcConfig': {
            'rtcpMuxPolicy': 'negotiate',
        },
    }
    hold_session.refer(current_session.remote_identity.uri,options);
}
    
    
function hold(){
    checkBusy = false;
    hold_session = current_session;
    // current_session = "";
    // console.log("holded session initialize");
    current_session.hold();
    holded_name = hold_session._remote_identity._uri._user;
    holdbtn.onclick = function(){
        unhold();
    };
    holdbtn.innerHTML = "UnHold :" + holded_name;
    console.log("holded");
}
      
function unhold(){
    checkBusy = true;
    current_session = hold_session;
    current_session.on('unhold', function(e){
    });
    current_session.unhold();
    console.log("current session",current_session);
    holdbtn.onclick = function(){
        hold();
    };
    holded_name = "";
    holdbtn.textContent = "Hold";
    console.log("unhold");
}
function hold2(){
    // holded_session2 = current_session;
    // current_session = "";
    console.log("holded session2 initialize");
    current_session.hold();
    holdbtn2.onclick = function(){
        unhold2();
    };
    holdbtn2.textContent = "UnHold";
    console.log("holded 2");
}
      
function unhold2(){
    // current_session = holded_session2;
    // holded_session2  = "";
    current_session.on('unhold', function(e){
    });
    current_session.unhold();
    holdbtn2.onclick = function(){
        hold2();
    };
    holdbtn2.textContent = "Hold";
    console.log("unhold");
}

function mute(){
    current_session.on('muted',function(e){

    });
    current_session.mute();
    mutebtn.onclick = function(){
        un_mute();
    };
    mutebtn.textContent = "Unmute";
        console.log("muted");
}

function un_mute(){
    current_session.on('unmuted', function(e){
    });
    current_session.unmute();
    mutebtn.onclick = function(){
        mute();
    };
    mutebtn.textContent = "Mute";
    console.log("un muted");
}

function answer(){
    let callOptions = {
        'mediaConstraints': {
            'audio': true, // only audio calls
            'video': false
        },
        'pcConfig': {
            'rtcpMuxPolicy': 'negotiate',
        },
    };
    current_session.answer(callOptions);
    answerbtn.style.display = "none";
}

function terminate(){
    console.log("terminated");
    current_session.terminate();
}

function terminate_busy(session){
    let options = {
        'status_code' : 486,
        'reason_phrase' : 'Busy Here',
    }
    session.terminate(options);
    session = null;
}

function PressKey(){
    var str = exten.value;
    var i=8;
    for(i; i<str.length; i++){
        var x = event.which || event.keyCode;
        if (x === 16) {
        DTMFbtn.click();
        }
    }
}

function sendDTMF(){
    var str = exten.value;
    // console.log("DTMF");
    var options ={

    }
    if (str.substr(0,3) === "#90") {
    var tones = str.substr(6, 9);
    // console.log(tones);
    }
    current_session.sendDTMF(tones, options);
    // current_session.sendDTMF(202, options);        
}

function SendAgent(){
    var str = exten.value;
    // console.log("DTMF");
    var options ={

    }
    if (str.substr(0,3) === "#90") {
    var tones = str[3];
    // console.log(tones);
    }
    current_session.sendDTMF(tones, options);
    // current_session.sendDTMF(202, options);        
}

function SendPass(){
    var str = exten.value;
    // console.log("DTMF");
    var options ={

    }
    if (str.substr(0,3) === "#90") {
    var tones = str[4];
    // console.log(tones);
    }
    current_session.sendDTMF(tones, options);
    // current_session.sendDTMF(202, options);        
}




function add_stream(){
    
    current_session.connection.addEventListener('addstream',function(e) {
        sipAudio.srcObject = e.stream;
        sipAudio.play();
    });
}

function hide_btn(){
    answerbtn.style.display = "none";
    caller_name.style.display = "none";
}

function display_btn(){
    caller_name.style.display = "inline";
}

// function loopTelephoneRing(){
//     telephonering.loop = true;
//     telephonering.play();
// }

// function loopRingBack(){
//     ringback.loop = true;
//     ringback.play();
// }