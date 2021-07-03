import {Component, ElementRef, Input, OnInit} from '@angular/core';

import {EditorState, Plugin} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {defaultMarkdownParser, schema} from 'prosemirror-markdown';
import {buildInputRules, buildKeymap} from 'prosemirror-example-setup';
import {InputRule, inputRules} from 'prosemirror-inputrules';
import {keymap} from 'prosemirror-keymap';
import {history} from 'prosemirror-history';
import {baseKeymap} from 'prosemirror-commands';
import {dropCursor} from 'prosemirror-dropcursor';
import {gapCursor} from 'prosemirror-gapcursor';
import {MenuItem} from './menu/menu.component';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  constructor(private el: ElementRef) {
  }

  @Input()
  content?: string;

  editorDom: HTMLTextAreaElement;
  editorView: EditorView;
  state: EditorState;

  editorPos: Coordinate = {x: 0, y: 0};
  caretPos: Coordinate = {x: 0, y: 0};

  get caretX() {
    return `${this.caretPos.x - this.editorPos.x}px`;
  }

  get caretY() {
    return `${this.caretPos.y - this.editorPos.y}px`;
  }

  showMenu = false;
  menuItems: MenuItem[] = [
    {code: 'jugem', label: '寿限無'},
    {code: 'tokisoba', label: '時そば'},
  ];

  inputSubject: Subject<KeyboardEvent> = new Subject();

  ngOnInit(): void {
    const editorElm = this.el.nativeElement.querySelector('#editor');
    const editorRect = editorElm.getBoundingClientRect();
    this.editorPos = {x: editorRect.x, y: editorRect.y};
    const myInputRulePlugin = inputRules({
      rules: [
        new InputRule(/\/$/, this.openMenuHandler.bind(this)),
      ]
    });
    this.state = EditorState.create({
      doc: defaultMarkdownParser.parse(this.content || ''),
      plugins: [...setupPlugins({schema}), myInputRulePlugin]
    });
    this.editorView = new EditorView(editorElm, {
      state: this.state,
      handleKeyPress: (e) => {
        this.state = e.state;
        return null;
      }
    });
    this.editorDom = this.el.nativeElement.querySelector('.ProseMirror');
  }

  openMenuHandler(state: EditorState, match: string[], start: number, end: number) {
    this.editorDom.classList.add('menu-opening'); // TODO: hack
    this.showMenu = true;
    const pos = window.getSelection().getRangeAt(0).getBoundingClientRect();
    this.caretPos = {x: pos.right, y: pos.bottom};
    return state.tr.insertText('/');
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.showMenu && isMenuOperationKey(e)) {
      e.preventDefault();
      this.inputSubject.next(e);
    } else if (this.showMenu && !isModKey(e)) { // close menu
      this.editorDom.classList.remove('menu-opening');
      this.showMenu = false;
    }
  }

  handleEnter(e: KeyboardEvent) {
    if (this.showMenu) {
      e.preventDefault();
    }
    return true;
  }

  handleSelectMenu(menuItem: MenuItem) {
    const text = getPreparedText(menuItem.code);
    const newTr = this.state.tr.insertText(text);
    this.state = this.state.apply(newTr);
    this.editorView.updateState(this.state);
    this.showMenu = false;
    this.editorDom.classList.remove('menu-opening');
  }
}

function getPreparedText(code: string): string {
  let prepared;
  switch (code) {
    case 'jugem':
      prepared = '寿限無 寿限無 五劫のすりきれ 海砂利水魚の水行末 雲来末 風来末';
      break;
    case 'tokisoba':
      prepared = 'お蕎麦屋さん何ができるんだい？花巻に卓袱？そいじゃあ卓袱をうんと熱くしてもらおうじゃあねえか';
      break;
  }
  return prepared;
}

function isMenuOperationKey(e: KeyboardEvent) {
  const {ctrlKey, key} = e;
  return (
    key === 'Enter' ||
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    (key === 'p' && ctrlKey) ||
    (key === 'n' && ctrlKey));
}

function isModKey(e: KeyboardEvent): boolean {
  const {key} = e;
  return (
    key === 'Alt' ||
    key === 'Control' ||
    key === 'CapsLock' ||
    e.metaKey
  );
}

function setupPlugins(options) {
  const menuSelectPlugin = new Plugin({
    props: {
      handleKeyDown(view, event) {
        const isMenuOpen = view.dom.classList.contains('menu-opening'); // TODO: hack
        if (isMenuOpen && event.key === 'Enter') {
          event.preventDefault();
          return true;
        }
      }
    }
  });
  return [
    menuSelectPlugin,
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema, options.mapKeys)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
    history(),
  ];
}

interface Coordinate {
  x: number;
  y: number;
}
