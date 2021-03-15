// You don't need this since you have the Nmap bot running. This is extra script.
// This script has issues. with pining anything other then HTTP
// Known issues. And proppely the reasons we dont use it. 
// 1. It will only ping HTTP if there is a valid response. 
// 2. TimeOut issues.
// The script is here. good luck.
function SingleRowPing() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NoIP');
  const row = sheet.getActiveRange().getRowIndex(); 
  const range = sheet.getRange(row, 2, 1, 10).getValues();
  const urls = range.map(r => r[0]).flat().filter(Boolean); 
  const ports = range.map(r => [r[5],r[6] ,r[7] ,r[8] , r[9]]);
  const colors = Array(urls.length).fill(null).map(() => Array(5).fill('white')); // 5 cols w
  urls.forEach((url, i) => {
    ports[i].forEach((port, j) => {
      try {
        let rsp;
        (port == '') 
          ? rsp = UrlFetchApp.fetch('http://'+url, {muteHttpExceptions: true})
          : (j === 3)
            ? rsp = UrlFetchApp.fetch('https://'+url+':'+port, {muteHttpExceptions: true})
            : rsp = UrlFetchApp.fetch('http://'+url+':'+port, {muteHttpExceptions: true});
           // Logger.log(rsp = UrlFetchApp.fetch('http://'+url+':'+port, {muteHttpExceptions: true}));
          console.log('domain: '+url+' port: '+port+' responseCode: '+rsp.getResponseCode())
          colors[i][j] = 'red';  
        if(rsp.getResponseCode() == 403)
          colors[i][j] = 'white';
        if(rsp.getResponseCode() == 200)
          colors[i][j] = 'lightgreen';
      } catch(e) {
        colors[i][j] = 'red';
        //Logger.log(colors);
      }
    });
  });
  sheet.getRange(row, 7, colors.length, colors[0].length).setBackgrounds(colors);
//  sheet.getRange(row, 7, colors.length, colors[0].length).setBackgrounds(colorsGood);
 // Logger.log(colors);
}
