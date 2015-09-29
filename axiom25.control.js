loadAPI(1);

host.defineController("M-Audio", "Axiom 25 (1st gen)", "1.0", "1965a650-634a-11e5-a837-0800200e9a66");

host.defineMidiPorts(2, 1);

var MODENAMES = [ "Macro", "Common", "Envelope", "Parameter" ];
var MODE_MACRO = 0;
var MODE_COMMON = 1;
var MODE_ENVELOPE = 2;
var MODE_PARAMS = 3;

var NUM_MODES = 4;
var PARAM_PAGE = 0;

var ROT_MODE = MODE_MACRO;

var MACRO_LOW = 40;
var MACRO_HIGH = 47;
var TRANSPORT_LOW = 20;
var TRANSPORT_HIGH = 25;
var PARAM_LOW = 70;
var PARAM_HIGH = 78;
var LOOP = 20;
var REW = 21;
var FWD = 22;
var STOP = 23;
var PLAY = 24;
var REC = 25;
var TRACK_VOL_LOW = 80;
var TRACK_VOL_HIGH = 87;


function isRotary(cc) {
    return cc >= MACRO_LOW && cc <= MACRO_HIGH;
}

function enableIndication() {
    for (var i = 0; i<8; i++ ) {
        cursorDevice.getCommonParameter(i).setIndication(ROT_MODE == MODE_COMMON);
        cursorDevice.getEnvelopeParameter(i).setIndication(ROT_MODE == MODE_ENVELOPE);
        cursorDevice.getParameter(i).setIndication(ROT_MODE == MODE_PARAMS);
    }
    if (ROT_MODE == MODE_MACRO)
        cursorDevice.isMacroSectionVisible().set(true);
}

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidiPort1);
    noteIn = host.getMidiInPort(0).createNoteInput("Notes");

    cursorTrack = host.createArrangerCursorTrack(2, 16);
    transport = host.createTransport();
    masterTrack = host.createMasterTrack(0);
    tracks = host.createMainTrackBank(8, 2, 16);
    cursorDevice = host.createEditorCursorDevice();

    println("init");
}

function onMidiPort1(status, data1, data2) {

    if(isChannelController(status)) {
        if (data1 >= PARAM_LOW && data1 <= PARAM_HIGH) {
            var index = data1 - PARAM_LOW;
            if (data2 > 0) {
                if (ROT_MODE == MODE_PARAMS && PARAM_PAGE == index) {
                    switch(index) {
                        case 0: ROT_MODE = MODE_MACRO; host.showPopupNotification("Macros"); break;
                        case 1: ROT_MODE = MODE_COMMON; host.showPopupNotification("Common");break;
                        case 2: ROT_MODE = MODE_ENVELOPE; host.showPopupNotification("Envelope"); break;
                        case 3: break;
                        default: PARAM_PAGE = index + 4; host.showPopupNotification("Parameters Page " + (PARAM_PAGE + 1)); cursorDevice.setParameterPage(PARAM_PAGE);
                    }
                } else {
                    PARAM_PAGE = index;
                    host.showPopupNotification("Parameters Page " + (PARAM_PAGE + 1));
                    ROT_MODE = MODE_PARAMS;
                    cursorDevice.setParameterPage(PARAM_PAGE);                    
                }
                enableIndication();
            }
        } else if (data1 >= TRACK_VOL_LOW && data1 <= TRACK_VOL_HIGH) {
            var index = data1 - TRACK_VOL_LOW;
            tracks.getTrack(index).getVolume().set(data2, 128);

        } else if (data1 >= TRANSPORT_LOW && data1 <= TRANSPORT_HIGH && data2 >0 ) {
            switch(data1) {
                case REW: cursorDevice.switchToPreviousPreset(); break; //case REW: cursorTrack.selectPrevious(); break;
                case FWD: cursorDevice.switchToNextPreset(); break; //case FWD: cursorTrack.selectNext(); break;
                case STOP: transport.stop(); break;
                case PLAY: transport.play(); break;
                case REC: transport.record(); break;
                case LOOP: cursorDevice.isWindowOpen().toggle();
            }
        } else if (isRotary(data1)) {
            //var primaryDevice = cursorTrack.getPrimaryDevice();
            var value;
            var index = data1 - MACRO_LOW;
            switch(ROT_MODE) {
                case MODE_MACRO:
                    value = cursorDevice.getMacro(index).getAmount();
                    break;
                case MODE_COMMON:
                    value = cursorDevice.getCommonParameter(index);
                    break; 
                case MODE_ENVELOPE:
                    value = cursorDevice.getEnvelopeParameter(index);
                    break; 
                case MODE_PARAMS:
                    value = cursorDevice.getParameter(index);
                    break; 
            };

            value.inc(Math.log((Math.abs(64 - data2)) + 1) * (data2 - 64) / Math.abs(64 - data2), 128);
        }
    }
}

function exit() {
    println("exit");
}