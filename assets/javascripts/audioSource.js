var AudioSource = function(audioElement) {
    var player = document.getElementById(audioElement);
    var self = this;
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext); // this is because it's not been standardised accross browsers yet.
    var node = audioCtx.createScriptProcessor(2048, 1, 1);
    audioCtx.crossOrigin = 'anonymous';
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256; // see - there is that 'fft' thing.
    analyser.smoothingTimeConstant = 0.3;
    var source = audioCtx.createMediaElementSource(player); // this is where we hook up the <audio> element
    node.connect(audioCtx.destination);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    node.onaudioprocess = function() {
        // This closure is where the magic happens. Because it gets called with setInterval below, it continuously samples the audio data
        // and updates the streamData and volume properties. This the AudioSource function can be passed to a visualization routine and
        // continue to give real-time data on the audio stream.
        analyser.getByteFrequencyData(self.streamData);
        // calculate an overall volume value
        var total = 0;
        for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            total += self.streamData[i];
        }
        self.volume = total;
    };
    //setInterval(sampleAudioStream, 20); //
    // public properties and methods
    this.volume = 0;
    this.streamData = new Uint8Array(128); // This just means we will have 128 "bins" (always half the analyzer.fftsize value), each containing a number between 0 and 255.
    this.playStream = function(streamUrl) {
        // get the input stream from the audio element
        player.setAttribute('src', streamUrl);
        player.play();
    }
};
