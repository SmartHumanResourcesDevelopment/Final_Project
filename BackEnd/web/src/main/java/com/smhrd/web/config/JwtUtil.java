package com.smhrd.web.config;

import io.jsonwebtoken.Claims;
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
        System.out.println("이미지 경로"+user.getUserProfile());

        long now = System.currentTimeMillis();
        return Jwts.builder()
            .setSubject(user.getUser_id())                    // 필수 식별자
            .claim("username", user.getUsername())           // 커스텀 클레임
            .claim("phoneNumber", user.getPhone_number())
            .claim("nickname", user.getNickname())
            .claim("role", user.getRole())
            .claim("userProfile",user.getUserProfile())
            .setIssuedAt(new Date(now))
            .setExpiration(new Date(now + 1000 * 60 * 60 * 1)) // 1시간
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(secretKey) // Base64 인코딩된 키
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(secretKey)
            .parseClaimsJws(token)
            .getBody();
        return claims.getSubject(); // userId가 들어감
}
}