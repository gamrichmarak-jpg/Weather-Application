## Weather Applcation

## Overview

A responsive weather application built with HTML, CSS, and Vanilla JavaScript using the Open-Meteo API. Users can search for locations, view current weather conditions,
hourly forecasts, and a 7-day forecast, and switch between metric and imperial units.

## Live Site

## 🔗 [Live Site](https://gamrichmarak-jpg.github.io/Weather-Application/)

## Features

- Search for cities and locations
- Debounced location suggestions
- Current weather conditions
- Feels-like temperature, humidity, wind speed, and precipitation
- Hourly weather forecast
- 7-day weather forecast
- Day selection for hourly forecasts
- Metric and Imperial unit switching
- Loading states
- Error handling and retry functionality
- Responsive design for different screen sizes

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- Open-Meteo API

## API

This project uses the [Open-Meteo API](https://open-meteo.com/) to retrieve weather and location data.
- The Geocoding API is used to search for locations and retrieve their coordinates.
- The Weather API is used to retrieve current, hourly, and daily weather data.

## What I Learned

- Working with APIs and rendering JSON data dynamically.
- Managing asynchronous operations with `async/await`, `try/catch`, and `finally`.
- Handling API errors, network failures, and loading states.
- Working with large arrays of hourly forecast data and selecting the required ranges.
- Managing indexes across related weather data arrays.
- Handling asynchronous race conditions and preventing stale responses from updating the UI.
- Implementing debounced search suggestions.
- Managing unit conversion between Metric and Imperial systems.
- Thinking more carefully about application architecture, data flow, and code organization.

## Challenges

One of the biggest challenges was working with the 168 hourly forecast entries returned for seven days and selecting the correct eight-hour range for
the hourly forecast. I had to understand how array slicing and original indexes could be used to render the selected day's data correctly.

I also spent significant time understanding asynchronous execution, error handling, and race conditions. Tracing requests and execution flow helped me
understand how to prevent stale responses from updating the UI.

Another challenge was structuring the application and deciding how the API data, application state, rendering logic, and user interactions should work together.

## Future Improvements

- Improve the overall application architecture by separating API logic, state management, rendering, and event handling.
- Improve accessibility across the application, including semantic interactive elements and better support for screen readers.
- Refine the visual design and spacing for closer alignment with the original challenge design.
- Improve the handling of edge cases and API failures.
- Improve the project's documentation and organization.

## Repository

[View source code on GitHub](https://github.com/gamrichmarak-jpg/Weather-Application)
