package com.example.doordrop.Util;

/**
 * Haversine-based great-circle distance utility.
 * Accurate to within ~0.5 % for the short distances used in hyperlocal delivery.
 */
public class LocationUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private LocationUtils() {}

    /**
     * Returns the straight-line distance in kilometres between two lat/lon points.
     */
    public static double haversineDistance(double lat1, double lon1,
                                           double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Returns true if the store can deliver to the given user location
     * (i.e. the user is within the store's delivery radius).
     */
    public static boolean isWithinDeliveryRadius(double storeLat, double storeLon,
                                                 double userLat, double userLon,
                                                 double radiusKm) {
        return haversineDistance(storeLat, storeLon, userLat, userLon) <= radiusKm;
    }
}
