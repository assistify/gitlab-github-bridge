module.exports = ({agent, app_id, installation_id, pem}) => {
    const jwt = require('jsonwebtoken')

    async function authenticate() {
        const now = Math.floor(+new Date() / 1000)
        const payload = {
            iat: now,
            exp: now + 10 * 60,
            iss: app_id
        }
    
        const jwtToken = jwt.sign(payload, pem, { algorithm: 'RS256' })
        octokit.authenticate({ type: 'app', token: jwtToken })
        const { data: { token } } = await octokit.apps.createInstallationToken({ installation_id })
        octokit.authenticate({ type: 'token', token })
    }

    const octokit = require('@octokit/rest')({
        timeout: 0,
        headers: {
            accept: 'application/vnd.github.v3+json',
            'user-agent': 'dbs-gitlab-ci-status'
        },
        baseUrl: 'https://api.github.com',
        agent,
        debug: true
    })

    return {
        checks: {
            create: async checkRunInfo => {
                await authenticate()
                octokit.checks.create(checkRunInfo)
            }
        }
    }
}
