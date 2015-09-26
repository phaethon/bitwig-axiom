loadAPI(1);

host.defineController("M-Audio", "Axiom 61 (2nd)", "1.0", "1965a650-634a-11e5-a837-0800200c9a66");

host.defineMidiPorts(3, 2);

var MACRO_LOW = 20;
var MACRO_HIGH = 27;
var TRANSPORT_LOW = 113;
var TRANSPORT_HIGH = 118;
var PARAM_LOW = 70;
var PARAM_HIGH = 78;
var LOOP = 113;
var REW = 114;
var FWD = 115;
var STOP = 116;
var PLAY = 117;
var REC = 118;
var MAIN_VOLUME = 7;
var TRACK_VOL_LOW = 80;
var TRACK_VOL_HIGH = 87;
var TRACK_BUT_LOW = 102;
var TRACK_BUT_HIGH = 109;
var USER_BUTTON = 110;

var rotaryMacro = true;

function isRotary(cc) {
    return cc >= MACRO_LOW && cc <= MACRO_HIGH;
}

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidiPort1);
    noteIn = host.getMidiInPort(0).createNoteInput("Notes");

    userControls = host.createUserControlsSection(1);
    userControls.getControl(0).setLabel("User button");

    cursorTrack = host.createArrangerCursorTrack(2, 16);
    transport = host.createTransport();
    masterTrack = host.createMasterTrack(0);
    tracks = host.createMainTrackBank(8, 2, 16);
    cursorDevice = host.createEditorCursorDevice();
    for (var i = 0; i < 8; i++ )
        cursorDevice.getParameter(i).setIndication(true);

    println("init");
}

function onMidiPort1(status, data1, data2) {

    if(isChannelController(status)) {
        if (data1 == MAIN_VOLUME) {
            masterTrack.getVolume().set(data2, 128);

        } else if (data1 >= TRACK_VOL_LOW && data1 <= TRACK_VOL_HIGH) {
            var index = data1 - TRACK_VOL_LOW;
            //if (rotaryMacro) {
                tracks.getTrack(index).getVolume().set(data2, 128);
            //} else {
            //    primaryDevice.getCommonParameter(index).set(data2, 128);
            //}

        } else if (data1 >= TRACK_BUT_LOW && data1 <= TRACK_BUT_HIGH) {
            var index = data1 - TRACK_BUT_LOW;
            if (data2 > 0)
                //tracks.getTrack(index).
                tracks.getTrack(index).getArm().toggle();

        } else if (data1 >= PARAM_LOW && data1 <= PARAM_HIGH) {
                //var primaryDevice = cursorTrack.getPrimaryDevice();

            if (data1 < PARAM_HIGH) {
                //cursorDevice.isParameterPageSectionVisible().set(true);
                cursorDevice.isMacroSectionVisible().set(false);
                cursorDevice.setParameterPage(data1 - PARAM_LOW);
                rotaryMacro = false;
            } else {
                //cursorDevice.isParameterPageSectionVisible().set(false);
                cursorDevice.isMacroSectionVisible().set(true);
                rotaryMacro = true;
            }
        } else if (data1 >= TRANSPORT_LOW && data1 <= TRANSPORT_HIGH && data2 >0 ) {
            switch(data1) {
                case REW: cursorTrack.getPrimaryDevice().switchToPreviousPreset(); break; //case REW: cursorTrack.selectPrevious(); break;
                case FWD: cursorTrack.getPrimaryDevice().switchToNextPreset(); break; //case FWD: cursorTrack.selectNext(); break;
                case STOP: transport.stop(); break;
                case PLAY: transport.play(); break;
                case REC: transport.record(); break;
                case LOOP: cursorTrack.getPrimaryDevice().isWindowOpen().toggle();
            }
        } else if (isRotary(data1)) {
            //var primaryDevice = cursorTrack.getPrimaryDevice();
            if (rotaryMacro) {
                var value = cursorDevice.getMacro(data1 - MACRO_LOW).getAmount();
            } else {
                var value = cursorDevice.getParameter(data1 - MACRO_LOW);
            }
            value.inc(Math.log((Math.abs(64 - data2)) + 1) * (data2 - 64) / Math.abs(64 - data2), 128);
        } else if (data1 == USER_BUTTON) {
            userControls.getControl(0).set(data2, 128);
        }
    }
}

function exit() {
    println("exit");
}