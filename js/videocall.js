if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    // Firefox 38+ seems having support of enumerateDevicesx
    navigator.enumerateDevices = function(callback) {
        navigator.mediaDevices.enumerateDevices().then(callback);
    };
}

var MediaDevices = [];
var isHTTPs = location.protocol === 'https:';
var canEnumerate = false;

if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
    canEnumerate = true;
} else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
    canEnumerate = true;
}

var hasMicrophone = false;
var hasSpeakers = false;
var hasWebcam = false;

var isMicrophoneAlreadyCaptured = false;
var isWebcamAlreadyCaptured = false;
function checkDeviceSupport(callback) {
    if (!canEnumerate) {
        return;
    }

    if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
    }

    if (!navigator.enumerateDevices && navigator.enumerateDevices) {
        navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
    }

    if (!navigator.enumerateDevices) {
        if (callback) {
            callback();
        }
        return;
    }

    MediaDevices = [];
    navigator.enumerateDevices(function(devices) {
        devices.forEach(function(_device) {
            var device = {};
            for (var d in _device) {
                device[d] = _device[d];
            }

            if (device.kind === 'audio') {
                device.kind = 'audioinput';
            }

            if (device.kind === 'video') {
                device.kind = 'videoinput';
            }

            var skip;
            MediaDevices.forEach(function(d) {
                if (d.id === device.id && d.kind === device.kind) {
                    skip = true;
                }
            });

            if (skip) {
                return;
            }

            if (!device.deviceId) {
                device.deviceId = device.id;
            }

            if (!device.id) {
                device.id = device.deviceId;
            }

            if (!device.label) {
                device.label = 'Please invoke getUserMedia once.';
                if (!isHTTPs) {
                    device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                }
            } else {
                if (device.kind === 'videoinput' && !isWebcamAlreadyCaptured) {
                    isWebcamAlreadyCaptured = true;
                }

                if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
                    isMicrophoneAlreadyCaptured = true;
                }
            }

            if (device.kind === 'audioinput') {
                hasMicrophone = true;
            }

            if (device.kind === 'audiooutput') {
                hasSpeakers = true;
            }

            if (device.kind === 'videoinput') {
                hasWebcam = true;
            }

            // there is no 'videoouput' in the spec.

            MediaDevices.push(device);
        });

        if (callback) {
            callback();
        }
    });
}



const socket = io('https://videocallchat-server.herokuapp.com')
const videoGrid = document.getElementById('video-grid')
const roomId = new URLSearchParams(location.search).get('roomId');
 const myPeer = new Peer(uuidv4())
//const myPeer = new Peer();
console.log(myPeer.id);
let myVideoStream;


console.log(hasMicrophone)
console.log(hasWebcam)
console.log(isMicrophoneAlreadyCaptured)
console.log(isWebcamAlreadyCaptured)

const myVideo = document.createElement('video')
myVideo.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg"
myVideo.muted = true;
const peers = {}
if (hasWebcam && hasMicrophone) {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
      console.log(stream)
      call.answer(stream)
      
      const video = document.createElement('video')
      video.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg";
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })

    socket.emit('join-room', roomId, myPeer.id);
    
  })

  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })
}

else {
  navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
  }).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
      console.log(stream)
      call.answer(stream)
      
      const video = document.createElement('video')
      video.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg";
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })

    socket.emit('join-room', roomId, myPeer.id);
    
  })

  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })
}

// myPeer.on('open', id => {
//   socket.emit('join-room', roomId, id)
// })

function connectToNewUser(userId, stream) {
  console.log(userId);
  //console.log(stream);
  const call = myPeer.call(userId, stream)
  //console.log(call);
  const video = document.createElement('video')
  video.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg"
  call.on('stream', userVideoStream => {
    console.log(2);
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
  console.log(videoGrid)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

