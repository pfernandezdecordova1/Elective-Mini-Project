# Project Proposal — Weather Dashboard (Skyvision)

## What I'm Building

A weather dashboard called Skyvision is a fully interactive, browser-based weather app built with vanilla HTML, CSS, and JavaScript. The app fetches real-time weather data from a public API and displays it in a clean, professional interface with animated weather effects.

## The Problem It Solves

Most weather websites are cluttered with ads and hard to read. I want to build something minimal, fast, and actually useful — a single-page app that gives you the weather at a glance without any noise.

## API

I will use the **[Open-Meteo API](https://open-meteo.com)** — it is free, requires no API key or account, and returns clean, well-documented JSON. I will also use the Open-Meteo Geocoding API so users can search by city name instead of having to know coordinates.

## Core Features

- Display current temperature, weather description, humidity, wind speed, feels like, and UV index
- 7-day daily forecast with high/low temperatures and weather icons
- 24-hour hourly forecast strip
- Sunrise and sunset times with an animated sun arc showing current position in the day
- Dynamic weather-based themes — the background color and particle animations change based on conditions (sunny, rain, snow, storm, fog, etc.)
- Live animated weather effects on a canvas overlay (falling rain, floating snowflakes, rotating sun rays, lightning flashes)
- City search — users can look up any city in the world
- °C / °F toggle
- Smart weather tip banner that gives context-aware advice ("Don't forget your umbrella", "UV is high today — wear sunscreen", etc.)
- `localStorage` persistence — remembers the user's last searched city

## Why This Project

I chose a weather dashboard because the data is easy to understand, the API is beginner-friendly (no auth needed), and there is a lot of room to be creative with how the data is displayed. It is also a project I would actually use. Working with a real API means I have to deal with async JavaScript, JSON parsing, and error handling — all skills that are directly useful in any web development job.


## Deployment
https://pfernandezdecordova1.github.io/electiveminiproject
