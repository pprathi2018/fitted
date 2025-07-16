import json
import logging
from mangum import Mangum
from app import app

logger = logging.getLogger()
logger.setLevel(logging.INFO)

handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    logger.info(f"Lambda function invoked with event type: {event.get('httpMethod', 'unknown')}")
    
    try:
        response = handler(event, context)
        logger.info(f"Response status: {response.get('statusCode')}")
        return response
    except Exception as e:
        logger.error(f"Error handling request: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }