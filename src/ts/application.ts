import { proposalAmounts } from './calculator';

interface Application {
  tenderId: string;
  company: string;
  email: string;
  comment: string;
  prices: number[];
  vatRate: number;
  totalCents: number;
  submittedAt: string;
}

const form = document.querySelector<HTMLFormElement>('#application-form')!;
const company = document.querySelector<HTMLInputElement>('#company-name')!;
const email = document.querySelector<HTMLInputElement>('#contact-email')!;
const comment = document.querySelector<HTMLInputElement>('#application-comment')!;
const confirmation = document.querySelector<HTMLInputElement>('#confirm-application')!;
const status = document.querySelector<HTMLElement>('#application-status')!;
const remove = document.querySelector<HTMLButtonElement>('#delete-application')!;
const prices = [...document.querySelectorAll<HTMLInputElement>('.item-price')];
const vatRate = document.querySelector<HTMLInputElement>('#vat-rate')!;
const tenderId = form.dataset.tenderId!;
const storageKey = `tenderpro:application:${tenderId}`;

function showReceipt(application: Application): void {
  form.hidden = true;
  remove.hidden = false;
  const amount = (application.totalCents / 100).toLocaleString('uk-UA', {
    style: 'currency', currency: 'UAH',
  });
  status.textContent = `Тестову заявку на ${application.tenderId} збережено. Компанія: ${application.company}. Email: ${application.email}. Сума з ПДВ: ${amount}. Дата: ${new Date(application.submittedAt).toLocaleString('uk-UA')}. Подальші зміни калькулятора не змінюють збережену заявку.`;
}

// Окремий ключ для кожного тендеру: заявки не перезаписують одна одну.
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const application = JSON.parse(saved) as Application;
    if (application.tenderId !== tenderId || typeof application.company !== 'string'
      || typeof application.email !== 'string' || !Number.isSafeInteger(application.totalCents)
      || application.totalCents <= 0 || !Number.isFinite(Date.parse(application.submittedAt))) {
      throw new Error('Invalid saved application');
    }
    showReceipt(application);
  }
} catch {
  status.textContent = 'Не вдалося прочитати локальну заявку. Можна видалити її та спробувати знову.';
  remove.hidden = false;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (!company.value.trim()) {
    status.textContent = 'Вкажіть назву компанії, а не лише пробіли.';
    company.focus();
    return;
  }
  if (Date.now() >= Date.parse(form.dataset.deadline!)) {
    status.textContent = 'Строк прийому заявок на цей тендер завершився.';
    return;
  }
  const invalidPrice = [...prices, vatRate].find(input => !input.value || !input.validity.valid);
  if (invalidPrice) {
    status.textContent = 'Заповніть усі ціни додатними числами з точністю до копійок і вкажіть ПДВ від 0 до 100%.';
    invalidPrice.focus();
    return;
  }
  try {
    if (localStorage.getItem(storageKey)) {
      status.textContent = 'Заявка на цей тендер уже існує. Перезавантажте сторінку для перегляду.';
      return;
    }
    const application: Application = {
      tenderId, company: company.value.trim(), email: email.value.trim(),
      comment: comment.value.trim(), prices: prices.map(input => input.valueAsNumber),
      vatRate: vatRate.valueAsNumber, totalCents: proposalAmounts().total,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(application));
    showReceipt(application);
  } catch {
    status.textContent = 'Не вдалося зберегти заявку в браузері. Дані форми залишилися — спробуйте ще раз.';
  }
});

// Після зміни цін користувач має повторно підтвердити пропозицію.
const calculator = document.querySelector<HTMLFormElement>('#proposal-calculator')!;
calculator.addEventListener('input', () => { confirmation.checked = false; });
calculator.addEventListener('reset', () => { confirmation.checked = false; });
remove.addEventListener('click', () => {
  try {
    localStorage.removeItem(storageKey);
    form.reset();
    form.hidden = false;
    remove.hidden = true;
    status.textContent = 'Локальну заявку видалено. Можна повторити демонстрацію.';
  } catch {
    status.textContent = 'Не вдалося видалити локальну заявку. Спробуйте ще раз.';
  }
});
