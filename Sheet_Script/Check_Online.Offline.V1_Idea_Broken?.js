function sendAlertEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('NoIP');
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues();

  var starting_Email_col = headers[0].indexOf('Alert 1'); 
  var startRow = 5; // First row of data to process
  var numRows = 1; // Number of rows to process 
  var numCols = 6; // Number of rows to process 
  var Grab_Email = sheet.getRange(startRow, starting_Email_col+1, numRows, numCols); 

  //row cor, num row, num col 

  console.log(Grab_Email);
  // Fetch values for each row in the Range.
  var data = Grab_Email.getValues();
  for (var i in data) { var row = data[i]; 
    var email_list = row[0]+","+row[1]+","+row[2]+","+row[3]+","+row[4]+","+row[5];
    console.log(email_list);
    var emailAddress = email_list; // First column
    var message = Grab_Email; // Second column
    var subject = 'Sending emails from a Spreadsheet';
    MailApp.sendEmail(emailAddress, subject, message);
  }
}





function DDNSOFFLINE() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('NoIP');
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues();
  var starting_Email_col = headers[0].indexOf('Alert 1'); 
  var startRow = 5; /* First row of data to process */
  var numRows = 1; /* Number of rows to process */
  var numCols = 1; /* Number of rows to process */
  var Grab_Emails = sheet.getRange(startRow, starting_Email_col+1, numRows, numCols);  
 
  var target_timestamp_index = headers[0].indexOf('last email Sent');
  var source_col_index = headers[0].indexOf('HTTP_up'); 
  var DDNS = headers[0].indexOf('DDNS Update Time'); 
  var Alert_col = headers[0].indexOf('Alert Sent'); 
  var data = sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).getValues(); 
  var now = new Date(); 
  data.forEach(function (row) { 
    var source_col_val = row[source_col_index];
    var alert_col_val = row[Alert_col];  
    
      if (source_col_val.match(/✅/) ) {//IF UP 
      if (alert_col_val.match(/UP/) ) { row[Alert_col] = "";  }
      if (alert_col_val.match(/Down/) ) {  //row[Alert_col] = "Email Sent - UP"; 
        
        
        //var alert_col_val = row[Alert_col];  
        var email_list = row[Alert_col+2]+","+row[Alert_col+3]+","+row[Alert_col+4]+","+row[Alert_col+5]+","+row[Alert_col+6]+","+row[Alert_col+7];
        var data = Grab_Emails.getValues();
        for (var i in data) { var row = email_list[i];  

    var Email_List_is_email = email_list; 
    console.log(email_list)
   ///* if (Email_List_is_email.match(/./) ) {    
    var emailAddress = email_list; // First column
    var message = "Test "+"row[DDNS]: "+row[DDNS]+" DDNS: "+DDNS;  // Second column
    var subject = row[Grab_Emails];
    //console.log(row[DDNS]);
    MailApp.sendEmail(emailAddress, subject, message);
    console.log(MailApp);
    
 // }*/
 }
  } // 

      } 
      if (source_col_val.match(/👎/) ) { // If down Put time stamp of when down. If Down more then 5 hours of NOW then email.
      if (alert_col_val !== "✅" ) { row[target_timestamp_index] = now; row[Alert_col] = "Down - Email Sent";    } // 
      row[target_timestamp_index] = now; 
    }  
  });
  sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).setValues(data);
}


