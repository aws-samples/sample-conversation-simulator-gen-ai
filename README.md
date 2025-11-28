
<h1 align="center">
  <br>
  Gen AI Conversation Simulator
  <br>
</h1>


<!--BEGIN STABILITY BANNER-->

<h4 align="center">A web application built on AWS that coaches users to deliver productive conversations to customers</a>.</h4>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#setup">Setup</a> •
  <a href="#build">Build</a> •
  <a href="#deploy">Deploy</a> •
  <a href="#cleanup">Cleanup</a> •
</p>

![Stability: Experimental](https://img.shields.io/badge/stability-Experimental-important.svg?style=for-the-badge)

> **This is an experimental example. It may not build out of the box**
>
> This examples is built on an Amplify project marked "Experimental" and may not be updated for latest breaking changes.
>
> It additionally requires infrastructure prerequisites that must be created before successful build.
>
> If build is unsuccessful, please create an [issue](https://github.com/aws-samples/aws-cdk-examples/issues/new) so that we may debug the problem 

---
<!--END STABILITY BANNER-->

## Overview

The Gen AI Conversation Simulator is a versatile tool that leverages Amazon Bedrock and Polly to create interactive, voice-enabled conversation simulations. It serves as a practical starting point for developers looking to implement AI-driven dialogue systems for various applications, including call center training, interview preparation, and employee onboarding. By providing a working example of how to integrate AWS services for natural conversational interactions, this solution helps developers quickly build and customize their own conversation-based applications.

![alt text](./presentation-assets/AmazonActor.drawio.png)

Before deploying this application, you will need to install the [Amplify CLI](https://docs.amplify.aws/cli/start/install/) and the [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html).

Since this application builds and packages a Python Lambda function, you may also need to install [Python](https://www.python.org/downloads/), [virtualenv](https://virtualenv.pypa.io/en/stable/installation.html), and [pipenv](https://pipenv.pypa.io/en/latest/installation/).


## Setup
Clone the repo:

```bash
git clone https://github.com/aws-samples/sample-conversation-simulator-gen-ai.git
```

Change the bucket name in `amplify/backend/hosting/S3AndCloudFront/parameters.json` from `<S3-BUCKET-NAME>` to a name of your choosing according to the [S3 bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

Additionally, update the `python_version` variable in both `amplify/backend/function/getCreds/Pipfile` and `amplify/backend/function/getCreds/Pipfile.lock` to match your currently installed Python version. You can check your current python version using the following:

```bash
python -V
```

## Build

To build this app, you need to be in this project's root folder. Then run the following:

```bash
cd sample-conversation-simulator-gen-ai
npm install
amplify init
```

This will install the necessary JavaScript packages and bootstrap the Amplify environment for deployment.

## Deploy

Run `amplify publish`. This will deploy / redeploy your Amplify to your AWS Account.

After the deployment you will see the Amplify URL, which represents the url hosting the web app.

Happy presenting :)

## Custom Avatar Setup

The application supports custom avatar images and video clips for personalized conversation experiences. Follow these steps to add your own avatars:

### Adding Custom Avatar Images

1. Place your avatar image files (PNG format recommended) in the `src/img/` directory
2. Update `src/pages/AvatarDisplay.js`:
   - Import your avatar image: `import myAvatar from '../img/myavatar.png';`
   - Add a new option to the Select component options array:
     ```javascript
     { label: 'My Custom Avatar', value: "myavatar" }
     ```
   - Add a conditional render block for your avatar:
     ```javascript
     {!avatarReactionStart && avatarSelectedOption.value === "myavatar" && 
       <img
         style={{ width: "300px"}}
         src={myAvatar}
         alt={t('avatar.content.placeholder')}
       />}
     ```

### Adding Custom Avatar Video Clips

For animated avatar reactions, you can add video clips that respond to different emotions:

1. Create a folder for your avatar in `src/avatarVideo/` (e.g., `src/avatarVideo/myavatar/`)

2. Add MP4 video files for different emotions:
   - `AgreeNodding.mp4` - Agreeing/nodding reaction
   - `Happy.mp4` - Happy/positive reaction
   - `Hello.mp4` - Greeting reaction
   - `Idontknow.mp4` - Uncertain reaction
   - `Nice.mp4` - Approval reaction
   - `Ohhh.mp4` - Surprised reaction
   - `Okkk.mp4` - Acknowledgment reaction
   - `Normal.mp4` - Neutral/default state

3. Update `src/avatarVideo/videos.js`:
   - Import your video files:
     ```javascript
     import myAvatarHappy from "./myavatar/Happy.mp4"
     import myAvatarNormal from "./myavatar/Normal.mp4"
     // ... import other emotions
     ```
   
   - Create an emotion mapping function:
     ```javascript
     const myAvatar = avatarEmotion => {
       if(!avatarEmotion) return myAvatarNormal;
       else if(avatarEmotion.indexOf("happy") >= 0) return myAvatarHappy;
       else if(avatarEmotion.indexOf("hello") >= 0) return myAvatarHello;
       // ... add other emotion mappings
       else return myAvatarNormal;
     }
     ```
   
   - Update the `AvatarTemp` component's useEffect:
     ```javascript
     useEffect(() => {
       const videoElement = videoRef.current;
       if (videoElement) {
         let videoSource;
         if (alias === "myavatar") {
           videoSource = myAvatar(avatarEmotion);
         }
         // Add other avatar conditions here
         
         if (videoSource) {
           videoElement.src = videoSource;
         }
       }
     }, [avatarEmotion, alias]);
     ```

### Video Recording Tips

- Keep videos short (2-5 seconds) for smooth looping
- Use consistent lighting and background
- Record in landscape orientation
- Export as MP4 format with H.264 codec
- Recommended resolution: 720p or 1080p
- Consider using a green screen for easier background removal

## Cleanup

1. Run `amplify delete`. This will delete Amplify-deployed resources from your AWS Account, as well as your local `amplify` directory, which contains the CloudFormation templates for your AWS resources. If you wish to keep this directory, you can:

      a. Delete the [application from the Amplify console](https://repost.aws/knowledge-center/amplify-delete-application)

      b. Backup the project files in a place of your choosing

2. Confirm that the S3 bucket from the `Setup` step and Amplify deployment (`amplify-projectname-envname-12345-deployment`) bucket has been emptied and deleted in the [S3 console](https://s3.console.aws.amazon.com/s3/home?region=us-east-1).

3. Delete the `WellPresentedSTS` IAM role and `useTranscribeComprehend` IAM policy in the [IAM console](https://us-east-1.console.aws.amazon.com/iam/home#/home).

4. Empty the log groups associated with the Amplify project. Their names will be formatted as `/aws/lambda/amplify-proejctname-LogGroup-abcde1234`.
