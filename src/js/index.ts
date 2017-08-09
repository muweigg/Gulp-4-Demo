console.log(Rx);
Rx.Observable.fromEvent(document, 'click').subscribe(e => console.log(e));