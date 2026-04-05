package com.example.doordrop.ServiceImpl.Store;

import com.example.doordrop.Entity.Address;
import com.example.doordrop.Entity.Store;
import com.example.doordrop.Entity.User;
import com.example.doordrop.Model.DTO.NearbyStoreResponse;
import com.example.doordrop.Model.DTO.StoreInventoryResponse;
import com.example.doordrop.Model.DTO.StoreOnboardingRequest;
import com.example.doordrop.Repository.AddressRepository;
import com.example.doordrop.Repository.StoreInventoryRepository;
import com.example.doordrop.Repository.StoreRepository;
import com.example.doordrop.Repository.UserRepository;
import com.example.doordrop.Service.Store.StoreService;
import com.example.doordrop.Util.LocationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final StoreInventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public List<NearbyStoreResponse> getNearbyStores(Long userId) {
        Address userAddress = addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElseThrow(() -> new RuntimeException("No default address found. Please set a default delivery address."));

        if (userAddress.getLatitude() == null || userAddress.getLongitude() == null) {
            throw new RuntimeException("Default address does not have GPS coordinates. Please update your address.");
        }

        double userLat = userAddress.getLatitude();
        double userLon = userAddress.getLongitude();

        return storeRepository.findByIsActiveTrueAndIsOpenTrue().stream()
                .filter(store -> LocationUtils.isWithinDeliveryRadius(
                        store.getLatitude(), store.getLongitude(), userLat, userLon, store.getDeliveryRadiusKm()))
                .map(store -> {
                    double dist = LocationUtils.haversineDistance(
                            store.getLatitude(), store.getLongitude(), userLat, userLon);
                    return NearbyStoreResponse.from(store, dist);
                })
                .sorted(Comparator.comparingDouble(NearbyStoreResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    @Override
    public NearbyStoreResponse getStoreById(Long storeId, Long userId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));

        Address userAddress = addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElse(null);

        double distance = 0.0;
        if (userAddress != null && userAddress.getLatitude() != null) {
            distance = LocationUtils.haversineDistance(
                    store.getLatitude(), store.getLongitude(),
                    userAddress.getLatitude(), userAddress.getLongitude());
        }

        return NearbyStoreResponse.from(store, distance);
    }

    @Override
    public NearbyStoreResponse createStore(StoreOnboardingRequest req, Long userId) {
        if (storeRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("A store is already registered for this account.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Store store = Store.builder()
                .name(req.getName())
                .ownerName(req.getOwnerName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .street(req.getStreet())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .deliveryRadiusKm(req.getDeliveryRadiusKm() != null ? req.getDeliveryRadiusKm() : 3.0)
                .user(user)
                .build();

        return NearbyStoreResponse.from(storeRepository.save(store), 0.0);
    }

    @Override
    public NearbyStoreResponse getMyStore(Long userId) {
        Store store = storeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No store found for this account. Please set up your store first."));
        return NearbyStoreResponse.from(store, 0.0);
    }

    @Override
    public NearbyStoreResponse approveStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));
        store.setApproved(true);
        return NearbyStoreResponse.from(storeRepository.save(store), 0.0);
    }

    @Override
    public List<StoreInventoryResponse> getStoreProducts(Long storeId) {
        storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found: " + storeId));

        return inventoryRepository.findByStoreIdAndIsAvailableTrue(storeId).stream()
                .map(StoreInventoryResponse::from)
                .collect(Collectors.toList());
    }
}
