const form = document.querySelector('#email-form');
const noticeSelect = document.querySelector('#notice-type');
const customNoticeField = document.querySelector('.custom-notice');
const amount = document.querySelector('#amount');
const dateField = document.querySelector('.date-field');
const amountField = document.querySelector('.amount-field');
const preview = document.querySelector('#preview');
const emailCopy = document.querySelector('#email-copy');
const subjectCopy = document.querySelector('#subject-copy');
const subjectCopyMessage = document.querySelector('#subject-copy-message');
const bodyCopyMessage = document.querySelector('#body-copy-message');
const generatedButton = document.querySelector('#generate-email');
const formChanged = document.querySelector('#form-changed');
const formError = document.querySelector('#form-error');
const customNoticeInput = document.querySelector('#custom-notice');
const refundDate = document.querySelector('#refund-date');
const company = document.querySelector('#company');
let hasGenerated = false;

const templates = {
  refundInfo: { subject: 'Refund Information', fields: ['notice', 'quarter', 'company', 'date', 'amount'], body: ({ notice, quarter, company, date, amount }) => `Hello!\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nIn summary, this notice states that a refund in the amount of ${amount} was issued on ${date}, for the tax period above.\n\nIf you have further questions, please review this notice, which is password-protected with your company's EIN, in this format: XX-XXXXXXX\n\nThank you!` },
  refundIssued: { subject: 'Refund Issued Notice', fields: ['notice', 'quarter', 'company'], body: ({ notice, quarter, company }) => `Hello!\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nIn summary, this notice states that you will receive a refund within four to eight weeks unless other taxes or obligations are owed.\n\nIf you have further questions, please review this notice, which is password-protected with your company's EIN, in this format: XX-XXXXXXX\n\nThank you!` },
  claimsPackage: { subject: 'IRS Claims Package', fields: ['notice', 'quarter', 'company'], body: ({ notice, quarter, company }) => `Hello,\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nA copy of this notice has been attached to this email and is password protected with your company’s EIN, including the hyphen, in this format: XX-XXXXXXX.\n\nTo summarize, the notice states that the BFS (Bureau of Fiscal Service) is issuing a claims package that should include a photocopy of your refund check, a claim form, and instructions. The notice states that if you do not receive that package within 30 days, to contact the BFS directly.\n\nIf you have any questions, please do not hesitate to reach out to us.\n\nThank you!` },
  checkInfo: { subject: 'ERC Check Information', fields: ['notice', 'quarter', 'company'], body: ({ notice, quarter, company }) => `Hello,\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nA copy of this notice has been attached to this email and is password protected with your company’s EIN, including the hyphen, in this format: XX-XXXXXXX.\n\nTo summarize, the IRS is tracing your check.\n\nIf you have any questions, please do not hesitate to reach out to us.\n\nThank you!` }
};

function activeTemplate() { return templates[form.elements.template.value]; }
function formatCents(value) {
  const digits = value.replace(/\D/g, '');
  const number = Number(digits || '0') / 100;
  return number.toLocaleString('en-US', { style:'currency', currency:'USD' });
}
function formatDate(value) { if (!value) return ''; return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }); }
function updateConditionalFields() {
  const visibleFields = new Set(activeTemplate().fields);
  const needsDate = visibleFields.has('date');
  const needsAmount = visibleFields.has('amount');
  setVisibility(dateField, needsDate);
  setVisibility(amountField, needsAmount);
  refundDate.required = needsDate;
  amount.required = needsAmount;
  updateCustomNoticeField();
}

function setVisibility(element, isVisible) {
  element.hidden = !isVisible;
  element.classList.toggle('is-hidden', !isVisible);
  element.style.display = isVisible ? '' : 'none';
}

function updateCustomNoticeField() {
  const isCustom = noticeSelect.value === 'custom';
  setVisibility(customNoticeField, isCustom);
  customNoticeInput.required = isCustom;
}

function setFieldError(input, hasError) {
  input.closest('.field').classList.toggle('field-error', hasError);
  input.setAttribute('aria-invalid', String(hasError));
}

function validateVisibleFields() {
  const needsRefundDetails = activeTemplate().fields.includes('date');
  const validation = [
    [company, !company.value.trim()],
    [customNoticeInput, noticeSelect.value === 'custom' && !customNoticeInput.value.trim()],
    [refundDate, needsRefundDetails && !refundDate.value],
    [amount, needsRefundDetails && Number(amount.value.replace(/[^0-9]/g, '')) === 0]
  ];
  validation.forEach(([input, hasError]) => setFieldError(input, hasError));
  const hasErrors = validation.some(([, hasError]) => hasError);
  formError.hidden = !hasErrors;
  return !hasErrors;
}

noticeSelect.addEventListener('change', () => {
  updateCustomNoticeField();
});
form.addEventListener('change', event => {
  if (event.target.name === 'template') {
    updateConditionalFields();
    resetGeneratedEmail();
    return;
  }
  markChanged();
});
form.addEventListener('input', event => {
  if (event.target === amount) {
    amount.value = formatCents(amount.value);
    amount.setSelectionRange(amount.value.length, amount.value.length);
  }
  if (event.target.matches('input, select')) {
    event.target.closest('.field')?.classList.remove('field-error');
    event.target.removeAttribute('aria-invalid');
    formError.hidden = true;
  }
  markChanged();
});
function markChanged() {
  if (!hasGenerated) return;
  formChanged.hidden = false;
  generatedButton.innerHTML = 'Generate New Email <span aria-hidden="true">→</span>';
}

function resetGeneratedEmail() {
  preview.hidden = true;
  subjectCopy.textContent = '';
  emailCopy.textContent = '';
  subjectCopyMessage.textContent = '';
  bodyCopyMessage.textContent = '';
  hasGenerated = false;
  formChanged.hidden = true;
  formError.hidden = true;
  generatedButton.innerHTML = 'Generate Email <span aria-hidden="true">→</span>';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  updateConditionalFields();
  if (!validateVisibleFields()) return;
  const template = activeTemplate();
  const notice = noticeSelect.value === 'custom' ? customNoticeInput.value.trim() : noticeSelect.value;
  const details = { notice, quarter: document.querySelector('#quarter').value, company: company.value.trim(), date: formatDate(refundDate.value), amount: amount.value };
  subjectCopy.textContent = template.subject;
  emailCopy.textContent = template.body(details);
  preview.hidden = false;
  subjectCopyMessage.textContent = '';
  bodyCopyMessage.textContent = '';
  hasGenerated = true;
  formChanged.hidden = true;
  generatedButton.innerHTML = 'Generate Email <span aria-hidden="true">→</span>';
  preview.scrollIntoView({ behavior:'smooth', block:'start' });
});

async function copyText(text, successMessage, targetMessage) {
  try { await navigator.clipboard.writeText(text); targetMessage.textContent = successMessage; }
  catch { targetMessage.textContent = 'Copy failed. Select the text above and copy it manually.'; }
}
document.querySelector('#copy-subject').addEventListener('click', () => copyText(subjectCopy.textContent, 'Subject copied.', subjectCopyMessage));
document.querySelector('#copy-body').addEventListener('click', () => copyText(emailCopy.textContent, 'Email body copied.', bodyCopyMessage));
updateConditionalFields();
