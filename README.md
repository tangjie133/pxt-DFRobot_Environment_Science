# MBT0034 Environment Science Expansion Board V2.0 for micro:bit

This micro:bit-based expansion board, specially designed for STEAM education, allows students to measure environmental conditions for scientific experiments by using rich on-board sensors that cover all basic aspects of nature and science in daily life, which helps them explore the related science knowledge and understand nature phenomenon. It aims to provide a platform for students to learn science theory with practices and bring science education closer to daily life!

[Integrated sensors include UV sensor, temperature sensor, humidity sensor, air pressure sensor, sound sensor, light sensor, water temperature sensor, and a TDS (Total Dissolved Solids) water quality sensor, soil moisture sensor, TVOC, CO2 sensor, etc.](https://www.dfrobot.com/product-2194.html)


## Basic usage

* Request sensor data

```blocks

    basic.forever(function () {
        naturalScience.requstdata()
    })

```

* Control the speed and direction of motor, or stop the motor 

```blocks

    basic.forever(function () {
        naturalScience.mototRun(DIR.CW, 100)
        basic.pause(1000)
        naturalScience.mototStop()
        basic.pause(1000)
    })

```
* Control RGB LEDs to display various colors 

```blocks

    naturalScience.microIoT_setBrightness(100)
    basic.forever(function () {
        naturalScience.microIoT_setIndexColor(naturalScience.microIoT_ledRange(0, 3), 0xffff00)
        basic.pause(1000)
        naturalScience.ledRainbow(1, 360)
        basic.pause(1000)
        naturalScience.microIoT_ledBlank()
        basic.pause(1000)
    })

```
* OLED Screen module can be used to display sensor data, number, and string. 

```blocks

    basic.forever(function () {
        naturalScience.setOLEDShowString(1, 16, 1, "Hi DFRobot")
        naturalScience.setOLEDShowNumber(1, 16, 1, 2020)
    })

```

* Clear number or string on the OLED sreen, clear specific number/string or clear entire row. 

```blocks

    basic.forever(function () {
        naturalScience.clearOLED(1, 16, 1)
        naturalScience.clearOLEDRow(1)
    })

```

* Display sensor data on the OLED sreen 

```blocks

    basic.forever(function () {
        naturalScience.requstdata()
        naturalScience.setOLEDShowString(1, 7, 1, "UV:" + naturalScience.getUltraviolet())
        naturalScience.setOLEDShowString(8, 16, 1, "-SOD:" + naturalScience.getSound())
        naturalScience.setOLEDShowString(1, 7, 2, "TC:" + convertToText(naturalScience.getTVOC(CT.TVOC)))
        naturalScience.setOLEDShowString(8, 16, 2, "-CO2:" + convertToText(naturalScience.getTVOC(CT.CO2)))
        naturalScience.setOLEDShowString(1, 7, 3, "TE:" + naturalScience.getBME(BME.TEMP))
        naturalScience.setOLEDShowString(8, 16, 3, "-WTE:" + naturalScience.getWatertemp())
        naturalScience.setOLEDShowString(1, 7, 4, "LI:" + convertToText(naturalScience.getLight()))
        naturalScience.setOLEDShowString(8, 16, 4, "-TDS:" + convertToText(naturalScience.getTDS()))
        naturalScience.setOLEDShowString(1, 16, 5, "HU:" + naturalScience.getBME(BME.HUM))
        naturalScience.setOLEDShowString(1, 16, 6, "PE:" + naturalScience.getBME(BME.PRESSURE))
    })

```

* IOT control module, access to IoT platforms like IFTTT, Thingspeak, SIOT, EasyIOT via configuration 

```blocks

    input.onButtonPressed(Button.A, function () {
        naturalScience.microIoT_SendMessage("78", naturalScience.TOPIC.topic_0)
    })
    input.onButtonPressed(Button.AB, function () {
        naturalScience.microIoT_http_post("12", "344", "44", 10000)
    })
    input.onButtonPressed(Button.B, function () {
        naturalScience.microIoT_http_TK_GET(
        "GX8STNEAUFMWNBDG",
        "95",
        "12",
        "8",
        "",
        "",
        "",
        "",
        10000
        )
    })
    naturalScience.microIoT_WIFI("hitest", "12345678")
    naturalScience.microIoT_http_IFTTT("BBB", "dtpfTlU3Wqa8y0HRh77xXE")
    naturalScience.microIoT_MQTT(
    "rHpr0RcWR",
    "9NtrAg5ZRz",
    "DN5FYlDZR",
    "192.168.",
    naturalScience.SERVERS.China
    )

```
## License

MIT

Copyright (c) 2020, microbit/micropython Chinese community  

## Supported targets

* for PXT/microbit