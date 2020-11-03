# Send commits to Jira

A Github Action that takes a Github push event, parses the commits and sends them to Jira one by one.

# Usage

```yaml
- uses: worksome/send-commits-to-jira@1.0.0
  with:
    commits: ${{ toJson(github.event.commits) }}
    jira-webhook: https://automation.atlassian.com/pro/hooks/token
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
