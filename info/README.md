#Info
Here is located some additional and usefull info: Schemes, AT commands, PCB etc.

##Wiring scheme
The wiring scheme contains a voltage regulator. Be carefull the one is used in this scheme is just ASM1117 3.3 with no letters at the end, but there's also ASM1117-REF which requires an ajustable resistor between its ground connector and the ground itself.

The scheme is took from [here](http://arduino.ru/forum/apparatnye-voprosy/podklyuchenie-regulyatora-napryazheniya-ams1117-33v). There's also a separate PCB for it in the same post on that page.

I used the [Fritzing](http://fritzing.org/home/) for the scheme and PCB desings. Here are links on parts for it:

* [AMS1117 regulator](https://github.com/tardate/LittleArduinoProjects/tree/master/FritzingParts/AMS1117)
* [ULN2803 stepper driver](https://github.com/adafruit/Fritzing-Library/blob/master/parts/ULN2803%20Darlington%20Array.fzpz)
* [28byj-48 stepper](https://github.com/tardate/X113647Stepper/blob/master/fritzing_parts/28BYJ-48%20Stepper%20Motor.fzpz)

##AT Commands
[Here](./at-commands.md)