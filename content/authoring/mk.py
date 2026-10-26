# Authoring helpers for food guides (D-033). Not part of the build: the guide JSON files are the source of truth.
# Usage: write a batch script that does `from mk import *` and calls g(...); then run `npm run build:pack`,
# which checks every quote against the snapshots. See README.md.
import json, os
CONTENT=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
OUT=os.path.join(CONTENT,'produce','guides')
S=dict(H='us-ars-ah66-2016',F='dk-fvst-opbevar-maden-korrekt',T='dk-taenk-holdbarhed-og-opbevaring',B='dk-bolius-udendoers-opbevaring',L='dk-lf-okoportalen-lagring',M='msu-montguide-drying-vegetables',C='csu-drying-fruits',NS='nchfp-sun-drying',NH='nchfp-drying-herbs',NV='nchfp-vine-drying',P='psu-preserving-broccoli-cauliflower',GI='usda-canning-2015-intro',G1='usda-canning-2015-guide01',G2='usda-canning-2015-guide02',G3='usda-canning-2015-guide03',G4='usda-canning-2015-guide04',G6='usda-canning-2015-guide06',G7='usda-canning-2015-guide07',R='dk-retnemt-agurker')
def b(text,src,loc,quote,visual=False):
    ref={'sourceId':S.get(src,src),'locator':loc,'quote':quote}
    if visual: ref['visualOnly']=True
    return {'text':text,'sourceRef':ref}

# A recipe block (D-035): title, optional intro, facts (time / keeps / yield), ingredients, numbered steps.
def r(title,src,loc,quote,steps,ingredients=None,intro=None,time=None,keeps=None,yield_=None,visual=False):
    recipe={'title':title}
    if intro: recipe['intro']=intro
    facts={k:v for k,v in (('time',time),('keeps',keeps),('yield',yield_)) if v}
    if facts: recipe['facts']=facts
    if ingredients: recipe['ingredients']=ingredients
    recipe['steps']=steps
    block=b('',src,loc,quote,visual); del block['text']; block['recipe']=recipe
    return block
def g(fid,about=(),prefers=(),avoid=(),together=(),cool=(),drying=None,pickling=None,canning=None):
    secs=[]
    for key,val in (('about',about),('prefers',prefers),('avoid',avoid),('together',together),('coolStorage',cool)):
        if val: secs.append({'key':key,'blocks':list(val)})
    for key,val in (('drying',drying),('pickling',pickling),('canning',canning)):
        if val: secs.append({'key':key,'verdict':val[0],'blocks':list(val[1]) if len(val)>1 else []})
    doc={'id':f'foodkeeper-{fid}','translationChecked':False,'sections':secs}
    with open(f'{OUT}/foodkeeper-{fid}.json','w') as f:
        json.dump(doc,f,ensure_ascii=False,indent=1); f.write('\n')

# Shared blocks
FRUIT_SUN=b('Uden strøm kan frugt tørres udendørs i solen, fordi frugt indeholder meget sukker og syre. Det kræver varme, tørre dage med blæst, mindst 29 °C (85 °F) og helst en luftfugtighed under 60 %, og det tager flere dage. Dæk frugten til eller tag den i læ om natten, så den ikke trækker fugt igen.','NS','Sun Drying',
 'The high sugar and acid content of fruits make them safe to dry out-of-doors when conditions are favorable for drying. … To dry fruits out-of-doors hot, dry, breezy days are best. A minimum temperature of 85ºF is needed with higher temperatures being better. It takes several days to dry foods out-of-doors. … A humidity below 60 percent is best. … Fruits dried out-of-doors must be covered or brought under shelter at night. The cool night air condenses and could add moisture back to the food, thus slowing down the drying process.')
VEG_NOSUN=b('Uden strøm: Grøntsager bør ikke tørres udendørs. De indeholder lidt sukker og syre, og det øger risikoen for fordærv. Tør dem i stedet indendørs under kontrollerede forhold i ovn eller tørreapparat.','NS','Sun Drying',
 'Vegetables (with the exception of vine dried beans) and meats are not recommended for out-of-doors drying. Vegetables are low in sugar and acid. This increases the risks for food spoilage. … It is best to dry meats and vegetables indoors using controlled conditions of an oven or food dehydrator.')
FRUIT_DRY=b('Tør frugten i ét lag ved 60 °C (140 °F) i ovn eller tørreapparat. Vend store stykker hver 3.–4. time. Frugten er tør, når den er læderagtig og bøjelig: Klem en håndfuld afkølede stykker – der må ikke være fugt på hånden, og stykkerne skal springe fra hinanden.','C','Drying Methods; Testing for Dryness',
 'Arrange pretreated fruits on drying trays in single layers, pit cavity up. Dry at 140 degrees F (60°C) in an oven or dehydrator. … If possible, stir food and turn large pieces over every 3 to 4 hours during the drying period. … Dried fruits should be leathery and pliable. … Squeeze a handful of the fruit. If no moisture is left on the hand and pieces spring apart when released, they are dry.')
FRUIT_COND=b('Lad den tørrede frugt efterbehandle i 4–10 dage i en løst tildækket beholder, og ryst den dagligt. Kommer der fugtperler, skal den tørres mere. Opbevar den derefter tæt lukket, køligt, tørt og mørkt; den holder 6–12 måneder.','C','Post-Drying Treatment; Packaging and Storage',
 'Lightly cover and store in a warm, dry, well-ventilated place for four to 10 days. Stir or shake containers daily to separate pieces. If beads of moisture form inside, return food to drying trays for further drying, then repeat the conditioning step. … Store in a cool, dry, dark place or in the refrigerator or freezer. Properly stored, dried fruits keep well for six to 12 months.')
VEG_DRY=b('Tør grøntsagerne ved 60 °C (140 °F), til de er sprøde. I en almindelig ovn kan det tage op til dobbelt så lang tid som i et tørreapparat; hold ovnlågen 5–15 cm (2–6 tommer) på klem.','M','Methods of Drying; Oven Drying; Table 1, pp. 1–3',
 'The optimum temperature for drying food is 140°F. … For air circulation, leave the oven door propped open 2 to 6 inches. … Vegetables should be dried until they are brittle or “crisp.” … Drying times in a conventional oven could be up to twice as long, depending on air circulation.')
LOW_ACID=b('Alle friske grøntsager undtagen de fleste tomater er syrefattige (pH over 4,6), og sporerne af botulismebakterien er meget svære at dræbe ved kogepunktet. Syrefattige fødevarer skal derfor steriliseres ved 116–121 °C (240–250 °F) i en trykkoger.','G1','Food acidity and processing methods, p. 1-8',
 'Low-acid foods have pH values higher than 4.6. They include red meats, seafood, poultry, milk, and all fresh vegetables except for most tomatoes. … Botulinum spores are very hard to destroy at boiling-water temperatures; the higher the canner temperature, the more easily they are destroyed. Therefore, all low-acid foods should be sterilized at temperatures of 240° to 250°F, attainable with pressure canners operated at 10 to 15 PSIG.')

# Handbook 66: locator with printed page(s) found from the quote itself (printed page = PDF page - 10).
import re as _re, bisect as _bisect
def _load_pdf(sid):
    raw=open(os.path.join(CONTENT,'sources','text',f'{sid}.txt')).read().split('\n')[1:]
    text='';starts=[];pages=[];prev=''
    for i,l in enumerate(raw):
        m=_re.match(r'^--- p(\d+)$',l)
        if m: starts.append(len(text)); pages.append(int(m.group(1))); prev=l; continue
        if _re.match(r'^\d+$',l) and _re.match(r'^--- p\d+$',prev): prev=l; continue
        prev=l
        text+=l.replace('�',' ').replace('￼','')+'\n'
    # normalise while keeping offsets mapped
    out=[];mapi=[];sp=False
    for i,ch in enumerate(text):
        if ch.isspace() or ch in '​‌‍﻿':
            if ch in '​‌‍﻿': continue
            if not sp and out: out.append(' '); mapi.append(i); sp=True
            continue
        out.append(ch); mapi.append(i); sp=False
    return ''.join(out),mapi,starts,pages
_PDF={}
def _norm(s): return _re.sub(r'\s+',' ',_re.sub(r'\[[^\]]*\]',' ',s)).strip()
def pages_of(sid,quote):
    if sid not in _PDF: _PDF[sid]=_load_pdf(sid)
    t,mapi,starts,pages=_PDF[sid]; found=[]
    for part in quote.split(' … '):
        q=_norm(part); k=t.find(q)
        if k<0: raise ValueError(f'quote not in {sid}: {q[:80]}')
        for off in (mapi[k],mapi[k+len(q)-1]):
            found.append(pages[_bisect.bisect_right(starts,off)-1])
    return min(found),max(found)
def H(text,chapter,section,quote):
    a,z=pages_of(S['H'],quote); a-=10; z-=10
    return b(text,'H',f'{chapter} chapter, {section}, '+(f'p. {a}' if a==z else f'pp. {a}–{z}'),quote)

PRETREAT=b('Forbehandling mod mørkfarvning: Rør 34 g ren ascorbinsyre (C-vitamin) i 1 liter koldt vand, eller bland citronsaft og koldt vand i lige dele. Skær den skrællede frugt direkte ned i opløsningen, lad den ligge i 10 minutter, og lad den dryppe godt af.','C','Ascorbic Acid Pretreatment; Citric Acid or Lemon Juice Pretreatment',
 'Stir 2 1/2 tablespoons (34 grams) of pure ascorbic acid crystals into one quart (1000 milliliters) of cold water. … Cut peeled fruit directly into ascorbic acid solution. Soak for 10 minutes, remove with a slotted spoon, drain well, and dehydrate. … For the lemon juice solution, mix equal parts of lemon juice and cold water (i.e., 1 cup lemon juice and 1 cup water).')
STONE_BERRY=b('De færreste bær og stenfrugter holder længe rå. De bør syltes, tørres, fryses eller behandles på anden måde, hvis de skal holde i længere tid.','B','Bær- og stenfrugter',
 'De færreste bær- og stenfrugter holder særligt længe i deres rå form, men bør syltes, tørres, fryses eller på anden måde behandles eller opbevares, så de kan holde i længere tid.')
def N(text,slug,loc,quote): return b(text,'nchfp-'+slug,loc,quote)

BERRY_DRY=b('Bær: Vælg faste, modne bær, vask dem godt, og lad dem være hele eller halver dem. Bær med fast skind dyppes 30 sekunder i kogende vand, så skindet revner; bløde bær (jordbær) lægges 10 minutter i ascorbinsyre-opløsning. Lad dem dryppe godt af, og læg dem højst to lag dybt. Tør dem, til de er hårde og rasler, når bakken rystes (24–36 timer).','C','Table 2, Berries',
 'Berries Select firm ripe fruit. Wash well. Leave whole or cut in half. For berries with firm skins, dip in boiling water 30 seconds to crack skins. For berries with soft skins (strawberries), dip in ascorbic acid or other antimicrobial solution for 10 minutes. Remove and drain well. Place on drying trays not more than two berries deep. Dry until hard and berries rattle when shaken on trays (24-36 hours).')
BERRY_CAN=N('Hele bær (brombær, blåbær, ribs, solbær, stikkelsbær, hindbær m.fl. – kun de bær, opskriften nævner): Vælg modne, søde bær med ensartet farve. Vask dem, og fjern stilke; stikkelsbær klippes i begge ender. Blåbær, ribs og stikkelsbær kan forvarmes 30 sekunder i kogende vand og fyldes på glas med varm saft. Alle bærrene kan også fyldes rå på glas og overhældes med varm sukkerlage, saft eller vand. Lad 1,3 cm (½ tomme) være fri øverst.','berries-whole','Berries-Whole, procedure',
 'Blackberries, blueberries, currants, dewberries, gooseberries, huckleberries, loganberries, mulberries, raspberries. Use these directions only with the berries listed. … Quality: Choose ripe, sweet berries with uniform color. … Drain, cap, and stem if necessary. For gooseberries, snip off heads and tails with scissors. … Hot pack – For blueberries, currants, gooseberries, and huckleberries. Heat berries in boiling water for 30 seconds and drain. Fill jars and cover with hot juice, leaving ½-inch headspace. Raw pack – Fill jars with any of the raw berries, shaking down gently while filling. Cover with hot syrup, juice, or water, leaving ½-inch headspace.')
BERRY_TIME=N('Henkogningstid for hele bær i vandbad op til 300 m over havet: varm fyldning 15 minutter (pint- og quart-glas); rå fyldning 15 minutter for pint-glas (ca. 0,5 liter) og 20 minutter for quart-glas (ca. 1 liter).','berries-whole','Berries-Whole, Table 1',
 'Table 1. Recommended process time for Berries, whole in a boiling-water canner. … Hot Pints or Quarts 15 min 20 20 25 Raw Pints 15 20 20 25 Quarts 20')
BERRY_JAM=N('Bærsyltetøj uden pektin: ca. 2,1 liter (9 cups) knuste bær og 6 cups sukker koges, til det tykner, fyldes varmt på varme, steriliserede glas med 6 mm (¼ tomme) fri plads og henkoges 5 minutter i vandbad (op til 300 m over havet).','berry-jams-without-pectin','Berry Jams without Pectin',
 '9 cups crushed berries 6 cups sugar … Remove from heat and fill hot jam into hot, sterile jars, leaving ¼-inch headspace. … Hot Half-pints or Pints 5 min')

# How long canned (heat-processed) pickles and preserves keep, for every food with a canned recipe (D-034).
CANNED_KEEP=r('Sådan opbevarer du henkogte glas','nchfp-storing-home-canned-foods','Storing Home Canned Foods',
   'Label and date the jars and store them in a clean, cool, dark, dry place. For best quality, store between 50 and 70 °F. Also for best quality, can no more food than you will use within a year unless directions for a specific food provide other advice. Do not store jars above 95° F or near hot pipes, a range, a furnace, in an uninsulated attic, or in direct sunlight. Under these conditions, food will lose quality in a few weeks or months and may spoil.',
   keeps='Op til 1 år',
   steps=['Mærk glassene med indhold og dato.','Stil dem rent, køligt, mørkt og tørt – helst ved 10–21 °C (50–70 °F).','Henkog ikke mere, end du bruger inden for et år.','Undgå over 35 °C (95 °F), varme rør, komfur og direkte sol – så forringes indholdet på uger eller måneder og kan blive fordærvet.'])
