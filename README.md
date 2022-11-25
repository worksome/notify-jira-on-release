# Send commits to Jira

A GitHub Action that takes a GitHub push event, parses the commits and sends them to Jira one by one.

# Usage

```yaml
- uses: worksome/send-commits-to-jira@v5
  with:
    commits: ${{ toJson(github.event.commits) }}
    jira-webhook: https://automation.atlassian.com/pro/hooks/token
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
