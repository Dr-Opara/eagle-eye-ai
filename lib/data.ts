export const nav = [
  ['Overview','/'],['Live Map','/live-map'],['Cyber Warfare','/cyber-warfare'],['Ransomware','/ransomware'],['Intelligence','/intelligence'],['Cameras','/cameras'],['My Environment','/my-environment'],['Support','/support'],['About','/about']
] as const

export const intel = [
  {time:'14:26',title:'New ransomware infrastructure observed across multiple regions',tag:'CAMPAIGN',sev:'critical'},
  {time:'14:24',title:'Fresh command-and-control indicators correlated to active intrusion set',tag:'IOC',sev:'high'},
  {time:'14:21',title:'Public advisory published for actively exploited remote-access flaw',tag:'ADVISORY',sev:'medium'},
  {time:'14:19',title:'Extortion-forum activity elevated against healthcare organizations',tag:'OSINT',sev:'high'},
  {time:'14:17',title:'Credential-phishing infrastructure rotating to new domains',tag:'PHISHING',sev:'medium'},
  {time:'14:11',title:'Multiple organizations report Play-style intrusion activity',tag:'INTEL',sev:'critical'}
]

export const hotspots = [
  {x:23,y:34,r:10,label:'N. AMERICA',count:12}, {x:49,y:30,r:13,label:'EUROPE',count:28},
  {x:72,y:38,r:16,label:'ASIA',count:41}, {x:34,y:67,r:8,label:'S. AMERICA',count:7},
  {x:50,y:59,r:8,label:'AFRICA',count:5}, {x:82,y:72,r:7,label:'AUSTRALIA',count:3}
]
