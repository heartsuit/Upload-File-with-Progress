var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

var fileUploaded = new Map(); // store uploaded files

exports.list = function (req, res) {
  res.render('index', {
    title: "File upload",
    fileUploaded: fileUploaded
  });
};

exports.submit = function (dir) {
  return function (req, res, next) {
    var form = new formidable.IncomingForm();

    // high level formidable API
    form.uploadDir = dir; // set destination
    form.hash = 'md5'; // use hash algorithm, we can get hash value by 'file.hash'
    form.parse(req, function (err, fields, files) {
      // console.log(fields);
      // console.log(files);
      files.file.lastModifiedDate = files.file.lastModifiedDate.toLocaleString();
      var f = {
        newName: fields.name.length == 0
          ? files.file.name
          : fields.name + path.extname(files.file.name),
        file: files.file
      };
      if (fileUploaded.has(files.file.hash)) {
        form.emit('aborted'); // doesn't work!?
        console.log('aborted');
      } else {
        fileUploaded.set(files.file.hash, f); // add to map
      }

      fs.rename(files.file.path, path.join(form.uploadDir, files.file.name), function (err) {
        if (err) {
          console.log(err);
        }
        res.redirect('/upload');
        console.log('Finished.');
      });
    });

    var io = req.app.get('socketio'); // get reference to socket.io

    // listening progress event and send data to client
    form.on('progress', function (bytesReceived, bytesExpected) {
      var percent = Math.floor(bytesReceived / bytesExpected * 100);
      console.log(percent);

      var progress = {
        name: 'progress',
        bytesReceived: bytesReceived,
        bytesExpected: bytesExpected
      };

      // emit event : progress
      io.emit('progress', progress); //notify all client, no session here
    });
  }
};

exports.download = function (dir) {
  return function (req, res, next) {
    var id = req.params.id;
    var file = fileUploaded.get(id);
    var targetPath = path.join(dir, file.file.name);

    // second parameter can be used to specify file name
    res.download(targetPath, file.newName);
  };
};