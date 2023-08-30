import { OUTBOUND_MAIL_COLLECTION } from "shared/firebase.js"
import { db } from "../index.js"
import fs from "fs/promises"
import { JSDOM } from "jsdom"


/**
 * @param {string | Array<string>} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 */
export async function sendEmail(to, subject, text, html) {
    await db.collection(OUTBOUND_MAIL_COLLECTION).add({
        to: Array.isArray(to) ? to : [to],
        message: {
            subject,
            text,
            html,
        },
    })
}


export async function sendEmailFromTemplate(to, templateName, data) {
    const subjectTemplate = await fs.readFile(`./mail-templates/${templateName}.subject.txt`, "utf-8")
    const htmlTemplate = await fs.readFile(`./mail-templates/${templateName}.html`, "utf-8")

    const subject = fillTemplate(subjectTemplate, data)
    const html = fillTemplate(htmlTemplate, data)
    const text = convertHTMLToText(html)

    return sendEmail(to, subject, text, html)
}


function fillTemplate(template, data) {
    return Object.keys(data).reduce((text, key) => {
        return text.replaceAll(new RegExp(`\\{\\{\\s+?\\$${key}\\s+?\\}\\}`, "g"), data[key])
    }, template)
}


function convertHTMLToText(html) {
    return new JSDOM(html).window.document.querySelector("body").textContent.trim()
}