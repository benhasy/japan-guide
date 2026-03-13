window.storage = {
  get: async (k) => { try { const v = localStorage.getItem(k); return v ? {value: v} : null; } catch { return null; } },
  set: async (k, v) => { try { localStorage.setItem(k, v); return {value: v}; } catch { return null; } },
  delete: async (k) => { try { localStorage.removeItem(k); return {deleted: true}; } catch { return null; } },
  list: async () => { return {keys: []}; }
};

import { useState, useMemo, useEffect, useRef } from "react";

const C = {
  bg:"#1B1730",surf:"#231D3A",border:"#3D3560",
  pink:"#FF6EB4",teal:"#2DFFC8",yellow:"#FFE566",coral:"#FF8C70",
  lavender:"#C0A8FF",text:"#EDE5FF",muted:"#9C8BB8",dim:"#5A4E72",
  green:"#7BFF8C",orange:"#FFB347",food:"#FF9F43",
  archive:"#E879F9",tcg:"#60BFFF",
};
const PL = {1:"¥",2:"¥¥",3:"¥¥¥"};

const VIEWS = [
  {id:"guide",   label:"EXPLORE",   icon:"🗾"},
  {id:"itin",    label:"ITINERARY", icon:"📅"},
  {id:"search",  label:"SEARCH",    icon:"🔍"},
  {id:"myfinds", label:"MY FINDS",  icon:"⭐"},
];

const CITIES = [
  {id:"osaka",     label:"OSAKA",               sub:"26–28 MAR", emoji:"🦀", center:[34.672,135.501],  zoom:13},
  {id:"hiroshima", label:"HIROSHIMA",            sub:"29–30 MAR", emoji:"☮️", center:[34.393,132.452],  zoom:13},
  {id:"west",      label:"ONOMICHI/HIMEJI/KOBE", sub:"31 MAR–1 APR",emoji:"⚔️",center:[34.690,134.000], zoom:9},
  {id:"kyoto",     label:"KYOTO + NARA",         sub:"2–5 APR",  emoji:"🦌", center:[35.011,135.768],  zoom:12},
  {id:"nagoya",    label:"NAGOYA + GHIBLI",      sub:"6 APR",    emoji:"🐱", center:[35.170,136.900],  zoom:12},
  {id:"fuji",      label:"MT FUJI",              sub:"7 APR",    emoji:"🗻", center:[35.490,138.740],  zoom:11},
  {id:"tokyo",     label:"TOKYO",                sub:"8–14 APR", emoji:"🌆", center:[35.682,139.710],  zoom:12},
];

const CATS = [
  {id:"all",     label:"ALL",              color:C.text},
  {id:"rave",    label:"🕺 RAVES",          color:C.pink},
  {id:"jazz",    label:"🎷 JAZZ/HIP-HOP",   color:C.yellow},
  {id:"records", label:"🎵 RECORDS",        color:C.teal},
  {id:"gaming",  label:"👾 GAMING",         color:C.lavender},
  {id:"archive", label:"👗 2000s ARCHIVE",  color:C.archive},
  {id:"tcg",     label:"🃏 POKÉMON/YGO",    color:C.tcg},
  {id:"fashion", label:"👕 FASHION",        color:C.coral},
  {id:"nature",  label:"🌿 WILDLIFE",       color:C.green},
  {id:"hidden",  label:"🔍 HIDDEN",         color:C.orange},
  {id:"food",    label:"🍜 FOOD",           color:C.food},
  {id:"onsen",   label:"♨️ BATHS/ONSEN",    color:"#00CFCF"},
  {id:"arcade",      label:"🕹️ ARCADES",         color:"#B8FF47"},
  {id:"sightseeing", label:"🏯 SIGHTSEEING",     color:"#FFD700"},
  {id:"gamecentre",  label:"🕹️ GAME CENTRES",    color:"#00E5FF"},
];
const CAT_MAP = Object.fromEntries(CATS.map(c=>[c.id,c]));

const BLOSSOM = {
  osaka:     {status:"🌸 PEAK",             pct:95,  detail:"Full bloom during your stay. Sumiyoshi Taisha, Osaka Castle grounds and Minoh Falls gorge are spectacular. ~28 Mar is likely peak."},
  hiroshima: {status:"🌸🌸 FULL BLOOM",      pct:100, detail:"Hiroshima blooms slightly early (avg 25 Mar–3 Apr). Peace Park riverside and Miyajima ferry route at full bloom."},
  west:      {status:"🌸 PEAK",             pct:90,  detail:"Onomichi hillside sakura at peak. Himeji Castle grounds — one of Japan's most famous blossom spots — perfect timing for Apr 1."},
  kyoto:     {status:"🌸🌸🌸 BEST TIMING",   pct:100, detail:"The best blossom timing of the whole trip. Philosopher's Path, Maruyama Park and Arashiyama all at or near full peak Apr 2–5."},
  nagoya:    {status:"🍃 LATE / FALLING",    pct:35,  detail:"Nagoya peaks avg Mar 28. By Apr 6 most petals have fallen. Some late varieties at Atsuta Jingu and Higashiyama Zoo remain."},
  fuji:      {status:"🌸 EARLY BLOOM",      pct:60,  detail:"Kawaguchiko blooms later due to elevation (peak avg Apr 8–18). You arrive Apr 7 — early bloom at lower altitude, Chureito Pagoda perfect timing."},
  tokyo:     {status:"🍃 MOSTLY FALLEN",    pct:20,  detail:"Tokyo peaks avg Mar 28–Apr 5. Most have fallen by Apr 8. Shinjuku Gyoen late varieties and Meguro River lantern walk still worth it."},
};

const ITIN = [
  {date:"26 MAR",day:"THU",city:"osaka",    label:"Arrival Night",
   note:"Arrive KIX. KE721 lands 20:45. Get IC card (ICOCA) and activate JR Pass at airport counter. Check in. Late-night konbini run — try onigiri, Kirin Ichiban and Pocky. Do a short wander.",
   picks:["TENMA TACHINOMI STANDING BARS"]},
  {date:"27 MAR",day:"FRI",city:"osaka",    label:"Den Den Town + Amerikamura + Clubs",
   note:"Morning: Den Den Town retro gaming — back streets behind Ota Road for the real finds. DEN DEN TOWN TCG SHOPS for cards. Afternoon: Amerikamura triangle for thrift and records. TARGET OSAKA and EXCUBE OSAKA for archive finds. Clubs from midnight.",
   picks:["DEN DEN TOWN BACK STREETS","DEN DEN TOWN TCG SHOPS","TRIANGLE PARK THRIFT CIRCUIT","TARGET OSAKA","EXCUBE OSAKA","TIME BOMB RECORDS","COMPUFUNK RECORDS OSAKA","CIRCUS OSAKA"]},
  {date:"28 MAR",day:"SAT",city:"osaka",    label:"Osaka Free Day (or USJ)",
   note:"USJ + Super Nintendo World if booked. Otherwise: Nakazakicho vintage quarter in the morning. Orange Street / Horie boutiques afternoon. Minoh Falls and macaque walk if energy allows.",
   picks:["NAKAZAKICHO VINTAGE QUARTER","ORANGE STREET / HORIE BOUTIQUES","MINOH FALLS + MONKEY SIGHTINGS","KING KONG HONTEN"]},
  {date:"29 MAR",day:"SUN",city:"hiroshima",label:"Hiroshima + Miyajima",
   note:"Shinkansen morning. Peace Memorial Museum — allow 3–4 hours. Afternoon ferry to Miyajima, ropeway up Mt Misen. Wild deer everywhere. Return evening. Nagarekawa oysters for dinner.",
   picks:["MIYAJIMA + ITSUKUSHIMA SHRINE","MT MISEN SUMMIT TRAIL","OKONOMIMURA (25-STALL BUILDING)","NAGAREKAWA OYSTER STANDING BARS"]},
  {date:"30 MAR",day:"MON",city:"hiroshima",label:"Hiroshima — Deeper or Split",
   note:"Option A: Deeper Hiroshima — Honkawa riverside at dawn, Hondori record shops, Ujina port. Option B: Split — friend does Naval Museum, you go back to Miyajima for a slower morning.",
   picks:["HONKAWA RIVERSIDE AT DAWN","HONDORI ARCADE RECORD SHOPS","HIROSHIMA DELTA ESTUARY BIRDS","KAKIFUNE KANAWA (OYSTER BOAT)"]},
  {date:"31 MAR",day:"TUE",city:"west",     label:"EtSetora Train → Onomichi → Kurashiki",
   note:"EtSetora scenic train departs Hiroshima 9:32, arrives Onomichi 12:35. Senkoji hillside walk, cat colony. Onomichi ramen for lunch. Afternoon shinkansen to Kurashiki. Evening in the Bikan historical quarter.",
   picks:["ONOMICHI HILLSIDE BACK ALLEYS","ONOMICHI CAT COLONY","ONOMICHI RAMEN SHOPS","KURASHIKI BIKAN HISTORICAL QUARTER"]},
  {date:"1 APR", day:"WED",city:"west",     label:"Himeji Castle → Kobe → Kyoto",
   note:"Morning: Himeji Castle (arrive before 9am). Cherry blossoms at peak. Afternoon: Kobe — Steakland or Mouriya beef, Nunobiki Falls hike, Motomachi vintage.",
   picks:["HIMEJI CASTLE (SHIRASAGIJO)","STEAKLAND KOBE","NUNOBIKI FALLS + HERB GARDEN HIKE","KOBE VINTAGE CIRCUIT (MOTOMACHI)"]},
  {date:"2 APR", day:"THU",city:"kyoto",    label:"Fushimi Inari at Dawn + Teramachi",
   note:"CRACK OF DAWN: Fushimi Inari before 6am. Full summit hike. Late breakfast at Hiranoya. Afternoon: Teramachi vintage, records — JET SET RECORDS KYOTO and MEDITATIONS KYOTO. Evening: Metro Kyoto.",
   picks:["FUSHIMI INARI (PRE-DAWN)","HIRANOYA (130YR RESTAURANT NEAR FUSHIMI INARI)","TERAMACHI ARCADE RETRO GAMES","SANJO/TERAMACHI VINTAGE SHOPS","JET SET RECORDS KYOTO","MEDITATIONS KYOTO","METRO KYOTO"]},
  {date:"3 APR", day:"FRI",city:"kyoto",    label:"Arashiyama + Nishiki + Gion",
   note:"Early: Arashiyama bamboo grove before 8am. Monkey Park. Nishiki Market lunch stalls. Imamiya Shrine + 1000-year-old restaurant. Evening wander through Gion backstreets.",
   picks:["ARASHIYAMA MONKEY PARK IWATAYAMA","NISHIKI MARKET FOOD STALLS","IMAMIYA SHRINE + WORLD'S OLDEST RESTAURANTS","FURUMONZEN ANTIQUE ACCESSORIES","MENBAKAICHIDAI (FIRE RAMEN)"]},
  {date:"4 APR", day:"SAT",city:"kyoto",    label:"Nara + Yoshino Cherry Blossoms",
   note:"Early Kintetsu to Nara — deer at dawn. Naramachi district. Afternoon further south to Yoshino for 30,000+ mountain cherry trees. Return Kyoto evening.",
   picks:["NARA PARK: SIKA DEER AT DAWN","NARAMACHI MERCHANT DISTRICT","YOSHINO MOUNTAIN CHERRY BLOSSOMS"]},
  {date:"5 APR", day:"SUN",city:"kyoto",    label:"Kurama Forest + Uji (Nintendo Museum)",
   note:"Morning: Kurama forest hike and tattoo-friendly onsen. Afternoon: Uji — Nintendo Museum (LOTTERY — book NOW), Byodo-in, best matcha. Utoro Peace Museum.",
   picks:["KURAMA ONSEN + CEDAR FOREST HIKE","NINTENDO MUSEUM (UJI)","UTORO PEACE MUSEUM (UJI)","IZUJU (PRESSED SUSHI SINCE 1781)"]},
  {date:"6 APR", day:"MON",city:"nagoya",   label:"Nagoya → Ghibli Park",
   note:"Early start from Kyoto. Drop bags in Nagoya. Ghibli Park full day — BOOK 3 MONTHS AHEAD. Evening: Yabaton miso katsu (the original 1947 restaurant). Kakuozan creative district.",
   picks:["GHIBLI PARK","YABATON (MISO KATSU SINCE 1947)","KAKUOZAN CREATIVE DISTRICT","KOMEDA COFFEE (NAGOYA MORNING CULTURE)"]},
  {date:"7 APR", day:"TUE",city:"fuji",     label:"Lake Kawaguchi — Cycling + Pagoda",
   note:"Shinkansen to Mishima, train to Kawaguchiko. Bike rental for western lakes circuit. Chureito Pagoda — pagoda + Fuji + early cherry blossoms. Hoto noodle dinner.",
   picks:["CHUREITO PAGODA + FUJI VIEW","WESTERN LAKES CYCLING CIRCUIT","LAKE SAIKO + NARUSAWA ICE CAVE","HOTO FUDO (LOCAL FUJI DISH)"]},
  {date:"8 APR", day:"WED",city:"tokyo",    label:"Tokyo Arrives — Shimokitazawa",
   note:"Bus or train from Kawaguchiko. Afternoon: Shimokitazawa — dig records at DISC UNION, JET SET, NOAH LEWIS, FLASH DISC RANCH. ELLA RECORDS in Yoyogi-Uehara. BIG LOVE in Harajuku. Evening: Lady Jane jazz kissaten.",
   picks:["DISC UNION SHIMOKITAZAWA","JET SET RECORDS (SHIMOKITAZAWA)","NOAH LEWIS RECORDS (SHIMOKITAZAWA)","ELLA RECORDS (YOYOGI-UEHARA)","BIG LOVE RECORDS (HARAJUKU)","LADY JANE (SHIMOKITAZAWA)","CONTACT (SHIBUYA)"]},
  {date:"9 APR", day:"THU",city:"tokyo",    label:"Akihabara — Gaming + Cards Full Day",
   note:"Full day Akihabara. Morning: BEEP for PC-98 horror, TRADER for Saturn horror. HARERUYA 2 for Pokémon cards (5 floors). CARD RUSH for Yu-Gi-Oh! singles. C-LABO for Yu-Gi-Oh! events. Mandarake Complex 8 floors. Kanda Matsuya soba for lunch. Evening: Mogra.",
   picks:["BEEP AKIHABARA (PC-98 HORROR)","HARERUYA 2 (POKEMON)","CARD RUSH AKIHABARA","C-LABO AKIHABARA (YU-GI-OH)","TRADER AKIHABARA","MANDARAKE COMPLEX AKIHABARA","KANDA MATSUYA (SOBA SINCE 1884)","MOGRA (AKIHABARA)"]},
  {date:"10 APR",day:"FRI",city:"tokyo",    label:"Harajuku Archive Fashion + Golden Gai",
   note:"Morning: Persona 5 pilgrimage — Shibuya Hachiko Square, Center Gai, Teikyu walkway. Afternoon: RAGTAG HARAJUKU for Hysteric Glamour/BAPE archive. CASANOVA for Murakami-era Y2K luxury. NEOVA for cyber rave pieces. Ura-Harajuku. Evening: Golden Gai bar crawl. Late: Vent or Ohjo.",
   picks:["SHIBUYA HACHIKO & CENTER GAI (PERSONA 5)","RAGTAG HARAJUKU (ARCHIVE FASHION)","CASANOVA VINTAGE (Y2K LUXURY)","NEOVA (CYBER RAVE FASHION)","DOG BASEMENT (HARAJUKU)","URA-HARAJUKU: NEIGHBOURHOOD, WTAPS, UNDERCOVER","GOLDEN GAI (SHINJUKU)","VENT (OMOTESANDO)"]},
  {date:"11 APR",day:"SAT",city:"tokyo",    label:"Sangen-Jaya Persona 5 + Kamakura + Jazz",
   note:"Morning: Sangen-Jaya (Yongen-Jaya IRL) — walk the backstreets, find Chiyono-Yu bathhouse, eat curry and coffee at RAIN ON THE ROOF café (real Leblanc). Visit Café de l'Ambre in Ginza for the original Leblanc inspiration. Afternoon: Kamakura day trip. Evening: Shinjuku Pit Inn jazz.",
   picks:["SANGEN-JAYA PERSONA 5 DISTRICT","RAIN ON THE ROOF CAFÉ (REAL LEBLANC)","CAFÉ DE L'AMBRE (GINZA)","KAMAKURA DAIBUTSU HIKING TRAIL","SHINJUKU PIT INN"]},
  {date:"12 APR",day:"SUN",city:"tokyo",    label:"Koenji — Best Vintage + TCG + Live Music",
   note:"Full day Koenji: PAT MARKET for Y2K Japanese labels, Atlantis Vintage, Big Time, Kitakore Building. MAGI Shibuya for PSA-graded Pokémon cards. Technique Records Shibuya. Evening: Jirokichi or 20000 Den-Atsu live. Meguro River late blossom walk after 9pm.",
   picks:["KOENJI VINTAGE (BEST IN TOKYO 2025)","PAT MARKET IKEBUKURO (Y2K ARCHIVE)","MAGI SHIBUYA (GRADED POKEMON)","KOENJI: JIROKICHI + 20000 DEN-ATSU","TECHNIQUE RECORDS (SHIBUYA)","MEGURO RIVER NIGHT BLOSSOM"]},
  {date:"13 APR",day:"MON",city:"tokyo",    label:"Nippori + Hakone Overnight",
   note:"Morning: Nippori Textile Town. Afternoon: Hakone by Romancecar. Tattoo-friendly onsen at Kowakien Yunessun. Hakone Open Air Museum. Overnight.",
   picks:["NIPPORI TEXTILE TOWN","HAKONE: TATTOO-FRIENDLY ONSEN"]},
  {date:"14 APR",day:"TUE",city:"tokyo",    label:"Final Tokyo Day",
   note:"Return Hakone. Rare Item Studio Kanda for 80s vinyl + horror OSTs. Capcom Store Shibuya PARCO final merch run. Meguro Parasite Museum. Joyful Minowa on the Toden tram. Pack bags carefully. Final Japanese dinner.",
   picks:["RARE ITEM STUDIO (KANDA)","CAPCOM STORE TOKYO (SHIBUYA PARCO)","MEGURO PARASITOLOGICAL MUSEUM","JOYFUL MINOWA (ARAKAWA TRAM)","ICHIRAN SHINJUKU (24HR SOLO RAMEN)"]},
  {date:"15 APR",day:"WED",city:"tokyo",    label:"Departure",
   note:"Friend departs NRT (CZ8310 14:35). You need to return to KIX — shinkansen takes ~3hrs. Allow minimum 3hrs before your KIX departure. Last convenience store breakfast.",
   picks:[]},
];

// ── ALL SPOT DATA ───────────────────────────────────────────
const DATA = {
osaka:[
  // ── RAVES
  {cat:"rave",tourist:0,lat:34.6693,lng:135.5001,name:"CIRCUS OSAKA",
   desc:"The underground benchmark. Basement in Namba consistently booking European acts — deep house, techno, ambient, breakbeats. One of Asia's most trusted underground rooms.",
   tip:"Check RA before arriving. Book in advance for headliner nights. Cash only at the door.",addr:"1-8-16 Nishishinsaibashi, Chuo Ward"},
  {cat:"rave",tourist:0,lat:34.6689,lng:135.4977,name:"PICCADILLY OSAKA",
   desc:"Bare concrete inside Amerikamura. Four-to-the-floor until sunrise. Think Berlin club but smaller, sweatier, cheaper. Regulars close their eyes and stay until 5am.",
   tip:"Arrive after 2am. No photos on the dancefloor. Very local crowd.",addr:"Amerikamura, Chuo Ward"},
  {cat:"rave",tourist:0,lat:34.6685,lng:135.5005,name:"CLUB UNDER",
   desc:"Born 2022, already earned a serious rep. Dedicated techno/trance focus with elite sound engineering. Weekday parties small and focused.",
   tip:"Follow their Instagram for lineups. Often books harder styles than CIRCUS.",addr:"Chuo Ward, Osaka"},
  {cat:"rave",tourist:0,lat:34.6625,lng:135.4888,name:"KING COBRA",
   desc:"Dive bar held together by band stickers and graffiti. Spectacular sound system. Punk, thrash, metal, noise. Red-and-black checkerboard floor.",
   tip:"Bring earplugs. Lower basement bar has cheap drinks. Almost no tourists.",addr:"2-13-26 Minamihorie, Nishi Ward"},
  // ── JAZZ
  {cat:"jazz",tourist:0,lat:34.7180,lng:135.5103,name:"TOTOTO RECORDS + BAR",
   desc:"Crate-digging bar on Tenjinbashi-suji. Second-hand soul, jazz and funk records mixed with drinks. Arrive for one record, leave four hours later.",
   tip:"Chat to the owner about what you're after. Locals know everything.",addr:"Tenjinbashi-suji, Kita Ward"},
  {cat:"jazz",tourist:0,lat:34.6715,lng:135.5010,name:"JAZZ ON TOP (SHINSAIBASHI)",
   desc:"Small live jazz spot above the Shinsaibashi chaos. Local musicians, rotating programme. Intimate — no pretence.",
   tip:"Afternoon shows are cheaper. Good landing after Den Den Town.",addr:"Shinsaibashi, Chuo Ward"},
  // ── RECORDS
  {cat:"records",tourist:0,lat:34.6690,lng:135.4971,name:"TIME BOMB RECORDS",
   desc:"Amerikamura institution. Punk, rockabilly, psychobilly, early UK hardcore and new wave on vinyl. One of the best shops for early 80s UK hardcore imports in Japan.",
   tip:"Perfect for 80s imports and rare UK pressings at competitive prices.",addr:"Amerikamura, Chuo Ward"},
  {cat:"records",tourist:0,lat:34.6689,lng:135.4986,name:"KING KONG HONTEN",
   desc:"Basement of the Big Step building. Massive second-hand collection: city pop, Japanese jazz, soul, funk. Affordable LPs. Where serious Osaka diggers go first.",
   tip:"Weekdays quieter for digging. Great for jazz 45s and rare Japanese soul.",addr:"Big Step B1F, Amerikamura"},
  {cat:"records",tourist:0,lat:34.6622,lng:135.4881,name:"FLAKE RECORDS (MINAMIHORIE)",
   desc:"Hidden in Minamihorie. Indie rock focus but good breadth. Excellent for anything alternative with a DIY edge.",
   tip:"Overlooked gems in every bin. Ask staff what came in that week.",addr:"Minamihorie, Nishi Ward"},
  {cat:"records",tourist:0,lat:34.7078,lng:135.5031,name:"COMPUFUNK RECORDS OSAKA",
   desc:"Hub of Osaka's underground dance music culture — record shop, bar and occasional club space in one. Run by Wonderful Noise Productions. Genre-agnostic focus on dance music. Opened May 2023. Becomes a bar with a serious music crowd at night.",
   tip:"Open weekdays 2pm–midnight, weekends noon–midnight. Closed first Tue of month and every Wed. Come for records, stay for the evening bar crowd — they're serious.",
   hours:"14:00–midnight wkdays, 12:00–midnight wkends, closed 1st Tue & Wed",
   addr:"Nakatsu, Kita Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6695,lng:135.4961,name:"GROOVENUT RECORDS",
   desc:"Soul, funk, disco, hip-hop and R&B specialist in Amemura. US black music at its core. One of the best black music shops in Kansai, per Recoya.",
   tip:"13:00-21:00. Ask about the 45rpm soul singles section.",hours:"13:00-21:00",addr:"Shinsaibashi-Amemura, Chuo Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6701,lng:135.4950,name:"NEWTONE RECORDS",
   desc:"Dance music from around the world: jazz, Latin, club/dance, hip-hop. Leans new stock - excellent for Japanese dance music 12-inches.",
   tip:"12:00-20:00. Good for club 12-inch and new Japanese funk/jazz releases.",hours:"12:00-20:00",addr:"Shinsaibashi, Chuo Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6680,lng:135.4975,name:"ROOT DOWN RECORDS",
   desc:"Black music main: soul, funk, disco, hip-hop. Serious selection for DJs and collectors. Open later than most Osaka shops.",
   tip:"13:00-22:00. One of the later-closing record shops - ideal pre-club.",hours:"13:00-22:00",addr:"Shinsaibashi area, Chuo Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6720,lng:135.4930,name:"ALFFO RECORDS",
   desc:"Hip-hop, rock, club/dance with an in-house bar. Hosts regular DJ events. Feels like a living room that sells very good records.",
   tip:"Mon-Fri 15:00-midnight, Sat 13:00-midnight, Sun 13:00-21:00, closed Wed. Check Instagram for DJ events.",hours:"Mon-Fri 15:00-midnight, Sat 13:00-midnight",addr:"Horie area, Nishi Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6685,lng:135.4982,name:"BLUE SOUL RECORDS",
   desc:"Black music specialty: jazz, soul, funk, hip-hop. Genre-specialist shop in Amemura. Surprising Japanese jazz finds at good prices.",
   tip:"12:00-20:00.",hours:"12:00-20:00",addr:"Shinsaibashi-Amemura, Chuo Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6698,lng:135.4945,name:"ESPECIAL RECORDS",
   desc:"Jazz, hip-hop, Latin and club/dance. Well-regarded among local DJs. Strong Latin section. Combine with Groovenut and Newtone for an Amemura circuit.",
   tip:"14:00-20:00.",hours:"14:00-20:00",addr:"Shinsaibashi, Chuo Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6710,lng:135.4900,name:"BASURA MUZIK (NEW 2025)",
   desc:"Opened June 2025. Incredible in-store listening system: d&b audiotechnik Max12 monitors, Mackie subwoofer, and a genuine original Urei 1620 mixer - the same desk used at Paradise Garage. One of the best-sounding shops in Japan.",
   tip:"Thu/Fri/Sat/Mon 16:00-22:00; other days check Instagram stories. Bring something to test on that mixer.",hours:"Thu/Fri/Sat/Mon 16:00-22:00, irregular",addr:"Shinsaibashi area, Chuo Ward, Osaka"},
  {cat:"records",tourist:0,lat:34.6693,lng:135.4966,name:"VOXMUSIC",
   desc:"Soul, jazz, Latin, rare groove, hip-hop and reggae. Also stocks cassettes - unusual for Osaka. A versatile all-rounder in the Amemura cluster.",
   tip:"13:00-18:00 (earlier close than most - go mid-afternoon).",hours:"13:00-18:00",addr:"Shinsaibashi, Chuo Ward, Osaka"},
  // ── GAMING
  {cat:"gaming",tourist:1,lat:34.6663,lng:135.5063,name:"SUPER POTATO RETROKAN",
   desc:"⚠ Tourist magnet but unavoidable. Famicom, PC-88, Saturn, PS1 horror imports. Prices fair for the selection. Classic boxart titles unavailable outside Japan.",
   tip:"Go early weekday. Top floor arcade has genuinely playable machines on original hardware.",addr:"Ota Road, Nipponbashi (Den Den Town)"},
  {cat:"gaming",tourist:0,lat:34.6660,lng:135.5070,name:"DEN DEN TOWN BACK STREETS",
   desc:"Small independent shops off the main Ota Road strip. Untranslated PC-9801 games, boxed Saturn horror titles, obscure Konami merch nobody's priced correctly.",
   tip:"Walk east of the main strip. Look for unmarked shopfronts with dusty displays. No English signs.",addr:"Side streets east of Nipponbashi-suji"},
  {cat:"gaming",tourist:0,lat:34.6650,lng:135.5012,name:"MANDARAKE OSAKA (NAMBA)",
   desc:"Horror game art books, obscure RPG merchandise, figures, doujinshi. Strong PS2 Japanese horror section.",
   tip:"The basement section often has the best retro finds. Check unsorted boxes.",addr:"Namba, Chuo Ward"},
  {cat:"gaming",tourist:1,lat:34.6710,lng:135.5011,name:"CAPCOM STORE OSAKA",
   desc:"⚠ One of only two official Capcom stores in the world. Resident Evil, Monster Hunter, Street Fighter, DMC exclusive Japan-only merch.",
   tip:"Mid-week to avoid queues. RE and DMC merch sells out fast on weekends.",addr:"Shinsaibashi PARCO 6F, Chuo Ward"},
  // ── TCG (new)
  {cat:"tcg",tourist:0,lat:34.6658,lng:135.5060,name:"DEN DEN TOWN TCG SHOPS",
   desc:"Several small independent card shops scattered through Den Den Town's backstreets and upper floors of buildings on Nipponbashi-suji. Much less tourist-facing than Akihabara equivalents — serious players, better prices on Yu-Gi-Oh! OCG singles, older Pokémon Japanese cards and Duel Masters.",
   tip:"Look for stairwells leading to upper floor shops — the most interesting ones are never on the ground floor. Staff are hardcore players and OCG-knowledgeable.",
   hours:"12:00–19:00 most shops",
   addr:"Nipponbashi backstreets, Naniwa Ward, Osaka"},
  // ── FASHION
  {cat:"fashion",tourist:0,lat:34.6690,lng:135.4969,name:"TRIANGLE PARK THRIFT CIRCUIT",
   desc:"The whole block around Amerikamura's Triangle Park is a thrift and vintage maze. Kinji, Grizzly, and smaller indie spots sell 90s Japanese streetwear, American vintage and accessories.",
   tip:"Budget half a day. Kinji near Big Step has great value and rotating stock.",addr:"Around Triangle Park, Chuo Ward"},
  {cat:"fashion",tourist:0,lat:34.6628,lng:135.4888,name:"ORANGE STREET / HORIE BOUTIQUES",
   desc:"Osaka's independent designer strip. Small boutiques with Japanese labels you won't find online — gorpcore-leaning brands, minimal streetwear, handmade accessories.",
   tip:"Walk west from Triangle Park into Horie. The deeper you go, the more interesting.",addr:"Minamihorie / Horie, Nishi Ward"},
  {cat:"fashion",tourist:0,lat:34.7090,lng:135.5102,name:"NAKAZAKICHO VINTAGE QUARTER",
   desc:"Pre-war machiya townhouses converted into galleries, craft shops and vintage boutiques. Way less known than Ame-mura. Genuine one-of-a-kind accessories.",
   tip:"Most workshops open weekday afternoons 2–5pm. Come prepared to spend time.",addr:"Nakazaki-cho, Kita Ward"},
  // ── ARCHIVE (new)
  {cat:"archive",tourist:0,lat:34.6640,lng:135.4990,name:"EXCUBE OSAKA",
   desc:"Alternative space in Namba combining an art gallery and vintage fashion shop. Owner Makoto is deeply connected to the Berlin underground — racks filled entirely with 90s–2000s rave and club culture garments: archive rave tops, early millennium fashion magazines, independent labels. One of the most distinctive shops in Japan for this aesthetic.",
   tip:"Tell Makoto what music you're into and he'll pull the right racks. The design books and fashion magazines alone are worth the visit.",
   addr:"Namba area, Chuo Ward, Osaka"},
  {cat:"archive",tourist:0,lat:34.6692,lng:135.4975,name:"TARGET OSAKA",
   desc:"Select vintage in Amerikamura's Taki Building, 5th floor. Focused entirely on skull, grunge, punk and Y2K — specifically Japanese domestic labels from that era alongside key imports. Staff dress exactly like what they sell. Stock rotates fast.",
   tip:"Open weekdays 14:00–20:00, weekends 13:00–20:00. Ask about latest arrivals — several new pieces weekly.",
   hours:"14:00–20:00 weekdays, 13:00–20:00 weekends",
   addr:"Taki Building 5F, Nishishinsaibashi 2-11-8, Chuo Ward, Osaka"},
  // ── NATURE
  {cat:"nature",tourist:0,lat:34.8278,lng:135.4699,name:"MINOH FALLS + MONKEY SIGHTINGS",
   desc:"Forested gorge 45 min north of Osaka. Cherry blossoms line the riverbanks in spring. Japanese macaque monkeys live in the hills.",
   tip:"2.7km trail each way. Go weekday morning. Hankyu Minoh line, last stop.",addr:"Minoh City"},
  {cat:"nature",tourist:0,lat:34.6135,lng:135.4958,name:"SUMIYOSHI TAISHA (EST. 211 AD)",
   desc:"One of Japan's oldest shrines. Iconic Sorihashi arch bridge. Cherry blossoms in late March spectacular. Almost no foreign tourists.",
   tip:"Combine with Sumiyoshi Park walk. Arrive before 8am.",addr:"2-9-89 Sumiyoshi, Sumiyoshi Ward"},
  // ── HIDDEN
  {cat:"hidden",tourist:0,lat:34.6525,lng:135.5065,name:"SHINSEKAI BACKSTREETS",
   desc:"Tourists see the main strip — go one block deeper into covered arcades. Family-run betting cafes, vintage toy stalls, old men eating kushikatsu in silence. Frozen in Showa-era time.",
   tip:"Go at night for the neon glow. Avoid weekends.",addr:"Shinsekai, Naniwa Ward"},
  {cat:"hidden",tourist:0,lat:34.7150,lng:135.5140,name:"TENMA TACHINOMI STANDING BARS",
   desc:"Dozens of tiny standing bars near Osaka Tenmangu shrine. Cheap sake and yakitori. Office workers and locals only — no tourist menus, no English.",
   tip:"Best 6–9pm weekdays. Point at what looks good.",addr:"Tenma, Kita Ward"},
  // ── FOOD
  {cat:"food",tourist:0,lat:34.6684,lng:135.5009,name:"MIZUNO OKONOMIYAKI",hours:"11:30–21:30, closed Tue",price:2,
   desc:"Osaka okonomiyaki since 1945. Dotonbori institution. The original Osaka-style: everything mixed together on the griddle.",
   tip:"Lunch queue moves fast. Sit at the counter to watch it made.",addr:"Dotonbori, Chuo Ward"},
  {cat:"food",tourist:0,lat:34.6685,lng:135.4983,name:"WANAKA TAKOYAKI",hours:"10:00–18:00, closed Mon",price:1,
   desc:"The takoyaki stall Osakans point to. No seating, queue of locals. Crisp outside, molten inside, made fresh to order.",
   tip:"Order 8. Eat immediately standing outside.",addr:"Near Namba, Chuo Ward"},
  {cat:"food",tourist:0,lat:34.6696,lng:135.5025,name:"HOZENJI YOKOCHO IZAKAYAS",hours:"18:00–late",price:2,
   desc:"Narrow alley behind Dotonbori. Two lanes of tiny old izakayas with hanging lanterns and moss-covered statues. Old Osaka atmosphere.",
   tip:"Any place with an old TV showing baseball and a hand-written menu is the right choice.",addr:"Hozenji, Chuo Ward"},
  {cat:"food",tourist:0,lat:34.6720,lng:135.5220,name:"TSURUHASHI YAKINIKU MARKET",hours:"11:00–21:00",price:2,
   desc:"Osaka's original Korean-Japanese yakiniku district. Covered market since the postwar era. Dozens of tiny grill restaurants, extraordinary beef at reasonable prices.",
   tip:"Walk into the covered market and pick any packed restaurant.",addr:"Tsuruhashi, Ikuno Ward"},
  // ── ONSEN
  {cat:"onsen",tourist:1,lat:34.6558,lng:135.5063,name:"SPA WORLD NAMBA",
   desc:"10-floor mega-bath complex in Namba. Each floor is a different country's bathing culture: Roman, Atlantis, European, Asian. Jacuzzis, saunas, waterfalls, cold plunges. The most maximalist bath experience in Japan.",
   tip:"Open 10:00–08:45 next day. Around ¥1,000–1,500 entry. Rental towels available. Tattoos OK on some floors.",hours:"10:00–08:45 (next day)",addr:"3-4-24 Ebisuhigashi, Naniwa Ward, Osaka"},
  {cat:"onsen",tourist:0,lat:34.6735,lng:135.5014,name:"NAMBA NO YU",
   desc:"New-era sento in central Osaka. Clean, modern, multiple baths and a proper sauna. Locals come here to decompress after work. Much more authentic atmosphere than Spa World.",
   tip:"17:00–01:00. Around ¥600–800 entry. Bring flip-flops.",hours:"17:00–01:00",addr:"Nishi-Shinsaibashi, Chuo Ward, Osaka"},
  // ── SIGHTSEEING
  {cat:"sightseeing",tourist:1,lat:34.6873,lng:135.5262,name:"OSAKA CASTLE",
   desc:"16th century feudal castle with a museum inside. The free surrounding grounds are spectacular for cherry blossoms in late March — Osaka Castle Park is one of the best blossom spots in the city.",
   tip:"Grounds are free. ¥600 for museum entry. Go early to beat the tour groups.",
   hours:"9:00–17:00",addr:"1-1 Osakajo, Chuo Ward, Osaka"},
  {cat:"sightseeing",tourist:1,lat:34.6538,lng:135.5160,name:"SHITENNOJI TEMPLE",
   desc:"Japan's oldest Buddhist temple, founded 593 AD by Prince Shotoku. A working temple complex with a beautiful inner garden and pagoda. Extraordinary history in the middle of the city.",
   tip:"¥300 entry to inner garden. Free to visit the outer precincts. Much less crowded than Nara.",
   hours:"8:30–16:30",addr:"1-11-18 Shitennoji, Tennoji Ward, Osaka"},
  {cat:"sightseeing",tourist:1,lat:34.6130,lng:135.4930,name:"SUMIYOSHI TAISHA",
   desc:"One of Japan's oldest and most important shrines (est. 211 AD), predating Buddhism in Japan. Iconic arched bridge (Sorihashi) and stunning cherry blossoms in late March. Almost no foreign tourists.",
   tip:"Arrive before 8am. Combine with Sumiyoshi Park walk. 15 min on Nankai from Namba.",
   hours:"6:00–17:00",addr:"2-9-89 Sumiyoshi, Sumiyoshi Ward, Osaka"},
  {cat:"sightseeing",tourist:1,lat:34.6687,lng:135.5013,name:"DOTONBORI CANAL AREA",
   desc:"Osaka's iconic neon-lit canal walk. Glico running man sign, giant crab sculptures, bridge lanterns. The sensory overload is the point. Best at night for full effect.",
   tip:"Walk the full length at night. Early morning (6–7am) is surprisingly peaceful — just locals and deliveries.",
   hours:"24hr",addr:"Dotonbori, Chuo Ward, Osaka"},
  {cat:"sightseeing",tourist:1,lat:34.6523,lng:135.5063,name:"SHINSEKAI RETRO DISTRICT",
   desc:"1920s entertainment district built to evoke Paris and New York simultaneously. Tsutenkaku tower, kushikatsu restaurants, pachinko halls and old betting cafes. Frozen in Showa-era charm.",
   tip:"Go at night for the neon glow. Spa World is right next door. Avoid weekends for the quieter backstreets.",
   hours:"varies by shop",addr:"Shinsekai, Naniwa Ward, Osaka"},
  {cat:"onsen",tourist:0,lat:34.7120,lng:135.5100,name:"SAUNA RESET & SPA (OSAKA)",
   desc:"A contemporary sauna-focused bath house popular with Osaka's creative scene. Finnish-style dry sauna, proper cold plunge, lounge area. The sauna circuit here is taken seriously.",
   tip:"Check hours. Sauna enthusiasts call this the best cold plunge in Osaka.",hours:"varies",addr:"Kita Ward, Osaka"},
  // ── ARCADE
  {cat:"arcade",tourist:0,lat:34.6624,lng:135.5001,name:"ROUND1 STADIUM NAMBA",
   desc:"The most comprehensive entertainment complex in Osaka. Floors dedicated to: rhythm games (WACCA, Sound Voltex, Jubeat), crane games, purikura, sports simulators, bowling. Dedicated retro corner with original PCBs.",
   tip:"Open till 5am on weekends. The rhythm game floor is world-class — bring headphones.",hours:"10:00–05:00 Fri/Sat, 10:00–02:00 wkdays",addr:"Shinsaibashi, Chuo Ward, Osaka"},
  {cat:"arcade",tourist:0,lat:34.6627,lng:135.5006,name:"TAITO STATION NAMBA",
   desc:"Major Taito arcade in the Namba thick of it. Strong on medal games and UFO catchers, plus a solid fighting game and rhythm game section.",
   tip:"Multiple floors. Medal game floor gives you something to do if the fighting game floor is packed.",hours:"10:00–00:00",addr:"Namba, Chuo Ward, Osaka"},
  {cat:"arcade",tourist:0,lat:34.6620,lng:135.5004,name:"GIGO NAMBA (FORMERLY SEGA)",
   desc:"Former Sega flagship, now GiGO-branded but same DNA. Excellent crane game selection, rhythm games, and a reasonably serious fighting game community.",
   tip:"The crane games here are some of the best-stocked in Osaka for anime merch.",hours:"10:00–00:00",addr:"Namba, Chuo Ward, Osaka"},
  // ── GAME CENTRES
  {cat:"gamecentre",tourist:0,lat:34.6654,lng:135.5014,name:"ROUND1 STADIUM NAMBA",
   desc:"The most comprehensive entertainment complex in Osaka. Multiple floors: rhythm games (WACCA, Sound Voltex, Jubeat), sports simulators, dedicated retro corner with original PCBs, crane games, purikura, bowling. Open until 5am on Fri/Sat.",
   tip:"Open till 5am on weekends — the rhythm game floor is world-class. The retro corner has genuinely playable original hardware.",
   hours:"10:00–05:00 Fri/Sat, 10:00–02:00 wkdays",addr:"Shinsaibashi, Chuo Ward, Osaka"},
  {cat:"gamecentre",tourist:0,lat:34.6644,lng:135.5005,name:"TAITO STATION NAMBA",
   desc:"Major Taito arcade in the heart of Namba. Strong fighting game and rhythm game section, UFO catchers and crane games well-stocked with anime merch.",
   tip:"Multiple floors. The medal game floor is good if the fighting game section is packed.",
   hours:"10:00–00:00",addr:"Namba, Chuo Ward, Osaka"},
  {cat:"gamecentre",tourist:0,lat:34.6642,lng:135.5003,name:"GIGO NAMBA",
   desc:"Former Sega flagship, now GiGO-branded. Excellent crane game selection, rhythm games, and an active fighting game community. The crane games are some of the best-stocked in Osaka.",
   tip:"Former Sega DNA means quality machine maintenance. The fighting game cabinets attract a local competitive scene.",
   hours:"10:00–00:00",addr:"Namba, Chuo Ward, Osaka"},
  {cat:"gamecentre",tourist:0,lat:34.6512,lng:135.5056,name:"ATHENA NIPPOMBASHI",
   desc:"Fighting game specialist near Den Den Town. BlazBlue, Persona Arena, Guilty Gear, Street Fighter tournaments run regularly. 11:00–23:00. The serious competitive fighting game community in Osaka comes here.",
   tip:"Check their schedule for tournaments — the competition level is very high. Staff are hardcore players.",
   hours:"11:00–23:00",addr:"Nippombashi, Naniwa Ward, Osaka"},
  {cat:"gamecentre",tourist:0,lat:34.7050,lng:135.4980,name:"ROUND1 UMEDA",
   desc:"Round1's north Osaka/Umeda location. Full entertainment package — rhythm games, sports simulators, bowling, purikura. Convenient for the Nakazakicho/Compufunk evening run.",
   tip:"Open until 2am. Pair with Compufunk Records nearby for a north Osaka music and games evening.",
   hours:"10:00–02:00",addr:"Umeda, Kita Ward, Osaka"},
],

hiroshima:[
  {cat:"nature",tourist:1,lat:34.2959,lng:132.3197,name:"MIYAJIMA + ITSUKUSHIMA SHRINE",
   desc:"⚠ Free-roaming deer everywhere. The floating torii gate at high tide is stunning. Ropeway up Mt Misen gives spectacular Seto Inland Sea views.",
   tip:"First ferry at dawn. Check tide tables for the gate.",addr:"Miyajima Island"},
  {cat:"nature",tourist:0,lat:34.2875,lng:132.3235,name:"MT MISEN SUMMIT TRAIL",
   desc:"Hike instead of the ropeway. Three trails through ancient UNESCO cedar forest. Wild monkeys near the summit.",
   tip:"The Omoto trail is least visited. Allow 3–4hrs return.",addr:"Miyajima Island interior"},
  {cat:"nature",tourist:0,lat:34.3955,lng:132.4540,name:"HIROSHIMA DELTA ESTUARY BIRDS",
   desc:"Seven-river delta. Late March estuary banks active with migratory birds — herons, cormorants, egrets. Walk any riverside path at dawn.",
   tip:"The Motoyasu River near the Peace Memorial has rich birdlife at 6am.",addr:"Riverside paths, central Hiroshima"},
  {cat:"hidden",tourist:0,lat:34.3930,lng:132.4620,name:"NAGAREKAWA DRINKING DISTRICT",
   desc:"Hiroshima's hidden nightlife quarter. Dense maze of tiny bars east of the Peace Memorial. Oyster bars, shochu dens, old-school karaoke.",
   tip:"Any spot with a handwritten sign and an old TV showing baseball.",addr:"Nagarekawa, Naka Ward"},
  {cat:"hidden",tourist:0,lat:34.3963,lng:132.4528,name:"HONKAWA RIVERSIDE AT DAWN",
   desc:"The river forming the Peace Park edge at 6am before anyone arrives. Cherry blossoms reflected in calm water, herons fishing.",
   tip:"The riverside path north of the A-bomb dome is particularly beautiful in blossom season.",addr:"Honkawa riverside, Naka Ward"},
  {cat:"hidden",tourist:0,lat:34.3645,lng:132.4681,name:"UJINA PORT DISTRICT",
   desc:"The old port south of central Hiroshima, almost entirely ignored by tourists. Abandoned warehouses, fishing boats, migratory birds.",
   tip:"The Peace Boulevard leads straight here from the Peace Park.",addr:"Ujina, Minami Ward"},
  {cat:"records",tourist:0,lat:34.3975,lng:132.4580,name:"HONDORI ARCADE RECORD SHOPS",
   desc:"The covered Hondori arcade has several second-hand CD and vinyl shops overlooked by tourists. Great for old Japanese jazz and city pop at very low prices.",
   tip:"Dig the back bins. City pop 7-inches especially cheap here.",addr:"Hondori Shopping Arcade, Naka Ward"},
  {cat:"records",tourist:0,lat:34.3970,lng:132.4568,name:"RECORD SHOP MIZO",
   desc:"Hiroshima's most popular record shop per Recoya, and it doubles as a coffee shop. Perfect for a slow afternoon dig with a good cup while you flip through bins. All genres, second-hand focus.",
   tip:"12:00-20:00. Order coffee and take your time.",hours:"12:00-20:00",addr:"Hiroshima city centre"},
  {cat:"records",tourist:0,lat:34.3985,lng:132.4591,name:"STEREO RECORDS",
   desc:"J-pop, hip-hop, rock/indie. One of the later-closing shops in Hiroshima (until 21:00). Good breadth for a smaller city.",
   tip:"11:00-21:00.",hours:"11:00-21:00",addr:"Hiroshima city centre"},
  {cat:"records",tourist:0,lat:34.3960,lng:132.4555,name:"GROVIN RECORD STATION",
   desc:"Massive stock for a regional city: 20,000 LP sheets, 15,000 singles. Jazz, J-music, classical, dance - genuinely all genres. A serious digging operation.",
   tip:"11:00-20:00. The sheer volume means patient digging is rewarded.",hours:"11:00-20:00",addr:"Hiroshima city centre"},
  {cat:"records",tourist:0,lat:34.3980,lng:132.4575,name:"TANZ MUSIC RECORDS",
   desc:"Soul, hip-hop and club/dance with new stock focus. Open late for Hiroshima - great if you want to dig in the evening after the Peace Museum.",
   tip:"13:30-22:30.",hours:"13:30-22:30",addr:"Hiroshima city centre"},
  {cat:"records",tourist:0,lat:34.3965,lng:132.4560,name:"VULGAR TIDE RECORD (大潮レコード)",
   desc:"Described on Recoya as a 'record x secret base.' The kind of shop with a story to tell. Second-hand focus, hours 13:00-19:00. Worth the detour for the vibe alone.",
   tip:"13:00-19:00.",hours:"13:00-19:00",addr:"Hiroshima city centre"},

  {cat:"food",tourist:0,lat:34.3958,lng:132.4566,name:"OKONOMIMURA (25-STALL BUILDING)",hours:"11:00–22:00",price:2,
   desc:"A building with 25 individual okonomiyaki stalls. Hiroshima-style is layered: crepe base, cabbage, noodles, egg. Watch it cook in front of you.",
   tip:"Pick a stall on upper floors — less busy. Add cheese on top.",addr:"5-13 Shintenchi, Naka Ward"},
  {cat:"food",tourist:0,lat:34.3942,lng:132.4502,name:"KAKIFUNE KANAWA (OYSTER BOAT)",hours:"11:30–14:00, 17:00–21:30",price:3,
   desc:"A restaurant boat moored on the Ota River — you eat Hiroshima oysters on a floating vessel. Multiple preparations available.",
   tip:"Lunch is more affordable. Book ahead.",addr:"Ota River mooring, Naka Ward"},
  {cat:"food",tourist:0,lat:34.3933,lng:132.4621,name:"NAGAREKAWA OYSTER STANDING BARS",hours:"17:00–23:00",price:1,
   desc:"Hiroshima produces 60% of Japan's oysters. Tiny standing bars serve them raw, grilled or as oyster ramen for a few hundred yen. Complete locals' territory.",
   tip:"Just point and say 'kaki'. Any bar with a crowd outside at night.",addr:"Nagarekawa district, Naka Ward"},

  // ── SIGHTSEEING
  {cat:"sightseeing",tourist:1,lat:34.3955,lng:132.4530,name:"PEACE MEMORIAL MUSEUM",
   desc:"Essential. One of the most important museums in the world. Documents the August 6 1945 atomic bombing in unflinching detail. Allow 3–4 hours minimum.",
   tip:"Book tickets online — queues can be 90+ minutes without. Audio guide recommended. The personal effects section is the most affecting.",
   hours:"8:30–18:00 (Aug until 19:00)",addr:"1-2 Nakajimacho, Naka Ward, Hiroshima"},
  {cat:"sightseeing",tourist:1,lat:34.3955,lng:132.4533,name:"A-BOMB DOME (GENBAKU DOME)",
   desc:"The preserved shell of the Industrial Promotion Hall — the only structure near the hypocenter to remain standing. UNESCO World Heritage Site. Haunting and unmissable.",
   tip:"Visit at dawn before crowds arrive. The reflection in the Motoyasu River at sunrise is extraordinary.",
   hours:"24hr (exterior)",addr:"1-10 Otemachi, Naka Ward, Hiroshima"},
  {cat:"sightseeing",tourist:1,lat:34.3941,lng:132.4524,name:"PEACE MEMORIAL PARK",
   desc:"The park surrounding the A-Bomb Dome and Peace Memorial Museum. Cherry blossoms in late March are stunning. The Children's Peace Monument has thousands of origami crane garlands.",
   tip:"Walk the entire park early morning. The Flame of Peace has burned continuously since 1964, waiting until all nuclear weapons are eliminated.",
   hours:"24hr",addr:"Nakajimacho, Naka Ward, Hiroshima"},
  {cat:"sightseeing",tourist:1,lat:34.2958,lng:132.3194,name:"MIYAJIMA / ITSUKUSHIMA SHRINE",
   desc:"The floating torii gate at high tide is one of Japan's three most iconic views. Free-roaming deer everywhere on the island. Ropeway up Mt Misen for Seto Inland Sea views.",
   tip:"Check tide tables for the floating gate. First ferry at dawn. Deer are completely wild — respectful distance.",
   hours:"6:30–18:00",addr:"1-1 Miyajimacho, Hatsukaichi, Hiroshima"},
  {cat:"sightseeing",tourist:1,lat:34.4021,lng:132.4597,name:"HIROSHIMA CASTLE",
   desc:"Reconstructed 16th century castle (original destroyed by the atomic bomb). Museum inside covers feudal history of the Chugoku region. Good cherry blossom viewing in the grounds.",
   tip:"¥370 entry. Combine with the Peace Park for a full Hiroshima day.",
   hours:"9:00–18:00 (Oct–Mar until 17:00)",addr:"21-1 Motomachi, Naka Ward, Hiroshima"},
  // ── ONSEN
  {cat:"onsen",tourist:0,lat:34.3958,lng:132.4553,name:"SENTO NAKA (HIROSHIMA)",
   desc:"Hiroshima's most beloved traditional sento near the Peace Park area. Original tiling, old-school atmosphere, very local crowd. A real neighbourhood bath not listed in any tourist guide.",
   tip:"Around ¥460 entry (standard sento price). Bring your own towel or rent one. Go in the evening.",hours:"15:00–23:00",addr:"Naka Ward, Hiroshima"},
  {cat:"onsen",tourist:0,lat:34.3951,lng:132.4530,name:"HIROSHIMA URBAN SAUNA CIRCUIT",
   desc:"Hiroshima has a growing sauna scene around the Hondori area. Look for newer standalone sauna spots that have opened since 2022. The Japan sauna renaissance is nationwide now.",
   tip:"Ask at your hotel or check Sauna Ikitai app for the current best spot near your hotel.",hours:"varies",addr:"Hondori / Naka Ward, Hiroshima"},
  // ── ARCADE
  {cat:"arcade",tourist:0,lat:34.3950,lng:132.4573,name:"TAITO STATION HIROSHIMA",
   desc:"Hiroshima's main Taito arcade. Good rhythm game machines, crane games well-stocked with anime and regional Hiroshima goods. Worth a circuit before or after the Peace Museum.",
   tip:"10:00–23:00. Great for killing an hour in the rain.",hours:"10:00–23:00",addr:"Hondori, Naka Ward, Hiroshima"},
  {cat:"arcade",tourist:0,lat:34.3960,lng:132.4566,name:"GIGO HIROSHIMA",
   desc:"GiGO arcade on the Hondori strip. Multiple floors including rhythm games, fighting games and extensive crane section. Busy with students in the evenings.",
   tip:"Evenings are best for people-watching at the fighting game cabinets.",hours:"10:00–00:00",addr:"Hondori, Naka Ward, Hiroshima"},
  // ── GAME CENTRES
  {cat:"gamecentre",tourist:0,lat:34.3960,lng:132.4575,name:"TAITO STATION HIROSHIMA",
   desc:"Hiroshima's main Taito arcade on the Hondori strip. Rhythm games, crane games stocked with anime and regional goods. Good for killing an hour between Peace Museum visits.",
   tip:"Great for rhythm games between museum visits. The crane section has Hiroshima-regional goods you won't find elsewhere.",
   hours:"10:00–22:00",addr:"Hondori, Naka Ward, Hiroshima"},
  {cat:"gamecentre",tourist:0,lat:34.3951,lng:132.4558,name:"GIGO HIROSHIMA",
   desc:"GiGO arcade on the Hondori strip. Multiple floors including rhythm games, fighting games and an extensive crane game section. Busy with local students in the evenings.",
   tip:"Evenings are best for the atmosphere and watching fighting game competition.",
   hours:"10:00–23:00",addr:"Hondori, Naka Ward, Hiroshima"},
],

west:[
  {cat:"hidden",tourist:0,lat:34.4084,lng:133.2050,name:"ONOMICHI HILLSIDE BACK ALLEYS",
   desc:"Narrow lanes, tiny bars, old temples and views over the Onomichi Channel. Artists and writers have colonised it for decades. Cats literally everywhere.",
   tip:"Take the ropeway or hike up to Senkoji. Cherry blossoms in late March.",addr:"Temple district hillside, Onomichi"},
  {cat:"nature",tourist:0,lat:34.4082,lng:133.2052,name:"ONOMICHI CAT COLONY",
   desc:"Onomichi is famous across Japan for its hill cat colony. Dozens of strays lounge on warm temple stones and follow you through alleys.",
   tip:"Don't rush the cats. Morning is when they're most active.",addr:"Senkoji hillside area, Onomichi"},
  {cat:"hidden",tourist:1,lat:34.5900,lng:133.7740,name:"KURASHIKI BIKAN HISTORICAL QUARTER",
   desc:"⚠ Preserved Edo-era white-walled warehouses along a willow-lined canal. The Ohara Museum inside has a surprising Western art collection (Monet, El Greco).",
   tip:"Go first thing in the morning before tour buses.",addr:"Bikan, Kurashiki City, Okayama"},
  {cat:"hidden",tourist:1,lat:34.8394,lng:134.6939,name:"HIMEJI CASTLE (SHIRASAGIJO)",
   desc:"⚠ UNESCO World Heritage. The White Heron Castle surrounded by cherry blossoms in late March is extraordinary.",
   tip:"Book entry online. Arrive early. Cherry trees inside the grounds are legendary.",addr:"68 Honmachi, Himeji, Hyogo"},
  {cat:"nature",tourist:0,lat:34.8390,lng:134.6920,name:"KOKO-EN GARDEN (HIMEJI)",
   desc:"Nine traditional Edo garden spaces adjacent to Himeji Castle. Koi ponds, bamboo groves. Often nearly empty.",
   tip:"Combination ticket with the castle only a few hundred yen more.",addr:"68 Honmachi, Himeji"},
  {cat:"fashion",tourist:0,lat:34.6921,lng:135.1956,name:"KOBE VINTAGE CIRCUIT (MOTOMACHI)",
   desc:"Kobe has Japan's oldest Western settlement (1868) and its vintage scene reflects it. Some of the best 70s/80s European vintage in Japan, largely overlooked by Tokyo-focused buyers.",
   tip:"Walk west from Motomachi into Kitano. Prices lower than Tokyo for equivalent quality.",addr:"Motomachi / Kitano area, Kobe"},
  {cat:"hidden",tourist:0,lat:34.7025,lng:135.1918,name:"NUNOBIKI FALLS + HERB GARDEN HIKE",
   desc:"10 minutes walk from Shin-Kobe station. Four historically celebrated waterfalls, trail continues to a hilltop herb garden with views over Kobe and Osaka Bay.",
   tip:"Skip the cable car, hike up. Takes 45 minutes.",addr:"Kitano-cho 1, Chuo Ward, Kobe"},
  {cat:"gaming",tourist:0,lat:34.7410,lng:134.1180,name:"BIZEN OSAFUNE SWORD MUSEUM",
   desc:"Japan's most serious sword museum with live swordsmiths forging on the second Sunday of each month. The collection is extraordinary.",
   tip:"CLOSED Mondays. Live smithing only 2nd Sunday monthly.",addr:"Bizen, Okayama Prefecture"},
  {cat:"food",tourist:0,lat:34.4080,lng:133.2041,name:"ONOMICHI RAMEN SHOPS",hours:"11:00–15:00 (until sold out)",price:1,
   desc:"Thin straight noodles in soy-chicken broth with pork back fat floating on top. The most regional dish you'll eat on this stretch.",
   tip:"Open 11am–3pm and close when sold out. Order the half-ramen + gyoza combo.",addr:"Near Onomichi station"},
  {cat:"records",tourist:0,lat:34.4080,lng:133.1979,name:"ONOMICHI RECORDS (尾道レコード)",
   desc:"Located in the Sangenya apartment behind Onomichi Station. Stocks music from the 50s to 70s, new and used. Perfect timing - you will pass right through Onomichi on the EtSetora day.",
   tip:"11:00-19:00, closed Thursdays. The apartment setting gives it a wonderfully hidden feel.",hours:"11:00-19:00, closed Thu",addr:"Sangenya Apartment, behind Onomichi Station"},

    {cat:"records",tourist:0,lat:34.6902,lng:135.1789,name:"HACKLEBERRY (KOBE)",
   desc:"The most popular record shop in Kobe per Recoya, and long-established. Rock, soul and jazz at the core but handles all genres. Known for being genuinely cheap - rare for a shop of this quality.",
   tip:"11:30-20:00. In Motomachi south side under the JR elevated tracks.",hours:"11:30-20:00",addr:"Motomachi south side, Kobe"},
  {cat:"records",tourist:0,lat:34.6895,lng:135.1793,name:"ROCK'N'ROLL AIDS PRODUCTION (KOBE)",
   desc:"Second most popular in Kobe. All-genre niche used store: jazz, prog, punk, metal, noise, house. The breadth is unusual and reflects Kobe's cosmopolitan musical character.",
   tip:"12:00-20:00. Under the JR elevated tracks, Motomachi side.",hours:"12:00-20:00",addr:"Motomachi, Kobe"},
  {cat:"records",tourist:0,lat:34.6899,lng:135.1785,name:"ZIPANG RECORD (KOBE)",
   desc:"Records only, no online sales. Core assortment centred on new wave. Only opens 17:00-22:00 - an evening specialist. Opened 2017, cultivated a dedicated local following.",
   tip:"17:00-22:00 only. Evening record shop - combine with Bar Chiba afterwards.",hours:"17:00-22:00",addr:"Kobe city centre"},
  {cat:"records",tourist:0,lat:34.6905,lng:135.1800,name:"GAPON RECORDS (KOBE)",
   desc:"60s-70s rock and soul, used records only. Classic vintage shop with no frills. Strong on American rock and British Invasion records.",
   tip:"12:30-20:00.",hours:"12:30-20:00",addr:"Motomachi area, Kobe"},
  {cat:"records",tourist:0,lat:34.6892,lng:135.1790,name:"STRADA RECORDS (KOBE)",
   desc:"House, techno and dance classics specialist. This is the Kobe shop for electronic music. Focuses specifically on dance floor-oriented vinyl - techno, house, disco classics.",
   tip:"13:00-19:00, irregular holidays. Check their social media for temporary closures.",hours:"13:00-19:00, irregular",addr:"Motomachi, Kobe"},
  {cat:"records",tourist:0,lat:34.6898,lng:135.1780,name:"FREAKOUT RECORDS (KOBE)",
   desc:"Relocated in 2022 and now more spacious than before. All genres of used records in an easy-browsing layout. One of the more relaxed dig experiences in the Motomachi strip.",
   tip:"11:00-20:00 (irregular days off - check before visiting).",hours:"11:00-20:00, irregular",addr:"Motomachi area, Kobe"},
  {cat:"records",tourist:0,lat:34.6891,lng:135.1796,name:"BAR CHIBA (KOBE)",
   desc:"You can listen to, browse and buy analogue records here - while it doubles as a bar. One of those beautiful hybrid spaces that only exist in Japan. Great for an evening after digging.",
   tip:"20:00-24:00, closed Mondays. A late-night record bar.",hours:"20:00-24:00, closed Mon",addr:"Motomachi, Kobe"},
  {cat:"records",tourist:0,lat:34.6900,lng:135.1802,name:"UNDERGROUND GALLERY KOBE",
   desc:"Jazz, funk, disco, hip-hop and club/dance. Evening-only shop that feels more like an underground salon than a standard record store.",
   tip:"17:00-22:00. Evening specialist - combine with Zipang Record for a late dig.",hours:"17:00-22:00",addr:"Kobe city centre"},
{cat:"food",tourist:0,lat:34.6930,lng:135.1927,name:"STEAKLAND KOBE",hours:"11:30–22:00",price:3,
   desc:"Counter teppanyaki where you watch Kobe beef sizzle on the griddle in front of you. Affordable by Kobe beef standards — lunch sets from ¥3,000.",
   tip:"Lunch set is the value move. The filet over sirloin is the recommendation.",addr:"1-8-2 Kitanagasadori, Chuo Ward, Kobe"},
  {cat:"food",tourist:0,lat:34.6960,lng:135.1922,name:"MOURIYA HONTEN (EST. 1885)",hours:"11:30–21:00",price:3,
   desc:"The original Kobe beef restaurant, established 1885. This is where Kobe beef as a restaurant concept began.",
   tip:"Book ahead for dinner. The lunch sirloin set is genuinely excellent.",addr:"2-1-17 Shimoyamatedori, Chuo Ward, Kobe"},

  // ── SIGHTSEEING
  {cat:"sightseeing",tourist:1,lat:34.8394,lng:134.6939,name:"HIMEJI CASTLE",
   desc:"⚠ UNESCO World Heritage Site. The White Heron Castle is Japan's finest surviving feudal castle — never destroyed or burnt. Surrounded by cherry blossoms in late March, the timing is extraordinary.",
   tip:"Book tickets online. Arrive before 9am. The inner keep climb is steep but the view from the top floor is worth every step.",
   hours:"9:00–17:00 (16:00 last entry)",addr:"68 Honmachi, Himeji, Hyogo"},
  {cat:"sightseeing",tourist:1,lat:34.4086,lng:133.1965,name:"ONOMICHI SENKOJI TEMPLE",
   desc:"Hilltop temple above Onomichi reached by a short ropeway. Panoramic views of the Onomichi Channel and Innoshima Island. The hillside path connects 25 temples through the cat colony.",
   tip:"Take the ropeway up, walk the temple trail down through cat territory. Morning light on the channel is spectacular.",
   hours:"9:00–17:00",addr:"Senkoji Park, Onomichi, Hiroshima"},
  {cat:"sightseeing",tourist:1,lat:34.5952,lng:133.7721,name:"KURASHIKI BIKAN HISTORICAL QUARTER",
   desc:"Preserved Edo-era white-walled warehouses (kura) along a willow-lined canal. The Ohara Museum inside has a surprising Western art collection including Monet, El Greco and Renoir.",
   tip:"Go first thing in the morning before tour buses. Evening canal walks with reflections are also excellent.",
   hours:"varies by attraction",addr:"Bikan, Kurashiki, Okayama"},
  {cat:"sightseeing",tourist:1,lat:34.6652,lng:133.9344,name:"OKAYAMA CASTLE",
   desc:"Known as 'Crow Castle' for its distinctive black exterior — rare in Japan where most castles are white. Adjacent Korakuen garden is rated one of Japan's top three.",
   tip:"Combine with Korakuen garden — combo ticket available. Garden is especially beautiful in cherry blossom season.",
   hours:"9:00–17:30",addr:"2-3-1 Marunouchi, Kita Ward, Okayama"},
  {cat:"sightseeing",tourist:0,lat:34.7000,lng:135.1894,name:"KOBE KITANO IJINKAN",
   desc:"Historic foreign settlement houses (ijinkan) from the Meiji era when Kobe was Japan's main international port. Several preserved residences open to visitors with period furnishings.",
   tip:"Walk the Kitano Ijinkan district — some houses are free to view externally. Combine with the vintage circuit below.",
   hours:"9:00–18:00 (varies by house)",addr:"Kitanocho, Chuo Ward, Kobe"},
  // ── ONSEN
  {cat:"onsen",tourist:1,lat:34.7982,lng:135.2454,name:"ARIMA ONSEN (KOBE)",
   desc:"⚠ One of Japan's three oldest and most celebrated hot spring towns, 30 mins from Kobe. Two distinct spring types: Kinsen (gold spring — iron-rich, orange, said to cure joint pain) and Ginsen (silver spring — radium/carbonic, colourless). Multiple bathhouses scattered through a hillside village.",
   tip:"Kintosen (Kin no Yu) is the main public bath: ¥800, no tattoo policy enforced strictly. Combo day-trip from Kobe — take the express bus from Sannomiya. Worth staying overnight if you can.",hours:"8:00–22:00 (varies by bath)",addr:"Arima, Kita Ward, Kobe"},
  {cat:"onsen",tourist:0,lat:34.6915,lng:135.1933,name:"KOBE PORT SAUNA",
   desc:"City-centre sauna spot in Kobe for a recovery session after the Himeji hike. Newer venue aimed at the sauna-loving generation. Cold plunge, Finnish-style room.",
   tip:"Check current hours — newer venue. Good between Himeji Castle and the beef dinner.",hours:"varies",addr:"Central Kobe"},
  // ── ARCADE
  {cat:"arcade",tourist:0,lat:34.6903,lng:135.1877,name:"ROUND1 KOBE (SANNOMIYA)",
   desc:"Round1's Kobe anchor. Sannomiya station area. Full entertainment package — rhythm games, bowling, billiards, purikura. Good rhythm game machines for a non-Tokyo city.",
   tip:"Open late. Busier Thu–Sun evenings.",hours:"10:00–02:00 wkdays, 10:00–05:00 Fri/Sat",addr:"Sannomiya, Chuo Ward, Kobe"},
],
kyoto:[
  {cat:"rave",tourist:0,lat:35.0110,lng:135.7690,name:"METRO KYOTO",
   desc:"Kyoto's most important underground club since 1995. Small (400 cap), basement, Marutamachi station. Genuinely interesting nights — experimental electronics, occasional jungle and breaks.",
   tip:"Check metro.ne.jp monthly calendar. Cash at door.",addr:"B1F Ent Building, 82 Kawaramachi Marutamachi, Nakagyo"},
  {cat:"rave",tourist:0,lat:35.0112,lng:135.7692,name:"WORLD KYOTO",
   desc:"Larger sibling to Metro. When the right act is on it draws from Osaka and Tokyo. Has hosted Hunee, Job Jobse level selectors.",
   tip:"Combine a World booking with Metro afterparty — same building.",addr:"Ent Building, Kawaramachi Marutamachi, Nakagyo"},
  {cat:"jazz",tourist:0,lat:35.0060,lng:135.7680,name:"JAZZY SPORT KYOTO",
   desc:"4th floor record store and event space. Funk, jazz, world, hip-hop on wax. Known internationally for stocking the most esoteric Japanese jazz outside Tokyo.",
   tip:"Ask about upcoming in-store events. They know who's in town.",addr:"Kawaramachi area, central Kyoto"},
  {cat:"records",tourist:0,lat:35.0240,lng:135.7520,name:"MEDITATIONS KYOTO",
   desc:"Ambient, experimental, noise and left-field electronics — Kyoto's most curated shop for records you didn't know you needed. Stocks things nobody else does.",
   tip:"Open 1pm–7pm, closed Tue and Wed. Very limited hours — plan around them.",
   hours:"13:00–19:00, closed Tue & Wed",
   addr:"Kamigyo Ward, Kyoto"},
  {cat:"records",tourist:0,lat:35.0098,lng:135.7703,name:"JET SET RECORDS KYOTO",
   desc:"The Kyoto flagship — bigger and better-stocked than the Tokyo Shimokitazawa branch. Soul, house, disco, techno, soft rock, Japanese pop. Expert buyers, great for limited-edition Japanese 7-inch and 12-inch vinyl.",
   tip:"Their Japan-exclusive editions are on a separate shelf near the counter. Ask staff about recent Japanese releases.",
   hours:"12:00–20:00",
   addr:"Kawaramachi, Nakagyo Ward, Kyoto"},
  {cat:"records",tourist:0,lat:35.0170,lng:135.7620,name:"WORKSHOP RECORDS (KYOTO)",
   desc:"The most-saved record shop in all of Kyoto on Recoya, with 43 saves. All genres with a unique selection full of music love. Used records, new records, CDs. A serious institution.",
   tip:"12:00-20:00. The breadth of selection is unusual for a shop this size.",hours:"12:00-20:00",addr:"Central Kyoto"},
  {cat:"records",tourist:0,lat:35.0050,lng:135.7710,name:"VIVRANT DISC STORE",
   desc:"Soul, funk, disco, rare groove, jazz, hip-hop and R&B. LPs, 45s and 12-inch records. This is the Kyoto shop if you want a focused black music dig. Boutique selection, properly curated.",
   tip:"12:00-20:00. Closed Thursdays. Call ahead if making a special trip.",hours:"12:00-20:00, closed Thu",addr:"Kyoto city centre"},
  {cat:"records",tourist:0,lat:35.0220,lng:135.7540,name:"100000T ALONETOCO",
   desc:"All second-hand. Old rock, jazz, soul, Latin, reggae, classical, Japanese rock. A wide-ranging digging shop where you genuinely don't know what you'll find. Beloved by locals.",
   tip:"12:00-20:00.",hours:"12:00-20:00",addr:"Kyoto"},
  {cat:"records",tourist:0,lat:35.0190,lng:135.7570,name:"HITOZOKU RECORD (ヒト族レコード)",
   desc:"A treasure trove of world music. 90% used vinyl, 10% CDs. The owner's curation is uniquely global in a city full of specialist shops. Wed-Sun only.",
   tip:"15:00-21:00, Wed-Sun. The world music selection is unlike anywhere else in Kansai.",hours:"15:00-21:00, Wed-Sun",addr:"Kyoto"},
  {cat:"records",tourist:0,lat:35.0100,lng:135.7680,name:"TORADRA RECORD",
   desc:"All-genre used records and CDs, well-regarded in Kyoto. Good for general digging if you want to browse without a genre agenda.",
   tip:"12:00-20:00.",hours:"12:00-20:00",addr:"Central Kyoto"},
  {cat:"records",tourist:0,lat:34.9980,lng:135.7680,name:"PARALLAX RECORDS (KYOTO)",
   desc:"Kyoto's noise and avant-garde specialist. CDs, cassettes and records. For experimental electronics, drone, and boundary-pushing music - unlike any other shop on the trip.",
   tip:"Weekdays 13:00-19:00, weekends 12:00-19:00, closed Mon & Wed. Check their website calendar before visiting.",hours:"Weekdays 13:00-19:00, weekends 12:00-19:00, closed Mon & Wed",addr:"Kyoto"},
  {cat:"records",tourist:0,lat:35.0010,lng:135.7700,name:"HACHI RECORD SHOP AND BAR",
   desc:"Craft beer and records in Gojo - the Kyoto version of a hybrid space. Open until 23:00, making it the best evening record shop in Kyoto. Browse vinyl with a beer in hand.",
   tip:"14:00-23:00. An evening destination - go after dinner.",hours:"14:00-23:00",addr:"Gojo area, Kyoto"},
  {cat:"records",tourist:0,lat:35.0280,lng:135.7530,name:"KYOTO MACHIYA RECORDS",
   desc:"Set inside a traditional Kyoto townhouse (Kyomachiya) built in 1811 during the Edo period. The atmosphere is unlike any other record shop you will visit - ancient tatami, sliding screens, vinyl bins.",
   tip:"11:00-19:00, closed Thu and 1st & 3rd Wed. The building is 200+ years old - take a moment to appreciate where you are.",hours:"11:00-19:00, closed Thu",addr:"Traditional machiya townhouse, Kyoto"},
  // ── TCG (Kyoto)
  {cat:"tcg",tourist:1,lat:34.9986,lng:135.7630,name:"POKÉMON CENTER KYOTO",
   desc:"⚠ Official Pokémon Center inside Takashimaya Times Square on Kyoto's main shopping strip. Stocks Kyoto-exclusive items — Kimono Pikachu keychains, Kyoto-themed promo cards, limited regional merchandise unavailable anywhere else. Smaller than flagship stores but uniquely Kyoto.",
   tip:"The region-exclusive items are the reason to come. Kimono Pikachu and shrine-themed accessories are Kyoto-only. Get there at 10am opening to beat the queue.",
   hours:"10:00–20:00",
   addr:"Takashimaya Times Square 6F, Shijo-Kawaramachi, Shimogyo Ward, Kyoto"},
  {cat:"tcg",tourist:0,lat:34.9928,lng:135.7526,name:"ZAURUSU TCG KYOTO",
   desc:"Small independent card shop on the second floor of an unmarked building in Shimogyo-ku. Exactly the kind of spot serious collectors find and tourists walk straight past. Full stock of Pokémon, Yu-Gi-Oh!, One Piece and Digimon Japanese cards. Buys and sells singles — great for offloading doubles.",
   tip:"Ships internationally. The 2nd floor location means clientele are serious players, not tourists. OCG Yu-Gi-Oh! section is strong. Check their Instagram (@zaurusu.cardshop) for recent stock.",
   hours:"12:00–20:00",
   addr:"684 Tissage Shiokoji 2F, Shimogyo-ku, Kyoto"},
  {cat:"tcg",tourist:0,lat:35.0085,lng:135.7691,name:"TERAMACHI TCG SHOPS (KYOTO)",
   desc:"The Teramachi arcade near Shijo has several TCG shops clustered on upper floors — all far more local-facing than anything in Akihabara. Strong on older Pokémon Japanese sets, Yu-Gi-Oh! OCG singles, Duel Masters. Prices competitive, staff are collectors themselves.",
   tip:"Walk Teramachi arcade from Shijo heading north — multiple shops on upper floors. Much calmer than Akihabara for browsing and talking shop with staff about the OCG meta.",
   hours:"12:00–19:00",
   addr:"Teramachi Shopping Arcade, Nakagyo Ward, Kyoto"},
  {cat:"gaming",tourist:1,lat:34.8878,lng:135.8002,name:"NINTENDO MUSEUM (UJI)",
   desc:"⚠ LOTTERY SYSTEM — book immediately. Based in the original Nintendo playing card factory. Every console they ever made, interactive stations, incredible original artefacts.",
   tip:"Lottery opens monthly. If no ticket, Byodo-in temple and best matcha in Japan are still worth the Uji trip.",addr:"1-1-2 Noda, Uji City"},
  {cat:"gaming",tourist:0,lat:35.0040,lng:135.7680,name:"TERAMACHI ARCADE RETRO GAMES",
   desc:"Several second-hand shops in the covered Teramachi arcade. Good for SFC and PS1 horror titles at city prices — often cheaper than Akihabara.",
   tip:"The covered Teramachi arcade heading north from Shijo has multiple shops. Browse slowly.",addr:"Teramachi Shopping Arcade, Nakagyo Ward"},
  {cat:"fashion",tourist:0,lat:35.0085,lng:135.7688,name:"SANJO/TERAMACHI VINTAGE SHOPS",
   desc:"Vintage and independent fashion stores tourists mostly walk past. Old Japanese selvedge denim, military surplus, obscure Japanese labels.",
   tip:"Go into every unmarked door. Some of the best shops have no signage at all.",addr:"Sanjo / Teramachi, Nakagyo Ward"},
  {cat:"fashion",tourist:0,lat:35.0070,lng:135.7800,name:"FURUMONZEN ANTIQUE ACCESSORIES",
   desc:"Kyoto's antique dealers cluster on Furumonzen Street. Old lacquerware, textile offcuts, vintage craft accessories.",
   tip:"Bargain gently — it's expected. The deeper you walk east, the more specialist.",addr:"Furumonzen, Higashiyama Ward"},
  {cat:"nature",tourist:0,lat:35.0120,lng:135.6762,name:"ARASHIYAMA MONKEY PARK IWATAYAMA",
   desc:"170+ wild Japanese macaque monkeys on a hillside above Arashiyama. You climb UP to them. Feed them through wire inside the observation hut.",
   tip:"Morning is best. Very few tourists reach here vs the bamboo grove.",addr:"8 Genrokuzanamachi, Nishikyo Ward"},
  {cat:"nature",tourist:0,lat:35.1133,lng:135.7691,name:"KURAMA ONSEN + CEDAR FOREST HIKE",
   desc:"45 min north on the Eizan Railway. Dense cedar forest, dramatic mountain scenery, Kurama-dera temple.",
   tip:"Hike DOWN from Kurama to Kibune Shrine through the forest — 1.5 hours, spectacular.",addr:"Kurama, Sakyo Ward (Eizan Railway)"},
  {cat:"nature",tourist:1,lat:34.9671,lng:135.7727,name:"FUSHIMI INARI (PRE-DAWN)",
   desc:"⚠ Arrive before 6am and you'll have thousands of torii gates almost to yourself. Full summit climb (2–3hrs). Eerie and extraordinary.",
   tip:"Bring a head torch. For a horror game fan, this place at 5am is exactly the vibe. Go all the way to the summit.",addr:"68 Fukakusa Yabunouchicho, Fushimi Ward"},
  {cat:"nature",tourist:0,lat:34.3677,lng:135.8580,name:"YOSHINO MOUNTAIN CHERRY BLOSSOMS",
   desc:"30,000+ cherry trees of 200 varieties covering an entire mountain. One of Japan's most spectacular sights.",
   tip:"Take Kintetsu from Nara to Yoshino. Bring food — restaurants get overwhelmed.",addr:"Yoshino-cho, Yoshino District, Nara Prefecture"},
  {cat:"hidden",tourist:0,lat:35.0513,lng:135.7528,name:"IMAMIYA SHRINE + WORLD'S OLDEST RESTAURANTS",
   desc:"Heian-era shrine in north Kyoto. Opposite: Ichiwa (est. 1000 AD) and Kasiya (est. 1637). Aburi mochi in the garden.",
   tip:"Order the full set and eat outside. You're sitting where people have been eating for a thousand years.",addr:"21 Murasakino Imamiyacho, Kita Ward"},
  {cat:"hidden",tourist:0,lat:35.0048,lng:135.7666,name:"NISHIKI MARKET AT 8AM",
   desc:"Packed with tourists by 10am. At 8am it's local. Fresh tofu, pickled vegetables, dried fish, unusual snacks.",
   tip:"Most food stalls open around 8–9am. Best spots in the narrower eastern section.",addr:"Nishiki Market, Nakagyo Ward"},
  {cat:"nature",tourist:0,lat:34.6828,lng:135.8453,name:"NARA PARK: SIKA DEER AT DAWN",
   desc:"1,300 free-roaming sacred sika deer. Some have learned to bow before taking crackers. Early morning near Kasuga Taisha is calm and atmospheric.",
   tip:"The forest edge near Kasuga Taisha has the calmest deer.",addr:"Nara Park, Nara City"},
  {cat:"hidden",tourist:0,lat:34.6788,lng:135.8432,name:"NARAMACHI MERCHANT DISTRICT",
   desc:"Old machiya townhouse district below Kofukuji Temple. Textile shops, independent cafes, craft studios.",
   tip:"Spend the afternoon here after deer-watching.",addr:"Naramachi, Nara City"},
  {cat:"hidden",tourist:0,lat:34.8973,lng:135.8098,name:"UTORO PEACE MUSEUM (UJI)",
   desc:"Small museum commemorating Korean labourers brought during WWII to build a nearby airport. Completely off the tourist map. Moving, carefully curated.",
   tip:"Request English audio guide. Combine with Nintendo Museum visit in Uji.",addr:"Uji City, Kyoto Prefecture"},
  {cat:"food",tourist:0,lat:34.9651,lng:135.7738,name:"HIRANOYA (130YR RESTAURANT NEAR FUSHIMI INARI)",hours:"11:00–20:00, closed Wed",price:2,
   desc:"130-year-old restaurant a few minutes from Fushimi Inari. Traditional Kyoto cuisine in a historic building. Perfect post-dawn hike breakfast.",
   tip:"The set lunches start at a very reasonable price for the quality.",addr:"Near Fushimi Inari-taisha, Fushimi Ward"},
  {cat:"food",tourist:0,lat:35.0096,lng:135.7685,name:"MENBAKAICHIDAI (FIRE RAMEN)",hours:"11:30–14:30, 18:00–20:30, closed Tue",price:2,
   desc:"The chef pours flaming oil onto your ramen bowl tableside. Only 6 seats — theatrical, but the ramen itself is genuinely excellent.",
   tip:"Book online well in advance. Don't wear anything you love.",addr:"Kawaramachi area, Nakagyo Ward"},
  {cat:"food",tourist:0,lat:35.0049,lng:135.7762,name:"IZUJU (PRESSED SUSHI SINCE 1781)",hours:"11:00–21:00, closed Wed",price:3,
   desc:"Pressed mackerel sushi (sabazushi) since 1781. Made by hand daily — layers of marinated mackerel pressed onto rice, wrapped in kelp.",
   tip:"The takeaway box is iconic. Very local — mostly older Kyoto residents.",addr:"Gion, Higashiyama Ward"},
  {cat:"food",tourist:0,lat:35.0044,lng:135.7651,name:"NISHIKI MARKET FOOD STALLS",hours:"8:00–18:00",price:1,
   desc:"Go at 8am for the local experience. Fresh yuba, grilled skewers, sesame dango, pickled vegetables, tamagoyaki.",
   tip:"The stalls at the east end are most authentic. Tofu donut stall sells out by 10am.",addr:"Nishiki Market, Nakagyo Ward"},

  // ── SIGHTSEEING
  {cat:"sightseeing",tourist:1,lat:34.9671,lng:135.7727,name:"FUSHIMI INARI TAISHA",
   desc:"Thousands of vermilion torii gates winding up a forested mountain. One of Japan's most photographed sites — but at 5am before dawn, it's eerie and extraordinary.",
   tip:"Arrive before 6am to avoid crowds. Full summit hike 2–3 hours. Bring a head torch. This IS worth the 4:30am alarm.",
   hours:"24hr",addr:"68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto"},
  {cat:"sightseeing",tourist:1,lat:35.0394,lng:135.7292,name:"KINKAKUJI GOLDEN PAVILION",
   desc:"The golden temple reflected in Kyokochi Mirror Pond. One of Japan's most iconic images. The garden surrounding it is meticulously maintained.",
   tip:"Arrive at opening (9am) for shortest queues. Combine with Ryoanji rock garden 10 min walk away.",
   hours:"9:00–17:00",addr:"1 Kinkakujicho, Kita Ward, Kyoto"},
  {cat:"sightseeing",tourist:1,lat:35.0170,lng:135.6720,name:"ARASHIYAMA BAMBOO GROVE",
   desc:"Dense bamboo grove with towering stalks blocking the sky. The light filtering through the canopy in early morning is extraordinary. Combine with Tenryuji garden and cormorant fishing bridge.",
   tip:"Go before 7am. After that it's crowded. The path takes 15 minutes end to end — do it twice.",
   hours:"24hr (best before 7am)",addr:"Sagaogurayama, Ukyo Ward, Kyoto"},
  {cat:"sightseeing",tourist:1,lat:35.0037,lng:135.7757,name:"GION DISTRICT",
   desc:"Kyoto's preserved geisha district. Stone-paved Hanamikoji street with machiya townhouses, ochaya (tea houses), and Yasaka Shrine at the southern end. Evening is best for atmosphere.",
   tip:"Geishas (actually maiko) emerge around 5–6pm heading to engagements. Do not photograph them without permission.",
   hours:"24hr",addr:"Gion, Higashiyama Ward, Kyoto"},
  {cat:"sightseeing",tourist:0,lat:35.0050,lng:135.7656,name:"NISHIKI MARKET",
   desc:"A narrow 400-metre covered market running through central Kyoto — called 'Kyoto's Kitchen'. Fresh yuba, grilled skewers, sesame dango, pickled vegetables, tamagoyaki.",
   tip:"Best before 10am when it's locals only. The tofu donut stall sells out early. The eastern section is most authentic.",
   hours:"8:00–18:00",addr:"Nishiki Market, Nakagyo Ward, Kyoto"},
  {cat:"sightseeing",tourist:0,lat:35.0270,lng:135.7932,name:"PHILOSOPHER'S PATH",
   desc:"A canal-side walking path lined with hundreds of cherry trees. One of Japan's most celebrated cherry blossom walks, named after philosopher Nishida Kitaro who walked it daily.",
   tip:"Peak bloom early April — timing is perfect. Walk the full 2km from Ginkakuji south to Nanzenji.",
   hours:"24hr",addr:"Philosopher's Path, Sakyo Ward, Kyoto"},
  // ── NARA sightseeing
  {cat:"sightseeing",tourist:1,lat:34.6888,lng:135.8398,name:"TODAI-JI TEMPLE",
   desc:"Japan's largest wooden building, containing the world's largest bronze Buddha (15 metres, 500 tons). Over 1,200 free-roaming sacred deer in the surrounding park.",
   tip:"¥600 entry. Go at dawn before school trips arrive. The deer actually bow when they want crackers.",
   hours:"7:30–17:30 (seasonal variation)",addr:"406-1 Zoshicho, Nara"},
  {cat:"sightseeing",tourist:1,lat:34.6813,lng:135.8449,name:"KASUGA TAISHA",
   desc:"Ancient Shinto shrine at the foot of Mt Mikasa. Lantern-lined approach paths through deer-filled forest. 3,000 bronze and stone lanterns lit at festival times.",
   tip:"Inner garden (¥500 extra) has ancient wisteria. Morning mist in the cedar forest path is beautiful.",
   hours:"6:00–18:00",addr:"160 Kasuganocho, Nara"},
  // ── UJI sightseeing
  {cat:"sightseeing",tourist:1,lat:34.8891,lng:135.8076,name:"BYODOIN TEMPLE PHOENIX HALL",
   desc:"11th century temple pavilion — the image on Japan's 10-yen coin. Reflected perfectly in the pond in front. One of the most graceful buildings in Japan, a masterwork of Heian architecture.",
   tip:"¥600 entry. Phoenix Hall interior requires a separate timed ticket (¥300) — book on arrival at the desk.",
   hours:"8:30–17:30",addr:"116 Ujirengehuji, Uji City, Kyoto Pref."},
  {cat:"sightseeing",tourist:1,lat:34.9031,lng:135.7987,name:"NINTENDO MUSEUM (UJI)",
   desc:"⚠ BOOK TICKETS IN ADVANCE via lottery. Based in the original Nintendo playing card factory in Uji. Every console they ever made, interactive stations, incredible original artefacts from 1889 to present.",
   tip:"Lottery opens monthly — book immediately at museum.nintendo.com. If no ticket, Byodoin and best matcha in Japan are still worth the Uji trip.",
   hours:"10:00–18:00, closed Tue",addr:"1-1-2 Noda, Uji City, Kyoto Pref."},
  // ── ONSEN
  {cat:"onsen",tourist:0,lat:35.0358,lng:135.7280,name:"FUNAOKA ONSEN (千年湯)",
   desc:"Kyoto's most beloved traditional sento, operating continuously since the 10th century. Extraordinary Meiji-era interior: ornate carved wood, mosaic tiles depicting myths and battles, painted murals. The building alone is worth the trip. Multiple baths inside including a cold bath, electric bath and medicinal herbal bath.",
   tip:"Open 3pm–1am, closed Mondays. ¥490 entry — genuinely one of the great experiences of Kyoto for that price. In Kinkakuji/Kitaoji area.",hours:"15:00–01:00, closed Mon",addr:"82-1 Murasakino-funaokachō, Kita Ward, Kyoto"},
  {cat:"onsen",tourist:0,lat:35.1148,lng:135.7750,name:"KURAMA ONSEN",
   desc:"The tattoo-friendly onsen in the cedar forest north of Kyoto. Open-air bath surrounded by ancient Japanese cedar trees. Two baths: outdoor露天風呂 (open air) and indoor. The forest walk from Kurama station is part of the experience.",
   tip:"¥1,100 outdoor only, ¥2,500 full access. Tattoos PERMITTED — confirmed. 30 mins north of Kyoto on Eizan Railway.",hours:"10:00–21:00 (closed 2nd & 4th Tue)",addr:"520 Kurama Honmachi, Sakyo Ward, Kyoto"},
  {cat:"onsen",tourist:0,lat:35.0030,lng:135.7690,name:"GOKO-YU (五香湯)",
   desc:"Classic neighbourhood sento near Gion. Low-key, frequented by locals who live nearby. ¥490, simple facilities, but real Kyoto public bath culture at its most authentic.",
   tip:"Around 3pm–midnight. The kind of bath tourists almost never find.",hours:"15:00–00:00",addr:"Higashiyama Ward, Kyoto"},
  {cat:"onsen",tourist:0,lat:35.0063,lng:135.7654,name:"SAUNA HAKUSHIN (KYOTO)",
   desc:"One of Kyoto's most talked-about contemporary sauna spots. Finnish-style dry sauna with proper löyly (steam), cold plunge, and a relaxation lounge. Opened 2021 and immediately became a favourite of Kyoto's design and culture crowd.",
   tip:"Reservations often required — book via their website. Limited capacity keeps it quality over quantity.",hours:"9:00–23:00",addr:"Central Kyoto"},
  // ── ARCADE
  {cat:"arcade",tourist:0,lat:35.0052,lng:135.7681,name:"ROUND1 KYOTO (KAWARAMACHI)",
   desc:"Round1's Kyoto location on the Shijo-Kawaramachi entertainment strip. Multiple floors of rhythm games, prizes, sports games. The rhythm game section has current cabinets.",
   tip:"Ground floor to find the card game machines if you want to mix the TCG hunting with arcade time.",hours:"10:00–02:00",addr:"Shijo-Kawaramachi, Shimogyo Ward, Kyoto"},
  {cat:"arcade",tourist:0,lat:35.0048,lng:135.7693,name:"TAITO STATION KYOTO",
   desc:"Taito's Kyoto arcade. Good crane game selection stocked with Kyoto-themed merchandise and anime goods. Rhythm games functional. Worth a circuit before the evening bar hop.",
   tip:"10:00–23:00.",hours:"10:00–23:00",addr:"Shijo area, Shimogyo Ward, Kyoto"},
  // ── GAME CENTRES
  {cat:"gamecentre",tourist:0,lat:35.0046,lng:135.7691,name:"TAITO STATION KYOTO",
   desc:"Kyoto's Taito arcade near Kawaramachi. Crane games stocked with Kyoto-themed merchandise and anime goods, rhythm games, medal games. Good for an hour between record shops.",
   tip:"10:00–23:00. Worth a circuit before the Gion evening wander.",
   hours:"10:00–23:00",addr:"Shijo-Kawaramachi, Shimogyo Ward, Kyoto"},
  {cat:"gamecentre",tourist:0,lat:35.0041,lng:135.7685,name:"ROUND1 KYOTO KAWARAMACHI",
   desc:"Round1's Kyoto location on the Shijo-Kawaramachi entertainment strip. Multiple floors of rhythm games, prize games, sports simulators. The rhythm game section has current cabinets.",
   tip:"Ground floor has card game machines if you want to mix TCG hunting with arcade time.",
   hours:"10:00–02:00",addr:"Shijo-Kawaramachi, Shimogyo Ward, Kyoto"},
],
nagoya:[
  {cat:"hidden",tourist:1,lat:35.1830,lng:137.0880,name:"GHIBLI PARK",
   desc:"⚠ Requires booking 3 months ahead. Not a theme park — a walk-through immersive world. Beautifully designed.",
   tip:"Book Grand Warehouse + Dondoko Forest if possible. Walk slowly.",addr:"Expo 2005 Aichi Commemorative Park, Nagakute City"},
  {cat:"hidden",tourist:0,lat:35.1545,lng:136.9520,name:"KAKUOZAN CREATIVE DISTRICT",
   desc:"Nagoya's artist neighbourhood. Independent coffee shops, second-hand bookstores, small galleries, vintage shops. No tourists.",
   tip:"Walk from Kakuozan station west through the hilly residential streets.",addr:"Kakuozan, Chikusa Ward, Nagoya"},
  {cat:"gaming",tourist:0,lat:35.1680,lng:136.9120,name:"NAGOYA RETRO GAME SHOPS (OTSU AREA)",
   desc:"Nagoya's version of Den Den Town near Otsu/Sakae. Specialist retro shops with strong PC-88 and early console collections. Much less tourist-facing than Akihabara.",
   tip:"Ask specifically about PC-98 horror games — Nagoya collectors have deep stock.",addr:"Otsu / Sakae area, Naka Ward, Nagoya"},
  {cat:"hidden",tourist:0,lat:35.1278,lng:136.9225,name:"ATSUTA JINGU + ANCIENT FOREST",
   desc:"One of Japan's most important Shinto shrines — holds the legendary Kusanagi sword. Ancient cedar and cypress forest surrounds it. Almost entirely overlooked by foreign tourists.",
   tip:"Walk the full forest perimeter late afternoon. You'll likely be alone.",addr:"1-1-1 Jingu, Atsuta Ward, Nagoya"},
  {cat:"nature",tourist:0,lat:35.1548,lng:136.9527,name:"HIGASHIYAMA ZOO + BOTANICAL GARDEN",
   desc:"One of Japan's best zoos. Home to koalas. Botanical garden has outstanding spring blossom.",
   tip:"Combined ticket for zoo + garden. Go on a weekday morning.",addr:"Higashiyama, Chikusa Ward, Nagoya"},
  {cat:"food",tourist:0,lat:35.1660,lng:136.9046,name:"YABATON (MISO KATSU SINCE 1947)",hours:"11:00–21:00",price:2,
   desc:"The original Nagoya miso katsu restaurant since 1947. Tonkatsu drenched in Nagoya's distinctive red miso (hatcho miso) sauce.",
   tip:"The Yabacho location is the original. Order the Busho cutlet set.",addr:"3-6-18 Yabacho, Naka Ward, Nagoya"},
  {cat:"food",tourist:0,lat:35.1680,lng:136.9060,name:"KOMEDA COFFEE (NAGOYA MORNING CULTURE)",hours:"7:00–23:00",price:1,
   desc:"Nagoya's coffee institution. Morning service: order a coffee and automatically receive a massive free slab of toast. Nagoyans start every day here.",
   tip:"Morning set runs until 11am. Order a coffee, toast arrives automatically.",addr:"Multiple locations — Sakae area, Naka Ward"},
  {cat:"food",tourist:0,lat:35.1650,lng:136.9030,name:"YAMAZAN (MISO NIKOMI UDON)",hours:"11:30–14:30, 17:30–21:00, closed Mon",price:2,
   desc:"Miso nikomi udon — thick white udon simmered in hatcho miso broth in a clay pot. Comes to the table still boiling.",
   tip:"The broth is very intense. Let it sit 2 minutes. Add the raw egg halfway through.",addr:"Sakae area, Naka Ward, Nagoya"},
],

fuji:[
  {cat:"nature",tourist:1,lat:35.4934,lng:138.7765,name:"CHUREITO PAGODA + FUJI VIEW",
   desc:"⚠ Spectacularly beautiful — cherry blossoms, red pagoda, Fuji. Go before 6am for fewer crowds.",
   tip:"Check weather the night before. Set alarm for 4:30am.",addr:"Arakurayama Sengen Park, Fujiyoshida City"},
  {cat:"nature",tourist:0,lat:35.5098,lng:138.6360,name:"LAKE SAIKO + NARUSAWA ICE CAVE",
   desc:"Quieter than Kawaguchi with arguably better Fuji views. The Narusawa Ice Cave is an ancient lava tube staying at 0°C year-round — formed by Fuji's last eruption in 864 AD.",
   tip:"Rent a bike from Lake Kawaguchi and cycle west.",addr:"Near Narusawa Village, Yamanashi"},
  {cat:"nature",tourist:0,lat:35.4762,lng:138.6250,name:"AOKIGAHARA FOREST",
   desc:"Ancient forest at Fuji's northern base. Dense, atmospheric, alien terrain of ancient lava fields. Magnetic compass anomalies are measurably real here.",
   tip:"Marked trails only during daytime. Bring a compass — genuinely interesting to watch it behave strangely.",addr:"Narusawa, Minamitsuru District, Yamanashi"},
  {cat:"nature",tourist:0,lat:35.5120,lng:138.6080,name:"WESTERN LAKES CYCLING CIRCUIT",
   desc:"Rent a bike and explore quieter Saiko, Motosu and Shoji lakes. Spring wildlife: kingfishers, egrets, mountain birds.",
   tip:"Budget a full day. Motosu and Shoji are significantly less visited.",addr:"Bike rentals near Lake Kawaguchi station"},
  {cat:"hidden",tourist:1,lat:35.4829,lng:138.7779,name:"FUJI-Q HIGHLAND HORROR",
   desc:"⚠ Has a dedicated full-scale haunted hospital walkthrough alongside extreme coasters. For a horror game fan the scale is impressive.",
   tip:"Express Pass essential — buy online. Queues without it are 2 hours+.",addr:"5-6-1 Shin-Nishihara, Fujiyoshida City"},
  {cat:"food",tourist:0,lat:35.5065,lng:138.7612,name:"HOTO FUDO (LOCAL FUJI DISH)",hours:"11:00–20:00",price:2,
   desc:"Hoto noodles — flat wide handmade noodles with pumpkin, mountain vegetables, pork and mushrooms in thick miso broth. The definitive Yamanashi dish.",
   tip:"Order the kabocha (pumpkin) hoto. Direct Fuji views from the cave-themed restaurant.",addr:"Near Lake Kawaguchi, Fujikawaguchiko"},
  {cat:"food",tourist:0,lat:35.5133,lng:138.7515,name:"KAWAGUCHIKO SOBA SHOPS",hours:"11:00–17:00",price:2,
   desc:"The Fuji Five Lakes region has excellent buckwheat soba. Several small shops near the lakefront serve cold or hot soba with mountain vegetable tempura.",
   tip:"Yamadaya near the lake is consistently the best. Order zaru (cold) soba in spring.",addr:"Lakefront area, Kawaguchiko"},

  // ── ONSEN
  {cat:"onsen",tourist:0,lat:35.5169,lng:138.7467,name:"TSUBAKI NO YU (KAWAGUCHIKO)",
   desc:"Public bath right in Kawaguchiko town. Simple, local, very affordable. Mt Fuji-themed tile murals inside. The place locals actually use rather than the tourist resort onsens.",
   tip:"¥420 entry. Bring your own towel. Open 10:00–21:00. Go at sunset for the best Mt Fuji reflections on your walk there.",hours:"10:00–21:00",addr:"Kawaguchiko, Fujikawaguchiko, Yamanashi"},
  {cat:"onsen",tourist:1,lat:35.2330,lng:139.0990,name:"HAKONE KOWAKIEN YUNESSUN",
   desc:"⚠ The tattoo-friendly onsen resort in Hakone. Multiple themed outdoor pools including wine, sake, coffee, and green tea baths. Separate adults-only Mori no Yu section is more traditional and quieter.",
   tip:"TATTOOS PERMITTED throughout. Day access ¥1,600 (pools) + ¥1,100 (Mori no Yu). Combine with the Hakone open air museum.",hours:"10:00–18:00",addr:"1297 Ninotaira, Hakone, Ashigarashimo District"},
  {cat:"onsen",tourist:0,lat:35.2315,lng:139.0970,name:"TENZAN TOHJI-KYO (HAKONE)",
   desc:"A step above Yunessun in quality and atmosphere. Riverside open-air baths in a forest setting. Multiple temperature pools. Tattoo policy is more relaxed than average — check current policy on your visit date.",
   tip:"¥1,300 entry. Smaller, quieter and more beautiful than Yunessun. 10 mins by taxi from Hakone-Yumoto station.",hours:"9:00–22:00",addr:"208 Yumoto, Hakone, Ashigarashimo District"},
],
tokyo:[
  // ── RAVES
  {cat:"rave",tourist:0,lat:35.6650,lng:139.7262,name:"VENT (OMOTESANDO)",
   desc:"No sign outside. Side street near Omotesando. One of Asia's best sound systems. Serious underground: techno, house, regularly books UK-influenced selectors.",
   tip:"Follow @vent_tokyo on LINE for events. Arrive after midnight. Bring passport for ID.",addr:"B2F 5-3-18 Minami-Aoyama, Minato Ward"},
  {cat:"rave",tourist:0,lat:35.6580,lng:139.6953,name:"CONTACT (SHIBUYA)",
   desc:"Raw concrete basement under Shibuya. Proper techno philosophy — serious selectors, no bottle service. Has hosted Ricardo Villalobos, Surgeon.",
   tip:"No photos. Cash only. Last train midnight — plan to stay until 5am first train.",addr:"B2F 2-10-12 Dogenzaka, Shibuya"},
  {cat:"rave",tourist:0,lat:35.6622,lng:139.6973,name:"WOMB (SHIBUYA)",
   desc:"Four floors, Asia's largest mirror ball. Has hosted jungle, breakbeat and drum & bass nights. Capacity 1000+ but still feels underground on the right night.",
   tip:"Check calendar specifically for UK-style nights. Main floor is where serious music happens.",addr:"2-16 Maruyamacho, Shibuya Ward"},
  {cat:"rave",tourist:0,lat:35.6941,lng:139.7035,name:"OHJO (KABUKICHO)",
   desc:"Three floors, one of Asia's most talked-about venues 2025. Hosted Layton Giordani, Radio Slave, 999999999. Steps from Golden Gai.",
   tip:"Top floor often the most interesting. Check RA for listings.",addr:"Kabukicho, Shinjuku Ward"},
  {cat:"rave",tourist:0,lat:35.6980,lng:139.7730,name:"MOGRA (AKIHABARA)",
   desc:"Akihabara's legendary club. DJs spin anime OSTs, game soundtracks, J-pop edits. Not ironic — everyone here genuinely loves this music. For a gaming/music fan: unmissable.",
   tip:"Check website for themed nights — some focus on 90s anime OSTs, others on horror game soundtracks.",addr:"2F 1-7 Sotokanda, Chiyoda Ward"},
  // ── JAZZ
  {cat:"jazz",tourist:0,lat:35.6898,lng:139.6985,name:"SHINJUKU PIT INN",
   desc:"Underground jazz club since 1966. Two shows daily. Incredibly up-close — musicians at sweat-touching distance. One of the world's great small jazz rooms.",
   tip:"Afternoon shows (3pm) are a bargain. Book ahead for weekends.",addr:"B1 Accord Building, 2-12-4 Shinjuku"},
  {cat:"jazz",tourist:0,lat:35.6617,lng:139.6676,name:"LADY JANE (SHIMOKITAZAWA)",
   desc:"Founded 1975. Jazz kissaten (vinyl listening bar). Owner adjusts the pitch on each record he plays. Artists, directors and writers are the regulars.",
   tip:"Just order a whisky and listen. Don't talk unless the owner initiates.",addr:"Shimokitazawa, Setagaya Ward"},
  {cat:"jazz",tourist:0,lat:35.6650,lng:139.7262,name:"BODY & SOUL (MINAMI-AOYAMA)",
   desc:"One of Tokyo's most historically important jazz clubs. Every serious Japanese and visiting musician has played here. Live performance nightly.",
   tip:"Reservations recommended for weekend shows.",addr:"6-13-9 Minami-Aoyama, Minato Ward"},
  {cat:"jazz",tourist:0,lat:35.6580,lng:139.6953,name:"CLASSICS NIGHT @ SOUND MUSEUM VISION",
   desc:"Monthly old-school hip-hop vinyl night by DJ Southpaw Chop. Old school hip-hop on 45s and 12-inch. The DJ Koco-style event you came to Tokyo to find.",
   tip:"Follow Southpaw Chop on Instagram for exact monthly dates.",addr:"Sound Museum Vision, 2-10-7 Dogenzaka, Shibuya"},
  {cat:"jazz",tourist:0,lat:35.7050,lng:139.6494,name:"KOENJI: JIROKICHI + 20000 DEN-ATSU",
   desc:"Koenji's underground live venues. Jirokichi for jazz/blues. 20000 Den-Atsu is one of Tokyo's most bizarre experimental live venues.",
   tip:"Spend the afternoon thrifting in Koenji then hit a show in the evening.",addr:"Koenji, Suginami Ward"},
  // ── RECORDS
  {cat:"records",tourist:0,lat:35.6611,lng:139.6678,name:"DISC UNION SHIMOKITAZAWA",
   desc:"Multiple floors by genre. Best city pop and Japanese jazz floor in Tokyo. Where locals come. Fair prices, encyclopaedic staff.",
   tip:"The city pop floor is up one flight. Ask staff about recent arrivals.",addr:"Shimokitazawa, Setagaya Ward"},
  {cat:"records",tourist:0,lat:35.6614,lng:139.6675,name:"JET SET RECORDS (SHIMOKITAZAWA)",
   desc:"Strong electronic music — house, techno, UK styles. They specifically import UK vinyl. The shop for breakbeat, jungle, and UK bass music 12-inches.",
   tip:"Ask for their recommendation list for new Japanese electronic releases.",addr:"Shimokitazawa, Setagaya Ward"},
  {cat:"records",tourist:0,lat:35.6612,lng:139.6672,name:"CITY COUNTRY CITY (SHIMOKITAZAWA)",
   desc:"Record shop plus café owned by musician Keiichi Sokabe. More records than the space can handle. Every single record displayed with a handwritten note describing it.",
   tip:"Order coffee and stay. In-store selections are extraordinary curation. Note: 4th floor of an old office building.",addr:"Shimokitazawa, Setagaya Ward"},
  {cat:"records",tourist:0,lat:35.6618,lng:139.6678,name:"FLASH DISC RANCH (SHIMOKITAZAWA)",
   desc:"Vintage speakers on the walls, murals, ¥100 bins, general characterful chaos. Most genre-agnostic record shop in Tokyo. Dig for an hour and find something magical.",
   tip:"The ¥100 bins are not full of garbage. Dig them thoroughly. Three discs for ¥2,000 box is great for classic rock.",addr:"2F, Shimokitazawa south side, Setagaya Ward"},
  {cat:"records",tourist:0,lat:35.6616,lng:139.6671,name:"NOAH LEWIS RECORDS (SHIMOKITAZAWA)",
   desc:"Tiny slice of heaven for serious vinyl fiends — tucked away on the second floor of a small building right next to Shimokitazawa Station. Curated, intimate, personal.",
   tip:"Small shop — you'll likely have direct conversations with the owner about records.",addr:"2F near Shimokitazawa Station, Setagaya Ward"},
  {cat:"records",tourist:0,lat:35.6633,lng:139.6762,name:"ELLA RECORDS (YOYOGI-UEHARA)",
   desc:"Between Hatagaya and Yoyogi-Uehara. Feels like your coolest friend's personal collection. Listening stations by the windows let you test purchases. Has an appointment-only vintage showroom in Shimokitazawa.",
   tip:"The listening station by the window is the best seat in any record shop in Tokyo.",addr:"Yoyogi-Uehara, Shibuya Ward"},
  {cat:"records",tourist:0,lat:35.6711,lng:139.7032,name:"BIG LOVE RECORDS (HARAJUKU)",
   desc:"Serious indie and underground imports. Deals exclusively in new vinyl — garage rock, indie, noise. Has craft IPA on tap but you must buy a record first before accessing the bar space.",
   tip:"Ask about recent arrivals from UK and Japanese indie labels. The bar rule is real — buy something first.",addr:"Harajuku, Shibuya Ward"},
  {cat:"records",tourist:0,lat:35.6580,lng:139.6992,name:"TECHNIQUE RECORDS (SHIBUYA)",
   desc:"Underground electronic specialist. The Tokyo shop for techno, jungle, breakbeat, UK bass music imports. Staff actually know this music.",
   tip:"Ask specifically about jungle and breakbeat hardcore sections — they keep older stock.",addr:"Shibuya area, Tokyo"},
  {cat:"records",tourist:0,lat:35.6940,lng:139.7722,name:"RARE ITEM STUDIO (KANDA)",
   desc:"80s/90s retro Japanese vinyl — city pop LPs, Japanese new wave, obscure funk. AND retro game soundtracks on vinyl. Occasionally stocks Konami/horror game OSTs.",
   tip:"Japanese horror game OST vinyl is becoming collectable — ask what they have in stock.",addr:"Kanda area, Chiyoda Ward"},
  {cat:"records",tourist:0,lat:35.6614,lng:139.6680,name:"RECORD STATION (SHIMOKITAZAWA)",
   desc:"City pop, hip-hop, jazz, soul, disco, underground hip-hop and G-rap. Specifically called out as the Shimokitazawa shop for city pop crate digging. Also stocks Seoul disco and underground US rap.",
   tip:"13:00-20:00. The city pop section is why you came.",hours:"13:00-20:00",addr:"Shimokitazawa, Setagaya Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.6609,lng:139.6669,name:"ELLA WAREHOUSE (SHIMOKITAZAWA)",
   desc:"12-inch ONLY record store. Funk, disco, hip-hop and club/dance. If you DJ or collect 12-inch dance music this shop is built for you. Reopened November 2022.",
   tip:"13:00-20:00, closed Mon & Tue. Entirely 12-inch - the most focused format shop on the trip.",hours:"13:00-20:00, closed Mon & Tue",addr:"Shimokitazawa, Setagaya Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.6617,lng:139.6677,name:"DISK UNION CLUB MUSIC (SHIMOKITAZAWA)",
   desc:"The dedicated club music floor of the Disk Union empire. Hip-hop, dance, club, electronic music. Separate location from the main Shimokitazawa store - entirely club-focused.",
   tip:"11:30-21:00. Distinct from the main Disk Union - go to both.",hours:"11:30-21:00",addr:"Shimokitazawa, Setagaya Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.6616,lng:139.6674,name:"JAZZY SPORT SHIMOKITAZAWA",
   desc:"Hip-hop, club/dance, jazz records plus a studio space. The Tokyo arm of the Jazzy Sport label. International reputation for hip-hop and jazz vinyl curation.",
   tip:"14:00-20:00.",hours:"14:00-20:00",addr:"Shimokitazawa, Setagaya Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.6607,lng:139.6681,name:"CHILLPHY RECORDS (SHIMOKITAZAWA)",
   desc:"New wave is the main focus, used stock. Opened recently. The shop for post-punk, goth, synth-pop and left-field 80s records in Shimokitazawa.",
   tip:"12:00-20:00, closed Mon-Wed.",hours:"12:00-20:00, closed Mon-Wed",addr:"Shimokitazawa, Setagaya Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.7055,lng:139.6498,name:"LOS APSON? (KOENJI)",
   desc:"Recoya describes it as 'a shop where you can meet music you don't know yet.' That is exactly right. Deliberately genre-defying, curated by obsessives, 5 minutes south of Koenji station.",
   tip:"15:00-20:00. Give yourself an hour. Don't come with a genre in mind.",hours:"15:00-20:00",addr:"5-min walk from Koenji Station South Exit, Suginami Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.7052,lng:139.6495,name:"EAD RECORD (KOENJI)",
   desc:"Genuinely all-genre: jazz, soul, Latin, reggae, club/dance, hip-hop, noise, punk, progressive and more. Also stocks SP (78rpm) shellac, cassettes, and audio gear. One of the most eclectic shops in Tokyo.",
   tip:"13:00-21:00.",hours:"13:00-21:00",addr:"Koenji, Suginami Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.7057,lng:139.6502,name:"UNIVERSOUNDS (KOENJI)",
   desc:"Jazz and soul specialist in Koenji. Highly regarded. A quieter, more contemplative dig shop compared to the bustle of Shimokitazawa.",
   tip:"14:00-20:00.",hours:"14:00-20:00",addr:"Koenji, Suginami Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.7050,lng:139.6498,name:"KURONEKO (黒猫) KOENJI",
   desc:"Recoya calls it a 'special space in Koenji.' Beloved by regulars, mysterious to newcomers. The kind of shop where everyone inside is a serious collector.",
   tip:"13:00-20:00.",hours:"13:00-20:00",addr:"Koenji, Suginami Ward, Tokyo"},
  {cat:"records",tourist:0,lat:35.7058,lng:139.6493,name:"SUB STORE TOKYO (KOENJI)",
   desc:"Records and used books cafe in one space. Open until midnight. The most relaxed record-browsing experience in Tokyo - order a drink and stay as long as you like.",
   tip:"15:00-24:00. A late-night record haven for when everything else in Koenji closes.",hours:"15:00-24:00",addr:"Koenji, Suginami Ward, Tokyo"},

  // ── GAMING
  {cat:"gaming",tourist:1,lat:35.6982,lng:139.7730,name:"SUPER POTATO AKIHABARA",
   desc:"⚠ The most iconic retro game store on Earth. Every console, Japanese boxart horror titles (Silent Hill, Clock Tower, Rule of Rose, D). Top floor arcade genuinely worth it.",
   tip:"Budget 2 hours minimum. Weekday mornings for browsing space.",addr:"1-11-2 Sotokanda, Chiyoda Ward (3F–5F)"},
  {cat:"gaming",tourist:0,lat:35.6975,lng:139.7728,name:"BEEP AKIHABARA (PC-98 HORROR)",
   desc:"Japan's best PC-98 and PC-88 specialist — home of the earliest Japanese horror games. Staff know everything about pre-PlayStation Japanese PC gaming.",
   tip:"Ask specifically about PC-98 horror and adventure games. This is THE place on Earth for this material.",addr:"B1F 3-9-8 Sotokanda, Chiyoda Ward"},
  {cat:"gaming",tourist:0,lat:35.6988,lng:139.7726,name:"TRADER AKIHABARA",
   desc:"Best PS1 and Saturn selection in Akihabara. Six floors. Strong on Saturn horror: Clock Tower, D, Enemy Zero.",
   tip:"The Saturn section on upper floors has the rare horror stuff.",addr:"Akihabara, Chiyoda Ward"},
  {cat:"gaming",tourist:0,lat:35.6986,lng:139.7740,name:"MANDARAKE COMPLEX AKIHABARA",
   desc:"8 floors. Games on 6F and 7F. Horror art books, doujinshi, anime cels, figures. One of the great Tokyo experiences.",
   tip:"Go weekday. 6F and 7F for games, basement for the weirdest stuff.",addr:"3-11-12 Sotokanda, Chiyoda Ward"},
  {cat:"gaming",tourist:1,lat:35.6612,lng:139.6994,name:"CAPCOM STORE TOKYO (SHIBUYA PARCO)",
   desc:"⚠ Official Capcom merch. Resident Evil, Street Fighter, Monster Hunter, DMC exclusives. Japan-only items unavailable elsewhere.",
   tip:"RE Village and RE4 Remake merch strong here.",addr:"6F Shibuya PARCO, 15-1 Udagawacho, Shibuya"},
  {cat:"gaming",tourist:0,lat:35.6990,lng:139.7735,name:"KOTOBUKIYA AKIHABARA (HORROR FIGURES)",
   desc:"High-end collectable figures. Pyramid Head, Lisa Trevor, Nemesis — high-quality articulated and statue figures from Silent Hill and Resident Evil.",
   tip:"The Silent Hill and Biohazard sections move quickly. Come early in the week.",addr:"Akihabara, Chiyoda Ward"},
  // ── TCG (new)
  {cat:"tcg",tourist:1,lat:35.6983,lng:139.7728,name:"HARERUYA 2 (AKIHABARA — POKEMON)",
   desc:"⚠ 5-floor store in Akihabara dedicated to Pokémon. Arguably the best-stocked Pokémon card shop in Japan — vintage Japanese sets, modern pulls, rare singles, PSA-graded cards, sealed booster boxes. In-store gacha for rare promo wins.",
   tip:"Has an English-support digital stock system to search for specific cards. Go early weekday. The showcase cases have the best rare finds.",
   hours:"10:00–20:00",
   addr:"Akihabara, Chiyoda Ward, Tokyo"},
  {cat:"tcg",tourist:0,lat:35.6988,lng:139.7732,name:"CARD RUSH AKIHABARA",
   desc:"Serious card shop for Pokémon and Yu-Gi-Oh! singles. Cases full of rare vintage cards at competitive prices. Staff will appraise your collection on the spot. Weekly tournaments in the back. Also buys cards.",
   tip:"Great if you want to offload doubles. The back showcase cases have the rarest finds. Check for weekday deals.",
   hours:"12:00–21:00 weekdays, 10:00–21:00 weekends",
   addr:"Akihabara, Chiyoda Ward, Tokyo"},
  {cat:"tcg",tourist:1,lat:35.6991,lng:139.7714,name:"C-LABO AKIHABARA (YU-GI-OH!)",
   desc:"⚠ 38-location chain but the Akihabara main shop is the flagship — specifically focused on Yu-Gi-Oh! with events running daily. Radio Kaikan building has a dedicated Yu-Gi-Oh! and Pokémon floor. 64-seat free play space. The shop for OCG players.",
   tip:"Yu-Gi-Oh! events every day — great way to see the competitive OCG scene. Radio Kaikan location is right next to Akihabara station.",
   hours:"10:00–20:00",
   addr:"Akihabara Electric Town, Chiyoda Ward (Radio Kaikan building)"},
  {cat:"tcg",tourist:0,lat:35.6974,lng:139.7730,name:"YELLOW SUBMARINE AKIHABARA",
   desc:"Major hobby shop with an excellent TCG section — Pokémon, Yu-Gi-Oh!, MTG, and Japanese-exclusive TCGs. Known for the accessories section: card sleeves, binders, deck boxes. Good sealed product selection.",
   tip:"Excellent for accessories and sleeves. The upper floors have broader hobby items if you want figures or models alongside cards.",
   hours:"10:00–20:00",
   addr:"Akihabara, Chiyoda Ward, Tokyo"},
  {cat:"tcg",tourist:0,lat:35.6580,lng:139.7010,name:"MAGI SHIBUYA/SHINJUKU (GRADED POKEMON)",
   desc:"Secondhand card shop specialising in Pokémon but also stocking Yu-Gi-Oh! and One Piece TCG. Notably stocks PSA and BGS-graded cards — rare for a physical shop. Good for collectors focused on condition and investment value rather than just playing.",
   tip:"Check their website stock before visiting — the online system shows current inventory. Great for rare vintage Japanese Pokémon cards.",
   hours:"11:00–21:00",
   addr:"Shibuya / Shinjuku area, Tokyo"},
  // ── ARCHIVE FASHION (new)
  {cat:"archive",tourist:0,lat:35.6692,lng:139.7078,name:"RAGTAG HARAJUKU (CAT STREET)",
   desc:"Three floors of secondhand designer and archive streetwear. Ground floor: Comme des Garçons, Yohji Yamamoto, Vivienne Westwood, Sacai. Second floor: A Bathing Ape archive, Hysteric Glamour, Journal Standard. Established 1985, one of Tokyo's most respected consignment institutions. New items arrive daily.",
   tip:"The Hysteric Glamour and vintage BAPE section on floor 2 is exceptional for Y2K-era pieces. Go mid-week for fresh stock.",
   hours:"11:00–20:00 daily",
   addr:"Cat Street, Jingumae, Shibuya Ward (8-min walk from JR Harajuku)"},
  {cat:"archive",tourist:0,lat:35.6700,lng:139.7092,name:"CASANOVA VINTAGE (Y2K LUXURY)",
   desc:"Multiple locations, the Harajuku/Omotesando area being the main one. Remove your shoes on entry — the floor is tatami. Murakami-era Louis Vuitton, Chanel with 2000s detailing, Marc Jacobs, Chrome Hearts — pieces people call 'grails' without sounding corny. Friendly, family-like atmosphere unusual for this tier of archive.",
   tip:"Their selection is Murakami-era LV and 2000s luxury-streetwear crossover. The tatami entry is the tell. If you're looking for grail-era pieces this is the best-curated shop in Tokyo.",
   hours:"11:00–20:00 daily",
   addr:"Jingumae / Omotesando area, Shibuya Ward, Tokyo"},
  {cat:"archive",tourist:0,lat:35.6703,lng:139.7042,name:"NEOVA (CYBER RAVE FASHION)",
   desc:"Started online 2022, now with a physical Harajuku store. A love letter to 90s–2000s cyber rave: space references, reflective materials, pieces made for strobe lights and sweaty basements. Very seriously curated — the styling, the references, even the staff. Born online and carries that energy into the physical space.",
   tip:"If you grew up obsessed with club flyers and early-internet fashion, this is the shop. Consistently one of the most discussed new stores in Tokyo since opening.",
   addr:"Harajuku area, Shibuya Ward, Tokyo"},
  {cat:"archive",tourist:0,lat:35.7298,lng:139.7103,name:"PAT MARKET IKEBUKURO (Y2K ARCHIVE)",
   desc:"Ikebukuro vintage store designed around Y2K Japanese label archive — old Harajuku fashion memories edited to mix with the present. Carries Hysteric Glamour, Vivienne Westwood, Dolce & Gabbana vintage, Zucca, Tsumori Chisato, h.Naoto and Algonquins. Less overwhelming than Harajuku equivalents — more approachable.",
   tip:"Ikebukuro has a different energy to Harajuku for this type of shop — more relaxed browsing, less scene pressure. A 2000s Japanese label pilgrimage spot.",
   hours:"12:00–20:00",
   addr:"Ikebukuro, Toshima Ward, Tokyo"},
  // ── PERSONA 5 LOCATIONS (new — gaming/hidden)
  {cat:"gaming",tourist:0,lat:35.6431,lng:139.6687,name:"SANGEN-JAYA PERSONA 5 DISTRICT",
   desc:"The real-life neighbourhood that directly inspired Yongen-Jaya in Persona 5. Sangenjaya (三軒茶屋) — 'three tea houses' — was renamed Yongen-Jaya ('four tea houses') in-game. Walk the backstreets north of the station: the alley where Joker arrived, the produce shop, the batting centre, the laundromat. The area is virtually unchanged. 2 stops from Shibuya on the Tokyu Den-en-toshi Line.",
   tip:"Take the Tokyu Den-en-toshi Line from Shibuya — exactly as in the game. Walk north from the station and take the first narrow alley. The atmosphere is reproduced almost exactly.",
   addr:"Sangenjaya Station, Setagaya Ward, Tokyo (Tokyu Den-en-toshi Line)"},
  {cat:"food",tourist:0,lat:35.6430,lng:139.6688,name:"RAIN ON THE ROOF CAFÉ (REAL LEBLANC)",hours:"11:00–21:00",price:2,
   desc:"The café universally cited by Persona 5 fans as the closest real-world equivalent to Café Leblanc. Located opposite the real Chiyono-Yu bathhouse (= Fuji no Yu) in Sangenjaya. Warm wood interior, nostalgic design, quiet ambiance. Their standout menu item: curry and coffee set — exactly what Sojiro serves in the game. The firm custard pudding is a must.",
   tip:"Order the curry and coffee set. For P5 fans, this meal IS Leblanc. One of the most emotionally satisfying meals in Tokyo for a fan.",
   addr:"Near Chiyono-Yu bathhouse, Sangenjaya backstreets, Setagaya Ward"},
  {cat:"hidden",tourist:0,lat:35.6427,lng:139.6693,name:"CHIYONO-YU BATHHOUSE (FUJI NO YU)",
   desc:"The retro bathhouse in Sangenjaya that directly inspired Fuji no Yu in Persona 5. From the exterior placards to the laundromat and corrugated iron sheeting next door — the atmosphere is reproduced perfectly in the game. Buy drinks from the vending machine outside, exactly as you do in the game.",
   tip:"Still an active local bathhouse — you can actually go in. The exterior alone makes the Sangenjaya pilgrimage worthwhile.",
   addr:"Sangenjaya backstreets, Setagaya Ward, Tokyo"},
  {cat:"hidden",tourist:0,lat:35.6585,lng:139.7006,name:"SHIBUYA HACHIKO & CENTER GAI (PERSONA 5)",
   desc:"Hachiko Square (= Station Square in P5) is where Yoshida gives his speeches on Sundays — the green tram monument is real and enterable. The walkway inside Shibuya Station between Keio Inokashira and Tokyo Metro Ginza Line gates has the famous Okamoto Taro mural 'Ashita no Shinwa' (Myth of Tomorrow). Center Gai shopping street = Central Street.",
   tip:"Walk from Hachiko through the Teikyu Building walkway — you'll immediately recognise it. The mural is free to view. Center Gai is immediately behind Hachiko Square.",
   addr:"Shibuya Station / Center Gai, Shibuya Ward, Tokyo"},
  {cat:"food",tourist:0,lat:35.6693,lng:139.7671,name:"CAFÉ DE L'AMBRE (GINZA — ORIGINAL LEBLANC INSPIRATION)",hours:"12:00–19:00, closed Mon",price:2,
   desc:"Tokyo's most historic pure kissaten, established 1948. Widely cited as the visual and atmospheric inspiration for Café Leblanc's interior — the owner has a similar name to Sojiro Sakura. Coffee served at precise temperatures in Ginza for over 75 years. Time-capsule interior barely changed since the 1950s. A genuine once-in-Japan experience.",
   tip:"Order the Aged Coffee — beans aged for years. This is a different category of kissaten experience. Go early afternoon to get a seat.",
   addr:"8-10-15 Ginza, Chuo Ward, Tokyo"},
  // ── FASHION
  {cat:"archive",tourist:0,lat:35.7052,lng:139.6497,name:"KABANERI KOENJI (HEISEI Y2K ARCHIVE)",
   desc:"Very recently opened shop in Koenji dedicated entirely to 90s–2000s Heisei-era nostalgia: gyaru, alternative, and punk fashion from the period. Owner Kosuke's personal nostalgia for the era is in every rack — curated rather than volume-driven. The Heisei aesthetic (late 80s–2000s Japan mainstream pop culture) is the focus, making this completely different from anything in Harajuku.",
   tip:"The Heisei-era Japanese labels are what set this apart from Shimokitazawa and Harajuku equivalents. Recently opened means stock is turning over fast — go early in your Tokyo week.",
   addr:"Koenji, Suginami Ward, Tokyo"},
  {cat:"archive",tourist:0,lat:35.7048,lng:139.6498,name:"FURUGIYA SANGO (KOENJI)",
   desc:"Koenji thrift store that feels like a maze of fashion history — jackets, dresses, accessories all piled in organised chaos across multiple rooms. Strong in 70s–80s pieces but consistently gets 90s–early 2000s arrivals too. One of the shops that makes Koenji better than Shimokitazawa for serious hunting.",
   tip:"Spend minimum an hour. Items are stacked rather than hung so dig through. The side room has the most interesting accessories and bags.",
   addr:"South Koenji area, Suginami Ward, Tokyo"},
  // ── NAKANO TCG
  {cat:"tcg",tourist:0,lat:35.7069,lng:139.6661,name:"NAKANO BROADWAY (MANDARAKE TCG)",
   desc:"Nakano Broadway is less known than Akihabara for international visitors but often preferred by serious collectors. The Mandarake store on the 2nd floor has binders of Pokémon singles — pre-sorted by set and rarity, cheaper than equivalent shops in Akihabara. Multiple floors of anime goods, games and collectibles. More authentic collector atmosphere than tourist-facing Akihabara.",
   tip:"Take the Chuo Line 4 stops from Shinjuku. The 2nd floor Mandarake Pokémon binders let you select specific cards you need — best for completing collections. Much less crowded than Akihabara equivalents.",
   hours:"12:00–20:00",
   addr:"Nakano Broadway, 5-52-15 Nakano, Nakano Ward, Tokyo"},
  {cat:"fashion",tourist:0,lat:35.7060,lng:139.6498,name:"KOENJI VINTAGE (BEST IN TOKYO 2025)",
   desc:"Consistently rated above Shimokitazawa by serious vintage hunters in 2025. Atlantis Vintage for luxury bags, Big Time for graphic tees, Kitakore Building for experimental boutiques.",
   tip:"Budget a full day. Walk Koenji Junjo Shotengai and Look Street. Midweek for fresh stock.",addr:"Koenji, Suginami Ward (JR Chuo line)"},
  {cat:"fashion",tourist:0,lat:35.6610,lng:139.6680,name:"SHIMOKITAZAWA: CHICAGO, FLAMINGO, LITTLE TRIP",
   desc:"Chicago (best denim in Tokyo), Flamingo (American vintage 50s–90s), Little Trip to Heaven (premium curated vintage). 20+ shops in walking distance.",
   tip:"Weekday morning when new stock arrives.",addr:"Shimokitazawa, Setagaya Ward"},
  {cat:"fashion",tourist:0,lat:35.6690,lng:139.7080,name:"URA-HARAJUKU: NEIGHBOURHOOD, WTAPS, UNDERCOVER",
   desc:"The backstreets of Harajuku house Japan's most serious alternative streetwear. Neighbourhood, WTAPS and UNDERCOVER are the three cornerstone labels.",
   tip:"Prices start at ¥15,000 for tops. Genuinely irreplaceable.",addr:"Cat Street backstreets, Jingumae, Shibuya Ward"},
  {cat:"fashion",tourist:0,lat:35.6705,lng:139.7025,name:"DOG BASEMENT (HARAJUKU)",
   desc:"Basement store in Harajuku. Weird, experimental, gender-neutral. Bold cuts, one-of-a-kind pieces. Ring the buzzer for the basement entrance.",
   tip:"Not obviously signed from street level.",addr:"Near Takeshita Street, Harajuku"},
  {cat:"fashion",tourist:0,lat:35.6655,lng:139.7200,name:"GR8 (OMOTESANDO)",
   desc:"High-end streetwear. Maison MIHARA YASUHIRO, SAINT Michael, READYMADE — domestic Japanese labels you genuinely cannot get in the UK.",
   tip:"No photos inside. Staff are serious but friendly to genuine buyers.",addr:"Omotesando, Minato Ward"},
  {cat:"fashion",tourist:0,lat:35.7278,lng:139.7703,name:"NIPPORI TEXTILE TOWN",
   desc:"80+ fabric shops in a few blocks. Kimono fabric offcuts, technical fabrics, embroidered patches, unusual accessories. Almost no tourists.",
   tip:"Great for unusual accessories and one-of-a-kind textile items.",addr:"Nippori, Arakawa Ward"},
  // ── NATURE / HIDDEN
  {cat:"nature",tourist:0,lat:35.7270,lng:139.7710,name:"YANAKA OLD TOWN + CAT COLONY",
   desc:"Edo-period neighbourhood that survived WWII. Atmospheric temple-dense streets, artisan shops, many stray cats. Yanaka Cemetery has genuine old-growth trees.",
   tip:"Combine with the cemetery — surprisingly rich with birdlife.",addr:"Yanaka, Taito Ward"},
  {cat:"nature",tourist:1,lat:35.3192,lng:139.5469,name:"KAMAKURA DAIBUTSU HIKING TRAIL",
   desc:"⚠ 1 hour from Tokyo. The Daibutsu Hiking Course winds through cedar forest with sea views. Most visitors skip it entirely.",
   tip:"Start at Kita-kamakura station. Pack food.",addr:"Kamakura, Kanagawa Prefecture"},
  {cat:"nature",tourist:1,lat:35.2330,lng:139.1070,name:"HAKONE: TATTOO-FRIENDLY ONSEN",
   desc:"⚠ Hakone Kowakien Yunessun and Tenzan Tohji-kyo are explicitly tattoo-friendly.",
   tip:"Search 'tattoo friendly onsen Hakone' specifically. Kowakien Yunessun is a large indoor/outdoor complex.",addr:"Hakone-machi, Ashigarashimo, Kanagawa"},
  {cat:"nature",tourist:0,lat:35.6430,lng:139.7100,name:"MEGURO RIVER NIGHT BLOSSOM",
   desc:"Late evening (after 9pm) thins dramatically. Walking the Meguro River under lit cherry blossoms with yakitori stalls open.",
   tip:"Get there by 8pm for the lanterns. Walk the full length.",addr:"Meguro River, Nakameguro to Meguro"},
  {cat:"hidden",tourist:0,lat:35.6940,lng:139.7040,name:"GOLDEN GAI (SHINJUKU)",
   desc:"200 tiny themed bars in 6 alleys. Each seats 5–15 people. Bars themed around horror films, jazz, electronic music, film noir, cats.",
   tip:"Most bars have a ¥500–1000 cover for newcomers. Bar Nightingale is known for electronic music.",addr:"Golden Gai, Kabukicho, Shinjuku Ward"},
  {cat:"hidden",tourist:0,lat:35.6340,lng:139.7135,name:"MEGURO PARASITOLOGICAL MUSEUM",
   desc:"The world's only parasite-dedicated museum. Free entry. 300 specimens including the world's longest tapeworm (8.8m). The gift shop sells tapeworm keychains.",
   tip:"Very quiet on weekday mornings.",addr:"4-1-1 Shimo-Meguro, Meguro Ward"},
  {cat:"hidden",tourist:0,lat:35.7338,lng:139.7837,name:"JOYFUL MINOWA (ARAKAWA TRAM)",
   desc:"400-metre Showa-era shopping street from 1919. Family-run gyoza shops, soba stalls, public bathhouse. Almost zero tourists. Take the last tram in Tokyo to get there.",
   tip:"Walk from Minowabashi on the Toden Arakawa Line — the tram ride itself is remarkable.",addr:"Joyful Minowa, Minowabashi, Arakawa Ward"},
  // ── FOOD
  {cat:"food",tourist:0,lat:35.6422,lng:139.7025,name:"AFURI RAMEN (NAKAMEGURO)",hours:"11:00–23:00",price:2,
   desc:"Yuzu-infused chicken ramen. The Nakameguro branch overlooks the cherry blossom river. One of Tokyo's most genuinely original ramen concepts.",
   tip:"The cold yuzu tsukemen in spring is exceptional.",addr:"Nakameguro, Meguro Ward"},
  {cat:"food",tourist:0,lat:35.6935,lng:139.7726,name:"KANDA MATSUYA (SOBA SINCE 1884)",hours:"11:00–20:00, closed Sun",price:2,
   desc:"Soba restaurant since 1884. A 6-minute walk from Akihabara. The interior barely changed since the Meiji era.",
   tip:"The tempura soba set at lunch is the move. Cash only.",addr:"1-13 Kanda-Sudacho, Chiyoda Ward"},
  {cat:"food",tourist:0,lat:35.7272,lng:139.7718,name:"YANAKA GINZA STREET FOOD",hours:"10:00–18:00",price:1,
   desc:"200-metre shopping street of old Edo-era Yanaka. Stalls selling korokke, grilled chicken skewers, melonpan, taiyaki.",
   tip:"The korokke shop near the entrance is the most famous. Buy and eat walking.",addr:"Yanaka Ginza, Taito Ward"},
  {cat:"food",tourist:0,lat:35.6938,lng:139.7001,name:"ICHIRAN SHINJUKU (24HR SOLO RAMEN)",hours:"24 hours",price:2,
   desc:"Solo ramen booth restaurant. Bamboo screen on each side, a window opens to pass food. The definitive solo late-night Tokyo meal. Open 24 hours.",
   tip:"Go at 3am after a night out. Fill in the slip, close the window, eat in peace.",addr:"Shinjuku, near Kabukicho"},
  {cat:"food",tourist:0,lat:35.6606,lng:139.6994,name:"GYUKATSU MOTOMURA (BEEF KATSU)",hours:"11:00–22:00",price:2,
   desc:"Beef katsu served rare, finished to your taste on a small stone grill at your seat. You control the doneness.",
   tip:"Arrive at 11am opening. Queue moves fast.",addr:"Dogenzaka, Shibuya Ward"},
  {cat:"food",tourist:0,lat:35.7050,lng:139.6502,name:"KOENJI HAGURUMA IZAKAYA",hours:"17:00–midnight, closed Sun",price:2,
   desc:"Old-school izakaya serving slow-simmered offal, unusual yakitori cuts, sake by the carafe. Frequented by the local artist, musician and vintage crowd.",
   tip:"Point to whatever the table next to you has. Very cash-only, very local.",addr:"Koenji, Suginami Ward"},
  // ── SIGHTSEEING
  {cat:"sightseeing",tourist:1,lat:35.7148,lng:139.7967,name:"SENSO-JI TEMPLE ASAKUSA",
   desc:"Tokyo's most visited temple and oldest, founded 628 AD. The Kaminarimon gate and Nakamise shopping street leading to the main hall are iconic Tokyo. Vibrant and atmospheric.",
   tip:"Go at 6am before the crowds — the main hall opens at dawn and the atmosphere is genuinely moving. Combine with Nakamise market stalls.",
   hours:"6:00–17:00 (grounds 24hr)",addr:"2-3-1 Asakusa, Taito Ward, Tokyo"},
  {cat:"sightseeing",tourist:1,lat:35.6763,lng:139.6993,name:"MEIJI JINGU",
   desc:"Tokyo's most important Shinto shrine, dedicated to Emperor Meiji. Set in 70 hectares of dense secondary forest in the middle of the city — feels completely removed from Tokyo.",
   tip:"Inner garden (¥500) is worth it. Combine with Harajuku visit right next door.",
   hours:"Sunrise–sunset (varies by month)",addr:"1-1 Yoyogikamizonocho, Shibuya Ward, Tokyo"},
  {cat:"sightseeing",tourist:1,lat:35.6595,lng:139.7004,name:"SHIBUYA CROSSING",
   desc:"The world's busiest pedestrian scramble crossing. Up to 3,000 people cross simultaneously from all directions. Best viewed from the Starbucks on the second floor of the adjacent building.",
   tip:"Try crossing it once (in all directions at once), then go up to view from above. Busiest at evening rush hour around 6pm.",
   hours:"24hr",addr:"Shibuya Station, Shibuya Ward, Tokyo"},
  {cat:"sightseeing",tourist:0,lat:35.6938,lng:139.7036,name:"SHINJUKU GOLDEN GAI",
   desc:"200 tiny themed bars in 6 narrow alleys behind Kabukicho. Each bar seats 5–15 people maximum. Bars themed around horror films, jazz, electronic music, film noir, cats. Unmissable.",
   tip:"Most bars have ¥500–1000 cover for newcomers. Bar Nightingale for electronic music. Go on multiple nights — you can't see it all in one.",
   hours:"Mostly 19:00–late",addr:"Golden Gai, Kabukicho, Shinjuku Ward, Tokyo"},
  {cat:"sightseeing",tourist:1,lat:35.6702,lng:139.7027,name:"HARAJUKU TAKESHITA STREET",
   desc:"The epicentre of Japanese youth culture and street fashion. Crepe shops, candy floss, costume shops, fast fashion. Chaotic, colourful and uniquely Tokyo. The backstreets around Cat Street are more interesting.",
   tip:"Weekday mornings less crowded. Walk Takeshita then immediately escape into Ura-Harajuku for the real stuff.",
   hours:"varies",addr:"Takeshita Street, Harajuku, Shibuya Ward, Tokyo"},
  {cat:"sightseeing",tourist:0,lat:35.7265,lng:139.7658,name:"YANAKA OLD TOWN",
   desc:"Best preserved pre-war Tokyo neighbourhood. Edo-period temple-dense streets, artisan shops, ancient cemetery with old-growth trees. Cats everywhere. Survived WWII almost completely intact.",
   tip:"Combine with Yanaka Ginza for street food korokke. Very few foreign tourists.",
   hours:"24hr",addr:"Yanaka, Taito Ward, Tokyo"},
  // ── KAMAKURA sightseeing
  {cat:"sightseeing",tourist:1,lat:35.3167,lng:139.5352,name:"GREAT BUDDHA KOTOKU-IN",
   desc:"The iconic 13.35-metre bronze Buddha sitting in the open air at Kamakura. Cast in 1252. Originally sat inside a wooden hall that was washed away by a tsunami in 1498 — been outside ever since.",
   tip:"¥300 entry, ¥20 extra to enter the hollow statue. Go early morning. 1 hour from Tokyo by Yokosuka Line.",
   hours:"8:00–17:30",addr:"4-2-28 Hase, Kamakura, Kanagawa"},
  {cat:"sightseeing",tourist:1,lat:35.3260,lng:139.5566,name:"TSURUGAOKA HACHIMANGU",
   desc:"Kamakura's most important shrine, connected to the station by a 1.8km ceremonial approach lined with cherry trees. The main hall overlooks a large lotus pond.",
   tip:"Late March cherry blossoms on the approach are spectacular. Walk the full approach from the coast.",
   hours:"5:00–21:00",addr:"2-1-31 Yukinoshita, Kamakura, Kanagawa"},
  // ── MT FUJI sightseeing
  {cat:"sightseeing",tourist:1,lat:35.5120,lng:138.7530,name:"LAKE KAWAGUCHI VIEWPOINT",
   desc:"The most accessible of the Fuji Five Lakes, with classic Fuji reflection shots from the northern shore. Early morning gives mirror-still water and perfect reflections of the summit.",
   tip:"North shore near Oishi Park is the classic photography spot. Check weather obsessively the night before.",
   hours:"24hr",addr:"Kawaguchiko, Fujikawaguchiko, Yamanashi"},
  {cat:"sightseeing",tourist:1,lat:35.4958,lng:138.7874,name:"CHUREITO PAGODA",
   desc:"Five-storey pagoda with Mt Fuji rising dramatically behind it. With early April cherry blossoms, this is one of Japan's most photographed compositions. 398 steps up from Fujisan Station.",
   tip:"Go before 7am. Check weather forecast obsessively — clear mornings in April are not guaranteed.",
   hours:"24hr",addr:"Arakurayama Sengen Park, Fujiyoshida, Yamanashi"},
  // ── ONSEN
  {cat:"onsen",tourist:0,lat:35.6951,lng:139.7038,name:"THERMAE-YU (SHINJUKU)",
   desc:"24-hour sauna and hot spring in the heart of Shinjuku. Multiple baths including a genuine natural hot spring. TV lounge, manga library, restaurant — the classic post-rave or post-Golden-Gai recovery spot.",
   tip:"Open 24 hours. Around ¥2,700 weekends (towel included). Perfect for 5am sauna after Golden Gai.",hours:"24 hours",addr:"1-1-2 Kabukicho, Shinjuku Ward, Tokyo"},
  {cat:"onsen",tourist:0,lat:35.6453,lng:139.6673,name:"CHIYONO-YU — PERSONA 5 REAL LOCATION",
   desc:"The real-life bathhouse that inspired Penguin Sniper in Persona 5. A beautiful old neighbourhood sento that has been operating for decades in Sangenjaya.",
   tip:"¥490 entry. Go in the evening. The interior is exactly as Persona fans expect.",hours:"15:30–24:00, closed Mon",addr:"Sangenjaya, Setagaya Ward, Tokyo"},
  {cat:"onsen",tourist:0,lat:35.6591,lng:139.7032,name:"KOGANE-YU (DAIKANYAMA)",
   desc:"Beloved sento turned cultural venue — Daikanyama area. Refurbished traditional building with a craft beer and food area in the lobby. Sauna section bookable separately. Popular with Tokyo's creative crowd.",
   tip:"~¥530 entry + ¥400 sauna (book sauna online). Food in the lobby is genuinely excellent.",hours:"13:00–01:00, closed Tue",addr:"Daikanyama, Shibuya Ward, Tokyo"},
  {cat:"onsen",tourist:0,lat:35.6540,lng:139.7000,name:"SOLO SAUNA TUNE (SHIBUYA)",
   desc:"Private-room sauna — you rent an entire sauna for yourself or one friend. 90-minute session. Finnish kiuas heater, private cold shower, private lounge. The most premium solo sauna in Tokyo.",
   tip:"Reservations required online. ¥4,000–5,000 per session. Multiple branches: Shibuya and Shinjuku.",hours:"9:00–23:00",addr:"Shibuya Ward, Tokyo"},
  // ── ARCADE
  {cat:"arcade",tourist:0,lat:35.6985,lng:139.7726,name:"TAITO HEY AKIHABARA ★",
   desc:"THE legendary Akihabara arcade for serious players. Floor 1: rhythm games (beatmania IIDX, Sound Voltex, Pop'n Music). Floor 2: shmups on ORIGINAL PCBs — Cave, Treasure, Toaplan. Floor 3: fighting games with genuine local competition. A sacred site for Japanese arcade culture.",
   tip:"Open till midnight. The shmup floor is extraordinary and endangered — spend time there.",hours:"10:00–23:30",addr:"1-16-3 Sotokanda, Chiyoda Ward"},
  {cat:"arcade",tourist:0,lat:35.6980,lng:139.7723,name:"CLUB SEGA / GIGO AKIHABARA",
   desc:"Multi-floor GiGO arcade in Akihabara. Largest crane game selection in the area — great for hunting Pokémon and anime prize items. Rhythm games on upper floors. Well-maintained machines.",
   tip:"Two buildings side by side. Ground floor for crane hunting; upper for video games.",hours:"10:00–23:00",addr:"1-11-1 Sotokanda, Chiyoda Ward"},
  {cat:"arcade",tourist:0,lat:35.7125,lng:139.7066,name:"MIKADO GAME CENTRE ★★ (TAKADANOBABA)",
   desc:"The most legendary game centre in Japan. A nondescript building in residential Takadanobaba housing original PCB cabinets from the 80s. Serious competitive community: Street Fighter III, Guilty Gear, KOF, Touhou. The last great pure arcade.",
   tip:"15 mins from Shinjuku on the Tozai line. Open till midnight. This is a pilgrimage site. Nothing about it is flashy and that is the point.",hours:"13:00–00:00 wkdays, 10:00–00:00 wkends",addr:"Takadanobaba 2-chome, Shinjuku Ward"},
  {cat:"arcade",tourist:0,lat:35.6594,lng:139.6983,name:"ROUND1 SHIBUYA",
   desc:"The Shibuya Round1. Large, well-maintained machines. Rhythm game section is the full canon: IIDX, SDVX, Chunithm, Maimai, Taiko no Tatsujin. Convenient before an evening in Shibuya.",
   tip:"Below 109-2 in Udagawacho. Open until 2am.",hours:"10:00–02:00",addr:"Udagawacho, Shibuya Ward"},
  {cat:"arcade",tourist:0,lat:35.6968,lng:139.7730,name:"GAME SPOT 21 (AKIHABARA)",
   desc:"Companion to Taito HEY — 2 minutes walk. Known for shmup and retro cabinet selection: Taito, Konami, Cave. The two together give you a complete shmup pilgrimage.",
   tip:"Smaller but curated. Visit both in the same Akihabara session.",hours:"11:00–23:00",addr:"Akihabara, Chiyoda Ward"},
  // ── GAME CENTRES
  {cat:"gamecentre",tourist:1,lat:35.7127,lng:139.7038,name:"GAME CENTER MIKADO (TAKADANOBABA)",
   desc:"⚠ THE most legendary game centre in Japan. A nondescript building in residential Takadanobaba housing original PCB cabinets from the 80s and a serious competitive community: Street Fighter III 3rd Strike, Guilty Gear, KOF, Touhou. Candy cab rows. The last great pure arcade. A pilgrimage site. Open 10:00–23:30.",
   tip:"15 mins from Shinjuku on Tozai line. Nothing about it is flashy and that is the point. THIS IS A MUST VISIT. Go on a weekday evening for the competitive scene.",
   hours:"13:00–23:30 wkdays, 10:00–23:30 wkends",addr:"Takadanobaba 2-chome, Shinjuku Ward, Tokyo"},
  {cat:"gamecentre",tourist:0,lat:35.7298,lng:139.7109,name:"GAME CENTER MIKADO IKEBUKURO",
   desc:"Second Mikado location in Ikebukuro. Similar legendary status to the Takadanobaba flagship — retro PCBs, serious competitive community, candy cab rows. Combine with the Ikebukuro TCG circuit.",
   tip:"Combine with PAT Market and Nakano Broadway for a full gaming day in the north.",
   hours:"varies",addr:"Ikebukuro, Toshima Ward, Tokyo"},
  {cat:"gamecentre",tourist:1,lat:35.7019,lng:139.7733,name:"TAITO HEY AKIHABARA",
   desc:"⚠ 3-floor retro paradise in Akihabara. Floor 1: rhythm games (beatmania IIDX, Sound Voltex). Floor 2: shmups on ORIGINAL PCBs — Cave, Treasure, Toaplan titles. Floor 3: fighting games with genuine local competition. A pilgrimage site for Japanese arcade culture. 10:00–23:00.",
   tip:"The shmup floor is extraordinary and endangered — spend time there. Original Cave PCBs running. This is irreplaceable.",
   hours:"10:00–23:00",addr:"1-16-3 Sotokanda, Chiyoda Ward, Tokyo"},
  {cat:"gamecentre",tourist:0,lat:35.7014,lng:139.7731,name:"GIGO AKIHABARA",
   desc:"Massive multi-floor GiGO arcade in Akihabara. Largest crane game selection in the area for Pokémon and anime prize items. Rhythm games on upper floors, well-maintained machines.",
   tip:"Two buildings side by side. Ground floor for crane hunting, upper floors for video games.",
   hours:"10:00–23:00",addr:"1-11-1 Sotokanda, Chiyoda Ward, Tokyo"},
  {cat:"gamecentre",tourist:0,lat:35.6944,lng:139.7025,name:"SHINJUKU SPORTSLAND",
   desc:"Fighting game heavy arcade in Shinjuku, steps from Golden Gai. Street Fighter community is very active, competitive scene strong. Multiple floors of fighting games, rhythm games and crane games.",
   tip:"Street Fighter community here is serious. Weekday evenings are the best time to watch high-level play.",
   hours:"10:00–24:00",addr:"Kabukicho, Shinjuku Ward, Tokyo"},
  {cat:"gamecentre",tourist:0,lat:35.7005,lng:139.7735,name:"GAME NEWTON AKIHABARA",
   desc:"Retro-focused game centre in Akihabara. Great candy cab selection with older titles maintained in playable condition. The kind of place serious collectors and players gravitate to.",
   tip:"Combine with Taito HEY and Game Spot 21 for a complete Akihabara retro arcade circuit.",
   hours:"varies",addr:"Akihabara, Chiyoda Ward, Tokyo"},
  {cat:"gamecentre",tourist:0,lat:35.6590,lng:139.6985,name:"ROUND1 SHIBUYA",
   desc:"24hr on weekends. The Shibuya Round1 with full rhythm game canon: IIDX, Sound Voltex, Chunithm, Maimai, Taiko. Comprehensive multi-floor complex convenient before or after an evening in Shibuya.",
   tip:"Open 24hr on weekends — perfect post-club or 3am destination. Below 109-2 in Udagawacho.",
   hours:"10:00–02:00 weekdays, 24hr weekends",addr:"Udagawacho, Shibuya Ward, Tokyo"},
  {cat:"gamecentre",tourist:0,lat:35.7015,lng:139.7730,name:"AKIHABARA GAME CENTER MOGRA",
   desc:"Known for chiptune and game music events alongside regular gaming. The crossover between music culture and gaming is unique here — regular events feature live game music performances, chip music DJs.",
   tip:"Check website for upcoming chiptune/game music events. The music nights are unlike any other arcade in Japan.",
   hours:"varies by event",addr:"2F 1-7 Sotokanda, Chiyoda Ward, Tokyo"},
],
};

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function JapanGuide() {
  const [view,       setView]       = useState("guide");
  const [city,       setCity]       = useState("osaka");
  const [cat,        setCat]        = useState("all");
  const [expanded,   setExpanded]   = useState(null);
  const [activePin,  setActivePin]  = useState(null);
  const [leafletOK,  setLeafletOK]  = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [myFinds,    setMyFinds]    = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({name:"",cat:"food",city:"osaka",addr:"",lat:"",lng:"",desc:"",hours:"",price:1,tip:""});
  const [weather,    setWeather]    = useState({});   // { "2026-03-26": { city:"osaka", hi:18, lo:12, rain:0.2, code:1 }, ... }
  const [wxLoading,  setWxLoading]  = useState(false);
  const [wxErr,      setWxErr]      = useState(false);
  const [isMobile,   setIsMobile]   = useState(()=>typeof window!=="undefined"&&window.innerWidth<768);

  const mapRef     = useRef(null);
  const mapInst    = useRef(null);
  const markersRef = useRef({});
  const cardRefs   = useRef({});

  // Mobile resize
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Load My Finds from persistent storage
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("myjapanfinds");
        if (r?.value) setMyFinds(JSON.parse(r.value));
      } catch(e) {}
    })();
  }, []);

  // ── LIVE WEATHER from Open-Meteo (free, no API key) ──────
  useEffect(() => {
    const WX_CACHE_KEY = "japanWeatherCache";
    const CACHE_TTL = 3600000; // 1 hour in ms
    const CITIES_WX = [
      {id:"osaka",     lat:34.672, lng:135.501},
      {id:"hiroshima", lat:34.393, lng:132.452},
      {id:"west",      lat:34.690, lng:134.000},
      {id:"kyoto",     lat:35.011, lng:135.768},
      {id:"nagoya",    lat:35.170, lng:136.900},
      {id:"fuji",      lat:35.490, lng:138.740},
      {id:"tokyo",     lat:35.682, lng:139.710},
    ];
    const WX_CODES = {
      0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",
      51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",
      71:"🌨️",73:"🌨️",75:"🌨️",80:"🌦️",81:"🌦️",82:"🌧️",
      95:"⛈️",96:"⛈️",99:"⛈️"
    };
    const wxIcon = code => {
      if (code == null) return "—";
      const keys = Object.keys(WX_CODES).map(Number).sort((a,b)=>b-a);
      for (const k of keys) { if (code >= k) return WX_CODES[k]; }
      return "🌡️";
    };
    const fetchAllWeather = async () => {
      setWxLoading(true); setWxErr(false);
      try {
        // Check cache first
        const cached = await window.storage.get(WX_CACHE_KEY).catch(()=>null);
        if (cached?.value) {
          const {ts, data} = JSON.parse(cached.value);
          if (Date.now() - ts < CACHE_TTL) { setWeather(data); setWxLoading(false); return; }
        }
        const combined = {};
        for (const c of CITIES_WX) {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia%2FTokyo&start_date=2026-03-26&end_date=2026-04-15`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const j = await res.json();
          if (!j.daily) continue;
          j.daily.time.forEach((dateStr, i) => {
            const code = j.daily.weathercode[i];
            combined[dateStr] = combined[dateStr] || {};
            combined[dateStr][c.id] = {
              hi:   Math.round(j.daily.temperature_2m_max[i]),
              lo:   Math.round(j.daily.temperature_2m_min[i]),
              rain: +(j.daily.precipitation_sum[i] || 0).toFixed(1),
              code,
              icon: wxIcon(code),
            };
          });
          await new Promise(r => setTimeout(r, 120)); // rate limit courtesy
        }
        setWeather(combined);
        await window.storage.set(WX_CACHE_KEY, JSON.stringify({ts: Date.now(), data: combined})).catch(()=>{});
      } catch(e) { setWxErr(true); }
      setWxLoading(false);
    };
    fetchAllWeather();
  }, []);

  const saveFind = async (f) => {
    const updated = [...myFinds, {...f, id:Date.now(), lat:parseFloat(f.lat)||null, lng:parseFloat(f.lng)||null}];
    setMyFinds(updated);
    try { await window.storage.set("myjapanfinds", JSON.stringify(updated)); } catch(e) {}
  };

  const deleteFind = async (id) => {
    const updated = myFinds.filter(f => f.id !== id);
    setMyFinds(updated);
    try { await window.storage.set("myjapanfinds", JSON.stringify(updated)); } catch(e) {}
  };

  // Load Leaflet
  useEffect(() => {
    if (window.L) { setLeafletOK(true); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => setLeafletOK(true);
    document.body.appendChild(js);
  }, []);

  // ── BUG FIX 1: destroy map when leaving guide view so it can reinit cleanly on return
  useEffect(() => {
    if (view !== "guide" && mapInst.current) {
      try { mapInst.current.remove(); } catch(e) {}
      mapInst.current = null;
      markersRef.current = {};
    }
  }, [view]);

  // Destroy+reinit map when mobile layout changes (mapRef points to different DOM node)
  useEffect(() => {
    if (mapInst.current) {
      try { mapInst.current.remove(); } catch(e) {}
      mapInst.current = null;
      markersRef.current = {};
    }
  }, [isMobile]);

  // Init map (runs when view returns to guide)
  useEffect(() => {
    if (view !== "guide" || !leafletOK || !mapRef.current || mapInst.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {zoomControl:true, attributionControl:false});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom:19, className:"dark-tiles"}).addTo(map);
    L.control.attribution({position:"bottomright",prefix:""}).addAttribution('<span style="color:#7060A0;font-size:9px">© OSM contributors</span>').addTo(map);
    mapInst.current = map;
  }, [leafletOK, view]);

  // ── BUG FIX 2: include myFinds in the spots useMemo so they appear on the map and list
  const spots = useMemo(() => {
    const myFindsForCity = myFinds
      .filter(f => f.city === city)
      .map(f => ({
        ...f, isMyFind:true,
        lat: typeof f.lat==="number" ? f.lat : parseFloat(f.lat)||null,
        lng: typeof f.lng==="number" ? f.lng : parseFloat(f.lng)||null,
      }));
    const base = [...(DATA[city] || []), ...myFindsForCity];
    return cat === "all" ? base : base.filter(x => x.cat === cat);
  }, [city, cat, myFinds]);

  // Markers
  useEffect(() => {
    if (!mapInst.current || !window.L || view !== "guide") return;
    const L = window.L, map = mapInst.current;
    Object.values(markersRef.current).forEach(m => { try { map.removeLayer(m); } catch(e){} });
    markersRef.current = {};
    const bounds = [];
    spots.forEach((spot, i) => {
      if (!spot.lat || !spot.lng) return;
      const color = spot.isMyFind ? "#FFE566" : (CAT_MAP[spot.cat]?.color || "#fff");
      const shape = spot.isMyFind
        ? `<div style="width:16px;height:16px;background:${color};border:2.5px solid #1B1730;box-shadow:0 0 10px ${color}99;cursor:pointer;transform:rotate(45deg);"></div>`
        : `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #1B1730;box-shadow:0 0 8px ${color}88;cursor:pointer;"></div>`;
      const icon = L.divIcon({ html:shape, className:"", iconSize:[16,16], iconAnchor:[8,8] });
      const priceStr = spot.price ? ` &nbsp;<b style="color:#FFE566">${PL[spot.price]}</b>` : "";
      const hoursStr = spot.hours ? `<br/><span style="color:#FF9F43;font-size:10px">⏰ ${spot.hours}</span>` : "";
      const starBadge = spot.isMyFind ? ` <span style="color:#FFE566">⭐</span>` : "";
      const marker = L.marker([spot.lat,spot.lng],{icon}).addTo(map)
        .bindPopup(`<div style="font-family:Arial,sans-serif;color:#E0D4FF;max-width:200px"><b style="color:#FFF;font-size:13px">${spot.name.replace(/^⚠ /,"")}${starBadge}</b>${priceStr}<br/><span style="color:#9080B8;font-size:10px">📍 ${spot.addr}</span>${hoursStr}</div>`,{closeButton:false,maxWidth:220});
      marker.on("click", () => {
        setActivePin(i); setExpanded(`${city}-${i}`);
        cardRefs.current[i]?.scrollIntoView({behavior:"smooth",block:"nearest"});
      });
      markersRef.current[i] = marker;
      bounds.push([spot.lat,spot.lng]);
    });
    if (bounds.length > 0) setTimeout(() => { try { map.fitBounds(bounds,{padding:[36,36],maxZoom:15}); } catch(e){} }, 100);
  }, [spots, leafletOK, city, view]);

  // Active pin
  useEffect(() => {
    if (!mapInst.current || !window.L || view !== "guide") return;
    const L = window.L;
    Object.entries(markersRef.current).forEach(([idx,marker]) => {
      const i = parseInt(idx), isActive = expanded === `${city}-${i}`, spot = spots[i];
      if (!spot) return;
      const color = spot.isMyFind ? "#FFE566" : (CAT_MAP[spot.cat]?.color || "#fff");
      const size = isActive ? 20 : (spot.isMyFind ? 16 : 14);
      const shape = spot.isMyFind
        ? `<div style="width:${size}px;height:${size}px;background:${color};border:${isActive?"3px solid #fff":"2.5px solid #1B1730"};box-shadow:0 0 ${isActive?16:10}px ${color}${isActive?"EE":"99"};cursor:pointer;transform:rotate(45deg);"></div>`
        : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${isActive?"3px solid #fff":"2.5px solid #1B1730"};box-shadow:0 0 ${isActive?14:8}px ${color}${isActive?"EE":"88"};cursor:pointer;"></div>`;
      marker.setIcon(L.divIcon({ html:shape, className:"", iconSize:[size,size], iconAnchor:[size/2,size/2] }));
      if (isActive) marker.openPopup();
    });
  }, [expanded, city, spots, view]);

  const cityInfo = CITIES.find(c => c.id === city);
  const toggle = (id, idx) => { setExpanded(e => e===id?null:id); setActivePin(idx); };

  // Search (also include myFinds)
  const searchResults = useMemo(() => {
    if (!searchQ || searchQ.length < 2) return [];
    const q = searchQ.toLowerCase();
    const results = [];
    Object.entries(DATA).forEach(([cityId, spotList]) => {
      spotList.forEach(spot => {
        if ([spot.name,spot.desc,spot.addr,spot.cat].some(s=>s?.toLowerCase().includes(q)))
          results.push({...spot, cityId});
      });
    });
    myFinds.forEach(f => {
      if ([f.name,f.desc,f.addr,f.cat].some(s=>s?.toLowerCase().includes(q)))
        results.push({...f, cityId:f.city, isMyFind:true});
    });
    return results.slice(0,50);
  }, [searchQ, myFinds]);

  // ── Card component
  const SpotCard = ({spot, cityId, idx, isOpen, isActive, onToggle, showCityBadge}) => {
    const ci = CAT_MAP[spot.cat];
    const color = spot.isMyFind ? "#FFE566" : (ci?.color || C.text);
    return (
      <div ref={el => { if(cityId===city) cardRefs.current[idx]=el; }} onClick={onToggle}
        style={{background:isOpen?"#2E2550":"#271F45",border:`1px solid ${isActive||isOpen?color:"#4A4070"}`,borderLeft:`5px solid ${color}`,borderRadius:8,padding:"12px 14px 12px 12px",cursor:"pointer",position:"relative",boxSizing:"border-box",width:"100%"}}>
        {spot.tourist===1 && (
          <div style={{position:"absolute",top:0,right:0,background:"rgba(255,140,112,0.3)",color:"#FFB38A",fontSize:9,fontWeight:700,letterSpacing:"0.1em",padding:"3px 8px",borderBottomLeftRadius:6,lineHeight:"16px"}}>⚠ TOURIST MAGNET</div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7,flexWrap:"wrap"}}>
          <div style={{display:"inline-block",background:color+"33",border:`1px solid ${color}88`,color,fontSize:10,fontWeight:700,letterSpacing:"0.1em",padding:"2px 9px",borderRadius:20,lineHeight:"16px"}}>{spot.isMyFind?"⭐ MY FIND":(ci?.label||spot.cat)}</div>
          {spot.price && <div style={{display:"inline-block",background:"#ffffff15",color:"#FFE566",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,lineHeight:"16px"}}>{PL[spot.price]}</div>}
          {spot.hours && <div style={{display:"inline-block",background:"#ffffff0d",color:"#B0A0C8",fontSize:10,padding:"2px 8px",borderRadius:20,lineHeight:"16px"}}>⏰ {spot.hours}</div>}
          {showCityBadge && <div style={{display:"inline-block",background:"#2A2050",color:C.muted,fontSize:10,padding:"2px 8px",borderRadius:20,lineHeight:"16px"}}>{CITIES.find(c=>c.id===cityId)?.emoji} {cityId?.toUpperCase()}</div>}
        </div>
        <div style={{fontFamily:"Impact,'Arial Black',Arial,sans-serif",fontSize:17,fontWeight:900,color:"#FFFFFF",letterSpacing:"0.04em",lineHeight:"22px",marginBottom:5,paddingRight:24,display:"block",visibility:"visible",opacity:1}}>
          {spot.name.replace(/^⚠ /,"")}
        </div>
        <div style={{fontSize:11,color:"#B0A0D8",lineHeight:"16px",display:"block",marginBottom:isOpen?10:0}}>📍 {spot.addr}</div>
        {isOpen && (
          <div style={{marginTop:4}}>
            <p style={{fontSize:13,lineHeight:"22px",color:"#D8CCEE",marginBottom:12,display:"block"}}>{spot.desc}</p>
            {spot.tip && (
              <div style={{background:color+"22",borderLeft:`3px solid ${color}`,padding:"10px 12px",borderRadius:"0 8px 8px 0",marginBottom:12}}>
                <div style={{fontSize:10,color,fontWeight:700,letterSpacing:"0.14em",marginBottom:4,lineHeight:"16px"}}>💡 LOCAL TIP</div>
                <p style={{fontSize:12,color:"#C8BCEC",lineHeight:"20px",display:"block"}}>{spot.tip}</p>
              </div>
            )}
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name.replace(/^⚠ /,"")+" "+spot.addr)}`}
               target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
               style={{fontSize:10,color:"#B0A0D8",textDecoration:"none",border:"1px solid #5A4A80",padding:"5px 12px",borderRadius:4,letterSpacing:"0.1em",display:"inline-block",background:"rgba(255,255,255,0.05)",lineHeight:"16px"}}>
              OPEN IN GOOGLE MAPS ↗
            </a>
          </div>
        )}
        <div style={{position:"absolute",top:"50%",right:12,transform:isOpen?"translateY(-50%) rotate(180deg)":"translateY(-50%)",color:isOpen?color:"#7060A0",fontSize:12,lineHeight:1}}>▼</div>
      </div>
    );
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Josefin Sans','Segoe UI',Arial,sans-serif",color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Josefin+Sans:wght@300;400;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#1B1730;}
        ::-webkit-scrollbar-thumb{background:#FF6EB4;border-radius:3px;}
        .leaflet-popup-content-wrapper{background:#2A2050!important;border:1px solid #5A4A80!important;border-radius:8px!important;box-shadow:0 4px 20px #00000099!important;}
        .leaflet-popup-tip{background:#2A2050!important;}
        .leaflet-container{background:#1a1530!important;}
        .dark-tiles{filter:invert(1) hue-rotate(200deg) brightness(0.75) saturate(0.6) contrast(0.9);}
        input,textarea,select{outline:none;} input:focus,textarea:focus,select:focus{border-color:#FF6EB4!important;}
        .scroll-x{display:flex;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap;}
        .scroll-x::-webkit-scrollbar{display:none;}
        @media(max-width:767px){
          .nav-tabs{overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap!important;}
          .nav-tabs::-webkit-scrollbar{display:none;}
          .header-row{flex-wrap:nowrap!important;align-items:center;}
          .header-title{flex-shrink:0;}
        }
        .stripe{background:repeating-linear-gradient(90deg,#FF6EB4 0 9.09%,#FF8C70 9.09% 18.18%,#FFE566 18.18% 27.27%,#2DFFC8 27.27% 36.36%,#C0A8FF 36.36% 45.45%,#7BFF8C 45.45% 54.54%,#FFB347 54.54% 63.63%,#FF9F43 63.63% 72.72%,#E879F9 72.72% 81.81%,#60BFFF 81.81% 100%);height:4px;}
      `}</style>

      {/* ── HEADER */}
      <div style={{background:"linear-gradient(135deg,#110D22,#1F1440 50%,#2A1858)",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 30px #00000088"}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"0 16px"}}>
          <div className="header-row" style={{display:"flex",alignItems:"center",gap:isMobile?8:16,padding:"10px 0 0",flexWrap:isMobile?"nowrap":"wrap"}}>
            <div className="header-title" style={{flexShrink:0}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,Arial,sans-serif",fontSize:isMobile?"clamp(18px,5vw,28px)":"clamp(22px,4vw,42px)",letterSpacing:"0.06em",lineHeight:1,background:"linear-gradient(90deg,#FF6EB4,#FF8C70,#FFE566)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",display:"block"}}>
                JAPAN 2026
              </div>
              {!isMobile && <div style={{fontSize:10,color:C.muted,letterSpacing:"0.2em",fontWeight:600,marginTop:2}}>UNDERGROUND TRAVEL GUIDE ▸ 24 MAR – 15 APR</div>}
            </div>
            <div style={{flex:1}}/>
            <div className="nav-tabs" style={{display:"flex",gap:isMobile?0:2,flexShrink:0}}>
              {VIEWS.map(v => {
                const active = view===v.id;
                return (
                  <button key={v.id} onClick={()=>setView(v.id)}
                    style={{background:active?"rgba(255,110,180,0.18)":"transparent",border:"none",borderBottom:active?"2px solid #FF6EB4":"2px solid transparent",color:active?"#FF6EB4":C.dim,fontFamily:"'Bebas Neue',Impact,Arial,sans-serif",fontSize:isMobile?"11px":"clamp(11px,1.4vw,14px)",letterSpacing:"0.08em",padding:isMobile?"7px 8px 6px":"8px 12px 7px",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>
                    {v.icon} {v.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="stripe" style={{margin:"8px -16px 0"}}/>
          {view==="guide" && (
            <div style={{display:"flex",gap:1,overflowX:"auto",scrollbarWidth:"none",padding:"6px 0 0"}}>
              {CITIES.map(c => {
                const active = city===c.id, bl = BLOSSOM[c.id];
                return (
                  <button key={c.id} onClick={()=>{setCity(c.id);setCat("all");setExpanded(null);setActivePin(null);}}
                    style={{background:active?"rgba(255,110,180,0.15)":"transparent",border:"none",borderBottom:active?"2px solid #FF6EB4":"2px solid transparent",color:active?"#FF6EB4":C.dim,fontFamily:"'Bebas Neue',Impact,Arial,sans-serif",fontSize:"clamp(9px,1.3vw,13px)",letterSpacing:"0.1em",padding:"8px 9px 7px",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>
                    {c.emoji} {c.label}
                    <div style={{fontSize:9,fontFamily:"Arial,sans-serif",fontWeight:300,letterSpacing:"0.1em",color:active?C.muted:C.dim}}>
                      {c.sub} {bl && <span>{bl.pct>=80?"🌸":bl.pct>=50?"🌷":"🍃"}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{maxWidth:1320,margin:"0 auto",padding:isMobile?"0 10px":"0 16px"}}>

        {/* ══ EXPLORE VIEW ══ */}
        {view==="guide" && (
          <>
            {/* ── Weather badge in explore ── */}
            {cityInfo && (()=>{
              const today = new Date().toISOString().slice(0,10);
              const wx = weather[today]?.[cityInfo.id];
              return wx ? (
                <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(0,207,207,0.08)",border:"1px solid rgba(0,207,207,0.25)",borderRadius:8,padding:"8px 14px",marginBottom:8}}>
                  <span style={{fontSize:22}}>{wx.icon}</span>
                  <div>
                    <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:13,color:"#00CFCF",letterSpacing:"0.08em"}}>TODAY IN {cityInfo.label}</div>
                    <div style={{fontSize:12,color:C.text,fontWeight:700}}>{wx.hi}°C / {wx.lo}°C {wx.rain>0?`· ${wx.rain}mm rain`:""}</div>
                  </div>
                </div>
              ) : null;
            })()}
            {cityInfo && BLOSSOM[cityInfo.id] && (
              <div style={{background:"#241840",border:"1px solid #4A3060",borderRadius:8,padding:"10px 14px",margin:"12px 0 10px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:14,color:"#FF9F43",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>🌸 CHERRY BLOSSOM</div>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontFamily:"Impact,Arial,sans-serif",fontSize:13,color:"#FFF",letterSpacing:"0.03em"}}>{BLOSSOM[cityInfo.id].status}</span>
                    <div style={{flex:1,height:5,background:"#3A2A50",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${BLOSSOM[cityInfo.id].pct}%`,background:"linear-gradient(90deg,#FF6EB4,#FFB347)",borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:11,color:C.muted,whiteSpace:"nowrap"}}>{BLOSSOM[cityInfo.id].pct}%</span>
                  </div>
                  <div style={{fontSize:11,color:"#A898C8",lineHeight:"16px"}}>{BLOSSOM[cityInfo.id].detail}</div>
                </div>
              </div>
            )}

            <div style={{padding:"8px 0",display:"flex",flexWrap:isMobile?"nowrap":"wrap",alignItems:"center",gap:isMobile?"8px":"6px 12px",borderBottom:`1px solid ${C.border}`,marginBottom:14,overflowX:isMobile?"auto":"visible",scrollbarWidth:"none"}}>
              {!isMobile && <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:"clamp(13px,2vw,20px)",color:C.text,letterSpacing:"0.04em",flexShrink:0}}>
                {cityInfo?.emoji} {cityInfo?.label} — {cityInfo?.sub}
                <span style={{fontSize:11,color:C.dim,fontFamily:"Arial,sans-serif",marginLeft:8}}>{spots.length} SPOTS</span>
              </div>}
              <div className="scroll-x" style={{gap:4,marginLeft:isMobile?"0":"auto",flexShrink:isMobile?0:undefined}}>
                {CATS.map(c=>{
                  const active=cat===c.id;
                  return (
                    <button key={c.id} onClick={()=>{setCat(c.id);setExpanded(null);}}
                      style={{background:active?c.color+"22":"transparent",border:`1px solid ${active?c.color:C.border}`,color:active?c.color:C.muted,fontFamily:"Arial,sans-serif",fontWeight:active?700:400,fontSize:10,letterSpacing:"0.06em",padding:"3px 9px",cursor:"pointer",borderRadius:20,transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0}}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"minmax(0,1fr) minmax(0,1fr)",gap:16,alignItems:"start"}}>
              {isMobile && (
                <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,height:"250px",marginBottom:4}}>
                  <div ref={mapRef} style={{width:"100%",height:"100%"}}/>
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:isMobile?"none":"calc(100vh - 300px)",overflowY:isMobile?"visible":"auto",paddingRight:isMobile?0:4,paddingBottom:40}}>
                {spots.map((spot,i)=>{
                  const id=`${city}-${i}`;
                  return <SpotCard key={id} spot={spot} cityId={city} idx={i} isOpen={expanded===id} isActive={activePin===i} onToggle={()=>toggle(id,i)}/>;
                })}
              </div>
              {!isMobile && (
                <div style={{position:"sticky",top:182,height:"calc(100vh - 300px)"}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
                    {CATS.filter(c=>c.id!=="all").map(c=>(
                      <div key={c.id} style={{display:"flex",alignItems:"center",gap:3,background:c.color+"12",border:`1px solid ${c.color}33`,borderRadius:10,padding:"1px 6px"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:c.color}}/>
                        <span style={{fontSize:9,color:c.color,fontWeight:600}}>{c.label}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",alignItems:"center",gap:3,background:"#FFE56612",border:"1px solid #FFE56633",borderRadius:10,padding:"1px 6px"}}>
                      <div style={{width:6,height:6,background:"#FFE566",transform:"rotate(45deg)"}}/>
                      <span style={{fontSize:9,color:"#FFE566",fontWeight:600}}>⭐ MY FINDS</span>
                    </div>
                  </div>
                  <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,height:"420px"}}>
                    <div ref={mapRef} style={{width:"100%",height:"100%"}}/>
                  </div>
                </div>
              )}
            </div>

            <div style={{borderTop:`1px solid ${C.border}`,padding:"18px 0 40px",marginTop:12,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
              {wxErr && <div style={{background:"rgba(255,110,67,0.1)",border:"1px solid rgba(255,110,67,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#FF8C70",marginBottom:12}}>⚠️ Weather forecast unavailable — check back when connected.</div>}
              {[["📡 EVENTS","Check RA and venue Instagram/LINE. Many underground events aren't listed anywhere else."],["💴 CASH","Most clubs cash-only. 7-Eleven and FamilyMart ATMs accept foreign cards. Bring ¥20k+ for a night out."],["🧳 LUGGAGE","Yamato Transport: send bags hotel-to-hotel or to the airport. ¥1,500–2,500/bag."],["🚆 JR PASS","Activate at KIX airport. IC card (ICOCA) for local trains. Last train ~midnight."],["🏷 TAX FREE","Ask for 免税 (menzei) for purchases over ¥5,000 with passport."],["🌸 BLOSSOM","Peak: Osaka 28 Mar, Hiroshima 25 Mar, Kyoto 1–5 Apr. Tokyo past peak by your arrival."]].map(([t,d])=>(
                <div key={t} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 13px"}}>
                  <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:13,color:C.pink,letterSpacing:"0.1em",marginBottom:5}}>{t}</div>
                  <p style={{fontSize:11,color:C.muted,lineHeight:"17px"}}>{d}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ ITINERARY VIEW ══ */}
        {view==="itin" && (
          <div style={{padding:"16px 0 60px"}}>
            <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:"clamp(18px,3vw,30px)",color:C.text,letterSpacing:"0.06em",marginBottom:4}}>📅 DAY-BY-DAY ITINERARY</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:20,letterSpacing:"0.1em"}}>BASED ON YOUR FRIEND'S PLAN + YOUR PERSONALISED PICKS — CLICK ANY PICK TO JUMP TO IT IN EXPLORE</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {ITIN.map((day,i)=>{
                const cityObj=CITIES.find(c=>c.id===day.city), bl=BLOSSOM[day.city];
                return (
                  <div key={i} style={{background:"#231D3A",border:"1px solid #3D3560",borderRadius:10,overflow:"hidden"}}>
                    <div style={{background:"#1F1840",padding:"11px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",borderBottom:"1px solid #3D3560"}}>
                      <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:22,color:"#FF6EB4",letterSpacing:"0.04em",lineHeight:1,minWidth:80}}>{day.date}</div>
                      <div style={{fontSize:10,color:C.dim,letterSpacing:"0.14em"}}>{day.day}</div>
                      <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:15,color:"#FFF",letterSpacing:"0.04em",flex:1}}>{day.label}</div>
                      <div style={{fontSize:11,color:C.muted,background:"#2A2050",padding:"4px 10px",borderRadius:12}}>{cityObj?.emoji} {cityObj?.label}</div>
                      {bl && <div style={{fontSize:11,color:"#FF9F43",background:"rgba(255,159,67,0.12)",border:"1px solid rgba(255,159,67,0.3)",padding:"4px 10px",borderRadius:12}}>{bl.status}</div>}
                      {(()=>{
                        // Convert displayed date to ISO: "26 MAR" -> "2026-03-26"
                        const months={JAN:"01",FEB:"02",MAR:"03",APR:"04",MAY:"05"};
                        const parts = day.date.split(" ");
                        const iso = parts.length===2 ? `2026-${months[parts[1]]||"03"}-${parts[0].padStart(2,"0")}` : null;
                        const wx = iso && weather[iso] && weather[iso][day.city];
                        if (!wx) return wxLoading ? <div style={{fontSize:11,color:C.dim,padding:"4px 10px",borderRadius:12}}>🌡️ fetching…</div> : null;
                        return (
                          <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(0,207,207,0.10)",border:"1px solid rgba(0,207,207,0.3)",padding:"4px 10px",borderRadius:12,fontSize:11,color:"#00CFCF",fontWeight:700,whiteSpace:"nowrap"}}>
                            <span style={{fontSize:14}}>{wx.icon}</span>
                            <span>{wx.hi}°/{wx.lo}°C</span>
                            {wx.rain>0 && <span style={{color:"#7BCFFF"}}>💧{wx.rain}mm</span>}
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{padding:"12px 16px"}}>
                      <p style={{fontSize:13,lineHeight:"22px",color:"#C8BCEC",marginBottom:day.picks?.length?12:0,display:"block"}}>{day.note}</p>
                      {day.picks?.length>0 && (
                        <div>
                          <div style={{fontSize:10,color:"#FF6EB4",fontWeight:700,letterSpacing:"0.12em",marginBottom:7}}>🎯 PICKS FOR THIS DAY</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            {day.picks.map((pick,j)=>{
                              const sd=DATA[day.city]?.find(s=>s.name.replace(/^⚠ /,"").toLowerCase()===pick.toLowerCase());
                              const color=sd?CAT_MAP[sd.cat]?.color:C.muted;
                              return (
                                <button key={j}
                                  onClick={()=>{
                                    setView("guide"); setCity(day.city); setCat("all");
                                    setTimeout(()=>{
                                      const idx=DATA[day.city]?.findIndex(s=>s.name.replace(/^⚠ /,"").toLowerCase()===pick.toLowerCase());
                                      if(idx>=0){setExpanded(`${day.city}-${idx}`);setActivePin(idx);cardRefs.current[idx]?.scrollIntoView({behavior:"smooth"});}
                                    },300);
                                  }}
                                  style={{background:(color||C.muted)+"22",border:`1px solid ${(color||C.muted)}66`,color:color||C.muted,fontSize:11,padding:"5px 12px",borderRadius:20,cursor:"pointer",fontFamily:"Arial,sans-serif",fontWeight:600,letterSpacing:"0.05em"}}>
                                  {pick}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ SEARCH VIEW ══ */}
        {view==="search" && (
          <div style={{padding:"20px 0 60px"}}>
            <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:"clamp(18px,3vw,30px)",color:C.text,letterSpacing:"0.06em",marginBottom:14}}>🔍 SEARCH ALL CITIES</div>
            <input type="text" placeholder={`Search across all spots in 7 cities + your saved finds...`}
              value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              style={{width:"100%",background:"#271F45",border:"2px solid #4A4070",borderRadius:8,padding:"14px 18px",fontSize:16,color:"#FFF",fontFamily:"Arial,sans-serif",marginBottom:14}}/>
            {searchQ.length>=2 && <div style={{fontSize:11,color:C.muted,letterSpacing:"0.1em",marginBottom:12}}>{searchResults.length} RESULTS FOR "{searchQ.toUpperCase()}"</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {searchResults.map((spot,i)=>(
                <div key={i} onClick={()=>{setView("guide");setCity(spot.cityId);setCat("all");setTimeout(()=>{const idx=DATA[spot.cityId]?.findIndex(s=>s.name===spot.name);if(idx>=0){setExpanded(`${spot.cityId}-${idx}`);setActivePin(idx);}},250);}}>
                  <SpotCard spot={spot} cityId={spot.cityId} idx={i} isOpen={false} isActive={false} onToggle={()=>{}} showCityBadge={true}/>
                </div>
              ))}
              {searchQ.length<2 && (
                <div style={{textAlign:"center",padding:"50px 20px",color:C.dim,fontSize:14}}>
                  <div style={{fontSize:36,marginBottom:10}}>🔍</div>
                  <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:18,color:C.muted,letterSpacing:"0.1em"}}>TYPE TO SEARCH ACROSS ALL CITIES</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MY FINDS VIEW ══ */}
        {view==="myfinds" && (
          <div style={{padding:"20px 0 60px"}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:"clamp(18px,3vw,30px)",color:C.text,letterSpacing:"0.06em"}}>⭐ MY FINDS</div>
                <div style={{fontSize:11,color:C.muted,letterSpacing:"0.1em",marginTop:2}}>SAVED PERMANENTLY — APPEAR ON THE MAP AND IN SEARCH</div>
              </div>
              <button onClick={()=>setShowForm(!showForm)}
                style={{marginLeft:"auto",background:showForm?"#4A3060":"rgba(255,110,180,0.2)",border:"2px solid #FF6EB4",color:"#FF6EB4",fontFamily:"Impact,Arial,sans-serif",fontSize:14,letterSpacing:"0.1em",padding:"10px 20px",borderRadius:8,cursor:"pointer"}}>
                {showForm?"✕ CANCEL":"+ ADD NEW FIND"}
              </button>
            </div>

            {showForm && (
              <div style={{background:"#231D3A",border:"1px solid #5A4A80",borderRadius:10,padding:"20px",marginBottom:20}}>
                <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:16,color:"#FF6EB4",letterSpacing:"0.1em",marginBottom:16}}>NEW FIND</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[{k:"name",l:"Name *",p:"e.g. Secret Record Shop",full:true},{k:"addr",l:"Address",p:"Area, Ward, City",full:true},{k:"hours",l:"Hours",p:"e.g. 11:00–20:00"},{k:"lat",l:"Latitude (optional)",p:"e.g. 35.6762"},{k:"lng",l:"Longitude (optional)",p:"e.g. 139.6503"}].map(({k,l,p,full})=>(
                    <div key={k} style={{gridColumn:full?"1/-1":"auto"}}>
                      <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:"0.12em",fontWeight:700,marginBottom:5}}>{l}</label>
                      <input type="text" placeholder={p} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                        style={{width:"100%",background:"#1B1730",border:"1px solid #4A4070",borderRadius:6,padding:"10px 12px",fontSize:13,color:"#FFF",fontFamily:"Arial,sans-serif"}}/>
                    </div>
                  ))}
                  {[{k:"cat",l:"Category",opts:CATS.filter(c=>c.id!=="all").map(c=>({v:c.id,t:c.label}))},{k:"city",l:"City",opts:CITIES.map(c=>({v:c.id,t:`${c.emoji} ${c.label}`}))},{k:"price",l:"Price",opts:[{v:1,t:"¥ Cheap"},{v:2,t:"¥¥ Mid-range"},{v:3,t:"¥¥¥ Splurge"}]}].map(({k,l,opts})=>(
                    <div key={k}>
                      <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:"0.12em",fontWeight:700,marginBottom:5}}>{l}</label>
                      <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:k==="price"?parseInt(e.target.value):e.target.value}))}
                        style={{width:"100%",background:"#1B1730",border:"1px solid #4A4070",borderRadius:6,padding:"10px 12px",fontSize:13,color:"#FFF",fontFamily:"Arial,sans-serif"}}>
                        {opts.map(o=><option key={o.v} value={o.v}>{o.t}</option>)}
                      </select>
                    </div>
                  ))}
                  {[{k:"desc",l:"Notes",p:"What you found, why it's great...",rows:3},{k:"tip",l:"Your Tip",p:"Anything to remember for next time...",rows:2}].map(({k,l,p,rows})=>(
                    <div key={k} style={{gridColumn:"1/-1"}}>
                      <label style={{display:"block",fontSize:10,color:C.muted,letterSpacing:"0.12em",fontWeight:700,marginBottom:5}}>{l}</label>
                      <textarea placeholder={p} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={rows}
                        style={{width:"100%",background:"#1B1730",border:"1px solid #4A4070",borderRadius:6,padding:"10px 12px",fontSize:13,color:"#FFF",fontFamily:"Arial,sans-serif",resize:"vertical"}}/>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{
                  if(!form.name.trim())return;
                  saveFind({...form});
                  setForm({name:"",cat:"food",city:"osaka",addr:"",lat:"",lng:"",desc:"",hours:"",price:1,tip:""});
                  setShowForm(false);
                }} style={{marginTop:16,background:"linear-gradient(90deg,#FF6EB4,#FF8C70)",border:"none",color:"#1B1730",fontFamily:"Impact,Arial,sans-serif",fontSize:15,letterSpacing:"0.12em",padding:"12px 30px",borderRadius:8,cursor:"pointer"}}>
                  SAVE FIND ⭐
                </button>
              </div>
            )}

            {myFinds.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 20px",color:C.dim,border:"2px dashed #3D3560",borderRadius:10}}>
                <div style={{fontSize:40,marginBottom:12}}>⭐</div>
                <div style={{fontFamily:"Impact,Arial,sans-serif",fontSize:18,color:C.muted,letterSpacing:"0.1em",marginBottom:8}}>NO FINDS YET</div>
                <div style={{fontSize:13,lineHeight:"20px"}}>Add spots you discover whilst exploring Japan.<br/>They'll appear on the map and in search — saved permanently even after closing the app.</div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {myFinds.map((find,i)=>{
                  const ci=CAT_MAP[find.cat], color=ci?.color||C.text, cityObj=CITIES.find(c=>c.id===find.city);
                  return (
                    <div key={find.id||i} style={{background:"#271F45",border:`1px solid #4A4070`,borderLeft:`5px solid ${color}`,borderRadius:8,padding:"12px 14px",position:"relative"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                        <div style={{background:color+"33",border:`1px solid ${color}88`,color,fontSize:10,fontWeight:700,letterSpacing:"0.1em",padding:"2px 9px",borderRadius:20,lineHeight:"16px"}}>{ci?.label||find.cat}</div>
                        <div style={{fontSize:10,color:C.muted,background:"#2A2050",padding:"2px 9px",borderRadius:20,lineHeight:"16px"}}>{cityObj?.emoji} {cityObj?.label}</div>
                        {find.price && <div style={{fontSize:10,color:"#FFE566",background:"#ffffff12",padding:"2px 8px",borderRadius:20,lineHeight:"16px"}}>{PL[find.price]}</div>}
                        {find.hours && <div style={{fontSize:10,color:"#B0A0C8",background:"#ffffff0d",padding:"2px 8px",borderRadius:20,lineHeight:"16px"}}>⏰ {find.hours}</div>}
                        {find.lat && find.lng && <div style={{fontSize:10,color:"#7BFF8C",background:"rgba(123,255,140,0.1)",padding:"2px 8px",borderRadius:20,lineHeight:"16px"}}>📍 ON MAP</div>}
                        <div style={{fontSize:10,color:C.yellow,marginLeft:"auto"}}>YOUR FIND ⭐</div>
                      </div>
                      <div style={{fontFamily:"Impact,'Arial Black',Arial,sans-serif",fontSize:17,fontWeight:900,color:"#FFF",lineHeight:"22px",marginBottom:5}}>{find.name}</div>
                      {find.addr && <div style={{fontSize:11,color:"#B0A0D8",lineHeight:"16px",marginBottom:find.desc?8:0}}>📍 {find.addr}</div>}
                      {find.desc && <p style={{fontSize:13,lineHeight:"20px",color:"#C8BCEC",display:"block",marginBottom:find.tip?8:0}}>{find.desc}</p>}
                      {find.tip && <p style={{fontSize:12,lineHeight:"18px",color:"#A898C0",display:"block",fontStyle:"italic"}}>💡 {find.tip}</p>}
                      <button onClick={()=>deleteFind(find.id)}
                        style={{position:"absolute",top:12,right:12,background:"rgba(255,80,80,0.15)",border:"1px solid rgba(255,80,80,0.3)",color:"#FF8080",fontSize:11,padding:"4px 8px",borderRadius:4,cursor:"pointer"}}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
