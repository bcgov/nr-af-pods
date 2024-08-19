/*
 * SOL - Searchable Option List jQuery plugin
 * Version 2.0.0
 * https://pbauerochse.github.io/searchable-option-list/
 *
 * Copyright 2015, Patrick Bauerochse
 *
 * Portions copyright (C) Microsoft Corporation. All rights reserved.
 * v3.0.30
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 */

/*jslint nomen: true */
function initializeMsosLibrary($, window, document) {
    'use strict';

    // constructor
    var MultiSelectOptionSet = function ($element, options) {
        this.$originalElement = $element;
        this.options = options;

        // allow setting options as data attribute
        // e.g. <select data-msos-options="{'allowNullSelection':true}">
        this.metadata = this.$originalElement.data('msos-options');

        // debounce timer
        // this timer is used to prevent some necessary but potentially
        // costly operations from firing too often
        this.debounceId = null;
        this.debounceTimeout = 5; // in milliseconds

        // blur timer
        // when tabbing out of the control, a few housekeeping events need to be done
        // this timer lets that happen and ensures it doesn't happen too often
        this.blurTimerId = null;
        this.blurTimerTimeout = 5; // in milliseconds

        // IE11 detection
        // in some cases, we need to change the control's behaviour specifically for IE11
        this.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

        // prevent clearing debounce timer after unselecting an item
        this.isSelectionChanging = false;
    };

    // plugin prototype
    MultiSelectOptionSet.prototype = {
        SOL_OPTION_FORMAT: {
            type: 'option',         // fixed
            value: undefined,       // value that will be submitted
            selected: false,        // boolean selected state
            disabled: false,        // boolean disabled state
            label: undefined,       // label string
            tooltip: undefined      // tooltip string
        },
        SOL_OPTIONGROUP_FORMAT: {
            type: 'optiongroup',    // fixed
            label: undefined,       // label string
            tooltip: undefined,     // tooltip string
            disabled: false,        // all children disabled boolean property
            children: undefined     // array of SOL_OPTION_FORMAT objects
        },

        DATA_KEY: 'msos-element',
        WINDOW_EVENTS_KEY: 'msos-control-count',

        // default option values
        defaults : {
            data: undefined,
            name: undefined,           // name attribute, can also be set as name="" attribute on original element or data-sol-name=""
            defaultMaxRowsInCurrentSelections: undefined,
            accessibilityLabel: undefined,
            isRTL: undefined,
            shouldDefaultFocusonInput: undefined,
            isControlDisabled: false,
            required: false,
            key : undefined,
            texts : {
                // updated strings
                noItemsAvailable: "No entries found",
                selectAll: "Select all",
                selectAllDeselect: "{0} items removed",
                selectAllSelect: "{0} items selected",
                totalItems: "{0} items",
                searchPlaceholder: "Select or search options",
                expand: "+{0}",
                collapse: "less",

                // additional strings
                viewmodeExpandLabel: "Expand",
                viewmodeCollapseLabel: "Collapse",
                viewmodeExpandCollapseLabel: "Expand or collapse selected content",
                resultsFound: "Number of results: {0}",
                deleteItemLabel: "Remove {0}",
                expandLabel: "Show {0} more selected items",
                collapseLabel: "Show fewer selected items",
                dropdownToggleLabel: "Toggle menu",
                noItemsSelected: "---",
                viewmodeItemsSeparator: ", ",
                selectedItemAdded: "{0} added",
                selectedItemRemoved: "{0} removed",
                selectedItemsInstructions: "Use the arrow keys to navigate through the list of currently selected items. Press delete or backspace to deselect an item. For touch devices, use swipe and touch gestures to explore the list.",
                comboboxInstructions: "Use the arrow keys to navigate through the list of items. Press space to select or deselect an item. For touch devices, use swipe and touch gestures to explore this list.",
                selectedItemsLabel: "Selected values for {0}"
            },

            events: {
                onInitialized: undefined,
                onRendered: undefined,
                onOpen: undefined,
                onClose: undefined,
                onChange: undefined,
                onPointerEnter: undefined,
                onPointerLeave: undefined,
                onPointerDown: undefined,
                onPointerUp: undefined,
                onScroll: undefined
            },

            useBracketParameters: false,
            multiple: true,
            showSelectAll: true,
            showSelectionBelowList: false,
            allowNullSelection: false,
            scrollTarget: $(window),
            maxHeight: undefined,
            converter: undefined,
            labelledBy: undefined,

            // if true, the selected items (if applicable) and filter input will always be visible
            // used in the Grid control to faciliate editing
            alwaysActive: false,

            // if false, the dropdown will not automatically expand when the filter textbox is focused
            // in order to comply with the Microsoft Accessibility Standards, this is `false` by default
            autoExpandDropdown: false,

            // Experimental: if true, the combobox elements are rendered fullscreen when the dropdown is expanded
            // used for mobile/small formfactor displays
            fullscreenCombobox: false
        },

        // initialize the plugin
        init: function () {
            this.config = $.extend(true, {}, this.defaults, this.options, this.metadata);

            var originalName = this._getNameAttribute();
            if (!originalName) {
                this._showErrorLabel('name attribute is required');
                return;
            }

            this.config.multiple = this.config.multiple || this.$originalElement.attr('multiple');

            // event binding
            this._handleWindowResize = this._handleWindowResize.bind(this);

            this._incrementCountAndRegisterEvents();
            this._attachWindowResizeHandler();
            this._initializeUiElements();
            this._initializeInputEvents();
            this._initializeData();

            // now that the data is ready, we can populate the viewmode container
            this._populateViewmodeContainer();

            // and update the selected items expansion toggle
            this._updateExpandSelectedItemsButtonText();

            // take original form element out of form submission
            // by removing the name attribute
            this.$originalElement
                .data(this.DATA_KEY, this)
                .removeAttr('name')
                .data('sol-name', originalName)
                .hide();

            if (this.config.shouldDefaultFocusonInput) {
                if (this.$input) {
                    this.$input.focus(); //Focus Input after Init
                }
            }

            return this;
        },

        // these pointer events should always be invoked; they cannot be overridden in the events object
        _onPointerEnter: function() {
            this.$container.addClass("msos-active");

            // skip updating selection if it's already updating
            if (!this.isSelectionChanging) {
                if (this.debounceId) {
                    clearTimeout(this.debounceId);
                }

                var self = this;
                this.debounceId = setTimeout(function() {
                    self._updateExpandSelectedItemsButtonText();
                }, this.debounceTimeout);
            }
        },

        _onPointerLeave: function() {
            if (this.config.alwaysActive) {
                return;
            }

            if (!this.$container.hasClass("msos-focused")) {
                this.$container.removeClass("msos-active");
                this._collapseSelectedItemsContainer();

                if (this.debounceId) {
                    clearTimeout(this.debounceId);
                }
            }
        },

        _onPointerDown: function() {
            this._activateControl();
        },

        _getNameAttribute: function () {
            return this.config.name || this.$originalElement.data('sol-name') || this.$originalElement.attr('name');
        },

        // shows an error label
        _showErrorLabel: function (message) {
            var $errorMessage = $('<div style="color: red; font-weight: bold;" />').html(message);
            if (!this.$container) {
                $errorMessage.insertAfter(this.$originalElement);
            } else {
                this.$container.append($errorMessage);
            }
        },

        // Create & attach window resize handler
        _handleWindowResize: function (e) {
            this._collapseViewmodeContainer();
            this.refreshControl(this.getValues());
        },

        _attachWindowResizeHandler: function () {
            $(window).on('resize', this._handleWindowResize);
        },

        _activateControl: function() {
            if (this.config.alwaysActive) {
                return;
            }

            this.$container.addClass("msos-active msos-focused");
        },

        _deactivateControl: function(e) {
            // close dropdown and deactivate this control (remove active & focus classes)
            if (this.isOpen()) {
                this.close();
            }

            // collapse the expanded selected items, if necessary
            this._collapseSelectedItemsContainer();
            if (this._getSelectedItemsCount() > 0) {
                // reset the selected item active descendant to the first item
                this._updateCurrentlySelectedItem(this._getVisibleSelectedItems().first());
            }

            if (this.config.alwaysActive) {
                return;
            }

            this.$container.removeClass("msos-active msos-focused");
        },

        _collapseSelectedItemsContainer: function() {
            this.$currentSelectionContainer.scrollTop(0);
            this.$selectedItemsContainer.removeClass("msos-selecteditems-expanded");
            this._updateExpandSelectedItemsButtonText();
        },

        _expandSelectedItemsContainer: function() {
            this.$selectedItemsContainer.addClass("msos-selecteditems-expanded");
            this.$selectedItemsToggleButton
                .text(this.config.texts.collapse)
                .attr("aria-label", this.config.texts.collapseLabel);
        },

        // public wrapper
        deactivate: function() {
            this._deactivateControl();
        },

        _deactivateOtherControls: function(e) {
            // what was clicked?
            var $target = $(e.target);
            var $closestInnerContainer = $target.closest(".msos-inner-container");
            var $closestSolContainer = $target.closest(".msos-container");

            // clicking within the active control's inner container; no need to do anything
            if ($closestInnerContainer.length && $closestSolContainer.hasClass("msos-open")) {
                return;
            }

            // collapse any open dropdown
            // there should only be one, but let's iterate through the collection to be sure
            $(".msos-container.msos-open")
                .each(function(index, item) {
                    $(item).data(MultiSelectOptionSet.prototype.DATA_KEY).close();
                });

            // now that the dropdown is closed, we should remove any existing active & focused classes
            // before (re-) applying them to the current sol container (if it exists)
            $(".msos-container.msos-active.msos-focused")
                .not($closestSolContainer)
                .each(function(index, item) {
                    $(item).data(MultiSelectOptionSet.prototype.DATA_KEY).deactivate();
                });
        },

        // increment the window-level control count and if necessary register
        // the click/touch handler that determines when to trigger the close event
        _incrementCountAndRegisterEvents: function () {
            var count = window[this.WINDOW_EVENTS_KEY] || 0;

            // only attach the handler if the count is 0; while the count should never
            // be less than 0, this will handle that improbable scenario
            if (count < 1) {
                $(document).on("mousedown touchstart", this._deactivateOtherControls);
                count = 0; // reset count
            }

            // increment the control count by 1
            window[this.WINDOW_EVENTS_KEY] = count + 1;
        },

        // add sol ui elements
        _initializeUiElements: function () {
            var self = this;

            this.internalScrollWrapper = function () {
                if ($.isFunction(self.config.events.onScroll)) {
                    self.config.events.onScroll.call(self);
                }
            };

            // aria-describedby instruction containers
            this.$selectedItemsInstructions = $("<div class='msos-a11y' aria-hidden='true' />")
                .attr("id", "{0}_selecteditems_instructions".replace('{0}', this.config.key))
                .text(this.config.texts.selectedItemsInstructions);

            this.$comboboxInstructions = $("<div class='msos-a11y' aria-hidden='true' />")
                .attr("id", "{0}_combobox_instructions".replace('{0}', this.config.key))
                .text(this.config.texts.comboboxInstructions);

            // aria-related accessibility elements
            this.$alertContainer = $('<div class="msos-alert-text" aria-live="assertive" aria-atomic="true" aria-relevant="additions" />');

            // filter input
            var inputElement = '<input id={0}_ledit type="text" class="msos-input" />';
            this.$input = $(inputElement.replace('{0}', this.config.key))
                .attr('placeholder', this.config.texts.searchPlaceholder)
                .attr('aria-label', this.config.accessibilityLabel)
                .attr("aria-autocomplete", "list")
                .attr("aria-describedby", this.$comboboxInstructions.attr("id"))
                .on("focus", function(e) {
                    if (self.isClosed() && self.config.autoExpandDropdown) {
                        self.open();
                    }
                })
                .click(function () {
                    this.focus();
                });

            // filter input required attribute
            if (this.config.required) {
                this.$input.attr("required", true).attr("aria-invalid", false);
            }

            // no results menu item
            var noresultsContainer = '<div id={0} class="msos-no-results"/>';
            this.$noResultsItem = $(noresultsContainer.replace('{0}', (this.config.key + "_no-results")))
                .text(this.config.texts.noItemsAvailable).addClass("msos-hidden");

            // dropdown toggle button / caret
            var $caretContainer = $("<div class='msos-caret-container' />");
            this.$caret = $('<button class="msos-caret-button" tabindex="-1"><span class="msos-glyph" /></button>')
                .attr("aria-label", this.config.texts.dropdownToggleLabel)
                .click(function () {
                    self.toggle(true); // the true boolean will autofocus the input
                });
            $caretContainer.append(this.$caret);

            // filter container
            var $filterContainer = $("<div class='msos-filter-container' />");

            // combobox elements & container
            var $inputContainer = $('<div class="msos-input-container"/>').append(this.$input);

            $filterContainer
                .append($inputContainer)
                .append($caretContainer);

            this.$innerContainer = $("<div class='msos-inner-container' />")
                .attr("role", "combobox")
                .attr("aria-haspopup", "true")
                .attr("aria-expanded", "false")
                .attr("aria-activedescendant", null)
                .attr('aria-label', this.config.accessibilityLabel)
                .on("mousedown", function(e) {
                    if (self.config.fullscreenCombobox && e.target && e.target === this) {
                        // if the dropdown is fullscreen, ignore whitespace clicks
                        return false;
                    }
                })
                .append($filterContainer);

            // the dropdown itself
            this.$selection = $('<ul class="msos-selected-items msos-selection" role="listbox" tabindex="-1" />')
                .attr("aria-multiselectable", this.config.showSelectAll)
                .attr("aria-labelledby", this.config.labelledBy);
            this.$selectionContainer = $('<div class="msos-selection-container" />')
                .append(this.$noResultsItem)
                .append(this.$selection)
                .appendTo(this.$innerContainer);

            // main container
            var solContainer = '<div id={0}_i class="msos-container" />';
            this.$container = $(solContainer.replace('{0}', this.config.key))
                .data(this.DATA_KEY, this)
                .toggleClass("msos-active msos-focused", this.config.alwaysActive);

            // only append the aria live region & instructions if the control isn't disabled
            if (!this.config.isControlDisabled) {
                this.$container.append(this.$alertContainer)
                    .append(this.$selectedItemsInstructions)
                    .append(this.$comboboxInstructions);
            }

            this.$container.append(this.$innerContainer)
                .insertBefore(this.$originalElement);

            // selected items containers (the items and toggle button)
            this.$selectedItemsContainer = $("<div class='msos-selecteditems-container' />");
            this.$selectedItemsToggleContainer = $("<div class='msos-selecteditems-toggle-container' />");

            // the +X/less toggle button
            // this should not be visible until we can determine the number of hidden selected items (hence the '.msos-invisible' class)
            // the button will always be aria-hidden, however, since the selected items list is always available to screen readers
            this.$selectedItemsToggleButton = $("<button class='msos-selecteditems-toggle msos-invisible' tabindex='-1' aria-hidden='true' />")
                .text(this.config.texts.expand)
                .on("click", function() {
                    self._toggleSelectedItemsContainerHeight();

                    // in either case, we should send focus to the currently-selected items
                    self.$currentSelectionContainer.focus();
                });
            this.$selectedItemsToggleContainer.append(this.$selectedItemsToggleButton);

            // selected items display container
            this.$currentSelectionContainer = $("<ul class='msos-selecteditems msos-current-selection-normal' />")
                .attr("tabindex", this.config.alwaysActive ? "0" : "-1")
                .attr("aria-label", this.config.texts.selectedItemsLabel.replace("{0}", this.config.accessibilityLabel))
                .attr("aria-labelledby", this.config.labelledBy)
                .on("focus", function(e) {
                    var el = $(this);

                    // remove the any 'active' properties from the selected items
                    el.children().removeClass("msos-selecteditem-active");

                    // remove any existing active classes
                    var activeDescendant = el.attr("aria-activedescendant") || self._getSelectedItems().first().attr("id");
                    if (!activeDescendant) {
                        return;
                    }

                    var selector = self.formatString("#{0}", activeDescendant);
                    var target = el.find(selector).first(); // in the (broken) event that there are 2+ results, use the first one
                    if (!target.length) {
                        return;
                    }

                    if (!target.hasClass("msos-visible") && !self.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                        // we're trying to activate a hidden item; instead, focus the first
                        target = self._getVisibleSelectedItems().first();
                        activeDescendant = target.attr("id");
                    }

                    // render the target as active
                    target.addClass("msos-selecteditem-active");
                    el.attr("aria-activedescendant", activeDescendant);
                })
                .on("blur", function() {
                   // remove the focused class
                    $(this).removeClass("msos-selecteditems-focused");
                });

            if (this.config.showSelectionBelowList) {
                this.$selectedItemsContainer.append(this.$selectedItemsToggleContainer);
                this.$selectedItemsContainer.append(this.$currentSelectionContainer);
            } else {
                this.$selectedItemsContainer.append(this.$currentSelectionContainer);
                this.$selectedItemsContainer.append(this.$selectedItemsToggleContainer);
            }

            // append the selected items container to its parent
            this.$selectedItemsContainer.insertBefore(this.$innerContainer);

            // viewmode (readonly/disabled) selected item container
            var viewmodeContainerId = this.config.key + "_viewmodecontainer";
            this.$viewmodeContainer = $("<div class='msos-viewmode-container' id='" + viewmodeContainerId + "' />");

            // viewmode selected items content & inner text container
            this.$viewmodeContent = $("<div class='msos-viewmode-content' />");
            this.$viewmodeText = $("<div class='msos-viewmode-text' />");
            this.$viewmodeContent.append(this.$viewmodeText);
            this.$viewmodeContainer.append(this.$viewmodeContent);

            // viewmode expand/collapse button & container
            this.$viewmodeButtonContainer = $("<div class='msos-viewmode-button-container' />");
            this.$viewmodeExpansionToggle = $("<button class='msos-viewmode-button'><span class='msos-glyph' /></button>")
                .attr({
                    "aria-controls": viewmodeContainerId,
                    "aria-expanded": false,
                    "aria-label": this.config.texts.viewmodeExpandCollapseLabel,
                })
                .on("click", function(e) {
                    self.$viewmodeContainer.toggleClass("msos-viewmode-expanded");

                    // update aria-expanded state
                    var expanded = self.$viewmodeContainer.hasClass("msos-viewmode-expanded");
                    $(this).attr("aria-expanded", expanded);
                });
            this.$viewmodeButtonContainer.append(this.$viewmodeExpansionToggle);
            this.$viewmodeContainer.append(this.$viewmodeButtonContainer);

            // append the viewmode container to its parent
            this.$viewmodeContainer.insertBefore(this.$selectedItemsContainer);

            // multiple values selectable
            if (this.config.multiple) {
                // buttons for (de-)select all
                if (this.config.showSelectAll) {
                    var selectAllString = ('<input type="checkbox" class="msos-checkbox" id={0} tabindex="-1">').replace('{0}', this.config.key + "_selectAll");
                    this.$selectAllCheckbox = $(selectAllString)
                        .click(function (event) {
                            self._announce("");
                            self.toggleSelectAll(this);
                        })
                        .on("focus", function() {
                            var $element = $(this);
                            $element.parent().addClass("msos-option-focused");

                            // in order to conform to with ARIA requirments, we need to set activedescendant on the combobox
                            var id = $element.attr("id");
                            self.$innerContainer.attr("aria-activedescendant", id);
                        })
                        .on("blur", function() {
                            var $element = $(this);
                            $element.parent().removeClass("msos-option-focused");

                            // un-set the activedescendant, but only if it's set to this element's id
                            var id = $element.attr("id");
                            if (self.$innerContainer.attr("aria-activedescendant") === id) {
                                self.$innerContainer.attr("aria-activedescendant", null);
                            }
                        })
                        .attr('aria-label', this.config.texts.selectAll + " " + this.formatString(this.config.texts.totalItems, this.config.data.length))

                    var selectAllLabelElement = $(this.formatString('<label name={0} class="msos-label msos-selectall msos-option">', this.config.key + "msos-label"));
                    var selectAllDiv = ('<div class="msos-optionitem-text">{0}</div>').replace('{0}', this.config.texts.selectAll);
                    var numberOfItemsDivId = this.config.key + "msos-no-of-Items";
                    var numberOfItemsDiv = this.formatString('<div id={0} class="msos-itemcount-text">{1}</div>', numberOfItemsDivId, this.formatString(this.config.texts.totalItems, this.config.data.length));
                    this.$numberOfItemsDiv = $(numberOfItemsDiv);
                    this.$selection.attr("aria-labelledby", numberOfItemsDivId); // associate the dropdown with this element
                    var solLabelDivContainer = $('<div class="msos-label-text" aria-hidden="true"></div></label>').append(selectAllDiv).append(this.$numberOfItemsDiv);
                    var selectAllButtonContainer = $(selectAllLabelElement).append(this.$selectAllCheckbox).append(solLabelDivContainer);
                    this.$actionButtons = $('<div class="msos-action-buttons"/>')
                        .append(selectAllButtonContainer);
                    this.$selectionContainer.prepend(this.$actionButtons);
                }
            }

            // toggle the disabled state if necessary
            if (this.config.isControlDisabled) {
                this.toggleControlState(this.config.isControlDisabled);
            }

            // the control has been rendered, invoke the onRendered callback
            if ($.isFunction(this.config.events.onRendered)) {
                this.config.events.onRendered.call(this, this);
            }
        },

        // ensure the select items element is visible in the viewport
        _scrollSelectedItemIntoView: function($element) {
            // if the element doesn't exist, we have nothing to do
            if (!$element || !$element.length) {
                return;
            }

            // we're only concerned with the expanded selected items container
            if (!this.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                return;
            }

            // determine the scroll function to use and invoke it
            var element = $element.get(0);
            if (Element.prototype.scrollIntoViewIfNeeded) {
                // if scrollintoViewIfNeeded exists, let's use that
                element.scrollIntoViewIfNeeded();
            } else {
                // note: Edge supports scrollIntoView but it's not a great implementation
                // so we're rolling our own
                var containerTop = this.$currentSelectionContainer.scrollTop();
                var containerHeight = this.$currentSelectionContainer.outerHeight(true);
                var scrollBounds = {
                    top: containerTop,
                    bottom: containerTop + containerHeight
                };

                var elementTop = element.offsetTop; // account for top margin
                var marginTop = parseInt(window.getComputedStyle(element).getPropertyValue("margin-top"), 10);
                var elementBounds = {
                    top: elementTop - marginTop, // account for top margin
                    bottom: elementTop + element.offsetHeight
                };

                // do we need to scroll?
                if (elementBounds.top >= scrollBounds.top && elementBounds.bottom <= scrollBounds.bottom) {
                    return; // no scrolling required
                }

                // we need to scroll! so let's position the selected element in the middle of the container, not the very top
                // (hence the containerHeight * 0.5 subtraction); Math.max() ensures the value is never negative
                var scrollOffset = Math.max(elementBounds.top - Math.floor(containerHeight * 0.5), 0);
                this.$currentSelectionContainer.scrollTop(scrollOffset);
            }
        },

        _initializeInputEvents: function () {
            // form event
            var self = this,
                $form = this.$input.parents('form').first();

            if ($form && $form.length === 1 && !$form.data(this.WINDOW_EVENTS_KEY)) {
                var resetFunction = function () {
                    var $changedItems = [];

                    $form.find('.msos-option input').each(function (index, item) {
                        var $item = $(item),
                            initialState = $item.data('msos-item').selected;

                        if ($item.prop('checked') !== initialState) {
                            $item
                                .prop('checked', initialState)
                                .trigger('change', initialState);
                            $changedItems.push($item);
                        }
                    });

                    if ($changedItems.length > 0 && $.isFunction(self.config.events.onChange)) {
                        self.config.events.onChange.call(self, self, $changedItems);
                    }
                };

                $form.on('reset', function (event) {
                    // unfortunately the reset event gets fired _before_
                    // the inputs are actually reset. The only possibility
                    // to overcome this is to set an interval to execute
                    // own scripts some time after the actual reset event

                    // before fields are actually reset by the browser
                    // needed to reset newly checked fields
                    resetFunction.call(self);

                    // timeout for selection after form reset
                    // needed to reset previously checked fields
                    setTimeout(function () {
                        resetFunction.call(self);
                    }, 100);
                });

                $form.data(this.WINDOW_EVENTS_KEY, true);
            }

            // text input events
            this.$input
                .on('input', function () {
                    self._applySearchTermFilter();
                    if ((self.$input.val() || '').length > 0) {
                        self.open();
                    }
                    self.repositionFlyOut();
                });

            this.$container
                .on("focusin", function(e) {
                    // clear the timeout
                    if (self.blurTimerId) {
                        clearTimeout(self.blurTimerId);
                    }

                    self._onPointerDown();
                })
                .on("keydown", function(e) {
                    // keyCode is deprecated but there's still no solid replacement
                    // so we'll need to handle keyCode, key, and code :(
                    var key = e.keyCode.toString() || e.key || e.code;

                    switch(key) {
                        // escape
                        case "Escape":
                        case "27":
                            // nothing to do if the dropdown is closed
                            self._handleEscape(e);
                            break;

                        // tab key
                        case "Tab":
                        case "9":
                            self._handleTab(e);
                            break;

                        case "Enter":
                        case "13":
                            self._handleEnter(e);
                            break;

                        case "ArrowLeft":
                        case "ArrowUp":
                        case "ArrowRight":
                        case "ArrowDown":
                        case "37": // arrow left
                        case "38": // arrow up
                        case "39": // arrow right
                        case "40": // arrow down
                        // Note: For numpad keys, when NumLock is off, the key codes are the same as the arrow keys
                            self._handleArrows(e);
                            break;

                        case "Backspace":
                        case "Delete":
                        case "8":
                        case "46":
                            self._handleDelete(e);
                            break;

                        default:
                            break;
                    }
                });

            // pointer events
            // enter, leave, and down should always invoke the associated private methods
            this.$container.bind({
                mouseenter: function() {
                    self._onPointerEnter.call(self);

                    if ($.isFunction(self.config.events.onPointerEnter)) {
                        self.config.events.onPointerEnter.call(self);
                    }
                },
                mouseleave: function() {
                    self._onPointerLeave.call(self);

                    if ($.isFunction(self.config.events.onPointerLeave)) {
                        self.config.events.onPointerLeave.call(self);
                    }
                },
                mousedown: function() {
                    self._onPointerDown.call(self);

                    if ($.isFunction(self.config.events.onPointerDown)) {
                        self.config.events.onPointerDown.call(self);
                    }
                },
                mouseup: function() {
                    if ($.isFunction(self.config.events.onPointerUp)) {
                        self.config.events.onPointerUp.call(self);
                    }
                }
            });
        },

        // keydown handlers
        _handleTab: function(e) {
            // nothing to do if the control is disabled
            if (this.config.isControlDisabled) {
                return;
            }

            var focusableElements = this._getFocusableElements();
            var activeElement = $(document.activeElement);
            for (var i = 0; i < focusableElements.length; i++) {
                var element = focusableElements[i];
                if (activeElement.is(element)) {
                    // we have a match; we'll handle the tabbing
                    var targetIndex = e.shiftKey ? i - 1 : i + 1;
                    if (focusableElements[targetIndex]) {
                        // try to focus the target item & prevent the default behaviour
                        focusableElements[targetIndex].focus();
                        e.preventDefault();
                        e.stopPropagation();

                        return;
                    }

                    // match is made but there's no next element to focus
                    break;
                }
            }

            // to be on the safe side, clear the focus timeout
            if (this.blurTimerId) {
                clearTimeout(this.blurTimerId);
            }

            // give the control a few milliseconds to blur before deactivation
            var self = this;
            this.blurTimerId = setTimeout(function() {
                self._deactivateControl();
            }, this.blurTimerTimeout);
        },

        _handleEscape: function(e) {
            // perform a discrete action based on activeElement
            var activeElement = $(document.activeElement);

            // if the selected items container is focused & expanded, we should collapse it
            if (activeElement.is(this.$currentSelectionContainer)) {
                if (this.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                    // if we collapse the control, the active element may be hidden, so we'll focus the first visible one
                    var activeDescendant = this.$currentSelectionContainer.attr("aria-activedescendant");
                    if (!$(activeDescendant).hasClass("msos-visible")) {
                        this._updateCurrentlySelectedItem(this._getVisibleSelectedItems().first());
                    }

                    this._collapseSelectedItemsContainer();
                }

                e.stopPropagation(); // if control is inside another flyout, prevent the latter from closing
                return;
            }

            if (this.isOpen()) {
                // clear & focus the filter input and close the dropdown
                this.$input.val("").trigger("input").focus();
                this.close();

                e.stopPropagation(); // if control is inside another flyout, prevent the latter from closing
            }
        },

        _handleEnter: function(e) {
            // perform a discrete action based on activeElement
            var activeElement = $(document.activeElement);

            // if the input is focused, we open the dropdown
            // we can close the dropdown via <esc>
            if (activeElement.is(this.$input)) {
                this.open();

                e.preventDefault();
                return;
            }

            // if the selected items container is focused & collapsed, we should expand it
            if (activeElement.is(this.$currentSelectionContainer)) {
                if (!this.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                    this._toggleSelectedItemsContainerHeight();
                }

                e.preventDefault();
                return;
            }
        },

        _handleArrows: function(e) {
            var activeElement = $(document.activeElement);

            // handle arrow key navigation when any of the following elements are focused; otherwise ignore
            // * selected items container;
            // * filter input textbox
            // * any dropdownmenu items checkbox
            var selectedItemsFocused = activeElement.is(this.$currentSelectionContainer);
            var inputFocused = activeElement.is(this.$input);
            var menuitemFocused = activeElement.hasClass("msos-checkbox");

            if (!(selectedItemsFocused || inputFocused || menuitemFocused)) {
                return;
            }

            var arrow = this._getArrowKey(e);
            if (!arrow) {
                return;
            }

            // left & up are back (-1)
            // right & down are forward (+1)
            var direction = (arrow === "left" || arrow === "up") ? -1 : 1;
            var targets = null;
            var target = null;
            var idx = null;

            // if the filter textbox is focused, expand or collapse the dropdown
            if (inputFocused) {
                // only react to up and down, not left and right
                if (arrow !== "up" && arrow !== "down") {
                    return;
                }

                // if down arrow, show the menu and/or focus the first item, if applicable
                if (this.$noResultsItem.hasClass("msos-hidden") && direction === 1) {
                    if (this.isClosed()) {
                        this.open();
                    }

                    var filteredItems = this._getFilteredDropdownItemCheckboxes();
                    if (filteredItems.length) {
                        filteredItems.first().focus();
                    }

                    e.preventDefault();
                    return;
                }

                // if up arrow, hide the menu but don't clear the search terms; escape does that
                if (this.isOpen() && direction === -1) {
                    this.close(true); // the bool prevents the textbox from resetting
                    e.preventDefault();
                }

                return;
            }

            if (selectedItemsFocused) {
                // prepare selected items navigation
                targets = this._getSelectedItems();
                var activeSelection = $("#" + activeElement.attr("aria-activedescendant"));
                idx = targets.index(activeSelection);
            } else {
                // prepare dropdown item checkbox navigation
                targets = this._getFilteredDropdownItemCheckboxes();
                idx = targets.index(activeElement);
            }

            // if we can't find the current element within the
            // targets collection, we should gracefully exit
            if (idx === -1) {
                e.preventDefault();
                return;
            }

            // prevent the back/next keys from doing anything at each extreme
            // first item, moving back -- select the input if we're in the dropdown
            if (direction === -1 && idx === 0) {
                if (menuitemFocused) {
                    this.$input.focus();
                }

                e.preventDefault();
                return;
            }

            // last item, moving forward -- do nothing in both cases
            if (direction === 1 && idx === targets.length - 1) {
                e.preventDefault();
                return;
            }

            // otherwise focus the new target
            target = targets.eq(idx + direction);

            if (selectedItemsFocused) {
                // expand the selected items container if necessary
                if (!target.hasClass("msos-visible") && !this.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                    this._toggleSelectedItemsContainerHeight();
                }

                this._updateCurrentlySelectedItem(target);
            } else {
                target.focus();
            }

            e.preventDefault();
        },

        _handleDelete: function(e) {
            var activeElement = $(document.activeElement);

            // only handle the event when the selected item container is focused
            if (!activeElement.eq(this.$currentSelectionContainer)) {
                return;
            }

            var activeDescendant = $("#" + activeElement.attr("aria-activedescendant"));
            if (!activeDescendant.length) {
                return;
            }

            activeDescendant.find(".msos-quick-delete").trigger("mouseup");
            e.preventDefault();
        },

        _getArrowKey: function(e) {
            var key = e.keyCode.toString() || e.key || e.code;

            switch(key) {
                // left
                case "ArrowLeft":
                case "37": // arrow left
                    return "left";

                // up
                case "ArrowUp":
                case "38": // arrow up
                    return "up";

                // right
                case "ArrowRight":
                case "39": // arrow right
                    return "right";

                // down
                case "ArrowDown":
                case "40": // arrow down
                    return "down";

                default:
                    return "";
            }
        },

        _getArrowKeyDirection: function(e) {
            var key = e.keyCode.toString() || e.key || e.code;

            var direction = 0;
            var arrow = null; // "up", "down", "left", "right"

            // left & up are back (-1)
            // right & down are forward (1)
            switch(key) {
                // left
                case "ArrowLeft":
                case "37": // arrow left
                    direction = -1;
                    arrow = "left";
                    break;

                // up
                case "ArrowUp":
                case "38": // arrow up
                    direction = -1;
                    arrow = "up";
                    break;

                // right
                case "ArrowRight":
                case "39": // arrow right
                    direction = 1;
                    arrow = "right";
                    break;

                // down
                case "ArrowDown":
                case "40": // arrow down
                    direction = 1;
                    arrow = "down";
                    break;

                default:
                    break;
            }

            return {
                direction: direction,
                arrow: arrow
            };
        },

        _updateCurrentlySelectedItem: function($item) {
            if (!$item) {
                return;
            }

            // remove any currently-selected item class
            this.$currentSelectionContainer.children().removeClass("msos-selecteditem-active");

            // set the activedescendant property
            this._updateSelectedItemsActiveDescendant($item);

            // add the class and scroll into view
            $item.addClass("msos-selecteditem-active");
            this._scrollSelectedItemIntoView($item);
        },

        _updateSelectedItemsActiveDescendant: function($item) {
            if (!$item) {
                return;
            }

            this.$currentSelectionContainer.attr("aria-activedescendant", $item.attr("id"));
        },

        _collapseSelectedItemsContainerIfNeeded: function() {
            // compare the 'top' property of the last selected item and the
            // first selected item; if they're the same, the selected items
            // can fit on a single line and the container can be collapsed
            var items = this._getSelectedItems();
            if ((items.length < 2) || (items.last().offset().top === items.first().offset().top)) {
                this._collapseSelectedItemsContainer();
            }
        },

        _toggleSelectedItemsContainerHeight: function() {
            if (this.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                // currently expanded; collapse it
                this._collapseSelectedItemsContainer();
            } else {
                // currently collapsed; expand it
                this._expandSelectedItemsContainer();
            }
        },

        _applySearchTermFilter: function () {
            if (!this.items || this.items.length === 0) {
                return;
            }

            var searchTerm = this.$input.val(),
                lowerCased = (searchTerm || '').toLowerCase();

            // show previously filtered elements again
            this.$selectionContainer.find('.msos-filtered-search').removeClass('msos-filtered-search');
            this._setNoResultsItemVisible(false);

            if (lowerCased.trim().length > 0) {
                this._findTerms(this.items, lowerCased);
            }

            var visibleOptions = this.getNonFilteredOptions().length;

            // Handling for Select All Button
            if (this.$selectAllCheckbox) {
                this.$numberOfItemsDiv.text(this.formatString(this.config.texts.totalItems, visibleOptions));
                this.$selectAllCheckbox.attr('aria-label', this.config.texts.selectAll + " " + this.formatString(this.config.texts.totalItems, visibleOptions));
                this.$selectAllCheckbox.prop('checked', this.areAllOptionsChecked());
            }

            // make the announcement
            if (visibleOptions > 0) {
                var message = this.config.texts.resultsFound.replace("{0}", visibleOptions);
                this._announce(message);
            }
        },

        _findTerms: function (dataArray, searchTerm) {
            if (!dataArray || !$.isArray(dataArray) || dataArray.length === 0) {
                return;
            }

            var self = this;

            $.each(dataArray, function (index, item) {
                if (item.type === 'option') {
                    var $element = item.displayElement,
                        elementSearchableTerms = (item.label + ' ' + item.tooltip).trim().toLowerCase();

                    if (elementSearchableTerms.indexOf(searchTerm) === -1) {
                        $element.addClass('msos-filtered-search');
                    }
                } else {
                    self._findTerms(item.children, searchTerm);
                    var amountOfUnfilteredChildren = item.displayElement.find('.msos-option:not(.msos-filtered-search)');

                    if (amountOfUnfilteredChildren.length === 0) {
                        item.displayElement.addClass('msos-filtered-search');
                    }
                }
            });

            this._setNoResultsItemVisible(this.getNonFilteredOptions().length === 0);
        },

        _initializeData: function () {
            if (!this.config.data) {
                this.items = this._detectDataFromOriginalElement();
            } else if ($.isFunction(this.config.data)) {
                this.items = this._fetchDataFromFunction(this.config.data);
            } else if ($.isArray(this.config.data)) {
                this.items = this._fetchDataFromArray(this.config.data);
            } else if (typeof this.config.data === (typeof 'a string')) {
                this._loadItemsFromUrl(this.config.data);
            } else {
                this._showErrorLabel('Unknown data type');
            }

            if (this.items) {
                // done right away -> invoke postprocessing
                this._processDataItems(this.items);
            }
        },

        _detectDataFromOriginalElement: function () {
            if (this.$originalElement.prop('tagName').toLowerCase() === 'select') {
                var self = this,
                    solData = [];

                $.each(this.$originalElement.children(), function (index, item) {
                    var $item = $(item),
                        itemTagName = $item.prop('tagName').toLowerCase(),
                        solDataItem;

                    if (itemTagName === 'option') {
                        solDataItem = self._processSelectOption($item);
                        if (solDataItem) {
                            solData.push(solDataItem);
                        }
                    } else if (itemTagName === 'optgroup') {
                        solDataItem = self._processSelectOptgroup($item);
                        if (solDataItem) {
                            solData.push(solDataItem);
                        }
                    } else {
                        self._showErrorLabel('Invalid element found in select: ' + itemTagName + '. Only option and optgroup are allowed');
                    }
                });

                return this._invokeConverterIfNeccessary(solData);
            } else if (this.$originalElement.data('sol-data')) {
                var solDataAttributeValue = this.$originalElement.data('sol-data');
                return this._invokeConverterIfNeccessary(solDataAttributeValue);
            } else {
                this._showErrorLabel('Could not determine data from original element. Must be a select or data must be provided as data-sol-data="" attribute');
            }
        },

        _processSelectOption: function ($option) {
            return $.extend({}, this.SOL_OPTION_FORMAT, {
                value: $option.val(),
                selected: $option.prop('selected'),
                disabled: $option.prop('disabled'),
                label: $option.html(),
                tooltip: $option.attr('title'),
                element: $option
            });
        },

        _processSelectOptgroup: function ($optgroup) {
            var self = this,
                solOptiongroup = $.extend({}, this.SOL_OPTIONGROUP_FORMAT, {
                    label: $optgroup.attr('label'),
                    tooltip: $optgroup.attr('title'),
                    disabled: $optgroup.prop('disabled'),
                    children: []
                }),
                optgroupChildren = $optgroup.children('option');

            $.each(optgroupChildren, function (index, item) {
                var $child = $(item),
                    solOption = self._processSelectOption($child);

                // explicitly disable children when optgroup is disabled
                if (solOptiongroup.disabled) {
                    solOption.disabled = true;
                }

                solOptiongroup.children.push(solOption);
            });

            return solOptiongroup;
        },

        _fetchDataFromFunction: function (dataFunction) {
            return this._invokeConverterIfNeccessary(dataFunction(this));
        },

        _fetchDataFromArray: function (dataArray) {
            return this._invokeConverterIfNeccessary(dataArray);
        },

        _loadItemsFromUrl: function (url) {
            var self = this;
            $.ajax(url, {
                success: function (actualData) {
                    self.items = self._invokeConverterIfNeccessary(actualData);
                    if (self.items) {
                        self._processDataItems(self.items);
                    }
                },
                error: function (xhr, status, message) {
                    self._showErrorLabel('Error loading from url ' + url + ': ' + message);
                }
            });
        },

        _invokeConverterIfNeccessary: function (dataItems) {
            if ($.isFunction(this.config.converter)) {
                return this.config.converter.call(this, this, dataItems);
            }
            return dataItems;
        },

        _processDataItems: function (solItems) {
            if (!solItems) {
                this._showErrorLabel('Data items not present. Maybe the converter did not return any values');
                return;
            }

            if (solItems.length === 0) {
                this._setNoResultsItemVisible(true);
                return;
            }

            var self = this;
            var items = solItems;
            $.each(solItems, function (index, item) {
                if (item.type === MultiSelectOptionSet.prototype.SOL_OPTION_FORMAT.type) {
                    self._renderOption(item, index, items.length);
                } else if (item.type === MultiSelectOptionSet.prototype.SOL_OPTIONGROUP_FORMAT.type) {
                    self._renderOptiongroup(item);
                } else {
                    self._showErrorLabel('Invalid item type found ' + item.type);
                    return;
                }
            });

            if (this.config.showSelectAll && (this.$selectionContainer.find('input[type="checkbox"]:not([disabled]):checked').length === solItems.length)) {
                this.$selectAllCheckbox.prop('checked', true);
            }

            if ($.isFunction(this.config.events.onInitialized)) {
                this.config.events.onInitialized.call(this, this, solItems);
            }
        },

        _renderOption: function (solOption, index, length, $optionalTargetContainer) {
            var self = this,
                $actualTargetContainer = $optionalTargetContainer || this.$selection,
                $inputElement,
                $labelText = $('<div class="msos-label-text msos-optionitem-text" aria-hidden="true"/>').html(solOption.label.trim().length === 0 ? '&nbsp;' : solOption.label),
                $label,
                $displayElement,
                inputName = this._getNameAttribute();

            if (this.config.multiple) {
                // use checkboxes
                var optionCheckboxString = ('<input type="checkbox" id={0} class="msos-checkbox" name={0} tabindex="-1">').split('{0}').join(this.config.key + "_checkbox");
                $inputElement = $(optionCheckboxString).attr('aria-label', solOption.tooltip);

                if (this.config.useBracketParameters) {
                    inputName += '[]';
                }
            } else {
                // use radio buttons
                $inputElement = $('<input type="radio" class="msos-radio"/>')
                    .on('change', function () {
                        // when selected notify all others of being deselected
                        self.$selectionContainer.find('input[type="radio"][name="' + inputName + '"]').not($(this)).trigger('msos-deselect');
                    })
                    .on('msos-deselect', function () {
                        // remove display selection item
                        // TODO also better show it inline instead of above or below to save space
                        self._removeSelectionDisplayItem($(this));
                    });
            }

            $inputElement
                .attr('id', this.config.key + "_item" + (index + 1))
                // batchChange flag is used for events that are called multiple times by a single update such as Select All.
                // Setting it true will prevent aria-live region from updating.
                .on('change', function (event, check, batchChange) {
                    self.checkUncheckOption($(this), check, index, batchChange);

                    // to prevent control weirdness, let's collapse the expanded selected items container
                    if (self.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                        self._collapseSelectedItemsContainerIfNeeded();
                    }
                })
                .on("focus", function() {
                    var $element = $(this);
                    $element.parent().addClass("msos-option-focused");

                    // in order to conform to with ARIA requirments, we need to set activedescendant on the combobox
                    var id = $element.attr("id");
                    self.$innerContainer.attr("aria-activedescendant", id);
                })
                .on("blur", function() {
                    var $element = $(this);
                    $element.parent().removeClass("msos-option-focused");

                    // un-set the activedescendant, but only if it's set to this element's id
                    var id = $element.attr("id");
                    if (self.$innerContainer.attr("aria-activedescendant") === id) {
                        self.$innerContainer.attr("aria-activedescendant", null);
                    }
                })
                .data('msos-item', solOption)
                .prop('checked', solOption.selected)
                .prop('disabled', solOption.disabled)
                .attr('name', inputName)
                .val(solOption.value);

            var labelString = this.formatString('<label name={0} class="msos-label" />', this.config.key + "msos-label");
            $label = $(labelString)
                        .attr('title', solOption.tooltip)
                        .append($inputElement)
                        .append($labelText);

            $displayElement = $('<li class="msos-option" role="option" />').append($label);
            solOption.displayElement = $displayElement;

            $actualTargetContainer.append($displayElement);

            if (solOption.selected) {
                $displayElement
                    .addClass("msos-option-selected")
                    .attr("aria-selected", "true");
                this._addSelectionDisplayItem($inputElement, index);
            }
        },

        _renderOptiongroup: function (solOptiongroup) {
            var self = this,
                $groupCaption = $('<div class="msos-optiongroup-label"/>')
                                    .attr('title', solOptiongroup.tooltip)
                                    .html(solOptiongroup.label),
                $groupItem = $('<div class="msos-optiongroup"/>').append($groupCaption);

            if (solOptiongroup.disabled) {
                $groupItem.addClass('disabled');
            }
            var group = solOptiongroup;
            if ($.isArray(solOptiongroup.children)) {
                $.each(solOptiongroup.children, function (index, item) {
                    self._renderOption(item, index, group.children.length, $groupItem);
                });
            }

            solOptiongroup.displayElement = $groupItem;
            this.$selection.append($groupItem);
        },

        // iterate through the selected item collection, assigning a `msos-visible` class to
        // each item determined to be visible. by default, a selected display item is invisible
        _updateSelectedItemsVisibility: function() {
            var $selectedItems = this._getSelectedItems();

            if (!$selectedItems.length) {
                return; // no items
            }

            var minOffsetTop = null;
            $selectedItems.each(function(idx, el) {
                var elOffsetTop = el.offsetTop;
                if (minOffsetTop === null) {
                    minOffsetTop = elOffsetTop;
                }

                if (minOffsetTop === elOffsetTop) {
                    // should be visible
                    el.classList.add("msos-visible");
                } else {
                    // should be hidden
                    el.classList.remove("msos-visible");
                }
            });
        },

        _getSelectedItems: function() {
            var container = this.$currentSelectionContainer;
            return container.children();
        },

        _getSelectedItemsCount: function() {
            return this._getSelectedItems().length;
        },

        _getVisibleSelectedItems: function() {
            return this.$currentSelectionContainer.children(".msos-selected-display-item.msos-visible");
        },

        _getVisibleSelectedItemsCount: function() {
            return this._getVisibleSelectedItems().length;
        },

        _getHiddenSelectedItems: function() {
            return this.$currentSelectionContainer.children(".msos-selected-display-item:not(.msos-visible)");
        },

        _getHiddenSelectedItemsCount: function() {
            return this._getHiddenSelectedItems().length;
        },

        _getFocusableElements: function() {
            var focusableElements = [
                this._getSelectedItemsCount() ? this.$currentSelectionContainer : null,
                this.$input,
            ].filter(function(element) {
                // filter the array of its null elements
                return element !== null;
            });

            return focusableElements;
        },

        _getDropdownItems: function() {
            // return all dropdown items
            var items = this.$selectionContainer.find(".msos-option");
            return items.length ? items : null;
        },

        _getFilteredDropdownItems: function() {
            // return the filtered items
            var items = this._getDropdownItems();
            if (!items.length) {
                return;
            }

            var filteredItems = items.filter(".msos-option:not(.msos-filtered-search)");
            return filteredItems.length ? filteredItems : null;
        },

        _getFilteredDropdownItemCheckboxes: function() {
            // return the results of the current filter (i.e. visible items; msos-filtered-search items are hidden)
            var items = this._getFilteredDropdownItems();
            if (!items.length) {
                return null;
            }

            var filteredItems = items.find(".msos-checkbox:not(.msos-filtered-search)");
            return filteredItems.length ? filteredItems : null;
        },

        _getDeselectButtons: function() {
            if (this._getSelectedItemsCount()) {
                var items = this._getSelectedItems();
                var buttons = items.find(".msos-quick-delete");
                return (buttons && buttons.length) ? buttons : null;
            }

            return null;
        },

        _getFirstDeselectButton: function() {
            if (this._getSelectedItemsCount()) {
                var buttons = this._getDeselectButtons();
                var firstButton = buttons.first();

                return (firstButton && firstButton.length) ? firstButton : null;
            }

            return null;
        },

        _getLastDeselectButton: function() {
            if (this._getSelectedItemsCount()) {
                var buttons = this._getDeselectButtons();

                var lastButton = null;
                if (this.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                    lastButton = buttons.last();
                } else {
                    var lastVisibleSelectedItem = this._getVisibleSelectedItems().last();
                    lastButton = lastVisibleSelectedItem.find(".msos-quick-delete");
                }

                return (lastButton && lastButton.length) ? lastButton : null;
            }

            return null;
        },

        _getNextSelectedItem: function() {
            // if we have one or zero selected items, there is no "next";
            if (this._getSelectedItemsCount() < 2) {
                return null;
            }

            // find the current item in the collection and return the next one (index + 1)
            var activeDescendant = this.$currentSelectionContainer.attr("aria-activedescendant");
            var currentSelectedItem = $("#" + activeDescendant);
            var items = this._getSelectedItems();
            var idx = items.index(currentSelectedItem);
            if (idx === -1) {
                // can't find the current item; let's return the first one
                return items.first();
            }

            if (idx === items.length - 1) {
                // last item, return the penultimate item instead
                return items.eq(idx - 1);
            }

            // return the previous item
            return items.eq(idx + 1);
        },

        _getNextDeselectButton: function(element) {
            var el = $(element);

            var buttons = this._getDeselectButtons();
            if (!buttons.length) {
                return null;
            }

            var idx = buttons.index(el);
            if (idx < 0) {
                return null;
            }

            if (idx < buttons.length - 1) {
                return buttons.eq(idx + 1);
            }

            if (idx === buttons.length - 1) {
                return buttons.eq(idx - 1);
            }

            return null;
        },

        _getViewmodeText: function() {
            // this will create a concatenated string of all selected items or,
            // if no items are selected, the empty placeholder text
            // the easiest way to get the selected items is to directly inspect the
            // selected item DOM elements
            var selectedItems = this.$currentSelectionContainer.children(".msos-selected-display-item");
            var count = selectedItems.length;
            var text = this.config.texts.noItemsSelected;
            var separator = this.config.texts.viewmodeItemsSeparator;

            if (count > 0) {
                text = $(selectedItems, ".msos-selected-display-item-text").map(function() {
                    return $(this).text();
                }).get().join(separator);
            }

            return text;
        },

        _collapseViewmodeContainer: function() {
            // if the viewmode container is expanded, we should collapse it
            this.$viewmodeContainer.removeClass("msos-viewmode-expanded");
        },

        _checkViewmodeOverflow: function() {
            // check if the viewmode text is overflowing; if not, hide the toggle button
            var viewmodeTextElement = this.$viewmodeText.get(0);

             // IE11 sometimes misreports its width by 1; this extra pixel will have a negligible effect
             // on other browsers but will prevent IE from rendering the chevron button unnecessarily
            var widthBuffer = 1;
            if (viewmodeTextElement.scrollWidth <= viewmodeTextElement.offsetWidth + widthBuffer) {
                this.$viewmodeButtonContainer.addClass("msos-hidden");
            } else {
                this.$viewmodeButtonContainer.removeClass("msos-hidden");
            }
        },

        _updateSelectedItemsContainerClass: function() {
            var noSelectionClass = "msos-none-selected";
            if (this._getSelectedItemsCount() === 0) {
                this.$container.addClass(noSelectionClass);
            } else {
                this.$container.removeClass(noSelectionClass);
            }
        },

        // Updates the title attribute of the selected container.
        _updateSelectedItemsContainerTitle: function(viewModeText) {
            // Do not set if there are no selected items.
            if (viewModeText && viewModeText !== this.config.texts.noItemsSelected) {
                this.$selectedItemsContainer.attr("title", viewModeText);
            } else {
                this.$selectedItemsContainer.removeAttr("title");
            }
        },

        _populateViewmodeContainer: function() {
            var viewModeText = this._getViewmodeText();
            this.$viewmodeText.text(viewModeText);
            this.$viewmodeText.attr("title", viewModeText);
            this._checkViewmodeOverflow();
            this._updateSelectedItemsContainerClass();
            this._updateSelectedItemsContainerTitle(viewModeText);
        },

        _updateExpandSelectedItemsButtonText: function(force) {
            // when the control has been resized or selected items have changed,
            // we need to update the hidden item count
            // if we pass in the "force" boolean, we ignore the following "active" check
            if (!force && !this.$container.hasClass("msos-active")) {
                // if the control isn't active, there's nothing to do
                return;
            }

            if (this.$selectedItemsContainer.hasClass("msos-selecteditems-expanded")) {
                // are we already expanded? if so, there's no need to continue
                return;
            }

            // determine which selected items are hidden and update the button text
            this._updateSelectedItemsVisibility();

            var hiddenItemCount = this._getHiddenSelectedItemsCount();
            if (hiddenItemCount > 0) {
                this.$selectedItemsToggleButton
                    .text(this.config.texts.expand.replace("{0}", hiddenItemCount))
                    .attr("aria-label", this.config.texts.expandLabel.replace("{0}", this._getHiddenSelectedItemsCount()))
                    .removeClass("msos-invisible"); // the button should be (initially) hidden
            } else {
                this.$selectedItemsToggleButton.addClass("msos-invisible"); // hide the button again
            }
        },

        _announce: function(text) {
            if (text !== null && text !== undefined) {
                this.$alertContainer.text(text);
            }
        },

        _selectionChange: function ($changeItem, index, skipCallback, batchChange) {
            var itemLabel = $changeItem.siblings(".msos-optionitem-text").text();
            var message = ""; // announce the change

            if ($changeItem.prop('checked')) {
                this._addSelectionDisplayItem($changeItem, index);
                $changeItem.closest('.msos-option').addClass('msos-option-selected');

                if (itemLabel) {
                    message = this.config.texts.selectedItemAdded.replace("{0}", itemLabel);
                }
            } else {
                this._removeSelectionDisplayItem($changeItem);
                $changeItem.closest('.msos-option').removeClass('msos-option-selected');

                if (itemLabel) {
                    message = this.config.texts.selectedItemRemoved.replace("{0}", itemLabel);
                }
            }

            // If batchChange flag is raised, don't update the live region.
            // This is to prevent calls such as SelectAll from triggering multiple updates.
            if (!batchChange) {
                // populate the announcement box
                this._announce(message);
            }

            $changeItem.closest('.msos-option').attr('aria-selected', $changeItem.prop('checked'));

            if (this.config.multiple) {
                // update position of selection container
                // to allow selecting more entries
                this.config.scrollTarget.trigger('scroll');
            } else {
                // only one option selectable
                // close selection container
                this.close();
            }

            if (!skipCallback && $.isFunction(this.config.events.onChange)) {
                this.config.events.onChange.call(this, this, $changeItem);
            }

            // update the viewmode text content on a debounce to improve efficiency
            if (this.debounceId) {
                clearTimeout(this.debounceId);
            }

            var self = this;
            this.isSelectionChanging = true;
            this.debounceId = setTimeout(function() {
                self._populateViewmodeContainer();
                self._updateExpandSelectedItemsButtonText();
                self.isSelectionChanging = false;
            }, this.debounceTimeout);
        },

        _addSelectionDisplayItem: function ($changedItem, index) {
            var solOptionItem = $changedItem.data('msos-item'),
                $existingDisplayItem = solOptionItem.displaySelectionItem,
                self = this,
                $displayItemText,
                activeDescendant;

            if (!$existingDisplayItem) {
                $displayItemText = $('<span class="msos-selected-display-item-text" />').html(solOptionItem.label);
                var displaySelectedItemString = ('<li class="msos-selected-display-item msos-visible" />');
                var selectedItemAriaLabel = $displayItemText != null && $displayItemText.length > 0 ? $displayItemText[0].innerText : solOptionItem.label;

                $existingDisplayItem = $(displaySelectedItemString)
                    .append($displayItemText)
                    .attr("name", this.config.key + "-selected-item-" + (index + 1))
					.attr("aria-describedby", this.$selectedItemsInstructions.attr("id"))
                    .attr("id", this.config.key + "-selected-item-" + (index + 1))
                    .attr("tabindex", "-1")
                    .attr('title', '')
                    .attr('data-value', solOptionItem.value)
                    .attr('aria-label', selectedItemAriaLabel + " for " + this.config.accessibilityLabel)
                    .appendTo(this.$currentSelectionContainer)
                    .on("mousedown", function() {
                        var $item = $(this);

                        // set this item to active and send focus to the container
                        self._updateCurrentlySelectedItem($item);
                        self.$currentSelectionContainer.focus();
                    });

                // restore active pseudo-focus state, if this option was previously active
                activeDescendant = this.$currentSelectionContainer.attr("aria-activedescendant");
                if (activeDescendant === $existingDisplayItem.attr("id")) {
                    $existingDisplayItem.addClass("msos-selecteditem-active");
                }

                // show remove button on display items if not disabled and null selection allowed
                if ((this.config.multiple || this.config.allowNullSelection)) {
                    $('<button class="msos-quick-delete" tabindex="-1"><span class="msos-glyph" /></button>')
                        .attr("name", this.config.key + "-selected-item-delete-" + (index + 1))
                        .attr("aria-label", this.config.texts.deleteItemLabel.replace("{0}", selectedItemAriaLabel))
                        .on("mouseup touchend", function () {
                            // when this item is removed, we'll need to activate to the next item
                            var nextItem = self._getNextSelectedItem();

                            $changedItem.trigger('change', false);

                            // but there is no next item, we'll have to focus the input instead
                            if (nextItem) {
                                self._updateCurrentlySelectedItem(nextItem);
                                self.$currentSelectionContainer.focus();
                            } else {
                                self.$input.focus();
                            }
                        })
                        .appendTo($existingDisplayItem);
                }

                solOptionItem.displaySelectionItem = $existingDisplayItem;
            }
        },

        _removeSelectionDisplayItem: function ($changedItem) {
            var solOptionItem = $changedItem.data('msos-item'),
                   $myDisplayItem = solOptionItem.displaySelectionItem;

            if ($myDisplayItem) {
                $myDisplayItem.remove();
                solOptionItem.displaySelectionItem = undefined;
            }
        },

        _setNoResultsItemVisible: function (visible) {
            if (visible) {
                this._announce(this.config.texts.noItemsAvailable);
                this.$noResultsItem.removeClass("msos-hidden");

                if (this.$actionButtons) {
                    this.$actionButtons.addClass("msos-hidden");
                }

                this.$selection.addClass('msos-selection-hidden');

            } else {
                this.$noResultsItem.addClass("msos-hidden");

                if (this.$actionButtons) {
                    this.$actionButtons.removeClass("msos-hidden");
                }

                this.$selection.removeClass('msos-selection-hidden');
            }
        },

        _positionFlyOut: function(above) {
            this._updateSelectedItemsContainerClass();
            var offset = this.$innerContainer.outerHeight(false);

            // rendered below the control
            if (!above) {
                this.$selectionContainer.css({
                    bottom: "inherit",
                    top: offset,
                });

                return;
            }

            // rendered above the control
            this.$selectionContainer.css({
                bottom: offset,
                top: "inherit"
            });
        },

        // public wrapper for dropdown positioning method
        positionFlyOut: function(above) {
            this._positionFlyOut(above);
        },

        isOpen: function () {
            return this.$container.hasClass('msos-open');
        },

        isClosed: function () {
            return !this.isOpen();
        },

        toggle: function(autoFocus) {
            if (this.isOpen()) {
                // in some cases, IE11 invokes the close() event *before* firing
                // input's onFocus (which automatically opens the flyout), meaning
                // the flyout re-opens; to avoid this, we simply don't focus the
                // input when the flyout is gets closed.
                if (autoFocus && !this.isIE11) {
                    this.$input.focus();
                }

                this.close();
            } else {
                this.open();
                this.$input.focus();
            }
        },

        open: function () {
            if (this.isClosed()) {
                this.$innerContainer.toggleClass("msos-fullscreen", this.config.fullscreenCombobox);
                $("body").toggleClass("msos-fullscreen", this.config.fullscreenCombobox);

                this.$container.addClass('msos-open');
                this.$innerContainer.attr("aria-expanded", "true");
                this.$innerContainer.attr("aria-activedescendant", null);
                this.config.scrollTarget.bind('scroll', this.internalScrollWrapper).trigger('scroll');
                $(window).on('resize', this.internalScrollWrapper);

                if ($.isFunction(this.config.events.onOpen)) {
                    this.config.events.onOpen.call(this, this);
                }
                this.$input.focus();

                // fix for Chrome 87's missing scrollbar
                this.forceOptionListRedraw();
            }
        },

        // fix for Chrome 87's missing scrollbar
        forceOptionListRedraw: function() {
            // get the visible options that may be in a scrolling container
            var options = this.$selectionContainer.find(".msos-option:not(.msos-filtered-search):not(.msos-selectall)");

            if (options && options.length) {
                // we only need a single item, so let's use the first one
                var $firstOption = $(options[0]);

                 // changing the display property forces a redraw which in
                 // turn causes Chrome to correctly add the missing
                 // scrollbar to the container
                $firstOption.css({
                    display: $firstOption.css("display") === "block" ? "" : "block"
                });
            }
        },

        close: function (skipReset) {
            if (this.isOpen()) {
                this.$innerContainer.removeClass("msos-fullscreen");
                $("body").removeClass("msos-fullscreen");

                // scroll the options to the top *before* we hide it
                // otherwise it won't work
                this.$selection.scrollTop(0);

                this.$container.removeClass("msos-open msos-compact");
                this.$innerContainer.attr("aria-expanded", "false");
                this.$innerContainer.attr("aria-activedescendant", null);

                this.config.scrollTarget.unbind('scroll', this.internalScrollWrapper);
                $(window).off('resize', this.internalScrollWrapper);

                // reset search on close
                if (!skipReset) {
                    this.$input.val('');
                    this._applySearchTermFilter();
                }

                if ($.isFunction(this.config.events.onClose)) {
                    this.config.events.onClose.call(this, this);
                }
            }
        },

        formatString : function (format) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var returnValue = format;
            for (var i = 1; i < arguments.length; i++) {
                var actualValue = typeof (arguments[i]) == "undefined" || arguments[i] == null ? "" : arguments[i].toString();
                returnValue = returnValue.replace(new RegExp("\\{" + (i - 1) + "\\}", 'g'), actualValue);
            }
            return returnValue;
        },

        toggleSelectAll: function (selectAllCheckbox) {
            if (selectAllCheckbox.checked) {
                this.selectAll();
            } else {
                this.deselectAll(false);
            }

            this._updateExpandSelectedItemsButtonText();
            this.$selectAllCheckbox.focus();
        },

        selectAll: function () {
            if (this.config.showSelectAll && this.config.multiple) {
                var $changedInputs = this.getNonFilteredOptions()
                    .find('input[type="checkbox"]:not([disabled], :checked):not(.msos-selectall)')
                    .trigger('change', [true, true]);

                if ($.isFunction(this.config.events.onChange)) {
                    this.config.events.onChange.call(this, this, $changedInputs);
                }
                var message = (this.config.texts.selectAllSelect).replace('{0}', this.getNonFilteredOptions().length);
                var _this = this;
                setTimeout(function(){
                    _this._announce(message);
                }, 1000);
            }
        },

        // Deselect all selected records, updates the live region to announce the action.
        deselectAll: function (deselectAllRecords) {
            if (this.config.showSelectAll && this.config.multiple) {
                this.deselectAllInternal(deselectAllRecords);
                var message = (this.config.texts.selectAllDeselect).replace('{0}', this.getNonFilteredOptions().length);
                this._announce(message);
            }
        },

        // Internal deselect-all function, not triggered by user input, and does not update live region.
        deselectAllInternal: function (deselectAllRecords) {
            var $changedInputs = ((deselectAllRecords) ? this.$selectionContainer : this.getNonFilteredOptions())
                .find('input[type="checkbox"]:not([disabled]):checked')
                .trigger('change', [false, true]);

            if ($.isFunction(this.config.events.onChange)) {
                this.config.events.onChange.call(this, this, $changedInputs);
            }
        },

        getValues: function () {
            var selectedValues = [];
            this.$currentSelectionContainer.find('.msos-selected-display-item').each(function() {
                selectedValues.push($(this).data('value'));
            });
            return selectedValues;
        },

        setValues: function (valuesToSelect) {
            if (!valuesToSelect || !valuesToSelect.length) {
                return;
            }

            var self = this;
            var values = valuesToSelect;

            values.forEach(function (item) {
                var valueItem = item;
                var checkboxToSelect = self.$selectionContainer.find('.msos-checkbox').filter(function () {
                    var checkboxDataItem = $(this).data('msos-item');
                    if (checkboxDataItem !== null && checkboxDataItem !== undefined) {
                        return $(this).data('msos-item').value === valueItem;
                    }
                });
                checkboxToSelect.trigger('change', [true, true]);
            });
        },

        toggleControlState: function (isControlDisabled) {
            this.config.isControlDisabled = isControlDisabled;
            if (this.config.isControlDisabled) {
                // add the disabled class
                this.$container.addClass('msos-disabled');

                // populate the viewmode container
                this._populateViewmodeContainer();
            } else {
                // remove viewMode expanded when switching from disabled to enabled again
                if (this.$container.hasClass('msos-disabled')) {
                    this._collapseViewmodeContainer();
                }
                // remove the disabled class
                this.$container.removeClass('msos-disabled');

                // update the selected items expansion toggle
                this._updateExpandSelectedItemsButtonText();
            }
        },

        checkUncheckOption: function ($currentHighlightedOption, check, index, batchChange) {
            if (check !== undefined) {
                // If the value for check is passed as true of false use it,
                // else the checkbox would already be checked (as default click action)
                $currentHighlightedOption.prop('checked', check);
            }

            this._selectionChange($currentHighlightedOption, index, false, batchChange);
            this._updateExpandSelectedItemsButtonText();

            // If we just unselected one of the available options, we should uncheck the Select All checkbox
            if (this.$selectAllCheckbox) {
                this.$selectAllCheckbox.prop('checked', this.areAllOptionsChecked());
            }
        },

        areAllOptionsChecked: function() {
            return this.getNonFilteredOptions().find('input[type="checkbox"]:not([disabled], :checked)').length === 0;
        },

        getNonFilteredOptions: function() {
            return this.$selectionContainer.find('.msos-option:not(.msos-filtered-search):not(.msos-selectall)');
        },

        getSelection: function () {
            return this.$selection.find('input:checked');
        },

        storeControlState: function () {
            this.currentHighlightedSelectionIndex = -1;
            if (this.$currentSelectionContainer != null) {
                var $currentHighlightedSelection = this.$currentSelectionContainer.find('.msos-selected-display-item.keyboard-selection');
                if ($currentHighlightedSelection.length > 0) {
                    var $allSelections = this.$currentSelectionContainer.find('.msos-selected-display-item');
                    this.currentHighlightedSelectionIndex = $allSelections.index($currentHighlightedSelection);
                }
            }
        },

        restoreControlState: function () {
            if (this.currentHighlightedSelectionIndex > -1) {
                var $allSelections = this.$currentSelectionContainer.find('.msos-selected-display-item');
                var $nextHighlightedOption = $($allSelections[this.currentHighlightedSelectionIndex]).addClass('keyboard-selection');
                $nextHighlightedOption.focus();
            }

            if (this.isOpen()) {
                this.repositionFlyOut();
            }
        },

        refreshControl: function (valuesToSelect) {
            // If selected values are not null, store state, refresh ui and restore state
            if (valuesToSelect.length > 0) {
                this.storeControlState();
                this.deselectAllInternal(true);
                this.setValues(valuesToSelect);
                this.restoreControlState();
            }
            else {
                if (this.getValues().length > 0) {
                    // If selected value is null , We perform deselect All only when there were any previous selections
                    this.deselectAllInternal(true);
                }
            }
        },

        repositionFlyOut: function () {
            this.config.scrollTarget.bind('scroll', this.internalScrollWrapper).trigger('scroll');
            $(window).on('resize', this.internalScrollWrapper);
        },

        destroy: function () {
            // unbind the event handlers
            $(window).off('resize', this._handleWindowResize);
            $(window).off('resize', this.internalScrollWrapper);
            this.config.scrollTarget.off('scroll', this.internalScrollWrapper);
            this.$container.off('mouseenter mouseleave mousedown mouseup');

            // decrement the window key by one and remove the event if necessary,
            // ensuring that it's never less than zero
            if (window[this.WINDOW_EVENTS_KEY] > 0) {
                window[this.WINDOW_EVENTS_KEY] -= 1;
            }

            // a count of zero indicates there are no more MSOS controls left on the
            // form, so we're safe to remove the event handler
            if (window[this.WINDOW_EVENTS_KEY] === 0) {
                $(document).off('mousedown touchstart', this._deactivateOtherControls);
            }

            // nullify internal functions
            this.internalScrollWrapper = null;

            // remove elements
            this.$container.remove();
            this.$originalElement.remove();
        },
    };

    // jquery plugin boiler plate code
    MultiSelectOptionSet.defaults = MultiSelectOptionSet.prototype.defaults;
    window.MultiSelectOptionSet = MultiSelectOptionSet;

    $.fn.multiSelectOptionSet = function (options) {
        var result = [];
        this.each(function () {
            var $this = $(this),
                $alreadyInitializedMsos = $this.data(MultiSelectOptionSet.prototype.DATA_KEY);

            if ($alreadyInitializedMsos) {
                result.push($alreadyInitializedMsos);
            } else {
                result.push(new MultiSelectOptionSet($this, options).init());
            }
        });

        if (result.length === 1) {
            return result[0];
        }

        return result;
    };
};

(function() {
    initializeMsosLibrary(jQuery, window, document);
})();
