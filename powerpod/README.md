# powerpod
Powerpod is a jQuery plugin that enhances functionality of Power Pages components.

# Program-level Configuration

Programs can be configured using the a JSON configuration file.

```
{
  "name": "KTTP-SMEA - KTTP Stream One - Subject Matter Expert Activities",
  "hiddenSteps": "tab_eligibility",
  "sections": [
    {
      "name": "ApplicantInfoStep",
      "fields": [
        {
          "name": "quartech_applicantsprojectname",
          "required": true,
          "hidden": false,
          "hideLabel": false,
          "readOnly": false,
          "doNotBlank": false,
          "label": "Event/Training Title",
          "tooltipText": "The name of the event/training",
          "tooltipTargetElementId": "",
          "elementType": "DropdownSelect",
          "maxLength": 9
          "validation": {
            "intervalBased": true,
            "type": "length",
            "value": 14,
            "comparison": "equalTo",
            "postfix": "digits",
            "overrideDisplayValue": 10
          },
          "format": "currency",
          "maxDigits": 13,
          "emptyInitialValue": true,
          "allowNegatives": true
        }
      ]
    }
  ]
}
```

## Field-Level Config

Fields can be configured inside the `fields` array of `field` objects.

Each object can accept the following options and values:

- `name`: `string` the logical name of the field in the html `id` tag, used for targeting the element.
- `required`: `boolean` whether required validation logic will be applied (blocks user from continuing unless user has a value)
- `hidden`: `boolean` forces field to be hidden
- `label`: `string` override the field label in html
- `hideLabel`: `boolean` hides label element for a field
- `readOnly`: `boolean` makes a field read-only
- `doNotBlank`: `boolean` this will override default field logic that blanks field value whenever a field is hidden
- `tooltipText`: `string` will add a popover element to the field with whatever text you put here
- `tooltipTargetElementId`: `string` if you want to display the tooltip over something besides the default input element, might also be needed for dropdown
- `maxLength`: `number` sets a max length on string inputs
- `validation`: `Object{}` options for configuring custom validation logic for displaying errors or requirements to the user. Contains additional config options (see above for example):
	- `intervalBased`: `boolean` if `true` will run a validation check on this field every 100ms rather than on change. This is necessary to validate programmatically modified fields via 3rd party logic, e.g. Canada Post / Address Complete logic.
	- `type`: `string` accepts the following values:
		- `numeric`: will apply numeric validation, e.g. greaterThan, equalTo, etc. see below. Shows a descriptive error message if requirement not met.
		- `length`: will apply length validation to a string field. Shows error if requirement not met. See below
	- `value`: `number` comparison value used for ***both**** `numeric` and `length` type validation
	- `comparison`: `string` type of comparison, accepts the following values:
		- `equalTo`
		- `greaterThan`
		- `greaterThanOrEqualTo`
		- `lessThan`
		- `lessThanOrEqualTo`
	- `postfix`: `string` adds a postfix message to the value required, e.g. if phone number, you can set postfix to "digits", so the message will read, "...must be 10 ***digits***"
	- `overrideDisplayValue`: `string` used for special scenarios where the value for comparison differs from value we want to display in error message, e.g. since we apply masking to phone numbers "(123) 456-7890", is 10 digits but technically the length/value for comparison is 14
- `elementType`: `string` used for advanced validation on complex fields (plans to deprecate this), accepts one of the following values:
	- `DropdownSelect`
	- `DatePicker`
	- `SingleOptionSet`
	- `MultiOptionSet`
	- `FileInput`	
- `format`: `string` applies custom formatting, accepts one of the following values:
	- `email`:  applies email-specific validation & formatting via jquery mask
	- `currency`: enables currency formatting/display (commas, thousands-separator), see below for currency options
	- `number`: adds `type: number` to html text input and applies jquery mask, enforcing #'s only
	- `percentage`: enforces percentage-like input only on string input fields
	- `postalCode`: enforces postal code format via jquery mask
	- `cra`: enforces CRA number format via jquery mask
	- `phoneNumber`: enforces phone number format e.g. (123) 456-7890 via jquery mask

### currency-related field config
These apply if `"format": "currency"`, but are still defined on field-level, (see above json for an example). Note: this may be confusing, TODO: refactor logic for clarity.
- `maxDigits`: `number` for currency input, limits the number of digits in a given number, e.g. `1000` would be displayed as `1,000.00`, to limit the digits to `9,999.00`, you could pass `6`.
- `emptyInitialValue`: `boolean` for currency input, blanks the initial value instead of showing `0.00`
- `allowNegatives`: `boolean` if true, allow negatives for currency values





