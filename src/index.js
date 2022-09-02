const core = require("@actions/core");
const fetch = require("node-fetch");

async function run() {
    try {
        const jiraWebhook = core.getInput("jira-webhook");

        core.setOutput('raw-commits', core.getInput("commits"));
        core.debug(core.getInput("commits"));

        const commits = JSON.parse(core.getInput("commits"));

        core.setOutput('parsed-commits', commits);
        core.debug(commits);

        if(!isValidHttpUrl(jiraWebhook)) {
            core.setFailed("The provided Jira webhook URL wasn't valid.");
        }

        let issueKeys = [...new Set(commits.flatMap((commit) => getJiraIssueKey(commit)).filter((jiraKey) => jiraKey !== null).map((jiraKey) => jiraKey.toUpperCase()))];

        core.setOutput('jira-issue-keys', issueKeys);
        core.debug(issueKeys);

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
    if (typeof commit !== 'undefined') {
        return commit.match(/JIRA-\d+/i);
    }

    return null;
}

function sendRequestToJira(jiraWebhookUrl, jiraIssue) {
    core.debug(jiraIssue);
    fetch(jiraWebhookUrl, {
        method : "POST",
        body: JSON.stringify({"issues":[jiraIssue],"body":jiraIssue})
    }).catch(
        error => core.error(error)
    );
}

run();
