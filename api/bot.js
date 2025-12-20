import { Telegraf, Markup } from 'telegraf';

const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

const webAppLink = "https://breath-flow-app.vercel.app";

// --- ТЕКСТИ ---
const mainMenuText = "<b>Вітаю у Breath Flow!</b> 👋\n\nОбери дію, щоб почати практику:";

const helpText = `
<b>🧘 Про метод Квадратного дихання (Box Breathing)</b>

Ця техніка — секретна зброя елітних підрозділів (наприклад, Navy SEALs) та професійних атлетів для збереження спокою в екстремальних умовах.

<b>⏱ Ритм 4-4-4-4 — це:</b>
1. <b>Вдих (4 сек)</b> — Наповнення крові киснем.
2. <b>Затримка (4 сек)</b> — Стабілізація тиску.
3. <b>Видих (4 сек)</b> — Сигнал мозку на розслаблення через блукаючий нерв.
4. <b>Затримка (4 сек)</b> — Точка глибокого ментального спокою.

<b>💎 Що це дає?</b>
• Миттєве зниження рівня кортизолу (гормону стресу).
• Повернення фокусу при "розумовому хаосі".
• Покращення сну та емоційної стабільності.

<b>🚀 Як почати?</b>
Просто натисніть <b>«Почати дихати»</b>, оберіть час сесії та потік, який відповідає вашому запиту (Любов, Гроші, Енергія чи Спокій).
`;

// --- КЛАВІАТУРИ (Inline) ---

// Головне меню
const getMainMenu = () => Markup.inlineKeyboard([
  [Markup.button.webApp('🧘 Почати дихати', webAppLink)], 
  [Markup.button.callback('📖 Як це працює?', 'help_action')] // Тільки одна кнопка знизу
]);

// Кнопка "Назад"
const getBackMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('🔙 Назад в меню', 'back_to_menu')]
]);

// --- ЛОГІКА БОТА ---

bot.start((ctx) => {
  return ctx.replyWithHTML(mainMenuText, getMainMenu());
});

bot.help((ctx) => {
  return ctx.replyWithHTML(helpText, getMainMenu());
});

// --- ACTIONS ---

// Натиснули "Як це працює?"
bot.action('help_action', async (ctx) => {
  try {
    await ctx.editMessageText(helpText, {
      parse_mode: 'HTML',
      ...getBackMenu()
    });
    await ctx.answerCbQuery();
  } catch (e) {
    console.error(e);
  }
});

// Натиснули "Назад"
bot.action('back_to_menu', async (ctx) => {
  try {
    await ctx.editMessageText(mainMenuText, {
      parse_mode: 'HTML',
      ...getMainMenu()
    });
    await ctx.answerCbQuery();
  } catch (e) {
    console.error(e);
  }
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ status: 'ok' });
    }
    return res.status(200).send('Breath Flow Bot Active');
  } catch (err) {
    console.error('Помилка:', err);
    return res.status(200).json({ error: err.message });
  }
}