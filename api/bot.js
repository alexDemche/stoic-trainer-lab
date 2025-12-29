import { Telegraf, Markup } from 'telegraf';

const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

// ОНОВЛЕНО: Посилання на твій новий хаб на Vercel
const webAppLink = "https://stoic-trainer-lab.vercel.app/"; 

// --- ТЕКСТИ ---
const mainMenuText = "<b>Вітаю у Stoic Trainer Lab 🏛️</b>\n\nТвій простір для тренування спокою та стійкості. Оберіть практику в нашому додатку:";

const helpText = `
<b>🏛️ Stoic Trainer Lab — твій інструментарій спокою</b>

Ми зібрали науково обґрунтовані та стоїчні практики для контролю твого стану:

<b>🧘 Квадратне дихання (Box Breathing)</b>
Ритм 4-4-4-4, який використовують спецпризначенці для миттєвого зниження стресу. Допомагає повернути фокус за 60 секунд.

<b>🌙 Sleep Shuffler (Когнітивне перемішування)</b>
Техніка «зламу» мозку для швидкого засинання. Вона вимикає потік тривожних думок, змушуючи мозок перемикатися на випадкові образи.

<b>💎 Чому це працює?</b>
Всі практики базуються на біології та когнітивній психології. Вони допомагають розділити те, що ми можемо контролювати, від усього іншого.

<b>🚀 Як почати?</b>
Натисніть <b>«Відкрити Stoic Lab»</b> та оберіть потрібний режим.
`;

// --- КЛАВІАТУРИ (Inline) ---

const getMainMenu = () => Markup.inlineKeyboard([
  // Головна кнопка тепер веде в загальний хаб
  [Markup.button.webApp('🏛️ Відкрити Stoic Lab', webAppLink)], 
  [Markup.button.callback('📖 Про методики', 'help_action')],
  // Зв'язок з головним ментором
  [Markup.button.url('🧠 Stoic Trainer (365 уроків)', 'https://t.me/StoicTrainer_ua_bot')]
]);

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
    return res.status(200).send('Stoic Trainer Lab Bot Active');
  } catch (err) {
    console.error('Помилка:', err);
    return res.status(200).json({ error: err.message });
  }
}