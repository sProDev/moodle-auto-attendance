const Telegram = require('telegram-notify')
const moment = require('moment-timezone')

const telegram = new Telegram({
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.CHAT_ID
})

module.exports = attendance = (page) => {
    return new Promise(async (resolve, reject) => {

        try {

            console.log('[ ~ ] Sedang mengisikan Username dan Password')

            await page.waitForSelector('input#username')
            await page.type('input#username', process.env.MOODLE_USERNAME)

            await page.waitForSelector('input#password')
            await page.type('input#password', process.env.MOODLE_PASSWORD)

            await page.click('button#loginbtn')
            await page.waitForSelector('.usermenu')

            await Promise.all([
                page.evaluate(() => {
                    return document.querySelector('.alert.alert-danger')
                })
            ]).then(async (check) => {

                if (check[0] != null) {
                    console.log('[ x ] Gagal masuk ke Akun')
                    resolve(true)
                } else {

                    console.log('[ + ] Berhasil masuk ke Akun')

                    await page.waitForSelector('div.logininfo > a[title="View profile"]')
                    const name = await page.evaluate(() => {
                        return document.querySelector('div.logininfo > a[title="View profile"]').textContent

                    })
                    console.log('[ + ] Masuk sebagai ' + name)

                    await Promise.all([
                        page.waitForSelector('.attwidth tr td a'),
                        page.click('.attwidth tr td a')
                    ]).then(async () => {

                        await page.waitForSelector('label.fitem input')
                        await page.evaluate(() => {
                            document.querySelector('label.fitem input').click()
                        })

                        await page.click('input[type="submit"]')
                        await page.waitForSelector('#region-main-box')

                        await Promise.all([
                            page.evaluate(() => {
                                return document.querySelector('.alert.alert-info')
                            })
                        ]).then(async () => {

                            if (process.env.TELEGRAM_TOKEN && process.env.CHAT_ID) {
                                let message = 'Laporan Presensi Elearning\n\nAkun: ' + name + '\nTanggal : ' + moment().format('DD MMMM YYYY HH:mm') + '\nPesan: Berhasil Menghadiri Presensi'

                                await telegram.send(message)
                            }

                            console.log('[ + ] Sukses menghadiri presensi')
                            resolve(true)

                        }).catch(async (error) => {

                            if (process.env.TELEGRAM_TOKEN && process.env.CHAT_ID) {
                                let message = 'Laporan Presensi Elearning\n\nAkun: ' + name + '\nTanggal : ' + moment().format('DD MMMM YYYY HH:mm') + '\nPesan: Gagal Menghadiri Presensi'

                                await telegram.send(message)
                            }

                            console.log('[ x ] Gagal menghadiri presensi')
                            resolve(false)

                        })

                    }).catch((error) => {
                        console.log('[ x ] Presensi sudah dihadirkan sebelumnya')
                        resolve(false)
                    })

                }

            }).catch(error => reject(error))

        } catch (error) {
            reject(error)
        }

    })
}