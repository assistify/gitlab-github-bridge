const EventSource = require('eventsource')
const superagent = require('superagent')

module.exports = ({ port, eventSource, agent, proxy }) => {
    const WebhooksApi = require('@octokit/webhooks')
    const webhooks = new WebhooksApi({ secret: process.env.GITHUB_WEBHOOK_SECRET })

    require('http').createServer(webhooks.middleware).listen(port)

    const events = new EventSource(eventSource, {proxy})
    events.reconnectInterval = 0

    events.addEventListener('message', (msg) => {
        const data = JSON.parse(msg.data)
        const req = superagent.agent(agent).post('http://localhost:' + port).send(data.body)
        delete data.body

        Object.keys(data).forEach(key => {
            req.set(key, data[key])
        })

        req.end((err, res) => {
            if (err) {
                console.error(err)
            } else {
                console.info(`${req.method} ${req.url} - ${res.statusCode}`)
            }
        })
    })
    events.addEventListener('open', console.info)
    events.addEventListener('error', console.error)

    return webhooks
}
