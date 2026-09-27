const config: {
    disable_ssl: string;
    port: string;
    db: {
        name: string;
        username: string;
        password: string;
    };
    s3: {
        accessKeyId: string;
        secretAccessKey: string;
        url: string;
        bucket: string;
    };
    auth: {
        client_id: string;
        client_secret: string;
        callback_url: string;
        session_secret: string;
    };
    admins: string[];
    email: {
        host: string;
        port: number;
        username: string;
        password: string;
     };
    slackWebhookURL: string;
} = {
    disable_ssl: process.env.DISABLE_SSL || "",
    port: process.env.PORT || '4200',

    db: {
        name: process.env.DB_NAME || "",
        username: process.env.DB_USERNAME || "",
        password: process.env.DB_PASSWORD || "",
    },

    s3: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        url: process.env.S3_URL || 'https://s3.csh.rit.edu',
        bucket: process.env.S3_BUCKET || 'ram_resumes',
    },

    auth: {
        client_id: process.env.OIDC_CLIENT_ID || "",
        client_secret: process.env.OIDC_CLIENT_SECRET || "",
        callback_url: process.env.OIDC_CALLBACK_URL || "",
        session_secret: process.env.OIDC_SESSION_SECRET || "",
    },

    admins: process.env?.ADMINS?.split(' ') || [], // get space delimited admin list

    email: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT || 0),
        username: process.env.SMTP_USERNAME || "",
        password: process.env.SMTP_PASSWORD || "",
    },

    slackWebhookURL: process.env.SLACK_WEBHOOK_URL || ""
};


export default config
