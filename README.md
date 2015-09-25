# bitwig-axiom61
Axiom 61 2nd gen controller script for Bitwig

Should work with Axiom 25, 49, 61 both 1st and 2nd gen, though tested only on Axiom 61 2nd gen.

Assignments are hard coded as follows:
- 8 sliders to volume control of first 8 tracks
- Last slider to master volume control
- 8 buttons below sliders to toggling arm of first 8 tracks
- Button below master volume is free for user defined function (e.g. launching)
- Rotary encoders are mapped to 8 macro knobs (changing incrementally)
- Pressure pads are not mapped (I assign them to 8 notes to match drum container pads)
- Play, Rec, Stop mapped to transport
- Rew, Fwd mapped to selecting previous/next track
- Loop toggling display for current VST GUI

Manual configuration required:
- 8 knobs: CC 146, data2: 20-27
- 8 sliders: CC 80-87, data2: 0, data3: 127
- last slider: CC 7, data2: 0, data3: 127
- 9 buttons: CC 146, data1: 102-110, data2: 0, data3: 127
- 8 pads: CC 147, data1: 36-43, data2: 0, data3: 127

If somebody could help with SysEx message to initialize instead of manual configuration, it could be nice. Also, information on how to change LED, display or use INST button is welcome.
