export const isNode = typeof process !== 'undefined' && !!(process as any).versions?.node;
export const isEdgeRuntime = typeof (globalThis as any).EdgeRuntime !== 'undefined';
