
const socket = io('https://videocallchat-server.herokuapp.com')

let videoGrid = document.getElementById('video-grid')
let roomId = new URLSearchParams(location.search).get('roomId');
let myPeer = new Peer(uuidv4())
//const myPeer = new Peer();
console.log(myPeer.id);
let myVideoStream;
let myVideo = document.createElement('video')
myVideo.poster = "https://gamek.mediacdn.vn/133514250583805952/2020/2/26/photo-1-15827070847125071669.jpeg"
myVideo.muted = true;
let peers = {}
if (DetectRTC.hasWebcam && DetectRTC.hasMicrophone) {
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


// myPeer.on('open', id => {
//   socket.emit('join-room', roomId, id)
// })



