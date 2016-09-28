var Recorder = Recorder || {};
var Storage = Storage || {};
var ElementUtil = ElementUtil || {};

ElementUtil = (function () {
    var api = {
        createElement: function(type, options) {
            var newElement = document.createElement(type);
            if(options) {
                var keys = Object.keys(options);
                keys.forEach(function(key) {
                    if(key === 'class') {
                        var classes = options[key];
                        classes.split(' ').forEach(function(cl) {
                           newElement.classList.add(cl);
                        });
                    }
                    else
                        newElement[key] = options[key];
                });
            }
            return newElement;
        },
        setStyle: function(elem, object) {
            var keys = Object.keys(object);
            var styles = '';
            keys.forEach(function(key) {
               styles += key + ':' + object[key] + '; ';
            });
            elem.setAttribute('style', styles);
        },
        eventRegister: function(eventName, element, callback) {
            element.addEventListener(eventName, callback);
        }
    };
    return api;
})();

Storage = (function () {
    var fn = {
        _setItem: function (key, value) {
            if(window.sessionStorage) {
                window.localStorage.setItem(key, value);
            }
            else {
                //document.cookie = key + '=' + value;
            }
        },
        _getItem: function (key) {
            if(window.sessionStorage) {
                return window.localStorage.getItem(key);
            }
            else {
                //document.cookie = key + '=' + value;
            }
        }
    };
    var api = {
        setItem: function (key, value) {
            return fn._setItem.apply(this, arguments);
        },
        getItem: function (key) {
            return fn._getItem.apply(this, arguments);
        }
    };
    return api;
})();

Recorder.record = (function() {
    var fn, api;
    var cache = {
        'body': document.body  
    };
    var events = {
        'click': 'click',
        'mouseover': 'mouseover'
    };
    var recordedArr = [];
    var eventHandlers = {
        'click': 'fn._handleClick',
        'mouseover': 'fn._handleMouseOver'
    };
    var ignore = ['borathon-class'];
    
    fn = {
        _init: function () {
            fn._createRecordButtons();
        },
        _createRecordButtons: function() {
            
            var recordContainer = ElementUtil.createElement('div', {
               class: 'borathon-class recorder-container' 
            });
            
            var startButton = ElementUtil.createElement('button', {
                class: 'borathon-class recorder-start-button recorder-btn-class'
            });
            var stopButton = ElementUtil.createElement('button', {
                class: 'borathon-class recorder-stop-button recorder-btn-class'
            });
            var quitRecord = ElementUtil.createElement('button', {
                class: 'borathon-class recorder-quit-button recorder-btn-class'
            });
        
            startButton.innerHTML = 'Start';
            stopButton.innerHTML = 'Stop';
            quitRecord.innerHTML = 'Quit';
            
            recordContainer.appendChild(startButton);
            recordContainer.appendChild(stopButton);
            recordContainer.appendChild(quitRecord);
            
            ElementUtil.setStyle(recordContainer, {
                position: 'fixed',
                top: 0,
                left: '45%',
                'z-index': '9999',
                'text-align': 'center',
                padding: '10px'
            });
            
            cache['body'].appendChild(recordContainer);
            
            ElementUtil.eventRegister('click', startButton, fn._handleStartClick);
            ElementUtil.eventRegister('click', stopButton, fn._handleStopClick);
            ElementUtil.eventRegister('click', quitRecord, fn._handleQuitClick);
        },
        _handleStartClick: function() {
            fn._registerEvents();
            fn._unLoad();
        },
        _handleStopClick: function() {
            fn._unRegisterEvents();
            fn._handleUnLoad();
        },
        _handleQuitClick: function() {
            console.log(event);
        },
        _unLoad: function () {
            window.addEventListener('unload', function(event) {
                console.log('Unload');
                fn._handleUnLoad();
            }); 
        },
        _toJSON: function (object) {
            recordedArr.push(object);
        },
        _writeToLS: function () {
            Storage.setItem('recorderJSON', JSON.stringify(recordedArr));
        },
        _readFromLS: function(key) {
            var recordedStringAsJson = '';
            var recordedString = Storage.getItem(key);
            if(recordedString) {
                recordedStringAsJson = JSON.parse(recordedString);
            }
            return recordedStringAsJson;  
        },
        _checkIgnore: function(currentEvt, className) {
            var classes = currentEvt.classList;
            return (classes.contains(className) || currentEvt.closest('.' + className) && currentEvt.closest('.' + className).length > 0);
        },
        _handleClick: function () {
            var current = event.target;
            var obj = {};
            var componentObj = {};
            
            if(fn._checkIgnore(event.target, ignore[0])) return;
            
            if(current.getAttribute('id')) componentObj.id = current.getAttribute('id');
            if(current.classList.length > 0) componentObj.classes = current.classList;
            
            obj.pageName = window.location.pathname;
            obj.component = componentObj;
            obj.description = current.innerText || '';
            console.log(event.target);
            fn._toJSON(obj);
        },
        _handleMouseOver: function () {
            console.log(event);
        },
        _handleUnLoad: function () {
            fn._writeToLS();  
        },
        _registerEvents: function () {
            var keys = Object.keys(events);
            keys.forEach(function(key) {
                if(key === 'click') eventHandlers[key] = fn._handleClick;
                cache['body'].addEventListener(events[key], eventHandlers[key]);    
            });
        },
        _unRegisterEvents: function() {
            var keys = Object.keys(events);
            keys.forEach(function(key) {
                if(key === 'click') eventHandlers[key] = fn._handleClick;
                cache['body'].removeEventListener(events[key], eventHandlers[key], false);    
            });
        }
    };
    
    api = {
        init: function () {
            return fn._init.apply(this, arguments);
        },
        unRegister: function () {
            return fn._unRegisterEvents.apply(this, arguments);
        },
        readFromLS: function() {
            return fn._readFromLS.apply(this, arguments);
        }
    };
    
    return api;
})();