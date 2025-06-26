export const isNode =
  typeof process !== 'undefined' &&
  !!process.versions?.node;

export const isEdgeRuntime =
  typeof globalThis !== 'undefined' &&
  'EdgeRuntime' in globalThis;
