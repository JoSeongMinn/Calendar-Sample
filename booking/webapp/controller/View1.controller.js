sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/unified/DateRange", 
    "sap/m/MessageToast", 
    "sap/ui/core/format/DateFormat", 
    "sap/ui/core/library",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, DateRange, MessageToast, DateFormat, coreLibrary, JSONModel) {
        "use strict";

        var CalendarType = coreLibrary.CalendarType;

        return Controller.extend("sap.sync.booking.controller.View1", {
            oFormatYyyymmdd: null,

            onInit: function () {
                this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
                /**
                 * minDate, maxDate : 달력선택 가능 날짜 설정
                 */
                var oNow = new Date();
                var oMax = new Date();
                oMax = new Date(oMax.setMonth(oNow.getMonth() + 6));
                var oData = { minDate : oNow, maxDate : oMax }                
                var oDateModel = new JSONModel(oData)
                this.getView().setModel(oDateModel, "date");
            },

            _getDatesStartToLast : function (startDate, lastDate) {
                var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
                if(!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
                var result = [];
                var curDate = new Date(startDate);
                while(curDate <= new Date(lastDate)) {
                    result.push(curDate.toISOString().split("T")[0]);
                    curDate.setDate(curDate.getDate() + 1);
                }
                return result;
            },

            handleCalendarSelect: function(oEvent) {
                var oCalendar = oEvent.getSource();
                this._updateText(oCalendar.getSelectedDates()[0]);
            },
    
            _updateText: function(oSelectedDates) {
                var oSelectedDateFrom = this.byId("selectedDateFrom"),
                    oSelectedDateTo = this.byId("selectedDateTo"),
                    oDate;
                var oLimit;
                var iMonth;
                var week = ['일', '월', '화', '수', '목', '금', '토'];

                if (oSelectedDates) {
                    oDate = oSelectedDates.getStartDate();
                    /**
                     * 최대 선택 가능 기간 설정
                     */
                    oLimit = new Date(oSelectedDates.getStartDate());
                    iMonth = oSelectedDates.getStartDate().getMonth() + 1;
                    if (oLimit) {
                        oLimit.setMonth(iMonth)
                        this.getView().byId("calendar").setMaxDate(oLimit)
                    }

                    if (oDate) {
                        oSelectedDateFrom.setText(this.oFormatYyyymmdd.format(oDate));
                    } else {
                        oSelectedDateTo.setText("No Date Selected");
                    }

                    oDate = oSelectedDates.getEndDate();
                    if (oDate) {
                        oSelectedDateTo.setText(this.oFormatYyyymmdd.format(oDate));
                        // var dayOfWeekFrom = week[new Date(oSelectedDateFrom.getText()).getDay()];
                        // var dayOfWeekTo   = week[new Date(oSelectedDateTo.getText()).getDay()];
                        // var dayWeekFrom = oSelectedDates.getStartDate().toDateString().substr(0,3)
                        // var dayWeekTo = oSelectedDates.getEndDate().toDateString().substr(0,3)
                        // MessageToast.show(dayOfWeekFrom + dayOfWeekTo + dayWeekFrom + dayWeekTo )
                        var aResult = this._getDatesStartToLast(oSelectedDateFrom.getText(), oSelectedDateTo.getText())
                        var aWeeks = [];
                        var ilength = aResult.length;
                        var iWeekDay = 0;
                        var iFri = 0;
                        var iWeekEnd = 0;
                        for (var i=0; i<ilength; i++) {
                            var sWeek = week[new Date(aResult[i]).getDay()]
                            aWeeks.push(sWeek);
                            if (sWeek == '금'){ 
                                iFri += 1;
                            } else if(sWeek == '토') {
                                iWeekEnd += 1;
                            } else if(sWeek == '일') {
                                iWeekEnd += 1;
                            } else {
                                iWeekDay += 1;
                            };
                        };
                        MessageToast.show( "평일 : " + iWeekDay + ' 금요일 : ' + iFri + " 주말 : " + iWeekEnd )
                        MessageToast.show( aResult, {
                            at: "center center",
                            width: '15em'
                        })
                        // var oModel = this.getView().getModel("date")
                        // debugger;
                        
                    } else {
                        oSelectedDateTo.setText("No Date Selected");
                    }
                } else {
                    oSelectedDateFrom.setText("No Date Selected");
                    oSelectedDateTo.setText("No Date Selected");
                }
            },
    
            handleSelectThisWeek: function() {
                this._selectWeekInterval(6);
            },
    
            handleSelectWorkWeek: function() {
                this._selectWeekInterval(4);
            },    
    
            _selectWeekInterval: function(iDays) {
                var oCurrent = new Date(), // get current date
                    iWeekStart = oCurrent.getDate() - oCurrent.getDay() + 1,
                    iWeekEnd = iWeekStart + iDays, // end day is the first day + 6
                    oMonday = new Date(oCurrent.setDate(iWeekStart)),
                    oSunday = new Date(oCurrent.setDate(iWeekEnd)),
                    oCalendar = this.byId("calendar");
    
                oCalendar.removeAllSelectedDates();
                oCalendar.addSelectedDate(new DateRange({startDate: oMonday, endDate: oSunday}));
    
                this._updateText(oCalendar.getSelectedDates()[0]);
            },

            onCancel : function(){
                var oCalendar = this.getView().byId("calendar")
                var oSelectedDateFrom = this.byId("selectedDateFrom");
                var oSelectedDateTo = this.byId("selectedDateTo");
                var oNow = new Date();
                var oMax = new Date();
                oMax = new Date(oMax.setMonth(oNow.getMonth() + 6));

                oCalendar.destroySelectedDates();
                oCalendar.setMaxDate(oMax);
                oSelectedDateFrom.setText("No Date Selected");
                oSelectedDateTo.setText("No Date Selected");
            }
        });
    });
