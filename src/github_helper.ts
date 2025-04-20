import { Octokit } from "@octokit/rest";
import { getOctokitOptions } from "@actions/github/lib/utils.js";

export function getOctokit(auth_token?: string) {
    let options = {};
    if (auth_token) {
        options = getOctokitOptions(auth_token, options);
    }
    return new Octokit(options);
}

export async function getAllReleaseVersions(octokit: Octokit, owner: string, repo: string,): Promise<Array<string>> {
    const response = await octokit.rest.repos.listReleases({
        owner: owner,
        repo: repo
    });
    if (response.status != 200) {
        throw new Error(`Could not list releases for repo '${repo}' by the owner '${owner}'! Response status was ${response.status}...`,);
    }
    let res = Array<string>()
    const re = new RegExp('^Ghidra_([0-9\.]+)_build$');
    response.data.forEach(release => {
        let matches = release.tag_name.match(re);
        if (matches != null)
            res.push(matches[1]);
    });    
    return res;
}
