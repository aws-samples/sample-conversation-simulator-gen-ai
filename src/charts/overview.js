// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Header,
  ColumnLayout,
} from "@cloudscape-design/components";
import { CounterLink } from "../commons/common-components";
import { listPresentations } from "../graphql/queries";
import { getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { useTranslation } from 'react-i18next';
import config from '../amplifyconfiguration.json';
Amplify.configure(config);

const client = generateClient();

let currentUser = "";

export default function Overview() {
  const { t } = useTranslation();
  const [presentations, setPresentations] = useState([]);
  const [totalHoursPresented, setTotalHoursPresented] = useState(0);
  const [presentationCount, setPresentationCount] = useState(0);

  useEffect(() => {
    fetchAllPresentations();
    fetchCurrentUser();
  }, []);

  // --- Feteching Logged In User ---
  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    currentUser = user.attributes.email.split("@")[0];
  };

  // --- Feteching User Presentations ---
  const fetchAllPresentations = async () => {
    const presentationData = await client.graphql({query: listPresentations,  })
    const presentationList = presentationData.data.listPresentations.items;
    const filteredPresentationsByOwner = presentationList.filter(
      (presentation) => presentation.owner === currentUser
    );

    setPresentations(filteredPresentationsByOwner);
    setPresentationCount(filteredPresentationsByOwner.length);

    let time = 0,
      timeInHours = 0;

    for (let h = 0; h < filteredPresentationsByOwner.length; h++) {
      time = time + filteredPresentationsByOwner[h].PresentationTime;
      timeInHours = (time / 3600).toFixed(2);
    }
    setTotalHoursPresented(timeInHours);
  };

  return (
    // --- Overview Titling, Description, and Pulling Data ---
    <Container
      className="custom-dashboard-container"
      header={
        <Header variant="h2" description={t('presentation.metrics.overview.description')}>
          {t('presentation.metrics.overview.title')}
        </Header>
      }
    >
      <ColumnLayout columns="2" variant="text-grid">
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.overview.totalPresentations')}</Box>
          <CounterLink>{presentationCount}</CounterLink>
        </div>
        <div>
          <Box variant="awsui-key-label">{t('presentation.metrics.overview.hoursPresented')}</Box>
          <CounterLink>{totalHoursPresented}</CounterLink>
        </div>
      </ColumnLayout>
    </Container>
  );
}
