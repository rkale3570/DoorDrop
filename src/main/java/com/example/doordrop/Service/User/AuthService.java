package com.example.doordrop.Service.User;

import com.example.doordrop.Model.DTO.AuthResponse;
import com.example.doordrop.Model.DTO.LoginRequest;
import com.example.doordrop.Model.DTO.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
