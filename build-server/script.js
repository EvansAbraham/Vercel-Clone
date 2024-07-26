require('dotenv').config();

import { exec } from 'child_process';
import { join } from 'path';
import { readdirSync, lstatSync, createReadStream } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { lookup } from 'mime-types';


const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    }
})

const PROJECT_ID = process.env.PROJECT_ID;

async function init(){
    console.log('Executing the script.js using Docker!')
    const outDirPath = join(__dirname, 'output')

    const commandExecution = exec(`cd ${outDirPath} && npm install && npm run build`)

    commandExecution.stdout.on('data', function (data){
        console.log(data.toString())
    })
    
    commandExecution.stdout.on('error', function (data){
        console.log('Error', data.toString())
    })

    commandExecution.on('close', async function(){
        console.log('Build Complete!')
        const distFolderPath = join(__dirname, 'output', 'dist')
        const distFolderContents = readdirSync(distFolderPath, {recursive: true})

        for (const filePath of distFolderContents){
            if (lstatSync(filePath).isDirectory()) continue;

            console.log('Uploading!', filePath)
        
            const command = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: `__outputs/${PROJECT_ID}/${filePath}`,
                Body: createReadStream(filePath),
                ContentType: lookup(filePath),
            })

            await s3Client.send(command)
            console.log('Uploaded!', filePath)
        }

        console.log('Done!')
    })
}

init()