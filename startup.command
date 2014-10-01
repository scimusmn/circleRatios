#!/bin/bash

rm -r ~/Documents/chromeTemp
cp -r ~/Documents/chromeData ~/Documents/chromeTemp

open /Applications/Google\ Chrome.app --args --kiosk --user-data-dir="/Users/exhibits/Documents/chromeTemp" "https://CircleRatios.local/circleRatios/"
