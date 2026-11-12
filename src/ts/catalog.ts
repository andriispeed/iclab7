// Типізовані посилання дозволяють TypeScript перевіряти властивості полів.
const search = document.querySelector<HTMLInputElement>('#search-input')!;
const minimum = document.querySelector<HTMLInputElement>('#budget-min')!;
const maximum = document.querySelector<HTMLInputElement>('#budget-max')!;
const deadline = document.querySelector<HTMLInputElement>('#deadline')!;
const categories = document.querySelectorAll<HTMLInputElement>('[name="category"]');
const cards = document.querySelectorAll<HTMLElement>('.tender-card');
const count = document.querySelector<HTMLElement>('#result-count')!;
const empty = document.querySelector<HTMLElement>('#empty-results')!;

function filterTenders(): void {
  const query: string = search.value.trim().toLocaleLowerCase('uk');
  const shortQuery: boolean = query.length > 0 && query.length < 3;
  const category = document.querySelector<HTMLInputElement>('[name="category"]:checked')!.value;
  const min: number = minimum.value === '' ? 0 : minimum.valueAsNumber;
  const max: number = maximum.value === '' ? Infinity : maximum.valueAsNumber;
  const invalidBudget = !minimum.validity.valid || !maximum.validity.valid || min > max;
  let visible: number = 0;

  cards.forEach((card) => {
    const budget: number = Number(card.dataset.budget);
    const matches: boolean = !invalidBudget
      && (shortQuery || (card.dataset.search ?? '').toLocaleLowerCase('uk').includes(query))
      && (category === 'all' || card.dataset.category === category)
      && budget >= min && budget <= max
      && (!deadline.value || (card.dataset.deadline ?? '') <= deadline.value);

    card.hidden = !matches;
    if (matches) visible++;
  });

  count.textContent = invalidBudget
    ? 'Вкажіть невід’ємний бюджет: «від» має бути не більше «до».'
    : shortQuery
      ? 'Введіть щонайменше 3 символи для пошуку. Зараз застосовано лише фільтри.'
      : `Знайдено: ${visible} з ${cards.length}`;
  empty.hidden = visible > 0 || invalidBudget;
}

[search, minimum, maximum, deadline].forEach((input) => {
  input.addEventListener('input', filterTenders);
});
categories.forEach((input) => input.addEventListener('change', filterTenders));
document.querySelector<HTMLFormElement>('#search-form')!.addEventListener('submit', (event) => {
  event.preventDefault();
  filterTenders();
});
document.querySelector<HTMLButtonElement>('#reset-filters')!.addEventListener('click', () => {
  [search, minimum, maximum, deadline].forEach((input) => { input.value = ''; });
  categories.forEach((input) => { input.checked = input.value === 'all'; });
  filterTenders();
});

filterTenders();
