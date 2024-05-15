/** 
 * Wraps an object
 * 
 * @param   object  Object to be wrapped
 * @returns         Wrapper object
 */
const wrap = (object: any) => new Wrapper(object);

class Wrapper {
    object: any;

    constructor(object: any) {
        this.object = object;
    }

    /** 
     * Sets a value in the enclosed object
     * 
     * @param   key     Key to set to
     * @param   value   Value to set
     * @returns         This object
     */
    set(key: string, value: any): Wrapper {
        if (this.object[key] instanceof ACC_Dynamic) {
            this.object[key].set(value);
        } else {
            this.object[key] = value;
        }
        return this;
    }

    /** 
     * Calls the passed function with the enclosed object as the first argument
     * 
     * @param   func    Function
     * @param   args    Arguments
     * @returns         This object
     */
    pipe(func: (...args: any[]) => void, ...args: any[]): Wrapper {
        func(this.object, ...args);
        return this;
    }

    /** 
     * Calls a function in the enclosed object with the provided parameters
     * 
     * @param   key     Function name
     * @param   args    Arguments
     * @returns         This object
     */
    call(key: string, ...args: any[]): Wrapper {
        this.object[key](...args);
        return this;
    }

    /** 
     * Returns enclosed object
     * 
     * @returns enclosed object
     */
    unwrap(): any {
        return this.object;
    }
}