export interface GithubFilePayloadBlob {
    rawLines: Array<string>
}

export interface GithubFilePayload {
    blob: GithubFilePayloadBlob
}

export interface GithubFile {
    payload: GithubFilePayload
}