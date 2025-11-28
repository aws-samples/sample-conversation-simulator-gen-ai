// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import React, { Component } from "react";
import { Container, Header, Box, Button } from "@cloudscape-design/components";
import { LineChart } from "@awsui/components-react";
import { listPresentations } from "../graphql/queries";
import { getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '../amplifyconfiguration.json';
import { useTranslation } from 'react-i18next';
Amplify.configure(config);

const client = generateClient();

export default function PaceValues() {
  const { t } = useTranslation();
  return <PaceValuesClass t={t} />
}

class PaceValuesClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: "",
      presentations: [],
      timePresentedData: [],
      speakingPacePerMinData: [],
    };
  }

  componentDidMount() {
    this.fetchAllPresentations();
    this.fetchCurrentUser();
  }
  fetchCurrentUser = async () => {
    const user = await getCurrentUser()
    this.setState({ currentUser: user.attributes.email.split("@")[0] });
  };

  fetchAllPresentations = async () => {
    let timePresentedArray = [];
    let speakingPacePerMinArray = [];
    //let biasEmotionSpecificWordsArray = [];
    const presentationData = await client.graphql({query: listPresentations,  })
    const presentationList = presentationData.data.listPresentations.items;
    const filteredPresentationsByOwner = presentationList.filter(
      (presentation) => presentation.owner === this.state.currentUser
    );
    this.setState({ presentations: filteredPresentationsByOwner });

    // --- Beginning of Time Presented ---
    for (let d = 0; d < this.state.presentations.length; d++) {
      timePresentedArray.push({
        x: new Date(
          new Date(this.state.presentations[d].createdAt).toUTCString()
        ),
        y: (this.state.presentations[d].PresentationTime / 60).toFixed(2),
      });
    }
    timePresentedArray.sort((a, b) => a.x >= b.x);
    this.setState({ timePresentedData: timePresentedArray });

    // --- End of Time Presented ---

    // // --- Beginning of Speaking Pace per Minute---
    for (let d = 0; d < this.state.presentations.length; d++) {
      speakingPacePerMinArray.push({
        x: new Date(
          new Date(this.state.presentations[d].createdAt).toUTCString()
        ),
        y:
          this.state.presentations[d].SpeakingPacePerMin === "- WPM"
            ? 0
            : parseInt(this.state.presentations[d].SpeakingPacePerMin.split("-")[0]),
      });
    }
    speakingPacePerMinArray.sort((a, b) => a.x >= b.x);
    this.setState({ speakingPacePerMinData: speakingPacePerMinArray });
    // // --- End of Speaking Pace per Minute ---


    // // --- Beginning of Performance Goal ---

    // --- End of Bias Emotion & Specific Words ---
  };

  render() {
    const { t } = this.props;
    const { timePresentedData, speakingPacePerMinData } = this.state;
    return (
      <Container
        className="custom-dashboard-container"
        header={
          <Header
            variant="h2"
            description="Speaking pace compared to time presented"
          >
            {t("presentation.metrics.pace.title")}
          </Header>
        }
     // --- Line Charts Cards for Speaking Pace Line & Time Presented ---
      >
        <LineChart
          series={[
            {
              title: "Time Presented",
              type: "line",
              data: timePresentedData,
            },
            {
              title: "Speaking Pace",
              type: "line",
              data: speakingPacePerMinData,
            }
          ]}
           // --- X Axis/Domain---
          xDomain={
            timePresentedData && timePresentedData.length > 1
              ? [
                  timePresentedData[0].x,
                  timePresentedData[timePresentedData.length - 1].x,
                ]
              : [new Date(), new Date()]
          }
          // --- Y Axis/Domain for Speaking Pace ---
          yDomain={[0, 400]}
          i18nStrings={{
            filterLabel: "Filter displayed data",
            filterPlaceholder: "Filter data",
            filterSelectedAriaLabel: "selected",
            detailPopoverDismissAriaLabel: "Dismiss",
            legendAriaLabel: "Legend",
            chartAriaRoleDescription: "line chart",
            xTickFormatter: (e) =>
              e
                .toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: 1,
                })
                .split(",")
                .join("\n"),
            
            yTickFormatter: function o(e) {
              return e.toFixed(0);
            },
          }}
          // --- Titling & Others on the Card ---
          ariaLabel="Multiple data series line chart"
          errorText="Error loading data."
          height={300}
          loadingText="Loading chart"
          recoveryText="Retry"
          xScaleType="time"
          xTitle="Time (UTC)"
          yTitle="Words per Minute"
          empty={
            <Box textAlign="center" color="inherit">
              <b>{t("presentation.metrics.dashboard.noDataAvailable")}</b>
              <Box variant="p" color="inherit">
                {t("presentation.metrics.dashboard.noData")}
              </Box>
            </Box>
          }
          noMatch={
            <Box textAlign="center" color="inherit">
              <b>{t("presentation.metrics.dashboard.noMatch")}</b>
              <Box variant="p" color="inherit">
                {t("presentation.metrics.dashboard.noData")}
              </Box>
              <Button>{t("presentation.metrics.dashboard.clearFilter")}</Button>
            </Box>
          }
        />
      </Container>
    );
  }
}
