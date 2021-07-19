const dns = require("dns");

async function lookup(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
      //console.log('Looking up DDNS: ',domain, ' -> ',address);
    });
  });
}
const nmap = require("libnmap");

// nmap promise
async function scan(opts) {
  return new Promise((resolve, reject) => {
    nmap.scan(opts, function (err, report) {
      if (err) reject(err);
      resolve(report);
      //console.log('Live Report: ',report);
    });
  });
  //console.log('NMAP',opts);
}

const port = (rdata, port) => {
  if (
    !rdata.host[0].ports ||
    !rdata.host[0].ports[0].port
      .map((e) => e.item.portid)
      .some((p) => p == port)
  )
    return null; // timeout
  const find = rdata.host[0].ports[0].port.filter(
    (e) => e.item.portid == port
  )[0];
  return {
    protocol: find.item.protocol,
    portid: find.item.portid,
    state: find.state[0].item,
    service: find.service[0].item,
  };
};

module.exports = { scan, lookup, port };
