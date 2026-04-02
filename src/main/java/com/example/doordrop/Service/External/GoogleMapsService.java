package com.example.doordrop.Service.External;

public interface GoogleMapsService {

    /**
     * Returns road distance (km) and driving duration (minutes) between two GPS points
     * using the Google Maps Distance Matrix API.
     * Falls back to Haversine if the API key is not configured or the call fails.
     */
    DistanceResult getRoadDistance(double originLat, double originLon,
                                   double destLat, double destLon);

    /**
     * Geocodes a free-form address string to a lat/lng pair.
     * Returns null if the address cannot be resolved.
     */
    LatLng geocodeAddress(String address);

    record DistanceResult(double distanceKm, int durationMinutes) {}

    record LatLng(double lat, double lng) {}
}
