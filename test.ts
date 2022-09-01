input.onButtonPressed(Button.A, function () {
    naturalScience.microIoT_SendMessage("78", naturalScience.TOPIC.topic_0)
})
input.onButtonPressed(Button.AB, function () {
    naturalScience.microIoT_http_post("12", "344", "44")
})
input.onButtonPressed(Button.B, function () {
    naturalScience.microIoT_http_TK_GET(
    "95",
    "12",
    "8",
    "",
    "",
    "",
    ""
    )
})
naturalScience.microIoT_WIFI("hitest", "12345678")
naturalScience.microIoT_ThingSpeak_configura("yourKey")
naturalScience.microIoT_http_IFTTT("BBB", "dtpfTlU3Wqa8y0HRh77xXE")
naturalScience.microIoT_MQTT(
"rHpr0RcWR",
"9NtrAg5ZRz",
"DN5FYlDZR",
naturalScience.SERVERS.China
)
naturalScience.setTDSK(1.1)
naturalScience.mototRun(DIR.CW, 100)
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
