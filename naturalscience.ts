/** 
 * @file pxt-DFRobot_NaturalScience-V20/naturalscience.ts
 * @brief DFRobot's NaturalScience makecode library.
 * @n [Get the module here]setOLEDShowString
 * @n 
 * 
 * @copyright    [DFRobot](http://www.dfrobot.com), 2016
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](jie.tang@dfrobot.com)
 * @date  2020-5-28
*/

const OBLOQ_MQTT_EASY_IOT_SERVER_CHINA = "iot.dfrobot.com.cn"
const OBLOQ_MQTT_EASY_IOT_SERVER_EN = "iot.dfrobot.com"
const microIoT_WEBHOOKS_URL = "maker.ifttt.com"
const OBLOQ_MQTT_EASY_IOT_SERVER_TK = "api.thingspeak.com"

enum BME {
    //% block="temperature(°C)"
    TEMP = 1,
    //% block="humidity(%)"
    HUM = 2,
    //% block="pressure(kPa)"
    PRESSURE = 3
}

enum CT {
    //% block="CO2"
    CO2 = 1,
    //% block="TVOC"
    TVOC = 2
}

enum DIR {
    //% block="CW"
    CW = 1,
    //% block="CCW"
    CCW = 2
}

enum PIN {
    P0 = 1,
    P1 = 2,
    P2 = 3,
};

//% weight=10 color=#e7660b icon="\uf185" block="Environment Science"
//% groups="['Sensor', 'OLED', 'Motor', 'RGB', 'IOT']"
namespace naturalScience {
    let data: number[] = [];
    let _brightness = 255
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 16 * 3; i++) {
        neopixel_buf[i] = 0
    }
    let IIC_ADDRESS = 0x16
    let Topic0CallBack: Action = null;
    let Topic1CallBack: Action = null;
    let Topic2CallBack: Action = null;
    let Topic3CallBack: Action = null;
    let Topic4CallBack: Action = null;
    let Wifimode = 0x00

    let microIoT_WEBHOOKS_KEY = ""
    let microIoT_WEBHOOKS_EVENT = ""
    let microIoT_THINGSPEAK_KEY = ""

    let READmode = 0x00
    let SET_PARA = 0x01
    let RUN_COMMAND = 0x02

    /*set para*/
    let SETWIFI_NAME = 0x01
    let SETWIFI_PASSWORLD = 0x02
    let SETMQTT_SERVER = 0x03
    let SETMQTT_PORT = 0x04
    let SETMQTT_ID = 0x05
    let SETMQTT_PASSWORLD = 0x06
    let SETHTTP_IP = 0x07

    /*run command*/
    let CONNECT_WIFI = 0x02
    let CONNECT_MQTT = 0x05
    let SUB_TOPIC0 = 0x06
    let SUB_TOPIC1 = 0x07
    let SUB_TOPIC2 = 0x08
    let SUB_TOPIC3 = 0x09
    let SUB_TOPIC4 = 0x0A
    let PUB_TOPIC0 = 0x0B
    let PUB_TOPIC1 = 0x0C
    let PUB_TOPIC2 = 0x0D
    let PUB_TOPIC3 = 0x0E
    let PUB_TOPIC4 = 0x0F
    let GET_URL = 0x10
    let POST_URL = 0x11
    let GET_VERSION = 0x13
    let DISCONNECT_MQTT = 0X15
    /*read para value*/
    let READ_PING = 0x01
    let READ_WIFISTATUS = 0x02
    let READ_IP = 0x03
    let READ_MQTTSTATUS = 0x04
    let READ_SUBSTATUS = 0x05
    let READ_TOPICDATA = 0x06
    let HTTP_REQUEST = 0x10
    let READ_VERSION = 0x12

    /*para status */
    let PING_OK = 0x01
    let WIFI_DISCONNECT = 0x00
    let WIFI_ERROR = 0x01
    let WIFI_CONNECTING = 0x02
    let WIFI_CONNECTED = 0x03
    let MQTT_CONNECTED = 0x01
    let MQTT_CONNECTERR = 0x02
    let SUB_TOPIC_OK = 0x01
    let SUB_TOPIC_Ceiling = 0x02

    let microIoTStatus = ""
    let WIFI_NAME = ""
    let WIFI_PASSWORLD = ""
    let MQTT_SERVER = ""
    let MQTT_PORT = ""
    let MQTT_ID = ""
    let MQTT_PASSWORLD = ""
    let Topic_0 = ""
    let Topic_1 = ""
    let Topic_2 = ""
    let Topic_3 = ""
    let Topic_4 = ""
    let RECDATA = ""
    let HTTP_IP = ""
    let HTTP_PORT = ""
    let microIoT_IP = "0.0.0.0"
    let G_city = 0;
    let wifiConnected = 0;
    let mqttState = 0;
    let versionState = 0;
    //% weight=120
    //%block="initialize Board"
    export function i2cinit(): void {
        
        let Version_v = 0;
        pins.i2cWriteNumber(0x10, 0X0A, NumberFormat.Int8LE);
        Version_v = pins.i2cReadNumber(0x10, NumberFormat.Int8LE);
        while (Version_v == 0) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `, 10)
            basic.pause(500)
            basic.clearScreen()
            pins.i2cWriteNumber(0x10, 0x0A, NumberFormat.Int8LE);
            Version_v = pins.i2cReadNumber(0x10, NumberFormat.Int8LE);
        }
        basic.showLeds(`
                . . . . .
                . . . . #
                . . . # .
                # . # . .
                . # . . .
                `, 10)
        basic.pause(500)
        basic.clearScreen()
        let Version = microIoT_get_version();
        if (Version == "V4.0") {

            //serial.writeLine(Version)
            versionState = 1;
            let buf = pins.createBuffer(3);
            buf[0] = 0x1E;
            buf[1] = 0x02;
            buf[2] = 0x17;
            pins.i2cWriteBuffer(IIC_ADDRESS, buf);
            basic.pause(2000)
        }
    }
    /**
     * Request data
     */

    //% weight=110
    //% group="Sensor"
    //% blockId=naturalScience_requstdata block="requst data"
    export function requstdata(): void {
        pins.i2cWriteNumber(0x10, 8, NumberFormat.Int8LE);
        let _data = pins.i2cReadBuffer(0x10, 27)
        for (let i = 0; i < 28; i++) {
            data[i] = _data[i]
        }
        basic.pause(50);
    }

    /**
     * Read ultraviolet radiation intensity 
     */

    //% weight=100
    //% group="Sensor"
    //% blockId=naturalScience_ultraviolet block="ultraviolet"
    export function getUltraviolet(): string {
        return data[0] + '.' + data[1];
    }

    /**
     * Get ambient light level 
     */

    //% weight=99
    //% group="Sensor"
    //% blockId=naturalScience_light block="light level"
    export function getLight(): number {
        return (data[2] << 8) | data[3];
    }

    /**
     * get soil moisture
     */

    //% weight=99
    //% group="Sensor"
    //% blockId=naturalScience_soil_moisture block="%pin Ping get soil moisture"
    export function moisture(pin:PIN): number {
        let _pin;
         switch (pin) {
            case PIN.P0: _pin = AnalogPin.P0; break;
            case PIN.P1: _pin = AnalogPin.P1; break;
            default:_pin = AnalogPin.P2;
        }
        return pins.analogReadPin(_pin);
    }

    /**
     * Get sound intensity 
     */

    //% weight=98
    //% group="Sensor"
    //% blockId=naturalScience_sound block="sound level"
    export function getSound(): number {
        return (data[4] << 8) | data[5];
    }

    /**
     * Get water temperature 
     */

    //% weight=97
    //% group="Sensor"
    //% blockId=naturalScience_watertemp block="water temperature(°C)"
    export function getWatertemp(): string {
        return data[6] + '.' + data[7];
    }

    /**
     * Select related data by the drop-down box 
     */

    //% weight=96
    //% group="Sensor"
    //% blockId=naturalScience_BME block="%mode"
    export function getBME(mode: BME): string {
        if (mode == 1) {
            if (data[8] == 1) {
                return data[9] + '.' + data[10];
            } else {
                return '-' + data[9] + '.' + (255 - data[10]);
            }
        } else if (mode == 2) {
            return data[11] + '.' + data[12];
        } else {
            let position: number = (((data[13] << 16) | (data[14] << 8) | data[15]) / 1000).toString().indexOf(".");
            return (((data[13] << 16) | (data[14] << 8) | data[15]) / 1000).toString().substr(0, position + 3);
        }
        return ' '
    }

    /**
     * Get TDS value 
     */

    //% weight=95
    //% group="Sensor"
    //% blockId=naturalScience_TDS block="TDS"
    export function getTDS(): number {
        return (data[16] << 8) | data[17]
    }

    //% weight=95
    //% group="Sensor"
    //% blockId=naturalScience_LUX block="LUX"
    export function getLux(): number {
        let lux = data[24]<<16 | (data[25]<<8)|data[26]
        let _lux = 0
        _lux = lux * 0.6 / 18 / 1
        return Math.round(_lux)
    }

    /**
     * Revise K value to correct TDS data 
     * @param value  , eg: 1.1
     */

    //% weight=80
    //% group="Sensor"
    //% blockId=naturalScience_SetTDSK block="set TDS K value|%value"
    export function setTDSK(value: number): void {
        let position: number = value.toString().indexOf(".");
        let _value = value * 100;
        let buffer = pins.createBuffer(3);
        buffer[0] = 0x1E;
        buffer[1] = parseInt(_value.toString().substr(0, position));
        buffer[2] = parseInt(_value.toString().substr(position, position + 1));
        pins.i2cWriteBuffer(0x10, buffer);
    }

    /**
     * Get related data by the drop-down box 
     */

    //% weight=93
    //% group="Sensor"
    //% blockId=naturalScience_TVOC block="%value"
    export function getTVOC(mode: CT): number {
        if (mode == 1) {
            return (data[18] << 8) | data[19];
        } else {
            return (data[20] << 8) | data[21];
        }
        return 0;
    }

    /**
     * Set TVOC and CO2 baseline (Baseline should be a decimal value)
     * @param value  , eg: 33915
     */

    //% weight=81
    //% group="Sensor"
    //% blockId=naturalScience_setBaseline block="set TVOC and CO2 baseline|%value value"
    export function setBaseline(value: number): void {
        let buffer: Buffer = pins.createBuffer(3);
        buffer[0] = 0x20;
        buffer[1] = value >> 8 & 0xff;
        buffer[2] = value & 0xff;
        pins.i2cWriteBuffer(0x10, buffer);
        
    }

    /**
     * Display string in specific position of OLED screen
     * @param srow (16 pixels per line), eg: 1
     * @param scolumn  , eg: 1
     * @param sleng  , eg: 16
     */

    //% weight=91
    //% group="OLED"
    //% String.defl="Hi DFRobot"
    //% srow.min=1 srow.max=8
    //% scolumn.min=1 scolumn.max=16
    //% sleng.min=1 sleng.max=16
    //% inlineInputMode=inline                 
    //% blockId=naturalScience_OLEDString block="OLED from column |%scolumn to |%sleng in row |%srow display string |%String"
    export function setOLEDShowString(scolumn: number, sleng: number, srow: number, String: string): void {
        if (String.length < 17) {
            if (String.length < (sleng - scolumn) + 1) {
                let buffer: Buffer
                buffer = pins.createBuffer(String.length + 3)
                buffer[0] = 0x28
                buffer[1] = srow;
                buffer[2] = scolumn;
                for (let i = 0; i < String.length; i++) {
                    buffer[i + 3] = String.charCodeAt(i);
                }
                pins.i2cWriteBuffer(0x10, buffer);
                clearOLED(String.length + scolumn, sleng, srow);
            }
            else {
                let buffer: Buffer
                buffer = pins.createBuffer((sleng - scolumn) + 4)
                buffer[0] = 0x28
                buffer[1] = srow;
                buffer[2] = scolumn;
                for (let i = 0; i < (sleng - scolumn) + 1; i++) {
                    buffer[i + 3] = String.charCodeAt(i);
                }
                pins.i2cWriteBuffer(0x10, buffer);
            }

        }
        else {
            let buffer: Buffer
            buffer = pins.createBuffer(19)
            buffer[0] = 0x28
            buffer[1] = srow;
            buffer[2] = scolumn;
            for (let i = 0; i < 16; i++) {
                buffer[i + 3] = String.charCodeAt(i);
            }
            pins.i2cWriteBuffer(0x10, buffer);
        }

        basic.pause(50);
    }

    /**
     * Display number in specifc position of OLED sreen 
     * @param nrow (16 pixels per line), eg: 1
     * @param ncolumn  , eg: 1
     * @param nleng  , eg: 16
     * @param Number  , eg: 2020
     */

    //% weight=90
    //% group="OLED"
    //% value.defl="DFRobot"
    //% nrow.min=1 nrow.max=8
    //% ncolumn.min=1 ncolumn.max=16
    //% nleng.min=1 nleng.max=16
    //% inlineInputMode=inline
    //% blockId=naturalScience_OLEDNumber block="OLED from column |%ncolumn to |%nleng in row |%nrow display number|%Number"
    export function setOLEDShowNumber(ncolumn: number, nleng: number, nrow: number, Number: number): void {
        setOLEDShowString(ncolumn, nleng, nrow, Number.toString());
    }


    /**
     * Clear string or number in specific position of OLED screen 
     * @param valuerow (16 pixels per line), eg: 1
     * @param valuecolumnstart  , eg: 1
     * @param valuecolumnstop  , eg: 16
     */

    //% weight=89
    //% group="OLED"
    //% valuerow.min=1 valuerow.max=8
    //% valuecolumnstart.min=1 valuecolumnstart.max=16
    //% valuecolumnstop.min=1 valuecolumnstop.max=16
    //% blockId=naturalScience_clearOLED block="clear OLED from column|%valuecolumnstart to |%valuecolumnstop in row |%valuerow "
    export function clearOLED(valuecolumnstart: number, valuecolumnstop: number, valuerow: number): void {
        let datalength: number = (valuecolumnstop - valuecolumnstart) + 1
        if (datalength < 0)
            return;
        let buffer: Buffer = pins.createBuffer(datalength + 3);
        buffer[0] = 0x28
        buffer[1] = valuerow;
        buffer[2] = valuecolumnstart;
        serial.writeValue("ff", valuecolumnstart)
        for (let i = 0; i < datalength; i++) {
            buffer[i + 3] = 32;
        }
        pins.i2cWriteBuffer(0x10, buffer);
        basic.pause(50);
    }

    /**
     * Clear string or number in a whole row of OLED screen 
     * @param valuerow (16 pixels per line), eg: 1
     */

    //% weight=88
    //% group="OLED"
    //% valuerow.min=1 valuerow.max=8
    //% blockId=naturalScience_clearOLEDRow block="clear OLED row|%valuerow"
    export function clearOLEDRow(valuerow: number): void {
        let buffer: Buffer = pins.createBuffer(19);
        buffer[0] = 0x28
        buffer[1] = valuerow;
        buffer[2] = 1;
        for (let i = 0; i < 16; i++) {
            buffer[i + 3] = 32;
        }
        pins.i2cWriteBuffer(0x10, buffer);
    }

    /**
     * Control the direction and speed of motor 
     */

    //% weight=89
    //% group="Motor"
    //% _speed.min=0 _speed.max=255
    //% blockId=naturalScience_mototRun block="control motor direction|%_direction speed|%_speed"
    export function mototRun(_direction: DIR, _speed: number): void {
        let buf = pins.createBuffer(3)
        buf[0] = 0x00;
        buf[1] = _direction;
        buf[2] = _speed;
        pins.i2cWriteBuffer(0x10, buf)

    }

    /**
     * Stop the motor 
     */

    //% weight=88
    //% group="Motor"
    //% blockId=naturalScience_mototStop block="motor stop"
    export function mototStop(): void {
        let buf = pins.createBuffer(3)
        buf[0] = 0x00;
        buf[1] = 0;
        buf[2] = 0;
        pins.i2cWriteBuffer(0x10, buf)
    }

    /** 
     * Set the three primary color:red, green, and blue
     * @param r  , eg: 100
     * @param g  , eg: 100
     * @param b  , eg: 100
     */

    //% weight=60
    //% group="RGB"
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% block="red|%r green|%g blue|%b"
    export function microIoT_rgb(r: number, g: number, b: number): number {
        return (r << 16) + (g << 8) + (b);
    }

    /**
     * RGB LEDs light up from A to B
     * @param from  , eg: 1
     * @param to  , eg: 4
     */

    //% weight=60
    //% group="RGB"
    //% from.min=1 from.max=4
    //% to.min=1 to.max=4
    //% block="range from |%from with|%to leds"
    export function microIoT_ledRange(from: number, to: number): number {
        return ((from-1) << 16) + (2 << 8) + (to);
    }

    /**
     * Set the color of the specified LEDs
     * @param index  , eg: 1
     */

    //% weight=60
    //% group="RGB"
    //% index.min=1 index.max=4
    //% rgb.shadow="colorNumberPicker"
    //% block="RGB light |%index show color|%rgb"
    export function microIoT_setIndexColor(index: number, rgb: number) {
        let f = index-1;
        let t = index-1;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        if ((index-1) > 15) {
            if ((((index-1) >> 8) & 0xFF) == 0x02) {
                f = (index-1) >> 16;
                t = (index-1) & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)

    }

    /**
     * Set the color of all RGB LEDs
     */

    //% weight=60
    //% group="RGB"
    //% rgb.shadow="colorNumberPicker"
    //% block=" RGB show color |%rgb"
    export function microIoT_showColor(rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 16 * 3; i++) {
            if ((i % 3) == 0)
                neopixel_buf[i] = Math.round(g)
            if ((i % 3) == 1)
                neopixel_buf[i] = Math.round(r)
            if ((i % 3) == 2)
                neopixel_buf[i] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    /**
     * Set the brightness of RGB LED
     * @param brightness  , eg: 100
     */

    //% weight=70
    //% group="RGB"
    //% brightness.min=0 brightness.max=255
    //% block="set RGB brightness to |%brightness"
    export function microIoT_setBrightness(brightness: number) {
        _brightness = brightness;
    }

    /**
     * Turn off all RGB LEDs
     */

    //% weight=40
    //% group="RGB"
    //% block="clear all RGB"
    export function microIoT_ledBlank() {
        microIoT_showColor(0)
    }

    /**
     * RGB LEDs display rainbow colors 
     */

    //% weight=50
    //% group="RGB"
    //% startHue.defl=1
    //% endHue.defl=360
    //% startHue.min=0 startHue.max=360
    //% endHue.min=0 endHue.max=360
    //% blockId=led_rainbow block="set RGB show rainbow color from|%startHue to|%endHue"
    export function ledRainbow(startHue: number, endHue: number) {
        startHue = startHue >> 0;
        endHue = endHue >> 0;
        const saturation = 100;
        const luminance = 50;
        let steps = 3 + 1;
        const direction = HueInterpolationDirection.Clockwise;

        //hue
        const h1 = startHue;
        const h2 = endHue;
        const hDistCW = ((h2 + 360) - h1) % 360;
        const hStepCW = Math.idiv((hDistCW * 100), steps);
        const hDistCCW = ((h1 + 360) - h2) % 360;
        const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
        let hStep: number;
        if (direction === HueInterpolationDirection.Clockwise) {
            hStep = hStepCW;
        } else if (direction === HueInterpolationDirection.CounterClockwise) {
            hStep = hStepCCW;
        } else {
            hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
        }
        const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

        //sat
        const s1 = saturation;
        const s2 = saturation;
        const sDist = s2 - s1;
        const sStep = Math.idiv(sDist, steps);
        const s1_100 = s1 * 100;

        //lum
        const l1 = luminance;
        const l2 = luminance;
        const lDist = l2 - l1;
        const lStep = Math.idiv(lDist, steps);
        const l1_100 = l1 * 100

        //interpolate
        if (steps === 1) {
            writeBuff(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
        } else {
            writeBuff(0, hsl(startHue, saturation, luminance));
            for (let i = 1; i < steps - 1; i++) {
                const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                const s = Math.idiv((s1_100 + i * sStep), 100);
                const l = Math.idiv((l1_100 + i * lStep), 100);
                writeBuff(0 + i, hsl(h, s, l));
            }
            writeBuff(3, hsl(endHue, saturation, luminance));
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    function writeBuff(index: number, rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        neopixel_buf[index * 3 + 0] = Math.round(g)
        neopixel_buf[index * 3 + 1] = Math.round(r)
        neopixel_buf[index * 3 + 2] = Math.round(b)
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;

        return (r << 16) + (g << 8) + b;
    }

    export enum SERVERS {
        //% blockId=SERVERS_China block="EasyIOT_CN"
        China,
        //% blockId=SERVERS_English block="EasyIOT_EN"
        English,
        //% block="SIOT"
        SIOT
    }

    export enum TOPIC {
        topic_0 = 0,
        topic_1 = 1,
        topic_2 = 2,
        topic_3 = 3,
        topic_4 = 4
    }

    export class PacketMqtt {
        public message: string;
    }

    function microIoT_setPara(cmd: number, para: string): void {
        let buf = pins.createBuffer(para.length + 4);
        buf[0] = 0x1E
        buf[1] = SET_PARA
        buf[2] = cmd
        buf[3] = para.length
        for (let i = 0; i < para.length; i++)
            buf[i + 4] = para[i].charCodeAt(0)
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }

    function microIoT_runCommand(cmd: number): void {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E
        buf[1] = RUN_COMMAND
        buf[2] = cmd
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }

    function microIoT_readStatus(para: number): number {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E
        buf[1] = READmode
        buf[2] = para
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        let recbuf = pins.createBuffer(2)
        recbuf = pins.i2cReadBuffer(IIC_ADDRESS, 2, false)
        return recbuf[1]
    }

    function microIoT_readValue(para: number): string {
        let buf = pins.createBuffer(3);
        let paraValue = 0x00
        let tempLen = 0x00
        let dataValue = ""
        buf[0] = 0x1E
        buf[1] = READmode
        buf[2] = para
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        microIoT_CheckStatus("READ_IP");
        return RECDATA
    }

    function microIoT_ParaRunCommand(cmd: number, data: string): void {
        let buf = pins.createBuffer(data.length + 4)
        buf[0] = 0x1E
        buf[1] = RUN_COMMAND
        buf[2] = cmd
        buf[3] = data.length
        for (let i = 0; i < data.length; i++)
            buf[i + 4] = data[i].charCodeAt(0)
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);

    }

    function microIoT_CheckStatus(cmd: string): void {
        let startTime = input.runningTime();
        let currentTime = 0;
        while (true) {
            currentTime = input.runningTime();
            if (microIoTStatus == cmd) {
                serial.writeString("OKOK\r\n");
                return;
            }
            basic.pause(50);
            if (versionState == 1) {
                if ((currentTime - startTime) > 20000)
                    return;
            }

        }
    }

    //% advanced=true shim=i2c::init
    function init(): void {
        return;
    }
    /**
     * init I2C
     */
    // //% block=" I2C init"
    // export function i2cinit():void{
    //     init();
    // }
    /**
    * WiFi configuration
    * @param SSID to SSID ,eg: "yourSSID"
    * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
    */

    //% weight=100
    //% group="IOT"
    //% blockId=naturalScience_microIoT_WIFI block="Wi-Fi configure name: %SSID| password：%PASSWORD start connection"
    export function microIoT_WIFI(SSID: string, PASSWORD: string): void {
        init()
        microIoT_setPara(SETWIFI_NAME, SSID)
        microIoT_setPara(SETWIFI_PASSWORLD, PASSWORD)
        microIoT_runCommand(CONNECT_WIFI)
        microIoT_CheckStatus("WiFiConnected");
        Wifimode = WIFI_CONNECTED
    }

    /**
     * MQTT configuration
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param IOT_ID to IOT_ID ,eg: "yourIotId"
     * @param IOT_PWD to IOT_PWD ,eg: "yourIotPwd"
     * @param IOT_TOPIC to IOT_TOPIC ,eg: "yourIotTopic"
     * @param IP to IP ,eg: "192.168."
    */

    //% weight=90
    //% group="IOT"
    //% blockExternalInputs=1
    //% blockId=OBLOQ-I2C_MQTT block="MQTT configure|IOT_ID(user):%IOT_ID|IOT_PWD(password):%IOT_PWD|Topic(default topic_0):%IOT_TOPIC|server:%SERVERS||IP:%IP"
    export function microIoT_MQTT(
        IOT_ID: string, IOT_PWD: string,
        IOT_TOPIC: string,servers: SERVERS, IP?: string):
        void {
        if (servers == SERVERS.China) {
            microIoT_setPara(SETMQTT_SERVER, OBLOQ_MQTT_EASY_IOT_SERVER_CHINA)
        } else if (servers == SERVERS.English) {
            microIoT_setPara(SETMQTT_SERVER, OBLOQ_MQTT_EASY_IOT_SERVER_EN)
        } 
        else{microIoT_setPara(SETMQTT_SERVER, IP)}
        microIoT_setPara(SETMQTT_PORT, "1883")//1883
        microIoT_setPara(SETMQTT_ID, IOT_ID)
        microIoT_setPara(SETMQTT_PASSWORLD, IOT_PWD)
        serial.writeString("wifi conneced ok\r\n");
        microIoT_runCommand(CONNECT_MQTT);
        microIoT_CheckStatus("MQTTConnected");
        serial.writeString("mqtt connected\r\n");
      
        Topic_0 = IOT_TOPIC
        microIoT_ParaRunCommand(SUB_TOPIC0, IOT_TOPIC);
        microIoT_CheckStatus("SubTopicOK");
        serial.writeString("sub topic ok\r\n");

    }

    /**
     * Add an MQTT subscription
     * @param IOT_TOPIC ,eg: "yourIotTopic"
     */

    //% weight=70
    //% group="IOT"
    //% blockId=naturalScience_microIoT_add_topic
    //% block="subscribe additional %top |: %IOT_TOPIC"
    //% top.fieldEditor="gridpicker" top.fieldOptions.columns=2
    export function microIoT_add_topic(top: TOPIC, IOT_TOPIC: string): void {
        microIoT_ParaRunCommand((top + 0x06), IOT_TOPIC);
        microIoT_CheckStatus("SubTopicOK");

    }

    /**
     * MQTT sends information to the corresponding subscription
     * @param Mess to Mess ,eg: "mess"
     */

    //% weight=80
    //% group="IOT"
    //% blockId=naturalScience_microIoT_SendMessage block="send message %Mess| to |%TOPIC"
    export function microIoT_SendMessage(Mess: string, Topic: TOPIC): void {
        let topic = 0

        switch (Topic) {
            case TOPIC.topic_0:
                topic = PUB_TOPIC0
                break;
            case TOPIC.topic_1:
                topic = PUB_TOPIC1
                break;
            case TOPIC.topic_2:
                topic = PUB_TOPIC2
                break;
            case TOPIC.topic_3:
                topic = PUB_TOPIC3
                break;
            case TOPIC.topic_4:
                topic = PUB_TOPIC4
                break;
            default:
                break;

        }
        microIoT_ParaRunCommand(topic, Mess)

    }

    function microIoT_callback(top: TOPIC, a: Action): void {
        switch (top) {
            case TOPIC.topic_0:
                Topic0CallBack = a;
                break;
            case TOPIC.topic_1:
                Topic1CallBack = a;
                break;
            case TOPIC.topic_2:
                Topic2CallBack = a;
                break;
            case TOPIC.topic_3:
                Topic3CallBack = a;
                break;
            case TOPIC.topic_4:
                Topic4CallBack = a;
                break;
            default:
                break;
        }
    }

    /**
     * MQTT processes the subscription when receiving message
     */

    //% weight=60
    //% group="IOT"
    //% blockId=naturalScience_microIoT_MQTT_Event block="on received %top"
    //% top.fieldEditor="gridpicker" top.fieldOptions.columns=2
    export function microIoT_MQTT_Event(top: TOPIC, cb: (message: string) => void) {
        microIoT_callback(top, () => {
            const packet = new PacketMqtt()
            packet.message = RECDATA
            cb(packet.message)
        });
    }


    /**
    * IFTTT configuration
    * @param EVENT to EVENT ,eg: "yourEvent"
    * @param KEY to KEY ,eg: "yourKey"
    */

    //% weight=50
    //% group="IOT"
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=naturalScience_microIoT_http_IFTTT
    //% block="IFTTT configure|event: %EVENT|key: %KEY"
    export function microIoT_http_IFTTT(EVENT: string, KEY: string): void {
        microIoT_WEBHOOKS_EVENT = EVENT
        microIoT_WEBHOOKS_KEY = KEY
    }


    function microIoT_http_wait_request(time: number): string {
        if (time < 100) {
            time = 100
        }
        let timwout = time / 100
        let _timeout = 0
        while (true) {
            basic.pause(100)
            if (microIoTStatus == "HTTP_REQUEST") {
                microIoTStatus = "";
                return RECDATA
            } else if (microIoTStatus == "HTTP_REQUESTFailed") {
                microIoTStatus = "";
                return "requestFailed"
            }
            _timeout += 1
            if (_timeout > timwout) {
                return "timeOut"
            }
        }
    }
    
    /**
     * ThingSpeak configuration
     * @param KEY to KEY ,eg: "yourKey"
     */
    //% weight=31
    //% group="IOT"
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=OBLOQ_microIoT_ThingSpeak_configura
    //% block="ThingSpeak configure key: %KEY"
    export function microIoT_ThingSpeak_configura(KEY: string): void {
        microIoT_THINGSPEAK_KEY = KEY
    }

    /**
    * ThingSpeak configured and sent data
    * @param field1 ,eg: 2020
    */

    //% weight=30
    //% group="IOT"
    //% blockId=naturalScience_microIoT_http_TK_GET
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=inline
    //% block="ThingSpeak send value1: %field1||value2: %field2|value3: %field3|value4: %field4|value5: %field5|value6: %field6|value7: %field7 value8: %field8" 
    export function microIoT_http_TK_GET(field1: string, field2?: string, field3?: string, field4?: string, field5?: string, field6?: string, field7?: string, field8?: string): void {
        microIoT_setPara(SETHTTP_IP, OBLOQ_MQTT_EASY_IOT_SERVER_TK)
        let tempStr = ""
        tempStr = "update?api_key=" + microIoT_THINGSPEAK_KEY + "&field1=" + field1 
        
        if(field2 != undefined)
            tempStr += "&field2=" + field2
        if(field3 != undefined)
            tempStr += "&field3=" + field3
        if(field4 != undefined)
            tempStr += "&field4=" + field4
        if(field5 != undefined)
            tempStr += "&field5=" + field5
        if(field6 != undefined)
            tempStr += "&field6=" + field6
        if(field7 != undefined)
            tempStr += "&field7=" + field7
        if(field8 != undefined)
            tempStr += "&field8=" + field8
        
        microIoT_ParaRunCommand(GET_URL, tempStr);
    }

    /**
     * IFTTT send data
     * time(ms): private long maxWait
     * @param value1 ,eg: Hi
     * @param value2 ,eg: DFRobot
     * @param value3 ,eg: 2020
    */

    //% weight=40
    //% group="IOT"
    //% blockId=naturalScience_microIoT_http_post
    //% block="IFTTT send value1:%value1|value2:%value2|value3:%value3"
    //% inlineInputMode=inline
    export function microIoT_http_post(value1: string, value2: string, value3: string): void {
        microIoT_setPara(SETHTTP_IP, microIoT_WEBHOOKS_URL)
        let tempStr = ""
        tempStr = "trigger/" + microIoT_WEBHOOKS_EVENT + "/with/key/" + microIoT_WEBHOOKS_KEY + ",{\"value1\":\"" + value1 + "\",\"value2\":\"" + value2 + "\",\"value3\":\"" + value3 + "\" }" + "\r"
        microIoT_ParaRunCommand(POST_URL, tempStr)
    }

    function microIoT_GetData(len: number): void {
        RECDATA = ""
        let tempbuf = pins.createBuffer(1)
        tempbuf[0] = 0x22
        pins.i2cWriteBuffer(IIC_ADDRESS, tempbuf);
        let tempRecbuf = pins.createBuffer(len)
        tempRecbuf = pins.i2cReadBuffer(IIC_ADDRESS, len, false)
        for (let i = 0; i < len; i++) {
            RECDATA += String.fromCharCode(tempRecbuf[i])
        }
    }

    function microIoT_InquireStatus(): void {

        let buf = pins.createBuffer(3)
        let tempId = 0
        let tempStatus = 0
        buf[0] = 0x1E
        buf[1] = READmode
        buf[2] = 0x06
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        let recbuf = pins.createBuffer(2)
        recbuf = pins.i2cReadBuffer(IIC_ADDRESS, 2, false)
        tempId = recbuf[0]
        tempStatus = recbuf[1]
        switch (tempId) {
            case READ_PING:
                if (tempStatus == PING_OK) {
                    microIoTStatus = "PingOK"
                } else {
                    microIoTStatus = "PingERR"
                }
                break;
            case READ_WIFISTATUS:
                if (tempStatus == WIFI_CONNECTING) {
                    microIoTStatus = "WiFiConnecting"
                } else if (tempStatus == WIFI_CONNECTED) {
                    microIoTStatus = "WiFiConnected"
                } else if (tempStatus == WIFI_DISCONNECT ) {
                    microIoTStatus = "WiFiDisconnect"
                    wifiConnected++;
                    if (wifiConnected == 2){
                        wifiConnected = 0;
                        microIoT_runCommand(WIFI_CONNECTED);
                    }
                } else{
                }break;
            case READ_MQTTSTATUS:
                if (tempStatus == MQTT_CONNECTED) {
                    microIoTStatus = "MQTTConnected"
                    mqttState = 1;
                } else if (tempStatus == MQTT_CONNECTERR) {
                    microIoTStatus = "MQTTConnectERR"
                    
                } else if (tempStatus == 0) {//新版本修复重连
                    microIoT_runCommand(DISCONNECT_MQTT);
                    microIoT_runCommand(WIFI_CONNECTED);
                }
                break;
            case READ_SUBSTATUS:
                if (tempStatus == SUB_TOPIC_OK) {
                    microIoTStatus = "SubTopicOK"
                } else if (tempStatus == SUB_TOPIC_Ceiling) {
                    microIoTStatus = "SubTopicCeiling"
                } else {
                    microIoTStatus = "SubTopicERR"
                }
                break;
            case READ_IP:
                microIoTStatus = "READ_IP"
                microIoT_GetData(tempStatus)
                microIoT_IP = RECDATA
                if (mqttState == 1) {
                    mqttState = 0;
                    microIoT_runCommand(DISCONNECT_MQTT);
                    basic.pause(200)
                    microIoT_runCommand(CONNECT_MQTT);
                    //microIoT_CheckStatus("MQTTConnected");
                }
                break;
            case SUB_TOPIC0:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic0CallBack != null) {
                    Topic0CallBack();
                }
                break;
            case SUB_TOPIC1:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic1CallBack != null) {
                    Topic1CallBack();
                }
                break;
            case SUB_TOPIC2:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic2CallBack != null) {
                    Topic2CallBack();
                }
                break;
            case SUB_TOPIC3:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic3CallBack != null) {
                    Topic3CallBack();
                }
                break;
            case SUB_TOPIC4:
                microIoTStatus = "READ_TOPICDATA"
                microIoT_GetData(tempStatus)
                if (Topic4CallBack != null) {
                    Topic4CallBack();
                }
                break;
            case HTTP_REQUEST:
                microIoTStatus = "HTTP_REQUEST"
                microIoT_GetData(tempStatus)
                break;
            case READ_VERSION:
                microIoTStatus = "READ_VERSION"
                microIoT_GetData(tempStatus)
                break;
            default: 
                break;
        }
        basic.pause(200);
    }
    basic.forever(function () {
        microIoT_InquireStatus();
    })

    function microIoT_get_version(): string {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E;
        buf[1] = RUN_COMMAND;
        buf[2] = GET_VERSION;
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        //microIoT_CheckStatus("READ_VERSION");
        return RECDATA
    }

}
