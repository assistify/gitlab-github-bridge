require('dotenv').config()
const HttpsProxyAgent = require('https-proxy-agent')
const { URL } = require('url')
const fs = require('fs')

const secretsDir = process.env.SECRETSDIR || '/mnt/secrets';
const pems = fs.readdirSync(secretsDir).filter(f => f.endsWith('.pem'))
if (!pems.length) {
    throw Error('No PEM file found in directory')
}
const pem = fs.readFileSync(secretsDir + '/' + pems[0])

const proxy = process.env.https_proxy || process.env.http_proxy
const agent = proxy ? new HttpsProxyAgent(proxy) : null

const githubListener = require('./github-listener')({port: process.env.GITHUB_PORT || 3000, eventSource: process.env.GITHUB_WEBHOOK_PROXY_URL, agent, proxy})
const gitlabListener = require('./gitlab-listener')({port: process.env.GITLAB_PORT || 3001})
const githubSender = require('./github-sender')({agent, app_id: process.env.GITHUB_APP_ID, installation_id: process.env.GITHUB_INST_ID, pem})
const mapper = require('./mapper')(process.env.GITHUB_OWNER, process.env.GITHUB_REPO)

githubListener.on('*', ({id, name, payload}) => {
    console.log(name, 'event received from github', payload)
})

gitlabListener.on('build', async ({payload}) => {
    console.log('Received gitlab message for build #' + payload.build_id + ' on ' + payload.project_name + ' with status ' + payload.build_status)
    await githubSender.checks.create(mapper.mapCheckRunInfo(payload))
})
