#!/bin/bash
# Run this script to generate PNG icons from the SVG
# Requires: inkscape or convert (ImageMagick)
#
# Usage: bash generate-icons.sh

SVG_FILE="icon.svg"

if command -v inkscape &> /dev/null; then
  inkscape "$SVG_FILE" --export-type=png --export-filename="icon-192.png" -w 192 -h 192
  inkscape "$SVG_FILE" --export-type=png --export-filename="icon-512.png" -w 512 -h 512
elif command -v convert &> /dev/null; then
  convert -background none "$SVG_FILE" -resize 192x192 "icon-192.png"
  convert -background none "$SVG_FILE" -resize 512x512 "icon-512.png"
else
  echo "Please install inkscape or imagemagick to generate PNG icons."
fi
