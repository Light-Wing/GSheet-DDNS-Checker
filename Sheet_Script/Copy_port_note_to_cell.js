 function Copy_Note_Tocell() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NoIP');
    GetNotes = sheet.getRange('C5:G').getNotes();
    GetTime = sheet.getRange('C5:C').getNotes();
    CurrentTime = sheet.getRange('b1').getValues();
    //sheet.getRange('H5:L').setValues(sheet.getRange('C5:G').getNotes());
    //SetNotes = Notes.setValues();
 
  const repl = {
    "syn-ack": "✅",
    "conn-refused": "🤔 refused",
    "nmap timeout":"",
    "down/filtered": "🛑 Somthing is wrong",
    "no-response": "👎 no-response"
  };//❓🤔🧐🤔🤯

// GetNotes.foreach((Row,Count_+1 => Row.forEach((col,Count_+1))
  GetNotes.forEach((r,i) => r.forEach((c, j) => {
    for (const [key, value] of Object.entries(repl)) {
      if(c.includes(key))
          //GetNotes[i][j] = value;
          //GetNotes Counted Row And Counted COL = (to See number ROW,Cell is)
          //GetNotes[i][j] = "GetNotes["+i+"]["+j+"]";    
          GetNotes[i][j] = `${value} ${GetNotes[i][j].slice(key.length+1)}`;
            }

            }));
    sheet.getRange('H5:L').setValues(GetNotes);
};
