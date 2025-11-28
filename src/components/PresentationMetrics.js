import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Header,
  ColumnLayout,
  Box,
  StatusIndicator,
  Popover,
  SpaceBetween
} from "@awsui/components-react";

const MetricItem = ({ title, value, color, popoverContent }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <div style={{ display: "flex" }}>
        <h4 style={{ marginRight: "5px" }}>{title}</h4>
        <Popover
          dismissAriaLabel={t('common.actions.text.close')}
          triggerType="custom"
          fixedWidth
          header={title}
          size="large"
          content={popoverContent}
        >
          <StatusIndicator type="info" colorOverride="grey"></StatusIndicator>
        </Popover>
      </div>
      <p style={{ color }}>{value}</p>
    </div>
  );
};

const PresentationMetrics = ({ metrics }) => {
  const { t } = useTranslation();
  const {
    eyeMetric, colorEye, avgPace, colorAvgPace, words, colorPace,
    diffDisplay, colorQ, filler, colorFiller, weasel, colorWeasel,
    g1, colorBias
  } = metrics;

  const eyeContactPopover = (
    <ColumnLayout columns={2} variant="text-grid">
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.descriptionTitle")}</Box>
          <div>{t('presentation.metrics.eyeContact.description')}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.tipTitle")}</Box>
          <div>{t('presentation.metrics.eyeContact.tip')}</div>
        </div>
      </SpaceBetween>
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.eyeContact.engaged')}</Box>
          <div>&gt; 60%</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.eyeContact.distracted')}</Box>
          <div>40% - 60%</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.eyeContact.disengaged')}</Box>
          <div>&lt; 40%</div>
        </div>
      </SpaceBetween>
    </ColumnLayout>
  );

  const speakingPaceRealTimePopover = (
    <ColumnLayout columns={2} variant="text-grid">
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.descriptionTitle")}</Box>
          <div>{t('presentation.metrics.speakingPaceRealTime.description')}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.tipTitle")}</Box>
          <div>{t('presentation.metrics.speakingPaceRealTime.tip')}</div>
        </div>
      </SpaceBetween>
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.speakingPaceRealTime.slow')}</Box>
          <div>&lt; 125 WPM</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.speakingPaceRealTime.conversational')}</Box>
          <div>125 - 150 WPM</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.speakingPaceRealTime.fast')}</Box>
          <div>&gt; 150 WPM</div>
        </div>
      </SpaceBetween>
    </ColumnLayout>
  );

  const speakingPacePerMinPopover = (
    <ColumnLayout columns={2} variant="text-grid">
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.descriptionTitle")}</Box>
          <div>{t('presentation.metrics.speakingPacePerMin.description')}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.tipTitle")}</Box>
          <div>{t('presentation.metrics.speakingPacePerMin.tip')}</div>
        </div>
      </SpaceBetween>
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.speakingPacePerMin.slow')}</Box>
          <div>&lt; 125 WPM</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.speakingPacePerMin.conversational')}</Box>
          <div>125 - 150 WPM</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.speakingPacePerMin.fast')}</Box>
          <div>&gt; 150 WPM</div>
        </div>
      </SpaceBetween>
    </ColumnLayout>
  );

  const engagementPopover = (
    <ColumnLayout columns={2} variant="text-grid">
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.descriptionTitle")}</Box>
          <div>{t('presentation.metrics.engagement.description')}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.tipTitle")}</Box>
          <div>{t('presentation.metrics.engagement.tip')}</div>
        </div>
      </SpaceBetween>
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.engagement.conversational')}</Box>
          <div>&lt; 1 Minute</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.engagement.oneSided')}</Box>
          <div>1 - 2 Minutes</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.engagement.disengaged')}</Box>
          <div>&gt; 2 Minutes</div>
        </div>
      </SpaceBetween>
    </ColumnLayout>
  );

  const fillerWordsPopover = (
    <ColumnLayout columns={2} variant="text-grid">
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.descriptionTitle")}</Box>
          <div>{t('presentation.metrics.fillerWords.description')}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.tipTitle")}</Box>
          <div>{t('presentation.metrics.fillerWords.tip')}</div>
        </div>
      </SpaceBetween>
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.fillerWords.prepared')}</Box>
          <div>&lt; 10</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.fillerWords.needPractice')}</Box>
          <div>10 - 20</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.fillerWords.unprepared')}</Box>
          <div>&gt; 20</div>
        </div>
      </SpaceBetween>
    </ColumnLayout>
  );

  const weaselWordsPopover = (
    <ColumnLayout columns={2} variant="text-grid">
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.descriptionTitle")}</Box>
          <div>{t('presentation.metrics.weaselWords.description')}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.tipTitle")}</Box>
          <div>{t('presentation.metrics.weaselWords.tip')}</div>
        </div>
      </SpaceBetween>
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.weaselWords.prepared')}</Box>
          <div>&lt; 10 Words / Phrases</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.weaselWords.needsPractice')}</Box>
          <div>10 - 20 Words / Phrases</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.weaselWords.unprepared')}</Box>
          <div>&gt; 20 Words / Phrases</div>
        </div>
      </SpaceBetween>
    </ColumnLayout>
  );

  const biasEmotionSpecPopover = (
    <ColumnLayout columns={2} variant="text-grid">
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.descriptionTitle")}</Box>
          <div>{t('presentation.metrics.biasEmotionSpec.description')}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t("presentation.metrics.etcTitles.tipTitle")}</Box>
          <div>{t('presentation.metrics.biasEmotionSpec.tip')}</div>
        </div>
      </SpaceBetween>
      <SpaceBetween size="l">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.biasEmotionSpec.prepared')}</Box>
          <div>&lt; 10 Words / Phrases</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.biasEmotionSpec.needsPractice')}</Box>
          <div>10 - 20 Words / Phrases</div>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.biasEmotionSpec.unprepared')}</Box>
          <div>&gt; 20 Words / Phrases</div>
        </div>
      </SpaceBetween>
    </ColumnLayout>
  );

  return (
    <Container
      header={
        <Header
          variant="h2"
          description={t('presentation.metrics.dashboard.realTimeAnalysis')}
        >
          {t('presentation.metrics.dashboard.presentationMetrics')}
        </Header>
      }
    >
      <ColumnLayout columns={7} variant="text-grid">
        <MetricItem
          title={t('presentation.metrics.eyeContact.title')}
          value={eyeMetric}
          color={colorEye}
          popoverContent={eyeContactPopover}
        />
        <MetricItem
          title={t('presentation.metrics.speakingPaceRealTime.title')}
          value={avgPace}
          color={colorAvgPace}
          popoverContent={speakingPaceRealTimePopover}
        />
        <MetricItem
          title={t('presentation.metrics.speakingPacePerMin.title')}
          value={words}
          color={colorPace}
          popoverContent={speakingPacePerMinPopover}
        />
        <MetricItem
          title={t('presentation.metrics.engagement.title')}
          value={diffDisplay}
          color={colorQ}
          popoverContent={engagementPopover}
        />
        <MetricItem
          title={t('presentation.metrics.fillerWords.title')}
          value={filler}
          color={colorFiller}
          popoverContent={fillerWordsPopover}
        />
        <MetricItem
          title={t('presentation.metrics.weaselWords.title')}
          value={weasel}
          color={colorWeasel}
          popoverContent={weaselWordsPopover}
        />
        <MetricItem
          title={t('presentation.metrics.biasEmotionSpec.title')}
          value={g1}
          color={colorBias}
          popoverContent={biasEmotionSpecPopover}
        />
      </ColumnLayout>
    </Container>
  );
};

export default PresentationMetrics;