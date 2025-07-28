package com.smhrd.web.config;

// JwtUtil.java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import java.util.Base64;
import java.security.Key;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    public String generateToken(String userId) {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        Key key = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());

        long now = System.currentTimeMillis();
        return Jwts.builder()
            .setSubject(userId)
            .setIssuedAt(new Date(now))
            .setExpiration(new Date(now + 1000 * 60 * 60 * 1)) // 1시간
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }
}
