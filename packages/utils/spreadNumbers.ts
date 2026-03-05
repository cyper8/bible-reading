export function spreadNumbers(numlist: string, length?: number) {
  return numlist.split(',')
    .reduce((numRanges: number[], entry) => {
      let boundaries = entry.trim().split('-');
      let first = parseInt(boundaries[0] || '1');
      let last = parseInt(boundaries[1]) || length || first;
      while (entry && first <= last) {
        numRanges.push(first++);
      }
      return numRanges;
    }, []);
}