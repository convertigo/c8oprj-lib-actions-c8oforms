const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = (name) => fs.readFileSync(path.join(__dirname, '../../_c8oProject/sequences', name + '.yaml'), 'utf8');
const step = (yaml, name) => {
  const m = yaml.match(new RegExp(`↓${name} \\[steps\\.SimpleStep-\\d+\\]: \\n  expression: \\|\\n([\\s\\S]*?)\\n(?:↓|  isEnabled)`));
  assert.ok(m, name);
  return m[1].split('\n').map((l) => l.slice(4)).join('\n').trim().replace(/^'/, '').replace(/'$/, '').replace(/''/g, "'");
};
const stored = { _id: 'r1', _rev: '3-x', formId: 'published_f', resp: [{ name: 'status', value: 'open' }] };

function run(code, submitted, form, docs = { r1: stored }) {
  const posted = [];
  const client = {
    getDocument: (db, id) => { assert.equal(db, 'c8oforms_response_fs'); if (!docs[id]) throw new Error('404'); return JSON.stringify(docs[id]); },
    postDocument: (db, doc) => { posted.push(JSON.parse(String(doc))); return JSON.stringify({ ok: true, id: 'r1', rev: '4-y' }); },
  };
  const context = {
    _doc: { doc: submitted }, _originalDoc: { originalDoc: form },
    forms_input_field_name: 'status', forms_input_field_value: 'closed',
    log: { warn() {}, info() {} },
    java: { lang: { Exception: Error, String: String }, util: { HashMap: class { put() {} }, Arrays: { asList: (x) => x } } },
    org: { codehaus: { jettison: { json: { JSONObject: class { constructor(o) { this.o = o; } toString() { return JSON.stringify(this.o); } } } } } },
    com: { twinsoft: { convertigo: { engine: { Engine: { theApp: { couchDbManager: { getFullSyncClient: () => client } } },
      enums: { CouchPostDocumentPolicy: { merge: 'merge' } } } } } },
  };
  vm.runInNewContext(code, context);
  return { context, posted };
}

test('forms_edit_field edits the stored response of the form, not the caller document', () => {
  const code = step(read('forms_edit_field'), 'editField1_0_62');
  const forged = { _id: 'r1', formId: 'published_f', resp: [{ name: 'status', value: 'x' }, { name: 'owner', value: 'eve' }], c8oGrp: { all: true } };
  const { context, posted } = run(code, forged, { _id: 'published_f' });
  assert.equal(context.editFieldResult.status, 'OK');
  assert.deepEqual(posted[0].resp, [{ name: 'status', value: 'closed' }]);
  assert.equal(posted[0]._rev, '3-x');
  assert.equal(posted[0].c8oGrp, undefined);
  for (const [doc, form] of [[forged, { _id: 'published_other' }], [{ _id: 'missing' }, { _id: 'published_f' }], [forged, null]]) {
    const other = run(code, doc, form);
    assert.equal(other.context.editFieldResult.status, 'FIELD_NOT_FOUND');
    assert.equal(other.posted.length, 0);
  }
});

test('forms_delete_response only deletes a stored response of the form', () => {
  const yaml = read('forms_delete_response');
  const code = step(yaml, 'CheckStoredResponse');
  assert.equal(run(code, { _id: 'r1' }, { _id: 'published_f' }).context.storedResponseId, 'r1');
  assert.throws(() => run(code, { _id: 'r1' }, { _id: 'published_other' }), /not found/);
  assert.throws(() => run(code, { _id: 'r2' }, { _id: 'published_f' }), /not found/);
  assert.match(yaml, /↓response_id \[steps\.ElementStep-(\d+)\]: \n  expression: storedResponseId\n[\s\S]*?↑value: \1\n/);
});
