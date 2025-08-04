package com.smhrd.web.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;
import java.util.Base64;
import java.security.Key;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.smhrd.web.DTO.NaverDTO;

@Component
public class JwtNaverUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    private Key key;  // 공용 Key

    @jakarta.annotation.PostConstruct
    public void initKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        this.key = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
        System.out.println("JWT Key 초기화 완료 ✅");
    }

    /** 유저 정보 토큰 생성 */
    public String generateToken(NaverDTO user) {
        System.out.println("generateToken() 진입함: " + user);

        long now = System.currentTimeMillis();
        return Jwts.builder()
            .setSubject(user.getUser_id()) // sub
            .claim("username", user.getUsername())
            .claim("naverId", user.getNaverId())
            .claim("phoneNumber", user.getPhone_number())
            .claim("nickname", user.getNickname())
            .claim("naverlogincheck", user.getNaverlogincheck())
            .claim("role", user.getRole())
            .claim("userProfile", user.getUserProfile())
            .setIssuedAt(new Date(now))
            .setExpiration(new Date(now + 1000 * 60 * 60)) // 1시간
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    /** 토큰 유효성 검사 */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            System.out.println("JWT 검증 실패 ❌: " + e.getMessage());
            return false;
        }
    }

    /** 토큰에서 userId(sub) 추출 */
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
        return claims.getSubject();
    }
}
