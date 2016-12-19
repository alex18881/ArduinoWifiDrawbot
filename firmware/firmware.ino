#include "Configuration.h";
#include "ConfigManager.h";
#include "drawer.h";

#define FW_VERSION "PROTOCOL_VERSION:" VERSION " FIRMWARE_NAME:" FW_CODE_NAME " MACHINE_TYPE:" MACHINE_NAME

#if defined(WIFI)
#include "wifi.h";
#endif

char buffer[DATA_BUF_SIZE];
bool commandReady = false;
int currBufLen = 0; // how much is in the buffer
int yeldIndx = 0;

char commandG = 'G';
char commandM = 'M';

char paramX = 'X';
char paramY = 'Y';
char paramJ = 'J';
char paramI = 'I';
char paramF = 'F';
char paramS = 'S';
char paramP = 'P';

ConfigManager cfgManager;
Drawer drawer;

#if defined(WIFI)
Wifi wifi;
#endif

void setup() {
	Serial.begin(DATASPEED);
	while (!Serial) {
    	; // wait for serial port to connect. Needed for native USB port only
	}
	cfgManager.read();

	#if defined(WIFI)
	wifi.init(notifyReady, cfgManager);
	#endif
	drawer.init(logMessage, cfgManager);

	drawer.togglePen(false);
  #if !defined(WIFI)
	notifyReady();
  #endif
}

void loop() {
	readSerial();
  
	if( drawer.comandComplete ){
		if( commandReady ){
    		processCommand();
    		notifyReady();
		}
	}
}

#if defined(WIFI)
void readSerial(){
	buffer[0] = (char)0;
	uint32_t len = wifi.read(buffer);
	if( len > 0 ){
    	Serial.print( F("From WIFI[") );
    	Serial.print( len );
    	Serial.print( F( "]: " ) );
    	Serial.print( (String)buffer );
    	Serial.println( (int)buffer[len-1] );

		commandReady = (buffer[0] == commandG || buffer[0] == commandM);// && buffer[len-1] == '\n';
		if(!commandReady)
			notifyReady();
  	}

}
#else
void readSerial(){
	//  Serial.print( "Reading SERIAL" );
	commandReady = false;
	while( !commandReady && Serial.available() ) {
		char c = Serial.read();
		if(currBufLen < DATA_BUF_SIZE){
			Serial.print( c );
			buffer[currBufLen++]=c;
		}

		if(c==';')
			commandReady = true;
		if(c=='\n')
			commandReady = true;
	}
}
#endif

void notifyReady(){
	currBufLen = 0;
 	logMessage("\n\n>");
}

void logMessage(String msg) {
	Serial.println( msg );
 #if defined(WIFI)
	wifi.write( msg + '\n' );
 #else
	Serial.print( msg );
 #endif
}

void processCommand() {
	// look for commands that start with 'G'
	yeldIndx = 0;
	int cmd;
	
	float _x;
	float _y;
	float _f;
	float _dx;
	float _dy;

	if( hasValue(commandG) ){
		cmd = parsenumber(commandG);
		
		Serial.print(F("processCommand: command "));
		Serial.println( (String)buffer );

		switch(cmd) {
			//G0 Rapid linear Move
			case 0:
				if( hasValue(paramX) && hasValue(paramY) ){
					_x = parsenumber(paramX);
					_y = parsenumber(paramY);
					_f = parsenumber(paramF);
					drawer.moveTo( _x, _y, _f );
				}
				break;
			//G1 Linear Move: G1 X### Y### F###
			case 1:
				if( hasValue(paramX) && hasValue(paramY) ){
					_x = parsenumber(paramX);
					_y = parsenumber(paramY);
					_f = parsenumber(paramF);
					drawer.moveTo( _x, _y, _f );
				}
				break;
			//G2: Controlled Arc Move Clockwise 
			case 2:
				if( hasValue(paramX) && hasValue(paramY) && hasValue(paramI) && hasValue(paramJ) ){
					_x = parsenumber(paramX);
					_y = parsenumber(paramY);
					_dx = parsenumber(paramI);
					_dy = parsenumber(paramJ);
					_f = parsenumber(paramF);
					drawer.curveTo( _x, _y, _dx, _dy, _f, true );
				}
				break;
			//G3: Controlled Arc Move Counter-Clockwise
			case 3:
				if( hasValue(paramX) && hasValue(paramY) && hasValue(paramI) && hasValue(paramJ) ){
					_x = parsenumber(paramX);
					_y = parsenumber(paramY);
					_f = parsenumber(paramF);
					_dx = parsenumber(paramI);
					_dy = parsenumber(paramJ);
					drawer.curveTo( _x, _y, _dx, _dy, _f, false );
				}
				break;
			//G4: Dwell
			case 4:
				_x = parsenumber(paramP); //in millis
				if( _x == 0 )
					_x = parsenumber(paramS) * 1000; //in seconds
				if( _x > 0 )
					delay(_x);
				break;
			//G10 Retract = remove pen
			case 10:
				drawer.togglePen(false);
				break;
			//G11 Retract = activate pen
			case 11:
				drawer.togglePen(true);
				break;
			//G28: Move to Origin (Home)
			case 28:
				drawer.moveTo( 0, 0, 0 );
				break;
			//G90: Set to Absolute Positioning
			case 90:
				drawer.isRelative = false;
				break;
			//G91: Set to Relative Positioning
			case 91:
				drawer.isRelative = true;
				break;
			//G92: Set Position
			case 92:
				_x = parsenumber(paramX);
				_y = parsenumber(paramY);
				drawer.setPosition(_x, _y);
				break;
			default: break;
		}
		Serial.println("ok");
	}
	// look for commands that start with 'M'
	yeldIndx = 0;
	if( hasValue(commandM) ){
		cmd = parsenumber(commandM);
		switch(cmd) {
			//M2: Program End
			case 2:
				drawer.rotateTo(0.0, 1.0);
				drawer.reset();
				break;
			//M3: Spindle On, Clockwise = activate pen
			case 3: drawer.togglePen(true); break;
			//M5: Spindle Off = remove pen
			case 5: drawer.togglePen(false); break;
			//M6: Tool change
			//M18: Disable all stepper motors
			//M112: Emergency Stop
			//M114: Get Current Position
			//M115: Get Firmware Version and Capabilities
			case 115:
				logMessage( String(FW_VERSION) );
				break;
			//M201: Set max printing acceleration
			//M500: Store parameters in EEPROM
			case 500: 
				cfgManager.write();
				break;
			//M501: Read parameters from EEPROM
			case 501: 
				cfgManager.read();
				wifi.connect();
				drawer.reset();
				break;
			//M503: Print settings

			default: break;
		}
		Serial.println("ok");
	}
	commandReady = false;
	yeldIndx = 0;
	// if the string has no G or M commands it will get here and the Arduino will silently ignore it
}

bool hasValue( char search ){
	int i = 0;
	bool result = false;
	while( !result && i < DATA_BUF_SIZE ){
		result = buffer[i++] == search;
	}
	return result;
}

bool isNumPart(char letter) {
	return (isDigit(letter) || letter=='-' || letter == '+' || letter == '.');
}

float parsenumber( char codeType ){
	String val = "";
	bool yeld = true;

	while( buffer[yeldIndx++] != codeType ){
		if(yeldIndx >= DATA_BUF_SIZE ){
			if( !yeld ){
				//Serial.println("Crap command " + (String)codeType + ".");
				yeldIndx = 0;
				return 0.0;
			}else{
				yeld = false;
			}
		}
	}
	//Skipping spaces after command char
	while( !isNumPart(buffer[yeldIndx]) && yeldIndx < DATA_BUF_SIZE ){
		yeldIndx++;
	}

	while( isNumPart(buffer[yeldIndx]) && yeldIndx < DATA_BUF_SIZE ){
		val += (String)buffer[yeldIndx++];
	}

	Serial.print(F("Getting param "));
	Serial.print(codeType);
	Serial.print(F(" = "));
	Serial.println(val);

	if( val == "")
		return 0.0;

	return val.toFloat();
}
