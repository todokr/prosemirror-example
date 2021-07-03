import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";
import { InputRule, inputRules } from "prosemirror-inputrules";

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
});

const myInputRuleHandler = (state: EditorState, match: string[], start: number, end: number) => {
  console.log('hoge');
  return state.tr.insertText('/');
}

const myInputRulePlugin = inputRules({
  rules: [new InputRule(/\?/, 'hatena'), new InputRule(/\/$/, myInputRuleHandler)]
});

window.view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(document.querySelector('#content')),
    plugins: [...exampleSetup({ schema: mySchema }), myInputRulePlugin]
  })
});
