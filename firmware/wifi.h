#include <Arduino.h>;
#include "Configuration.h";
#include <SoftwareSerial.h>;

class Wifi {
	public:
		Wifi();

		void init( void (*fn)(void) );
		uint32_t read(char *buff);
		void write(String msg);
	private:
		bool connected = false;
		bool inited = false;
		void (*onConnected)(void);
		SoftwareSerial _serial = SoftwareSerial (WIFI_RX_PIN, WIFI_TX_PIN);
		bool sendCommand( String cmd, char *strToFind );
};