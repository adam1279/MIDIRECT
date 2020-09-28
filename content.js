navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function getMIDIMessage(midiMessage) {
    data = [midiMessage.target.name, midiMessage.data];
    chrome.storage.sync.get(['binds'], function() {
        
    });
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}