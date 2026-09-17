const form = document.querySelector('#email-form');
const noticeSelect = document.querySelector('#notice-type');
const customNoticeField = document.querySelector('.custom-notice');
const amount = document.querySelector('#amount');
const dateField = document.querySelector('.date-field');
const amountField = document.querySelector('.amount-field');
const preview = document.querySelector('#preview');
const emailCopy = document.querySelector('#email-copy');
const previewSubject = document.querySelector('#preview-subject');
const copyMessage = document.querySelector('#copy-message');

const templates = {
  refundInfo: { subject: 'Refund Information', needsRefundDetails: true, body: ({ notice, quarter, company, date, amount }) => `Hello!\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nIn summary, this notice states that a refund was issued for the tax period above on ${date} in the amount of ${amount}.\n\nIf you have further questions, please review this notice, which is password-protected with your company's EIN, in this format: XX-XXXXXXX\n\nThank you!` },
  refundIssued: { subject: 'Refund Issued Notice', body: ({ notice, quarter, company }) => `Hello!\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nIn summary, this notice states that you will receive a refund within four to eight weeks unless other taxes or obligations are owed.\n\nIf you have further questions, please review this notice, which is password-protected with your company's EIN, in this format: XX-XXXXXXX\n\nThank you!` },
  claimsPackage: { subject: 'IRS Claims Package', body: ({ notice, quarter, company }) => `Hello,\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nA copy of this notice has been attached to this email and is password protected with your company’s EIN, including the hyphen, in this format: XX-XXXXXXX.\n\nTo summarize, the notice states that the BFS (Bureau of Fiscal Service) is issuing a claims package that should include a photocopy of your refund check, a claim form, and instructions. The notice states that if you do not receive that package within 30 days, to contact the BFS directly.\n\nIf you have any questions, please do not hesitate to reach out to us.\n\nThank you!` },
  checkInfo: { subject: 'ERC Check Information', body: ({ notice, quarter, company }) => `Hello,\n\nWe have received LTR ${notice} for ${quarter}, for ${company}.\n\nA copy of this notice has been attached to this email and is password protected with your company’s EIN, including the hyphen, in this format: XX-XXXXXXX.\n\nTo summarize, the IRS is tracing your check.\n\nIf you have any questions, please do not hesitate to reach out to us.\n\nThank you!` }
};

function activeTemplate() { return templates[form.elements.template.value]; }
function formatMoney(value) { const number = Number(value.replace(/[^0-9.]/g, '')); return Number.isFinite(number) ? number.toLocaleString('en-US', { style:'currency', currency:'USD' }) : ''; }
function formatDate(value) { if (!value) return ''; return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }); }
function updateConditionalFields() { const needsRefundDetails = activeTemplate().needsRefundDetails; dateField.hidden = !needsRefundDetails; amountField.hidden = !needsRefundDetails; document.querySelector('#refund-date').required = needsRefundDetails; amount.required = needsRefundDetails; }

noticeSelect.addEventListener('change', () => {
  const isCustom = noticeSelect.value === 'custom';
  customNoticeField.hidden = !isCustom;
  document.querySelector('#custom-notice').required = isCustom;
});
form.addEventListener('change', event => { if (event.target.name === 'template') updateConditionalFields(); });
amount.addEventListener('blur', () => { if (amount.value) amount.value = formatMoney(amount.value).replace('$', ''); });

form.addEventListener('submit', event => {
  event.preventDefault();
  updateConditionalFields();
  if (!form.reportValidity()) return;
  const template = activeTemplate();
  const notice = noticeSelect.value === 'custom' ? document.querySelector('#custom-notice').value.trim() : noticeSelect.value;
  const details = { notice, quarter: document.querySelector('#quarter').value, company: document.querySelector('#company').value.trim(), date: formatDate(document.querySelector('#refund-date').value), amount: formatMoney(amount.value) };
  const email = `Subject: ${template.subject}\n\n${template.body(details)}`;
  previewSubject.textContent = `Subject: ${template.subject}`;
  emailCopy.textContent = email;
  preview.hidden = false;
  copyMessage.textContent = '';
  preview.scrollIntoView({ behavior:'smooth', block:'start' });
});

document.querySelector('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(emailCopy.textContent); copyMessage.textContent = 'Copied — ready to paste into Gmail.'; }
  catch { copyMessage.textContent = 'Select the email above and copy it manually.'; }
});
document.querySelector('#start-over').addEventListener('click', () => { preview.hidden = true; form.scrollIntoView({ behavior:'smooth', block:'start' }); });
updateConditionalFields();
