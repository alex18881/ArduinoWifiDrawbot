//
#include "drawer.h";

Drawer::Drawer(){
}

AccelStepper Drawer::initWheel( int pin1, int pin2, int pin3, int pin4 ){
	AccelStepper _wheel( AccelStepper::HALF4WIRE, pin1, pin3, pin2, pin4 );
	_wheel.setMaxSpeed( WHEELS_MAX_SPEED );
    _wheel.setAcceleration( WHEELS_ACCELERATION );

	return _wheel;
}

void Drawer::init(){
	leftWheel = initWheel( LEFT_WHEEL_PIN1, LEFT_WHEEL_PIN2, LEFT_WHEEL_PIN3, LEFT_WHEEL_PIN4 );
	rightWheel = initWheel( RIGHT_WHEEL_PIN1, RIGHT_WHEEL_PIN2, RIGHT_WHEEL_PIN3, RIGHT_WHEEL_PIN4 );
	pen.detach();
}

void Drawer::togglePen( bool on ){
	Serial.println(on? "Turning pen on": "Turning pen off");
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

double Drawer::calcAngleToPoint(float _x, float _y){
	double angle = atan2( (double)abs(_x), (double)abs(_y) );

	if( _y < 0 )
		angle = M_PI - angle;
	if(_x < 0 )
		angle = -angle;

		Serial.println( "Angle is " + (String)angle  );

	//Find the difference between the current rotation angle and the a0
	double dAngle = angle - rotation;

	if(dAngle > M_PI)
		dAngle -= M_2PI;
	if(dAngle < -M_PI)
		dAngle += M_2PI;
	return dAngle;
}

void Drawer::rotateTo( float _x, float _y ){
	//Find the angle a0 value in radians relative to Y axis
	double dAngle = calcAngleToPoint(_x, _y);

	rotateByRads( dAngle );
}

void Drawer::rotateByRads( double dAngle ){
	if( dAngle != 0 ){
		comandComplete = false;
		rotation += dAngle;

		//float c0 = WEEL_FULL_CIRCLE_STEPS;
	    //float c = TURN_STEPS_RATIO;
		double curve = dAngle * TURN_STEPS_RATIO;

		//Serial.println("Rotating by " + (String)( dAngle * 180 / M_PI) + "deg("+dAngle+"rad) == " + (String)curve + " steps (fill circle "+ (String)c + "steps - "+(String)c0+")" );
		
		rightWheel.setSpeed(WHEELS_SPEED);
		leftWheel.setSpeed(WHEELS_SPEED);

		rightWheel.move(-curve);
		leftWheel.move(curve);
		
		while(!comandComplete)
			run();
	}
}

float Drawer::calcDistance( float x0, float y0, float x1, float y1 ){
	float dx = x1 - x0;
  	float dy = y1 - y0;

  	return (float) sqrt( (double) ( (dx*dx) + (dy*dy) ) );
}

void Drawer::moveTo(float _x, float _y, float _feedRate){
	Serial.println("Moving to [ X" + (String)_x + ", Y" +(String)_y + ", F" +(String)_feedRate +" ]" );
	comandComplete = false;
	rotateTo( _x - x, _y - y );
  	
  	comandComplete = false;
	
	float l = WHEEL_STEPS_RATE * calcDistance( x, y, _x, _y );
	x = _x;
	y = _y;
  	
  	Serial.println("Moving by " + (String)l + " steps" );
	
	rightWheel.setSpeed(WHEELS_SPEED);
	rightWheel.move(l);
	leftWheel.setSpeed(WHEELS_SPEED);
	leftWheel.move(l);
	
	while(!comandComplete)
		run();
}

void Drawer::curveTo( float _x, float _y, float _dx, float _dy, float _feedRate, bool clockwise ){
	comandComplete = false;
	float _x0 = x + _dx;
	float _y0 = y + _dy;

	Serial.println("Curve" + (String)(clockwise?"":" counter") + " clockwise to [ X" + (String)_x + ", Y" +(String)_y + ", F" +(String)_feedRate +" ] with center at [ X" + (String)_dx + ", Y" +(String)_dy + "] from cur point" );
	
	float r = calcDistance( x, y, _x0, _y0 );
	float rout = r + WEEL_BASE_HALF_SIZE;
	float rin  = r - WEEL_BASE_HALF_SIZE;

	//Find arc length
	double chord = calcDistance( x, y, _x, _y );
	double sinA = chord/(2*r);
	double angle = 2*asin( sinA );
	double outWheelSteps = WHEEL_STEPS_RATE * angle * rout;
	double inWheelSteps = WHEEL_STEPS_RATE * angle * rin;

	double outWheelSpeed = abs(outWheelSteps*WHEELS_SPEED/inWheelSteps);
	
	//Find angle between current direction and direction towards the arc center
	double dAngle = calcAngleToPoint(_dx, _dy);

	//Rotate towards the tangent to the arc at current position
	comandComplete = false;
	rotateByRads( clockwise ? dAngle-M_HALF_PI : M_HALF_PI-dAngle );

	comandComplete = false;
	x = _x;
	y = _y;

	if( clockwise ){
		leftWheel.setSpeed(outWheelSpeed);
		rightWheel.setSpeed(WHEELS_SPEED);

		rightWheel.move(inWheelSteps);
		leftWheel.move(outWheelSteps);
	}else{
		rightWheel.setSpeed(outWheelSpeed);
		leftWheel.setSpeed(WHEELS_SPEED);

		rightWheel.move(outWheelSteps);
		leftWheel.move(inWheelSteps);
	}

	while(!comandComplete)
		run();
}

