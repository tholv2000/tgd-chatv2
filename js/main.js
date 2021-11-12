var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;
var roomId = null;

var emojiDict = {":)":"x1F642", ":'(":"x1F622", ";)":"x1F609", ":D":"x1F600", ":O":"x1F62E", ":(":"x1F626"};

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    roomId = document.querySelector('#room').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/' + roomId, onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, roomId: roomId, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    console.log(1);
    console.log(error);
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            roomId: roomId,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    console.log(message);
    var messageElement = document.createElement('li');
    var messageBox = document.createElement('div')

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' đã tham gia';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else if (message.type === 'CHAT') {
        if (message.sender === username) {
            messageElement.classList.add('my-message');
        } else {
            messageElement.classList.add('chat-message');
        }

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.style['display'] = 'flex';
        usernameElement.style['justify-content'] = message.sender === username ? 'flex-end' : 'flex-start';
        usernameElement.appendChild(usernameText);
        messageBox.classList.add('message-box');
        messageBox.appendChild(usernameElement);
    }
    if (message.type == "FILE") {
        if (message.sender === username) {
            messageElement.classList.add('my-message');
        } else {
            messageElement.classList.add('chat-message');
        }

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        usernameElement.style['display'] = 'flex';
        usernameElement.style['justify-content'] = message.sender === username ? 'flex-end' : 'flex-start';
        messageBox.appendChild(usernameElement);
        var p = document.createElement('div');
        p.style.fontSize = "15px";
        p.style.fontWeight = "900";
        var textFile = document.createTextNode(message.filename);
        p.appendChild(textFile);

        var linkSource = "data:application/octet-stream;base64," + message.content;
        var  downloadLink = document.createElement('a');
        downloadLink.appendChild(p);
        downloadLink.href = linkSource;
        downloadLink.download = message.filename;
        messageBox.appendChild(downloadLink);
        messageBox.classList.add('message-box');
        messageElement.appendChild(messageBox);
    }
    else if (message.type == "CALL") {
        if (message.sender == username) {
            window.open("roomvideo.html?roomId=" + roomId);
        }
        else {
            document.getElementById("modal-notice").style.display = "block";
            document.getElementById("answerBtn").onclick = function() {
                document.getElementById("modal-notice").style.display = "none";
                window.open("roomvideo.html?roomId=" + roomId);
            }
            document.getElementById("cancelBtn").onclick = function() {
                document.getElementById("modal-notice").style.display = "none";
            }
            document.getElementsById("closeBtn").onclick = function() {
                document.getElementById("modal-notice").style.display = "none";
            }
        }
    }
    else if (message.type == "CHAT") {
        // result after replacing emoji
        var result = "";
        var contentResponse = message.content;

        for (let key in emojiDict) {
            if (contentResponse.includes(key)) {
                //console.log(emojiDict[key]);
                contentResponse = contentResponse.replaceAll(key, "&#" + emojiDict[key]);
                //console.log(contentResponse);
            }
        }
        var textElement = document.createElement('p');
        textElement.innerHTML = contentResponse;


        messageBox.appendChild(textElement);
        messageElement.appendChild(messageBox);

    }

    else {


        var textElement = document.createElement('p');
        var messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);
        
        messageBox.appendChild(textElement);
        messageElement.appendChild(messageBox);
    }


    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function uploadFile(e) {
    let file = e.target.files[0];
    let filename = file.name;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        let inputData = reader.result;
        let replaceValue = inputData.split(',')[0];
        let base64File = inputData.replace(replaceValue + ",", "");
        if(stompClient) {
            var chatMessage = {
                sender: username,
                content: base64File,
                filename: filename,
                roomId: roomId,
                type: 'FILE'
            };
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        }
        console.log(base64File);
    }
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
document.getElementById("button_upload").onclick = function() {
    document.getElementById("upload_file").click();
}
document.getElementById("callBtn").onclick = function() {
    if (stompClient) {
        var chatMessage = {
            sender: username,
            roomId: roomId,
            type: 'CALL'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    }
}
