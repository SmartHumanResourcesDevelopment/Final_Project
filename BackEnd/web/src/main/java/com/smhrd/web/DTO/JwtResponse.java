package com.smhrd.web.DTO;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class JwtResponse {
    private boolean success;
    private String token;
    private Map<String, Object> user;

}
