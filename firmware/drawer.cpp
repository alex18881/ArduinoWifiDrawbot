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
	}else
    	leftWheel.disableOutputs();
    
	if (rightWheel.distanceToGo() != 0){
		rightWheel.run();
		isMoving = true;
	}else
    rightWheel.disableOutputs();
	comandComplete = !isMoving;
}

void Drawer::rotateTo( float _x, float _y ){
	//Find the angle a0 value in radians relative to Y axis
	double angle = atan2( (double)abs(_x), (double)abs(_y) );
	
	if( _y < 0 )
		angle = M_PI - angle;
	if(_x > 0 )
		angle = -angle;
	/*if( _x == 0 && _y == 0 ){
		return;
	} else if(_x == 0 ){
		angle = ( _y > 0 ? 0 : M_PI );
	} else if( _y == 0 ){
		angle = ( _x > 0 ? M_HALF_PI : -M_HALF_PI );
	} else {
		angle = atan2( (double)abs(_x), (double)abs(_y) );
		if( _y < 0 )
			angle = M_PI - angle;
		if(_x > 0 )
			angle = -angle;
	}

	if( angle != 0 && angle != M_2PI ){*/

		Serial.println( "Angle is " + (String)angle  );

		//Find the difference between the current rotation angle and the a0
		double dAngle = angle - rotation;

		rotateByRads( dAngle );
	//}
}

void Drawer::rotateByRads( double dAngle ){
	if( dAngle != 0 ){
		comandComplete = false;
		rotation += dAngle;

		float c0 = WEEL_FULL_CIRCLE_STEPS;
	    float c = TURN_STEPS_RATIO;
		double curve = dAngle * TURN_STEPS_RATIO;

		Serial.println("Rotating by " + (String)( dAngle * 180 / M_PI) + "deg("+dAngle+"rad) == " + (String)curve + " steps (fill circle "+ (String)c + "steps - "+(String)c0+")" );
		
		rightWheel.move(curve);
		leftWheel.move(-curve);
		
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
	
	rightWheel.move(l);
	leftWheel.move(l);
	
	while(!comandComplete)
		run();
}

void Drawer::curveTo( float _x, float _y, float _dx, float _dy, float _feedRate, bool clockwise ){
	comandComplete = false;
	float _x0 = x + _dx;
	float _y0 = y + _dy;

	Serial.println("Curve" + (String)(clockwise?"":" counter") + " clockwise to [ X" + (String)_x + ", Y" +(String)_y + ", F" +(String)_feedRate +" ] with center at [ X" + (String)_x0 + ", Y" +(String)_y0 + "]" );
	
	float rout = WHEEL_STEPS_RATE * ( calcDistance( x, y, _x0, _y0 ) + WEEL_BASE_HALF_SIZE );
	float rin  = WHEEL_STEPS_RATE * ( calcDistance( x, y, _x0, _y0 ) - WEEL_BASE_HALF_SIZE );
	
	x = _x;
	y = _y;

	rotateTo( _dx, _dy );
	comandComplete = false;

	rotateByRads( clockwise?M_HALF_PI:-M_HALF_PI );

	comandComplete = false;

	if( clockwise ){
		rightWheel.move(rin);
		leftWheel.move(rout);
	}else{
		rightWheel.move(rout);
		leftWheel.move(rin);
	}

	while(!comandComplete)
		run();
}

