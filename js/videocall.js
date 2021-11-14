console.log("ver03");
if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    // Firefox 38+ seems having support of enumerateDevicesx
    navigator.enumerateDevices = function(callback) {
        navigator.mediaDevices.enumerateDevices().then(callback);
    };
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
// const socket = io('http://localhost:3030');
const roomId = new URLSearchParams(location.search).get('roomId');
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(uuidv4())
const peers = {}
let streamTemp;

function addVideoStream(video, stream) {
  video.srcObject = stream
  
  video.play()
    
  videoGrid.append(video)
  console.log(videoGrid)
}

checkDeviceSupport(function() {
  console.log(myPeer.id);
  let myVideoStream;

  const myVideo = document.createElement('video')
  myVideo.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg"
  myVideo.muted = true;
  
  if (hasWebcam && hasMicrophone) {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      myVideoStream = stream;
      streamTemp = stream;
      addVideoStream(myVideo, stream)
    })
  }

  else {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
    //document.querySelector('.main__video_button').disabled = true;
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(stream => {
      myVideoStream = stream;
      streamTemp = stream;
      addVideoStream(myVideo, stream)
    })
  }

  document.getElementById('muteUnmuteBtn').onclick = function() {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }

  document.getElementById('playStopVideo').onclick = function() {
    if (hasWebcam) {
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
});

// myPeer.on('open', id => {
//   socket.emit('join-room', roomId, id)
// })

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
  console.log(Object.keys(peers).length)
})

myPeer.on('call', call => {
  console.log(streamTemp)
  //console.log(streamTemp.getVideoTracks()[0])
  call.answer(streamTemp)

  const video = document.createElement('video')
  video.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg";
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
})

socket.on('user-connected', userId => {
  console.log(userId);
  connectToNewUser(userId);
})

myPeer.on('open', id => {
  socket.emit('join-room', roomId, id)
})

function connectToNewUser(userId) {
  console.log(userId);
  //console.log(stream);
  console.log(streamTemp);
  const call = myPeer.call(userId, streamTemp)
  console.log(call);
  const video = document.createElement('video')
  video.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg"
  call.on('stream', userVideoStream => {
    console.log(userVideoStream.getVideoTracks()[0]);
    if (userVideoStream.getVideoTracks()[0]) {
      console.log("check video stream is available: " + userVideoStream.getVideoTracks()[0].enabled);
      if (userVideoStream.getVideoTracks()[0].enabled == false) {
        userVideoStream.getVideoTracks()[0].enabled = true;
      }
    }
    else {
      console.log("video stream is not available")
    }
    console.log("audio stream:" + userVideoStream.getAudioTracks()[0])
    console.log("check audio stream is available: " + userVideoStream.getAudioTracks()[0].enabled);
    
    
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
  console.log(Object.keys(peers).length)
}


