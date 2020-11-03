const core = require("@actions/core");
const fetch = require("node-fetch");

async function run() {
    try {
        const jiraWebhook = core.getInput("jira-webhook");
        const commits = JSON.parse(core.getInput("commits"));

        if(!isValidHttpUrl(jiraWebhook)) {
            core.setFailed("The provided Jira webhook URL wasn't valid.");
        }

        let issueKeys = [...new Set(commits.flatMap((commit) => getJiraIssueKey(commit)).filter((jiraKey) => jiraKey !== null).map((jiraKey) => jiraKey.toUpperCase()))];

        issueKeys.forEach((issue) => {
            sendRequestToJira(jiraWebhook, issue);
        })

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

function getJiraIssueKey(commit) {
    let commitMsg = commit.message;
    return commitMsg.match(/JIRA-\d+/i);
}

function sendRequestToJira(jiraWebhookUrl, jiraIssue) {
    core.info(jiraIssue);
    fetch(jiraWebhookUrl, {
        method : "POST",
        body: JSON.stringify({"issues":[jiraIssue],"body":jiraIssue})
    }).catch(
        error => core.error(error)
    );
}

run();
