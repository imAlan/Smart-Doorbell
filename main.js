var veryImportant = true;
var currentDial = 1;
var light = 1;

function checkDial(screen) {
  var change = false;
  if (currentDial == 1) {
    currentDial = 2;
    light = 0;
  } else if (currentDial == 2) {
    currentDial = 3;
    light = 0;
  } else {
    currentDial = 1;
    light = 1;
  }
 
  dispMessage(screen);  
}
 
function writeToScreen(screen, message) {
  screen.setCursor(0,0);
  if (message.length > 16) {
    screen.write(message.substr(0, 16));
    screen.setCursor(1,0);
    screen.write(message.substr(16));
  } else {
    screen.write(message);
  }
}
 
function dispMessage(screen) {
    if (currentDial == 1) {
      writeToScreen(screen, "I'll be right   there!      ");
    } else if (currentDial == 2) {
      writeToScreen(screen, "I won't be here for a while!");
    } else {
      writeToScreen(screen, "I won't be here today!      ");
    }
}
 
function writeEarly(screen) {
  screen.setCursor(0,0);    
 
  dispMessage(screen);
 
  if (veryImportant) {
    veryImportant = false;
    setTimeout(function (){
      screen.clear();
      veryImportant = true;
    }, 3000);
  }
}
 
var Cylon = require('cylon');
var Hipchatter = require('hipchatter');
var hipchatter = new Hipchatter('b2158304ca994e360e10c2421031b1');


Cylon
  .robot()
  .connection('edison', { adaptor: 'intel-iot' })
  .device('screen', { driver: 'upm-jhd1313m1', connection: 'edison' })
  .device('buzzer', { driver: 'led', pin: 4, connection: 'edison' })
  .device('touch', { driver: 'button', pin: 5, connection: 'edison' })
  .device('touch2', { driver: 'button', pin: 7, connection: 'edison' })
  .device('green', {driver: 'led', pin: 6, connection: 'edison'})
  .device('red', {driver: 'led', pin: 3, connection: 'edison'})
  .device('noise', {driver: 'analogSensor', pin: 0, higherLimit:3000})
  .on('ready', function(my) {
    var elapsed = 5000;
   
    my.touch.on('press', function() {
      my.buzzer.turnOn();
      if (light == 0){
          my.red.turnOn();
      }
      else{
          my.green.turnOn();
      }
      writeEarly(my.screen);
      hipchatter.notify('Dragonhacker2015',
      {
          message: 'Someone is at the door!',
          color: 'red',
          token: 'kJw2SKzUbVqmlPvKNaY6Yom4mvF8yVpGzP6c7aVT'
      }, function(err){
          if (err == null) console.log('Doorbell Alert Success!');
      }
      );
    });
 
    my.touch.on('release', function() {
      if (light == 0){
          my.red.turnOff();
      }
      else{
          my.green.turnOff();
      }
      my.buzzer.turnOff();
    });
       
    my.touch2.on('press', function() {
      checkDial(my.screen);
    });
       
    my.touch2.on('release', function() {
      my.screen.clear();
    });
    
    my.noise.on('analogRead', function()
    {
      if (my.noise.analogRead() > 784 & elapsed > 7500){
          hipchatter.notify('Dragonhacker2015',
              {
                  message: 'There is excessive noise in front of your residence. Be wary!',
                  color: 'red',
                  token: 'kJw2SKzUbVqmlPvKNaY6Yom4mvF8yVpGzP6c7aVT'
              }, function(err){
                  if (err == null) {
                      console.log('Excessive Noise Report Success!');
                      elapsed = 0;
                  }
              }
          );
        }
        else {
          elapsed++;   
        }
    });
    
  });
 
Cylon.start();