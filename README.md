# ArduinoWifiDrawbot
Arduino drawing bot with communication over Wifi.

__First of all the main idea of this bot is not mine. There are tonns of projects in the Internet that inspired and leaded me. Some of them were partially used as base of the project.__

##Overview
The project consists of 3 parts:
1. Printable parts. Parts that can be printed with 3d printer.
2. Arduino firmware.
3. A PC communication software.

Grate instructions how to assemble and how to wire the bot can be found here:  http://www.instructables.com/id/Low-Cost-Arduino-Compatible-Drawing-Robot/

##Printable parts
All the chasis can be printed on home 3d printer. 
Here's the list of these parts:
1. The chassis: http://www.thingiverse.com/thing:1289315
2. Stepper Brackets: http://www.thingiverse.com/thing:1053267
3. Pen Collar, servo holder and pen holder: http://www.thingiverse.com/thing:1052725
4. Wheels: http://www.thingiverse.com/thing:862438
5. Arduino UNO adapter for the chassis: http://www.thingiverse.com/thing:1397069

Also here you can find a really usefull instrucions how to callibrate your 3d printer: http://www.thingiverse.com/thing:342198

##Electronics and motors:
1. Arduino UNO (I use one from DX: [Link on DX](http://www.dx.com/p/uno-r3-development-board-microcontroller-mega328p-atmega16u2-compat-for-arduino-blue-black-215600#.VuK4-px96Uk and I find it great) )
2. Proto shield (like this one [Link on Ali](http://ru.aliexpress.com/item/ProtoShield-prototype-expansion-board-with-mini-bread-board-based-for-ARDUINO/1451569883.html) )
3. 1 TowerPro SG90 servo
4. 2 28BYj-48 steppers
5. Ball caster with 15mm ball (like this one: [Link on Ali](http://ru.aliexpress.com/item/1pc-Swivel-Round-Ball-Caster-Silver-Metal-Bull-Wheel-Universal-Transfer-Ball-48-x-32-x/32566687062.html) )
6. 1 ULN2803APG stepper driver ( like this one: [Link on Ali](http://ru.aliexpress.com/item/10pcs-ULN2803A-ULN2803APG-ULN2803-DIP-18/32375468380.html) )
7. 1 ESP8266 Esp-01 Wifi module
8. Several resistors

##Wiring
Most of the wiring is described in instructions the link on which is in the overview section but there is a mine one placed in the info directory of this project. It includes wifi modele.
Also I have to nothe that the scheme I use to wire the Wifi module is not a good one as wired this way Wifi can get damaged since it requires 3v logic and an Arduino provides a 5v one. But it hasn't fried yet :)

##Firmware
First: I'm not a professional C++ or Arduino programmer and actually this is my first Arduino project and my C++ experience is limited to about 2 weeks of making small tools 15 years ago for my very first computer. So any help is welcome.
###Wifi
I decided to not to update or reflash the ESP-01 AT firmware even though there are alot of posts on forums about how bad its stock firmwares. The only thing I did is changing its baudrate to 9600 as it had 115200 and as I read on some forums SoftwareSerial is not really good with big speeds. The command I used for this is: 
`AT+CIOBAUD=9600`
All other commands you can find in AT Commands document in info folder.

##Thanks to
* Guys from Thingiverse community for their designs. [MakersBox](http://www.thingiverse.com/MakersBox/about) and [FavioR](http://www.thingiverse.com/FavioR/about)
