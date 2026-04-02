package com.example.doordrop.ServiceImpl.External;

import com.example.doordrop.Service.External.GoogleMapsService;
import com.example.doordrop.Util.LocationUtils;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleMapsServiceImpl implements GoogleMapsService {

    private final RestTemplate restTemplate;

    @Value("${google.maps.api.key}")
    private String apiKey;

    private static final String DISTANCE_MATRIX_URL =
            "https://maps.googleapis.com/maps/api/distancematrix/json"
            + "?origins={origins}&destinations={destinations}&mode=driving&key={key}";

    private static final String GEOCODING_URL =
            "https://maps.googleapis.com/maps/api/geocode/json"
            + "?address={address}&key={key}";

    @Override
    public DistanceResult getRoadDistance(double originLat, double originLon,
                                          double destLat, double destLon) {
        if (isApiKeyMissing()) {
            return haversineFallback(originLat, originLon, destLat, destLon);
        }

        try {
            String origins      = originLat + "," + originLon;
            String destinations = destLat   + "," + destLon;

            DistanceMatrixResponse response = restTemplate.getForObject(
                    DISTANCE_MATRIX_URL, DistanceMatrixResponse.class,
                    origins, destinations, apiKey);

            if (response == null || !"OK".equals(response.getStatus())) {
                return haversineFallback(originLat, originLon, destLat, destLon);
            }

            DistanceMatrixResponse.Element element =
                    response.getRows().get(0).getElements().get(0);

            if (!"OK".equals(element.getStatus())) {
                return haversineFallback(originLat, originLon, destLat, destLon);
            }

            double distanceKm  = element.getDistance().getValue() / 1000.0;
            int    durationMin = (int) Math.ceil(element.getDuration().getValue() / 60.0);

            return new DistanceResult(
                    Math.round(distanceKm * 100.0) / 100.0, durationMin);

        } catch (Exception ex) {
            log.warn("Google Maps Distance Matrix call failed — falling back to Haversine: {}", ex.getMessage());
            return haversineFallback(originLat, originLon, destLat, destLon);
        }
    }

    @Override
    public LatLng geocodeAddress(String address) {
        if (isApiKeyMissing()) return null;

        try {
            GeocodingResponse response = restTemplate.getForObject(
                    GEOCODING_URL, GeocodingResponse.class,
                    address, apiKey);

            if (response == null || !"OK".equals(response.getStatus())
                    || response.getResults().isEmpty()) {
                return null;
            }

            GeocodingResponse.Location loc =
                    response.getResults().get(0).getGeometry().getLocation();

            return new LatLng(loc.getLat(), loc.getLng());

        } catch (Exception ex) {
            log.warn("Google Maps Geocoding call failed for '{}': {}", address, ex.getMessage());
            return null;
        }
    }

    // ── Fallback ──────────────────────────────────────────────────────────────

    private DistanceResult haversineFallback(double oLat, double oLon, double dLat, double dLon) {
        double km = LocationUtils.haversineDistance(oLat, oLon, dLat, dLon);
        // Rough approximation: road distance ≈ 1.3× straight-line, speed ≈ 30 km/h in urban
        double roadKm = km * 1.3;
        int durationMin = (int) Math.ceil((roadKm / 30.0) * 60);
        return new DistanceResult(Math.round(roadKm * 100.0) / 100.0, durationMin);
    }

    private boolean isApiKeyMissing() {
        return apiKey == null || apiKey.isBlank() || apiKey.startsWith("REPLACE");
    }

    // ── Response POJOs ────────────────────────────────────────────────────────

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    static class DistanceMatrixResponse {
        private String status;
        private List<Row> rows;

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        static class Row { private List<Element> elements; }

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        static class Element {
            private String status;
            private ValueText distance;
            private ValueText duration;
        }

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        static class ValueText {
            private String text;
            private long value;
        }
    }

    @Data @JsonIgnoreProperties(ignoreUnknown = true)
    static class GeocodingResponse {
        private String status;
        private List<Result> results;

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        static class Result { private Geometry geometry; }

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        static class Geometry { private Location location; }

        @Data @JsonIgnoreProperties(ignoreUnknown = true)
        static class Location {
            @JsonProperty("lat") private double lat;
            @JsonProperty("lng") private double lng;
        }
    }
}
