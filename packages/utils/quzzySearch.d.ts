export interface QuzzySearchOptions {
    wholeWords?: boolean;
    matchThreshold?: number;
    maxSkips?: number;
    minMatchesBetweenSkips?: number;
}
export declare function quzzySearch<T>(query: string, fields: Array<keyof T>, searchedArray: T[], options?: QuzzySearchOptions): (T & {
    searchWeight: number;
})[];
//# sourceMappingURL=quzzySearch.d.ts.map