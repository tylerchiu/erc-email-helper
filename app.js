const form = document.querySelector('#email-form');
const noticeSelect = document.querySelector('#notice-type');
const customNoticeField = document.querySelector('.custom-notice');
const amount = document.querySelector('#amount');
const dateField = document.querySelector('.date-field');
const amountField = document.querySelector('.amount-field');
const preview = document.querySelector('#preview');
const emailCopy = document.querySelector('#email-copy');
const subjectCopy = document.querySelector('#subject-copy');
const copyMessage = document.querySelector('#copy-message');
const generatedButton = document.querySelector('#generate-email');
const formChanged = document.querySelector('#form-changed');
let hasGenerated = false;

const templates = {
  refundInfo: { subject: 'Refund Information', needsRefundDetails: true, body: ({ notice, quarter, company, date, amount }) => `Hello!\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nIn summary, this notice states that a refund was issued for the tax period above on ${date} in the amount of ${amount}.\n\nIf you have further questions, please review this notice, which is password-protected with your company's EIN, in this format: XX-XXXXXXX\n\nThank you!` },
  refundIssued: { subject: 'Refund Issued Notice', body: ({ notice, quarter, company }) => `Hello!\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nIn summary, this notice states that you will receive a refund within four to eight weeks unless other taxes or obligations are owed.\n\nIf you have further questions, please review this notice, which is password-protected with your company's EIN, in this format: XX-XXXXXXX\n\nThank you!` },
  claimsPackage: { subject: 'IRS Claims Package', body: ({ notice, quarter, company }) => `Hello,\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nA copy of this notice has been attached to this email and is password protected with your company’s EIN, including the hyphen, in this format: XX-XXXXXXX.\n\nTo summarize, the notice states that the BFS (Bureau of Fiscal Service) is issuing a claims package that should include a photocopy of your refund check, a claim form, and instructions. The notice states that if you do not receive that package within 30 days, to contact the BFS directly.\n\nIf you have any questions, please do not hesitate to reach out to us.\n\nThank you!` },
  checkInfo: { subject: 'ERC Check Information', body: ({ notice, quarter, company }) => `Hello,\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nA copy of this notice has been attached to this email and is password protected with your company’s EIN, including the hyphen, in this format: XX-XXXXXXX.\n\nTo summarize, the IRS is tracing your check.\n\nIf you have any questions, please do not hesitate to reach out to us.\n\nThank you!` }
};

function activeTemplate() { return templates[form.elements.template.value]; }
function formatCents(value) {
  const digits = value.replace(/\D/g, '');
  const number = Number(digits || '0') / 100;
  return number.toLocaleString('en-US', { style:'currency', currency:'USD' });
}
function formatDate(value) { if (!value) return ''; return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }); }
function updateConditionalFields() { const needsRefundDetails = activeTemplate().needsRefundDetails; dateField.hidden = !needsRefundDetails; amountField.hidden = !needsRefundDetails; document.querySelector('#refund-date').required = needsRefundDetails; amount.required = needsRefundDetails; }

noticeSelect.addEventListener('change', () => {
  const isCustom = noticeSelect.value === 'custom';
  customNoticeField.hidden = !isCustom;
  document.querySelector('#custom-notice').required = isCustom;
});
form.addEventListener('change', event => { if (event.target.name === 'template') updateConditionalFields(); markChanged(); });
form.addEventListener('input', event => {
  if (event.target === amount) {
    amount.value = formatCents(amount.value);
    amount.setSelectionRange(amount.value.length, amount.value.length);
  }
  markChanged();
});
function markChanged() {
  if (!hasGenerated) return;
  formChanged.hidden = false;
  generatedButton.innerHTML = 'Generate New Email <span aria-hidden="true">→</span>';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  updateConditionalFields();
  if (!form.reportValidity()) return;
  const template = activeTemplate();
  const notice = noticeSelect.value === 'custom' ? document.querySelector('#custom-notice').value.trim() : noticeSelect.value;
  const details = { notice, quarter: document.querySelector('#quarter').value, company: document.querySelector('#company').value.trim(), date: formatDate(document.querySelector('#refund-date').value), amount: amount.value };
  subjectCopy.textContent = template.subject;
  emailCopy.textContent = template.body(details);
  preview.hidden = false;
  copyMessage.textContent = '';
  hasGenerated = true;
  formChanged.hidden = true;
  generatedButton.innerHTML = 'Generate Email <span aria-hidden="true">→</span>';
  preview.scrollIntoView({ behavior:'smooth', block:'start' });
});

async function copyText(text, label) {
  try { await navigator.clipboard.writeText(text); copyMessage.textContent = `${label} copied — ready to paste into Gmail.`; }
  catch { copyMessage.textContent = `Select the ${label.toLowerCase()} above and copy it manually.`; }
}
document.querySelector('#copy-subject').addEventListener('click', () => copyText(subjectCopy.textContent, 'Subject'));
document.querySelector('#copy-body').addEventListener('click', () => copyText(emailCopy.textContent, 'Email body'));
updateConditionalFields();
