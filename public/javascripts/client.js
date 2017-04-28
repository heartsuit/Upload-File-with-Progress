// client validation
function validateInput() {
	var uploadButton = document.forms[0].upload;
	uploadButton.onclick = function () {
		var file = document.forms[0].file.value;
		if (file.length == 0) {
			document.getElementById('uploadProgress').innerText = 'No file selectd!';
			return false;
		}

		var name = document.forms[0].name.value;
		if (name.length != 0) {
			var invalidChars = name.match(/[^a-zA-Z0-9_()\u4e00-\u9fa5]+/g); // match invalid file name
			if (invalidChars.length != 0) {
				document.getElementById('uploadProgress').innerText = 'Invalid file name!';
				return false;
			}
		}
	}
}

// communication between client and server using socket.io
function getUploadProgressFromServer() {
	var socket = io.connect("http://localhost:8888");
	var uploadProgress = document.getElementById("uploadProgress");
	var bar = document.getElementById('bar');

	socket.on("progress", function (data) {
		if ("progress" === data.name) {
			var percentage = Math.floor(data.bytesReceived / data.bytesExpected * 100);
			uploadProgress.innerText = percentage + '%';
			bar.style.width = percentage / 100 * document.body.offsetWidth + 'px';
		} else {
			console.log("There is nothing.", data);
		}
	});
}

// fired on window.onload 
function addLoadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function () {
			oldonload();
			func();
		}
	}
}

// bind events
addLoadEvent(validateInput);
addLoadEvent(getUploadProgressFromServer);