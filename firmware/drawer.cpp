//
#include "drawer.h";

Drawer::Drawer(){
}

AccelStepper Drawer::initWheel( int pin1, int pin2, int pin3, int pin4 ){
	AccelStepper _wheel( AccelStepper::HALF4WIRE, pin1, pin3, pin2, pin4 );
	_wheel.setSpeed( WHEELS_SPEED );
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

double Drawer::calcAngleToPoint(float _dx, float _dy){
	double angle = atan2( (double)abs(_dx), (double)abs(_dy) );

	if( _dy < 0 )
		angle = M_PI - angle;
	if(_dx < 0 )
		angle = -angle;

	Serial.println( "Angle is " + (String)angle + " current rotation is " + (String)rotation );

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
	double dAngle = calcAngleToPoint(_dx, _dy);

	rotateByRads( dAngle );
}

void Drawer::rotateByRads( double dAngle ){
	if( dAngle != 0 ){
		comandComplete = false;

		//float c0 = WEEL_FULL_CIRCLE_STEPS;
	    //float c = TURN_STEPS_RATIO;
		double curve = dAngle * TURN_STEPS_RATIO;
 
		Serial.println("Rotating by " + (String)( dAngle * 180 / M_PI) + "deg("+dAngle+"rad) " + (String)( M_HALF_PI * 180 / M_PI) );

		rightWheel.move(-curve);
		leftWheel.move(curve);

		rightWheel.setMaxSpeed( WHEELS_MAX_SPEED );
		leftWheel.setMaxSpeed( WHEELS_MAX_SPEED );
		rotation += dAngle;

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
  	
  	Serial.println("Moving by " + (String)l + " steps" );
	
	rightWheel.move(l);
	leftWheel.move(l);

	rightWheel.setMaxSpeed( WHEELS_MAX_SPEED );
	leftWheel.setMaxSpeed( WHEELS_MAX_SPEED );

	x = _x;
	y = _y;
	
	while(!comandComplete)
		run();
}

void Drawer::curveTo( float _x, float _y, float _dx, float _dy, float _feedRate, bool clockwise ){
	comandComplete = false;

	Serial.println("Curve" + (String)(clockwise?"":" counter") + " clockwise to [ X" + (String)_x + ", Y" +(String)_y + ", F" +(String)_feedRate +" ] with center at [ X" + (String)_dx + ", Y" +(String)_dy + "] from cur point" );
	
	// Calculating the radius lengths for pen and both wheels
	float r = calcDistance( 0, 0, _dx, _dy );
	float rout = r + WEEL_BASE_HALF_SIZE;
	float rin  = r - WEEL_BASE_HALF_SIZE;

	//Find arc length
	double chord = calcDistance( x, y, _x, _y );
	double sinA = chord/(r*2.0);
	double angle = asin( sinA )*2.0;
	double outWheelSteps = WHEEL_STEPS_RATE * angle * rout;
	double inWheelSteps = WHEEL_STEPS_RATE * angle * rin;

	double innerWheelSpeed = abs(inWheelSteps*WHEELS_SPEED/outWheelSteps);
	
	//Find angle between current direction and direction towards the arc center
	double dAngle = calcAngleToPoint(_dx, _dy);

	//Rotate towards the tangent to the arc at start position point
	double tanAngle;
	if( clockwise ){
		tanAngle = dAngle - M_HALF_PI;
	} else {
		tanAngle = dAngle + M_HALF_PI;
	}

	rotateByRads( tanAngle );

	comandComplete = false;

	float newAngle =  calcAngleToPoint( _x - x, _y - y );

	if( clockwise ){
		rightWheel.move(inWheelSteps);
		leftWheel.move(outWheelSteps);

		leftWheel.setMaxSpeed( WHEELS_SPEED );
		rightWheel.setMaxSpeed( innerWheelSpeed );

		rotation += (2*newAngle);
	}else{

		rightWheel.move(outWheelSteps);
		leftWheel.move(inWheelSteps);

		rightWheel.setMaxSpeed( WHEELS_SPEED );
		leftWheel.setMaxSpeed(innerWheelSpeed);

		rotation -= (2*newAngle);
	}

	while(!comandComplete)
		run();

	x = _x;
	y = _y;
}

