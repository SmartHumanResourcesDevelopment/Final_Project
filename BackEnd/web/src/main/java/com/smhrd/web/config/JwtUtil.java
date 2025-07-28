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

import com.smhrd.web.DTO.UserDTO;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    /**유저 정보 토큰에 클레임으로 추가 */
    public String generateToken(UserDTO user) {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        Key key = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());

        long now = System.currentTimeMillis();
        return Jwts.builder()
            .setSubject(user.getUser_id())                    // 필수 식별자
            .claim("username", user.getUsername())           // 커스텀 클레임
            .claim("phoneNumber", user.getPhone_number())
            .claim("nickname", user.getNickname())
            .claim("role", user.getRole())
            .setIssuedAt(new Date(now))
            .setExpiration(new Date(now + 1000 * 60 * 60 * 1)) // 1시간
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }
}
