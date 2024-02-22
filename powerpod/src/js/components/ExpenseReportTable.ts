import bootstrap from '../../assets/css/bootstrap.css';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './CurrencyInput';
import './DropdownSearch';
import './TextField';
import { getTotalExpenseAmount, processExpenseTypesData } from '../common/expenseTypes';
import { getExpenseTypeData } from '../common/fetch';

type RowItem = {
  [key: string]: string;
};

type Column = {
  [key: string]: string;
};

type Headings = {
  [key: string]: string;
};

@customElement('expense-report-table')
class ExpenseReportTable extends LitElement {
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Object }) columns: Column[] = [];
  @property({ type: Array }) rows: RowItem[] = [];
  @property({ type: Array }) expenseTypes: string[] = [];

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
      background-color: #2f5fee;
      color: #ffffff;
      text-align: left;
    }
    .styled-table th {
      padding: 12px 15px;
      font-size: 15px;
    }
    .styled-table td {
      padding: 12px 15px 24px;
    }
    .styled-table tbody tr {
      border-bottom: 1px solid #dddddd;
    }

    .styled-table tbody tr:nth-of-type(even) {
      background-color: #f3f3f3;
    }

    .styled-table tbody tr:last-of-type {
      border-bottom: 2px solid #2f5fee;
    }
    .styled-table tbody tr.active-row {
      font-weight: bold;
      color: #009879;
    }
    ::sloted(input) {
      width: 100%;
    }
    .add-another-row {
      background-color: #fff !important;
      line-height: 20px;
    }
    .add-another-row td {
      line-height: 20px;
      padding: 10px 15px 10px;
    }
    .add-another-btn {
      line-height: 1.5;
      font-size: 13px;
    }
    .add-another-btn span {
      padding-bottom: 2px;
    },
    ${unsafeCSS(bootstrap)}
  `;

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();
    this.getExpenseTypes();
  }

  emitEvent() {
    const rowData = this.rows;
    const customEvent = new CustomEvent('onChangeExpenseReportData', {
      detail: {
        id: this.id,
        message: 'Expense report data has changed',
        value: JSON.stringify(rowData),
        total: getTotalExpenseAmount(rowData),
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

  private handleUpdateCell(
    rowIndex: number,
    columnKey: string,
    newValue: string
  ) {
    const rowData = this.rows;
    rowData[rowIndex][columnKey] = newValue;
    this.rows = rowData;
    this.emitEvent();
  }

  private handleAddRow() {
    const rowData = this.rows;
    rowData.push({
      type: '',
      description: '',
      amount: '',
    });
    this.rows = rowData;
    this.emitEvent();
  }

  private handleDeleteRow(rowIndex: number) {
    const rowData = this.rows;
    if (rowData.length === 1) {
      this.rows = [
        {
          type: '',
          description: '',
          amount: '',
        },
      ];
      return;
    }
    rowData.splice(rowIndex, 1);
    this.rows = rowData;
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
          ${this.rows?.length > 0
            ? this.rows.map(
                (row: RowItem, rowIndex: number) => html`
                  <tr>
                    ${this.columns.map((col) => {
                      const cellValue = row[col.id];
                      if (col.id === 'type' && this.expenseTypes?.length) {
                        return html` <td>
                          <dropdown-search
                            .options=${this.expenseTypes}
                            .selectedValue=${cellValue}
                            @onChangeDropdownValue=${(e: CustomEvent) => {
                              this.handleUpdateCell(
                                rowIndex,
                                col.id,
                                e.detail.value
                              );
                              e.stopImmediatePropagation();
                            }}
                          ></dropdown-search>
                        </td>`;
                      } else if (col.id === 'description') {
                        return html` <td>
                          <text-field
                            customStyle="width: 95%"
                            .inputValue=${cellValue}
                            @onChangeTextField=${(e: CustomEvent) => {
                              this.handleUpdateCell(
                                rowIndex,
                                col.id,
                                e.detail.value
                              );
                              e.stopImmediatePropagation();
                            }}
                          ></text-field>
                        </td>`;
                      } else if (col.id === 'amount') {
                        return html`<td>
                          <currency-input
                            .inputValue=${cellValue}
                            @onChangeCurrencyInput=${(e: CustomEvent) => {
                              this.handleUpdateCell(
                                rowIndex,
                                col.id,
                                e.detail.value
                              );
                              e.stopImmediatePropagation();
                            }}
                          ></currency-input>
                        </td>`;
                      }
                      return html`<td>${cellValue}</td>`;
                    })}
                    <td>
                      <button
                        type="button"
                        @click=${() => this.handleDeleteRow(rowIndex)}
                      >
                        <span
                          style="padding-top: 4px; font-weight: bold; font-size: 15px"
                          class="glyphicon glyphicon-trash"
                          role="img"
                          aria-label="Delete"
                        ></span>
                      </button>
                    </td>
                  </tr>
                `
              )
            : ''}
          <tr class="add-another-row">
            <td>
              <button
                type="button"
                class="add-another-btn"
                @click=${this.handleAddRow}
              >
                <span
                  style="padding: 1px 1px 0px 0px"
                  class="glyphicon glyphicon-plus"
                ></span>
                <span style="font-weight: bold">Add Another</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }
}
