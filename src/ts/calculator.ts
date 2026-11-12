const prices = [...document.querySelectorAll<HTMLInputElement>('.item-price')];
const vatRate = document.querySelector<HTMLInputElement>('#vat-rate')!;
const total = document.querySelector<HTMLElement>('#proposal-total')!;
const calculator = document.querySelector<HTMLFormElement>('#proposal-calculator')!;

export function proposalAmounts(): { subtotal: number; vat: number; total: number } {
  const subtotal = prices.reduce((sum, input) =>
    sum + Math.round(Number(input.value) * 100) * Number(input.dataset.quantity), 0);
  const vat = Math.round(subtotal * vatRate.valueAsNumber / 100);
  return { subtotal, vat, total: subtotal + vat };
}

function calculateProposal(): void {
  if (![...prices, vatRate].every((input) => input.validity.valid)) {
    total.textContent = 'Ціни мають бути додатними, до 100 000 000 грн і з точністю до копійок. ПДВ — від 0 до 100%.';
    return;
  }

  // Рахуємо в копійках; порожні ціни для попереднього розрахунку дорівнюють нулю.
  const { subtotal, vat } = proposalAmounts();
  const money = (cents: number): string => (cents / 100).toLocaleString('uk-UA', {
    style: 'currency', currency: 'UAH',
  });
  total.textContent = `Без ПДВ: ${money(subtotal)}. ПДВ: ${money(vat)}. Разом: ${money(subtotal + vat)}.`;
}

calculator.addEventListener('input', calculateProposal);
calculator.addEventListener('submit', (event) => event.preventDefault());
// Подія reset виникає до того, як браузер відновить початкові значення.
calculator.addEventListener('reset', () => setTimeout(calculateProposal, 0));
calculateProposal();
