const { Telegraf } = require('telegraf');

// Перевірка наявності токена перед ініціалізацією
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('ПОМИЛКА: BOT_TOKEN не знайдено в Environment Variables!');
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply('Вітаю! Я працюю на Vercel!'));
bot.help((ctx) => ctx.reply('Це довідка Breath Flow. Натисніть "Дихати" у меню.'));

module.exports = async (req, res) => {
  try {
    // Додаємо логування вхідного запиту для діагностики
    console.log('Вхідний запит:', req.body);

    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ status: 'ok' });
    }
    
    return res.status(200).send('Бекенд бота активний. Чекаю на POST від Telegram.');
  } catch (err) {
    console.error('Критична помилка виконання:', err);
    // Повертаємо 200 навіть при помилці, щоб Telegram не "закидав" нас повторними запитами
    return res.status(200).json({ error: err.message });
  }
};