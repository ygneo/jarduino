#!/bin/bash

JARDUINO_HOME_DIR=~/.jarduino
ARDUINO_MAKEFILE_VERSION="1.5"
ARDUINO_IDE_VERSION="1.8.1"
ARDUINO_PLATFORM="linux64"
ARDUINO_DIRNAME=arduino-$ARDUINO_IDE_VERSION

mkdir -p $JARDUINO_HOME_DIR
mkdir -p $JARDUINO_HOME_DIR/tmp

# Install Arduino IDE
rm $JARDUINO_HOME_DIR/tmp/*
ext="tar.xz"
file=$ARDUINO_DIRNAME-$ARDUINO_PLATFORM.$ext
wget https://downloads.arduino.cc/$file -P $JARDUINO_HOME_DIR/tmp/
tar xf $JARDUINO_HOME_DIR/tmp/$file -C $JARDUINO_HOME_DIR
$JARDUINO_HOME_DIR/$arduino/install.sh
ln $JARDUINO_HOME_DIR/$ARDUINO_DIR_NAME arduino

# Install Arduino Makefile
rm $JARDUINO_HOME_DIR/tmp/*
ext="tar.gz"
file=$ARDUINO_MAKEFILE_VERSION.$ext
ARDMK_DIR = Arduino-MakeFile-$ARDUINO_MAKEFILE_VERSION
cd $JARDUINO_HOME_DIR
wget https://github.com/sudar/Arduino-Makefile/archive/$file -P $JARDUINO_HOME_DIR/tmp/
tar xf $JARDUINO_HOME_DIR/tmp/$file -C $JARDUINO_HOME_DIR
ln $JARDUINO_HOME_DIR/$ARDMK_DIR ardmk

rm $JARDUINO_HOME_DIR/tmp/*

# TODO Install arduino opengarden libraries
wget https://www.cooking-hacks.com/media/cooking/images/documentation/open_garden/Open_Garden_Libraries_V2.3.zip

