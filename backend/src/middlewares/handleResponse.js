function handleResponse(req, res, next){
    console.log(`✌${req.originalUrl}✌`);
    console.log(res.locals.responseData);
    const results = res.locals.responseData;

    if (results === undefined) {
        return res.status(404).json({ error: 'Data not found' });
    }

    if (results.error) {
        console.log(results);
        return res.status(results.error.statusCode).json({ error: results.error.message });
    }

    return res.status(200).json(results);
}

module.exports = handleResponse;