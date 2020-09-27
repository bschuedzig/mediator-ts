Cleanroom mediator implementation for typescript.

## Installation

```bash
npm install mediator-ts
```

## Usage

```ts
import { Mediator } from 'mediator-ts';

class ExampleMessage {
  public message: string = "";
}

class Consumer {

  private _dispose: () => void;

  constructor() {
    // register .consume in the mediator
    // you need to call _dispose() when you want to stop listening
    _dispose = Mediator.Default.register(ExampleMessage, this.consume);
  }

  private consume(msg: ExampleMessage): Promise<void> {
    console.log(`Consumer received: ${msg}`);
  }
}

var testMessage = new TestMessage();
testMessage.message = "Hello from the sender";

var consumer = new Consumer();
Mediator.Default.invoke(testMessage);

// => Consumer received: Hello from the sender

```
