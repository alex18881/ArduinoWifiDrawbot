#define LEFT_WHEEL
#define RIGHT_WHEEL
#define SERVO
#define WIFI

#define DATASPEED             9600
#define DATA_BUF_SIZE         64

#if defined(SERVO)
  #define PEN_SERVO_PIN       12
  #define DRAW_ON_SERVOANGLE  90
  #define DRAW_OFF_SERVOANGLE 0
#endif

#if defined(LEFT_WHEEL) || defined(RIGHT_WHEEL)
  #define WHEELS
  #define HALFSTEP            8 
  #define WHEEL_ENABLE        LOW
  #define WHEEL_DISABLE       HIGH
  
  #define WHEELS_ACCELERATION 1000
  #define WHEELS_SPEED        300
  #define WHEELS_MAX_SPEED    1000

// Stepper motors rate: steps per millimeter
  #define WHEEL_STEPS_RATE    22.021

// Base width: the distance between wheels in millimeters.
//  Ideally this distance is mesured between centers of weels contact
// patches. Once the pen is located in themiddle of the bot base the
// half of this value is the distance from the actual radiuce to
// radiuces of each wheels paths.
  #define WEEL_BASE_SIZE      111.8
#endif

#if defined(LEFT_WHEEL)
  #define LEFT_WHEEL_PIN1     8
  #define LEFT_WHEEL_PIN2     9
  #define LEFT_WHEEL_PIN3     10
  #define LEFT_WHEEL_PIN4     11
#endif

#if defined(RIGHT_WHEEL)
  #define RIGHT_WHEEL_PIN1     2
  #define RIGHT_WHEEL_PIN2     3
  #define RIGHT_WHEEL_PIN3     4
  #define RIGHT_WHEEL_PIN4     5
#endif

#if defined(WIFI)
  #define WIFI_DATASPEED      9600
  #define WIFI_SSID           "BoogymanHomeWifi"
  #define WIFI_PASSWORD       "alex18881"
  #define HOST_PORT           8090
  #define WIFI_TX_PIN         7
  #define WIFI_RX_PIN         6
  #define WIFI_SERVER_PORT    1336
  #define WIFI_COMMAND_TIMEOUT 1000
#endif
