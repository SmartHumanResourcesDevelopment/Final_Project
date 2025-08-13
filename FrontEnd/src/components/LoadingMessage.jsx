import React, { useState, useEffect } from 'react';
import '../assets/css/LoadingAnimation.css';

const LoadingMessage = ({ 
  message = "AI가 마케팅 문구를 작성 중입니다",
  type = "default", // default, typing, dots, pulse
  showIcon = true 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 타이핑 애니메이션 효과
  useEffect(() => {
    if (type === 'typing') {
      if (currentIndex < message.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + message[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, 50); // 타이핑 속도 조절
        return () => clearTimeout(timeout);
      }
    } else {
      setDisplayText(message);
    }
  }, [currentIndex, message, type]);

  // 타이핑 애니메이션 리셋
  useEffect(() => {
    if (type === 'typing') {
      setDisplayText('');
      setCurrentIndex(0);
    }
  }, [message, type]);

  const getClassName = () => {
    let className = 'loading-message';
    if (type === 'pulse') {
      className += ' loading-pulse';
    }
    return className;
  };

  const renderContent = () => {
    switch (type) {
      case 'typing':
        return (
          <>
            {showIcon && <div className="loading-icon"></div>}
            <span className="loading-text">{displayText}</span>
          </>
        );
      
      case 'dots':
        return (
          <>
            {showIcon && <div className="loading-icon"></div>}
            <span className="loading-text">{message}</span>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </>
        );
      
      case 'pulse':
        return (
          <>
            {showIcon && <div className="loading-icon"></div>}
            <span className="loading-text">{message}</span>
          </>
        );
      
      default:
        return (
          <>
            {showIcon && <div className="loading-icon"></div>}
            <span className="loading-text">{message}</span>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={getClassName()}>
      {renderContent()}
    </div>
  );
};

export default LoadingMessage;
