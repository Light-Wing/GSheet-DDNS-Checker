function LastOnline_TimeStampOLD() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('NoIP');
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues();
  var source_col = headers[0].indexOf('HTTP_up') + 1;
  var target_col = headers[0].indexOf('Last Online') + 1;
  var data = sheet.getRange(2,source_col,sheet.getLastRow()-1,1).getValues();
  var timestamps = [];
  var now = new Date();
  data.forEach(function (row) {
    var val = row[0];
    if (val.match(/✅/) ) {
      timestamps.push([now]);
    }
    else {
      timestamps.push(['']);
    }
  });
  sheet.getRange(2,target_col,sheet.getLastRow()-1,1).setValues(timestamps);
}  
