#ifndef CFGMNGR_H
	#define CFGMNGR_H

#include <Arduino.h>; //needed for Serial.println
#include <EEPROM.h>;
#include <string.h>;
#include "Configuration.h";

class ConfigManager {
	public:
		ConfigManager();

		void read();
		void write();

		char *SSID = WIFI_SSID;
		char *passwd = WIFI_PASSWORD;
		int wifiPort = WIFI_SERVER_PORT;
		int wifiBodRate = WIFI_DATASPEED;

		float wheelsAcceleration = WHEELS_ACCELERATION;
		float wheelsSpeed = WHEELS_SPEED;
		float wheelsStepRate = WHEEL_STEPS_RATE;
		float wheelsBaseWidth = WEEL_BASE_SIZE;

		float wheelsBaseHalfWidth;

	private:
		typedef struct _cfg {
			char *ssid;
			char *pwd;
			int port;
			int bodRate;

			float acceleration;
			float speed;
			float stepRate;
			float baseWidth;
		} Config;
};

#endif