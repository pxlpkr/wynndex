const wrap = (object: any) => new Wrapper(object);

class Wrapper {
    object: any;

    constructor(object: any) {
        this.object = object;
    }

    set(key: string, value: any): Wrapper {
        if (this.object[key] instanceof ACC_Dynamic) {
            this.object[key].set(value);
        } else {
            this.object[key] = value;
        }
        return this;
    }

    pipe(func: (...args: any[]) => void, ...args: any[]): Wrapper {
        func(this.object, ...args);
        return this;
    }

    call(key: string, ...args: any[]): Wrapper {
        this.object[key](...args);
        return this;
    }

    unwrap(): any {
        return this.object;
    }
}