<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    <meta charset="UTF-8">
    <title>TGD chat</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="css/main.css" />
</head>
<body>
<noscript>
    <h2>Sorry! Your browser doesn't support Javascript</h2>
</noscript>

<div id="username-page">
    <div class="username-page-container">
        <h1 class="title">Nhập username</h1>
        <form id="usernameForm" name="usernameForm">
            <div class="form-group">
                <input type="text" id="name" placeholder="Username" autocomplete="off" class="form-control" />
            </div>
            <h1 class="title">Nhập mã phòng</h1>
            <div class="form-group">
                <input type="text" id="room" placeholder="Mã phòng" autocomplete="off" class="form-control" />
            </div>
            <div class="form-group">
                <button type="submit" class="accent username-submit">Vào</button>
            </div>
        </form>
    </div>
</div>

<div id="chat-page" class="hidden">
    <div class="chat-container">
        <div class="chat-header">
            <h2>TDG chatapp</h2>
        </div>
        <div class="connecting">
            Đang kết nối...
        </div>
        <ul id="messageArea">

        </ul>
        <div class="send-box">
            <div>
                <input type="file" id="upload_file" onchange="uploadFile(event)">
                <button class="btn btn-primary" id="button_upload">Gửi file</button>
            </div>
            <div style="margin-left: 5px;">
                <button class="btn btn-primary" id="callBtn">Call</button>
            </div>
            <form id="messageForm" name="messageForm">
                <div class="form-group">
                    <div class="input-group clearfix">
                        <input type="text" id="message" placeholder="Nhập tin nhắn..." autocomplete="off" class="form-control"/>
                        <button type="submit" class="primary">Gửi tin</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div class="modal" id="modal-notice" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="document.getElementById('modal-notice').style.display='none'">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    Bạn có một cuộc họp video
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" id="cancelBtn">Hủy</button>
                    <button type="button" class="btn btn-primary" id="answerBtn">Trả lời</button>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="video-call" class="hidden">
    <div>
        <h3 style="margin: 5px">Other Person</h3>
        <video style="width: 50vh; height: 50vh;" id="remoteVideo" controls autoplay></video>
    </div>

    <div>
        <h3 style="margin: 5px">You</h3>
        <video style="width: 50vh; height: 50vh;" id="localVideo" controls autoplay></video>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.4/sockjs.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
<script src="js/main.js" charset="utf-8"></script>
</body>
</html>
