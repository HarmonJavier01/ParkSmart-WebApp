// ============================================================
// ParkSmart ESP32 - SLOT 02 Firmware
// Target: Los Caballeros Club Parking (SLOT_02)
// Sensor ID: SENSOR_002
// ============================================================

#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// Disable Brownout Detector (Prevents ESP32 reset loop on wall chargers/power banks)
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

WiFiMulti wifiMulti;

// ─── Backend Endpoint ────────────────────────────────────────
// Railway Cloud Backend (24/7 cloud endpoint)
const char* serverUrl = "https://parksmart-backend-production-3294.up.railway.app/api/slots/sensor-update";

// ─── Pin Configurations (HC-SR04 + LEDs) ─────────────────────
#define TRIG_PIN 5    // HC-SR04 Trigger Pin
#define ECHO_PIN 18   // HC-SR04 Echo Pin
#define RED_LED 21    // Occupied LED (Red)
#define GREEN_LED 22  // Vacant LED (Green)

// ─── Sensor & Network Tuning ─────────────────────────────────
#define DISTANCE_LIMIT 30   // cm - car detected if distance < 30cm
#define PULSE_TIMEOUT 20000 // us - max echo timeout
#define MAX_SCORE 2         // accumulator limit for debouncing
#define UPLOAD_INTERVAL 1000// ms - background telemetry rate (1s)
#define HTTP_TIMEOUT 2000   // ms - HTTP POST timeout

// ─── Slot Identification (SLOT 02 - Los Caballeros Club) ─────
const char* sensorId = "SENSOR_002";
const char* slotId   = "6648b2c3d4e5f6a7b8c9d0a1"; // SLOT_02 MongoDB _id
const char* lotId    = "6648a1b2c3d4e5f6a7b8c9d2"; // Los Caballeros Club Parking _id

// ─── Global State ────────────────────────────────────────────
float distance = 0;
const char* statusText = "available";
bool isOccupied = false;
int occupancyScore = 0;
String lastSentStatus = "";

unsigned long lastUploadTime = 0;
unsigned long lastPrintTime  = 0;
unsigned long lastSensorRead = 0;
unsigned long lastWifiRetry  = 0;

const unsigned long PRINT_INTERVAL = 1000; // Print status every 1s
const unsigned long SENSOR_INTERVAL = 50;  // Read sensor every 50ms
const unsigned long WIFI_RETRY_INT = 3000; // Retry Wi-Fi every 3s

// ─── Distance Calculation ────────────────────────────────────
float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, PULSE_TIMEOUT);
  if (duration == 0) return -1.0f; // Out of range

  return duration * 0.01715f; // Convert echo duration to cm
}

// ─── LED Indicators ──────────────────────────────────────────
void updateLEDs(bool occupied) {
  digitalWrite(RED_LED, occupied ? HIGH : LOW);
  digitalWrite(GREEN_LED, occupied ? LOW : HIGH);
}

// ─── Read & Debounce Sensor ──────────────────────────────────
void readSensor() {
  float raw = measureDistance();
  bool detected = (raw > 0 && raw < DISTANCE_LIMIT);
  distance = (raw < 0) ? 0 : raw;

  if (detected) {
    if (occupancyScore < MAX_SCORE) occupancyScore++;
  } else {
    if (occupancyScore > 0) occupancyScore--;
  }

  if (occupancyScore >= 1 && !isOccupied) {
    isOccupied = true;
    statusText = "occupied";
    updateLEDs(true);
    Serial.println("\n>>> [SENSOR 02] State Changed -> OCCUPIED (Red LED)");
  } else if (occupancyScore <= 0 && isOccupied) {
    isOccupied = false;
    statusText = "available";
    updateLEDs(false);
    Serial.println("\n>>> [SENSOR 02] State Changed -> VACANT / AVAILABLE (Green LED)");
  }
}

// ─── HTTP POST to ParkSmart Backend ─────────────────────────
void sendToBackend(bool forceUpload) {
  if (WiFi.status() != WL_CONNECTED) return;
  if (!forceUpload && lastSentStatus == String(statusText)) return;

  WiFiClientSecure secureClient;
  secureClient.setInsecure(); // Skip SSL cert verification for IoT

  HTTPClient http;
  http.begin(secureClient, serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT);

  // Correct JSON construction: {"sensorId":"...", "slotId":"...", ...}
  String payload = "{\"sensorId\":\"" + String(sensorId) + "\",";
  payload += "\"slotId\":\"" + String(slotId) + "\",";
  payload += "\"lotId\":\"" + String(lotId) + "\",";
  payload += "\"status\":\"" + String(statusText) + "\",";
  payload += "\"distance_cm\":" + String(distance, 1);
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print("[HTTP] Success (Status ");
    Serial.print(httpCode);
    Serial.print(") -> Slot 02 ");
    Serial.print(statusText);
    Serial.println(" updated!");
    lastSentStatus = String(statusText);
  } else {
    Serial.print("[HTTP] Connection Error: ");
    Serial.print(http.errorToString(httpCode).c_str());
    Serial.println(" -> Check Wi-Fi connection");
  }

  http.end();
}

// ─── Non-Blocking Wi-Fi Multi Check ──────────────────────────
void ensureWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long now = millis();
    if (now - lastWifiRetry >= WIFI_RETRY_INT) {
      lastWifiRetry = now;
      wifiMulti.run();
    }
  }
}

// ─── Setup ───────────────────────────────────────────────────
void setup() {
  // DISABLE BROWNOUT DETECTOR (Prevents ESP32 reboot loops on wall chargers/power banks)
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);

  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, LOW);

  Serial.println("\n==========================================");
  Serial.println(" ParkSmart ESP32 - SLOT 02 Sensor");
  Serial.println("==========================================");
  Serial.print("Target Server : "); Serial.println(serverUrl);
  Serial.print("Slot ID       : "); Serial.println(slotId);
  Serial.print("Sensor ID     : "); Serial.println(sensorId);
  Serial.println("==========================================");

  // Startup LED diagnostic blink
  digitalWrite(RED_LED, HIGH);
  delay(250);
  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, HIGH);
  delay(250);
  digitalWrite(GREEN_LED, LOW);

  // Configure Wi-Fi Station Mode & Stable Power Level
  WiFi.persistent(true);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.setTxPower(WIFI_POWER_15dBm);

  // Add Wi-Fi Access Points (Hotspot + Home Networks)
  wifiMulti.addAP("S21FE", "qwer1234");
  // wifiMulti.addAP("Home_WiFi_SSID", "Home_WiFi_Password"); // Optional backup Wi-Fi

  Serial.println("[WiFi] Connecting to Wi-Fi...");
  unsigned long wifiStart = millis();
  while (wifiMulti.run() != WL_CONNECTED && millis() - wifiStart < 10000) {
    delay(400);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected Successfully!");
    Serial.print("[WiFi] Connected SSID : "); Serial.println(WiFi.SSID());
    Serial.print("[WiFi] ESP32 IP Address : "); Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Searching for Wi-Fi in background...");
  }

  updateLEDs(isOccupied);
  Serial.println("Slot 02 sensor actively monitoring...\n");
}

// ─── Main Loop ───────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  // 1. Check & Auto-Connect to Wi-Fi using WiFiMulti
  ensureWiFi();

  // 2. Read ultrasonic sensor every 50ms
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readSensor();
  }

  // 3. Print status to Serial every 1s
  if (now - lastPrintTime >= PRINT_INTERVAL) {
    lastPrintTime = now;
    Serial.print("[");
    Serial.print(now / 1000);
    Serial.print("s] Slot 02 Distance: ");
    if (distance <= 0) {
      Serial.print("OUT OF RANGE");
    } else {
      Serial.print(distance, 1);
      Serial.print(" cm");
    }
    Serial.print(" | Status: ");
    Serial.print(statusText);
    Serial.print(" | WiFi: ");
    Serial.println(WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED");
  }

  // 4. Upload payload on state change or timer
  bool stateChanged = (lastSentStatus != String(statusText));
  bool timerElapsed = (now - lastUploadTime >= UPLOAD_INTERVAL);

  if (stateChanged || timerElapsed) {
    sendToBackend(timerElapsed);
    lastUploadTime = now;
  }
}
