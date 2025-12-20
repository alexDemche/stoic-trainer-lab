import { Telegraf } from 'telegraf';

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('ПОМИЛКА: BOT_TOKEN не знайдено!');
}

const bot = new Telegraf(token);

// Текст для команди /help
const helpMessage = `
<b>🧘 Що таке Метод Квадратного дихання?</b>

Це техніка 4-4-4-4, де кожна фаза триває 4 секунди.
1. <b>Вдих</b> — наповнення.
2. <b>Затримка</b> — засвоєння.
3. <b>Видих</b> — розслаблення.
4. <b>Затримка</b> — точка спокою.

<b>🚀 Як користуватися?</b>
Натисніть кнопку меню, оберіть час та потік.
`;

bot.start((ctx) => ctx.reply('Вітаю у Breath Flow!'));
bot.help((ctx) => ctx.replyWithHTML(helpMessage));

// В ES Modules використовуємо export default замість module.exports
export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ status: 'ok' });
    }
    return res.status(200).send('Бекенд активний (ES Modules).');
  } catch (err) {
    console.error('Помилка бота:', err);
    return res.status(200).json({ error: err.message });
  }
}