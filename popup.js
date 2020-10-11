//chrome.runtime.sendMessage({running: true});
chrome.runtime.connect();
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    console.log('MIDI Success');
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}


class BindDiv {
    constructor(bind, id) {
        this.bind = bind;
        this.id = id;
        this.element = this.create();
    }
    create() {
        let ths = this;
        let div = document.createElement('div');
        div.className = 'bindDiv';
        bindDivsDiv.appendChild(div);

        let title = document.createElement('span');
        title.className = 'bindDivTitle';
        title.innerHTML = this.bind.title;
        div.appendChild(title);
        let items = ['device', 'command', 'noteValue', 'velocity'];
        this.addItem('Function', browserActions[this.bind.func].text, div);
        for (let item of items) {
            this.addItem(backToFront[item], this.bind[item], div);
        }
        div.appendChild(document.createElement('br'));
        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Delete';
        deleteButton.addEventListener('click', function() {
            ths.removeBind();
        });
        /*let editButton = document.createElement('button');
        editButton.innerHTML = 'Edit';
        editButton.addEventListener('click', function() {
            new NewButtonBindDiv(ths.bind);
            mainDiv.style.display = 'none';
        });*/

        div.appendChild(deleteButton);
        //div.appendChild(editButton);
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
    removeBind() {
        removeBind(this.id);
        this.element.parentNode.removeChild(this.element);
    }
}

class NewButtonBindDiv {
    constructor(bind) {
        this.bind = bind;
        this.element = this.create();
    }
    create() {
        let ths = this;
        let div = document.createElement('div');

        div.className = 'newButtonBindDiv';

        let titleSpan = document.createElement('span');
        titleSpan.innerHTML = 'Title';
        let titleInput = document.createElement('input');
        if (this.bind) {
            titleInput.value = this.bind.title;
        }
        this.titleInput = titleInput;

        div.appendChild(titleSpan);
        div.appendChild(titleInput);

        div.appendChild(document.createElement('br'));
        div.appendChild(document.createElement('br'));

        let items = ['device', 'command', 'noteValue', 'velocity'];
        for (let item of items) {
            this.addItem(item, div);
        }
        let datalist = document.createElement('datalist');
        datalist.id = 'midiVariables';
        for (let i = 1; i < items.length; i++) {
            let option = document.createElement('option');
            option.value = items[i];
            option.innerHTML = backToFront[items[i]];
            datalist.appendChild(option);
        }
        div.appendChild(datalist);
        let funcSpan = document.createElement('span');
        funcSpan.innerHTML = '<br>Function';
        let funcSelect = document.createElement('select');
        for (let action of Object.keys(browserActions)) {
            let option = document.createElement('option');
            option.innerHTML = browserActions[action].text;
            option.value = action;
            funcSelect.appendChild(option);
        }
        let paramDiv = document.createElement('div');
        paramDiv.className = 'paramDiv';
        this.paramDiv = paramDiv;
        this.funcSelect = funcSelect;
        this.updateParamDiv();
        funcSelect.addEventListener('change', function() {
            ths.updateParamDiv();
        });
        div.appendChild(funcSpan);
        div.appendChild(funcSelect);
        div.appendChild(paramDiv);
        div.appendChild(document.createElement('br'));
        div.appendChild(document.createElement('br'));

        let createButton = document.createElement('button');
        let cancelButton = document.createElement('button');
        createButton.innerHTML = 'Create';
        cancelButton.innerHTML = 'Cancel';
        createButton.addEventListener('click', function() {
            ths.createBind();
        });
        cancelButton.addEventListener('click', function() {
            ths.close();
        });
        div.appendChild(createButton);
        div.appendChild(cancelButton);
        document.body.appendChild(div);
        return div;
    }
    addItem(key, parent) {
        let span = document.createElement('span');
        span.innerHTML = backToFront[key];

        let input = document.createElement('input');
        if (this.bind) {
            input.value = this.bind[key];
        }
        this[key] = input;

        let div = document.createElement('div');
        div.appendChild(span);
        div.appendChild(input);
        parent.appendChild(div);
    }
    update(midiMessage) {
        console.log(midiMessage);
        this.data = {
            device: midiMessage.target.name,
            command: midiMessage.data[0],
            noteValue: midiMessage.data[1],
            velocity: midiMessage.data[2]
        }
    
        let commandType = 'Other';
        switch(this.data.command) {
            case 144:
                commandType = '(Note On)';
                break;
            case 128:
                commandType = '(Note Off)';
                break;
            case 176:
                commandType = '(Non-Note)';
                break;
        }
        let newData = JSON.parse(JSON.stringify(this.data));
        newData.command += ' ' + commandType;
        for (let dataPoint of Object.keys(newData)) {
            this[dataPoint].value = newData[dataPoint];
        }

    }
    createBind() {
        console.log(this);
        if (this.data) {
            let titleInput;
            if (this.titleInput.value == '') {
                titleInput = browserActions[this.funcSelect.value].text + ' - ' + this.data.device;
            } else {
                titleInput = this.titleInput.value;
            }
            console.log('oop');
            let paramObj = {};
            for (let paramInput of this.paramInputs) {
                let value;
                if (paramInput.type == 'checkbox') {
                    value = paramInput.checked;
                } else {
                    value = paramInput.value;
                }
                paramObj[paramInput.getAttribute('data-name')] = value;
            }
            console.log(paramObj);
            let bindObj = {
                title: titleInput,
                device: this.data.device,
                command: this.data.command,
                noteValue: this.data.noteValue,
                velocity: this.data.velocity,
                func: this.funcSelect.value,
                params: paramObj
            }
            chrome.storage.sync.get(['binds', 'bindCount'], function(result) {
                let obj = result.binds;
                obj[Number(result.bindCount) + 1] = bindObj;
                chrome.storage.sync.set({'binds': obj});
                chrome.storage.sync.set({'bindCount': result.bindCount + 1});
                new BindDiv(bindObj, result.bindCount + 1);
            });
            this.close();
        }
    }
    close() {
        document.body.removeChild(this.element);
        mainDiv.style.display = 'initial';
    }
    updateParamDiv() {
        this.paramDiv.innerHTML = '';
        this.paramInputs = [];
        for (let param of browserActions[this.funcSelect.value].params) {
            let paramSpan = document.createElement('span');
            paramSpan.innerHTML = param.text;
            this.paramDiv.appendChild(paramSpan);
            let paramInput = document.createElement('input');
            paramInput.setAttribute('data-name', param.name);
            switch(param.type) {
                case 'bool':
                    paramInput.type = 'checkbox';
                    paramInput.checked = param.value;
                    paramInput.className = 'paramCheckbox';
                    break;
                case 'number':
                    paramInput.type = 'number';
                    paramInput.value = param.value;
                    //paramInput.setAttribute('list', 'midiVariables');
                    break;
                case 'string':
                    paramInput.type = 'text';
                    paramInput.value = param.value;
                    break;
            }
            this.paramDiv.appendChild(paramInput);
            this.paramInputs.push(paramInput);
        }
    }
}

let browserActions = {
    openTab: {
        text: 'New tab',
        params: [
            {
                name: 'active',
                type: 'bool',
                text: 'Active when opened',
                value: true
            }
        ]
    },
    closeActiveTab: {
        text: 'Close tab',
    },
    closeTabFromIndex: {
        text: 'Close tab based on index',
        params: [
            {
                name: 'index',
                type: 'number',
                text: 'Index of tab',
                value: 0
            }
        ]
    },
    openTabFromUrl: {
        text: 'Open tab with specific URL',
        params: [
            {
                name: 'url',
                type: 'string',
                text: 'URL',
                value: ''
            },
            {
                name: 'active',
                type: 'bool',
                text: 'Active when opened',
                value: true
            }
        ]
    },
    goToTabFromIndex: {
        text: 'Go to tab with specific index',
        params: [
            {
                name: 'index',
                type: 'number',
                text: 'Index of tab',
                value: 0
            }
        ]
    }
};

let backToFront = {
    device: 'Input Device',
    command: 'Command',
    noteValue: 'Note Value',
    velocity: 'Velocity',
    func: ''
}

let mainDiv = document.getElementsByClassName('main')[0];
let newButtonBindButton = document.getElementsByClassName('newButtonBind')[0];
let newDialBindButton = document.getElementsByClassName('newDialBind')[0];
let bindDivsDiv = document.getElementsByClassName('bindDivs')[0];

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
    /*console.log(midiMessage.target.name);

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
    */
    /*inputDeviceInput.value = inputDevice;

    commandInput.value = command + ' (' + commandType + ')';
    noteValueInput.value = noteValue;
    velocityInput.value = velocity;*/
    currentNewButtonBindDiv.update(midiMessage);
}

newButtonBindButton.addEventListener('click', function() {
    /*newButtonBindDiv.style.display = 'initial';
    mainDiv.style.display = 'none';*/
    currentNewButtonBindDiv = new NewButtonBindDiv();
    mainDiv.style.display = 'none';
});

chrome.storage.sync.get(['binds'], function (result) {
    console.log(result.binds);
    let bindsCopy = Object.keys(result.binds).map(x => Number(x)).sort((a, b) => a - b);
    console.log(bindsCopy);
    for (let i = 0; i < bindsCopy.length; i++) {
        new BindDiv(result.binds[bindsCopy[i]], bindsCopy[i]);
    }
});

function removeBind(id) {
    chrome.storage.sync.get(['binds'], function(result) {
        let newBinds = result.binds;
        newBinds[id] = undefined;
        chrome.storage.sync.set({'binds': newBinds});
    });
}