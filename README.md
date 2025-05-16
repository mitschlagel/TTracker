# T Environment Outage Tracker

A simple web application that tracks the time since the last outage in the T environment.

## Features
- Displays time since last outage in days, hours, and minutes
- Reset button with confirmation dialog
- Plays a "womp womp" sound when resetting
- Data persisted in AWS DynamoDB
- Static site hosted on AWS S3

## Prerequisites
- Node.js 18.x or later
- AWS account with configured credentials
- Serverless Framework CLI (`npm install -g serverless`)

## Deployment

1. Install dependencies:
```bash
npm install
```

2. Deploy the backend (Lambda functions and DynamoDB):
```bash
serverless deploy
```

3. Deploy the frontend to S3:
```bash
aws s3 sync public/ s3://ttracker-site/
```

4. Get the API Gateway URL from the serverless deploy output and update the fetch URLs in `public/index.html` accordingly.

5. Access your site at the S3 website endpoint (output from serverless deploy).

## Development

To run locally:
```bash
npm start
```

## Architecture
- Frontend: Static HTML/CSS/JS hosted on S3
- Backend: AWS Lambda functions with API Gateway
- Database: DynamoDB for storing the last reset timestamp
