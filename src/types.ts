export interface CSHUser {
    id: string;
    displayName: string;
    username: string;
    name: {
        familyName: string;
        givenName: string;
    };
    emails: {
        value: string;
    }[];
}

export interface Resume {
    id: string;
    author: string;
    filename: string;
    date: string;
    preview?: boolean;
}

export interface Comment {
    id: string;
    parent_id: string;
    author: string;
    body: string;
    date: string;
    children: Comment[];
}
