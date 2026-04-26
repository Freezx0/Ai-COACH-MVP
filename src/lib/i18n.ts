import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Transactions": "Transactions",
      "Goals": "Goals",
      "Insights": "Insights",
      "Predictions": "Predictions",
      "SME Analytics": "SME Analytics",
      "Premium": "Premium",
      "Settings": "Settings",
      "Log Out": "Log Out",
      "Total Balance": "Total Balance",
      "Monthly Income": "Monthly Income",
      "Monthly Expenses": "Monthly Expenses",
      "Recent Transactions": "Recent Transactions",
      "View All": "View All",
      "Add Transaction": "Add Transaction",
      "Add Goal": "Add Goal",
      "Upcoming Bills": "Upcoming Bills",
      "Upgrade to": "Upgrade to",
      "Take full control": "Take full control of your finances with advanced AI calculations, exclusive educational video content, and unlimited tracking.",
      "Monthly": "Monthly",
      "Yearly": "Yearly",
      "Subscribe Now": "Subscribe Now",
      "Processing...": "Processing...",
      "What's included?": "What's included?",
      "Deep Financial Calculation & AI Analytics": "Deep Financial Calculation & AI Analytics",
      "Exclusive Video Tutorials & Guides": "Exclusive Video Tutorials & Guides",
      "Unlimited Goals & Transactions": "Unlimited Goals & Transactions",
      "Early Access to New Features": "Early Access to New Features",
      "Language": "Language",
      "Select Language": "Select your preferred language"
    }
  },
  ru: {
    translation: {
      "Dashboard": "Главная",
      "Transactions": "Транзакции",
      "Goals": "Цели",
      "Insights": "Аналитика",
      "Predictions": "Прогнозы",
      "SME Analytics": "Бизнес-аналитика",
      "Premium": "Премиум",
      "Settings": "Настройки",
      "Log Out": "Выйти",
      "Total Balance": "Общий баланс",
      "Monthly Income": "Доход за месяц",
      "Monthly Expenses": "Расходы за месяц",
      "Recent Transactions": "Последние транзакции",
      "View All": "Смотреть все",
      "Add Transaction": "Добавить операцию",
      "Add Goal": "Добавить цель",
      "Upcoming Bills": "Ближайшие счета",
      "Upgrade to": "Перейти на",
      "Take full control": "Возьмите под полный контроль свои финансы с помощью продвинутых ИИ-вычислений, эксклюзивных видео-уроков и безлимитного трекинга.",
      "Monthly": "Ежемесячно",
      "Yearly": "Ежегодно",
      "Subscribe Now": "Подписаться",
      "Processing...": "Обработка...",
      "What's included?": "Что включено?",
      "Deep Financial Calculation & AI Analytics": "Глубокие финансовые расчеты и ИИ-аналитика",
      "Exclusive Video Tutorials & Guides": "Эксклюзивные видеоуроки и руководства",
      "Unlimited Goals & Transactions": "Неограниченные цели и транзакции",
      "Early Access to New Features": "Ранний доступ к новым функциях",
      "Language": "Язык",
      "Select Language": "Выберите язык"
    }
  },
  uz: {
    translation: {
      "Dashboard": "Asosiy",
      "Transactions": "Tranzaksiyalar",
      "Goals": "Maqsadlar",
      "Insights": "Tahlillar",
      "Predictions": "Bashoratlar",
      "SME Analytics": "Biznes analitikasi",
      "Premium": "Premium",
      "Settings": "Sozlamalar",
      "Log Out": "Chiqish",
      "Total Balance": "Umumiy balans",
      "Monthly Income": "Oylik daromad",
      "Monthly Expenses": "Oylik xarajatlar",
      "Recent Transactions": "So'nggi tranzaksiyalar",
      "View All": "Barchasi",
      "Add Transaction": "Tranzaksiya qo'shish",
      "Add Goal": "Maqsad qo'shish",
      "Upcoming Bills": "Kelgusi to'lovlar",
      "Upgrade to": "O'tish",
      "Take full control": "Ilg'or sun'iy intellekt hisob-kitoblari, eksklyuziv ta'lim videolari va cheksiz kuzatuvlar yordamida moliyangizni to'liq nazorat qiling.",
      "Monthly": "Oylik",
      "Yearly": "Yillik",
      "Subscribe Now": "Obuna bo'lish",
      "Processing...": "Jarayonda...",
      "What's included?": "Nimalar kiritilgan?",
      "Deep Financial Calculation & AI Analytics": "Chuqur moliyaviy hisob-kitoblar va AI tahlili",
      "Exclusive Video Tutorials & Guides": "Eksklyuziv video darsliklar va qo'llanmalar",
      "Unlimited Goals & Transactions": "Cheksiz maqsadlar va tranzaksiyalar",
      "Early Access to New Features": "Yangi funksiyalarga erta kirish",
      "Language": "Til",
      "Select Language": "Tilni tanlang"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
