sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("capui.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oViewModel;

			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
			});
			this.setModel(oViewModel, "worklistView");

            $.ajax({
				type : 'GET',
				url: "./api/geode",
		        success: function(data){
                    var currentText = that.getView().byId("myTitle").getText();
		        	that.getView().byId("myTitle").setText(currentText + " (served from " + data + ")");
		        },
		        error:function(data){
		        	console.log("error "+JSON.stringify(data));
		        }
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * Navigate back in the browser history
		 * @public
		 */
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},


		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("carrid", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		onOpenDialog : function () {
            this._getDialog().open();
        },
        onCloseDialog : function () {
            this._getDialog().close();
        },
        onSend : function () {
            var input = {
                id: this.getView().byId("dlg_id").getValue(),
                carrid: this.getView().byId("dlg_carrid").getValue(),
                connid: this.getView().byId("dlg_connid").getValue(),
                fldate: this.getView().byId("dlg_fldate").getValue(),
                planetype: this.getView().byId("dlg_planetype").getValue(),
                seatsmax: parseInt(this.getView().byId("dlg_seatsmax").getValue()),
                seatsocc: parseInt(this.getView().byId("dlg_seatsocc").getValue())
                }
            var oTable = this.byId("table");
            var oContext = oTable.getBinding("items").create(input);
            
            this._getDialog().close();
            
            // Note: this promise fails only if the transient entity is delete or canceled
			this.oSflightItemCreated = oContext.created().then(function () {
				var oItem = oTable.getSelectedItem();
                oTable.setSelectedItem(oTable.getItems()[oContext.getIndex()]);
                oTable.getItems()[0].focus();                   
				//MessageBox.success("New item synched with CosmosDB: ");
				if (oItem && oItem.getBindingContext() === oContext) {
                    //that.setSalesOrderLineItemBindingContext(oContext);
                     this.onRefresh();
				}
			}).catch(function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			}).finally(function () {
            });
        },

        onDelete : function () {
            this.byId("table").getSelectedItem().getBindingContext().delete();
        },

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

        _getDialog : function () {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(this.getView().getId(),"capui.view.AddDialog", this);
                this.getView().addDependent(this._oDialog);
            }
            return this._oDialog;
        }, 

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			var that = this;

			oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
				that.getRouter().navTo("object", {
					objectId_Old: oItem.getBindingContext().getProperty("id"),
					objectId : sObjectPath.slice("/Sflight".length) // /Products(3)->(3)
				});
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});