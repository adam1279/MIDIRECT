navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

class BindDiv {
    constructor(bind) {
        this.bind = bind;
        this.element = this.create();
    }
    create() {
        let div = document.createElement('div');
        div.className = 'bindDiv';
        mainDiv.appendChild(div);
        this.addItem('Function', this.bind.func.name, div);
        return div;
    }
    addItem(key, value, parent) {
        let div = document.createElement('div');
        let keySpan = document.createElement('span');
        let valueSpan = document.createElement('span');

        keySpan.innerHTML = key+': ';
        valueSpan.innerHTML = value;

        div.appendChild(keySpan);
        div.appendChild(valueSpan);
        parent.appendChild(div);
    }
}

class NewButtonBindDiv {
    constructor() {
        this.element = this.create();
    }
    create() {
        let div = document.createElement('div');

        div.className = 'newButtonBindDiv';

        document.body.prepend(div);
        return div;
    }
    addItem(key, parent) {
        let span = document.createElement('span');
        span.innerHTML = key;

        let input = document.createElement('input');

        parent.appendChild(span);
        parent.appendChild(input);
    }
}
/*
{
    midi: {
        device: ___,
        command: ___,
        noteValue: ___,
        velocity: ___

    },
    action: {
        name: ___,
        func: ___
    }
}
*/

let browserActions = {
    openTab: 'New Tab',
    closeTab: 'Close Tab'
};

let backToFront = {
    device: 'Input Device',
    command: 'Command',
    noteValue: 'Note Value',

}

let mainDiv = document.getElementsByClassName('main')[0];
let newButtonBindButton = document.getElementsByClassName('newButtonBind')[0];
let newDialBindButton = document.getElementsByClassName('newDialBind')[0];

/*for (var key of Object.keys(browserActions)) {
    option = document.createElement('option');
    option.innerHTML = browserActions[key];
    option.value = key;
    .appendChild(option);
}*/

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function getMIDIMessage(midiMessage) {
    console.log(midiMessage.target.name);

    let inputDevice = midiMessage.target.name;
    let command = midiMessage.data[0];
    let noteValue = midiMessage.data[1];
    let velocity = midiMessage.data[2];

    let commandType = 'Other';
    switch(command) {
        case 144:
            commandType = 'Note On';
            break;
        case 128:
            commandType = 'Note Off';
            break;
        case 176:
            commandType = 'Non-Note';
            break;
    }
    
    inputDeviceInput.value = inputDevice;

    commandInput.value = command + ' (' + commandType + ')';
    noteValueInput.value = noteValue;
    velocityInput.value = velocity;
}

newButtonBindButton.addEventListener('click', function() {
    /*newButtonBindDiv.style.display = 'initial';
    mainDiv.style.display = 'none';*/
    new NewButtonBindDiv();
});

chrome.storage.sync.get(['binds'], function(result) {
    console.log(result.binds);
    for (let bind of result.binds) {
        new BindDiv(bind);
    }
});