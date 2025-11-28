import { AmplifyProjectInfo, AmplifyRootStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyRootStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
  // Add AI Services permissions to the Cognito authenticated role
  const authRole = resources.authRole;
  
  const aiServicesPolicy = {
    PolicyName: 'AIServicesPolicy',
    PolicyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'BedrockModelAccess',
          Effect: 'Allow',
          Action: [
            'bedrock:InvokeModel',
            'bedrock:InvokeModelWithResponseStream'
          ],
          Resource: [
            'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
            'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0',
            'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2:1'
          ]
        },
        {
          Sid: 'ComprehendAccess',
          Effect: 'Allow',
          Action: [
            'comprehend:DetectDominantLanguage',
            'comprehend:DetectEntities',
            'comprehend:DetectKeyPhrases',
            'comprehend:DetectSentiment',
            'comprehend:DetectSyntax'
          ],
          Resource: 'arn:aws:comprehend:us-east-1:*:*'
        },
        {
          Sid: 'PollyAccess',
          Effect: 'Allow',
          Action: [
            'polly:SynthesizeSpeech',
            'polly:DescribeVoices'
          ],
          Resource: '*',
          Condition: {
            StringEquals: {
              'aws:RequestedRegion': 'us-east-1'
            }
          }
        },
        {
          Sid: 'PollyLexiconAccess',
          Effect: 'Allow',
          Action: [
            'polly:ListLexicons',
            'polly:GetLexicon'
          ],
          Resource: 'arn:aws:polly:us-east-1:*:lexicon/*'
        },
        {
          Sid: 'TranscribeAccess',
          Effect: 'Allow',
          Action: [
            'transcribe:StartStreamTranscriptionWebSocket'
          ],
          Resource: '*',
          Condition: {
            StringEquals: {
              'aws:RequestedRegion': 'us-east-1'
            }
          }
        }
      ]
    }
  };

  // Use addPropertyOverride to add the policy to the auth role
  authRole.addPropertyOverride('Policies', [
    ...(Array.isArray(authRole.policies) ? authRole.policies : []),
    aiServicesPolicy
  ]);
}
