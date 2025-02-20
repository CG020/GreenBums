# GreenBums - CSC436 Software Engineering Semester Project

https://cg020.github.io/GreenBums/

## GreenBums
*your helpful gardening tool*

GreenBums is an app developed for the CSC 436 UofA course for the purpose of aiding gardening hobbyists, green thumbs, black thumbs, nursery caretakers, and anyone who would like to take care of a plant stay on top of what it takes to keep plants healthy - especially in challenging environments such as the desert.

## RUN SITE: 
*Note*: This site is not deployed - runs on local machine!
- how to run application
  - clone repository 
    - git clone https://github.com/CG020/GreenBums.git- 
  - cd into *greenbums* folder
    - cd GreenBums/greenbums
  - npm install
  - npm start
  - site: http://localhost:5173/GreenBums/
 
## Requires
Node.js (version 18 or higher)
npm (comes with Node.js)
 
## Tools and Current State
- AWS backend auth and cloud - Unit Tests in progress
- Capacitor based project - in the process of converting to iOS and Android compatability
- Calendar API: https://fullcalendar.io/docs
- Weather API tool: https://www.weatherapi.com/docs/
- Teachable Machine: https://teachablemachine.withgoogle.com/

#### Features:
- User Login/Registration
- Plant Catalog --> Enter names, notes, and photos of tracked plants
- Calendar --> Schedule types of events and watering scheduling unique to each plant in Catalog
- Weather Warnings --> Warnings of heavy rain/high temp/low temp will appear on calendar based on entered location
- Plant Health Scanner --> Small machine learning model that uses user camera to detect a healthy/unhealthy cactus/houseplant
