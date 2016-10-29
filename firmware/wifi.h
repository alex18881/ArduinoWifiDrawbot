#ifndef WIFI_H
	#define WIFI_H

#include <Arduino.h>;
#include "Configuration.h";
#include "ConfigManager.h";
#include <SoftwareSerial.h>;

class Wifi {
	public:
		Wifi();

		void init( void (*fn)(void), ConfigManager& _cfgManager );
		void connect();
		uint32_t read(char *buff);
		void write(String msg);
	private:
		char *ok = "OK";
		bool connected = false;
		bool inited = false;
		void (*onConnected)(void);
		SoftwareSerial _serial = SoftwareSerial (WIFI_RX_PIN, WIFI_TX_PIN);
		bool sendCommand( String cmd, char *strToFind );
		ConfigManager cfgManager;
};

#endif