[![CI](https://github.com/antoniovazquezblanco/setup-ghidra-update/actions/workflows/main.yml/badge.svg)](https://github.com/antoniovazquezblanco/setup-ghidra-update/actions/workflows/main.yml)
[![CodeQL](https://github.com/antoniovazquezblanco/setup-ghidra-update/actions/workflows/codeql.yml/badge.svg)](https://github.com/antoniovazquezblanco/setup-ghidra-update/actions/workflows/codeql.yml)

# setup-ghidra-update

This action tries to update the target version of your [setup-ghidra](https://github.com/antoniovazquezblanco/setup-ghidra) action.

This is useful when you try to explicitly support multiple Ghidra target versions.


## Usage

This action is designed to be used in combination with a pull request creation action in a repo that already has a workflow that uses the `setup-ghidra` action.

An example on how this may be used:
```yaml
name: Dependabot for setup-ghidra
on:
  schedule:
    - cron: '17 12 * * 6' # Run once a week

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot_build:
    if: ${{ github.actor == 'dependabot[bot]' }}
    runs-on: ubuntu-latest
    steps:
      # First update the workflow files...
      - name: Check and update Ghidra versions
        uses: antoniovazquezblanco/setup-ghidra-update@v0.0.1
        with:
          auth_token: ${{ secrets.GITHUB_TOKEN }}

      # If there are changes, create a PR automagically!
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v7
        with:
          add-paths: '.github/'
          branch: dependabot_setup_ghidra
          delete-branch: true
          title: 'Bump Ghidra version'
          labels: |
            dependencies
            github_actions
```

**Reference:**

For a full reference of action parameters see [action.yml](action.yml)

```yaml
- uses: antoniovazquezblanco/setup-ghidra-update@v0.0.1
  with:
    # The owner of the repository to look for Ghidra releases. By default, NSA
    # official user is used.
    owner: 'NationalSecurityAgency'

    # A repository on which to find releases. By default, NSA official repo
    # name is used.
    repository: 'ghidra'

    # Github authentication token to avoid API limiting.
    # This is optional.
    auth_token: ${{ secrets.GITHUB_TOKEN }}
```
