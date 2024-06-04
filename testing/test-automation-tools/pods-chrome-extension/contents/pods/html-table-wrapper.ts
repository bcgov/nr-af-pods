export interface HtmlTableWrapper {
    htmlTable: HTMLTableElement,
    headerCells: TableHeaderCell[]
}

export interface TableHeaderCell {
    name: string,
    index: number
}