import bootstrap from '../../assets/css/bootstrap.css';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './CurrencyInput';
import './DropdownMultiSelect';
import './TextField';
import { processTypesOfFoodData } from '../common/typesOfFood';
import { getTypesOfFoodData } from '../common/fetch';
import { Logger } from '../common/logger';
import { isLastObjectEmpty } from '../common/utils';

const logger = Logger('components/ClaimInfoGridVLB');

type RowItem = {
  [key: string]: string;
};

type Column = {
  [key: string]: string;
};

type Header = {
  title: string;
};

@customElement('claim-info-grid-vlb')
class ClaimInfoGridVLB extends LitElement {
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Object }) columns: Column[] = [];
  @property({ type: Object }) header: Header = { title: '' };
  @property({ type: Array }) rows: RowItem[] = [];
  @property({ type: Array }) typesOfFood: string[] = [];
  @property({ type: Boolean }) readOnly = false;

  static emptyRowObject = {
    name: '',
    city: '',
    email: '',
    staffNumber: '',
    typeOfFood: '',
    dates: '',
  };

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();

    if (!this.readOnly) {
      this.getTypesOfFood();
    }

    if (!Array.isArray(this.rows)) {
      this.rows = [];
    }

    if (this.rows?.length === 0) {
      this.handleAddRow();
    }
  }

  emitEvent() {
    const rowData = this.rows;
    const customEvent = new CustomEvent('onChangeClaimInfoGridVLBData', {
      detail: {
        id: this.id,
        message: 'Claim info grid VLB data has changed',
        value: JSON.stringify(rowData),
        pdfJson: JSON.stringify(this.generatePDFJson(rowData)),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
  }

  async getTypesOfFood() {
    const { data } = await getTypesOfFoodData();
    if (!data) {
      throw new Error('Types of Food task failed');
    }
    this.typesOfFood = processTypesOfFoodData(data);
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
      rowData.push(ClaimInfoGridVLB.emptyRowObject);
      this.rows = rowData;
    }
    this.emitEvent();
  }

  private handleDeleteRow(rowIndex: number) {
    const rowData = this.rows;
    if (rowData.length === 1) {
      this.rows = [ClaimInfoGridVLB.emptyRowObject];
    } else {
      rowData.splice(rowIndex, 1);
      this.rows = rowData;
    }
    this.emitEvent();
  }

  private renderColumnItem(row, col, rowIndex) {
    const cellValue = row[col.id];
    if (!this.readOnly && col.id === 'typeOfFood' && this.typesOfFood?.length) {
      return html` <td>
        <dropdown-multiselect
          fieldLabel=${col.name}
          required
          .options=${this.typesOfFood}
          .selectedOptions=${cellValue}
          @onChangeDropdownMultiselectValues=${(e: CustomEvent) => {
            this.handleUpdateCell(rowIndex, col.id, e.detail.selectedOptions);
            e.stopImmediatePropagation();
          }}
        ></dropdown-multiselect>
      </td>`;
    } else if (this.readOnly && col.id === 'typeOfFood') {
      return html` <td>
        <text-field
          required
          fieldLabel=${col.name}
          customStyle="width: 95%"
          .inputValue=${cellValue}
          .readOnly=${this.readOnly}
        ></text-field>
      </td>`;
    } else if (
      col.id === 'name' ||
      col.id === 'city' ||
      col.id === 'email' ||
      col.id === 'staffNumber' ||
      col.id === 'dates'
    ) {
      return html` <td>
        <text-field
          required
          fieldLabel=${col.name}
          customStyle="width: 95%"
          .inputValue=${cellValue}
          .readOnly=${this.readOnly}
          @onChangeTextField=${(e: CustomEvent) => {
            this.handleUpdateCell(rowIndex, col.id, e.detail.value);
            e.stopImmediatePropagation();
          }}
        ></text-field>
      </td>`;
    }
    return html`<td>${cellValue}</td>`;
  }

  private renderDeleteBtn(rowIndex: number) {
    if (!this.readOnly) {
      return html`
        <td>
          <button
            style="position: relative; top: -32px;"
            type="button"
            @click=${() => this.handleDeleteRow(rowIndex)}
          >
            <span
              style="padding-top: 4px; font-weight: bold; ${!this.readOnly
                ? 'font-size: 15px'
                : ''}"
              class="glyphicon glyphicon-trash"
              role="img"
              aria-label="Delete"
            ></span>
          </button>
        </td>
      `;
    }
    return html``;
  }

  private generatePDFJson(rowData) {
    return {
      locumServicePracticesSection: {
        locumServicePracticesSectionQuestionAnswerList: rowData.flatMap(
          (practice, index) => [
            {
              locumServicePracticesSectionQuestion: 'Practice #',
              locumServicePracticesSectionAnswer: (index + 1).toString(),
            },
            {
              locumServicePracticesSectionQuestion: 'Name',
              locumServicePracticesSectionAnswer: practice.name,
            },
            {
              locumServicePracticesSectionQuestion: 'Staff Number(s)',
              locumServicePracticesSectionAnswer: practice.staffNumber,
            },
            {
              locumServicePracticesSectionQuestion: 'Location City',
              locumServicePracticesSectionAnswer: practice.city,
            },
            {
              locumServicePracticesSectionQuestion:
                'Types of food animals services',
              locumServicePracticesSectionAnswer: practice.typeOfFood,
            },
            {
              locumServicePracticesSectionQuestion: 'Email',
              locumServicePracticesSectionAnswer: practice.email,
            },
            {
              locumServicePracticesSectionQuestion: 'Date(s)',
              locumServicePracticesSectionAnswer: practice.dates,
            },
            {
              locumServicePracticesSectionQuestion: '---',
              locumServicePracticesSectionAnswer: '---',
            },
          ]
        ),
        displayName: 'Practice(s) Where Locum Services Were Delivered',
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

        .styled-table tbody tr:nth-of-type(4n+1), 
        .styled-table tbody tr:nth-of-type(4n+2) {
          background-color: white;
        }

        .styled-table tbody tr:nth-of-type(4n+2) {
          border-bottom: 1px solid #dddddd;
        }

        .styled-table tbody tr:nth-of-type(4n+3), 
        .styled-table tbody tr:nth-of-type(4n+4) {
          background-color: #f3f3f3;
        }

        .styled-table tbody tr:nth-of-type(4n+4) {
          border-bottom: 1px solid #dddddd;
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
        ${
          this.header && this.header.title?.length
            ? html`<tr>
                <th
                  colspan="${this.columns?.length || 1}"
                  style="text-align: center;"
                >
                  ${this.header.title}
                </th>
              </tr>`
            : html``
        }
        </thead>
        <tbody>
          ${
            this.rows?.length > 0
              ? this.rows.map(
                  (row: RowItem, rowIndex: number) => html`
                    <tr>
                      ${this.columns
                        .slice(0, 3)
                        .map((col) =>
                          this.renderColumnItem(row, col, rowIndex)
                        )}
                      <td />
                    </tr>
                    <tr>
                      ${this.columns
                        .slice(3, 6)
                        .map((col) =>
                          this.renderColumnItem(row, col, rowIndex)
                        )}
                      ${this.renderDeleteBtn(rowIndex)}
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
    `;
  }
}
