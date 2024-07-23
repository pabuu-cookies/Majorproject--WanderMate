module.exports = {
    NOT_FOUND: {
        statusCode: 404,
        message: 'Data not found',
    },
    ALREADY_PRESENT:{
        statusCode: 409, 
        message: 'Data already exists',
    },
    INVALID_CREDENTIALS: {
        statusCode: 401,
        message: 'Invalid email or password',
    },
    BAD_REQUEST: {
        statusCode: 400,
        message: 'Bad request',
    },
    OK:{
        statusCode: 200,
        message:'Request Sucessfully'
    },
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: 'Internal server error',
    },
};