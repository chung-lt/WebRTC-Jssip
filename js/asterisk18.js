const domain18 = 'dev-v5-sat.infinitalk.net';
const port18 = '8089';

let callbtn18 = document.getElementById("callbtn18");
let answerbtn18 = document.getElementById("answerbtn18");

let terminatebtn18 = document.getElementById("terminatebtn18");
terminatebtn18.style.display ="none";

let exten18 = document.getElementById("extension18");
let regbtn18 = document.getElementById("regbtn18");
let phone18 = document.getElementById("phone18");
let pass18 = document.getElementById("pass18");
let caller_name18 = document.getElementById('caller_name18');
let caller18;

let counter_time;

let minutesLabel = document.getElementById("minutes");
let secondsLabel = document.getElementById("seconds");
let totalSeconds = 0;

let transferbtn18 = document.getElementById("transferbtn18");
transferbtn18.style.display ="none";

let holdbtn18 = document.getElementById("holdbtn18");
holdbtn18.style.display = "none";
// let holdbtn2 = document.getElementById("holdbtn2");
// holdbtn2.style.display ="none";

let socket18 = new JsSIP.WebSocketInterface('wss://' + domain18 + ':' + port18 + '/ws');
// let DTMFbtn =document.getElementById("DTMFbtn");
let mutebtn18 = document.getElementById("mutebtn18");
mutebtn18.style.display = "none";

let muteaudiobtn18 = document.getElementById("muteaudiobtn18");
muteaudiobtn18.style.display = "none";

let selfView =   document.getElementById('selfView');
let remoteView = document.getElementById('remoteView');

let videoCall = document.getElementById('videoCall');
videoCall.style.display = "none";

let current_session18 = "";
let holded_session18 ="";
// let holded_session2 = "";
let ua18 = "";
let sipAudio18 = new Audio();
let session18 = "";
let check ="true";

// let telephonering = new Audio('telephone-ring.mp3');
// let ringback = new Audio("ringback.mp3");
// let endcall = new Audio("endcall.mp3");

let videoconstraints = {
    frameRate : {max :15},
    width : {max: 360 },
    height : {max : 240}  
}

function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
    let valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}


function register18() {
    let configuration = {
        sockets: [socket18],
        uri: 'sip:' + phone18.value + '@' + domain18,
        password: pass18.value,
        register: true,
        contact_uri : 'sip:' + phone18.value + '@' + domain18 + ';transport=wss',
        session_timers: false,
    };
    ua18 = new JsSIP.UA(configuration);

    ua18.on('connected', function(e) {
        regbtn18.textContent = 'Disconect';
        console.log('agent is connected');
    });
    
    ua18.on('registered', function(e) {
        regbtn18.textContent = 'UnRegister';
        console.log('agent is registered');
    });
    
    ua18.on('sipEvent', function(e) {
        console.log('sipEvent');
    });
    ua18.on('newRTCSession', function(e) {
            
        console.log("newRTCSession");
        console.log(e);
        session = e.session;
        console.log(session);
        console.log("caller18 ",e.request.from._display_name);
        caller18 = e.request.from._display_name;
        if(checkBusy === false){
            console.log("Current session18 initialize");
            current_session18 = e.session;
        }else{
            session18 = e.session;
            console.log("session busy");
        }
        
        if(session18.direction ==="incoming" && checkBusy === true ){
            terminate_busy(session18);
            console.log("session18 terminated");      
        }
        if (current_session18.direction === "incoming" && checkBusy === false) {
            telephonering.play();
            caller_name18.style.display = "inline";
            caller_name18.innerHTML = "Caller :" + caller18;
            terminatebtn18.style.display = "inline";
            // telephonering.play();
            window.open('http://infinitalk.co.jp/');
            answerbtn18.style.display = "inline";
            answerbtn18.classList.add("button");
            console.log("derection incoming");
            current_session18.on('peerconnection', (e) => {
                add_stream18();
            });

        } else if(current_session18.direction === "outgoing" && checkBusy === false) {
            ringback.play();
            terminatebtn18.style.display = "inline";
            console.log("out going");
            // ringback.play();
            current_session18.connection.addEventListener('addstream', function(e) {
                console.log("Stream added");                        
            });
        }

        current_session18.on('confirmed', function(e) {
            telephonering.pause();
            ringback.pause();
            console.log("session confirmed");
            videoCall.style.display = "block";
            holdbtn18.style.display = "inline";
            mutebtn18.style.display = "inline";
            muteaudiobtn18.style.display = "inline";
            counter_time = setInterval(setTime, 1000);
            checkBusy = true;
            console.log(checkBusy);
        });
        current_session18.on('failed', function(e) {
            telephonering.pause();
            ringback.pause();
            endcall.play();
            console.log("session failed");
            caller_name18.style.display = "none";
            callbtn18.innerHTML = 'Call <i class="fas fa-video"></i>' ;
            terminatebtn18.style.display = "none";
            answerbtn18.style.display = "none";
            alert("Faile");
        });

        current_session18.on('ended', function(e) {
            endcall.play();
            console.log("session ended");
            callbtn.innerHTML = 'Call <i class="fas fa-video"></i>' ;
            answerbtn18.style.display = "none";
            videoCall.style.display = "none";
            terminatebtn18.style.display = "none";
            holdbtn18.style.display = "none";
            mutebtn18.style.display = "none";
            muteaudiobtn18.style.display = "none";
            caller_name18.style.display = "none";
            checkBusy = false;
            console.log(checkBusy);
            clearInterval(counter_time);
            totalSeconds = 0;
            current_session18 = null;
        });

        current_session18.on('accepted', function(e) {
            console.log("session accepted");
        });
    });
    ua18.on('registrationFailed', function(e) {
        alert("Register Failed!!");
        // regbtn.textContent = 'Register Failed';
        console.log('agent register failed : ' + e.request + e.response);
    });
    ua18.on('sipEvent', function(e) {
        console.log('Sip Event');
        console.log(e);
    });
    ua18.on('newMessage', function(e) {
        console.log('New Message');
        console.log(e);
    });
    
    ua18.start();
    regbtn18.onclick =  function(){
        unregister18();
    };
}
function unregister18(){
    let options = {
        all : true
    };
    ua18.unregister();
    ua18.on('unregistered', function(e) {
        regbtn18.textContent = 'Register';
        console.log('agent is unregistered');
    });

    ua18.on('disconnected', function(e) {
        alert("Disconnected");
        regbtn18.textContent = 'Register';
        console.log('agent is disconnected');
    });
    ua18.stop();
    regbtn18.onclick = function(){
        register18();
    };
}

async function call18() {
    check = "false";
    // await navigator.mediaDevices.getUserMedia({audio: true, video : false});
    let eventHandlers = {
        'progress': function(e) {  
            // if (e.originator === 'remote') {
            //     e.response.body = null;
            // }   
            callbtn18.textContent = 'Call in Progress';
            console.log('call is in progress');
            console.log(e);
        },
        'failed': function(e) {
            callbtn18.textContent = 'Call Failed';
            console.log('call failed');
            console.log(e);
        },
        'ended': function(e) {
            callbtn18.innerHTML = 'Call <i class="fas fa-video"></i>';
            console.log('call ended');
            console.log(e);
        },
        'confirmed': function(e) {
            callbtn18.innerHTML = 'Call <i class="fas fa-video"></i>';
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
            // 'rtcpMuxPolicy': 'negotiate',
        },
        // 'rtcOfferConstraints' : {
        //     'offerToReceiveAudio' : true,
        //     'offerToReceiveVideo' : true
        // },
    };

    ua18.call('sip:' + exten18.value + '@' + domain, options);
    callbtn18.textContent = 'Dailing';
    console.log("audio call start");
    add_stream18();
}

async function call_video18() {
    check = "true";
    // await navigator.mediaDevices.getUserMedia({audio: true, video : false});
    let eventHandlers = {
        'progress': function(e) {  
            // if (e.originator === 'remote') {
            //     e.response.body = null;
            // }   
            callbtn18.textContent = 'Call in Progress';
            console.log('call is in progress');
            console.log(e);
        },
        'failed': function(e) {
            callbtn18.textContent = 'Call Failed';
            console.log('call failed');
            console.log(e);
        },
        'ended': function(e) {
            callbtn18.innerHTML = 'Call <i class="fas fa-video"></i>';
            console.log('call ended');
            console.log(e);
        },
        'confirmed': function(e) {
            callbtn18.innerHTML = 'Call <i class="fas fa-video"></i>';
            console.log('call confirmed');
        },
    };
    let options = {
        'eventHandlers': eventHandlers,
        'mediaConstraints': {
            'audio': true,
            'video': videoconstraints,
        },
        'pcConfig': {
            // 'rtcpMuxPolicy': 'negotiate',
        },
        'fromDisplayName' : phone18.value,
    };

    ua18.call('sip:' + exten18.value + '@' + domain, options);
    callbtn18.textContent = 'Dailing';
    console.log("video call start");
    add_stream18();
}


function refer18() {
    let eventHandlers = {
        'requestSucceeded': function(e) {
            transferbtn18.textContent = 'requestSucceeded';
            console.log('requestSucceeded');
        },
        'requestFailed': function(e) {
            transferbtn18.textContent = 'requestFailed';
            console.log('requestFailed');
            console.log(e);
        },
        'trying': function(e) {
            transferbtn18.textContent = 'trying';
            console.log('trying');
        },
        'progress': function(e) {
            transferbtn18.textContent = 'progress';
            console.log('progress');
        },
        'accepted': function(e) {
            transferbtn18.textContent = 'accepted';
            console.log('accepted');
        },
        'failed': function(e) {
            transferbtn18.textContent = 'failed';
            console.log('failed');
            console.log(e);
        },
    };
    let options = {
        'replaces' : current_session18,
        'eventHandlers': eventHandlers,
        'mediaConstraints' : { 
            'audio': true, 
            'video': videoconstraints
        },
        'pcConfig': {
            // 'rtcpMuxPolicy': 'negotiate',
        },
        
    }
    holded_session18.refer(current_session18.remote_identity.uri,options);
}

function hold18(){
    checkBusy = false;
    console.log(checkBusy);
    holded_session18 = current_session18;
    // current_session = "";
    console.log("holded session initialize");
    current_session18.hold();
    holdbtn18.textContent = "UnHold";
    console.log("holded");
    holdbtn18.onclick = function(){
        unhold18();
    };
    transferbtn18.style.display = "inline";
    // holdbtn2.style.display = "inline";
}
        
function unhold18(){
    checkBusy = true;
    current_session18 = holded_session18;
    holded_session18  = "";
    current_session18.unhold();
    holdbtn18.textContent = "Hold";
    console.log("unhold");
    holdbtn18.onclick = function(){


        hold18();
    };
    transferbtn18.style.display = "none";
}

function hold2(){
    holded_session2 = current_session18;
    // current_session18 = "";
    console.log("holded session2 initialize");
    holded_session2.on('hold', function(e){
    });
    holded_session2.hold();
    holdbtn2.textContent = "UnHold";
    console.log("holded 2");
    holdbtn2.onclick = function(){
        unhold2();
    };
}
        
function unhold2(){
    current_session18 = holded_session2;
    holded_session2  = "";
    current_session18.on('unhold', function(e){
    
    });
    current_session18.unhold();
    holdbtn2.textContent = "Hold";
    console.log("unhold");
    holdbtn2.onclick = function(){
        hold2();
    };
}

function mute18(){
    current_session18.on('muted',function(e){
    });
    current_session18.mute({video : true});
    mutebtn18.innerHTML = 'Video ON <i class="fas fa-video"></i>';
    console.log("muted");
    console.log(current_session18.isMuted());
    mutebtn18.onclick = function(){
        un_mute18();
        };
    }

function un_mute18(){
    current_session18.on('unmuted', function(e){
    });
    current_session18.unmute({video:true});
    mutebtn18.innerHTML = 'Video OFF <i class="fas fa-video-slash">';
    console.log("un muted");
    console.log(current_session18.isMuted());
    mutebtn18.onclick = function(){
        mute18();
    }
}

function mute_audio18(){
    current_session18.on('muted',function(e){
    
    });
    current_session18.mute({audio:true});
    muteaudiobtn18.innerHTML = 'Voice Unmute<i class="fas fa-microphone"></i>';
    console.log("audio muted");
    console.log(current_session18.isMuted());
    muteaudiobtn18.onclick = function(){
        un_mute_audio18();
        };
    }

function un_mute_audio18(){
    current_session18.on('unmuted', function(e){
    
    });
    current_session18.unmute({audio : true});
    muteaudiobtn18.innerHTML = "Voice mute<i class='fas fa-microphone-slash'></i>";
    console.log("audio unmuted");
    console.log(current_session18.isMuted());
    muteaudiobtn18.onclick = function(){
        mute_audio18();
    }
}

function answer18(){
    console.log('check =',check);
    if(check === "true") {
        console.log('answer video call');
        answer_video18();
    }else{
        console.log('answer audio call');
        answer_audio18();
    }
    // telephonering.pause();
    answerbtn18.style.display = "none";        
}

async function answer_audio18(){
        let callOptions = {
            'mediaConstraints': {
                'audio': true, // only audio calls
                'video': false
            },
            'pcConfig': {
                // 'rtcpMuxPolicy': 'negotiate',
            },
        };
    current_session18.answer(callOptions);
    // add_stream18();

}

async function answer_video18(){
    let callOptions = {
        'mediaConstraints': {
            'audio': true, // only audio calls
            'video': videoconstraints
        },
        'pcConfig': {
            // 'rtcpMuxPolicy': 'negotiate',
        },
    };
    current_session18.answer(callOptions);
    // add_stream18();
}

function terminate18(){
    console.log("terminated");
    // terminatebtn.textContent = "Terminated";
    current_session18.terminate();
}

// function PressKey(){
//     let str = exten.value;
//     let i;
//     for(i=1; i<str.length; i++){
//         let x = event.which || event.keyCode;
//         if (x === 16) {
//         DTMFbtn.click();
//         }
//     }
// }

// function sendDTMF(){
//     let str = exten.value;
//     let options ={
//     }
//     if (str.substr(0,3) === "#90") {
//     let tones = str.substr(6, 9);
//     }
//     current_session18.sendDTMF(tones, options);    
// }

function add_stream18(){
    
    // current_session18.connection.addEventListener('addstream',function(e) {
    //     sipAudio.srcObject = e.stream;
    //     sipAudio.play();
    //     console.log("video");
    //     selfView.srcObject = (current_session18.connection.getLocalStreams()[0]);
    //     console.log("local Video"); 
    //     remoteView.srcObject = e.stream;
    //     console.log("remote video"); 
    //     console.log(e.stream);
    // });
    current_session18.connection.ontrack = (e) => {
        sipAudio.srcObject = e.streams[0];
        // sipAudio.play();
        selfView.srcObject = (current_session18.connection.getLocalStreams()[0]);
        remoteView.srcObject = e.streams[0];

    }

}