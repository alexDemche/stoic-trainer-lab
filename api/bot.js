import { Telegraf, Markup } from 'telegraf';

const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

// Твоє посилання на Vercel (Web App)
const webAppLink = "https://breath-flow-app.vercel.app";

const helpMessage = `
<b>🧘 Як користуватися Breath Flow?</b>

1. Натисніть кнопку <b>«Запустити потік»</b>.
2. Оберіть настрій та час сесії.
3. Слідуйте за колом та дихайте синхронно.

<i>Квадратне дихання — це твій ключ до спокою за 5 хвилин.</i>
`;

// Головне меню при старті
bot.start((ctx) => {
  return ctx.replyWithHTML(
    `Привіт, ${ctx.from.first_name}! 👋\n\nГотовий до ментального перезавантаження?`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Запустити потік', webAppLink)]
    ])
  );
});

// Довідка з кнопками
bot.help((ctx) => {
  return ctx.replyWithHTML(
    helpMessage,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🧘 Почати дихати', webAppLink)],
      [Markup.button.url('✍️ Написати відгук', 'https://t.me/erick_demche')]
    ])
  );
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ status: 'ok' });
    }
    return res.status(200).send('Бекенд активний з меню!');
  } catch (err) {
    console.error('Помилка бота:', err);
    return res.status(200).json({ error: err.message });
  }
}