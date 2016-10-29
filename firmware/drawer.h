//drawer module
#ifndef DRAWER_H
	#define DRAWER_H

#include <Arduino.h>; //needed for Serial.println
#include <Servo.h>;
#include <AccelStepper.h>;
#include <math.h>;
#include "Configuration.h";
#include "ConfigManager.h";

#define M_2PI  M_PI * 2
#define M_HALF_PI  M_PI / 2

class Drawer {
	public:
		Drawer();

		float x = 0.0;
		float y = 0.0;
		bool isRelative = false;
    	double rotation = 0.0;
		bool comandComplete = true;
		
		void init( void (*_logger)(String msg), ConfigManager& _cfgManager );
		void togglePen( bool on );
    	void run();

    	void rotateTo( float _x, float _y );
    	void rotateByRads( double dAngle );
    	void moveTo(float _x, float _y, float _feedRate);
    	void curveTo( float _x, float _y, float _cdx, float _cdy, float _feedRate, bool clockwise );
    	void setPosition(float _x, float _y);
    	void reset();

	private:
		double wheelsSpeed;
		
		Servo pen;
		AccelStepper leftWheel;
		AccelStepper rightWheel;
		ConfigManager cfgManager;

		void (*logger)(String msg);

		AccelStepper initWheel( int pin1, int pin2, int pin3, int pin4 );
    	void resetWheel( AccelStepper& _wheel );
		float calcDistance( float x0, float y0, float x1, float y1 );
		double calcAngleToPoint(float _x, float _y);
};

#endif