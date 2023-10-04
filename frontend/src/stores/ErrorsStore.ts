import { action, makeObservable, observable } from 'mobx';
import { v1 as uuid } from 'uuid';

const MAX_ERRORS = 100;

export interface RefiError {
  id: string;
  message: string;
  name: string;
  stacktrace?: Array<string>;
  shown: boolean;
}

export class ErrorsStore {
  errors: Array<RefiError> = [];
  currentError: RefiError | null = null;

  constructor() {
    makeObservable(this, {
      errors: observable,
      currentError: observable,
      addError: action,
      flagErrorAsShown: action,
      getNextError: action,
    });
  }

  addError(originalError: Error) {
    if (this.errors.length >= MAX_ERRORS) {
      this.errors.shift();
    }

    let error = originalError;
    if (typeof originalError === 'string') {
      error = new Error(originalError);
    }

    const id = uuid();
    this.errors.push({
      id,
      message: error.message,
      name: error.name,
      stacktrace: error.stack?.split('\n'),
      shown: false,
    });

    this.getNextError();
  }

  flagErrorAsShown() {
    if (this.currentError) {
      this.currentError.shown = true;
      this.currentError = null;
    }

    setTimeout(() => {
      this.getNextError();
    }, 500);
  }

  getNextError() {
    if (!this.currentError) {
      for (const error of this.errors) {
        if (!error.shown) {
          this.currentError = error;
          return;
        }
      }
    }
  }
}
