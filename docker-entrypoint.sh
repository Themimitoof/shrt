#!/bin/sh

if [ ! -f /opt/shrt/config.js ]; then
    echo "No config.js file found. Please mount the file with a volume and \
restart the container."
    exit 255
fi

exec "$@"