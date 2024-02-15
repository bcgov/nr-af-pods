import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './CurrencyInput';
import './DropdownSearch';

type RowItem = {
  [key: string]: string | number;
};

type Headings = {
  [key: string]: string;
};

@customElement('expense-report-table')
class ExpenseReportTable extends LitElement {
  static styles = css`
    .styled-table {
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 0.9em;
      font-family: sans-serif;
      min-width: 400px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    }
    .styled-table thead tr {
      background-color: #009879;
      color: #ffffff;
      text-align: left;
    }
    .styled-table th,
    .styled-table td {
      padding: 12px 15px;
    }
    .styled-table tbody tr {
      border-bottom: 1px solid #dddddd;
    }

    .styled-table tbody tr:nth-of-type(even) {
      background-color: #f3f3f3;
    }

    .styled-table tbody tr:last-of-type {
      border-bottom: 2px solid #009879;
    }
    .styled-table tbody tr.active-row {
      font-weight: bold;
      color: #009879;
    }
  `;

  @property({ type: Object }) headings: Headings = {};
  @property({ type: Array }) rows: RowItem[] = [];

  render() {
    return html`
      <table class="styled-table">
        <thead>
          <tr>
            ${this.headings &&
            Object.keys(this.headings).map(
              (key) => html`<th>${this.headings[key]}</th>`
            )}
          </tr>
        </thead>
        <tbody>
          ${this.rows?.length &&
          this.rows.map(
            (row: RowItem) => html`
              <tr>
                ${Object.keys(row).map((col: string, rowIndex: number) => {
                  if (col === 'type') {
                    return html`<td>
                      <dropdown-search
                        selectedvalue=${row[col]}
                        @onChangeDropdownValue=${(e: CustomEvent) => {
                          // here we listen to changes in expense type
                          // as needed, this will update master JSON record.
                          // updateExpenseType(rowIndex)
                          console.log(e);
                        }}
                      ></dropdown-search>
                    </td>`;
                  } else if (col === 'amount') {
                    return html`<td>
                      <currency-input
                        inputvalue=${row[col]}
                        @onChangeInputValue=${(e: CustomEvent) => {
                          // here we listen to changes in currency value and update our row data
                          // as needed, this will update master JSON record.
                          // updateCurrencyInput(rowIndex)
                          console.log(e);
                        }}
                      ></currency-input>
                    </td>`;
                  }
                  return html`<td>${row[col]}</td>`;
                })}
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
