#!/usr/bin/env node

/*
  TODO: 
   -test case if scan timeout
    (no ports, iirc nothing to tell it timeouted)

  NOTES:
    -update is performed twice, first with IPs and clear format, 2nd with notes and background colors
*/

//'use strict';
const dns = require('dns');
const nmap = require('libnmap');
const { GoogleSpreadsheet } = require('google-spreadsheet');

// dev dep
const fs = require('fs'); // devdep: save reports for analyse

const creds = require('./Your_Google_API.JSON'); // 
const doc = new GoogleSpreadsheet(' Your Sheet ID'); // Your Sheet ID
const ROW_OFFSET = 4;  //From Top

const headers = ['ddns', 'ip', 'http', 'https', 'rtsp', 'server', 'router']; 
const ipv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ipv6 = /^[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}$/;
const isIP = ip => (ip.match(ipv4) || ip.match(ipv6)) ? true : false;

const isUp = rdata => (rdata.runstats[0].hosts[0].item.up == 1) ? true : false;
const port = (rdata, port) => {
  if(!rdata.host[0].ports || !rdata.host[0].ports[0].port.map(e => e.item.portid).some(p => p == port))
    return null; // timeout
  const find = rdata.host[0].ports[0].port.filter(e => e.item.portid == port)[0];
  return {
    protocol: find.item.protocol,
    portid: find.item.portid,
    state: find.state[0].item,
    service: find.service[0].item
  };
};

// v4 wants an RGB(A) obj with values in a 0-1 range, totally discarding alpha here
const hex2RGBA = hexCode => {
  const hex = hexCode.replace('#', '');
  if(hex.length === 3)
    hex += hex
  return {red: parseInt(hex.substring(0, 2), 16)/255, green: parseInt(hex.substring(2, 4), 16)/255, blue: parseInt(hex.substring(4, 6), 16)/255};
};

const colors = {
  "up": hex2RGBA("#A9DFBF"), // green
  "down": hex2RGBA("#E74C3C"), // red
  "dns": hex2RGBA("#D3D3D3"), // grey
  "timeout": hex2RGBA("#c85103"), // the timeout color \o/
  "open": hex2RGBA("#A9DFBF"), // green
  "closed": hex2RGBA("#E74C3C"), // red
  "filtered": hex2RGBA("#F39C12"), // orange
  "unfiltered": hex2RGBA("#F7DC6F"), // yellow
  "open|filtered": hex2RGBA("#C39BD3"), // purple
  "closed|filtered": hex2RGBA("#873600") // brown
};

// dns lookup promise
async function lookup(domain){
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if(err) reject(err);
      resolve(address);
    });
  });
};

// nmap promise
async function scan(opts){
  return new Promise((resolve, reject) => {
    nmap.scan(opts, function(err, report) {
      if(err) reject(err);
      resolve(report);
    });
  });
};

(async () => {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  console.log(`Loading spreadsheet: ${doc.title} (${doc.spreadsheetId})`);
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadCells();

  const data = {};
  for(let i=ROW_OFFSET, len=sheet.rowCount; i<len; i++) {
    //let HTTP_up = sheet.getCell(i, 0);
    let ddns = sheet.getCell(i, 0);
    if(ddns.value != null) {
      data[ddns.value] = {};
      let ip;
      try {
        ip = await lookup(ddns.value);
      } catch(e) {
        ip = e.code || null;
      } 
      headers.forEach((h, j) => data[ddns.value][headers[j]] = sheet.getCell(i, j));
      data[ddns.value].ip.value = ip; // MOD VALUE
      data[ddns.value]['addr'] = ip; // just to save on calls
    }
  }
  console.table(data, ["addr"]); // log ips
  let ports = [];
  Object.keys(data).forEach(k1 => headers.slice(2).forEach(k2 => ports.push(data[k1][k2].value)));
  ports = Array.from(new Set(ports));
  let ips = Object.values(data).map(e => e.addr).filter(ip => isIP(ip));

  let opts = { 
    timeout: 30,
	// A List of commands can be fount in Nmap.txt
    //flags: ['-sv', '-p'], //  
	flags: ['-sV', '-sT', '-Pn w/Idlescan'],  
    //flags: ['-sV', '-sT'], //XSE
    ports: ports.filter(Boolean).join(','),
    range: Array.from(new Set(ips))
  };
 
  console.log(opts);
  let reports;
  try {
    reports = await scan(opts);
    //fs.writeFileSync('reports.json', JSON.stringify(reports, null, 2)); // dev
  } catch(e) {
    reports = null;
    console.log('NMAP ERROR');
    console.log(e);
    process.exit(1);
  }

  Object.keys(data).forEach(domain => {
    headers.forEach(col => data[domain][col].clearAllFormatting());
  });
  await sheet.saveUpdatedCells(); // MOD VALUE RESET!

  Object.keys(data).forEach(domain => {
    if(isIP(data[domain].addr)) {
      /* dns ok */
      if(isUp(reports[data[domain].addr])) {
        /* host up */
        headers.slice(0, 2).forEach(col => {
          data[domain][col].backgroundColor = colors.up;
          data[domain][col].note = 'host seems up';
		 // console.log(data[domain])
        /* host up COL */
	});
        headers.slice(2).forEach(p => {
          let pdata = port(reports[data[domain].addr], data[domain][p].value);
          (pdata == null)
            ? (data[domain][p].backgroundColor = colors.timeout, data[domain][p].note = 'nmap timeout')
            : (data[domain][p].backgroundColor = colors[pdata.state.state], data[domain][p].note = `${pdata.state.reason} (${pdata.service.name}/(${pdata.service.product})`);
        });
      } else {
        /* host down */
        headers.forEach(col => {
          data[domain][col].backgroundColor = colors.down;
          data[domain][col].note = 'down/filtered';
			//console.log(data[domain])
        });
      }

    } else {
      /* dns not ok */
      headers.forEach(col => {
        data[domain][col].backgroundColor = colors.dns;
        data[domain][col].note = 'dns FAILED';
      });
    }
  });
//  sheet.getCell(1, 1).value = new Date().toLocaleString().replace('', '').substr(0, 19); // set the 'updated' cell
  sheet.getCell(1, 1).value = new Date().toLocaleString().replace('', '').substr(0, 23); // set the 'updated' cell
  await sheet.saveUpdatedCells();
})();

