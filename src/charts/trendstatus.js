// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import React from "react";
import {
  Box,
  HelpPanel,
  Icon,
  Container,
  Header,
  StatusIndicator,
  ColumnLayout,
} from "@cloudscape-design/components";
import { ExternalLinkItem, InfoLink } from "../commons/common-components";
import { useTranslation } from "react-i18next"

  // --- Helper Function to link to external page to understand what the trends mean ---
function TrendsStatusInfo() {
  const{ t } = useTranslation()
  return (
    <HelpPanel
      header={<h2>{t("history.charts.trendStatus.header")}</h2>}
      footer={
        <>
          <h3>
            {t("history.charts.trendStatus.learnMore")}{" "}
            <span role="img" aria-label="Icon external Link">
              <Icon name="external" />
            </span>
          </h3>
          <ul>
            <li>
              <ExternalLinkItem
                href="#"
                text="Learn more how trends the trends means"
              />
            </li>
          </ul>
        </>
      }
    >
      <p>
        {t("history.charts.trendStatus.serviceAvail")}
      </p>
    </HelpPanel>
  );
}

  // --- Showing the user their Trend ---
export default function TrendsStatus(props) {
  return (
    <></>
  );
}
