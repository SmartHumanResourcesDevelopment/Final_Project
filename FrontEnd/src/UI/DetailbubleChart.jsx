import React from "react";
import "../assets/css/common/DetailBubbleChart.css";

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
            style={{
              backgroundColor: b.color,
              width: b.size,
              height: b.size,
              border: `4px solid ${b.color}`,
              boxShadow: `0 0 0 2px rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.15)`
            }}
          />
          <span className="bubble__pct">{b.pct}</span>
          <span className="bubble__label">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
export {DetailBubbleChart}