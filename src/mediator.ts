
class MediatorEntry {
  public ctor: any;
  public handlers: ((val: any) => Promise<void>)[] = [];
}

export class Mediator {

  private static _instance = new Mediator();

  public static get Default() {
    return this._instance;
  }

  private _entries: MediatorEntry[] = [];

  public unregister<TMessage>(ctor: { new(): TMessage }, handler: (msg: TMessage) => Promise<void>) {

    var entry = this._entries.find(x => x.ctor == ctor);
    if (entry == null) {
      throw new Error('Cannot unregister unknown ctor: ' + ctor.name);
    }

    var index = entry.handlers.indexOf(handler);
    if (index === -1) {
      throw new Error('Handler already unregistered');
    }

    entry.handlers.splice(index, 1);
  }

  public register<TMessage>(ctor: { new(): TMessage }, handler: (msg: TMessage) => Promise<void>): () => void {

    var entry = this._entries.find(x => x.ctor == ctor);

    // unknown ctor, create structure
    if (entry == null) {
      entry = new MediatorEntry();
      entry.ctor = ctor;
      this._entries.push(entry);
    }

    if (entry.handlers.indexOf(handler) != -1) {
      throw new Error(`This handler is already registered`);
    }
    entry.handlers.push(handler);

    // release function
    return () => this.unregister(ctor, handler);
  }

  public async invoke<TMessage>(ctor: { new(): TMessage }, msg: TMessage): Promise<void> {

    var entry = this._entries.find(x => x.ctor == ctor);

    // unknown ctor, yet still considered ok
    if (entry == null) return Promise.resolve();

    // notify all handlers
    for (let item of entry.handlers) {
      await item(msg);
    }
  }

  public test_handlerCount(): number {

    var count = this._entries.reduce((acc, cur) => acc += cur.handlers.length, 0);
    return count;
  }
}
