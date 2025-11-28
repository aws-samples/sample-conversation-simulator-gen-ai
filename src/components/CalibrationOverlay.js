import React from 'react';
import { Button } from "@awsui/components-react";
import { useTranslation } from "react-i18next";

// Overlay component for eye tracking calibration
const CalibrationOverlay = ({ isclickable, position, onIncrementClick }) => {

  const t = useTranslation();
  if (!isclickable) return null;

  return (
    <div>
      {/* Dark overlay background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 999
      }}></div>
      {/* Clickable calibration button */}
      <div style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        zIndex: 1000
      }}>
        <Button variant="primary" onClick={onIncrementClick}>
          {t("presentation.components.clickHere")}
        </Button>
      </div>
    </div>
  );
};

export default CalibrationOverlay;