/*navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

//alert('hi');


function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function getMIDIMessage(midiMessage) {
    console.log(midiMessage);
    data = {
        device: midiMessage.target.name,
        command: midiMessage.data[0],
        noteValue: midiMessage.data[1],
        velocity: midiMessage.data[2]
    };
    chrome.storage.sync.get(['binds'], function (result) {
        for (let bind of result.binds) {
            let shouldRun = true;
            for (let dataPoint of Object.keys(data)) {
                if (bind[dataPoint] !== data[dataPoint]) {
                    shouldRun = false;
                }
            }
            if (shouldRun) {
                //functions[bind.func](bind.params);
                chrome.runtime.sendMessage({greeting: bind}, function(response) {
                    console.log(response);
                });
            }
        }
        //functions[result.binds.func](result.binds.params);
    });
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}*/