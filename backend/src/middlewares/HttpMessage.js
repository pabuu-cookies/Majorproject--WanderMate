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
    UNAUTHORIZED: {
        statusCode: 401,
        message: 'Unauthorized access',
    },
    BAD_REQUEST: {
        statusCode: 400,
        message: 'Bad request',
    },
    FORBIDDEN:{
        statusCode: 403,
        message:'Forbidden Request'
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