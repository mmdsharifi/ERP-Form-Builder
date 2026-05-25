/** Returns the Tailwind grid-cols class string for a given column count (1–6). */
export const getGridColsClass = (columnsCount: number): string => {
  const map: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };
  return map[columnsCount] ?? 'grid-cols-2';
};

/** Returns the Tailwind col-span class for a field that spans N columns. */
export const getColSpanClass = (span: number): string => {
  const map: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
  };
  return map[span] ?? 'col-span-1';
};
