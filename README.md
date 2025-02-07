[![CI](https://github.com/antoniovazquezblanco/setup-ghidra-update/actions/workflows/main.yml/badge.svg)](https://github.com/antoniovazquezblanco/setup-ghidra-update/actions/workflows/main.yml)

# setup-ghidra-update

This action tries to update the target version of your [setup-ghidra](https://github.com/antoniovazquezblanco/setup-ghidra) action.

This is useful when you try to explicitly support multiple Ghidra target versions.


## Usage

TODO

**Reference:**

For a full reference of action parameters see [action.yml](action.yml)

```yaml
- uses: antoniovazquezblanco/setup-ghidra@v2
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
