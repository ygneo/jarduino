# jarduino

Setup
--

It has been tested in Ubuntu 16.10

 - Install system requirements.

```
$ sudo apt-get install libdevice-serialport-perl libyaml-perl python wget python-pip 
$ sudo apt-get install gcc-avr binutils-avr gdb-avr avr-libc avrdude
```

- Run:

```
./setup.sh
```

- Install python requirements:

```
pip install -r requirements.txt
```

- Add `jarduino` to your path.

- Download NW.js from https://nwjs.io/

- Put the binary file `nw` in your path.

Usage 
--

- Upload program to Arduino

```
./jarduino upload
```

- Read from Arduino serial port

```
./jarduino read
```
