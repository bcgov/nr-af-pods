import type { Meta, StoryObj } from '@storybook/web-components';
import './FileUpload.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'file-upload',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    documents: [
      {
        annotationid: '30a54177-2008-ef11-9f89-0022483ebf66',
        subject:
          'Note created on 5/2/2024 1:08:21 AM UTC by MihaiNRM Listov [contact:e3e89cb2-1f4c-ee11-be6f-002248ae080f]',
        filename: 'Screenshot 2024-05-01 at 4.27.18 PM.png',
        filesize: 169883,
        modifiedon: '5/1/2024 6:08 PM',
        mimetype: 'image/png',
        status: 'uploaded',
      },
    ],
    inputStr: 'Screenshot 2024-05-01 at 4.27.18 PM.png (165.9 KB)',
    fieldName: 'quartech_copyofconsultantfinalreportorbusinessplan',
  },
  render: function Render(args) {
    const [{ documents, inputStr, fieldName }, updateArgs] = useArgs();
    return html`<file-upload
      docs=${JSON.stringify(documents)}
      fileinputstr=${inputStr}
      fieldname=${fieldName}
      @onChangeFileUpload=${(e: CustomEvent) => {
        action('onChangeFileUpload')(e);
        updateArgs({
          documents: JSON.parse(e.detail.value),
          inputStr: e.detail.fileInputStr,
        });
      }}
      primary
    ></file-upload>`;
  },
};
