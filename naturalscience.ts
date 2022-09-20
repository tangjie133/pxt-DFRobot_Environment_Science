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
   
    //% weight=120
    //%block="initialize Board"
    export function i2cinit(): void {
        
        let Version_v = 0;
        pins.i2cWriteNumber(0x10, 0X0A, NumberFormat.Int8LE);
        Version_v = pins.i2cReadNumber(0x10, NumberFormat.Int8LE);
        // while (Version_v == 0) {
        //     basic.showLeds(`
        //         # . . . #
        //         . # . # .
        //         . . # . .
        //         . # . # .
        //         # . . . #
        //         `, 10)
        //     basic.pause(500)
        //     basic.clearScreen()
        //     pins.i2cWriteNumber(0x10, 0x0A, NumberFormat.Int8LE);
        //     Version_v = pins.i2cReadNumber(0x10, NumberFormat.Int8LE);
        // }
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

}
