// Each painted bird needs its own <mask> id, and a page can show the same bird twice.
let n = 0;
export const nextUid = (prefix: string): string => `${prefix}-${++n}`;
