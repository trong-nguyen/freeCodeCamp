# Repo for [freeCodeCamp](https://www.freecodecamp.com) projects

## Front-end:
- [LocalWeather](localWeather/): display weather at current location, custom units
- [Wikipedia Feeds](wikipediaViewer/): display wikipedia feeds of random or entered topics.
- [TwitchTV Viewer](twitchViewer/): view streaming status from a prepopulated list of streamers, embedded preview capability if the streamer is online and streaming.
- [Calculator](calculator/): basic functionalities of a calculator, with keyboard-enabled entry.
- [Pomodoro Clock](pomodoro/): simple Pomodoro management clock, with custom configs for session and break time, pausing clock with keyboard buttons.

## Algorithms:
### Roman conversions ([here](http://www.rapidtables.com/convert/number/how-number-to-roman-numerals.htm)): 
+ Read backward for Roman to Latin conversions.
+ Latin to Roman conversions involve the subtraction rule: remember roman numbers whether in subtraction form or not have at most 2 roman letters, and the preceding numeber can only be 10 or 5 times smaller. So consider the whole letters (I, X, C) and possible subtraction forms from them (IX, XC) or half letters (V, L and IV, XL) **AS unique primitives**. On converting to latin numbers, find the largest possible primitives (subtraction and non-subtraction forms) that equal or smaller than the remainder and subtract it.
+ Ancient Romans did not use roman numbers consistently, they wrote something as IIII or XIIX, i.e. add-until-enough and double-subtraction-form.

## Tools:
- Math rendering: [MathJax](https://www.mathjax.org/),
 [Katex](https://github.com/Khan/KaTeX)