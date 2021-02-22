require('dotenv').config({ path: __dirname + '/../.env' })

const puppeteer = require('puppeteer')
const attendance = require('./middleware/attendance')
const moment = require('moment-timezone')

moment.tz.setDefault('Asia/Jakarta').locale('id')

const start = async () => {

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()

    console.log('[ ~ ] Sedang membuka halaman login')

    await page.goto(process.env.MOODLE_BASEURL + '/' + process.env.ATTENDANCE_PATH, {
        waitUntil: ['domcontentloaded', 'networkidle0']
    }).catch(() => {
        console.log('[ x ] Sesi timeout, silahkan coba lagi')
        browser.close()
    })

    await attendance(page)
        .then(() => {
            browser.close()
        })
        .catch((err) => {
            console.error(err)
            browser.close()
        })

}

start()