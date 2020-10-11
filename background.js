chrome.storage.sync.get(['binds', 'bindCount'], function (result) {
    if (result.binds == undefined) {
        let newBinds = {};
        /*let newBinds = {
            11: {
                title: 'Open That Tab',
                device: 'OP-1 Midi Device',
                command: 128,
                noteValue: 60,
                velocity: 64,
                func: 'openTab',
                params: {
                    active: true
                }
            },
            2: {
                title: 'Open That Tab 2',
                device: 'OP-1 Midi Device',
                command: 128,
                noteValue: 61,
                velocity: 64,
                func: 'closeActiveTab',
                params: ''
            }
        };*/
        chrome.storage.sync.set({ binds: newBinds });
    }
    if (result.bindCount == undefined) {
        chrome.storage.sync.set({'bindCount': 0});
    }
});
let performActions = true;
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

let functions = {
    openTab: function (params) {
        active = params.active;
        chrome.tabs.create({active: active});
    },
    closeActiveTab: function (params) {
        chrome.tabs.query({active: true}, function(tabs) {
            chrome.tabs.remove(tabs[0].id);
        });
    },
    closeTabFromIndex: function (params) {
        chrome.tabs.query({currentWindow: true}, function(tabs) {
            chrome.tabs.remove(tabs[Number(params.index)].id);
        });
    },
    openTabFromUrl: function (params) {
        if (params.url) {
            chrome.tabs.create({url: params.url, active: params.active});
        } else {
            chrome.tabs.create({active: params.active});
        }
    },
    goToTabFromIndex: function (params) {
        chrome.tabs.query({currentWindow: true}, function(tabs) {
            chrome.tabs.remove(tabs[Number(params.index)].id, {active: true});
        });
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
        let bindsCopy = Object.keys(result.binds).map(x => Number(x)).sort((a, b) => a - b);
        for (let i = 0; i < bindsCopy.length; i++) {
            let shouldRun = true;
            for (let dataPoint of Object.keys(data)) {
                if (result.binds[bindsCopy[i]][dataPoint] !== data[dataPoint]) {
                    shouldRun = false;
                }
            }
            if (shouldRun && performActions) {
                //functions[bind.func](bind.params);
                functions[result.binds[bindsCopy[i]].func](result.binds[bindsCopy[i]].params);
                
            }
        }
        //functions[result.binds.func](result.binds.params);
    });
}


chrome.runtime.onConnect.addListener(function(port) {
    performActions = false;
    port.onDisconnect.addListener(function () {
        console.log('whoop');
        performActions = true;
    });
});