// A row holds [level, order within that level, move ID].
function* permutations(rows) {
  if (!rows.length) { yield []; return; }
  for (const [index, row] of rows.entries()) {
    for (const tail of permutations(rows.filter((_, i) => i !== index))) yield [row, ...tail];
  }
}
export function predict(rows, level) {
  const levels = new Map();
  for (const row of rows) {
    if (row[0] < 1 || row[0] > level) continue;
    if (!levels.has(row[0])) levels.set(row[0], []);
    levels.get(row[0]).push(row);
  }
  const ambiguous = {moves: [], note: 'The data does not specify enough move ordering information for this level.'};
  let states = [[]];
  for (const at of [...levels.keys()].sort((a,b) => a-b)) {
    const entries = levels.get(at);
    const orders = entries.map(row => row[1]);
    const ordered = entries.length === 1 || (orders.every(n => n !== null) && new Set(orders).size === entries.length);
    if (!ordered && entries.length > 6) return ambiguous;
    const variants = ordered ? [entries.sort((a,b) => a[1]-b[1])] : permutations(entries);
    const next = new Map();
    for (const variant of variants) {
      for (const previous of states) {
        const slots = [...previous];
        for (const [, , move] of variant) {
          if (slots.includes(move)) continue;
          if (slots.length === 4) slots.shift();
          slots.push(move);
        }
        next.set(slots.join(','), slots);
        if (next.size > 4096) return ambiguous;
      }
    }
    states = [...next.values()];
  }
  if (states.length !== 1) return ambiguous;
  return {moves:states[0], note:states[0].length ? 'Predicted from level-up moves.' : 'No level-up moves are recorded at this level.'};
}
