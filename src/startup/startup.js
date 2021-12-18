import process from 'process';

/** 
 * Returns true if the code was compiled with `npm run test`.
 */
const isUnitTest = () => {
  return process.env.NODE_ENV === 'test';
}

/**
 * Returns true if the code was compiled with `npm run build`. 
 */
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
}

/**
 * Returns true if the code was compiled with `npm run build` or `npm run watch`.
 */
const isScript = () => {
  return process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development';
}

export { isUnitTest, isProduction, isScript };