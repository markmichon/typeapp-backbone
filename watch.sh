#!/bin/sh

# Change `style.css` or `style.min.css` to whatever you would like your compiled
# stylesheet to be called. Do not rename `style.scss` or alter references to it.

# No minification
sass --watch css/main.scss:css/main.css --style expanded

# sass --watch assets/scss/markmichon.scss:assets/css/markmichon.min.css --style compressed

exit 0