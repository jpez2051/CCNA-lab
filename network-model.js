// Small, explicit IPv4 teaching model. No real packets or IOS emulation.
const NetworkModel = (() => {
  function ip(s) {
    const p=String(s).split('.');
    if(p.length!==4 || p.some(x=>!/^\d{1,3}$/.test(x)||Number(x)>255))throw Error('Enter four IPv4 octets from 0 to 255.');
    return p.reduce((n,x)=>n*256+Number(x),0);
  }
  function text(n){return [24,16,8,0].map(b=>Math.floor(n/2**b)%256).join('.');}
  function subnet(address,prefix){
    const n=ip(address),p=Number(prefix);
    if(!Number.isInteger(p)||p<0||p>32)throw Error('Prefix must be a whole number from 0 to 32.');
    const size=2**(32-p),network=Math.floor(n/size)*size,last=network+size-1;
    return {network:text(network),last:text(last),mask:text(2**32-size),size,
      first:text(p>=31?network:network+1),final:text(p>=31?last:last-1),hosts:p>=31?size:size-2,
      usage:p===31?'Two endpoints on a point-to-point link; no broadcast address.':p===32?'One address: a host route. No broadcast address.':'Conventional multiaccess subnet; first and last addresses are reserved.'};
  }
  function local(a,b,p){return subnet(a,p).network===subnet(b,p).network;}
  function route(destination,routes){
    ip(destination);
    return routes.filter(r=>local(destination,r.network,r.prefix)).sort((a,b)=>b.prefix-a.prefix||a.ad-b.ad||a.metric-b.metric)[0]||null;
  }
  function topology(seed=1){
    const n=10+(Math.abs(seed)%180),base='192.168.'+n+'.',remote='10.'+n+'.0.';
    return {client:base+'20',prefix:24,gateway:base+'1',dns:base+'53',peer:base+'80',server:remote+'50',
      router:base+'1',resolver:base+'53',clientLink:true,serverLink:true,returnRoute:true,service:true,record:true,arpCached:false};
  }
  function probe(s,kind){
    // Both endpoints use /24 in this isolated topology. Client prefix is the editable fault.
    if(kind==='config')return {ok:true,trace:['Client '+s.client+'/'+s.prefix,'Gateway '+s.gateway,'DNS '+s.dns],reason:'configuration'};
    if(!s.clientLink)return {ok:false,trace:['Client link is down. No frame can leave this interface.'],reason:'physical'};
    try {ip(s.client);ip(s.gateway);ip(s.dns);subnet(s.client,s.prefix);}catch(e){return {ok:false,trace:[e.message],reason:'configuration'};}
    const target=kind==='peer'?s.peer:kind==='gateway'?s.router:kind==='dns'?s.resolver:s.server;
    const trace=['Client interface is up.'];
    if((kind==='dns'||kind==='web')&&s.dns!==s.resolver)return {ok:false,trace:[...trace,'Configured resolver does not answer in this isolated lab.'],reason:'dns'};
    if((kind==='dns'||kind==='web')&&!s.record)return {ok:false,trace:[...trace,'Resolver replies: name not found.'],reason:'dns-record'};
    const direct=local(s.client,target,s.prefix);
    trace.push('Destination '+target+' is '+(direct?'local':'remote')+' according to the client mask.');
    if(direct&&!local(s.client,target,24))return {ok:false,trace:[...trace,'Client tries ARP for a destination beyond this physical LAN; no reply.'],reason:'mask'};
    if(!direct&&(s.gateway!==s.router||!local(s.client,s.gateway,s.prefix)))return {ok:false,trace:[...trace,'The configured next hop is not a reachable router on this link.'],reason:'gateway'};
    trace.push((s.arpCached?'Use cached MAC for ':'ARP obtains MAC for ')+(direct?target:s.gateway)+'.');
    trace.push('Switch forwards the Ethernet frame. Packet destination stays '+target+'.');
    if(!direct){
      trace.push('Router forwards to the server subnet using a new Ethernet frame.');
      if(!s.serverLink)return {ok:false,trace:[...trace,'Server link is down.'],reason:'physical-server'};
      if(!s.returnRoute)return {ok:false,trace:[...trace,'Forward delivery succeeds; the router has no route back to the client subnet.'],reason:'return-route'};
    }
    if(kind==='web'&&!s.service)return {ok:false,trace:[...trace,'TCP connection refused by the server; the web service is stopped.'],reason:'application'};
    trace.push(kind==='web'?'DNS, modeled TCP connection, and application response succeed.':kind==='dns'?'Name resolves to '+s.server+'.':'ICMP reply received; this alone does not test the application.');
    return {ok:true,trace,reason:'success'};
  }
  return {ip,text,subnet,local,route,topology,probe};
})();
