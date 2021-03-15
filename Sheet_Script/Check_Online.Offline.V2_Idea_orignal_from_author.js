function clr() {
  PropertiesService.getScriptProperties().deleteAllProperties();
}

function foo() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('🚀');
  let store = JSON.parse(PropertiesService.getScriptProperties().getProperty('sent'));
  if(!store) store = [];
  console.log(`store: ${JSON.stringify(store)}`);
  // PropertiesService.getScriptProperties().deleteAllProperties();
  const quota = MailApp.getRemainingDailyQuota();
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const index = Object.fromEntries(headers.filter(Boolean).map(e => [e, headers.indexOf(e)]));
  const now = new Date();
  const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
  data.forEach((row,i) => {
    switch (row[index['state']]) {
      case '✅':
        if(row[index['alert_state']] === '👎') {
          data[i][index['alert_state']] = '✅'; // ack state changed
          data[i][index['alert_timestamp']] = timestamp; // state changed -> new timestamp
          console.log(`[${row[index['ddns']]}] up state ack`);
          if(store.includes(row[index['ddns']])) store.splice(store.indexOf(row[index['ddns']]), 1); // remove sent mail from store if any
          let addr = data[i].slice(index['mail 1'], index['mail 6']+1).filter(Boolean);
          if(quota > addr.length)
            console.log(`[${row[index['ddns']]}] down -> up mail to ${addr.join(',')}`);
        }
        break;
      case '👎':
        if(row[index['alert_state']] === '✅') {
          data[i][index['alert_state']] = '👎'; // ack state changed
          data[i][index['alert_timestamp']] = timestamp; // state changed -> new timestamp
          console.log(`[${row[index['ddns']]}] down state ack`);
        } else { // alert_state already '👎'
          let addr = data[i].slice(index['mail 1'], index['mail 6']+1).filter(Boolean);
          // send mail if not already sent if quota ok if down more than 5h
          if(!store.includes(row[index['ddns']]) && quota > addr.length && Date.parse(row[index['alert_timestamp']]) < now - 1000*60*60*5) {
            console.log(`[${row[index['ddns']]}] send down for +5h mail to ${addr.join(',')}`);
            store.push(row[index['ddns']]); // mail +5h sent
          }
        }
        break;
      default:
        console.log(`unknown state ${row[index['state']]} for ${row[index['ddns']]}`);
    }
  });
  data.unshift(headers);
  console.log(`saving store: ${JSON.stringify(store)}`);
  PropertiesService.getScriptProperties().setProperty('sent', JSON.stringify(store));
  sheet.getRange(1,1,data.length,data[0].length).setValues(data);
}

function populate() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('🚀');
  const timestamp = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  const data = [["ddns","state","alert_state","alert_timestamp",...[...Array(6)].map((_,i) => `mail ${i+1}`)]];
  for(let i=0;i<49;i++) {
    data.push([
      `${[...Array(Math.floor(Math.random()*(10-5))+5)].map(() => (~~(Math.random()*36)).toString(36)).join('')}.ddns.foo`,
      Math.random() > 0.3 ? "✅" : "👎",
      null,
      null,
      ...[...Array(6)]
        .map(e => Math.random() > 0.7
          ? `${[...Array(Math.floor(Math.random()*(10-5))+5)].map(() => (~~(Math.random()*36)).toString(36)).join('')}@mail.foo`
          : null
        ).sort((a,b) => (a===null)-(b===null) || -(a>b)||+(a<b))
    ]);
  }
  sheet.getRange(1,1,data.length,data[0].length).clear({contentsOnly: true}).setValues(data.map((row,i) => row.map((e,j) => (i != 0 && (j === 2 || j === 3 )) ? j === 2 ? row[1] : timestamp : e)));
}
