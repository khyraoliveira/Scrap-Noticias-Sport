const axios = require('axios');
const cheerio = require('cheerio');
const { Resend } = require('resend');

const resend = new Resend('re_6AUz1kb5_NymifF4h1WFBWGwjcKG7dGW2');

async function scrapeData() {
    try {
        const url = 'https://ge.globo.com/pe/futebol/times/sport/';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const news = [];

        $('.bastian-feed-item').each((index, element) => {
            const title = $(element).find('h2 a p').text();
            const link = $(element).find('h2 a').attr('href');
            const imageUrl = $(element).find('img').attr('src');
            const time = $(element).find('.feed-post-datetime').text();
            const section = $(element).find('.feed-post-metadata-section').text().trim();

            news.push({ title, link, imageUrl, time, section });
        });

        console.log('Notícias coletadas:', news);

        if (news.length > 0) {
            await sendEmail(news);
        } else {
            console.log('Nenhuma notícia encontrada para enviar.');
        }
    } catch (error) {
        console.error('Erro ao fazer o scrape:', error);
    }
}

async function sendEmail(news) {
    const newsList = news.map(item => {
        return `<li>
            <strong>${item.title}</strong><br>
            <a href="${item.link}">Leia mais</a><br>
            <img src="${item.imageUrl}" alt="${item.title}" style="max-width:100%;"><br>
            <small>${item.time} - ${item.section}</small>
        </li>`;
    }).join('');

    const htmlContent = `
        <h1>Últimas Notícias</h1>
        <ul>
            ${newsList}
        </ul>
    `;

    try {
        const response = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'khyrak@gmail.com',
            subject: 'Últimas Notícias do Sport',
            html: htmlContent
        });
        console.log('E-mail enviado com sucesso!', response);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}

scrapeData();
