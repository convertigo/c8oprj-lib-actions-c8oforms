// node --test tests/unit/mail-attachments.test.cjs
// The Send an email action (forms_notify_response_simple_by_mail_simple) attaches the files of the response: files,
// signatures, photos and the documents created by the steps of the flow (Fill a PDF). forms_mail_attachments lets the
// author choose them: empty, every attachment as before; otherwise only the chosen fields and documents. The summary
// of the response in the body is the same whatever the choice.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const yaml = fs.readFileSync(path.join(__dirname, '../../_c8oProject/sequences/forms_notify_response_simple_by_mail_simple.yaml'), 'utf8');
const step = (name) => {
  const m = yaml.match(new RegExp(`↓${name} \\[steps\\.SimpleStep-\\d+\\]: \\n  expression: \\|\\n([\\s\\S]*?)\\n(?:↓|  isEnabled)`));
  assert.ok(m, name);
  return m[1].split('\n').map((l) => l.slice(4)).join('\n').trim().replace(/^'/, '').replace(/'$/, '').replace(/''/g, "'");
};
const flatenize = step('FlatenizeDoc');

const response = {
  _id: 'r1',
  timestamp: 1767225600000,
  resp: {
    invoice: { type: 'file', name: 'invoice', labelHtml: 'Invoice', value: ['r1_C80C80_bill.pdf_C80C80_1', 'r1_C80C80_quote.pdf_C80C80_2'] },
    sign: { type: 'signature', name: 'sign', labelHtml: 'Signature', value: 'data:image/png;base64,AAAAAAAA', att_type: false },
    sign2: { type: 'signature', name: 'sign2', labelHtml: 'Witness', value: 'sign2', att_type: true },
    photo: { type: 'img', name: 'photo', labelHtml: 'Photo', value: 'photo', att_type: true },
    comment: { type: 'text', name: 'comment', labelHtml: 'Comment', value: 'Fine' },
  },
  actionsValue: {
    'Fill PDF': { value: 'Fill PDF.pdf', valueType: 'attachment' },
    'Score': { value: '12', valueType: 'text' },
  },
};

// runs the step with forms_mail_attachments = choice (left undefined when choice is undefined)
function run(choice) {
  const warnings = [];
  const sandbox = {
    doc: 'doc', originalDoc: 'originalDoc', jName: 'Form', jVersion: '1', _c8o_timezone_offset: 0,
    log: { warn: (m) => warnings.push(String(m)), warning: () => {}, debug: () => {}, error: () => {}, info: () => {} },
    context: { getProjectDirectory: () => '/lib' },
    org: { apache: { commons: { lang3: { SystemUtils: { IS_OS_WINDOWS: false } } } } },
    com: { twinsoft: { convertigo: { engine: { util: { XMLUtils: {
      XmlToJson: (node) => JSON.stringify({ variable: node == 'doc' ? response : {} }),
    } } } } } },
  };
  if (choice !== undefined) {
    sandbox.forms_mail_attachments = choice;
  }
  vm.runInNewContext(flatenize, sandbox);
  // arrays of the sandbox, compared as plain values
  const names = (list) => JSON.parse(JSON.stringify(list.map((a) => a.name.substring(a.name.indexOf('_') + 1)).sort()));
  return { attachments: names(sandbox.attachmentsArray), signatures: names(sandbox.signatures), summary: sandbox.table_recap, warnings };
}

const EVERYTHING = { attachments: ['Fill PDF.pdf', 'bill.pdf', 'photo.jpg', 'quote.pdf', 'sign2.png'], signatures: ['Signature.png'] };

test('without a choice every attachment of the response is sent, as before', () => {
  for (const choice of [undefined, null, '', '  ', 'null', 'undefined']) {
    const { attachments, signatures, warnings } = run(choice);
    assert.deepEqual({ attachments, signatures }, EVERYTHING, JSON.stringify(choice));
    assert.deepEqual(warnings.filter((w) => /forms_mail_attachments/.test(w)), []);
  }
});

test('only the files of the chosen fields are sent', () => {
  assert.deepEqual(run('{"fields":["invoice"],"documents":[]}').attachments, ['bill.pdf', 'quote.pdf']);
  assert.deepEqual(run('{"fields":["invoice"],"documents":[]}').signatures, []);
  const signatures = run('{"fields":["sign","sign2"]}');
  assert.deepEqual(signatures.attachments, ['sign2.png'], 'a signature stored as an attachment');
  assert.deepEqual(signatures.signatures, ['Signature.png'], 'a signature kept in the response');
  assert.deepEqual(run('{"fields":["photo"]}').attachments, ['photo.jpg']);
});

test('only the chosen documents created by the flow are sent', () => {
  const pdf = run('{"fields":[],"documents":["Fill PDF"]}');
  assert.deepEqual({ attachments: pdf.attachments, signatures: pdf.signatures }, { attachments: ['Fill PDF.pdf'], signatures: [] });
  assert.deepEqual(run('{"fields":["invoice"],"documents":["Other step"]}').attachments, ['bill.pdf', 'quote.pdf']);
  assert.deepEqual(run('{"fields":["Fill PDF"]}').attachments, [], 'a field choice never selects a document');
});

test('an empty choice sends no attachment', () => {
  for (const choice of ['{"fields":[],"documents":[]}', '{}', '[]']) {
    const { attachments, signatures } = run(choice);
    assert.deepEqual({ attachments, signatures }, { attachments: [], signatures: [] }, choice);
  }
});

test('a JSON array or a list of names chooses fields and documents by name', () => {
  assert.deepEqual(run('["photo","Fill PDF"]').attachments, ['Fill PDF.pdf', 'photo.jpg']);
  assert.deepEqual(run('invoice; Fill PDF').attachments, ['Fill PDF.pdf', 'bill.pdf', 'quote.pdf']);
  assert.deepEqual(run('sign2,photo').attachments, ['photo.jpg', 'sign2.png']);
});

test('a choice that cannot be read sends no attachment and is logged', () => {
  for (const choice of ['{"fields":', '[photo]']) {
    const { attachments, signatures, warnings } = run(choice);
    assert.deepEqual({ attachments, signatures }, { attachments: [], signatures: [] }, choice);
    assert.equal(warnings.filter((w) => /forms_mail_attachments cannot be read/.test(w)).length, 1, choice);
  }
});

test('names of the object prototype or other values never select an attachment', () => {
  for (const choice of ['{"fields":["constructor","__proto__","toString"],"documents":["hasOwnProperty"]}',
    '{"fields":"invoice","documents":"Fill PDF"}', '{"fields":[{"name":"invoice"},["photo"],null,""]}']) {
    const { attachments, signatures } = run(choice);
    assert.deepEqual({ attachments, signatures }, { attachments: [], signatures: [] }, choice);
  }
});

test('the summary of the response is the same whatever the choice', () => {
  const summary = run(undefined).summary;
  assert.match(summary, /bill\.pdf, quote\.pdf/);
  for (const choice of ['{"fields":[],"documents":[]}', '{"fields":["photo"]}', '["Fill PDF"]', '{bad']) {
    assert.equal(run(choice).summary, summary, choice);
  }
});

test('the sequence declares forms_mail_attachments, empty by default, edited as attachments', () => {
  const m = yaml.match(/↓forms_mail_attachments \[variables\.RequestableVariable-\d+\]: \n  comment: \|\n([\s\S]*?)\n  description: attachments\n  value: \n↓/);
  assert.ok(m, 'declared with an empty value');
  const comment = JSON.parse(m[1].split('\n').map((l) => l.slice(4)).join('\n').trim().replace(/^'/, '').replace(/'$/, '').replace(/''/g, "'"));
  assert.deepEqual(Object.keys(comment).sort(), ['en', 'es', 'fr', 'it', 'zh']);
  for (const lang of Object.keys(comment)) {
    assert.ok(comment[lang].displayName && comment[lang].comment, lang);
  }
});
