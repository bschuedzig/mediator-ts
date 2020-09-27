import { Mediator } from '../src/Mediator';

describe('Mediator', () => {

  class TestMessage {
    public topic?: string;
  }

  class TestConsumer {

    private consumption: TestMessage[] = [];

    public Consume = async (msg: TestMessage): Promise<void> => {
      this.consumption.push(msg);
    }
  }

  it('keeps track of internal instance count', () => {

    var instance = new Mediator();
    expect(instance.test_handlerCount()).toBe(0);

    var disposer = instance.register(TestMessage, async (_) => {
      console.log('I was called');
    });

    expect(instance.test_handlerCount()).toBe(1);

    disposer();

    expect(instance.test_handlerCount()).toBe(0);

    var disposer = instance.register(TestMessage, async (_) => {
      console.log('I was called');
    });

    expect(instance.test_handlerCount()).toBe(1);

    disposer();

    expect(instance.test_handlerCount()).toBe(0);
  });

  it('will asynchronously invoke the callbacks', async () => {

    var instance = new Mediator();
    var messages: string[] = [];

    var disposer1 = instance.register(TestMessage, async (_) => {
      messages.push('1');
    });

    instance.register(TestMessage, async (_) => {
      messages.push('2');
    });

    var message = new TestMessage();
    await instance.invoke(TestMessage, message);

    disposer1();

    await instance.invoke(TestMessage, message);

    expect(messages).toEqual(['1', '2', '2']);
  });

  it('throws when same handler is added twice on the same message', async () => {

    var mediator = new Mediator();
    var consumer = new TestConsumer();

    mediator.register(TestMessage, consumer.Consume)

    try {
      mediator.register(TestMessage, consumer.Consume);
    }
    catch (err) {
      expect(err.message).toMatch("This handler is already registered");
      return;
    }

    fail();
  });

  it('allows two instances of the same type to register handlers', () => {

    var mediator = new Mediator();
    var consumer1 = new TestConsumer();
    var consumer2 = new TestConsumer();

    mediator.register(TestMessage, consumer1.Consume);
    mediator.register(TestMessage, consumer2.Consume);
  });

  it('allows to invoke the mediator with messages that do not have a handler', async () => {
    var mediator = new Mediator();
    await mediator.invoke(TestMessage, new TestMessage());
  });
});
