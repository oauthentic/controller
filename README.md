# *O*Authentic Physical Access Controller

## Purpose 

This project proposes an Open Source implementation of a *Physical Access Controller* based on the [*O*Authentic API](https://oauthentic.com/en/api.html) that takes care of user authentication and a [Raspberry 4](https://www.raspberrypi.org/products/raspberry-pi-4-model-b/) as a controller that is a connected to a relay in order to trigger an electric door lock or any other security system.

## Hardware

### Components

The project is based on the following components:

- [Raspberry 4](https://www.raspberrypi.org/products/raspberry-pi-4-model-b/)
- 7-inch touch screen touch screen : Either the [official 800x480 screen](https://www.amazon.fr/Raspberry-Pi-2473872-Display-Schermo/dp/B014WKCFR4/) or an HDMI 1024x600 one that provides a better quality display
- Standard optocoupler relay for Raspberry or Arduino such as [this one](https://www.amazon.fr/Elegoo-Optocoupleur-%EF%BC%94-Channel-Arduino-Raspberry/dp/B06XKST8XC/)
  
You can use other components for this project (e.g. Raspberry 3, 5-inch screen, other model of relay) depending on your personal requirements. 
  

### Installation

Follow the instructions of your hardware to get started with the motherboard and the screen. For the optocoupler, we just need to connect it to one the Raspberry GPIO pin such as in the following table that uses the GPIO #23 to manage the relay #1  of the optocoupler:

| | Raspberry GPIO | optocoupler |
| -- | -- | -- |
| 5V power | pin 4 | VCC |
| Ground | pin 6 | Ground |
| IO port | pin 15 | relay 1 |

### Raspberry 4 GPIO description 

![GPIO](img/GPIO.jpg)

### Hardware configuration of the *O*Authentic Controller
 
![Hardware configuration](img/rasprelay.jpg)

The relay can be used to trigger any equipment. For test and demo purpose, it is recommended to start with a simple lamp. When installed, the controller will be customizable from the [*O*Authentic Developer Dashboard](https://oauthentic.com/app/), including the relay triggering time.

## Software

### Architecture

![Software Architecture](img/controller-archi.png)

The controller is composed of two modules:

- the client module is an HTML/CSS/JavaScript app that takes care of the user interface, the controller logic and the communications with :
	- the *O*Authentic API server: `https://api.oauthentic.com`
	- the local server: `http://localhost:8080`

- the local Nodejs server module takes care of interactions with Raspberry hardware. 



## Controller setup