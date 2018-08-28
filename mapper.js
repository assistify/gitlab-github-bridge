module.exports = (owner, repo) => {
    const statusMapping = {
        created: 'queued',
        running: 'in_progress',
        success: 'completed'
    }
    
    const conclusionMapping = {
        success: 'success',
        failed: 'failure'
    }

    function mapCheckRunInfo(gitlabJob) {
        const checkRunInfo = {
            owner,
            repo,
            name: gitlabJob.build_name,
            head_sha: gitlabJob.sha,
            details_url: gitlabJob.repository.git_http_url.replace(/\.git$/, '') + '/-/jobs/' + gitlabJob.build_id,
            external_id: '' + gitlabJob.build_id,
            status: statusMapping[gitlabJob.build_status],
            started_at: new Date(gitlabJob.build_started_at).toISOString(),
            actions: [],
            output: { title: gitlabJob.build_status, summary: gitlabJob.build_status }
        }
        if (checkRunInfo.status === 'completed') {
            checkRunInfo['conclusion'] = conclusionMapping[gitlabJob.build_status]
            checkRunInfo['completed_at'] = new Date(gitlabJob.build_finished_at).toISOString()
        }
        return checkRunInfo
    }
    
    return { mapCheckRunInfo }
}
