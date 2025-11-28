/*
Submit a rubric + small explanation
Parse the rubric as a pdf into its components
Create an example prompt for the initial conversation and an example prompt for the grading
Allow adjustment of the example prompts
Add the new prompt permanently to the user's scenarios (Allow deleting subsequently)

New button for add scenario? (Allows document + scenario summary)
*/


//WORK IN PROGRESS
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Input } from "@awsui/components-react"
import AWS from 'aws-sdk'
import { Auth } from 'aws-amplify';
import { TextractClient, StartDocumentTextDetectionCommand } from "@aws-sdk/client-textract"
import { Storage } from 'aws-amplify';
import fs from 'fs'
import { useTranslation } from "react-i18next";
import { commonParams } from '@aws-sdk/client-transcribe-streaming/dist-types/endpoint/EndpointParameters';

const s3 = new AWS.S3();



const ScenarioButton = ({ }) => {
    const { t } = useTranslation()
    const [selectedFile, setSelectedFile] = useState(null);
    const intro = useRef(null);
    const [open, setOpen] = useState(false)

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (selectedFile) {
            try {
                const result = await Storage.put(selectedFile.name, selectedFile, {
                    contentType: 'application/pdf',
                }).then((res) => {
                    extractDocument(res.key)
                });
                setOpen(false)
                console.log('File uploaded successfully. S3 Location:', result.key);
            } catch (error) {
                console.error('Error uploading file to S3:', error);
            }
        } else {
            console.warn('No file selected for upload.');
        }

    };
    //Extract data from the pdf and convert to digestable format
    const extractDocument = async (s3_path) => {
        const credentials = await Auth.currentCredentials();

        const client = new TextractClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken
            }});

        const params = {
            Document: {
                S3Object: {
                    Bucket: 'wellpresentedtool-umang3cb6495d16a64338922fc0c1devtwo-devtwo',
                    Name: s3_path,
                },
            },
            FeatureTypes: ['TABLES']
        };

        try {
            const command = new StartDocumentTextDetectionCommand(params);
            const result = await client.send(command);

            // Wait for the job to complete
            //await textract.waitFor('documentAnalysisCompleted', { JobId: jobId }).promise();

            // Get the results
            //const result = await textract.getDocumentAnalysis({ JobId: jobId }).promise();

            // Extract table data
            const tables = [];
            result.Blocks.forEach((block) => {
                if (block.BlockType === 'TABLE') {
                    const table = [];
                    block.Relationships.forEach((relationship) => {
                        relationship.Ids.forEach((childId) => {
                            if (result.Blocks[childId].BlockType === 'CELL') {
                                table.push(result.Blocks[childId].Text);
                            }
                        });
                    });
                    tables.push(table);
                }
            });
            console.log(tables)
            return tables;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    //Summarize the situation explanation and add stock rules -> Turn into intro prompt
    //Breakdown rubric into text format, add stock rules
    const createPrompt = (intro, doc_parse) => {

    }

    const handleOpen = () => {
        setOpen(true)
    }

    useEffect(() => {

        return () => {
        };
    });

    return (
        <div>
            <Button variant="primary" onClick={handleOpen}>{t("common.actions.text.add")}</Button>

            <Modal visible={open} onDismiss={() => { setOpen(false) }} header="New Scenario">
                <div>
                    <input type="file" variant="primary" onChange={handleFileChange} />
                    <Input placeholder="Describe your scenario"></Input>
                    <Button variant="primary" onClick={handleUpload}>{t("common.actions.text.upload")}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default ScenarioButton;
