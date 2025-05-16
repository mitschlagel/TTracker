const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'ttracker-outages';
const TIMER_ID = 'last-reset';
const RECORD_ID = 'record-time';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

async function getRecord() {
    const result = await dynamodb.get({
        TableName: TABLE_NAME,
        Key: {
            id: RECORD_ID
        }
    }).promise();
    return result.Item ? result.Item.duration : 0;
}

async function updateRecord(currentDuration) {
    const record = await getRecord();
    if (currentDuration > record) {
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: {
                id: RECORD_ID,
                duration: currentDuration
            }
        }).promise();
        return currentDuration;
    }
    return record;
}

module.exports.getLastReset = async (event) => {
    try {
        const result = await dynamodb.get({
            TableName: TABLE_NAME,
            Key: {
                id: TIMER_ID
            }
        }).promise();

        const record = await getRecord();
        const timestamp = result.Item ? result.Item.timestamp : new Date().toISOString();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                timestamp,
                record
            })
        };
    } catch (error) {
        console.error('Error getting last reset time:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to get last reset time' })
        };
    }
};

module.exports.reset = async (event) => {
    try {
        // Get the previous reset time
        const previousResult = await dynamodb.get({
            TableName: TABLE_NAME,
            Key: {
                id: TIMER_ID
            }
        }).promise();

        const now = new Date();
        const timestamp = now.toISOString();

        // If there was a previous reset, calculate duration and update record
        if (previousResult.Item) {
            const previousTime = new Date(previousResult.Item.timestamp);
            const duration = now - previousTime;
            await updateRecord(duration);
        }
        
        // Set new reset time
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: {
                id: TIMER_ID,
                timestamp
            }
        }).promise();

        const record = await getRecord();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                timestamp,
                record
            })
        };
    } catch (error) {
        console.error('Error resetting timer:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to reset timer' })
        };
    }
}; 