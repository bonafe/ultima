/*
(async () => {
  await navigator.mediaDevices.getUserMedia({audio: true, video: true});
  let devices = await navigator.mediaDevices.enumerateDevices();
  console.log(devices);
})();
*/

navigator.mediaDevices.getUserMedia({audio: true, video: false}).then( () => {
    navigator.mediaDevices.enumerateDevices().then( devices => {
        devices.forEach(device => {
            console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
        });
    });
});

/*
// Prefer camera resolution nearest to 1280x720.
var constraints = { audio: true, video: true};

navigator.mediaDevices.getUserMedia(constraints)
.then(function(mediaStream) {
  var video = document.querySelector('video');
  video.srcObject = mediaStream;
  video.onloadedmetadata = function(e) {
    video.play();
  };
})
.catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
*/