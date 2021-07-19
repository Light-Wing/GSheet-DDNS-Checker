//
const ipv4 =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ipv6 =
  /^[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}\:[a-fA-F0-9]{1, 4}$/;
const isIP = (ip) => (ip.match(ipv4) || ip.match(ipv6) ? true : false);

const isUp = (rdata) =>
  rdata.runstats[0].hosts[0].item.up == 1 ? true : false;

// v4 wants an RGB(A) obj with values in a 0-1 range, totally discarding alpha here
const hex2RGBA = (hexCode) => {
  const hex = hexCode.replace("#", "");
  if (hex.length === 3) hex += hex;
  return {
    red: parseInt(hex.substring(0, 2), 16) / 255,
    green: parseInt(hex.substring(2, 4), 16) / 255,
    blue: parseInt(hex.substring(4, 6), 16) / 255,
  };
};

const colors = {
  up: hex2RGBA("#A9DFBF"), // green
  down: hex2RGBA("#E74C3C"), // red
  dns: hex2RGBA("#D3D3D3"), // grey
  timeout: hex2RGBA("#c85103"), // the timeout color \o/
  open: hex2RGBA("#A9DFBF"), // green
  closed: hex2RGBA("#E74C3C"), // red
  filtered: hex2RGBA("#F39C12"), // orange
  unfiltered: hex2RGBA("#F7DC6F"), // yellow
  "open|filtered": hex2RGBA("#C39BD3"), // purple
  "closed|filtered": hex2RGBA("#873600"), // brown
};

module.exports = { colors, hex2RGBA, isIP, isUp };
