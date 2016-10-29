#include "drawer.h";

Drawer::Drawer(){
}

AccelStepper Drawer::initWheel( int pin1, int pin2, int pin3, int pin4 ){
	AccelStepper _wheel = AccelStepper( AccelStepper::HALF4WIRE, pin1, pin3, pin2, pin4 );
	return _wheel;
}

void Drawer::resetWheel( AccelStepper& _wheel ) {
	_wheel.setSpeed( cfgManager.wheelsSpeed );
	//_wheel.setMaxSpeed( WHEELS_MAX_SPEED );
	_wheel.setMaxSpeed( cfgManager.wheelsSpeed );
    _wheel.setAcceleration( cfgManager.wheelsAcceleration );
}

void Drawer::init(void (*_logger)(String msg), ConfigManager& _cfgManager){
	logger = _logger;
	cfgManager = _cfgManager;
	leftWheel = initWheel( LEFT_WHEEL_PIN1, LEFT_WHEEL_PIN2, LEFT_WHEEL_PIN3, LEFT_WHEEL_PIN4 );
	rightWheel = initWheel( RIGHT_WHEEL_PIN1, RIGHT_WHEEL_PIN2, RIGHT_WHEEL_PIN3, RIGHT_WHEEL_PIN4 );
	reset();
}

void Drawer::reset() {
	x = 0.0;
	y = 0.0;
	rotation = 0.0;
	comandComplete = true;
	wheelsSpeed = cfgManager.wheelsSpeed;

	resetWheel(leftWheel);
	resetWheel(rightWheel);

	if(pen.attached())
		pen.detach();
}

void Drawer::togglePen( bool on ){
	Serial.println(on? F("Turning pen on"): F("Turning pen off"));
	
	pen.attach(PEN_SERVO_PIN);

	while(!pen.attached()){
		;
	}

	if(on){
		pen.write( DRAW_ON_SERVOANGLE );
	}else{
		pen.write( DRAW_OFF_SERVOANGLE );
	}
	delay(500);
	
	pen.detach();
}

void Drawer::run(){
	bool isMoving = false;
	if (leftWheel.distanceToGo() != 0){
		leftWheel.run();
		isMoving = true;
	} else {
    	leftWheel.disableOutputs();
	}
    
	if (rightWheel.distanceToGo() != 0){
		rightWheel.run();
		isMoving = true;
	} else {
    	rightWheel.disableOutputs();
	}
	comandComplete = !isMoving;
}

double Drawer::calcAngleToPoint(float _dx, float _dy){
	double angle = atan2( (double)abs(_dx), (double)abs(_dy) );

	if( _dy < 0 )
		angle = M_PI - angle;
	if(_dx < 0 )
		angle = -angle;

	Serial.print(F("Drawer::calcAngleToPoint: Angle is ")); 
	Serial.print(angle, 4);
	Serial.print(F(" current rotation is "));
	Serial.println(rotation, 4);

	//Find the difference between the current rotation angle and the a0
	double dAngle = angle - rotation;

	if(dAngle > M_PI)
		dAngle -= M_2PI;
	if(dAngle < -M_PI)
		dAngle += M_2PI;
	return dAngle;
}

void Drawer::rotateTo( float _dx, float _dy ){
	//Find the angle a0 value in radians relative to Y axis
	
	Serial.print(F("Drawer::rotateTo: Rotating to dx="));
	Serial.print(_dx, 4);
	Serial.print(F(" and dy="));
	Serial.println(_dy, 4);

	double dAngle = calcAngleToPoint(_dx, _dy);

	rotateByRads( dAngle );
}

void Drawer::rotateByRads( double dAngle ){
	if( dAngle != 0 ){
		comandComplete = false;

		//float c0 = WEEL_FULL_CIRCLE_STEPS;
	    //float c = TURN_STEPS_RATIO;
		double curve = dAngle * cfgManager.wheelsBaseHalfWidth * cfgManager.wheelsStepRate;
 
		Serial.print(F("Drawer::rotateByRads: Rotating by "));
		Serial.print(curve);
		Serial.print(F(" steps, ") );
		Serial.print(( dAngle * 180 / M_PI), 4);
		Serial.print(F("deg (") );
		Serial.print(dAngle, 4);
		Serial.println(F("rad) "));

		rightWheel.move(-curve);
		leftWheel.move(curve);

		rightWheel.setMaxSpeed( wheelsSpeed );
		leftWheel.setMaxSpeed( wheelsSpeed );
		rightWheel.setAcceleration( cfgManager.wheelsAcceleration );
		leftWheel.setAcceleration( cfgManager.wheelsAcceleration );

		while(!comandComplete)
			run();

		rotation += dAngle;
	}
}

float Drawer::calcDistance( float x0, float y0, float x1, float y1 ){
	float dx = x1 - x0;
  	float dy = y1 - y0;

  	return (float) sqrt( (double) ( (dx*dx) + (dy*dy) ) );
}

void Drawer::setPosition(float _x, float _y) {
	if (isRelative) {
		x += _x;
		y += _y;
	} else {
		x = _x;
		y = _y;
	}
}

void Drawer::moveTo(float _x, float _y, float _feedRate){
	//wheelsSpeed = _feedRate > 0 ? _feedRate : wheelsSpeed;
	if (isRelative) {
		_x += x;
		_y += y;
	}

	Serial.print(F("Drawer::moveTo: Moving to [ X"));
	Serial.print(_x, 4);
	Serial.print(F(", Y"));
	Serial.print(_y, 4);
	Serial.print(F(", F"));
	Serial.print(_feedRate, 4);
	Serial.println(F(" ]"));

	comandComplete = false;
	rotateTo( _x - x, _y - y );
  	
  	comandComplete = false;
	
	float l = cfgManager.wheelsStepRate * calcDistance( x, y, _x, _y );
  	
  	Serial.print(F("Moving by "));
  	Serial.print(l, 4);
  	Serial.println(F(" steps"));
	
	rightWheel.move(l);
	leftWheel.move(l);

	rightWheel.setMaxSpeed( wheelsSpeed );
	leftWheel.setMaxSpeed( wheelsSpeed );
	rightWheel.setAcceleration( cfgManager.wheelsAcceleration );
	leftWheel.setAcceleration( cfgManager.wheelsAcceleration );
	
	while(!comandComplete)
		run();

	x = _x;
	y = _y;
}

void Drawer::curveTo( float _x, float _y, float _cdx, float _cdy, float _feedRate, bool clockwise ){
	//wheelsSpeed = _feedRate > 0 ? _feedRate : wheelsSpeed;
	if (isRelative) {
		_x += x;
		_y += y;
	}
	comandComplete = false;

	Serial.print(F("Drawer::curveTo: Curve"));
	Serial.print(clockwise ? F(""):F(" counter"));
	Serial.print(F(" clockwise to [ X"));
	Serial.print(_x, 4);
	Serial.print(F(", Y"));
	Serial.print(_y, 4);
	Serial.print(F(", F"));
	Serial.print(_feedRate, 4);
	Serial.print(F(" ] with center at [ X"));
	Serial.print(_cdx, 4);
	Serial.print(F(", Y"));
	Serial.print(_cdy, 4);
	Serial.println(F(" ] from cur point"));
	
	// Calculating the radius lengths for pen and both wheels
	float r = calcDistance( 0, 0, _cdx, _cdy );
	float rout = r + cfgManager.wheelsBaseHalfWidth;
	float rin  = r - cfgManager.wheelsBaseHalfWidth;

	//Find arc length
	double chord = calcDistance( x, y, _x, _y );
	double sinA = chord/(r*2.0);
	double angle = asin( sinA )*2.0;

	double outWheelSteps = cfgManager.wheelsStepRate * angle * rout;
	double inWheelSteps = cfgManager.wheelsStepRate * angle * rin;
	
	double innerWheelSpeed = abs(inWheelSteps * wheelsSpeed / outWheelSteps );
	double innerWheelAcceleration = abs(innerWheelSpeed * cfgManager.wheelsAcceleration / wheelsSpeed );
	
	//Find angle between current direction and direction towards the arc center
	double dAngle = calcAngleToPoint(_cdx, _cdy);

	//Rotate towards the tangent to the arc at start position point
	double tanAngle;
	if( clockwise ){
		tanAngle = dAngle - M_HALF_PI;
	} else {
		tanAngle = dAngle + M_HALF_PI;
	}

	rotateByRads( tanAngle );

	comandComplete = false;

	// The difference angle between current rotation and final rotation is
	// doubled angle between tangent and line connecting current position
	// and destination
	double newAngle = calcAngleToPoint( _x - x, _y - y );

	if( clockwise ){
		rightWheel.move(inWheelSteps);
		leftWheel.move(outWheelSteps);

		leftWheel.setMaxSpeed( wheelsSpeed );
		rightWheel.setMaxSpeed( innerWheelSpeed );

		rightWheel.setAcceleration( innerWheelAcceleration );
		leftWheel.setAcceleration( cfgManager.wheelsAcceleration );

		rotation += (newAngle * 2);
	}else{

		rightWheel.move(outWheelSteps);
		leftWheel.move(inWheelSteps);

		rightWheel.setMaxSpeed( wheelsSpeed );
		leftWheel.setMaxSpeed(innerWheelSpeed);

		rightWheel.setAcceleration( cfgManager.wheelsAcceleration );
		leftWheel.setAcceleration( innerWheelAcceleration );

		rotation -= (newAngle * 2);
	}

	while(!comandComplete)
		run();

	Serial.print(F("Drawer::curveTo: Done. Inner wheel "));
	Serial.print(inWheelSteps, 4);
	Serial.print(F(" steps. Outer wheel "));
	Serial.print(outWheelSteps, 4);
	Serial.println(F(" steps"));

	x = _x;
	y = _y;
}