// v1.1.4: a deliberately limited command-practice model, not a network emulator.
const LAB_VALIDATION_VERSION = '1.1.4';
function ipv4Number(value) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return null;
  const octets = value.split('.').map(Number);
  if (octets.some(n => n > 255)) return null;
  return octets.reduce((n, octet) => (n * 256 + octet) >>> 0, 0);
}
function maskPrefix(mask) {
  const n = ipv4Number(mask);
  if (n === null) return null;
  const bits = n.toString(2).padStart(32, '0');
  return /^1*0*$/.test(bits) ? bits.indexOf('0') === -1 ? 32 : bits.indexOf('0') : null;
}
class LabSession {
  constructor(id) {
    this.id = id; this.mode = 'user'; this.host = labs[id].device;
    this.vlan = null; this.vlans = {}; this.routes = [];
    this.ospf = false; this.routerId = ''; this.network = ''; this.acl = false;
    this.enteredPriv = false; this.enteredConfig = false;
    this.revision = 0; this.verifiedRevision = -1;
  }
  get prompt() {
    const suffix = {user:'>', priv:'#', config:'(config)#', vlan:'(config-vlan)#', router:'(config-router)#'};
    return this.host + suffix[this.mode];
  }
  changed() { this.revision++; this.verifiedRevision = -1; }
  get target() {
    switch (this.id) {
      case 'l1': return this.host === 'SW1';
      case 'l2': return this.vlans['10'] === 'USERS' && this.vlans['20'] === 'VOICE';
      case 'l3': return this.routes.some(r => r.network === '10.20.0.0' && r.mask === '255.255.0.0' && r.nextHop === '192.168.1.2');
      case 'l4': return this.ospf && this.routerId === '1.1.1.1' && this.network === '10.0.0.0 0.0.0.255 area 0';
      case 'l5': return this.acl;
    }
    return false;
  }
  get verified() { return this.target && this.verifiedRevision === this.revision && this.mode === 'priv'; }
  get checklist() {
    switch (this.id) {
      case 'l1': return [this.enteredPriv, this.enteredConfig, this.host === 'SW1', this.mode === 'priv', this.verified];
      case 'l2': return [this.enteredConfig, Object.hasOwn(this.vlans,'10'), this.vlans['10'] === 'USERS', Object.hasOwn(this.vlans,'20'), this.vlans['20'] === 'VOICE', this.verified];
      case 'l3': return [this.enteredConfig, this.target, this.mode === 'priv', this.verified];
      case 'l4': return [this.enteredConfig, this.ospf, this.routerId === '1.1.1.1', this.network === '10.0.0.0 0.0.0.255 area 0', this.verified];
      case 'l5': return [this.enteredConfig, this.acl, this.mode === 'priv', this.verified];
    }
  }
  get complete() { return this.checklist.every(Boolean); }
  verify(forLab) { if (this.id === forLab && this.target && this.mode === 'priv') this.verifiedRevision = this.revision; }
  run(raw) {
    const c = raw.trim().replace(/\s+/g,' '), lc = c.toLowerCase();
    if (!c) return '';
    if (lc === '?' || lc === 'help') return 'Supported practice commands: enable, configure terminal (conf t), hostname NAME, vlan ID, name NAME, ip route NETWORK MASK NEXT-HOP, router ospf 1, router-id ADDRESS, network ADDRESS WILDCARD area 0, access-list 10 permit 192.168.10.0 0.0.0.255, end, exit, disable.\nVerification: show running-config, show vlan brief, show ip route, show ip ospf, show access-lists.\nUndo: no vlan ID, no ip route NETWORK MASK NEXT-HOP, no router ospf 1, no access-list 10.\nThis simulator has no interfaces, links, packet forwarding, or OSPF neighbors.';
    if (this.mode === 'user' && lc === 'enable') { this.mode = 'priv'; this.enteredPriv = true; return ''; }
    if (this.mode === 'user') return '% Enter privileged EXEC with enable before using these practice commands.';
    if (lc === 'disable' && this.mode === 'priv') { this.mode = 'user'; return ''; }
    if (this.mode === 'priv' && (lc === 'conf t' || lc === 'configure terminal')) { this.mode = 'config'; this.enteredConfig = true; return ''; }
    if (lc === 'end' && this.mode !== 'priv') { this.mode = 'priv'; return ''; }
    if (lc === 'exit') {
      this.mode = this.mode === 'vlan' || this.mode === 'router' ? 'config' : this.mode === 'config' ? 'priv' : 'user';
      return '';
    }
    let match;
    if (this.mode === 'config' && (match = c.match(/^hostname ([A-Za-z][A-Za-z0-9-]{0,62})$/i))) {
      this.host = match[1]; this.changed(); return '';
    }
    if (this.mode === 'config' && (match = lc.match(/^(no )?vlan (\d+)$/))) {
      const id = Number(match[2]);
      if (id < 2 || id > 1005) return '% This practice simulator supports normal-range VLAN IDs 2–1005.';
      if (match[1]) delete this.vlans[id];
      else { this.vlan = String(id); this.vlans[id] ||= 'VLAN' + String(id).padStart(4,'0'); this.mode = 'vlan'; }
      this.changed(); return '';
    }
    if (this.mode === 'vlan' && (match = c.match(/^name ([A-Za-z0-9_-]{1,32})$/i))) {
      this.vlans[this.vlan] = match[1]; this.changed(); return '';
    }
    if (this.mode === 'config' && (match = lc.match(/^(no )?ip route (\S+) (\S+) (\S+)$/))) {
      const [,remove,network,mask,nextHop] = match;
      const net = ipv4Number(network), maskValue = ipv4Number(mask), prefix = maskPrefix(mask);
      if (net === null || prefix === null || ipv4Number(nextHop) === null) return '% Use valid IPv4 addresses and a contiguous subnet mask.';
      if (((net & maskValue) >>> 0) !== net) return '% Network address has host bits set for this mask.';
      const same = r => r.network === network && r.mask === mask && r.nextHop === nextHop;
      if (remove) this.routes = this.routes.filter(r => !same(r));
      else if (!this.routes.some(same)) this.routes.push({network,mask,nextHop,prefix});
      this.changed(); return '';
    }
    if (this.mode === 'config' && lc === 'router ospf 1') { this.ospf = true; this.mode = 'router'; this.changed(); return ''; }
    if (this.mode === 'config' && lc === 'no router ospf 1') { this.ospf = false; this.routerId = ''; this.network = ''; this.changed(); return ''; }
    if (this.mode === 'router' && (match = lc.match(/^router-id (\S+)$/))) {
      if (ipv4Number(match[1]) === null) return '% Use an IPv4-format router ID.';
      this.routerId = match[1]; this.changed(); return '';
    }
    if (this.mode === 'router' && (match = lc.match(/^network (\S+) (\S+) area 0$/))) {
      if (ipv4Number(match[1]) === null || ipv4Number(match[2]) === null) return '% Use valid IPv4-format network and wildcard values.';
      this.network = match[1] + ' ' + match[2] + ' area 0'; this.changed(); return '';
    }
    if (this.mode === 'config' && lc === 'access-list 10 permit 192.168.10.0 0.0.0.255') { this.acl = true; this.changed(); return ''; }
    if (this.mode === 'config' && lc === 'no access-list 10') { this.acl = false; this.changed(); return ''; }
    if (this.mode === 'priv' && lc === 'show running-config') {
      this.verify('l1');
      return 'Practice running configuration:\nhostname ' + this.host +
        Object.entries(this.vlans).map(([id,name]) => '\nvlan ' + id + '\n name ' + name).join('') +
        this.routes.map(r => '\nip route ' + r.network + ' ' + r.mask + ' ' + r.nextHop).join('') +
        (this.ospf ? '\nrouter ospf 1' + (this.routerId ? '\n router-id ' + this.routerId : '') + (this.network ? '\n network ' + this.network : '') : '') +
        (this.acl ? '\naccess-list 10 permit 192.168.10.0 0.0.0.255' : '');
    }
    if (this.mode === 'priv' && lc === 'show vlan brief') {
      this.verify('l2');
      return 'VLAN Name                             Status\n1    default                          active' +
        Object.entries(this.vlans).map(([id,name]) => '\n' + id.padEnd(4) + ' ' + name.padEnd(32) + ' active').join('');
    }
    if (this.mode === 'priv' && lc === 'show ip route') {
      this.verify('l3');
      return 'Configured static routes — next-hop reachability and route installation are not simulated.' +
        (this.routes.length ? this.routes.map(r => '\nS    ' + r.network + '/' + r.prefix + ' [1/0] via ' + r.nextHop).join('') : '\nNo static routes configured.');
    }
    if (this.mode === 'priv' && lc === 'show ip ospf') {
      this.verify('l4');
      return this.ospf ? 'Practice OSPF process 1\nRouter ID: ' + (this.routerId || 'not set') + '\nNetwork statement: ' + (this.network || 'not configured') + '\nNo neighbor adjacency or route exchange is simulated.' : '% OSPF is not configured.';
    }
    if (this.mode === 'priv' && lc === 'show access-lists') {
      this.verify('l5');
      return this.acl ? 'Standard IP access list 10\n    permit 192.168.10.0, wildcard bits 0.0.0.255\nThis entry is not applied to an interface; traffic filtering is not simulated.' : 'No access lists configured.';
    }
    return '% Unsupported command, syntax, or mode in this limited simulator. Type ? for its supported commands. A command unsupported here may be valid on real IOS.';
  }
}
