#include "Configuration.h";
#include "drawer.h";

#if defined(WIFI)
#include "wifi.h";
#endif

char buffer[DATA_BUF_SIZE];
bool commandReady = false;
int currBufLen = 0; // how much is in the buffer
int yeldIndx = 0;

Drawer drawer;
#if defined(WIFI)
Wifi wifi;
#endif

void setup() {
	Serial.begin(DATASPEED);
	while (!Serial) {
    	; // wait for serial port to connect. Needed for native USB port only
	}

	#if defined(WIFI)
	wifi.init(notifyReady);
	#endif
	drawer.init();

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
    Serial.println( "From WIFI[" + (String)len + "]: " + (String)buffer );
    commandReady = (buffer[0] == 'G' || buffer[0] == 'M') && buffer[len-1] == '\n';
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
  }
}
#endif

void notifyReady(){
	currBufLen = 0;
 #if defined(WIFI)
  wifi.write( F(">") );
 #else
	Serial.print( F(">") );
 #endif
}

void processCommand() {
	// look for commands that start with 'G'
	yeldIndx = 0;
	int cmd = parsenumber('G');
	
	float _x;
	float _y;
	float _f;
	float _dx;
	float _dy;

	if( cmd != NULL ){
		switch(cmd) {
			//G0 Rapid linear Move
			case 0:
				_x = parsenumber('X');
				_y = parsenumber('Y');
				_f = parsenumber('F');
				drawer.moveTo( _x, _y, _f );
				break;
			//G1 Linear Move: G1 X### Y### F###
			case 1:
				_x = parsenumber('X');
				_y = parsenumber('Y');
				_f = parsenumber('F');
				drawer.moveTo( _x, _y, _f );
				break;
			//G2: Controlled Arc Move Clockwise 
			case 2:
				_dx = parsenumber('I');
				_dy = parsenumber('J');
				drawer.curveTo( _x, _y, _dx, _dy, _f, true );
				break;
			//G3: Controlled Arc Move Counter-Clockwise
			case 3:
				_dx = parsenumber('I');
				_dy = parsenumber('J');
				drawer.curveTo( _x, _y, _dx, _dy, _f, false );
				break;
			//G4: Dwell
			case 4:
				_x = parsenumber('P'); //in millis
				if( _x == 0 )
					_x = parsenumber('S') * 1000; //in seconds
				if( _x > 0 )
					delay(_x);
				break;
			//G10 Retract = remove pen
			case 10: drawer.togglePen(false); break;
			//G11 Retract = activate pen
			case 11: drawer.togglePen(true); break;
			//G28: Move to Origin (Home)
			case 28:
				_x = parsenumber('X');
				_y = parsenumber('Y');
				drawer.moveTo( _x, _y, _f );
				break;
			//G90: Set to Absolute Positioning
			//G91: Set to Relative Positioning
			//G92: Set Position
			default: break;
		}
	}
	// look for commands that start with 'M'
	yeldIndx = 0;
	cmd = parsenumber('M');
	if( cmd != NULL ){
		switch(cmd) {
			//M2: Program End
			//M3: Spindle On, Clockwise = activate pen
			case 3: drawer.togglePen(true); break;
			//M5: Spindle Off = remove pen
			case 5: drawer.togglePen(false); break;
			//M6: Tool change
			//M18: Disable all stepper motors
			//M112: Emergency Stop
			//M114: Get Current Position
			//M115: Get Firmware Version and Capabilities
			//M201: Set max printing acceleration
			default: break;
		}
	}
	commandReady = false;
	yeldIndx = 0;
	// if the string has no G or M commands it will get here and the Arduino will silently ignore it
}

float parsenumber( char codeType ){
	String val = "";
	bool yeld = true;

	while( buffer[yeldIndx++] != codeType ){
		if(yeldIndx >= DATA_BUF_SIZE ){
			if( !yeld ){
				Serial.println("Crap command " + (String)codeType + ".");
				yeldIndx = 0;
				return NULL;
			}else{
				yeld = false;
			}
		}
	}
	while( buffer[yeldIndx] != ';' && buffer[yeldIndx] != ' ' && yeldIndx < DATA_BUF_SIZE ){
		val += (String)buffer[yeldIndx++];
	}

	if( val == "")
		return NULL;

	return val.toFloat();
}
