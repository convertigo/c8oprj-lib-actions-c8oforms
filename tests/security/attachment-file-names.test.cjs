const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../../_c8oProject/sequences/forms_notify_response_simple_by_mail_simple.yaml'), 'utf8');
// without the commented-out code of the sequence
const sequence = source.split('\n').filter((line) => !/^\s*\/\//.test(line)).join('\n');

// Field names, labels, uploaded file names and action values of a response become file names under att/: a value
// such as "../../x" must never leave that folder (the file is written, downloaded, mailed, then deleted).
test('every attachment file name of the mail action goes through safeFileName', () => {
  const pushes = [...sequence.matchAll(/(attachmentsArray|signatures)\.push\(\{ name: new Date\(\)\.getTime\(\)\+"_" ?\+ ?([^,]+),/g)].map((m) => m[2].trim());
  assert.ok(pushes.length >= 5, `found ${pushes.length} pushes`);
  for (const name of pushes) {
    assert.ok(name === 'name' || /^safeFileName\(/.test(name), `unsafe name: ${name}`);
  }
  // "name" is always assigned from safeFileName before being pushed
  const assignments = [...sequence.matchAll(/var name = ([^;\n]+);/g)].map((m) => m[1]);
  assert.ok(assignments.length >= 4);
  for (const value of assignments) {
    assert.match(value, /^safeFileName\(|^uniqueName != ""/, `unsafe assignment: ${value}`);
  }
});

test('safeFileName keeps a file name only', () => {
  const source = sequence.match(/var safeFileName = function \(name\) \{[\s\S]*?\n\s*\};/)[0].replace(/''/g, "'");
  const safeFileName = new Function(`${source}; return safeFileName;`)();
  assert.equal(safeFileName('../../etc/passwd'), 'passwd');
  assert.equal(safeFileName('..\\..\\win.ini'), 'win.ini');
  assert.equal(safeFileName('x/../../../../tmp/evil.png'), 'evil.png');
  assert.equal(safeFileName('..'), 'file');
  assert.equal(safeFileName(''), 'file');
  assert.equal(safeFileName(null), 'file');
  assert.equal(safeFileName('report\u0000.png'), 'report.png');
  assert.equal(safeFileName('Date/heure.png'), 'heure.png');
  assert.equal(safeFileName('plain.jpg'), 'plain.jpg');
});
