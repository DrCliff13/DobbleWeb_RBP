#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TuSSID";
const char* password = "TuClaveWiFi";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(1000);
  Serial.println("Conectado a WiFi");
}

void loop() {
  if (digitalRead(4) == HIGH) {
    HTTPClient http;
    http.begin("http://tu_servidor/api/games/respuesta");
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"usuario\": \"123\", \"respuesta\": \"🍎\"}";
    int httpCode = http.POST(payload);
    Serial.println("Código HTTP: " + String(httpCode));
    http.end();
  }
}
