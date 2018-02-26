import { Component } from '@angular/core';
import { Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  sliderElem: HTMLElement;
  thumbElems: HTMLElement[];
  shiftX: number;
  sliderCoords: Coords;
  thumbCoords: Coords;

  activeElement = -1;

  intervals_count = 1;
  thumb_count = 6;

  min_range = 1;
  max_range = 610;

  min_value = 1;
  max_value = 10;

  min_interval = 10;

  slider_size = 10;
  intervals: Interval[];

  minFormControl = new FormControl('', [
    Validators.required,
    Validators.min(this.min_range),
  ]);
  maxFormControl = new FormControl('', [
    Validators.required,
    Validators.max(this.max_range),
  ]);

  constructor() {

    this.intervals = [];

    setTimeout(() => {

      this.sliderElem = document.getElementById('slider');
      this.sliderCoords = this.getCoords(this.sliderElem);
      this.max_value = this.sliderElem.offsetWidth;
    }, 0);

  }


  getThumbElementById(id: number) {

    return document.getElementById('thumb' + id);

  }

  getLine(id: number) {

    return document.getElementById('line' + id);

  }

  mouseDown(e: MouseEvent, thb_id: number) {

    this.activeElement = thb_id;
    this.thumbCoords = this.getCoords(this.getThumbElementById(thb_id));
    this.shiftX = e.pageX - this.thumbCoords.left;

    return false;

  };

  getActiveInterval(activeElement: number) {

    const interval_idx = (activeElement - activeElement % 2) / 2;

    return this.intervals[interval_idx]

  }


  getDisabledIntervals(): Interval[] {

    const disabled_intervals = [];
    this.intervals.forEach(interval => {
      if (interval.disabled) {
        disabled_intervals.push(interval);
      }
    });
    return disabled_intervals;
  }

  getDisabledLimit(interval: Interval) {


    const current_right_position = this.getCoords(this.getThumbElementById(interval.right_idx)).left;
    const current_left_position = this.getCoords(this.getThumbElementById(interval.left_idx)).left;


    const disabled_intervals = this.getDisabledIntervals();

    let current_right_limit = 999;
    let current_left_limit = -1;

    disabled_intervals.forEach(disabled_interval => {

      const disabled_interval_left_limit = this.getCoords(this.getThumbElementById(disabled_interval.left_idx)).left;
      const disabled_interval_right_limit = this.getCoords(this.getThumbElementById(disabled_interval.right_idx)).left;
      if (disabled_interval_left_limit > current_right_position && current_right_limit > disabled_interval_left_limit) {
        current_right_limit = disabled_interval_left_limit;
      }

      if (disabled_interval_right_limit < current_left_position && current_left_limit < disabled_interval_right_limit) {
        current_left_limit = disabled_interval_right_limit;
      }

    });


    return [current_left_limit, current_right_limit]

  }

  onmousemove(e: MouseEvent) {

    if (this.activeElement < 0) {
      return;
    }

    const interval = this.getActiveInterval(this.activeElement);

    const [current_left_limit, current_right_limit] = this.getDisabledLimit(interval);

    let thumb: HTMLElement;

    const isRight = this.activeElement === interval.right_idx;

    const left_thumb = this.getThumbElementById(interval.left_idx);
    const right_thumb = this.getThumbElementById(interval.right_idx);

    if (isRight) {
      thumb = right_thumb;
    } else {
      thumb = left_thumb;
    }

    let newLeft = e.pageX - this.shiftX;

    if (newLeft < 0) {
      newLeft = 0;
    }

    if (isRight && newLeft < this.getCoords(left_thumb).left + this.min_interval) {
      newLeft = this.getCoords(left_thumb).left + this.min_interval
    }

    const rightEdge = this.sliderElem.offsetWidth - thumb.offsetWidth;

    if (newLeft > rightEdge) {
      newLeft = rightEdge;
    }

    if (!isRight && newLeft > (this.getCoords(right_thumb).left - this.min_interval)) {
      newLeft = (this.getCoords(right_thumb).left - this.min_interval);
    }

    thumb.style.background = interval.disabled ? Color.Grey : Color.Blue;


    if (isRight && current_right_limit < 999 && newLeft > current_right_limit - this.slider_size) {
      newLeft = current_right_limit - this.slider_size;
      thumb.style.background = Color.Red;
    }

    if (!isRight && current_left_limit > -1 && newLeft < current_left_limit + this.slider_size) {
      newLeft = current_left_limit + this.slider_size;
      thumb.style.background = Color.Red;
    }

    if (newLeft < this.min_value) {
      newLeft = this.min_value;
    }

    if (newLeft > this.max_value) {
      newLeft = this.max_value;
    }

    thumb.style.left = newLeft + 'px';

  }

  onmouseup() {

    this.activeElement = -1;
    return false;

  }

  onmouseleave() {

    this.activeElement = -1;

  }


  getCoords(elem: HTMLElement) {

    if (!elem) {
      return new Coords(0, 0)
    }

    const box = elem.getBoundingClientRect();

    const slider_offset = this.sliderCoords ? this.sliderCoords.left : 0;

    return new Coords(box.top, box.left - slider_offset);

  }


  addInterval(disabled: boolean) {

    const new_interval = new Interval;
    new_interval.disabled = disabled;
    new_interval.left_idx = 2 * this.intervals.length;
    new_interval.right_idx = new_interval.left_idx + 1;
    new_interval.index = this.intervals.length;
    new_interval.color = disabled ? Color.Grey : Color.Blue;

    this.intervals.push(new_interval);
    this.setDefaultColors(new_interval);

  }

  setDefaultColors(interval: Interval) {

    setTimeout(() => {

      const thumb1 = this.getThumbElementById(interval.left_idx);
      const thumb2 = this.getThumbElementById(interval.right_idx);
      const line = this.getLine(interval.index);

      thumb1.style.background = interval.color;
      thumb2.style.background = interval.color;
      line.style.background = interval.color;

      this.setDefaultPosition(interval);

    }, 0)
  }

  setDefaultPosition(interval: Interval) {

    const thumb1 = this.getThumbElementById(interval.left_idx);
    const thumb2 = this.getThumbElementById(interval.right_idx);

    thumb2.style.left = (Number(thumb1.style.width.split('px')[0])) + 'px';

  }


  getTextPosition(interval: Interval) {

    if (interval.index % 2 === 0) {
      return '-20px';
    }
    return '25px';

  }

  updateLimits() {

    this.intervals.forEach(interval => {

      const thumb1 = this.getThumbElementById(interval.left_idx);
      const thumb2 = this.getThumbElementById(interval.right_idx);
      const line = this.getLine(interval.index);

      if (this.getCoords(thumb1).left < this.min_value) {
        thumb1.style.left = this.min_value + 'px';
      }

      if (this.getCoords(thumb2).left > this.max_value) {
        thumb2.style.left = this.max_value + 'px';
      }

    })

  }

  getLineWidth(interval: Interval) {

    return this.getCoords(this.getThumbElementById(interval.right_idx)).left
      - this.getCoords(this.getThumbElementById(interval.left_idx)).left + 'px'

  }

  getLineLeft(interval: Interval) {

    return this.getCoords(this.getThumbElementById(interval.left_idx)).left + 'px'

  }

}


export class Coords {
  top: number;
  left: number;

  constructor(top: number, left: number) {
    this.top = top;
    this.left = left;
  }
}

export class Interval {
  index: number;
  disabled: boolean;
  left_idx: number;
  right_idx: number;
  color: string;

  constructor(disabled?: boolean, left_idx?: number, right_idx?: number, color?: string) {
    this.disabled = disabled;
    this.left_idx = left_idx;
    this.right_idx = right_idx;
    this.color = color;
  }
}

export const Color = {
  Red: 'red',
  Grey: 'grey',
  Blue: 'blue'
}
