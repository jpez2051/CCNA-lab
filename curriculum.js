// CCNA Launchpad v1.1.4 curriculum. Apply sequencing before building the question bank.
const domains=[
 {id:'fund',icon:'🧱',title:'Network Fundamentals',desc:'Learn what networks are, how data moves, Ethernet, IPv4/IPv6 and subnetting.'},
 {id:'access',icon:'🔀',title:'Network Access',desc:'Switching, VLANs, trunks, STP, EtherChannel and wireless access.'},
 {id:'routing',icon:'🧭',title:'IP Connectivity',desc:'Routing tables, static routes, OSPF and path selection.'},
 {id:'services',icon:'🛠️',title:'IP Services',desc:'DHCP, DNS, NAT, NTP, QoS, SNMP, syslog and SSH.'},
 {id:'security',icon:'🛡️',title:'Security Fundamentals',desc:'Threats, hardening, ACLs, port security, AAA, VPN and wireless security.'},
 {id:'auto',icon:'🤖',title:'Automation & Programmability',desc:'Controllers, APIs, JSON, automation and modern network operations.'}
];
const lessons=[
 {id:'f1',domain:'fund',title:'What Is a Network?',mins:12,lab:null,body:`
   <p>You already use networks every day. When your phone opens a website, it must get data from another computer. A <b>network</b> is simply a group of devices that can exchange information.</p>
   <div class="analogy"><b>Think of a network like a delivery system.</b> End devices are houses, switches are local sorting depots, routers choose roads between towns, and an IP address tells the delivery system where a packet needs to go.</div>
   <h3>The four jobs to remember</h3><ul><li><b>Hosts</b> create and consume data: laptops, phones, servers, cameras.</li><li><b>Switches</b> move Ethernet frames inside a LAN.</li><li><b>Routers</b> move IP packets between different networks.</li><li><b>Media</b> carries signals: copper, fiber, or radio.</li></ul>
   <div class="concept-box"><b>Exam language:</b> A LAN normally covers a local area. A WAN connects networks across larger geographic areas. The Internet is a network of networks.</div>`,q:{q:'Which device normally forwards traffic between different IP networks?',opts:['Switch','Router','Wireless client','Patch panel'],a:1,e:'A router makes Layer 3 forwarding decisions between IP networks.'}},
 {id:'f2',domain:'fund',title:'How Data Travels: OSI & TCP/IP',mins:18,body:`<p>Networking becomes easier when you stop seeing “the network” as one giant thing. Models split communication into jobs.</p><h3>A beginner-friendly mental model</h3><ol><li><b>Application:</b> what the user wants — web, email, DNS.</li><li><b>Transport:</b> conversation handling — TCP or UDP.</li><li><b>Internet/Network:</b> IP addressing and routing.</li><li><b>Link:</b> Ethernet/Wi-Fi delivery on the local network.</li><li><b>Physical:</b> bits as electrical, optical or radio signals.</li></ol><div class="analogy"><b>Encapsulation</b> is like putting a letter in an envelope, then a courier bag, then a delivery vehicle. Each layer adds information needed for its job.</div><h3>PDU names worth learning</h3><p>Application data → TCP <b>segment</b> / UDP datagram → IP <b>packet</b> → Ethernet <b>frame</b> → <b>bits</b>.</p>`,q:{q:'At which OSI layer does IP routing occur?',opts:['Layer 1','Layer 2','Layer 3','Layer 7'],a:2,e:'IP belongs to the Network layer, Layer 3.'}},
 {id:'f3',domain:'fund',title:'Ethernet, MAC Addresses & Switching',mins:22,lab:'l1',body:`<p>A switch learns where devices are by reading source MAC addresses. It builds a <b>MAC address table</b>, then forwards known unicast frames only toward the correct port.</p><h3>What a switch does with a frame</h3><ul><li>Learn the <b>source MAC</b> on the incoming port.</li><li>Look up the <b>destination MAC</b>.</li><li>If known, forward out one port.</li><li>If unknown, flood within the VLAN except the incoming port.</li></ul><div class="concept-box"><b>Important:</b> a MAC address is Layer 2; an IPv4/IPv6 address is Layer 3. ARP helps an IPv4 host discover the MAC address associated with a local IPv4 address.</div>`,q:{q:'A switch receives a frame for a destination MAC it has not learned. What does it normally do?',opts:['Drops it immediately','Sends it to the default gateway only','Floods it within the VLAN','Converts it to a broadcast IP packet'],a:2,e:'Unknown unicast frames are flooded in the local VLAN, except back out the receiving port.'}},
 {id:'f4',domain:'fund',title:'IPv4 Addressing Without the Pain',mins:28,body:`<p>An IPv4 address is 32 bits. Humans write it as four decimal octets, such as <code>192.168.10.25</code>. A prefix such as <code>/24</code> says how many left-most bits describe the network.</p><div class="analogy"><b>Street analogy:</b> the network portion is the street name; the host portion is the house number. Routers care about getting you to the right street.</div><h3>Three private IPv4 ranges</h3><p><code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, and <code>192.168.0.0/16</code>. These are not routed globally on the public Internet.</p><h3>For a /24</h3><p><code>192.168.10.0</code> is the network, usable hosts are normally <code>.1</code> through <code>.254</code>, and <code>.255</code> is the broadcast address.</p>`,q:{q:'Which address is private IPv4 space?',opts:['8.8.8.8','172.20.5.10','200.1.1.1','1.1.1.1'],a:1,e:'172.16.0.0 through 172.31.255.255 is private space.'}},
 {id:'f5',domain:'fund',title:'Subnetting: Learn the Pattern',mins:35,body:`<p>Subnetting means borrowing host bits to create more, smaller networks. Do not begin by memorizing every mask. Learn the pattern.</p><div class="concept-box"><b>Useful /24 ladder:</b> /25 = 128 addresses, /26 = 64, /27 = 32, /28 = 16, /29 = 8, /30 = 4. Traditional usable-host count is total addresses minus 2.</div><h3>Example: 192.168.1.0/26</h3><p>Block size is 64. Subnets start at .0, .64, .128, .192. The first subnet spans .0–.63; network=.0, broadcast=.63, traditional usable hosts=.1–.62.</p><div class="warning">CCNA success requires doing subnetting repeatedly, not just recognizing answers. Use paper until the pattern is automatic.</div>`,q:{q:'How many total IPv4 addresses are in a /27 block?',opts:['16','32','64','128'],a:1,e:'A /27 leaves 5 host bits: 2^5 = 32 total addresses.'}},
 {id:'f6',domain:'fund',title:'TCP, UDP & Common Applications',mins:18,body:`<p>TCP is connection-oriented and provides sequencing, acknowledgements and retransmission. UDP has lower overhead and does not provide those reliability mechanisms itself.</p><h3>Common examples</h3><p>HTTP/HTTPS usually use TCP; SSH uses TCP; DNS commonly uses UDP for ordinary queries but can use TCP; DHCP uses UDP. Real-time applications often favor UDP because waiting for retransmissions can be worse than losing a small amount of data.</p>`,q:{q:'Which transport protocol provides acknowledgements and retransmission?',opts:['IP','TCP','UDP','ARP'],a:1,e:'TCP provides reliable, ordered transport mechanisms.'}},
 {id:'f7',domain:'fund',title:'IPv6 Essentials',mins:22,body:`<p>IPv6 uses 128-bit addresses written in hexadecimal. It dramatically expands address space and changes several behaviors you learned in IPv4.</p><h3>Know these types</h3><ul><li><b>Global unicast:</b> globally routable.</li><li><b>Link-local:</b> begins with FE80::/10 and works on the local link.</li><li><b>Multicast:</b> one-to-many group delivery.</li><li><b>Anycast:</b> same address on multiple nodes; routing reaches a nearest instance.</li></ul><p>IPv6 does not use broadcast the way IPv4 does.</p>`,q:{q:'Which prefix identifies IPv6 link-local addresses?',opts:['2000::/3','FE80::/10','FF00::/8','FC00::/7'],a:1,e:'IPv6 link-local addresses use FE80::/10.'}},
 {id:'a1',domain:'access',title:'Cisco IOS & Your First Switch',mins:22,lab:'l1',body:`<p>Cisco IOS uses modes. You begin in user EXEC (<code>&gt;</code>), enter privileged EXEC with <code>enable</code>, then global configuration with <code>configure terminal</code>.</p><h3>Your first safe sequence</h3><p><code>enable</code> → <code>configure terminal</code> → <code>hostname SW1</code> → <code>end</code> → <code>show running-config</code>.</p><div class="analogy">CLI modes are like rooms in a workshop. Some tools are only available in certain rooms. The prompt tells you where you are.</div>`,q:{q:'Which command enters privileged EXEC mode from user EXEC?',opts:['configure terminal','enable','login','show run'],a:1,e:'enable changes the prompt from > to #.'}},
 {id:'a2',domain:'access',title:'VLANs: One Switch, Multiple LANs',mins:26,lab:'l2',body:`<p>A VLAN creates a separate Layer 2 broadcast domain. Devices in different VLANs need Layer 3 routing to communicate.</p><h3>Access vs trunk</h3><p>An <b>access port</b> normally carries one data VLAN. A <b>trunk</b> carries traffic for multiple VLANs using IEEE 802.1Q tagging.</p><div class="concept-box">Common verification: <code>show vlan brief</code> and <code>show interfaces trunk</code>.</div>`,q:{q:'What is the main purpose of an 802.1Q trunk?',opts:['Encrypt switch traffic','Carry multiple VLANs over one link','Assign IP addresses','Prevent all loops'],a:1,e:'802.1Q tags frames so multiple VLANs can cross one physical link.'}},
 {id:'a3',domain:'access',title:'STP: Stopping Switching Loops',mins:25,body:`<p>Redundant Layer 2 links are useful, but Ethernet frames have no TTL. A loop can create broadcast storms and MAC table instability. Spanning Tree Protocol creates a loop-free logical topology.</p><h3>Core idea</h3><p>STP elects a <b>root bridge</b>, calculates best paths toward it, and places redundant ports into non-forwarding roles/states so the topology has no active loop.</p>`,q:{q:'Why is STP needed in a redundant switched network?',opts:['To assign VLAN IDs','To prevent Layer 2 loops','To encrypt trunks','To advertise IP routes'],a:1,e:'STP prevents Layer 2 forwarding loops while allowing physical redundancy.'}},
 {id:'a4',domain:'access',title:'EtherChannel: More Bandwidth, One Logical Link',mins:18,body:`<p>EtherChannel bundles compatible physical Ethernet links into one logical port-channel. STP sees the bundle as a single logical connection.</p><p>LACP is the standards-based negotiation protocol. Member interfaces need compatible settings such as speed, duplex, access/trunk mode, and VLAN parameters.</p>`,q:{q:'Which standards-based protocol negotiates EtherChannel?',opts:['OSPF','LACP','HSRP','DTP'],a:1,e:'LACP is the standards-based EtherChannel negotiation protocol.'}},
 {id:'r1',domain:'routing',title:'Routing: How a Router Thinks',mins:25,lab:'l3',body:`<p>A router checks the destination IP address against its routing table and chooses the most specific matching route — the <b>longest prefix match</b>.</p><h3>Route sources</h3><ul><li>Connected routes come from active configured interfaces.</li><li>Static routes are manually configured.</li><li>Dynamic routing protocols such as OSPF learn routes automatically.</li></ul><p>A default route <code>0.0.0.0/0</code> is the catch-all when no more-specific route matches.</p>`,q:{q:'A router has 10.0.0.0/8 and 10.1.2.0/24. Which route matches destination 10.1.2.55?',opts:['10.0.0.0/8','10.1.2.0/24','Both equally','Neither'],a:1,e:'The /24 is more specific, so longest-prefix match chooses it.'}},
 {id:'r2',domain:'routing',title:'Static & Default Routes',mins:25,lab:'l3',body:`<p>A common IPv4 static route format is <code>ip route NETWORK MASK NEXT-HOP</code>. A default route is <code>ip route 0.0.0.0 0.0.0.0 NEXT-HOP</code>.</p><div class="warning">A configured static route is not automatically a good route. Always verify reachability, next-hop correctness, and the routing table.</div>`,q:{q:'What does 0.0.0.0/0 represent?',opts:['Loopback','Default route','Broadcast route','Host route'],a:1,e:'0.0.0.0/0 matches any IPv4 destination not matched by a more-specific route.'}},
 {id:'r3',domain:'routing',title:'OSPF: Dynamic Routing for Real Networks',mins:32,lab:'l4',body:`<p>OSPF is a link-state interior gateway protocol. Routers form neighbor relationships, exchange topology information, and calculate shortest paths using cost.</p><h3>CCNA focus</h3><p>Understand neighbor requirements, router ID, single-area OSPF, designated router concepts on multiaccess networks, and verification with commands such as <code>show ip ospf neighbor</code> and <code>show ip route ospf</code>.</p>`,q:{q:'What type of routing protocol is OSPF?',opts:['Distance-vector only','Link-state','Exterior gateway','Layer 2 discovery'],a:1,e:'OSPF is a link-state IGP.'}},
 {id:'s1',domain:'services',title:'DHCP, DNS & NTP',mins:24,body:`<p>Three services solve very different problems. <b>DHCP</b> leases IP configuration, <b>DNS</b> resolves names to addresses, and <b>NTP</b> synchronizes clocks.</p><h3>DHCP DORA</h3><p>Discover → Offer → Request → Acknowledge. A DHCP relay forwards client DHCP messages between subnets when the server is elsewhere.</p>`,q:{q:'Which service translates host names into IP addresses?',opts:['NTP','DNS','DHCP','SNMP'],a:1,e:'DNS performs name resolution.'}},
 {id:'s2',domain:'services',title:'NAT & PAT',mins:24,body:`<p>NAT translates IP addresses. PAT, often called NAT overload, lets many inside hosts share one or a small number of public IPv4 addresses by also tracking transport-layer port numbers.</p><p>Learn the inside-local / inside-global terminology, then practice reading translations instead of memorizing words in isolation.</p>`,q:{q:'What allows many private hosts to share one public IPv4 address?',opts:['STP','PAT','OSPF','CDP'],a:1,e:'PAT differentiates translations using Layer 4 port numbers.'}},
 {id:'s3',domain:'services',title:'SSH, Syslog, SNMP & QoS',mins:28,body:`<p>Operational networks need secure administration and visibility. SSH provides encrypted remote CLI access. Syslog carries event messages. SNMP supports monitoring/management. QoS influences how traffic is treated under congestion.</p><h3>QoS verbs</h3><p>Classification identifies traffic; marking labels it; queuing schedules it; policing can drop/remark excess traffic; shaping buffers excess traffic to smooth transmission.</p>`,q:{q:'Which protocol is preferred over Telnet for secure remote CLI access?',opts:['FTP','SSH','TFTP','SNMP'],a:1,e:'SSH encrypts the management session.'}},
 {id:'sec1',domain:'security',title:'Security Thinking: Threat, Vulnerability, Exploit',mins:20,body:`<p>A <b>threat</b> could cause harm. A <b>vulnerability</b> is a weakness. An <b>exploit</b> is a method of taking advantage of a weakness. A mitigation reduces likelihood or impact.</p><p>Good networking security is layered: physical security, secure management, least privilege, segmentation, filtering, endpoint controls, monitoring and user awareness.</p>`,q:{q:'A weakness that an attacker could take advantage of is a...',opts:['Vulnerability','Route','Trunk','Mitigation'],a:0,e:'A vulnerability is a weakness; an exploit uses it.'}},
 {id:'sec2',domain:'security',title:'ACLs: Traffic Rules on Routers',mins:30,lab:'l5',body:`<p>An IPv4 ACL is an ordered list of permit/deny statements. The router checks entries top-down and stops on the first match. There is an implicit deny at the end.</p><h3>Standard vs extended</h3><p>Standard ACLs primarily match source IPv4 address. Extended ACLs can match source, destination, protocol and Layer 4 ports.</p><div class="warning">A correct ACL placed in the wrong direction or on the wrong interface can break traffic. Configuration and placement are separate skills.</div>`,q:{q:'What happens if no ACL entry matches a packet?',opts:['It is permitted','It is denied by the implicit deny','It is sent to the CPU','It is broadcast'],a:1,e:'Every ACL has an implicit deny at the end.'}},
 {id:'sec3',domain:'security',title:'Layer 2 Security & Device Hardening',mins:28,body:`<p>Port security can restrict which MAC addresses use a switchport. DHCP snooping helps distinguish trusted DHCP server-facing ports from untrusted access ports. Dynamic ARP Inspection can validate ARP information using trusted bindings.</p><p>For device hardening, use secure passwords/secrets, SSH rather than Telnet, appropriate privilege, disabled unused services/ports, banners/policies where required, and authenticated management.</p>`,q:{q:'Which feature can restrict allowed MAC addresses on a switch access port?',opts:['Port security','OSPF','NAT','NTP'],a:0,e:'Port security controls MAC address use on switchports.'}},
 {id:'auto1',domain:'auto',title:'Why Networks Are Becoming Programmable',mins:22,body:`<p>Traditional CLI configuration is still essential, but automation improves repeatability and scale. Controller-based networking centralizes parts of control and policy while devices continue forwarding traffic.</p><h3>Planes</h3><p>The <b>data plane</b> forwards traffic. The <b>control plane</b> builds forwarding knowledge. The <b>management plane</b> is how operators and systems configure/observe devices.</p>`,q:{q:'Which plane actually forwards user traffic?',opts:['Data plane','Control plane','Management plane','Application plane'],a:0,e:'The data plane performs forwarding.'}},
 {id:'auto2',domain:'auto',title:'REST APIs & JSON for Networkers',mins:25,body:`<p>An API lets software interact with another system in a defined way. REST-style APIs commonly use HTTP methods: GET to retrieve, POST to create/action, PUT/PATCH to update, and DELETE to remove.</p><h3>JSON</h3><p>JSON represents structured data using objects, arrays, keys and values. Example: <code>{"hostname":"R1","enabled":true}</code>.</p>`,q:{q:'Which HTTP method is commonly used to retrieve a resource?',opts:['GET','DELETE','PATCH','POST'],a:0,e:'GET is commonly used to retrieve/read a resource.'}}
];

const labs={
 l1:{title:'Lab 1 — Your First Cisco Switch',device:'SW1',goals:['Enter privileged EXEC mode','Enter global configuration mode','Set hostname to SW1','Exit to privileged mode','Run show running-config'],hints:['enable','configure terminal','hostname SW1','end','show running-config']},
 l2:{title:'Lab 2 — Build Two VLANs',device:'SW1',goals:['Enter global configuration','Create VLAN 10','Name VLAN 10 USERS','Create VLAN 20','Name VLAN 20 VOICE','Verify with show vlan brief'],hints:['conf t','vlan 10','name USERS','vlan 20','name VOICE','end then show vlan brief']},
 l3:{title:'Lab 3 — Configure a Static Route',device:'R1',goals:['Enter global configuration','Configure 10.20.0.0/16 via 192.168.1.2','Exit configuration','Verify the route table'],hints:['conf t','ip route 10.20.0.0 255.255.0.0 192.168.1.2','end','show ip route']},
 l4:{title:'Lab 4 — Single-Area OSPF',device:'R1',goals:['Enter global configuration','Start OSPF process 1','Set router-id to 1.1.1.1','Advertise 10.0.0.0/24 in area 0','Verify OSPF'],hints:['conf t','router ospf 1','router-id 1.1.1.1','network 10.0.0.0 0.0.0.255 area 0','end then show ip ospf']},
 l5:{title:'Lab 5 — Standard ACL',device:'R1',goals:['Enter global configuration','Create standard ACL 10 permitting 192.168.10.0/24','Exit configuration','Verify ACL'],hints:['conf t','access-list 10 permit 192.168.10.0 0.0.0.255','end','show access-lists']}
};


  // The original v1.0.0 sequence exposed Lab 1 before IOS modes were taught.
  // Insert a zero-assumption CLI lesson immediately after the first two foundations lessons.
  if (!lessons.some(l => l.id === 'cli0')) {
    const cliLesson = {
      id: 'cli0',
      domain: 'fund',
      title: 'Before Your First Lab: Cisco CLI Basics',
      mins: 20,
      lab: 'l1',
      body: `
        <p><b>This lesson assumes you have never touched a Cisco command line.</b> Before configuring anything, you need to understand what the prompt is telling you and why a command works in one place but not another.</p>

        <h3>What is the CLI?</h3>
        <p><b>CLI</b> means <b>Command-Line Interface</b>. Instead of clicking buttons, you type commands into a Cisco switch or router. Cisco IOS organizes those commands into <b>modes</b>. A mode is simply a level of access with a particular job.</p>
        <div class="analogy"><b>Think of modes like rooms in a building.</b> The lobby lets you look around. The staff room gives you more tools. The workshop is where you are allowed to change things. The symbol at the end of the prompt tells you which room you are in.</div>

        <h3>The three modes you need for Lab 1</h3>
        <div class="concept-box">
          <p><code>Switch&gt;</code> — <b>User EXEC mode.</b> This is the starting point. Access is limited. The <code>&gt;</code> is your clue.</p>
          <p><code>Switch#</code> — <b>Privileged EXEC mode.</b> You can run powerful verification and administration commands. The <code>#</code> is your clue.</p>
          <p><code>Switch(config)#</code> — <b>Global configuration mode.</b> This is where you change the device's running configuration. The <code>(config)#</code> is your clue.</p>
        </div>
        <p><b>EXEC</b> is Cisco's name for command modes used to operate and inspect the device. You do not need to memorize that definition perfectly yet; you do need to recognize the prompts.</p>

        <h3>Walk through the exact sequence</h3>
        <p>When the lab opens, imagine the switch has just presented this prompt:</p>
        <p><code>Switch&gt;</code></p>
        <p>1. Type <code>enable</code>. This moves you from user EXEC to privileged EXEC:</p>
        <p><code>Switch&gt; enable</code><br><code>Switch#</code></p>
        <p>2. Type <code>configure terminal</code>. This means “I want to change the active configuration”:</p>
        <p><code>Switch# configure terminal</code><br><code>Switch(config)#</code></p>
        <p>3. Type <code>hostname SW1</code>. A hostname is the device's human-friendly name. Notice that the prompt changes because the device is now named SW1:</p>
        <p><code>Switch(config)# hostname SW1</code><br><code>SW1(config)#</code></p>
        <p>4. Type <code>end</code>. This leaves configuration mode and returns directly to privileged EXEC:</p>
        <p><code>SW1(config)# end</code><br><code>SW1#</code></p>
        <p>5. Type <code>show running-config</code>. <b>Show</b> commands inspect the device. The <b>running configuration</b> is the configuration currently active in memory.</p>

        <div class="warning"><b>Do not memorize five mystery commands.</b> Read the prompt after every command. Ask yourself: “What mode am I in now, and am I inspecting the device or changing it?” That habit is far more useful than blindly copying syntax.</div>

        <h3>One important distinction for later</h3>
        <p><code>show running-config</code> displays the configuration currently being used. Cisco devices also have a <b>startup configuration</b>, which is the saved configuration used after a reboot. We will teach saving configurations separately; Lab 1 only asks you to inspect what is running now.</p>

        <h3>What success looks like</h3>
        <p>Before opening Lab 1, you should be able to look at <code>&gt;</code>, <code>#</code>, and <code>(config)#</code> and say what each means. You do <b>not</b> need to know every Cisco command.</p>
      `,
      q: {
        q: 'You see the prompt Switch(config)#. What does that tell you?',
        opts: [
          'You are in user EXEC mode',
          'You are in privileged EXEC mode',
          'You are in global configuration mode and can change the device configuration',
          'The switch has lost its configuration'
        ],
        a: 2,
        e: 'The (config)# prompt means global configuration mode. This is where device-wide configuration changes are made.'
      }
    };

    const insertAfter = lessons.findIndex(l => l.id === 'f2');
    lessons.splice(insertAfter + 1, 0, cliLesson);
  }

  // Ethernet theory should not launch an IOS configuration lab before CLI training.
  const ethernetLesson = lessons.find(l => l.id === 'f3');
  if (ethernetLesson) ethernetLesson.lab = null;

  // Avoid presenting the same first lab twice later in the switching section.
  const oldIosLesson = lessons.find(l => l.id === 'a1');
  if (oldIosLesson) {
    oldIosLesson.lab = null;
    oldIosLesson.title = 'Cisco IOS: Reinforce the CLI Fundamentals';
    oldIosLesson.body = `<p>Earlier, you learned the three Cisco IOS modes used in your first lab. Now reinforce the model before moving into VLAN configuration.</p>
      <h3>Read the prompt before the command</h3>
      <p><code>&gt;</code> means user EXEC, <code>#</code> means privileged EXEC, and <code>(config)#</code> means global configuration mode. Commands are mode-sensitive: a valid command entered in the wrong mode can still fail.</p>
      <h3>Navigation you should now recognize</h3>
      <p><code>enable</code> → privileged EXEC. <code>configure terminal</code> → global configuration. <code>end</code> → privileged EXEC. <code>exit</code> normally moves back one level.</p>
      <div class="concept-box"><b>Troubleshooting habit:</b> when IOS rejects a command, check the current prompt before assuming the command itself is wrong.</div>`;
  }

  // Make the first lab visibly demonstrate the hostname change.
  labs.l1.device = 'Switch';
  labs.l1.title = 'Lab 1 — Your First Guided Cisco CLI Session';

  // Each lab now declares the lesson that must be learned first.
  const prerequisites = {
    l1: 'cli0',
    l2: 'a2',
    l3: 'r2',
    l4: 'r3',
    l5: 'sec2'
  };
  Object.entries(prerequisites).forEach(([labId, lessonId]) => {
    labs[labId].prereq = lessonId;
  });

  // The routing overview comes before the static-route configuration prerequisite.
  lessons.find(l => l.id === 'r1').lab = null;

const quizBank=lessons.map(l=>({...l.q,id:l.id+":q1",lessonId:l.id,lesson:l.title,domain:l.domain}));
