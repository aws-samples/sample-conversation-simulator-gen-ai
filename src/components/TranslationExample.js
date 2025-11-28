import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationExample = () => {
  const { t, i18n } = useTranslation();

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>{t('home.branding.text.welcome')}</h3>
      <p>{t('common.actions.text.loading')}</p>
      <p>{i18n.language}</p>
      
      {/* Example with interpolation */}
      <p>{t('common.actions.text.success')}: {t('presentation.actions.create')}</p>
      
    </div>
  );
};

export default TranslationExample;