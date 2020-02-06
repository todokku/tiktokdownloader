const tiktok = require('tiktok-scraper')
const http = require('http')
const fs = require('fs')
const os = require('os')
const chalk = require('chalk')
const readline = require('readline')

var rl = readline.createInterface(process.stdin, process.stdout)
let uname

rl.setPrompt('.tiktokdownloader--\nenter tiktok username> ')
rl.prompt()
rl.on('line', (line) => {
    if (!line) process.exit(0)
    uname = line.trim()
    rl.removeAllListeners()
    rl.close()
    init()
})

function init() {
    rl.setPrompt(`.tiktokdownloader--\namount of videos to download (${uname})>`)
    rl.prompt()
    rl.on('line', function (line) {
        if (parseInt(line) <= 100) {
            tiktokdownload(line)
            rl.close()
        } else {
            console.log(chalk.magenta('max is 100'))
            rl.prompt()
        }
    }).on('close', function () {
        rl.removeAllListeners()
    })
}

function tiktokdownload(max) {
    if (parseInt(max) > 100) {
        console.log(chalk.red('max number of videos is 100 :)'))
        return
    }
    console.log(chalk.blue('gathering data from tiktok...'))

    let options = {
        number: parseInt(max),
        event: true
    }
    let vids = []
    let posts = tiktok.user(uname, options)
    let dir

    fs.mkdir(`${os.homedir()}\\Downloads\\.tiktokdownloader`, { recursive: true }, (err) => {
        if (err) throw err
        dir = `${os.homedir()}\\Downloads\\.tiktokdownloader`
    })

    posts.on('data', (json) => {
        vids.push(json)
    })

    posts.on('done', () => {
        for (let vid in vids) {

            const file = fs.createWriteStream(`${dir}\\${vids[vid].id}.mp4`)
            const request = http.get(vids[vid].videoUrl.replace('https://', 'http://'), function (res) {
                res.pipe(file)
                console.log(chalk.blue(`downloaded tiktok video ${parseInt(vid) + 1} of ${parseInt(vids.length)}`))

                if (parseInt(vid) + 1 == parseInt(vids.length)) {
                    console.log(chalk.yellow('saved to your downloads directory'))
                    console.log(chalk.yellow('exiting in 5 seconds'))
                    setTimeout(() => {
                        console.log('exiting...!')
                        process.exit(0)
                    }, 5000)
                }
            })
        }
    })
}