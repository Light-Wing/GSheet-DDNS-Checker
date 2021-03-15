// https://community.glideapps.com/t/time-stamp-update/1382/84?u=abe.sherman
function LastOnline_TimeStamp() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('NoIP');
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues();
  var source_col_index = headers[0].indexOf('HTTP_up');
  var target_col_index = headers[0].indexOf('Last Online');
  var LastUpdate = sheet.getRange('b2').getValues()  ;
  var data = sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).getValues();
  var now = new Date(LastUpdate);
  data.forEach(function (row) {
    var source_col_val = row[source_col_index];
    if (source_col_val.match(/✅/) ) {
      row[target_col_index] = now;
      //row[target_col_index] = LastUpdate;
    }
  });
  sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).setValues(data);
}
