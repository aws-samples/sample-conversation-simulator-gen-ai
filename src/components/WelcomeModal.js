import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Box,
  SpaceBetween,
  Button
} from "@awsui/components-react";

const WelcomeModal = ({ visible, onStartCamera }) => {
  const { t } = useTranslation();

  return (
    <Modal
      onDismiss={onStartCamera}
      visible={visible}
      closeAriaLabel={t('navigation.modal.closeModal')}
      size="large"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" onClick={onStartCamera}>
              {t('presentation.actions.calibration')}
            </Button>
          </SpaceBetween>
        </Box>
      }
      header={t('welcome.modal.title')}
    >
      <h3>{t('welcome.modal.gettingStarted')}</h3>
      <h4>{t('welcome.modal.calibration')}</h4>
      <p>
        {t('welcome.modal.calibrationText')}
      </p>
      <h4>{t('welcome.modal.metricsTitle')}</h4>
      <p>
        {t('welcome.modal.metricsText')}
      </p>
      <h4>{t('welcome.modal.cameraSetup')}</h4>
      <p>
        {t('welcome.modal.cameraSetupText')}
      </p>
    </Modal>
  );
};

export default WelcomeModal;