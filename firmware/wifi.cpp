#include "wifi.h";

Wifi::Wifi(){}

void Wifi::init( void (*fn)(void) ){
	onConnected = fn;
	if( sendCommand( "AT", ok ) ){
		Serial.println( F("Wifi: OK") );
	}else{
		Serial.println( F("Wifi: Error") );
	}

	_serial.begin( WIFI_DATASPEED );
	if(!sendCommand( "AT+CWJAP?", WIFI_SSID ) ){
		Serial.println( F("Joining to Wifi") );
		if( sendCommand( (String)"AT+CWJAP=" + (String)WIFI_SSID + "," + (String)WIFI_PASSWORD, ok ) ){
			Serial.println( F("Joining to Wifi: OK") );
		}else{
			Serial.println( F("Joining to Wifi: Error") );
		}
	}

	if( sendCommand( "AT+CWMODE=1", ok ) ){
		Serial.println( F("Wifi mode set: OK") );
	}else{
		Serial.println( F("Wifi mode set: Error") );
	}
	
	if( sendCommand( "AT+CIPMUX=1", ok ) ){
		Serial.println( F("Wifi MUX set: OK") );
	}else{
		Serial.println( F("Wifi MUX set: Error") );
	}

	if( sendCommand( "AT+CIPSERVER=1,1336", ok ) ){
		Serial.println( F("Wifi start server: OK") );
	}else{
		Serial.println( F("Wifi start server: Error") );
	}

	delay(100);
	inited = true;
}

uint32_t Wifi::read(char *buff){
	uint32_t len = 0;
	if( inited ){
		String wifidata = _serial.available() ? _serial.readString() : "";

		if( connected ){
			int index_msg = wifidata.indexOf( "+IPD," );
			if( index_msg != -1 ){
				//"+IPD,0"
				int i = 0;
				int lenIndx = wifidata.indexOf(',', index_msg+5 );
				int msgIndx = wifidata.indexOf(':', lenIndx );

				len = wifidata.substring(lenIndx+1, msgIndx++).toInt();

				while( msgIndx > 0 && i < len &&  i < DATA_BUF_SIZE ) {
					buff[i++] = wifidata[msgIndx++];
				}

				while( i < DATA_BUF_SIZE ) {
					buff[i++] = '\0';
				}

				//Serial.println( "Wifi data: " + wifidata + "--------------" + (String)index_msg + "==============" + (String)buff + "[" + (String)len + "]" + " from " + (String)msgIndx );

			}else if( wifidata.indexOf( ",CLOSED" ) != -1 ){
				Serial.print(F("Wifi client disconnected: "));
				Serial.println( wifidata );
				
				connected = false;
			}
		}else if( wifidata.indexOf( ",CONNECT" ) != -1 ){

			Serial.print(F("Wifi client connected: "));
			Serial.print(wifidata);
			
			connected = true;
			onConnected();
		}else{
			if( wifidata.length() > 0 ){
				Serial.print(F("Wifi got string: "));
				Serial.println(wifidata);
			}
		}
	}
	return len;
}

void Wifi::write(String msg){
	if( sendCommand( "AT+CIPSEND=0," + (String)msg.length() , ">" ) ){
		_serial.print(msg);

		unsigned long _millis = millis();
		while( (millis() - _millis) < WIFI_COMMAND_TIMEOUT ){
			if(_serial.available()){
				//Serial.print(F("WIFI*"));
				//Serial.println( (String)_serial.find(ok) );
				break;
			}
		}
	}
}

bool Wifi::sendCommand( String cmd, char *strToFind ){
	bool result = false;
	_serial.print(cmd + "\r\n");
	unsigned long _millis = millis();

	while( (millis() - _millis) < WIFI_COMMAND_TIMEOUT ){
		if( _serial.available() ){
			result = _serial.find( strToFind );
			//Serial.print(F("Wifi exec command "));
			//Serial.print(cmd);
			//Serial.print(F(": ")); 
			//Serial.println((String)result);
			break;
		}
	}
	return result;
}
