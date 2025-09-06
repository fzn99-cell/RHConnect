import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  template: `<div class="flex justify-center items-center h-full">
    <div
      class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
    ></div>
  </div> `,
})
export class LoaderComponent  {}
