const form = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expenseList');
const filterCategory = document.getElementById('filterCategory');
const emptyState = document.getElementById('emptyState');

let expenses = [];
try {
  expenses = JSON.parse(localStorage.getItem('studentExpenses') || '[]');
} catch {
  expenses = [];
}

const today = new Date();
dateInput.value = formatDateInput(today);

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

function saveExpenses() {
  localStorage.setItem('studentExpenses', JSON.stringify(expenses));
}

function render() {
  const selectedCategory = filterCategory.value;
  const visibleExpenses = expenses
    .filter(expense => selectedCategory === 'All' || expense.category === selectedCategory)
    .sort((a, b) => b.date.localeCompare(a.date));

  expenseList.innerHTML = '';
  visibleExpenses.forEach(expense => {
    const row = document.createElement('tr');

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = expense.description;

    const categoryCell = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = 'category-pill';
    pill.textContent = expense.category;
    categoryCell.appendChild(pill);

    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(`${expense.date}T00:00:00`).toLocaleDateString('en-IN');

    const amountCell = document.createElement('td');
    amountCell.className = 'amount';
    amountCell.textContent = money(expense.amount);

    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${expense.description}`);
    deleteButton.addEventListener('click', () => {
      expenses = expenses.filter(item => item.id !== expense.id);
      saveExpenses();
      render();
    });
    actionCell.appendChild(deleteButton);

    row.append(descriptionCell, categoryCell, dateCell, amountCell, actionCell);
    expenseList.appendChild(row);
  });

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonth = expenses
    .filter(expense => expense.date.slice(0, 7) === formatDateInput(today).slice(0, 7))
    .reduce((sum, expense) => sum + expense.amount, 0);

  document.getElementById('totalAmount').textContent = money(total);
  document.getElementById('monthAmount').textContent = money(thisMonth);
  document.getElementById('transactionCount').textContent = expenses.length;
  emptyState.hidden = visibleExpenses.length > 0;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  if (!description || !Number.isFinite(amount) || amount <= 0 || !dateInput.value) {
    alert('Please enter a description, a valid amount, and a date.');
    return;
  }

  expenses.push({
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    description,
    amount,
    category: categoryInput.value,
    date: dateInput.value
  });

  saveExpenses();
  form.reset();
  dateInput.value = formatDateInput(new Date());
  render();
  descriptionInput.focus();
});

filterCategory.addEventListener('change', render);
document.getElementById('clearAll').addEventListener('click', () => {
  if (expenses.length && confirm('Delete all expenses? This cannot be undone.')) {
    expenses = [];
    saveExpenses();
    render();
  }
});

render();
