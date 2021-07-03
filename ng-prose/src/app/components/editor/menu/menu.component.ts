import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  @Input()
  show: boolean;

  @Input()
  menuItems: MenuItem[];

  @Input()
  keyupSubject: Subject<KeyboardEvent>;

  @Output()
  menuSelected: EventEmitter<MenuItem> = new EventEmitter();

  selectedIndex = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.keyupSubject.subscribe((event: KeyboardEvent) => this.onKey(event));
  }

  ngOnDestroy(): void {
    this.keyupSubject.unsubscribe();
  }

  selectMenu(menuItem: MenuItem): void {
    this.menuSelected.emit(menuItem);
  }

  onKey(event: KeyboardEvent) {
    const arrow = this.handleArrowEvent(event);
    if (arrow) {
      const currentIdx = this.selectedIndex;
      const n = currentIdx + (arrow === 'up' ? -1 : 1);
      if (n < 0) {
        this.selectedIndex = n + this.menuItems.length;
      } else {
        this.selectedIndex = n % this.menuItems.length;
      }
    } else if (event.key === 'Enter') {
      this.menuSelected.emit(this.menuItems[this.selectedIndex]);
    }
  }

  handleArrowEvent(event: KeyboardEvent): Arrow | undefined {
    const {ctrlKey, key} = event;
    if (key === 'ArrowUp' || (key === 'p' && ctrlKey)) {
      return 'up';
    } else if (key === 'ArrowDown' || (key === 'n' && ctrlKey)) {
      return 'down';
    }
  }
}

export interface MenuItem {
  code: string;
  label: string;
}

type Arrow = 'up' | 'down';
