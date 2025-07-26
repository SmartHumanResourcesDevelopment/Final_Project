package com.smhrd.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProperties {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    public String getSecretKey() {
        return secretKey;
    }

    public long getExpiration() {
        return expiration;
    }
}
