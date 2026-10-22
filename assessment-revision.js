// v1.5.1 revised draft options. Legacy IDs stay immutable for saved attempts.
// Independent technical review and learner validation remain pending.
const revisedOptions = {
  "A01": [
    "Cabling and interface error counters",
    "DNS caches and authoritative records",
    "Route preferences and next-hop reachability"
  ],
  "A02": [
    "Deliver directly on the local subnet",
    "Forward through the configured default router",
    "Send to the directed broadcast of that subnet"
  ],
  "A03": [
    "No IPv6 works",
    "Local traffic may work; remote routing is unproven",
    "Successful link-local traffic establishes global reachability"
  ],
  "A04": [
    "Channel overlap and shared airtime",
    "DHCP lease renewal",
    "Default-route preference"
  ],
  "A05": [
    "Relay configuration and reachability",
    "DNS forwarding and authoritative records for the affected clients",
    "Unaffected leases"
  ],
  "A06": [
    "Allow VLAN 30 on the trunk",
    "Make VLAN 30 native so it bypasses the allowed list",
    "Enable inter-VLAN routing"
  ],
  "A07": [
    "Voice and data VLAN assignments",
    "The interface power budget and negotiated wattage",
    "The default route and its preferred next hop"
  ],
  "A08": [
    "Verify the neighbor, then reconcile the diagram",
    "Treat the maintained diagram as authoritative and rename the neighbor",
    "Move the cable first"
  ],
  "A09": [
    "Check the service listener",
    "Repair DNS name resolution",
    "Replace the default gateway"
  ],
  "A10": [
    "BPDU receipt activated edge-port protection",
    "Root election automatically disabled every non-root port",
    "MAC aging removed the port from the forwarding topology"
  ],
  "A11": [
    "A",
    "B",
    "C"
  ],
  "A12": [
    "Repair the return route and retest",
    "Increase the forward TTL to give the response more hops",
    "Clear the DNS cache"
  ],
  "A13": [
    "Shared-link area mismatch",
    "Local process-number mismatch",
    "Different router IDs"
  ],
  "A14": [
    "The shared virtual IP 192.0.2.1",
    "The physical address of the current active router",
    "The physical address of the current standby router"
  ],
  "A15": [
    "Accounting",
    "Authorization",
    "Authentication"
  ],
  "A16": [
    "A translation exists for that flow",
    "Application login succeeded",
    "Return traffic is permitted"
  ],
  "A17": [
    "IPv4 from A; no IPv6 from AAAA",
    "An IPv6 result synthesized from the existing IPv4 A record",
    "A DHCP lease"
  ],
  "A18": [
    "The first matching deny stops processing",
    "The more specific destination-port permit overrides the broader deny",
    "The last match wins"
  ],
  "A19": [
    "Analyze sanitized outputs; list hypotheses and read-only tests",
    "Provide a repair from the symptom alone",
    "Infer the missing state and select one cause"
  ],
  "A20": [
    "Severity 3 error",
    "Severity 6 informational",
    "Severity 7 debugging"
  ],
  "B01": [
    "VMs have guest OSs; containers commonly share a kernel",
    "Both need separate guest kernels",
    "Both share the host kernel"
  ],
  "B02": [
    "The gateway is outside the local /26",
    "The gateway is reserved as this subnet’s broadcast",
    "The host address is reserved as this subnet’s network"
  ],
  "B03": [
    "Insert FF:FE; invert U/L",
    "Append FF:FE; retain U/L",
    "Insert FE:FF; invert multicast"
  ],
  "B04": [
    "Inspect the traffic-carrying interface",
    "Use the VPN adapter’s mask to interpret the wired adapter’s network",
    "Reset first"
  ],
  "B05": [
    "AP/client security compatibility",
    "Wireless DHCP pool capacity",
    "Remote application routing"
  ],
  "B06": [
    "Align members and verify the bundle",
    "Match only the channel-group number because both links have carrier",
    "Force passive/passive"
  ],
  "B07": [
    "Reconcile access VLAN and host address plan",
    "Keep the old address and change only the DNS server",
    "Keep the old subnet and use the new gateway regardless of mask"
  ],
  "B08": [
    "Validated device, ports and timestamp",
    "The diagram’s expected port pair without the observed physical mapping",
    "Hostname only"
  ],
  "B09": [
    "Peer link, VLAN and address",
    "Default gateway route",
    "Authoritative DNS record"
  ],
  "B10": [
    "It may be normal loop prevention",
    "It establishes a physical failure on that alternate cable",
    "The root is unreachable"
  ],
  "B11": [
    "/0",
    "/24",
    "/32"
  ],
  "B12": [
    "After primary removal, if valid",
    "When the backup’s larger distance takes priority over the primary source",
    "When next-hop IP is lower"
  ],
  "B13": [
    "Unique IDs and neighbor verification",
    "Identical adjacent IDs",
    "IDs matching process numbers"
  ],
  "B14": [
    "Verify routing, return traffic and the application",
    "Check former-master power only",
    "Check election priority only"
  ],
  "B15": [
    "SCP/SFTP with endpoint and file verification",
    "FTP across the untrusted path",
    "TFTP across the untrusted path"
  ],
  "B16": [
    "Wraps the original packet in a new outer packet",
    "Retains the original outer header",
    "Translates source addresses"
  ],
  "B17": [
    "Check the approved server-facing trusted path",
    "Trust every client-facing port to permit more replies",
    "Remove snooping only from the client ports permanently"
  ],
  "B18": [
    "No; use an extended ACL for those fields",
    "Yes; add ports to the standard list",
    "Yes; apply it in both directions"
  ],
  "B19": [
    "Correlate polls, notifications and logs",
    "Treat successful polls on either side as continuous availability evidence",
    "Discard the log"
  ],
  "B20": [
    "Validate scope and read-only output on a small set",
    "Run the full inventory after a syntax check",
    "Check authentication without checking outputs"
  ],
  "C01": [
    "Duplex mismatch",
    "Native VLAN mismatch",
    "Incorrect IP subnet mask",
    "Missing default route"
  ],
  "C02": [
    "Check supported transceivers and optical conditions",
    "Replace the subnet mask before checking the optical link",
    "Increase route preference before comparing transceiver types"
  ],
  "C03": [
    "The cable-path change supports the observed improvement",
    "The application must be healthy",
    "The cumulative counter must reset",
    "All intermittent faults are excluded"
  ],
  "C04": [
    "The virtual switches have no connected path",
    "The shared host joins their networks",
    "The guests need identical addresses",
    "The physical NIC needs both guest MACs"
  ],
  "C05": [
    "Containers commonly share a kernel; VMs have guest OSs",
    "Containers have guest OSs; VMs share a kernel",
    "Both require separate guest kernels",
    "Both require separate physical NICs"
  ],
  "C06": [
    "/25",
    "/26",
    "/27",
    "/28"
  ],
  "C07": [
    "10.12.5.159",
    "10.12.5.191",
    "10.12.5.192",
    "10.12.5.255"
  ],
  "C08": [
    "192.168.1.63 and 192.168.1.64",
    "192.168.1.100 and 192.168.1.130",
    "192.168.1.130 and 192.168.1.190",
    "192.168.1.190 and 192.168.1.193"
  ],
  "C09": [
    "2001:db8::1",
    "2001::db8::1",
    "2001:db8:::1",
    "2001:db8:1::"
  ],
  "C10": [
    "Check global addressing and a usable default route",
    "Clear local neighbor entries",
    "Use the remote server address locally",
    "Remove the global address"
  ],
  "C11": [
    "Specify the outgoing interface",
    "Increase the next hop’s prefix length",
    "Use the local OSPF process number",
    "Change the route’s administrative distance"
  ],
  "C12": [
    "Evaluate coordinated, non-overlapping radio channels",
    "Lengthen DHCP leases",
    "Change the DNS resolver",
    "Add a more-specific IP route"
  ],
  "C13": [
    "Investigate the selected VPN route",
    "Investigate DHCP pool capacity before inspecting routes",
    "Investigate the DNS suffix before testing destination routing",
    "Investigate the local cable despite successful gateway traffic"
  ],
  "C14": [
    "Create or correct the matching client-subnet pool",
    "Assign addresses from the transit subnet to remote clients",
    "Move the relay to the server-facing transit interface only",
    "Disable relay because the server responds to other clients"
  ],
  "C15": [
    "Investigate exhaustion and the allocation plan",
    "Increase the OSPF hello interval before checking leases",
    "Remove the DNS option while retaining the exhausted pool",
    "Change the trunk’s native VLAN before checking addresses"
  ],
  "C16": [
    "Neither peer initiates negotiation",
    "The channel group numbers must agree for passive negotiation to begin",
    "Both force a static bundle",
    "Member IPs are absent"
  ],
  "C17": [
    "A single flow can hash to one member",
    "Every flow must stripe evenly",
    "Unused members prove failure",
    "Every member duplicates frames"
  ],
  "C18": [
    "No active VLAN forwarding port meets autostate",
    "The address must be public",
    "An OSPF neighbor is required",
    "A DNS entry is required"
  ],
  "C19": [
    "Enable IP routing",
    "Make both access VLANs the same",
    "Place both SVI addresses in one subnet",
    "Enable PortFast on the inter-switch uplink"
  ],
  "C20": [
    "Native VLAN mismatch",
    "Allowed VLAN list mismatch only",
    "LACP negotiation-mode mismatch",
    "Spanning-tree root priority mismatch"
  ],
  "C21": [
    "A trunk carrying the required VLANs",
    "Management-VLAN access port",
    "First-client-VLAN access port",
    "An unencapsulated routed port"
  ],
  "C22": [
    "PoE capability and available power",
    "DHCP pool capacity and available leases",
    "DNS server reachability and records",
    "Voice VLAN tagging and gateway routing"
  ],
  "C23": [
    "VLAN tagging and permitted VLANs",
    "Guest IPs and physical-host IP",
    "Single untagged access VLAN",
    "Disabled guest virtual switching"
  ],
  "C24": [
    "Neighbor presence is unknown from this result",
    "The cable is disconnected",
    "The peer is shut down",
    "The peer lacks a management IP"
  ],
  "C25": [
    "Verify the attachment and reconcile the mapping",
    "Clear the MAC table and assume the diagram is correct",
    "Change the host gateway to match the documented port",
    "Move the access VLAN before checking the physical attachment"
  ],
  "C26": [
    "Check return routing or policy for the chosen source",
    "Assume all client traffic works because the ordinary ping did",
    "Replace DNS before investigating source-specific forwarding",
    "Change the destination mask before checking return routes"
  ],
  "C27": [
    "Lowest bridge priority",
    "Highest bridge priority",
    "Highest root path cost",
    "Lowest designated-port number"
  ],
  "C28": [
    "Error-disable the protected port",
    "Select an alternate root port",
    "Forward and change the root",
    "Automatically change the VLAN"
  ],
  "C29": [
    "Root guard",
    "BPDU filter",
    "PortFast",
    "Loop guard"
  ],
  "C30": [
    "Loop guard",
    "Root guard",
    "PortFast",
    "BPDU guard"
  ],
  "C31": [
    "A: /16, lower administrative distance",
    "B: /24, longer matching prefix",
    "A and B: equal-cost sharing",
    "Neither: conflicting route sources"
  ],
  "C32": [
    "Administrative distance",
    "Longest prefix length between these identical prefixes",
    "Lowest next-hop IP address",
    "Most recently configured route source"
  ],
  "C33": [
    "No matching route; discard under these assumptions",
    "Use the route with the longest prefix even though it differs",
    "Use the route with the lowest AD even though it differs",
    "Send to every next hop to discover a matching remote network"
  ],
  "C34": [
    "Check route installation and next-hop resolution",
    "Check configuration text only",
    "Raise administrative distance",
    "Change destination DNS records"
  ],
  "C35": [
    "The matching /32 host route",
    "The matching /0 default route",
    "The first configured route",
    "The lowest next-hop address"
  ],
  "C36": [
    "1",
    "90",
    "110",
    "120"
  ],
  "C37": [
    "Align the intended area on the shared link",
    "Use an identical OSPF process number on both routers",
    "Use an identical OSPF router ID on both routers",
    "Change the shared link’s DNS suffix on both routers"
  ],
  "C38": [
    "Neighbor formation is suppressed on that interface",
    "Ordinary IP forwarding is disabled",
    "All network advertisement stops",
    "The local process number changes"
  ],
  "C39": [
    "Normal for these broadcast-segment roles",
    "All neighbors must reach Full",
    "Both have an area mismatch",
    "Both have duplicate router IDs"
  ],
  "C40": [
    "A unique 32-bit router ID",
    "A public IPv4 data interface",
    "DHCPv4 on every interface",
    "A 128-bit IPv6 router ID"
  ],
  "C41": [
    "The HSRP virtual address",
    "R1’s physical address",
    "R2’s physical address only",
    "The transit subnet’s broadcast address"
  ],
  "C42": [
    "Only the first-hop role transferred",
    "All remote routes now work",
    "Old routes were copied",
    "All sessions stayed available"
  ],
  "C43": [
    "Authentication versus authorization",
    "Authorization versus accounting only",
    "Encryption versus encapsulation",
    "Address assignment versus name resolution"
  ],
  "C44": [
    "Test recovery access and the AAA method list",
    "Remove local access after ping",
    "Deploy everywhere before login testing",
    "Equate login with configuration access"
  ],
  "C45": [
    "Verify file identity and published integrity value",
    "Trust encryption alone",
    "Trust the filename alone",
    "Trust server reachability"
  ],
  "C46": [
    "Reconcile the NAT selection ACL",
    "Change only the outside interface address",
    "Reverse the inside and outside roles",
    "Change only the default route’s administrative distance"
  ],
  "C47": [
    "Transport ports and translation context",
    "Only the outside address",
    "Only the clients’ DNS names",
    "Only the remote MAC address"
  ],
  "C48": [
    "Check the MX target and its address records",
    "Check only the unrelated web alias CNAME",
    "Check only the sender’s DHCP lease duration",
    "Check only the receiver’s local Ethernet address"
  ],
  "C49": [
    "PTR",
    "MX",
    "AAAA",
    "CNAME"
  ],
  "C52": [
    "Implicit final deny",
    "Default permit",
    "Alternate-interface bypass",
    "Return-port exception"
  ],
  "C53": [
    "Check static-host bindings or ARP policy",
    "Trust every access port",
    "Change the host DNS server",
    "Remove VLAN segmentation"
  ],
  "C54": [
    "Filter unauthorized router advertisements",
    "Filter only unauthorized DHCPv4 offers",
    "Translate IPv6 into the client IPv4 subnet",
    "Replace the IPv6 default route using DNS records"
  ],
  "C55": [
    "Bound actions and independently verify outcomes",
    "Trust a confident rationale",
    "Trust a successful tool call",
    "Let the model authorize changes"
  ],
  "C56": [
    "Check permitted use and sanitize evidence",
    "Label the prompt confidential",
    "Replace hostnames only",
    "Let the model decide disclosure"
  ],
  "C57": [
    "Infrastructure as code",
    "Untracked interactive configuration",
    "Periodic monitoring without desired state",
    "Automatic address allocation through DHCP"
  ],
  "C58": [
    "SNMP",
    "DHCP",
    "OSPF",
    "DNS"
  ],
  "C59": [
    "Inventory targets selected for the play",
    "Privilege used by each command",
    "Permitted VLANs on each device",
    "OSPF process selected per device"
  ],
  "C60": [
    "Severity level",
    "Facility identifier",
    "Interface instance",
    "Process identifier"
  ]
};
// Numerical/configuration questions retain their original evidence-sensitive choices
// unless explicitly reviewed above; no blind answer-index reassignment.
const revisedBank=assessmentBank.map(q=>{
 const key=q.id.split('-')[1],options=revisedOptions[key]||q.options;
 return {...q,id:'v150-'+key,form:'R',options:options.slice(),revisionOf:q.id};
});
assessmentBank.push(...revisedBank);
examDefinitions.R={count:100,minutes:120,name:'Revised full-session rehearsal'};
