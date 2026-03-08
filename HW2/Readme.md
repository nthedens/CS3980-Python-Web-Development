# Homework 2: API, JSON, HTML, JavaScript
This program is designed to pull a json from the US data API and display the population of USA from 2013 to 2024.
the program shows it through an .html page, which calls the data using a javascript function, and styled using CSS.

## index.html
index defines the structure of the web page as calling the javascript that pulls and formats the USA population json.
## main.js
This is javascript which calls the API and takes the json it sends in response. the function is wrapped in parentheses to allow for immediately invoked function expression. it calls an async called fetchpopulation that does calling and formatting. async is not really necessary, as the process is quick but it helps prevent blocking if this is expanded upon. The function calls for the data using fetch() and waits for a response, taking the json it responds with and converting it to a data array. The function then sorts by year and creates a table using string arithmetic (string + string). To put the pulled data in the table, the script uses a for loop and appends the string with Year and population from the json. it then closes the html object and inserts it into the html. The program uses try and catch statements for error handling 

## style.css
This file defines the shape, color and font of the HTML web page. It helps the web page look more appealing.

## Notes
the API end point used for this project is linked [here](https://api.datausa.io/tesseract/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=Year)

An image of the webpage and network status is shown below

<img width="1920" height="958" alt="image" src="https://github.com/user-attachments/assets/12633071-86ab-49f4-8859-e7fa2e8e8569" />

