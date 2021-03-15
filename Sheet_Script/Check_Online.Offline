function Alert_when_offline_Online() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NoIP');
  let store = JSON.parse(PropertiesService.getScriptProperties().getProperty('sent'));
  if(!store) store = [];
  console.log(`store: ${JSON.stringify(store)}`);
  // PropertiesService.getScriptProperties().deleteAllProperties();
  const quota = MailApp.getRemainingDailyQuota();
  const data = sheet.getDataRange().getValues(); //Evrything but the headers. 
  const headers = data.shift(); //All headers
  const index = Object.fromEntries(headers.filter(Boolean).map(e => [e, headers.indexOf(e)])); //All heders by number
  const now = new Date();
  const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
  data.forEach((row,i) => { 
    switch (row[index['HTTP_up']]) { 
    
case (row[index['HTTP_up']].match(/^✅/) || {}).input:  //(source_col_val.match(/✅/)
        if (row[index['Alert_state']].includes('👎')) { 
          data[i][index['Alert_state']] = '✅'; // ack state changed
          data[i][index['Alert_timestamp']] = timestamp; // state changed -> new timestamp
          console.log(`[${row[index['DDNS']]}] up state ack`);
          if(store.includes(row[index['DDNS']])) store.splice(store.indexOf(row[index['DDNS']]), 1); // remove sent mail from store if any
          let addr = data[i].slice(index['mail 1'], index['mail 6']+1).filter(Boolean);
          if(quota > addr.length){
            console.log(`[${row[index['DDNS']]}] down -> up mail to ${addr.join(',')} `)

            var emailAddress = `${addr.join(',')}`;
            var subject = 'DDNS Online';
            var message =  `\n\n${row[index['DDNS']]}:${row[index['HTTP']]}\n\nAll the following peaple receved a down -> up alert. \n\n${addr.join('\n')}\n\nAny questions? please contact us\nCompany: 1231112222`;
            //MailApp.sendEmail(emailAddress, subject, message); // //Comented out while your testing. 
            console.log("MailApp Sending Down: ",quota,MailApp,"More Info: ",emailAddress,subject,message)
          }
          else { console.log("Your sent to many mail today. Google wont allow you to send more. ",quota )}
        }
        if(row[index['Alert_state']] === "") {  data[i][index['Alert_state']] = '✅'; } // If empty cell UP
        break; 

case (row[index['HTTP_up']].match(/^👎/) || {}).input: 
        if(row[index['Alert_state']].includes('✅')) {
        //if(row[index['Alert_state']] === '✅') { 
          data[i][index['Alert_state']] = '👎'; // ack state changed
          data[i][index['Alert_timestamp']] = timestamp; // state changed -> new timestamp
          console.log(`[${row[index['DDNS']]}] down state ack`);
        } else { // Alert_state already '👎'
          let addr = data[i].slice(index['mail 1'], index['mail 6']+1).filter(Boolean);
          // send mail if not already sent if quota ok if down more than 5h
          if(!store.includes(row[index['DDNS']]) && quota > addr.length && Date.parse(row[index['Alert_timestamp']]) < now - 1000*60*60*5) {
            store.push(row[index['DDNS']]); // mail +5h sent
            console.log(`[${row[index['DDNS']]}] send down for +5h mail to ${addr.join(',')}`);
            var emailAddress = `${addr.join(',')}`; //Email
            console.log("Console log Email:",emailAddress);
            //if(emailAddress !== null) { if email is not Null 
            var subject = `DDNS Offline for about 5 Hours.`
            var message = `\n\n${row[index['DDNS']]}:${row[index['HTTP']]}\n\nThe follwing receved a UP -> DOWN alert.\n\n${addr.join('\n')}\n\nAny questions? please contact us\nCompany: 1231112222 `; 
            //MailApp.sendEmail(emailAddress, subject, message); // Uncoment when your ready. 
          //}
          }
        }
        if(row[index['Alert_state']] === "") {  data[i][index['Alert_state']] = '👎'; } // If empty cell Down 
         
        break;
      default:
  console.log(`unknown state ${row[index['HTTP_up']]} for ${row[index['DDNS']]}`);
      }
  });
  data.unshift(headers);
  console.log(`saving store: ${JSON.stringify(store)}`);
  PropertiesService.getScriptProperties().setProperty('sent', JSON.stringify(store));
  sheet.getRange(1,1,data.length,data[0].length).setValues(data);
}


function clr() {             //✅☑️✅✔️❎❌✖️❎
  PropertiesService.getScriptProperties().deleteAllProperties();
}
