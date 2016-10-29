#include "ConfigManager.h";

ConfigManager::ConfigManager() {
}

void ConfigManager::read() {
	
	Serial.print( F("EEPROM size: ") );
	Serial.println(EEPROM.length());

	if( EEPROM.length() > 0 ) {

		Config cfg;
		float isStored = 0.00f;

		EEPROM.get(0, isStored);

		if(isStored == 1.0f) {
			EEPROM.get(sizeof(float), cfg);

			Serial.println( F("EEPROM values: ") );
			Serial.print( F("\tSSID: ") );
			Serial.println(cfg.ssid);
			Serial.print( F("\tPassword: ") );
			Serial.println(cfg.pwd);
			Serial.print( F("\tPort: ") );
			Serial.println(cfg.port);
			Serial.print( F("\tData speed: ") );
			Serial.println(cfg.bodRate);
			Serial.print( F("\tWheels acceleration: ") );
			Serial.println(cfg.acceleration);
			Serial.print( F("\tWheels speed: ") );
			Serial.println(cfg.speed);
			Serial.print( F("\tWheels steps per mm: ") );
			Serial.println(cfg.stepRate);
			Serial.print( F("\tWheels base width: ") );
			Serial.println(cfg.baseWidth);

			if(strlen(cfg.ssid) > 0)
				SSID = cfg.ssid;

			if(strlen(cfg.pwd) > 0)
				passwd = cfg.pwd;

			if(isnan(cfg.port) == 0 && cfg.port > 0)
				wifiPort = cfg.port;

			if(isnan(cfg.bodRate) == 0 && cfg.bodRate > 0)
				wifiBodRate = cfg.bodRate;

			if(isnan(cfg.acceleration) == 0 && cfg.acceleration > 0)
				wheelsAcceleration = cfg.acceleration;
			if(isnan(cfg.speed) == 0 && cfg.speed > 0)
				wheelsSpeed = cfg.speed;
			if(isnan(cfg.stepRate) == 0 && cfg.stepRate > 0)
				wheelsStepRate = cfg.stepRate;
			if(isnan(cfg.baseWidth) == 0 && cfg.baseWidth > 0)
				wheelsBaseWidth = cfg.baseWidth;
		} else {
			Serial.println( F("EEPROM is empty") );
		}
	}
	wheelsBaseHalfWidth = wheelsBaseWidth/2;
}


void ConfigManager::write() {
	Config cfg;

	cfg.ssid = SSID;
	cfg.pwd = passwd;
	cfg.port = wifiPort;
	cfg.bodRate = wifiBodRate;

	cfg.acceleration = wheelsAcceleration;
	cfg.speed = wheelsSpeed;
	cfg.stepRate = wheelsStepRate;
	cfg.baseWidth = wheelsBaseWidth;

	EEPROM.put(0, (float)1.00f);
	EEPROM.put(sizeof(float), cfg);
}