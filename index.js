require('dotenv').config({ path: __dirname + '/.env' })
const puppeteer = require('puppeteer')

if ((process.env.TELEGRAM_TOKEN) && (process.env.CHAT_ID)) {
    const Telegram = require('telegram-notify')
    let notify = new Telegram({ token: process.env.TELEGRAM_TOKEN, chatId: process.env.CHAT_ID })
}

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

const start = async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()

    console.log(`[...] Sedang membuka halaman login`)
    await page.goto(`${process.env.MOODLE_BASEURL}/${process.env.ATTENDANCE_PATH}`, {
        waitUntil: ['domcontentloaded', 'networkidle0']
    }).catch(() => {
        console.log('[ x ] Sesi timeout, silahkan coba lagi')
        browser.close()
    })

    const attendance = (page) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`[...] Sedang mengisikan Username dan Password`)

                await page.waitForSelector('input#username')
                await page.type('input#username', process.env.MOODLE_USERNAME)

                await page.waitForSelector('input#password')
                await page.type('input#password', process.env.MOODLE_PASSWORD)

                await page.click('button#loginbtn')
                await page.waitForNavigation()

                await Promise.all([
                    page.evaluate(() => {
                        return document.querySelector('.alert.alert-danger')
                    })
                ]).then(async (check) => {
                    if (check[0] != null) {
                        console.log(`[ x ] Gagal masuk ke Akun`)
                        resolve()
                    } else {
                        console.log(`[ + ] Berhasil masuk ke Akun`)

                        await page.waitForSelector('div.logininfo > a[title="View profile"]')
                        const name = await page.evaluate(() => {
                            return document.querySelector('div.logininfo > a[title="View profile"]').textContent
                        })
                        console.log(`[ + ] Masuk sebagai ${name}`)

                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'networkidle0' }),
                            page.click('.attwidth tr td a')
                        ]).then(async () => {
                            await page.waitForSelector('label.fitem input')
                            await page.evaluate(() => {
                                document.querySelector('label.fitem input').click()
                            })

                            await page.click('input[type="submit"]')
                            await page.waitForNavigation()

                            await Promise.all([
                                page.evaluate(() => {
                                    return document.querySelector('.alert.alert-info')
                                })
                            ]).then(() => {
                                if ((process.env.TELEGRAM_TOKEN) && (process.env.CHAT_ID)) {
                                    let message = `Laporan Presensi Elearning\n\nAkun: ${name}\nTanggal : ${moment().format('DD MMMM YYYY HH:mm')}\nPesan: Berhasil Menghadiri Presensi`
                                    notify.send(message)
                                }

                                console.log('[ + ] Sukses menghadiri presensi')
                                resolve()
                            }).catch(() => {
                                if ((process.env.TELEGRAM_TOKEN) && (process.env.CHAT_ID)) {
                                    let message = `Laporan Presensi Elearning\n\nAkun: ${name}\nTanggal : ${moment().format('DD MMMM YYYY HH:mm')}\nPesan: Gagal Menghadiri Presensi`
                                    notify.send(message)
                                }

                                console.log('[ x ] Gagal menghadiri presensi')
                                resolve()
                            })
                        }).catch(() => {
                            console.log('[ x ] Presensi sudah dihadirkan sebelumnya')
                            resolve()
                        })
                    }
                }).catch(err => reject(err))
            } catch (e) {
                return reject(e)
            }
        })
    }

    await attendance(page)
        .then(() => {
            browser.close()
        })
        .catch((err) => {
            console.error(err)
            browser.close()
        })
}

start().catch(console.error)
