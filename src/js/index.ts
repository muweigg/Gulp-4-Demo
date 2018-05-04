const { fromEvent } = rxjs;

fromEvent(document, 'click').subscribe(e => console.log(e));
