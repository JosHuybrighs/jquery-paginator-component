/****************************************************************************************************** 
 * A jquery plugin implementing a paginator. 
 * Usage:
 *  - Instantiation:
 *      $('#paginator').paginator({ itemsCount: count,
 *                                  activePageIdx: index,
 *                                  maxPagesShown: count,
 *                                  itemsPerPage: count,
 *                                  onPageRequest: function (el, pageIdx) { ... },
 *                                  onNextClick: function (el, newPageIdx) { ... },
 *                                  onPrevClick: function (el, newPageIdx) { ... }
 *      });
 *  - External methods:
 *      $('#paginator').paginator('reInit', { itemsCount: count,
 *                                            activePageIdx: index,
 *                                            etc. (see instantiation) 
 *      });
 *
 * version 1.0.0
 *
 * @requires jQuery 1.8.0 or later
 *
 * Copyright (c) Jos Huybrighs
 * swcomponents.cwwonline.be
 *
 * Licensed under the MIT license.
 * http://en.wikipedia.org/wiki/MIT_License
 *
 ******************************************************************************************************/
; (function ($, window, document, undefined) {

    var pluginName = "paginator";
    var defaults = {
        itemsCount: 0,
        activePageIdx: 0,
        maxPagesShown: 5,
        itemsPerPage: 5,
        allowKeyNavigation: true,
        onPageRequest: function (el, pageIdx) { },
        onNextClick: function (el, newPageIdx) { },
        onPrevClick: function (el, newPageIdx) { }
    };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._init();
    };

    Plugin.prototype = {

        _init: function () {
            this.next = false;
            this.prev = false;
            this.currentPageIdx = 0;
            if (this.settings.itemsPerPage > 0) {
                this.maxPage = (this.settings.itemsCount != 0) ? Math.floor((this.settings.itemsCount - 1) / this.settings.itemsPerPage) + 1 : 0;
                this.leftIdx = 0;
                this.rightIdx = this.maxPage - 1;
                if (this.maxPage > 1) {
                    this.next = true;
                    // Setup html elements
                    $(this.element).addClass('paginatorComp');
                    if (this.settings.itemsCount != 0) {
                        // Setup pager anchors
                        this.prevAnchor = $('<a href="#" class="pcPrev">&lt;</a>');
                        this.prevAnchor.hide();
                        var self = this;
                        $(this.element).append(this.prevAnchor);
                        this.itemAnchors = new Array;
                        this.anchorCurrent = this.itemAnchors[0] = $('<a href="#" class="pcCurrent">1</a>');
                        $(this.element).append(this.itemAnchors[0]);
                        this.firstBreak = $('<span class="pcBreak">.&nbsp;.&nbsp;.</span>');
                        this.firstBreak.hide();
                        $(this.element).append(this.firstBreak);
                        for (i = 2; i < this.maxPage; i++) {
                            var anchor = $('<a href="#" class="pcSel">' + i + '</a>');
                            $(this.element).append(anchor);
                            if (this.maxPage > this.settings.maxPagesShown &&
                                i >= this.settings.maxPagesShown) {
                                anchor.hide();
                            }
                            this.itemAnchors[i - 1] = anchor;
                        }
                        if (this.maxPage > 1) {
                            this.lastBreak = $('<span class="pcBreak">.&nbsp;.&nbsp;.</span>');
                            if (this.maxPage <= this.settings.maxPagesShown) {
                                this.lastBreak.hide();
                            }
                            else {
                                this.rightIdx = this.settings.maxPagesShown - 2;
                            }
                            $(this.element).append(this.lastBreak);
                            this.itemAnchors[this.maxPage - 1] = $('<a href="#" class="pcSel">' + this.maxPage + '</a>');
                            $(this.element).append(this.itemAnchors[this.maxPage - 1]);
                        }
                        this.nextAnchor = $('<a href="#" class="pcNext">&gt;</a>');
                        $(this.element).append(this.nextAnchor);
                        if (!this.next) {
                            this.nextAnchor.hide();
                        }
                        // Setup touch and key navigation handlers
                        this.prevAnchor.ontouchclick(function (event) {
                            self._previous();
                        });
                        this.nextAnchor.ontouchclick(function (event) {
                            self._next();
                        });
                        if (self.settings.allowKeyNavigation) {
                            $('body').on('keyup.paginator', function (e) {
                                if (e.keyCode === 39) {
                                    self._next();
                                }
                                else if (e.keyCode === 37) {
                                    self._previous();
                                }
                            });
                        }
                        for (var i = 0; i < this.maxPage; i++) {
                            this.itemAnchors[i].ontouchclick({ pageIdx: i }, function (event) {
                                self._selPage(event.data.pageIdx);
                                self.settings.onPageRequest(self, self.currentPageIdx);
                            });
                        }
                    }
                    // Select configured page (if not 0)
                    this._selPage(this.settings.activePageIdx);
                }
            }
        },

        _addPageRight: function () {
            var adjPoint = this.leftIdx + Math.ceil((this.rightIdx - this.leftIdx) / 2);
            if (this.rightIdx != (this.maxPage - 1) &&
                this.currentPageIdx > adjPoint) {
                // Hide leftmost page
                this.firstBreak.show();
                var hideIdx = (this.leftIdx == 0) ? 1 : this.leftIdx;
                this.itemAnchors[hideIdx].hide();
                this.leftIdx = hideIdx + 1;
                // Show 1st hidden page on the right side
                var showIdx = this.rightIdx + 1;
                this.itemAnchors[showIdx].show();
                if (showIdx == (this.maxPage - 2)) {
                    this.lastBreak.hide();
                    this.rightIdx = this.maxPage - 1;
                }
                else {
                    this.rightIdx++;
                }
            }
        },

        _addPageLeft: function () {
            var adjPoint = this.leftIdx + Math.floor((this.rightIdx - this.leftIdx) / 2);
            if (this.leftIdx != 0 &&
                this.currentPageIdx < adjPoint) {
                // Hide rightmost page
                this.lastBreak.show();
                var hideIdx = (this.rightIdx == (this.maxPage - 1)) ? this.maxPage - 2 : this.rightIdx;
                this.itemAnchors[hideIdx].hide();
                this.rightIdx = hideIdx - 1;
                // Show 1st hidden page on left side
                var showIdx = this.leftIdx - 1;
                this.itemAnchors[showIdx].show();
                if (showIdx == 1) {
                    this.firstBreak.hide();
                    this.leftIdx = 0;
                }
                else {
                    this.leftIdx--;
                }
            }
        },

        _next: function () {
            if (this.next) {
                if (this.currentPageIdx <= (this.maxPage - 1)) {
                    this.currentPageIdx++;
                }
                if (this.currentPageIdx == (this.maxPage - 1)) {
                    this.next = false;
                    this.nextAnchor.hide();
                }
                if (this.currentPageIdx != 0) {
                    this.prev = true;
                    this.prevAnchor.show();
                }
                this.anchorCurrent.removeClass('pcCurrent').addClass('pcSel');
                this.anchorCurrent = this.itemAnchors[this.currentPageIdx];
                this.anchorCurrent.removeClass('pcSel').addClass('pcCurrent');
                this._addPageRight();
                this.settings.onNextClick(this, this.currentPageIdx);
                this.settings.onPageRequest(this, this.currentPageIdx);
            }
        },

        _previous: function () {
            if (this.prev) {
                var newStart = this.currentPageIdx - this.pageCount;
                if (this.currentPageIdx != 0) {
                    this.currentPageIdx--;
                }
                if (this.currentPageIdx == 0) {
                    this.prev = false;
                    this.prevAnchor.hide();
                }
                if (this.currentPageIdx != (this.maxPage - 1)) {
                    this.next = true;
                    this.nextAnchor.show();
                }
                this.anchorCurrent.removeClass('pcCurrent').addClass('pcSel');
                this.anchorCurrent = this.itemAnchors[this.currentPageIdx];
                this.anchorCurrent.removeClass('pcSel').addClass('pcCurrent');
                this._addPageLeft();
                this.settings.onPrevClick(this, this.currentPageIdx);
                this.settings.onPageRequest(this, this.currentPageIdx);
            }
        },

        _selPage: function (pageIdx) {
            if (this.currentPageIdx != pageIdx) {
                if (pageIdx == 0) {
                    this.prev = false;
                    this.prevAnchor.hide();
                }
                else {
                    this.prev = true;
                    this.prevAnchor.show();
                }
                if (pageIdx != (this.maxPage - 1)) {
                    this.next = true;
                    this.nextAnchor.show();
                }
                else {
                    this.next = false;
                    this.nextAnchor.hide();
                }
                this.anchorCurrent.removeClass('pcCurrent').addClass('pcSel');
                this.anchorCurrent = this.itemAnchors[pageIdx];
                if (this.anchorCurrent == undefined) {
                    alert('undefined');
                }
                this.anchorCurrent.removeClass('pcSel').addClass('pcCurrent');
                if (this.currentPageIdx > pageIdx) {
                    while (this.currentPageIdx != pageIdx) {
                        this.currentPageIdx--;
                        this._addPageLeft();
                    }
                }
                else {
                    while (this.currentPageIdx != pageIdx) {
                        this.currentPageIdx++;
                        this._addPageRight();
                    }
                    this._addPageRight();
                }
            }
        },

        // Reinitilize paginator
        // Arguments:
        // - argsArray: An array where the first element is the 'options' object (which is
        //              the same as the 'options' argument in the Plugin constructor).
        reInit: function (argsArray) {
            $(this.element).removeClass('paginatorComp');
            $(this.element).empty();
            if (this.settings.allowKeyNavigation) {
                $('body').off('.paginator');
            }
            $.extend(this.settings, argsArray[0]);
            this._init();
        }

    };

    $.fn[pluginName] = function (methodOrOptions) {
        var instance = $(this).data(pluginName);
        if (instance &&
             methodOrOptions.indexOf('_') != 0) {
            return instance[methodOrOptions](Array.prototype.slice.call(arguments, 1));
        }
        if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            instance = new Plugin(this, methodOrOptions);
            $(this).data(pluginName, instance);
            return $(this);
        }
        $.error('Wrong call to ' + pluginName);
    };
})(jQuery, window, document);

