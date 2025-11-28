// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { Component, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { getCurrentUser } from 'aws-amplify/auth';
import "./Home.js";
import "@cloudscape-design/global-styles/index.css";
import Overview from "../charts/overview";
import ValueOverChart from "../charts/valuecharts";
import TrendsStatus from "../charts/trendstatus";
import PaceValues from "../charts/pacingvalues";

import {
  SideNavigation,
  Table,
  AppLayout,
  Header,
  Grid,
} from "@cloudscape-design/components";

//Consts for SideBar Items - will be created dynamically with translations
const createNavItems = (t) => [
  {
    type: "section",
    text: t('navigation.menu.history'),
    defaultExpanded: true,
    onNavigationChange: true,
    items: [
      { type: "link", text: t('metrics.dashboard.trendDashboard'), href: "/Metrics" },
      { type: "link", text: t('navigation.menu.history'), href: "/my-presentations" },
      { type: "divider" }
    ],
  },
];

//Cards Functions being called and putting into a grid
function ChartCards(props) {
  return (
    <Grid
      gridDefinition={[
        { colspan: { l: 8, m: 8, default: 7 } },
        { colspan: { l: 4, m: 4, default: 5 } },
        { colspan: { l: 6, m: 6, default: 6 } },
        { colspan: { l: 6, m: 6, default: 6 } },
      ]}
    >
      <Overview />
      <TrendsStatus loadHelpPanelContent={props.loadHelpPanelContent} />
      <ValueOverChart />
      <PaceValues t={props.t}/>
    </Grid>
  );
}

//Const/defining and pulling metrics from DB to display
const columnDefinitions = [];

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currenPageIndex: 0,
    };
  }

  componentDidMount() {
    getCurrentUser().then((data) => {
      this.setState({ subId: data.attributes.sub });
    });
  }

  render() {
    // Create a wrapper component to use hooks in class component
    const { t } = this.props;

    return (
      //Pagination Item
      <Table
        items={this.props.presentations}
        columnDefinitions={columnDefinitions}
        variant="full-page"
        //Black Box Section
        header={<Header variant="awsui-h1-sticky">{t('presentation.metrics.dashboard.trendDashboard')}</Header>}
        stickyHeader={true}
        empty={
          <div>
            <ChartCards t={t} />
          </div>
        }
      />
    );
  }
}

export default function History() {
  const { t } = useTranslation();
  const [state, setState] = useState({
    searchValue: "",
    presentations: [],
    currentUser: "",
  });

  const navItems = createNavItems(t);

  return (
    //Top Navigation Stuff
    <>
      <AppLayout
        toolsHide
        headerSelector="#header"
        ariaLabels={{ navigationClose: t('navigation.modal.closeMenu') }}
        navigation={<SideNavigation activeHref="/Metrics" items={navItems} />}
        contentType="table"
        content={<Content presentations={state.presentations} t={t} />}
      />
    </>
  );
}
