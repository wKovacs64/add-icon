import wkovacs64 from '@wkovacs64/eslint-config';

export default [
  ...wkovacs64,
  {
    ignores: ['dist/', 'examples/', 'node_modules/', 'example-*.ts'],
    files: ['src/**/*.ts'],
  },
];
