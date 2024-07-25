const { exec } = require('child_process')
const path = require('path')

async function init(){
    console.log('Executing the script.js using Docker!')
    const outDirPath = path.join(__dirname, 'output')
}