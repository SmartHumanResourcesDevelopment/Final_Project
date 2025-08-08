package com.smhrd.web.DTO;

import java.util.List;

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
public class ScrapRequest {
    private List<ProductDTO> products;
    private List<CollabDTO> collaborations;
    private List<SloganDTO> slogans;
}
