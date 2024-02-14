import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './CurrencyInput';

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
            (i: RowItem) => html`
              <tr>
                ${Object.keys(i).map((key: string) => {
                  if (key === 'amount') {
                    return html`<td>
                      <currency-input inputValue=${i[key]}></currency-input>
                    </td>`;
                  }
                  return html`<td>${i[key]}</td>`;
                })}
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
