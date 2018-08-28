module.exports = ({port}) => {
    const express = require('express')
    const bodyParser = require('body-parser')
    
    const app = express()
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    
    const handlers = {}

    app.all('*', async (req, res) => {
        try {
            if (handlers[req.body.object_kind]) {
                handlers[req.body.object_kind]({name: req.body.object_kind, payload: req.body})
                res.send('ok')
            }
        } catch (e) {
            console.error(e)
            res.status(500).send('Error: ' + e)    
        }    
    })

    app.listen(port, () => console.log('Service listening on port', port))

    return {
        on: (eventName, handler) => handlers[eventName] = handler
    }
}
