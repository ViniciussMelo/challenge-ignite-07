import { createConnection, getConnectionOptions } from 'typeorm';

interface IOptions {
  host: string;
}

getConnectionOptions().then(options => {
  const newOptions = options as IOptions;
  const isTest = process.env.NODE_ENV === "test";

  newOptions.host = isTest ? 'localhost' : 'database';
  createConnection({
    ...options,
  });
});
