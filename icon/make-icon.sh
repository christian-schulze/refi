#!/bin/sh

echo "Installing 2goarray..."
go install github.com/cratonica/2goarray
if [ $? -ne 0 ]; then
    echo "Failure executing go install github.com/cratonica/2goarray"
    exit
fi

if [ -z "$1" ]; then
    echo "Please specify a PNG file"
    exit
fi

if [ ! -f "$1" ]; then
    echo "$1 is not a valid file"
    exit
fi

OUTPUT=iconunix.go
echo "Generating $OUTPUT"
echo "//+build linux darwin" > $OUTPUT
echo >> $OUTPUT
cat "$1" | 2goarray Data icon >> $OUTPUT
if [ $? -ne 0 ]; then
    echo Failure generating $OUTPUT
    exit
fi
echo Finished
