import * as core from '@actions/core';
import fetch from 'node-fetch';

async function run(): Promise<void> {
    try {
        const jiraWebhook: string = core.getInput('jira-webhook');

        core.setOutput('raw-commits', core.getInput('commits'));
        core.debug(core.getInput('commits'));

        const commits: Array<string> = JSON.parse(core.getInput('commits'));

        core.setOutput('parsed-commits', commits);
        core.debug(JSON.stringify(commits));

        if (!isValidHttpUrl(jiraWebhook)) {
            core.setFailed('The provided Jira webhook URL wasn\'t valid.');
        }

        const isJiraKey = (jiraKey: string | null): jiraKey is string => jiraKey !== null

        let issueKeys: string[] = [...new Set<string>(
            commits
                .flatMap((commit: string): RegExpMatchArray | null => getJiraIssueKey(commit))
                .filter(isJiraKey)
                .map((jiraKey: string): string => jiraKey.toUpperCase())
        )];

        core.info(`Found ${issueKeys.length} issue keys in ${commits.length} commits.`)

        core.setOutput('jira-issue-keys', issueKeys);
        core.debug(JSON.stringify(issueKeys));

        issueKeys.forEach((issue: string) => {
            sendRequestToJira(jiraWebhook, issue);
        })
    } catch (error: any) {
        core.error(error);

        if (error instanceof Error) core.setFailed(error.message);
    }
}

function isValidHttpUrl(string: string): boolean {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
}

function getJiraIssueKey(commit: string | null): RegExpMatchArray | null {
    if (typeof commit !== 'undefined' && commit !== null) {
        return commit.match(/JIRA-\d+/i);
    }

    return null;
}

function sendRequestToJira(jiraWebhookUrl: string, jiraIssue: string) {
    core.debug(`Sending ticket to Jira: ${jiraIssue}`);

    fetch(jiraWebhookUrl, {
        method: 'POST',
        body: JSON.stringify({
            issues: [jiraIssue],
            body: jiraIssue
        })
    }).catch(
        error => core.error(error)
    );
}

run();
