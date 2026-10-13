"""Set static search metadata for either GitHub Pages location, without publishing."""
from pathlib import Path
from urllib.parse import urlparse
import argparse,json,re,html

parser=argparse.ArgumentParser()
parser.add_argument('--url',default='https://chenshihfang.github.io/')
args=parser.parse_args()
base=args.url.rstrip('/')+'/'
parsed=urlparse(base)
if parsed.scheme!='https' or parsed.netloc!='chenshihfang.github.io' or parsed.path not in ['/', '/personal/'] or parsed.query or parsed.fragment:
 raise ValueError('Choose https://chenshihfang.github.io/ or https://chenshihfang.github.io/personal/')
root=Path(__file__).resolve().parent
person={
 '@type':'Person','@id':base+'#person','name':'Shih-Fang Chen',
 'alternateName':['Shih Fang Chen','chenshihfang'],
 'url':base,'image':base+'assets/portrait.webp',
 'jobTitle':'Computer Vision and Machine Learning Researcher and Engineer',
 'description':'Ph.D. in Computer Science, researching robust and adaptive visual perception, multimodal learning, spatial intelligence, and vision foundation models.',
 'alumniOf':[{'@type':'CollegeOrUniversity','name':n} for n in ['National Yang Ming Chiao Tung University','Yuan Ze University','Chaoyang University of Technology']],
 'knowsAbout':['Computer vision','Machine learning','Multimodal learning','Spatial intelligence','Video understanding','Vision foundation models','Self-supervised learning','Parameter-efficient fine-tuning','Test-time adaptation','Online model editing','Visual prompting','Object tracking','Point tracking','Industrial computer vision'],
 'sameAs':['https://www.linkedin.com/in/shihfangchen/','https://github.com/chenshihfang','https://scholar.google.com/citations?user=X8uMo8EAAAAJ','https://orcid.org/0000-0002-8438-400X','https://www.cake.me/resumes/shih-fang-chen']
}
pages=[
 ('index.html','', 'Shih-Fang Chen | Computer Vision & Machine Learning Researcher',
  'Shih-Fang Chen, Ph.D. Computer vision and machine learning research in multimodal learning, spatial intelligence, object tracking, and test-time adaptation. GOT-Edit, GOT-JEPA, and PiVOT.'),
 ('cv/index.html','cv/','CV | Shih-Fang Chen — Computer Vision & Machine Learning',
  'Shih-Fang Chen’s curriculum vitae: NYCU Ph.D., computer vision and multimodal learning research, ICLR 2026, IEEE TCSVT and TMM, industrial vision systems, and GPU infrastructure.')
]
for filename,suffix,title,description in pages:
 path=root/filename
 text=path.read_text(encoding='utf-8')
 text=re.sub(r'\s*<!-- BEGIN SEARCH METADATA -->.*?<!-- END SEARCH METADATA -->','',text,flags=re.S)
 text=re.sub(r'\s*<title>.*?</title>','',text,flags=re.S)
 text=re.sub(r'\s*<meta (?:name="description"|property="og:[^"]*")[^>]*>','',text)
 profile={'@context':'https://schema.org','@type':'ProfilePage','url':base+suffix,'name':title,'description':description,'mainEntity':person}
 site_metadata=''
 if not suffix and parsed.path=='/':
  website={'@context':'https://schema.org','@type':'WebSite','@id':base+'#website','name':'Shih-Fang Chen','alternateName':['Shih Fang Chen','chenshihfang'],'url':base}
  site_metadata='\n  <script type="application/ld+json">'+json.dumps(website,ensure_ascii=False,indent=2)+'</script>'
 esc=lambda value:html.escape(value,quote=True)
 metadata=f'''  <!-- BEGIN SEARCH METADATA -->
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="{base+suffix}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="Shih-Fang Chen">
  <meta property="og:url" content="{base+suffix}">
  <meta property="og:image" content="{base}assets/portrait.webp">
  <meta property="og:image:alt" content="Shih-Fang Chen">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(description)}">
  <meta name="twitter:image" content="{base}assets/portrait.webp">
  <script type="application/ld+json">{json.dumps(profile,ensure_ascii=False,indent=2)}</script>{site_metadata}
  <!-- END SEARCH METADATA -->'''
 text=text.replace('</head>',metadata+'\n</head>')
 path.write_text(text,encoding='utf-8')
(root/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+base+'sitemap.xml\n',encoding='utf-8')
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+base+suffix+'</loc></url>\n' for _,suffix,_,_ in pages)+'</urlset>\n',encoding='utf-8')
(root/'site-config.json').write_text(json.dumps({'url':base},indent=2)+'\n',encoding='utf-8')
print('Static metadata, canonical links, profile structured data, robots.txt, and sitemap updated for '+base)
