import React from "react";
import Lottie from 'lottie-react';
import loadingAni from '../../assets/Animation/LoadingAnimation.json';
import './LoadingAnimation.scss';

export function LoadingAnimation() {
  return (
    <div className="body-animation">
      <div className="animation-container">
        <Lottie className="Load_Ani" animationData={loadingAni} loop={true} autoplay={true} />
      </div>
    </div>
  );
}
