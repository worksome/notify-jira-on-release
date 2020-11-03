const core = require("@actions/core");
const fetch = require("node-fetch");

async function run() {
    try {
        const jiraWebhook = core.getInput("jira-webhook");
        const commits = JSON.parse(core.getInput("commits"));

        if(!isValidHttpUrl(jiraWebhook)) {
            core.setFailed("The provided Jira webhook URL wasn't valid.");
        }

        commits.forEach((commit) => {
            sendRequestToJira(jiraWebhook, commit);
        });
    } catch (error) {
        core.error(error);
        core.setFailed(error.message);
    }
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

function sendRequestToJira(jiraWebhookUrl, commit) {
    let commitMsg = commit.message;
    let jiraIssue = commitMsg.match(/JIRA-\d+/i);
    if (jiraIssue === null) {
        return;
    }
    core.info(jiraIssue);
    fetch(jiraWebhookUrl, {
        method : "POST",
        body: JSON.stringify({"issues":jiraIssue,"body":commit.message})
    }).catch(
        error => core.error(error)
    );
}

run();
