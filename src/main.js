const core = require('@actions/core');
const axios = require('axios');


(async function main() {
    const instanceName = core.getInput('instance-name', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: true });
    const pass = core.getInput('devops-integration-user-pass', { required: true });

    let artifacts = core.getInput('artifacts', { required: true });
    
    try {
        artifacts = JSON.parse(artifacts);
    } catch (e) {
        core.setFailed(`Failed parsing artifacts ${e}`);
        return;
    }

    let githubContext = core.getInput('context-github', { required: true });

    try {
        githubContext = JSON.parse(githubContext);
    } catch (e) {
        core.setFailed(`Exception parsing github context ${e}`);
    }

    const endpoint = `https://${username}:${pass}@${instanceName}.service-now.com/api/sn_devops/v1/devops/tool/orchestration?toolId=${toolId}`;
   
    let payload;
   
    try {
        payload = {
            'artifacts': artifacts,
            'pipelineName': `${githubContext.repository}/${githubContext.workflow}`,
            'stageName': `${githubContext.job}`,
            'taskExecutionNumber': `${githubContext.run_number}`
        };
        console.log("paylaod to register artifact: " + JSON.stringify(payload));
    } catch (e) {
        core.setFailed(`Exception setting the payload to register artifact ${e}`);
        return;
    }

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    let snowResponse;

    try {
        let httpHeaders = { headers: defaultHeaders };
        snowResponse = await axios.post(endpoint, JSON.stringify(payload), httpHeaders);
        console.log("ServiceNow Status: " + snowResponse.status + "; Response: " + JSON.stringify(snowResponse.data));
    } catch (e) {
        core.setFailed(`Exception POSTing payload to register artifact : ${e}\n\n${JSON.stringify(payload)}\n\n${e.toJSON}`);
    }
    
})();