import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './CurrencyInput';
import './DropdownSearch';
import './TextField';
import { processExpenseTypesData } from '../common/expenseTypes';
import { getExpenseTypeData } from '../common/fetch';

type RowItem = {
  [key: string]: string | number;
};

type Column = {
  [key: string]: string;
};

type Headings = {
  [key: string]: string;
};

@customElement('expense-report-table')
class ExpenseReportTable extends LitElement {
  static styles = css`
    .styled-table {
      width: 100%;
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

  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Object }) columns: Column[] = [];
  @property({ type: Array }) rows: RowItem[] = [];
  @property({ type: Array }) expenseTypes: string[] = [];

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();
    this.getExpenseTypes();
  }

  emitEvent() {
    const customEvent = new CustomEvent('onChangeExpenseReportData', {
      detail: {
        id: this.id,
        message: 'Expense report data has changed',
        value: JSON.stringify(this.rows),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
  }

  async getExpenseTypes() {
    const data = await getExpenseTypeData();
    if (!data) {
      throw new Error('Expense types task failed');
    }
    this.expenseTypes = processExpenseTypesData(data);
  }

  updateTableData(rowIndex: number, columnKey: string, newValue: string) {
    this.rows[rowIndex][columnKey] = newValue;
    this.emitEvent();
  }

  handleAddRow() {
    this.rows.push({
      type: '',
      description: '',
      amount: '',
    });
    this.emitEvent();
  }

  handleDeleteRow(rowIndex: number) {
    this.rows.splice(rowIndex, 1);
    this.emitEvent();
  }

  render() {
    return html`
      <table class="styled-table">
        <thead>
          <tr>
            ${this.columns &&
            this.columns.map((col) => {
              return html`<th style="width: ${col.width};">${col.name}</th>`;
            })}
            <th />
          </tr>
        </thead>
        <tbody>
          ${this.rows?.length &&
          this.rows.map(
            (row: RowItem, rowIndex: number) => html`
              <tr>
                ${this.columns.map((col) => {
                  const cellValue = row[col.id];
                  if (col.id === 'type' && this.expenseTypes?.length) {
                    return html`<td>
                      <dropdown-search
                        .options=${this.expenseTypes}
                        .selectedValue=${cellValue}
                        @onChangeDropdownValue=${(e: CustomEvent) => {
                          this.updateTableData(
                            rowIndex,
                            col.id,
                            e.detail.value
                          );
                        }}
                      ></dropdown-search>
                    </td>`;
                  } else if (col.id === 'description') {
                    return html`<td>
                      <text-field
                        .inputValue=${cellValue}
                        @onChangeTextField=${(e: CustomEvent) => {
                          this.updateTableData(
                            rowIndex,
                            col.id,
                            e.detail.value
                          );
                        }}
                      ></text-field>
                    </td>`;
                  } else if (col.id === 'amount') {
                    return html`<td>
                      <currency-input
                        .inputValue=${cellValue}
                        @onChangeCurrencyInput=${(e: CustomEvent) => {
                          this.updateTableData(
                            rowIndex,
                            col.id,
                            e.detail.value
                          );
                        }}
                      ></currency-input>
                    </td>`;
                  }
                  return html`<td>${cellValue}</td>`;
                })}
                <td>
                  <button @click=${() => this.handleDeleteRow(rowIndex)}>
                    Delete
                  </button>
                </td>
              </tr>
            `
          )}
          <tr>
            <td><button @click=${this.handleAddRow}>Add another</button></td>
          </tr>
        </tbody>
      </table>
    `;
  }
}
