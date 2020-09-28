chrome.storage.sync.get(['binds'], function (result) {
    if (result.binds == undefined) {
        //let newBinds = [];
        let newBinds = [
            {
                device: 'OP-1 Midi Device',
                command: 128,
                noteValue: 60,
                velocity: 64,
                func: 'openTab'
            }
        ]
        chrome.storage.sync.set({ binds: newBinds });
    }
});