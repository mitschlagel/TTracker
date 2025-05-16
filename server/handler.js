const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'ttracker-outages';
const TIMER_ID = 'last-reset';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

module.exports.getLastReset = async (event) => {
    try {
        const result = await dynamodb.get({
            TableName: TABLE_NAME,
            Key: {
                id: TIMER_ID
            }
        }).promise();

        const timestamp = result.Item ? result.Item.timestamp : new Date().toISOString();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                timestamp
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
        const timestamp = new Date().toISOString();
        
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: {
                id: TIMER_ID,
                timestamp
            }
        }).promise();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                timestamp
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