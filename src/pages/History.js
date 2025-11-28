// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import React, { Component, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { listPresentations } from "../graphql/queries";
//import { API, graphqlOperation, Auth } from "aws-amplify";
import { getCurrentUser } from 'aws-amplify/auth';
import "./Home.js";
import "@cloudscape-design/global-styles/index.css";
import Metrics from "./Metrics";

import {
  TopNavigation,
  SideNavigation,
  Button,
  BreadcrumbGroup,
  Table,
  Input,
  AppLayout,
  Header,
  Container as PolContainer,
  ColumnLayout,
  Popover,
  Box,
  StatusIndicator,
  SpaceBetween,
  Select,
  Modal,
  Flashbar,
  Icon,
  Alert,
  Cards,
  Pagination,
  CollectionPreferences,
} from "@cloudscape-design/components";
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '../amplifyconfiguration.json';
Amplify.configure(config);

const client = generateClient();

let userEmail = null;

//Consts for SideBar Items - will be created dynamically with translations
const createNavItems = (t) => [
  {
    type: "section",
    text: t('navigation.menu.history'),
    defaultExpanded: true,
    onNavigationChange: true,
    items: [
      { type: "link", text: t('presentation.metrics.dashboard.trendDashboard'), href: "/metrics" },
      { type: "link", text: t('navigation.menu.history'), href: "/my-presentations" },
      { type: "divider" }
    ],
  },
];

//Const/defining and pulling metrics from DB to display - will be created dynamically with translations
const createColumnDefinitions = (t) => [
  {
    id: "PresentationTime",
    cell: (item) =>
      item.PresentationTime < 60
        ? `${item.PresentationTime} sec presentation on ${new Date(
            item.createdAt.split("T")[0]
          ).toDateString()}`
        : item.PresentationTime >= 60
        ? `${
            (item.PresentationTime / 60).toString().split(".")[0]
          } min  ${Math.ceil(
            (item.PresentationTime * ((item.PresentationTime / 60) % 1.0)) /
              (item.PresentationTime / 60)
          )} sec presentation on ${new Date(
            item.createdAt.split("T")[0]
          ).toDateString()}`
        : null,
    header: t('presentation.content.title'),
    minWidth: 100,
  },
  {
    id: "FilleWords",
    header: t('history.metrics.fillerWords'),
    cell: (item) => item.FillerWords,
    minWidth: 100,
  },
  {
    id: "WeaselWords",
    header: t('history.metrics.weaselWords'),
    cell: (item) => item.WeaselWords,
    minWidth: 100,
  },
  {
    id: "BiasEmotionSpecificWords",
    header: t('history.metrics.biasEmotionSpecificWords'),
    cell: (item) => item.BiasEmotionSpecificWords,
    minWidth: 100,
  },
  {
    id: "EyeContact",
    header: t('history.metrics.eyeContact'),
    cell: (item) => item.EyeContact,
    minWidth: 100,
  },
  {
    id: "SpeakingPacePerMin",
    header: t('history.metrics.speakingPacePerMin'),
    cell: (item) => item.SpeakingPacePerMin,
    minWidth: 100,
  },
];

function Content(props) {
  const { t } = useTranslation();
  const [subId, setSubId] = useState("");
  const [currenPageIndex, setCurrentPageIndex] = useState(1);

  useEffect(() => {
    getCurrentUser().then((data) => {
      if (data && data.attributes) {
        setSubId(data.attributes.sub);
        userEmail = data.attributes.email;
      }
    }).catch(error => {
      console.error('Error fetching user in Content:', error);
    });
  }, []);

  const columnDefinitions = createColumnDefinitions(t);

  return (
    //Pagination Item
    <Table
      items={props.presentations}
      columnDefinitions={columnDefinitions}
      variant="full-page"
      pagination={
        <Pagination
          ariaLabels={{
            nextPageLabel: t('navigation.pagination.nextPage'),
            previousPageLabel: t('navigation.pagination.previousPage'),
            pageLabel: (pageNumber) => t('navigation.pagination.pageLabel', { pageNumber }),
          }}
          currentPageIndex={currenPageIndex}
          onChange={({ detail }) =>
            setCurrentPageIndex(detail.currentPageIndex)
          }
          pagesCount={5}
        />
      }
      //Black Box Section
      header={
        <Header
          variant="awsui-h1-sticky"
          counter={`(${props.presentations.length})`}
        >
          {t('history.content.title')}
        </Header>
      }
      stickyHeader={true}
      empty={
        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
          <SpaceBetween size="xxs">
            <div>
              <b>{t('history.status.noPresentation')}</b>
              <Box variant="p" color="inherit">
                {t('history.status.noPresentations')}
              </Box>
            </div>
          </SpaceBetween>
        </Box>
      }
    />
  );
}

export default function History() {
  const { t } = useTranslation();
  const [state, setState] = useState({
    searchValue: "",
    presentations: [],
    currentUser: "",
  });

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user && user.attributes && user.attributes.email) {
        const currentUser = user.attributes.email.split("@")[0];
        setState(prev => ({ ...prev, currentUser }));
        return currentUser;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
    return null;
  };

  const fetchAllPresentations = async (currentUser) => {
    try {
      const presentationData = await client.graphql({query: listPresentations})
      const presentationList = presentationData.data.listPresentations.items;
      const filteredPresentationsByOwner = presentationList.filter(
        (presentation) => presentation.owner == currentUser
      );
      setState(prev => ({ ...prev, presentations: filteredPresentationsByOwner }));
    } catch (error) {
      console.error('Error fetching presentations:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        await fetchAllPresentations(currentUser);
      }
    };
    initializeData();
  }, []);

  const navItems = createNavItems(t);

  return (
    <>
      <AppLayout
        toolsHide
        headerSelector="#header"
        ariaLabels={{ navigationClose: t('navigation.modal.closeMenu') }}
        navigation={<SideNavigation activeHref="/my-presentations" items={navItems} />}
        contentType="table"
        content={<Content presentations={state.presentations} />}
      />
    </>
  );
}
