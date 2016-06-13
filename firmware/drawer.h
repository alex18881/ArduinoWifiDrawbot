//drawer module
#include <Arduino.h>; //needed for Serial.println
#include <Servo.h>;
#include <AccelStepper.h>;
#include <math.h>;
#include "Configuration.h";

#define WEEL_BASE_HALF_SIZE  WEEL_BASE_SIZE/2
// The circle length formula is 2 * Pi * r where 2 * r is the weels base
//#define WEEL_FULL_CIRCLE_STEPS  M_PI * WEEL_BASE_SIZE * WHEEL_STEPS_RATE
#define M_2PI  M_PI * 2
#define M_HALF_PI  M_PI / 2
//Full turn is when the bot rotates by 360 deg on its place
#define TURN_STEPS_RATIO WEEL_BASE_HALF_SIZE * WHEEL_STEPS_RATE

class Drawer {
	public:
		Drawer();

		float x=0.0;
		float y=0.0;
    	double rotation = 0.0;
		bool comandComplete = true;
		
		void init();
		void togglePen( bool on );
    	void run();

    	void rotateTo( float _x, float _y );
    	void rotateByRads( double dAngle );
    	void moveTo(float _x, float _y, float _feedRate);
    	void curveTo( float _x, float _y, float _dx, float _dy, float _feedRate, bool clockwise );

	private:
		Servo pen;
		AccelStepper leftWheel;
		AccelStepper rightWheel;

		AccelStepper initWheel( int pin1, int pin2, int pin3, int pin4 );

		float calcDistance( float x0, float y0, float x1, float y1 );
		double calcAngleToPoint(float _x, float _y);
};
