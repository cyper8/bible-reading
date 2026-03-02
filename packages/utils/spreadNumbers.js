export function spreadNumbers(numlist, length) {
    return numlist.split(',')
        .reduce((numRanges, entry) => {
        let boundaries = entry.trim().split('-');
        let first = parseInt(boundaries[0] || '1');
        let last = parseInt(boundaries[1]) || length || first;
        while (entry && first <= last) {
            numRanges.push(first++);
        }
        return numRanges;
    }, []);
}
