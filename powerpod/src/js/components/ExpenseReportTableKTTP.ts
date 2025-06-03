import bootstrap from '../../assets/css/bootstrap.css';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './CurrencyInput';
import './DropdownSearch';
import './TextField';
import {
  processExpenseTypesData,
  processExpenseTypesDataFromProgramData,
} from '../common/expenseTypes';
import { getExpenseTypeData } from '../common/fetch';
import { Logger } from '../common/logger';
import { isAnyOfLastThreeObjectsEmpty } from '../common/utils';
import { getProgramData } from '../common/program';

const logger = Logger('components/ExpenseReportTableKTTP');

type RowItem = {
  [key: string]: string;
};

type Column = {
  [key: string]: string;
};

type Headings = {
  [key: string]: string;
};

@customElement('expense-report-table-kttp')
class ExpenseReportTableKTTP extends LitElement {
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Object }) columns: Column[] = [];
  @property({ type: Array }) rows: RowItem[] = [];
  @property({ type: Array }) expenseTypes: string[] = [];
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Object, reflect: true }) cellErrors: Record<
    string,
    string
  > = {};
  @property({ type: String }) errorMessage: string = '';

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();

    if (!this.readOnly && this.expenseTypes.length === 0) {
      this.getExpenseTypesFromProgramData();
    }

    if (!Array.isArray(this.rows)) {
      this.rows = [];
    }

    if (this.rows?.length === 0) {
      this.handleAddRow();
    }
  }

  emitEvent() {
    this.hasAnyCellErrors();
    const rowData = this.rows;
    const customEvent = new CustomEvent('onChangeExpenseReportData', {
      detail: {
        id: this.id,
        message: 'Expense report data has changed',
        value: JSON.stringify(rowData),
        total: this.getTotalExpenseAmount(rowData),
        errorMessage: this.errorMessage,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
  }

  private getTotalExpenseAmount(rowData: RowItem[]) {
    console.log(rowData);
    let floatValue = rowData.reduce((acc: number, row: RowItem) => {
      const amount = row['amount'];
      const numericValue = amount.replace(/[^\d.-]/g, '');
      if (!numericValue) return acc;

      const value = parseFloat(numericValue);
      if (row['type'] === 'Cost share contribution (cash or in-kind)') {
        return acc - value;
      } else {
        return acc + value;
      }
    }, 0.0);

    const formattedValue = floatValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formattedValue;
  }

  async getExpenseTypes() {
    const { data } = await getExpenseTypeData();
    if (!data) {
      throw new Error('Expense types task failed');
    }
    this.expenseTypes = processExpenseTypesData(data);
  }

  getExpenseTypesFromProgramData() {
    const programData = getProgramData();

    if (!programData) {
      throw new Error('Failed to get program data');
    }
    this.expenseTypes = processExpenseTypesDataFromProgramData(
      JSON.parse(programData.quartech_expensetypestodisplay)
    );
  }

  private handleValidationForCell(
    rowIndex: number,
    columnKey: string,
    newValue: string
  ) {
    const key = `${rowIndex}-${columnKey}`;
    if (!newValue || newValue.trim() === '') {
      const updated = { ...this.cellErrors };
      updated[key] = 'Please enter a value.';
      this.cellErrors = updated;
    } else {
      const updated = { ...this.cellErrors };
      delete updated[key];
      this.cellErrors = updated;
    }
  }

  private hasAnyCellErrors(): boolean {
    this.cellErrors = {};
    if (this.columns.length && this.rows.length) {
      this.rows.forEach((row, rowIndex) => {
        this.columns.forEach((col) => {
          this.handleValidationForCell(rowIndex, col.id, row[col.id]);
        });
      });
    }
    const hasErrors = Object.values(this.cellErrors).some(
      (error) => typeof error === 'string' && error.trim() !== ''
    );
    if (hasErrors) {
      this.errorMessage = 'Please fill required fields in the table.';
    } else {
      this.errorMessage = '';
    }
    return hasErrors;
  }

  private handleUpdateCell(
    rowIndex: number,
    columnKey: string,
    newValue: string
  ) {
    const rowData = this.rows;
    rowData[rowIndex][columnKey] = newValue ?? '';
    this.rows = rowData;
    this.emitEvent();
  }

  private handleAddRow() {
    const rowData = this.rows;
    if (isAnyOfLastThreeObjectsEmpty(rowData)) {
      return;
    }
    if (rowData) {
      rowData.push({
        type: '',
        description: '',
        amount: '',
      });
      this.rows = rowData;
    }
    this.emitEvent();
  }

  private handleDeleteRow(rowIndex: number) {
    const rowData = this.rows;
    if (rowIndex <= 2) {
      let currentRow = this.rows[rowIndex];
      if (rowIndex === 0) {
        currentRow = {
          type: 'Administration Costs',
          description: '',
          amount: '',
        };
      } else if (rowIndex === 1) {
        currentRow = {
          type: 'Cost share contribution (cash or in-kind)',
          description: '',
          amount: '',
        };
      } else if (rowIndex === 2) {
        currentRow = {
          type: 'SME / Facilitator Fee',
          description: '',
          amount: '',
        };
      }
      let rowsCopy = this.rows;
      rowsCopy[rowIndex] = currentRow;
      this.rows = rowsCopy;
    } else {
      rowData.splice(rowIndex, 1);
      this.rows = rowData;
    }
    // this.columns.forEach((col) => {
    //   this.handleValidationForCell(rowIndex, col.id, '');
    // });
    this.emitEvent();
  }

  render() {
    return html`
      <style>
        #errorMessage {
          margin: 0px;
          margin-top: -15px;
          font-size: 13px;
          color: #e23636;
          padding: 0px;
          position: absolute;
          ${
            !this.errorMessage && !this.errorMessage?.length
              ? css`
                  display: none;
                `
              : css`
                  display: block;
                `
          }
        }
        .styled-table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          ${
            !this.readOnly
              ? css`
                  font-size: 0.9em;
                `
              : css``
          }
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
          ${
            !this.readOnly
              ? css`
                  font-size: 15px;
                `
              : css``
          }
        }
        .styled-table td {
          padding: 5px 15px 20px;
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
          ${
            !this.readOnly
              ? css`
                  font-size: 13px;
                `
              : css``
          }
        }
        .add-another-btn span {
          padding-bottom: 2px;
        },
        ${bootstrap}
      </style>
      <table class="styled-table">
        <thead>
          <tr>
            ${
              this.columns &&
              this.columns.map((col) => {
                return html`<th style="width: ${col.width};">
                  ${col.name}<span style="color:red;">*</span>
                </th>`;
              })
            }
            ${!this.readOnly ? html`<th />` : html``}
          </tr>
        </thead>
        <tbody>
          ${
            this.rows?.length > 0
              ? this.rows.map((row: RowItem, rowIndex: number) => {
                  return html`
                    <tr>
                      ${this.columns.map((col) => {
                        const key = `${rowIndex}-${col.id}`;
                        const cellValue = row[col.id];
                        if (
                          !this.readOnly &&
                          col.id === 'type' &&
                          this.expenseTypes?.length
                        ) {
                          return html` <td>
                            <dropdown-search
                              .options=${this.expenseTypes}
                              .selectedValue=${cellValue}
                              .disabled=${rowIndex <= 2 ? true : false}
                              .errorMessage=${this.cellErrors[key] || ''}
                              additionalTextBelowField="See program guide for eligible expenses"
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
                        } else if (this.readOnly && col.id === 'type') {
                          return html` <td>
                            <text-field
                              customStyle="width: 95%"
                              .inputValue=${cellValue}
                              .readOnly=${this.readOnly}
                            ></text-field>
                          </td>`;
                        } else if (col.id === 'description') {
                          return html` <td>
                            <text-field
                              customStyle="width: 95%"
                              .inputValue=${cellValue}
                              .readOnly=${this.readOnly}
                              .errorMessage=${this.cellErrors[key] || ''}
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
                              .readOnly=${this.readOnly}
                              .errorMessage=${this.cellErrors[key] || ''}
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
                      ${!this.readOnly
                        ? html`
                            <td>
                              <button
                                type="button"
                                @click=${() => this.handleDeleteRow(rowIndex)}
                              >
                                <span
                                  style="padding-top: 4px; font-weight: bold; ${!this
                                    .readOnly
                                    ? 'font-size: 15px'
                                    : ''}"
                                  class="glyphicon glyphicon-trash"
                                  role="img"
                                  aria-label="Delete"
                                ></span>
                              </button>
                            </td>
                          `
                        : html``}
                    </tr>
                  `;
                })
              : ''
          }
          ${
            !this.readOnly
              ? html`
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
                `
              : html``
          }
          </tbody>
        </tbody>
      </table>
      <p id="errorMessage" class="error-message">
        ${this.errorMessage || ''}
      </p>
    `;
  }
}
