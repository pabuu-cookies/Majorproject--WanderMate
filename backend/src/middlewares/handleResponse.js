function handleResponse(req, res, next){
    console.log(`✌${req.originalUrl}✌`)
    const results = res.locals.responseData;

    if (results === undefined) {
        return res.status(404).json({ error: 'Data not found' });
    }

    if (results.error) {
        
        return res.status(500).json({ error: results.error });
    }

    return res.status(200).json(results);
}

module.exports = handleResponse;