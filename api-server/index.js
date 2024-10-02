import express from 'express';
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { generateSlug } from "random-word-slugs";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 9000;

const ecsClient = new ECSClient({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});

const config = {
    CLUSTER: process.env.CLUSTER_NAME,
    TASK: process.env.TASK,
    SUBNETA: process.env.SUBNET_A,
    SUBNETB: process.env.SUBNET_B,
    SUBNETC: process.env.SUBNET_C,
    SECURITYGROUP: process.env.SECURITY_GROUP,
    BUILDER_NAME: process.env.BUILDER_IMAGE,
};

const DOMAIN_PATH = process.env.DOMAIN;

app.use(express.json());

app.post('/project', async (req, res) => {
    const { gitUrl } = req.body;

    if (!gitUrl) {
        return res.status(400).json({ error: 'Missing git URL' });
    }

    // Basic validation for GitHub URL
    if (!gitUrl.startsWith('http://') && !gitUrl.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid git URL: must start with http:// or https://' });
    }
    
    if (!gitUrl.includes('github.com')) {
        return res.status(400).json({ error: 'Invalid git URL: must be a GitHub repository URL' });
    }

    const projectSlug = generateSlug();

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: [config.SUBNETA, config.SUBNETB, config.SUBNETC],
                securityGroups: [config.SECURITYGROUP]
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: config.BUILDER_NAME,
                    environment: [
                        {
                            name: 'GIT_REPOSITORY__URL',
                            value: gitUrl,
                        },
                        {
                            name: 'PROJECT_ID',
                            value: projectSlug,
                        }
                    ]
                }
            ]
        }
    });

    await ecsClient.send(command);
    return res.json({ status: 'queued', data: { projectSlug, url: `http://${projectSlug}.${DOMAIN_PATH}` } });
});

app.listen(PORT, () => console.log(`API Server is Running in Port ${PORT}`));
