#AT Commands
| AT Command | Function | Response |
| --- | --- | --- |
| `AT` | Working | OK |
| `AT+RST` | Restart           | OK [System Ready, Vendor:www.ai-thinker.com]             |
| `AT+GMR` | Firmware version  | 0018000902 OK                                            |
| `AT+CWLAP` | List Access Points| +CWLAP:(4,"AP_SSID",- 38,"##:##:##:##:##:##",#)\nOK      |
| `AT+CWJAP?`  | Check if joined to access aoint | +CWJAP:"AP_SSID" OK |
| `AT+CWJAP="SSID","Password"` | Join Access Point | OK |
| `AT+CWQAP` | Quit Access Point | OK |
| `AT+CIFSR` | Get IP Address | AT+CIFSR 192.168.0.105\nOK |
| `AT+ CWSAP=<ssid>,<pwd>,<chl>, <ecn>` | Set Parameters of Access Point | OK |
| `AT+CWMODE=1` | WiFi Mode STA | OK |
| `AT+CWMODE=2` | WiFi Mode AP  | OK |
| `AT+CWMODE=3` | WiFi Mode BOTH | OK |
| `AT+CIPSTART=TCP,ip,port` | Set up single TCP connection | OK |
| `AT+CIPSTART=<cnnid>TCP,ip,port` | Set up multiple TCP connections | OK |
| `AT+CIPSTART=UDP,ip,port` | Set up single UDP connection | OK |
| `AT+CIPSTART=<cnnid>UDP,ip,port` | Set up multiple UDP connections | OK |
| `AT+ CIPMUX=0` | TCP/UDP sigle connection mode | OK |
| `AT+ CIPMUX=1` | TCP/UDP multiple connections mode | OK |
| `AT+CWLIF` | Check join devices' IP | <ips> |
| `AT+CIPSTATUS` | TCP/IP Connection Status |  |
| `AT+CIPSEND=<length>;` | Send TCP/IP data for single connection | > |
| `AT+CIPSEND=<cnnid>,<length>;` | Send TCP/IP data for multiple connections | > |
|                              | Received data (CIPMUX=0) | +IPD,<len>:<data> |
|                              | Received data (CIPMUX=1) | +IPD,<id>,<len>:<data> |
| `AT+CIPCLOSE` | Close TCP / UDP connection for multiple connections | OK |
| `AT+CIPCLOSE=<id>` | Close TCP / UDP connection for single connection | OK |
| `AT+CIPSERVER=1,<port>` | Start as server | OK |
| `AT+CIPSERVER=0` | Stop server | OK |
| `AT+CIPSTO=<time>` | Set the server timeout in seconds | OK |
| `AT+CIOBAUD=<baud>` | Set Baud Rate | OK |
| `AT+CIFSR` | Check IP address | AT+CIFSR 192.168.0.106\nOK |
| `AT+CIUPDATE` | Firmware Upgrade (from Cloud) |1. +CIPUPDATE:1 found server\n2. +CIPUPDATE:2 connect server\n3. +CIPUPDATE:3 got edition\n4. +CIPUPDATE:4 start update |

More can be foud by googling :)

This info got from here: http://www.pridopia.co.uk/pi-doc/ESP8266ATCommandsSet.pdf
