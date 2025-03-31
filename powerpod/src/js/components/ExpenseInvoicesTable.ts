import bootstrap from '../../assets/css/bootstrap.css';
import shoelace from '../../assets/css/shoelace.css';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './CurrencyInput';
import './DropdownSearch';
import './TextField';
import './DateField';
import { getTotalInvoicesAmount } from '../common/expenseTypes';
import { Logger } from '../common/logger';
import { isLastObjectEmpty } from '../common/utils';

const logger = Logger('components/ExpenseInvoicesTable');

type RowItem = {
  [key: string]: string;
};

type Column = {
  [key: string]: string;
};

type Headings = {
  [key: string]: string;
};

@customElement('expense-invoices-table')
class ExpenseInvoicesTable extends LitElement {
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Object }) columns: Column[] = [];
  @property({ type: Array }) rows: RowItem[] = [];
  @property({ type: Array }) expenseTypes: string[] = [];
  @property({ type: Boolean }) readOnly = false;

  static styles = css`
    ${unsafeCSS(shoelace)}
  `;

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();

    if (!Array.isArray(this.rows)) {
      this.rows = [];
    }

    if (this.rows?.length === 0) {
      this.handleAddRow();
    }
  }

  emitEvent() {
    const rowData = this.rows;
    const customEvent = new CustomEvent('onChangeExpenseInvoicesData', {
      detail: {
        id: this.id,
        message: 'Expense invoices data has changed',
        value: JSON.stringify(rowData),
        total: getTotalInvoicesAmount(rowData),
        pdfJson: JSON.stringify(this.generatePDFJson(rowData)),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
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
    if (isLastObjectEmpty(rowData)) {
      return;
    }
    if (rowData) {
      rowData.push({
        invoiceNum: '',
        invoiceDate: '',
        subtotal: '',
      });
      this.rows = rowData;
    }
    this.emitEvent();
  }

  private handleDeleteRow(rowIndex: number) {
    const rowData = this.rows;
    if (rowData.length === 1) {
      this.rows = [
        {
          invoiceNum: '',
          invoiceDate: '',
          purchasedFrom: '',
          description: '',
          subtotal: '',
        },
      ];
    } else {
      rowData.splice(rowIndex, 1);
      this.rows = rowData;
    }
    this.emitEvent();
  }

  private generatePDFJson(rowData) {
    return {
      expenseInvoicesSection: {
        displayName: 'Expense Invoices',
        expenseInvoicesSectionQuestionAnswerList: rowData.flatMap(
          (invoice, index) => [
            {
              expenseInvoicesSectionQuestion: 'Invoice Line #',
              expenseInvoicesSectionAnswer: (index + 1).toString(),
            },
            {
              expenseInvoicesSectionQuestion: 'Invoice Number',
              expenseInvoicesSectionAnswer: invoice.invoiceNum,
            },
            {
              expenseInvoicesSectionQuestion: 'Invoice Date',
              expenseInvoicesSectionAnswer: invoice.invoiceDate,
            },
            {
              expenseInvoicesSectionQuestion: 'Purchased From',
              expenseInvoicesSectionAnswer: invoice.purchasedFrom,
            },
            {
              expenseInvoicesSectionQuestion: 'Description',
              expenseInvoicesSectionAnswer: invoice.description,
            },
            {
              expenseInvoicesSectionQuestion: 'Subtotal',
              expenseInvoicesSectionAnswer: invoice.subtotal,
            },
            {
              expenseInvoicesSectionQuestion: '--',
              expenseInvoicesSectionAnswer: '--',
            },
          ]
        ),
      },
    };
  }

  render() {
    return html`
      <style>
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
                return html`<th style="width: ${col.width};">${col.name}</th>`;
              })
            }
            ${!this.readOnly ? html`<th />` : html``}
          </tr>
        </thead>
        <tbody>
          ${
            this.rows?.length > 0
              ? this.rows.map(
                  (row: RowItem, rowIndex: number) => html`
                    <tr>
                      ${this.columns.map((col) => {
                        const cellValue = row[col.id];
                        if (
                          col.id === 'invoiceNum' ||
                          col.id === 'purchasedFrom'
                        ) {
                          return html` <td>
                            <text-field
                              customStyle="width: 95%"
                              .inputValue=${cellValue}
                              .readOnly=${this.readOnly}
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
                        } else if (col.id === 'description') {
                          return html` <td>
                            <text-field
                              customStyle="width: 95%"
                              .inputValue=${cellValue}
                              .readOnly=${this.readOnly}
                              maxLength="250"
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
                        } else if (col.id === 'invoiceDate') {
                          return html` <td>
                            <date-field
                              customStyle="width: 95%"
                              .inputValue=${cellValue}
                              .readOnly=${this.readOnly}
                              @onChangeDateField=${(e: CustomEvent) => {
                                this.handleUpdateCell(
                                  rowIndex,
                                  col.id,
                                  e.detail.value
                                );
                                e.stopImmediatePropagation();
                              }}
                            ></text-field>
                          </td>`;
                        } else if (col.id === 'subtotal') {
                          return html`<td>
                            <currency-input
                              .inputValue=${cellValue}
                              .readOnly=${this.readOnly}
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
                  `
                )
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
      <p style="margin:-20px 0px 10px;font-size:14px;">See program guide for eligibile expenses</p>
    `;
  }
}
