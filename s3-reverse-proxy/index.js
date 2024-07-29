import express from 'express';
import httpProxy from 'http-proxy'
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const PORT = 8000

const BASEPATH = process.env.BASE_PATH

const proxy = httpProxy.createProxy()

app.use((req, res) => {
    const hostname = req.hostname;
    const subDomain = hostname.split('.')[0];

    const resolveTo = `${BASEPATH}/${subDomain}`;

    return proxy.web(req, res, { target: resolveTo, changeOrigin: true })
})

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html'
})

app.listen(PORT, () => console.log(`Reverse Proxy is Running in Port ${PORT}`))