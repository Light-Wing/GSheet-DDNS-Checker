#!/usr/bin/env node

/*
  TODO: 
   -test case if scan timeout
    (no ports, iirc nothing to tell it timeouted)

  NOTES:
    -update is performed twice, first with IPs and clear format, 2nd with notes and background colors
*/
const required_env = [
  "SHEET_ID",
  "PRIVATE_KEY",
  "PRIVATE_KEY_ID",
  "CLIENT_EMAIL",
  "CLIENT_ID",
  "CLIENT_X509_CERT",
];
const { debug, log } = require("console");

required_env.forEach((key) => {
  if (!process.env[key]) {
    log(`missing: ${key} in process.env file`);
    process.exit(1);
  }
});

//'use strict';
const dns = require("dns");
const nmap = require("libnmap");
const { GoogleSpreadsheet } = require("google-spreadsheet");

// dev dep
const fs = require("fs"); // devdep: save reports for analyse
const { colors, isIP, isUp } = require("./_helpers/utils");
const { scan, lookup, port } = require("./_helpers/nmap");

const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
const ROW_OFFSET = 4; //From Top

const headers = [
  "ddns",
  "ip",
  "http",
  "https",
  "rtsp",
  "server",
  "device",
  "router",
  "modem",
]; //Dummi Headers Counting from 0

// dns lookup promise

(async () => {
  await doc.useServiceAccountAuth({
    type: "service_account",
    project_id: "noip-sheet",
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.CLIENT_X509_CERT,
  });
  await doc.loadInfo();
  console.log(`Loading spreadsheet: ${doc.title} (${doc.spreadsheetId})`);
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadCells();

  const data = {};
  for (let i = ROW_OFFSET, len = sheet.rowCount; i < len; i++) {
    //let HTTP_up = sheet.getCell(i, 0);
    let ddns = sheet.getCell(i, 0);
    if (ddns.value != null) {
      data[ddns.value] = {};
      let ip;
      try {
        ip = await lookup(ddns.value);
      } catch (e) {
        ip = e.code || null;
      }
      ///
      //  UPDownStats.forEach((h, j) => data[HTTP_up.value][UPDownStats[j]] = sheet.getCell(i, j));
      //  data[HTTP_up.value].HTTPS_up.value = ip; // MOD VALUE
      //  data[HTTP_up.value]['HTT'] = HTTP_up; // just to save on calls
      ///
      headers.forEach(
        (h, j) => (data[ddns.value][headers[j]] = sheet.getCell(i, j))
      );
      data[ddns.value].ip.value = ip; // MOD VALUE
      data[ddns.value]["addr"] = ip; // just to save on calls
    }
  }
  //console.table(ports);
  console.table(data, ["addr"]); // log ips
  let ports = [];
  Object.keys(data).forEach((k1) =>
    headers.slice(2).forEach((k2) => ports.push(data[k1][k2].value))
  );
  ports = Array.from(new Set(ports));
  let ips = Object.values(data)
    .map((e) => e.addr)
    .filter((ip) => isIP(ip));

  let opts = {
    timeout: 310,
    //timeout: 100,
    //timeout: 15,
    // A List of commands can be found in Nmap.txt
    //flags: ['-sv', '-p'], // This seams to work via command not in script (probbely the way the script works)
    //nmap -sV -p 9000,8000,554,443, Berkowitz137.araknisdns.com
    flags: ["-sV", "-sT", "-Pn w/Idlescan"], // This may be another option (need to test and make sure nothing goes down)
    //flags: ['-sv', '-sT', ' --version-intensity 9 '],
    //flags: ['-sV', '-sT', '-Pn'], //Working But seems DDNS port goes down after.
    //flags: ['-sV', '-sT'], //XSE
    ports: ports.filter(Boolean).join(","),
    range: Array.from(new Set(ips)),
  };
  console.log(
    "Timeout: ",
    [opts.timeout],
    "\n",
    "Flage: ",
    opts.flags,
    "\n",
    "Scanning Ports: ",
    [opts.ports]
  );
  let reports;
  try {
    console.log("Nmap is scanning...");
    reports = await scan(opts);
    //fs.writeFileSync('./reports.json', JSON.stringify(reports, null, 2)); // dev
  } catch (e) {
    reports = null;
    console.log("NMAP ERROR");
    console.log(e);
    process.exit(1);
  }

  Object.keys(data).forEach((domain) => {
    headers.forEach((col) => data[domain][col].clearAllFormatting());
    //console.log("clearing All Formatting Notes and colors");
  });
  await sheet.saveUpdatedCells(); // MOD VALUE RESET!

  Object.keys(data).forEach((domain) => {
    console.log("domain", domain);
    if (!isIP(data[domain].addr))
      headers.forEach((col) => {
        data[domain][col].backgroundColor = colors.dns;
        data[domain][col].note = "dns FAILED";
        console.warn("DNS lookup did not resolve: ", [domain]);
      });
    /* else - dns ok */

    if (isUp(reports[data[domain].addr]))
      headers.forEach((col) => {
        data[domain][col].backgroundColor = colors.down;
        console.log("host down: ", domain);
      });
    /* else - host up */

    headers.slice(0, 2).forEach((col) => {
      data[domain][col].backgroundColor = colors.up;
      data[domain][col].note = "host seems up";
      /* host up COL */
    });
    headers.slice(2).forEach((p) => {
      let pdata = port(reports[data[domain].addr], data[domain][p].value);
      pdata == null
        ? ((data[domain][p].backgroundColor = colors.timeout),
          (data[domain][p].note = "nmap timeout"))
        : ((data[domain][p].backgroundColor = colors[pdata.state.state]),
          (data[domain][
            p
          ].note = `${pdata.state.reason} (${pdata.service.name}/${pdata.service.devicetype} (${pdata.service.product})`));
      //console.log("pdate: ", pdata)
      //console.log("pdate: ", )
      if (pdata !== null) {
        //console.log("")
        //console.log([{Stats: pdata.state.state, Domain: domain, Port: pdata.portid, Name: pdata.service.name, DeviceType: pdata.service.devicetype, Product: pdata.service.product}]);
        /*console.info({
	Stats: pdata.state.state, 
    Domain: domain, 
	Port: pdata.portid, 
	Name: pdata.service.name, 
	DeviceType: pdata.service.devicetype, 
	Product: pdata.service.product
	}); */

        //console.info([pdata.state.state],domain,pdata.portid,pdata.service.name,[pdata.service.devicetype],pdata.service.product );
        console.info(pdata);
      } //abe
    });
    //console.log("host seems up: ",domain)
  });
  //  sheet.getCell(1, 1).value = new Date().toLocaleString().replace('', '').substr(0, 19); // set the 'updated' cell
  sheet.getCell(1, 1).value = new Date()
    .toLocaleString()
    .replace("", "")
    .substr(0, 23); // set the 'updated' cell
  await sheet.saveUpdatedCells();
})();
