package com.example.doordrop.Config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SwaggerConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public OpenAPI doorDropOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("DoorDrop API")
                        .description("""
                                **DoorDrop** — Hyperlocal delivery platform with two modes:

                                🟢 **DoorDrop Now** — Quick commerce via Kirana stores (10–30 min, 2–5 km radius)

                                🔵 **DoorDrop Marketplace** — Local businesses: electronics, clothing, furniture (1–5 days)

                                Use `/api/auth/register` or `/api/auth/login` to get a JWT token,
                                then click **Authorize** and paste it to test protected endpoints.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Renuka Kale")
                                .email("rkale3570@gmail.com")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT token here (without 'Bearer ' prefix)")));
    }
}
