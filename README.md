## CS 4241 Assignment 3: Beautiful Vehicle Value Estimater
Author: Zonglin Peng

![](ScreenCap.JPG)
###### "A good programmer never sleeps..."

## Summary
A webpage is developed and deployed to mark down the user-entered vehicles and estimates their values based on the year and mpg. User are free to edit the information on the webpage.

- Challenges: Solved the frond-end interactions with the back-end server.
- Innovations: Display a table of information of car. Blanks, dropdown boxs, buttons, and the icon are also helpful to users.
- Usability: User can easily edit all the histories and check their cars value.


## Accomplishments
- Middlewares: Passport, ResponseTime, Favicon, Cookie, Static, BodyParser, Morgan, Timeout.
- HTML: Two pages: index.html for the login page, and table.html for the information page.
- CSS: Boostrap is used for way better visual results.
- Server.js: Express server as required.
- Script.js: Two scripts are implemented for the front-end: table.js for table.html, and login.js for index.html.


## Introduction of Usage
Visit the url below:
http://a3-zonglinpeng.glitch.me

## Technical Achievements
- **Addtional Middleware**: 3 addtional middlewares are implemented throught the process of debugging and pursuing better user experience.
- **Live Information Chart**: Implements a live table that displays all the input car information to the user on the web page in real time; after the user selectes to edit the chart, the chart will be updated without refresh.
- **Value Estimater**: Designed a value estimating algorithm that uses the year and mpg of a car and produce a value of the car in dollars. The factor of model is not discuss to avoid copyright and furthermore lawsuits.
- **Dropdown Box**: Adopted a dropdown box for the user that includes most of the most popular car models. Note that It is possible and esay to add ALL models, yet I did spend time and space for it.
- **Image In Readme**: Added a screen shot of my index webpage where three samples are entered.

### Design/Evaluation Achievements
- **Interactive Information Icon**: As shown in the script.js and the index.html, an infomation icon is implemented. When an user click on it, a pop-up will be dispplayed to show the usage instruction. The Sweet Alert is adopted.
- **Mobile Fit**:  The design of the table page can be fit into a mobile screen. The layout is easier for one-hand use.
- **Hover Buttons**: Change the text color to red for button in order to highligh the text content and to warn the user on possible changes that will be made.
- **Noble Theme Design**: Adopted Clean x simple design of the webpage is adopted where the black-and-white-based theme color including background images and new fonts that make the web page look decent and high-ended. (Goat.com)
- **Webpage Element Arrangements**: Tested the application with n=4 users, finding that the background and the elements are always displayed in the expected places.