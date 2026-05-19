export function quzzySearch(query, fields, searchedArray, options) {
    const wholeWords = options?.wholeWords || false;
    const matchThreshold = options?.matchThreshold || 30;
    const maxSkips = options?.maxSkips || 1;
    const minMatchesBetweenSkips = options?.minMatchesBetweenSkips || 3;
    const qwords = query.split(" ");
    return searchedArray.reduce((matches, item) => {
        let searchedItem = fields.map(k => Object(item[k]).toString());
        let matchWeight = 0;
        let match = qwords.filter((qword) => {
            if (/[0-9]/.test(qword)) {
                let numtest = qword.replace(/[^0-9]/g, "");
                if (searchedItem.some(at => RegExp(numtest).test(at))) {
                    matchWeight += 2;
                    return true;
                }
                else
                    return false;
            }
            else {
                let matchLength = 0;
                var test = "";
                var skipcount = 0;
                var matchcount = 0;
                var len = 0;
                const compileExpr = (q) => new RegExp(`(\\s|^)${q.replace(/(?<=\s|^)(ів|йо|іо)/ig, "(ів|іо|йо)")}${(wholeWords && (len == qword.length - 1)) ? '(\\s|$)' : ''}`, "igu");
                var expr;
                for (; len < qword.length; len++) {
                    test += qword[len];
                    expr = compileExpr(test);
                    if (!(searchedItem.some(at => expr.test(at)))) {
                        if (skipcount < maxSkips && matchcount >= minMatchesBetweenSkips) {
                            skipcount++;
                            if (skipcount == maxSkips)
                                matchcount = 0;
                            test = test.slice(0, len) + ".";
                            expr = compileExpr(test);
                            if (!(searchedItem.some(at => expr.test(at)))) {
                                break;
                            }
                        }
                        else
                            break;
                    }
                    else {
                        skipcount = 0;
                        matchcount++;
                    }
                    matchLength = len + 1;
                    if (len == qword.length - 1)
                        matchLength += 1;
                }
                if (matchLength) {
                    matchWeight += matchLength;
                    return true;
                }
                else
                    return false;
            }
        });
        if (match.length && matchWeight) {
            let searchWeight = Math.round((matchWeight / searchedItem.join().length) * 100);
            if (searchWeight > matchThreshold) {
                let result = Object.defineProperty(item, "searchWeight", {
                    value: searchWeight,
                    enumerable: true,
                    configurable: true
                });
                matches.push(result);
            }
        }
        return matches;
    }, []).sort((b1, b2) => b2.searchWeight - b1.searchWeight);
}
