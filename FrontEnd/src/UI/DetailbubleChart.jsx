import React from "react";
import "../assets/css/common/DetailBubbleChart.css";

/* 버블 테두리에 쓸 PNG/SVG 들 */
import green   from "../assets/img/same_/green.png";
import orange  from "../assets/img/same_/orange.png";
import sky     from "../assets/img/same_/sky.png";
import purple  from "../assets/img/same_/pupple.png";
import pink    from "../assets/img/same_/pink.png";

const imageMap = { green, orange, sky, purple, pink };

export default function DetailBubbleChart({ data }) {
  return (
    <div
      className="bubbleChart"
      role="img"
      aria-label="트렌드 분석 버블 차트"
    >
      {data.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
          }}
          aria-label={`${b.label} ${b.pct}`}
        >
          <div
            className="bubble__circle"
            style={{ backgroundColor: b.color, width: b.size - 10, height: b.size - 10 }}
          />
          <img src={imageMap[b.img]} alt="" className="bubble__stroke" />
          <span className="bubble__pct">{b.pct}</span>
          <span className="bubble__label">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
export {DetailBubbleChart}