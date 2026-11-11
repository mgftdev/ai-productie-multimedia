/* Web deck: 3D overview intro → slides with Morph-style transitions (GSAP). */
(() => {
  const W = 1600, H = 900;
  const body = document.body;
  const stage = document.getElementById("stage");
  const deck = stage.querySelector(".deck");
  const slides = [...deck.querySelectorAll(".slide")];
  const N = slides.length;
  const g1 = stage.querySelector(".g1"), g2 = stage.querySelector(".g2");
  let scale = 1, cur = 0, mode = "overview", busy = false, floatTw = null;
  gsap.defaults({ overwrite: "auto" });
  gsap.config({ nullTargetWarn: false }); // some slides simply have nothing of a given kind to animate // a new tween on the same property replaces the old one (e.g. starting during the intro)

  /* ---------- content ---------- */
  const MILESTONES = [
    ["1950", "Alan Turing", "„Pot mașinile să gândească?” — propune Testul Turing."],
    ["1955", "John McCarthy", "Folosește pentru prima dată termenul „Artificial Intelligence”."],
    ["1956", "Dartmouth", "Conferința care fondează AI ca domeniu de cercetare.", true],
    ["1980+", "Machine Learning", "Calculatorul învață din exemple, nu din reguli scrise de mână."],
    ["2012", "Deep Learning", "AlexNet: rețele neuronale mari antrenate pe plăci video (GPU)."],
    ["2017", "Transformers", "„Attention Is All You Need” — arhitectura din spatele GPT.", true],
    ["2022", "ChatGPT", "30 noiembrie: AI generativ accesibil oricui, prin conversație.", true],
    ["2026", "AI Agents", "Modele multimodale care planifică și acționează."],
  ];
  // [name, logo, products, country, open-weight?, one-line description (shown on hover)]
  const COMPANIES = [
    ["OpenAI", "openai", ["ChatGPT", "GPT Image", "Codex"], "SUA", false, "Creatorul ChatGPT"],
    ["Google", "google", ["Gemini", "Veo", "Nano Banana"], "SUA", false, "Google DeepMind"],
    ["Anthropic", "anthropic", ["Claude", "Claude Code", "MCP"], "SUA", false, "Claude și standardul MCP"],
    ["Microsoft", "microsoft", ["Copilot", "Azure AI"], "SUA", false, "AI în Windows și Office"],
    ["Meta", "meta", ["Llama", "Meta AI"], "SUA", true, "Modele Llama deschise"],
    ["Adobe", "adobe", ["Firefly", "Creative Cloud"], "SUA", false, "AI pentru creativi"],
    ["ByteDance", "bytedance", ["Seedance", "CapCut"], "China", false, "Compania din spatele TikTok"],
    ["Alibaba", "alibabacloud", ["Qwen", "Wan"], "China", true, "Modele Qwen deschise"],
    ["DeepSeek", null, ["DeepSeek V3", "R1"], "China", true, "Modele eficiente, deschise"],
  ];
  const NOTES = [
    `DESCHIDERE (≈2 min)
Bună ziua! Astăzi vorbim despre Inteligența Artificială și despre felul în care schimbă producția multimedia — exact meseria pentru care vă pregătiți.
• Ce este AI? Un sistem software care învață din date: vede multe exemple, descoperă tipare și le folosește ca să recunoască, să decidă sau să rezolve probleme.
• Ce este Generative AI? AI care CREEAZĂ conținut nou — text, imagini, video, voce, muzică, cod — pornind de la un prompt.
• AI în viața de zi cu zi: deblocarea telefonului cu fața, traduceri, recomandările de pe YouTube/Netflix/Spotify, filtre foto, asistenți vocali.
Întrebare pentru sală: „Cine a folosit azi, conștient, un instrument AI? Și cine fără să știe?”
Imaginea de fundal (capul din crom și sticlă) a fost generată cu AI pentru această prezentare.`,
    `CINE SUNT EU? (≈2 min) — slide de completat.
Aici vă prezentați: ce faceți, cu ce vă ocupați, proiectele și experiența voastră cu AI.`,
    `AGENDA (≈1 min) — 4 capitole, de la bază la practică:
• Fundamente — istoria AI, cine construiește AI, ce sunt modelele.
• Generare — imagine, video, audio: ce pot face instrumentele azi.
• În practică — pipeline-ul creativ, agenții AI și MCP, fluxul meu de lucru, cât costă.
• Încheiere — limite și viitor, demonstrația de la idee la produs final, surse.
Click pe orice titlu din agendă sare direct la acel slide (util la întrebări); Esc arată toate slide-urile.`,
    `ISTORIA AI (≈3 min) — linia se desenează singură; treceți cu mouse-ul peste ani pentru detalii.
• 1950 — Alan Turing: „Computing Machinery and Intelligence”, Testul Turing.
• 1955 — John McCarthy propune termenul „Artificial Intelligence”.
• 1956 — Conferința de la Dartmouth: nașterea AI ca domeniu.
• Anii ’80–2000 — Machine Learning: învățare din date, nu reguli.
• 2012 — Deep Learning: AlexNet, rețele neuronale + GPU.
• 2017 — „Attention Is All You Need” (Google) — Transformer, „T”-ul din GPT.
• 30.11.2022 — ChatGPT: AI generativ pentru toată lumea.
• 2026 — AI Agents: modele multimodale care planifică și execută sarcini.
Ideea: întrebarea s-a schimbat din „poate gândi o mașină?” în „cum creăm împreună cu ea?”.
Surse: Turing (1950); McCarthy et al. (1955); Krizhevsky et al. (2012); Vaswani et al. (2017); OpenAI (2022).`,
    `COMPANIILE (≈3 min)
• OpenAI — ChatGPT (GPT-6, oct. 2026), GPT Image, Codex. Aplicația video Sora a fost închisă în 2026 (anunț 24.03.2026).
• Google — Gemini (Gemini 4), Veo, Nano Banana, Flow.
• Anthropic — Claude, Claude Code și standardul deschis MCP.
• Microsoft — Copilot, Azure AI Foundry, modele MAI.
• Meta — Llama (open-weight), Meta AI, Vibes.
• Adobe — Firefly, antrenat pe conținut licențiat; AI în Photoshop, Premiere Pro, Express.
• ByteDance — Doubao, Seedance, Seedream, CapCut.
• Alibaba — Qwen (cele mai descărcate modele deschise în 2026), Wan.
• DeepSeek — modele open-weight eficiente (V3, R1).
Mesaj: o competiție globală, între modele închise și deschise. Verificat în noiembrie 2026.`,
    `MODELE AI (≈3 min) — cardurile de sticlă: cu cât sticla e mai transparentă, cu atât modelul e mai deschis.
• Ce este un model AI? Un fișier foarte mare, cu miliarde de numere („greutăți” / weights), obținut prin antrenare pe date — un „creier” software care generează răspunsuri pe baza tiparelor învățate.
• Closed (proprietare): le folosim doar prin aplicația sau API-ul companiei — GPT, Gemini, Claude, Midjourney.
• Open-weight: descărcăm greutățile și rulăm modelul local, dar licența poate avea restricții (ex. uz necomercial) — Llama, Qwen, DeepSeek, FLUX.2 [dev].
• Open-source în sens strict (definiția OSI 1.0): greutăți + cod + informații despre datele de antrenare, sub licență deschisă — OLMo (AI2), Pythia (EleutherAI).
• Public vs. privat: publice = oricine își face cont (ChatGPT, Gemini, Claude.ai, Firefly); private / enterprise = rulează în cloud privat sau pe serverele firmei, pe date interne, cu reguli de securitate.
• Unde găsim modele: Hugging Face („GitHub-ul AI-ului”), GitHub, Replicate, Civitai, LMArena (clasamente).
• 3M+: Hugging Face a depășit 3 milioane de repository-uri publice de modele în 2026; cifra depinde de cum numărăm versiunile și variantele.
Surse: Hugging Face blog, „Three Million Models and Counting” (2026); Open Source Initiative, Open Source AI Definition 1.0 (2024).`,
    `IMAGE GENERATION (≈3 min)
Instrumentele (rândul de sus):
• Midjourney — estetică artistică; versiunea 8 implicită în 2026.
• Adobe Firefly — antrenat pe conținut licențiat, gândit pentru uz comercial; integrat în Photoshop (Generative Fill). Model curent: Firefly Image 5.
• FLUX — Black Forest Labs; FLUX.2 are variante comerciale (Pro, Max) și open-weight (dev, klein).
• ChatGPT Images — GPT Image: generezi și editezi vorbind cu ChatGPT.
• Google Nano Banana — modelul de imagine din Gemini; editări precise, același personaj în mai multe imagini.
Text-to-Image (stânga): promptul se scrie, apoi imaginea „se developează” din zgomot — exact așa lucrează modelele de difuzie: pornesc de la zgomot și îl curăță pas cu pas, ghidate de text. În colț: o fotografie de produs „imposibilă” făcută cu FLUX.2 Pro.
Image-to-Image (dreapta): pornim de la o imagine + o instrucțiune. Trageți de slider ca să comparați originalul cu varianta anime.
Sfat: un prompt bun descrie subiectul, acțiunea, locul, lumina, stilul și cadrul.
Transparență: imaginile au fost generate pentru prezentare (Magnific/Freepik: Nano Banana 2.1, FLUX.2 Pro).
Surse: docs.midjourney.com; adobe.com/products/firefly; bfl.ai; openai.com; deepmind.google.`,
    `VIDEO GENERATION (≈4 min) — lăsați clipul să ruleze câteva secunde înainte să vorbiți.
• Ecranul mare — Image-to-Video: cadrul de start (dreapta sus, generat cu Nano Banana 2.1) a fost animat de Kling 2.5, cu mișcare de cameră „dolly-in”, ploaie și reflexii.
• Dreapta jos — Text-to-Video: doar din descriere, o cocoară origami „prinde viață” și zboară.
Concepte (jos):
• Text-to-Video — descrii scena, modelul generează clipul (de obicei 5–15 s, unele modele până la 30 s).
• Image-to-Video — pornești de la o imagine (primul cadru), pentru control mai bun al compoziției.
• Camera movement — dolly, pan, orbit, dronă: cerute în prompt sau alese din presetări.
• Character consistency — același personaj, cu aceeași față și haine, în scene diferite.
• AI video editing — modifici un clip existent prin text (Runway Aleph, Firefly în Premiere — Generative Extend).
Instrumente (sus):
• Higgsfield — platformă care reunește mai multe modele video, cu presetări de cameră.
• Kling AI (Kuaishou) — Kling 3.0 în februarie 2026; Kling 4.0 anunțat în septembrie 2026.
• Runway — Gen-4.5 și Aleph. • Google Veo — Veo 3.1, cu sunet nativ; aplicația Flow. • ByteDance Seedance — Seedance 2.0 (februarie 2026).
• OpenAI Sora — Sora 2 a avut impact mare în 2025, dar OpenAI a anunțat închiderea aplicației pe 24 martie 2026: piața se schimbă foarte repede.
Sfat: lucrați în cadre scurte și montați-le — ca în filmul clasic.
Surse: ir.kuaishou.com (Kling 3.0, 05.02.2026); runwayml.com; deepmind.google/models/veo; seed.bytedance.com; higgsfield.ai; CBS News / MacRumors, 24.03.2026 (Sora).`,
    `AUDIO GENERATION (≈3 min) — unda de sus e „vie”: treceți cu mouse-ul (sau click) pe un card și ea își schimbă comportamentul; altfel trece singură prin toate 4.
• Voice — ElevenLabs: text-to-speech cu voci foarte naturale, clonarea propriei voci, dublaj automat în zeci de limbi, efecte sonore. Util pentru voice-over, audiobook-uri, jocuri.
• Music — Suno: piese complete, cu instrumente și voce, din descriere sau din versurile tale. Atenție la licență: planul gratuit nu permite uz comercial.
• Enhancement — Adobe Podcast: Enhance Speech transformă o înregistrare făcută cu telefonul într-una „de studio” (aceeași tehnologie există și în Premiere Pro). Unda arată exact asta: zgomot → semnal curat.
• Transcription — Descript: transcrie automat; editezi audio/video ca pe un document — ștergi un cuvânt din text și dispare și din înregistrare. Overdub corectează un cuvânt cu vocea ta sintetizată.
Demo rapid: înregistrați 10 secunde cu telefonul într-o sală cu ecou și treceți-le prin Adobe Podcast Enhance (gratuit, în browser).
Etică: clonarea vocii cuiva fără acord poate însemna fraudă sau încălcarea dreptului la imagine/voce; în UE, AI Act cere ca deepfake-urile audio/video să fie marcate.
Surse: elevenlabs.io; suno.com; podcast.adobe.com; descript.com.`,
    `PIPELINE CREATIV (≈3 min) — linia se desenează de la idee până la public, apoi un impuls de lumină trece o dată prin toate etapele. Treceți cu mouse-ul peste o etapă: detaliul apare sub titlu.
• 01 Idee & scenariu — ChatGPT, Claude, Gemini: brainstorming, variante de scenariu, dialoguri, shot list.
• 02 Concept & storyboard — Midjourney, Nano Banana: moodboard, concept art, cadre de storyboard; testăm stilul înainte de producție.
• 03 Generare video — Kling, Runway, Veo: B-roll, previzualizări (previs), scene greu sau imposibil de filmat.
• 04 Voce & muzică — ElevenLabs (voice-over, dublaj), Suno (muzică originală).
• 05 Montaj & post — Premiere Pro (Generative Extend cu Firefly, Speech to Text, Enhance Speech), DaVinci Resolve (funcțiile AI din Neural Engine).
• 06 Distribuție — subtitrări automate, traducere și dublaj, reîncadrare pe 9:16 pentru social media (Auto Reframe).
Mesaj: AI nu sare peste etape, le scurtează. Omul rămâne regizorul — el alege, combină și decide ce ajunge la public.
Surse: helpx.adobe.com (Premiere Pro: Generative Extend, Auto Reframe, Speech to Text, Enhance Speech); blackmagicdesign.com (DaVinci Resolve); site-urile oficiale ale instrumentelor.`,
    `AI AGENTS & MCP (≈4 min) — lăsați exemplul din stânga jos să ruleze: agentul primește un obiectiv și lucrează singur în mai multe aplicații.
• Chatbot: întrebi, răspunde. Îți spune CE să faci, dar munca o faci tu.
• AI Agent: primește un obiectiv, își face un plan, folosește unelte (aplicații, fișiere, browser), verifică rezultatul și continuă până termină.
• MCP (Model Context Protocol): standard deschis lansat de Anthropic în noiembrie 2024 — „portul USB-C al AI-ului”: o singură conexiune standard prin care orice model se poate lega la orice aplicație. Adoptat de OpenAI, Google, Microsoft; din decembrie 2025 e administrat de Agentic AI Foundation (Linux Foundation).
• Exemple reale: Figma are server MCP oficial (Dev Mode); Blender MCP (proiect comunitar) controlează scena 3D din chat; adb-mcp (proof of concept, Mike Chambers) conectează aplicații Adobe ca Photoshop și Premiere Pro.
• Exemplul de pe slide (ilustrativ): „Fă un reel de 30 s din filmările de ieri, cu subtitrări și thumbnail” → agentul importă fișierele, taie pauzele, pune subtitrări, face thumbnail-ul în Photoshop și exportă 9:16.
Atenție: agentul acționează în numele vostru — dați-i doar permisiunile necesare și verificați ce a făcut înainte de publicare.
Surse: anthropic.com/news/model-context-protocol (2024); modelcontextprotocol.io; linuxfoundation.org (Agentic AI Foundation, 12.2025); help.figma.com (Dev Mode MCP server); github.com/ahujasid/blender-mcp; github.com/mikechambers/adb-mcp.`,
    `PERSPECTIVA MEA (≈3 min) — piesele vin din toate părțile și se îmbină într-un fagure: fiecare instrument e o piesă, niciuna nu e întregul. Treceți cu mouse-ul peste o piesă: în stânga apare la ce o folosesc și la ce trebuie să fiu atent.
• Fluxul meu: ChatGPT și Gemini pentru idei și research → Claude pentru scenariu și texte → Midjourney pentru estetică și cadre-cheie → Kling / Higgsfield pentru mișcare → ElevenLabs pentru voce → totul se adună în Premiere Pro, unde fac montajul final.
• De ce mai multe instrumente: fiecare model e antrenat și optimizat diferit; unul scrie mai bine, altul are imagini mai frumoase, altul înțelege mai bine mișcarea. Clasamentele se schimbă de la o lună la alta.
• Cum aleg: dau același prompt la 2–3 modele și compar; urmăresc clasamente publice (LMArena), dar decid după rezultatul pe proiectul meu.
• Ce nu se schimbă: verific faptele, drepturile de autor și consimțământul (voce, chip), iar decizia finală e a mea.
Mesaj: „Nu caut cel mai bun model — caut cea mai bună combinație.”
Surse: lmarena.ai (clasamente comparative); site-urile oficiale ale instrumentelor.`,
    `CÂT COSTĂ AI-UL (≈3 min) — stânga: abonamentele mele reale — ChatGPT Plus $20, Claude Max $100, Kling Standard $10 = $130 pe lună; barele se adună într-un singur total. Dreapta: cât cheltuiesc oamenii de fapt.
Prețuri de intrare (SUA, pe lună, fără TVA, verificate în noiembrie 2026 — se schimbă des, verificați înainte de prezentare pe paginile oficiale):
• ChatGPT Plus $20 (există și Go, $8) · Claude Pro $20 ($17/lună la plata anuală) · Google AI Pro $19,99.
• Midjourney Basic $10 · Kling Standard ~$10 · ElevenLabs Creator $22 · Premiere Pro (o aplicație) ~$23.
• Planurile pentru uz intens (ChatGPT Pro, Claude Max, Google AI Ultra) costă $100–200+ pe lună.
Cât cheltuie oamenii:
• 55% dintre utilizatorii AI spun că plătesc pentru cel puțin un produs AI (Menlo Ventures, State of Consumer AI 2026).
• Mediana celor care plătesc: ~$25 pe lună; top 1% plătesc în medie ~$903 pe lună (a16z, pe date de carduri YipitData, august 2026).
• Atenție: alte studii măsoară altfel (ex. procentul din TOȚI consumatorii care plătesc ChatGPT/Gemini/Claude e mult mai mic, sub 5%) — cifrele depind de definiție.
Sfat pentru studenți: începeți cu planurile gratuite, plătiți o lună doar pentru un proiect concret, folosiți reducerile pentru studenți (multe instrumente le au) și anulați ce nu folosiți.
Surse: menlovc.com (State of Consumer AI 2026); a16z.news (Top 100 Consumer AI Apps, ed. 7); paginile oficiale de prețuri.`,
    `LIMITE & VIITOR (≈4 min) — rombul din centru („AI: azi → mâine”) leagă stânga (limitele de azi) de dreapta (ce urmează).
LIMITE (stânga):
• Halucinații — modelele inventează fapte, citate, surse, cu aceeași siguranță ca atunci când au dreptate.
• Drepturi de autor — pe ce date s-au antrenat modelele? Există procese în curs între autori, edituri, bănci de imagini și companii AI (ex. The New York Times vs. OpenAI); regulile diferă de la o țară la alta.
• Deepfake & consimțământ — fața și vocea cuiva se copiază ușor; fără acord e o problemă etică și legală.
De spus în plus: bias (modelele repetă stereotipurile din date), consistența personajelor între cadre (încă grea), confidențialitatea (ce încărcați online poate fi stocat — atenție la datele clienților și la NDA).
VIITOR (dreapta):
• Agenți autonomi — duc la capăt proiecte întregi, de la brief la export; omul devine supervizor și regizor.
• Video în timp real & world models — generare aproape instantă și lumi interactive (ex. Google DeepMind Genie 3, 2025).
• Transparență — AI Act (UE), art. 50: deepfake-urile și conținutul generat de AI trebuie marcate, conform calendarului din 2 august 2026 (UE discută unele ajustări prin pachetul Digital Omnibus — verificați stadiul la data prezentării). Content Credentials (C2PA): „eticheta de proveniență” a unui fișier, susținută de Adobe, Microsoft, Google, OpenAI și alții.
Mesaj: limitele de azi sunt temele de lucru de mâine — iar responsabilitatea rămâne la om.
Surse: artificialintelligenceact.eu (art. 50, calendar); c2pa.org; contentcredentials.org; deepmind.google (Genie 3).`,
    `DEMONSTRAȚIE (≈4 min) — același mini-proiect trece prin toate etapele; totul a fost făcut cu AI pentru această prezentare.
• 01 Idee — o frază scrisă cu un LLM: „Bucureștiul vechi, noaptea, pe ploaie. O femeie cu umbrelă.”
• 02 Storyboard — schița scenei, generată cu AI, ca să fixăm compoziția înainte de imagine.
• 03 Cadru-cheie — imaginea finală a cadrului (Nano Banana), în stilul dorit.
• 04 Animație — cadrul-cheie devine clip cu Kling (image-to-video, mișcare de cameră dolly-in, ploaie, reflexii).
• 05 Sunet & montaj — voce (ElevenLabs), muzică (Suno) și montajul final în Premiere Pro.
Ce contează: la fiecare etapă am ales, am refăcut și am decis — AI-ul a fost unealta, nu autorul.
ÎNTREBAREA FINALĂ — lăsați-o pe ecran și deschideți discuția: „Va înlocui AI-ul oamenii creativi — sau oamenii creativi care știu să folosească AI îi vor înlocui pe cei care nu știu?”
Idei pentru discuție: ce sarcini din munca voastră s-ar putea automatiza mâine? Ce rămâne doar al vostru (gust, idee, decizie, relația cu clientul)?`,
    `SURSE (≈1 min) — toate linkurile se pot da click (se deschid într-un tab nou); slide-ul rămâne deschis cât timp răspundeți la întrebări.
• Sursele sunt grupate pe teme, în ordinea prezentării: istoria AI, modele și companii, imagine & video, audio & montaj, agenți & MCP, etică & reglementare.
• Domeniul AI se schimbă de la o lună la alta: recomandați studenților să verifice direct site-urile oficiale și data informației.
• Resurse bune pentru început: Hugging Face (modele și demo-uri gratuite), LMArena (comparații între modele), documentațiile oficiale ale instrumentelor.
Încheiere: mulțumiți și deschideți sesiunea de întrebări — întrebarea finală de pe slide-ul anterior e un bun punct de plecare.`,
  ];

  /* ---------- build generated content ---------- */
  // History as a vertical serpentine road: down, U-turn, up, U-turn… from left to right.
  // It enters from above the screen and leaves below it; each milestone sits on the apex of a U-turn
  // (bottom, top, bottom, …) and its label sits inside that U, so it can never touch the road.
  const R = 87, YT = 232, YB = 800, X0 = 120, GAP = 2 * R;   // turn radius, top/bottom apex, first leg x, leg spacing
  // enters from the left edge, below the title, then bends down into the first leg
  let ROAD = `M -60 ${YT} L ${X0 - R} ${YT} A ${R} ${R} 0 0 1 ${X0} ${YT + R} L ${X0} ${YB - R}`;
  for (let i = 0; i < 8; i++) {
    const x = X0 + i * GAP, bottom = i % 2 === 0, y = bottom ? YB - R : YT + R;
    ROAD += ` A ${R} ${R} 0 0 ${bottom ? 0 : 1} ${x + GAP} ${y}`;
    if (i < 7) ROAD += ` L ${x + GAP} ${bottom ? YT + R : YB - R}`;
  }
  ROAD += ` L ${X0 + 8 * GAP} 960`;                         // last leg runs off the bottom edge
  const ROAD_DRAW = 2.4;                                   // seconds for the road to draw itself
  const ICONS = ["person", "edit", "people", "gears", "layers", "bolt", "chat", "robot"];
  const svg = stage.querySelector(".s2 .road");
  svg.querySelectorAll("path:not(.road-arrow)").forEach((p) => p.setAttribute("d", ROAD));
  const roadPath = svg.querySelector(".road-body"), roadLen = roadPath.getTotalLength();
  const LEG = (YB - R) - (YT + R), TURN = Math.PI * R;            // exact lengths of the pieces
  const LEG0 = (X0 - R + 60) + TURN / 2 + LEG;                    // lead-in: straight + quarter turn + first leg
  const apex = (i) => ({ x: X0 + i * GAP + R, y: i % 2 === 0 ? YB : YT, len: LEG0 + TURN / 2 + i * (TURN + LEG) });
  // travelling arrow: drawn around (0,0) pointing right; moved and turned along the road in placeArrow()
  svg.querySelector(".road-arrow").setAttribute("d", "M 24 0 L -16 -17 L -7 0 L -16 17 Z");
  const tl2 = stage.querySelector(".s2 .timeline");
  const info = stage.querySelector(".s2 .road-info");
  gsap.set(info, { opacity: 0, y: 6 });
  MILESTONES.forEach(([yr, nm, tip, hot], i) => {
    const p = apex(i), d = ((p.len / roadLen) * ROAD_DRAW).toFixed(2);   // lights up when the drawing reaches it
    const dy = i % 2 === 0 ? -168 : 74;                                   // inside the U: above a bottom turn, below a top turn
    const el = document.createElement("div");
    el.className = "ms" + (hot ? " hot" : "");
    el.style.left = p.x + "px"; el.style.top = p.y + "px";
    el.innerHTML = `<div class="dot" data-a="pop" data-d="${d}"><img src="assets/icons/${ICONS[i]}.png" alt=""></div>
      <div class="lbl lbl-u" style="left:-52px;top:${dy}px" data-a="rise" data-d="${(+d + 0.12).toFixed(2)}"><div class="yr">${yr}</div><div class="nm">${nm}</div></div>`;
    tl2.appendChild(el);
    // hover: the detail appears in one fixed spot under the title, so it never covers other labels
    el.addEventListener("mouseenter", () => { info.innerHTML = `<b>${yr} · ${nm}</b>${tip}`; gsap.to(info, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }); });
    el.addEventListener("mouseleave", () => gsap.to(info, { opacity: 0, y: 6, duration: 0.25 }));
  });
  // a small light that keeps travelling along the road
  const arrow = svg.querySelector(".road-arrow"), trip = { t: 0 };
  const placeArrow = () => {
    const l = trip.t * roadLen, q = roadPath.getPointAtLength(l), r = roadPath.getPointAtLength(Math.min(roadLen, l + 2)), b = roadPath.getPointAtLength(Math.max(0, l - 2));
    arrow.setAttribute("transform", `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${(Math.atan2(r.y - b.y, r.x - b.x) * 180 / Math.PI).toFixed(1)})`);
  };
  const drawn = (s) => [...s.querySelectorAll(".road-draw")];
  drawn(stage.querySelector(".s2")).forEach((p) => { p.style.strokeDasharray = roadLen; });
  // companies as side-by-side columns with arrow notches (steel → deep navy), unfolding one after another
  const cols = stage.querySelector(".s3 .cols");
  const mix = (a, b, t) => "#" + [0, 2, 4].map((k) => Math.round(parseInt(a.substr(k, 2), 16) * (1 - t) + parseInt(b.substr(k, 2), 16) * t).toString(16).padStart(2, "0")).join("");
  COMPANIES.forEach(([nm, logo, pr, country, open, desc], i) => {
    const el = document.createElement("div");
    el.className = "col";
    el.style.setProperty("--c", mix("6f8db0", "12203a", i / (COMPANIES.length - 1)));
    el.style.zIndex = 20 - i;
    el.dataset.a = "unfold"; el.dataset.d = (0.35 + i * 0.12).toFixed(2);
    el.innerHTML = `<div class="ci" data-a="fade" data-d="${(0.75 + i * 0.12).toFixed(2)}">
      <div class="logo">${logo ? `<img src="assets/logos/${logo}.png" alt="${nm}">` : "DS"}</div>
      <div class="nm">${nm}</div><div class="cty">${country}</div>
      <ul>${pr.map((x) => `<li>${x}</li>`).join("")}</ul>
      <p class="desc">${desc}</p>
      <span class="tag${open ? " open" : ""}">${open ? "open-weight" : "închis"}</span></div>`;
    cols.appendChild(el);
  });
  // ---- slide 6: prompt typed live → image resolves from noise (like diffusion) → before/after slider ----
  const s6 = stage.querySelector(".s6");
  const PROMPT = "„astronaut care îngrijește flori într-o seră pe Marte, lumină cinematică”";
  const promptEl = s6.querySelector(".prompt-text"), genImg = s6.querySelector(".gen-img"), noise = s6.querySelector(".gen-noise");
  const fluxCard = s6.querySelector(".flux-card"), ba = s6.querySelector(".ba"), baState = { p: 50 }, typer = { n: 0 };
  const setBA = () => ba.style.setProperty("--p", baState.p + "%");
  const NOISY = "blur(26px) saturate(0.15) contrast(1.4)", CLEAR = "blur(0px) saturate(1) contrast(1)";
  const FX = { s6: {
    hide() { promptEl.textContent = ""; gsap.set(genImg, { filter: NOISY, scale: 1.08 }); gsap.set(noise, { opacity: 1 }); baState.p = 100; setBA(); gsap.set(fluxCard, { opacity: 0, y: 24, rotation: 10 }); },
    final() { promptEl.textContent = PROMPT; gsap.set(genImg, { clearProps: "filter,transform" }); gsap.set(noise, { opacity: 0 }); baState.p = 50; setBA(); gsap.set(fluxCard, { clearProps: "opacity,transform" }); },
    enter(tl, at) {
      tl.fromTo(typer, { n: 0 }, { n: PROMPT.length, duration: 1.9, ease: "none", onUpdate: () => { promptEl.textContent = PROMPT.slice(0, Math.round(typer.n)); } }, at + 0.5);
      tl.fromTo(genImg, { filter: NOISY, scale: 1.08 }, { filter: CLEAR, scale: 1, duration: 2.4, ease: "power2.out" }, at + 2.3);
      tl.fromTo(noise, { opacity: 1 }, { opacity: 0, duration: 2.2, ease: "power2.out" }, at + 2.3);
      tl.fromTo(baState, { p: 100 }, { p: 50, duration: 1.5, ease: "power3.inOut", onUpdate: setBA }, at + 1.3);
      tl.fromTo(fluxCard, { opacity: 0, y: 24, rotation: 10 }, { opacity: 1, y: 0, rotation: 4, duration: 0.9, ease: "back.out(1.6)" }, at + 4.4);
    } } };
  const fx = (s) => FX[s.dataset.fx];
  // drag the before/after divider
  const dragBA = (e) => { const r = ba.getBoundingClientRect(); baState.p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)); setBA(); };
  ba.querySelectorAll("img").forEach((im) => { im.draggable = false; });   // no native image drag (it would cancel the slider)
  ba.addEventListener("pointerdown", (e) => { e.preventDefault(); ba.setPointerCapture(e.pointerId); dragBA(e); ba.onpointermove = dragBA; });
  ba.addEventListener("pointerup", () => { ba.onpointermove = null; });
  ba.addEventListener("pointercancel", () => { ba.onpointermove = null; });

  // ---- slide 7: camera timecode follows the clip (24 fps) ----
  const s7 = stage.querySelector(".s7"), cineVid = s7.querySelector(".cine-vid"), tcEl = s7.querySelector(".hud-tc");
  setInterval(() => {
    if (!s7.classList.contains("on")) return;
    const t = cineVid.currentTime || 0, f = Math.floor((t % 1) * 24), sec = Math.floor(t);
    tcEl.textContent = `00:00:${String(sec).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  }, 1000 / 24);

  // ---- slide 8: live waveform (canvas) — each tool has its own behaviour; hover/click a card or let it cycle ----
  const s8 = stage.querySelector(".s8"), wave = s8.querySelector(".wave"), wctx = wave.getContext("2d");
  const modeEl = s8.querySelector(".wave-mode"), textEl = s8.querySelector(".wave-text"), acards = [...s8.querySelectorAll(".ac")];
  const MODES = { voice: "Voice generation · ElevenLabs", music: "Music generation · Suno", enhance: "Audio enhancement · Adobe Podcast", transcribe: "Transcription · Descript" };
  const SENT = "Bună ziua! Astăzi vorbim despre inteligența artificială și producția multimedia.";
  const WW = 1456, WH = 270, NB = 112;
  let wMode = "voice", wSince = 0, wHover = false;
  wctx.scale(2, 2);
  const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  const nz = (u) => (Math.sin(u * 1.7) + Math.sin(u * 2.9 + 1.3) * 0.7 + Math.sin(u * 5.3 + 0.7) * 0.4) / 2.1;   // smooth pseudo-noise, -1…1
  function setMode(m) {
    wMode = m; wSince = performance.now() / 1000;
    modeEl.textContent = MODES[m];
    acards.forEach((c) => c.classList.toggle("on", c.dataset.mode === m));
    textEl.textContent = "";
  }
  function amp(i, t, el) {               // bar height 0…1 for bar i at time t (el = seconds in this mode)
    const u = i / NB;
    if (wMode === "voice" || wMode === "transcribe") {
      const s = nz(i * 0.21 - t * 5.5), gate = Math.max(0, nz(i * 0.05 - t * 1.6) + 0.35);
      return Math.min(1, Math.max(0.03, Math.abs(s) * gate * 1.25));
    }
    if (wMode === "music") {
      const beat = 0.55 + 0.45 * Math.exp(-((t * 2) % 1) * 5), bass = 1 - u * 0.55;
      return Math.max(0.05, (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 7 + i * 0.37) * Math.cos(t * 3.1 + i * 0.11))) * beat * bass);
    }
    // enhance: a scan line sweeps across; behind it the signal is clean, ahead of it it's noise
    const scan = Math.min(1, (el % 4.5) / 3.2);
    const clean = (0.25 + 0.6 * Math.abs(Math.sin(i * 0.12 - t * 2))) * (0.6 + 0.4 * Math.sin(u * Math.PI));
    return u < scan ? clean : 0.15 + 0.85 * hash(i * 13 + Math.floor(t * 18));
  }
  function drawWave(now) {
    requestAnimationFrame(drawWave);
    if (!s8.classList.contains("on")) return;
    const t = now / 1000, el = t - wSince;
    if (!wHover && el > 4.5) { const ks = Object.keys(MODES); setMode(ks[(ks.indexOf(wMode) + 1) % ks.length]); }
    wctx.clearRect(0, 0, WW, WH);
    const mid = wMode === "transcribe" ? WH * 0.38 : WH * 0.5, maxH = wMode === "transcribe" ? WH * 0.55 : WH * 0.82;
    const g = wctx.createLinearGradient(0, 0, WW, 0); g.addColorStop(0, "#5c7a99"); g.addColorStop(0.5, "#e1ecf8"); g.addColorStop(1, "#8fb3d9");
    wctx.fillStyle = g;
    const step = WW / NB, bw = step * 0.48;
    for (let i = 0; i < NB; i++) {
      const hgt = Math.max(4, amp(i, t, el) * maxH), x = i * step + (step - bw) / 2;
      wctx.beginPath(); wctx.roundRect(x, mid - hgt / 2, bw, hgt, bw / 2); wctx.fill();
    }
    if (wMode === "enhance") {        // the cleaning scan line
      const sx = Math.min(1, (el % 4.5) / 3.2) * WW;
      wctx.fillStyle = "rgba(255,255,255,.9)"; wctx.fillRect(sx - 1, 10, 2, WH - 20);
      const gl = wctx.createLinearGradient(sx - 60, 0, sx, 0); gl.addColorStop(0, "rgba(184,211,238,0)"); gl.addColorStop(1, "rgba(184,211,238,.25)");
      wctx.fillStyle = gl; wctx.fillRect(sx - 60, 10, 60, WH - 20);
    }
    if (wMode === "transcribe") textEl.textContent = SENT.slice(0, Math.floor(Math.min(1, el / 3.6) * SENT.length));
  }
  acards.forEach((c) => {
    c.addEventListener("mouseenter", () => { wHover = true; if (wMode !== c.dataset.mode) setMode(c.dataset.mode); });
    c.addEventListener("mouseleave", () => { wHover = false; wSince = performance.now() / 1000; });
    c.addEventListener("click", () => setMode(c.dataset.mode));
  });
  setMode("voice");
  requestAnimationFrame(drawWave);

  // ---- slide 9: pipeline stages; the line draws itself, each node pops when the line reaches it ----
  const STAGES = [
    ["idea", "Idee & scenariu", ["ChatGPT", "Claude", "Gemini"], "LLM-urile propun idei, variante de scenariu, dialoguri și shot list-uri. Tu alegi și rescrii."],
    ["storyboard", "Concept & storyboard", ["Midjourney", "Nano Banana"], "Moodboard, concept art și cadre de storyboard în minute, ca să testezi stilul înainte de producție."],
    ["video", "Generare video", ["Kling", "Runway", "Veo"], "Image-to-video și text-to-video pentru B-roll, previzualizări sau scene greu de filmat."],
    ["mic", "Voce & muzică", ["ElevenLabs", "Suno"], "Voice-over, dublaj în alte limbi, muzică originală și efecte sonore."],
    ["sliders", "Montaj & post", ["Premiere Pro", "DaVinci Resolve"], "Generative Extend, transcriere, curățarea vocii, corectură de culoare asistată."],
    ["globe", "Distribuție", ["Subtitrări", "Dublaj", "9:16"], "Subtitrări automate, traducere și dublaj, reîncadrare pentru fiecare platformă."],
  ];
  const s9 = stage.querySelector(".s9"), pipe = s9.querySelector(".pipe"), pInfo = s9.querySelector(".pipe-info");
  const PIPE_DRAW = 1.8, PIPE_D0 = 0.2;      // line draw time and start (authored seconds, compressed by k after a transition)
  pipe.innerHTML = STAGES.map(([ico, name, tools], i) => {
    const d = PIPE_D0 + PIPE_DRAW * (i / (STAGES.length - 1));
    return `<div class="st" style="left:${180 + i * 248}px">
      <span class="st-num" data-a="fade" data-d="${(d + 0.1).toFixed(2)}">0${i + 1}</span>
      <div class="st-node" data-a="pop" data-d="${d.toFixed(2)}"><img src="assets/icons/${ico}.png" alt=""></div>
      <div class="st-lab" data-a="rise" data-d="${(d + 0.15).toFixed(2)}"><b>${name}</b><div class="st-tools">${tools.map((t) => `<span>${t}</span>`).join("")}</div></div>
    </div>`;
  }).join("");
  const stEls = [...pipe.querySelectorAll(".st")], pLine = s9.querySelector(".pipe-line"), pPulse = s9.querySelector(".pipe-pulse");
  stEls.forEach((el, i) => {
    el.addEventListener("mouseenter", () => { stEls.forEach((x) => x.classList.toggle("on", x === el)); pInfo.innerHTML = `<b>${STAGES[i][1]}</b>${STAGES[i][3]}`; });
    el.addEventListener("mouseleave", () => { el.classList.remove("on"); pInfo.innerHTML = ""; });
  });
  FX.s9 = {
    hide() { gsap.set(pLine, { scaleX: 0 }); gsap.set(pPulse, { x: 0, opacity: 0 }); pInfo.innerHTML = ""; stEls.forEach((x) => x.classList.remove("on")); },
    final() { gsap.set(pLine, { scaleX: 1 }); gsap.set(pPulse, { opacity: 0 }); },
    enter(tl, at, k = 1) {
      tl.fromTo(pLine, { scaleX: 0 }, { scaleX: 1, duration: PIPE_DRAW * k, ease: "none" }, at + PIPE_D0 * k);
      // once everything is built, a light pulse runs through the pipeline once, flashing each node as it passes
      const t0 = at + 2.9 * k, RUN = 3.2;
      tl.fromTo(pPulse, { x: 0, opacity: 0 }, { x: 1240, duration: RUN, ease: "power1.inOut" }, t0);
      tl.to(pPulse, { opacity: 1, duration: 0.3 }, t0);
      tl.to(pPulse, { opacity: 0, duration: 0.4 }, t0 + RUN - 0.35);
      stEls.forEach((el, i) => {
        const f = i / (stEls.length - 1), tf = t0 + RUN * (f < 0.5 ? Math.sqrt(f / 2) : 1 - Math.sqrt((1 - f) / 2));   // inverse of power1.inOut
        tl.fromTo(el.querySelector(".st-node"), { boxShadow: "0 0 0 rgba(225,236,248,0)" }, { boxShadow: "0 0 46px rgba(225,236,248,.75)", duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, tf - 0.12);
      });
    } };

  // ---- slide 10: agent hub wired to apps (MCP); the task runs once: prompt → each step sends a packet to its app ----
  const s10 = stage.querySelector(".s10"), mcpBox = s10.querySelector(".mcp"), mSvg = s10.querySelector(".mcp-lines");
  const TOOLS = [["video", "Premiere Pro", -30], ["image", "Photoshop", -90], ["layers", "Figma", -150], ["cube", "Blender", 150], ["doc", "Fișiere", 90], ["globe", "Browser", 30]];
  const HX = 450, HY = 340, RX = 330, RY = 250;
  const tPos = TOOLS.map(([, , a]) => ({ x: HX + RX * Math.cos(a * Math.PI / 180), y: HY + RY * Math.sin(a * Math.PI / 180) }));
  mSvg.innerHTML = `<circle class="mcp-ring" cx="${HX}" cy="${HY}" r="122"/>` +
    tPos.map((p) => `<line class="mcp-ln" x1="${HX}" y1="${HY}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"/>`).join("") +
    `<circle class="mcp-pk" cx="${HX}" cy="${HY}" r="7"/>`;
  mcpBox.insertAdjacentHTML("beforeend", TOOLS.map(([ico, name], i) =>
    `<div class="tn" style="left:${tPos[i].x.toFixed(0)}px;top:${tPos[i].y.toFixed(0)}px" data-a="pop" data-d="${(1.0 + i * 0.08).toFixed(2)}"><img src="assets/icons/${ico}.png" alt=""><span>${name}</span></div>`).join(""));
  const mLines = [...mSvg.querySelectorAll(".mcp-ln")], mPk = mSvg.querySelector(".mcp-pk"), tNodes = [...mcpBox.querySelectorAll(".tn")];
  mLines.forEach((l, i) => { const len = Math.hypot(tPos[i].x - HX, tPos[i].y - HY); l.style.strokeDasharray = len; l.dataset.len = len; });
  const TASK = "Fă un reel de 30 s din filmările de ieri, cu subtitrări și thumbnail.";
  const STEPS = [["Importă filmările", 4], ["Taie pauzele și greșelile", 0], ["Adaugă subtitrări", 0], ["Creează thumbnail-ul", 1], ["Exportă 9:16 · 30 s", 0]];
  const taskEl = s10.querySelector(".task-prompt"), stepsEl = s10.querySelector(".steps");
  stepsEl.innerHTML = STEPS.map(([txt, j]) => `<li><i class="ck"></i><span>${txt}</span><em>${TOOLS[j][1]}</em></li>`).join("");
  const stepEls = [...stepsEl.children], tTyper = { n: 0 };
  FX.s10 = {
    hide() { mLines.forEach((l) => gsap.set(l, { strokeDashoffset: +l.dataset.len })); gsap.set(mPk, { opacity: 0 }); taskEl.textContent = ""; stepEls.forEach((x) => x.classList.remove("done", "run")); },
    final() { gsap.set(mLines, { strokeDashoffset: 0 }); gsap.set(mPk, { opacity: 0 }); taskEl.textContent = TASK; stepEls.forEach((x) => { x.classList.remove("run"); x.classList.add("done"); }); },
    enter(tl, at, k = 1) {
      mLines.forEach((l, i) => tl.fromTo(l, { strokeDashoffset: +l.dataset.len }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, at + (0.6 + i * 0.08) * k));
      tl.fromTo(tTyper, { n: 0 }, { n: TASK.length, duration: 1.8, ease: "none", onUpdate: () => { taskEl.textContent = TASK.slice(0, Math.round(tTyper.n)); } }, at + 1.3 * k);
      STEPS.forEach(([, j], i) => {
        const t = at + 1.3 * k + 2.1 + i * 0.95, row = stepEls[i], p = tPos[j];
        tl.call(() => { row.classList.add("run"); }, null, t);
        tl.fromTo(mPk, { attr: { cx: HX, cy: HY }, opacity: 1 }, { attr: { cx: p.x, cy: p.y }, duration: 0.45, ease: "power2.in", immediateRender: false }, t);
        tl.set(mPk, { opacity: 0 }, t + 0.45);
        tl.fromTo(tNodes[j], { boxShadow: "0 0 0 rgba(225,236,248,0)" }, { boxShadow: "0 0 38px rgba(225,236,248,.7)", duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, t + 0.42);
        tl.call(() => { row.classList.remove("run"); row.classList.add("done"); }, null, t + 0.7);
      });
    } };

  // ---- slide 11: honeycomb of tools; pieces fly in from scattered positions, Premiere Pro (where it all comes together) last ----
  const HIVE = [   // [logo or icon, name, role, use, caution, dx, dy] — offsets in hex steps around the centre
    ["logos/adobe", "Premiere Pro", "montaj final", "totul se adună aici: montaj, culoare, sunet, export", "decizia finală rămâne a mea", 0, 0],
    ["logos/openai", "ChatGPT", "idei · structură", "brainstorming, structura poveștii, imagini rapide", "poate inventa surse — verific", 0, -1],
    ["logos/anthropic", "Claude", "scenariu · text", "scenariu, texte lungi, documente, cod", "verific faptele și cifrele", 0.75, -0.5],
    ["icons/image", "Midjourney", "estetică", "stil, concept art, cadre-cheie", "control fin limitat (text, detalii)", 0.75, 0.5],
    ["icons/video", "Kling · Higgsfield", "mișcare", "image-to-video, mișcări de cameră", "clipuri scurte, uneori artefacte", 0, 1],
    ["icons/mic", "ElevenLabs", "voce", "voice-over, dublaj în alte limbi", "clonez o voce doar cu acord", -0.75, 0.5],
    ["logos/google", "Gemini", "research", "research cu Google, documente și video lungi", "verific sursele citate", -0.75, -0.5],
  ];
  const s11 = stage.querySelector(".s11"), hive = s11.querySelector(".hive"), hxInfo = s11.querySelector(".hx-info");
  const HXW = 236, HXH = 204;   // hex step (flat-top hexagon 220×190 + gap)
  hive.innerHTML = HIVE.map(([img, name, role], i) =>
    `<div class="hx${i === 0 ? " hx-core" : ""}" style="left:${(HIVE[i][5] * HXW).toFixed(0)}px;top:${(HIVE[i][6] * HXH).toFixed(0)}px"><div class="hx-in">
      <img src="assets/${img}.png" alt=""><b>${name}</b><span>${role}</span></div></div>`).join("") + `<i class="hive-ring"></i>`;
  const hxEls = [...hive.querySelectorAll(".hx")], hRing = hive.querySelector(".hive-ring");
  hxEls.forEach((el, i) => {
    el.addEventListener("mouseenter", () => { hxEls.forEach((x) => x.classList.toggle("on", x === el)); hxInfo.innerHTML = `<b>${HIVE[i][1]}</b><p><i>✓</i>${HIVE[i][3]}</p><p><i>!</i>${HIVE[i][4]}</p>`; hxInfo.classList.add("show"); });
    el.addEventListener("mouseleave", () => { el.classList.remove("on"); hxInfo.classList.remove("show"); });
  });
  // where each piece starts: pushed outward along its direction, plus a fixed "random" twist
  const SCAT = [[0, 40, 0.4, 0], [-80, -380, 0.6, -38], [520, -260, 0.6, 30], [560, 300, 0.6, -24], [60, 420, 0.6, 42], [-560, 280, 0.6, 28], [-520, -300, 0.6, -34]];
  FX.s11 = {
    hide() { hxEls.forEach((el, i) => gsap.set(el, { x: SCAT[i][0], y: SCAT[i][1], scale: SCAT[i][2], rotation: SCAT[i][3], opacity: 0 })); gsap.set(hRing, { opacity: 0, scale: 1 }); hxInfo.classList.remove("show"); hxEls.forEach((x) => x.classList.remove("on")); },
    final() { gsap.set(hxEls, { clearProps: "transform,opacity" }); gsap.set(hRing, { opacity: 0 }); },
    enter(tl, at, k = 1) {
      const order = [1, 2, 3, 4, 5, 6, 0];
      order.forEach((i, n) => tl.fromTo(hxEls[i], { x: SCAT[i][0], y: SCAT[i][1], scale: SCAT[i][2], rotation: SCAT[i][3], opacity: 0 },
        { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: i === 0 ? 0.9 : 1.15, ease: i === 0 ? "back.out(1.7)" : "expo.out" }, at + (0.5 + n * 0.16) * k + (i === 0 ? 0.35 : 0)));
      // the pieces click together: one ring of light spreads from the centre, once
      const tc = at + (0.5 + 6 * 0.16) * k + 1.1;
      tl.fromTo(hRing, { scale: 0.4, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1.4, ease: "power2.out", immediateRender: false }, tc);
    } };

  // ---- slide 12: infographic — pills on both sides wired to a central diamond ----
  const IG = {   // [icon, title, one-line detail]
    l: [["warning", "Halucinații", "inventează fapte și surse — verifici tot"],
        ["doc", "Drepturi de autor", "date de antrenare și procese în curs"],
        ["fingerprint", "Deepfake & consimțământ", "fața și vocea cuiva, doar cu acord"]],
    r: [["robot", "Agenți autonomi", "de la brief la export; omul supervizează"],
        ["video", "Video în timp real", "generare instantă, lumi interactive"],
        ["tag", "Transparență", "AI Act + Content Credentials (C2PA)"]],
  };
  const s12 = stage.querySelector(".s12"), IGY = [370, 540, 710], DX = 800, DY = 540, DR = 196;   // DR = how far the lines stop from the centre (ring edge, rounded corners)
  const PL = 512, PR = 1088;                                                                         // inner edges of the left / right pills
  s12.querySelector(".ig-pills").innerHTML = ["l", "r"].map((side) => IG[side].map(([ico, name, txt], i) =>
    `<div class="igp igp-${side} igp-${side}${i}" style="top:${IGY[i] - 52}px" data-a="${side === "l" ? "left" : "right"}" data-d="${(1.0 + i * 0.12).toFixed(2)}">
      <div class="igp-txt"><b>${name}</b><span>${txt}</span></div><i class="igp-ico"><img src="assets/icons/${ico}.png" alt=""></i></div>`).join("")).join("");
  s12.querySelector(".ig-links").innerHTML = IGY.map((y, i) => {
    const reach = DR - Math.abs(y - DY), d = (0.75 + i * 0.08).toFixed(2);
    return `<i class="lk" style="left:${PL}px;top:${y - 1}px;width:${DX - reach - PL}px" data-a="unfoldR" data-d="${d}"></i>` +
           `<i class="lk" style="left:${DX + reach}px;top:${y - 1}px;width:${PR - DX - reach}px" data-a="unfold" data-d="${d}"></i>`;
  }).join("");

  // split hero title into characters  // ---- slide 13: the idea is typed, a progress bar runs under the 5 stages, the playhead crosses the edit once ----
  const s13 = stage.querySelector(".s13"), dPrompt = s13.querySelector(".df-prompt"), dBar = s13.querySelector(".demo-bar i"), pHead = s13.querySelector(".phead");
  const IDEA = "Bucureștiul vechi, noaptea, pe ploaie. O femeie cu umbrelă.", dTyper = { n: 0 };
  FX.s13 = {
    hide() { dPrompt.textContent = ""; gsap.set(dBar, { scaleX: 0 }); gsap.set(pHead, { left: "4%" }); },
    final() { dPrompt.textContent = IDEA; gsap.set(dBar, { scaleX: 1 }); gsap.set(pHead, { left: "96%" }); },
    enter(tl, at, k = 1) {
      tl.fromTo(dTyper, { n: 0 }, { n: IDEA.length, duration: 1.4, ease: "none", immediateRender: false, onUpdate: () => { dPrompt.textContent = IDEA.slice(0, Math.round(dTyper.n)); } }, at + 0.5 * k);
      tl.fromTo(dBar, { scaleX: 0 }, { scaleX: 1, duration: 1.5 * k, ease: "none" }, at + 0.35 * k);
      tl.fromTo(pHead, { left: "4%" }, { left: "96%", duration: 2.6, ease: "none", immediateRender: false }, at + 1.8 * k);
    } };

  // ---- slide 14: sources, grouped by topic (in the order of the talk); every entry links to the original ----
  const SOURCES = [
    ["Istoria AI", [["Turing — Computing Machinery and Intelligence (1950)", "https://doi.org/10.1093/mind/LIX.236.433"],
      ["McCarthy et al. — propunerea Dartmouth (1955)", "http://jmc.stanford.edu/articles/dartmouth.html"],
      ["Krizhevsky et al. — AlexNet (2012)", "https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html"],
      ["Vaswani et al. — Attention Is All You Need (2017)", "https://arxiv.org/abs/1706.03762"],
      ["OpenAI — lansarea ChatGPT (2022)", "https://openai.com/index/chatgpt/"]]],
    ["Modele & companii", [["Hugging Face — blog („Three Million Models”)", "https://huggingface.co/blog"],
      ["OSI — Open Source AI Definition 1.0", "https://opensource.org/ai/open-source-ai-definition"],
      ["LMArena — clasamente comparative", "https://lmarena.ai"],
      ["openai.com · anthropic.com · deepmind.google", "https://deepmind.google"],
      ["Menlo Ventures — State of Consumer AI 2026", "https://menlovc.com/wp-content/uploads/2026/09/menlo_ventures_consumer_ai_report-2026.pdf"],
      ["a16z — Top 100 Consumer AI Apps (ed. 7)", "https://www.a16z.news/p/top-100-consumer-ai-apps-seventh"]]],
    ["Imagine & video", [["Midjourney — documentație", "https://docs.midjourney.com"], ["Adobe Firefly", "https://www.adobe.com/products/firefly.html"],
      ["Black Forest Labs (FLUX)", "https://bfl.ai"], ["Kuaishou — Kling (relații investitori)", "https://ir.kuaishou.com"],
      ["Runway", "https://runwayml.com"], ["Google Veo", "https://deepmind.google/models/veo/"],
      ["ByteDance Seed (Seedance) · Higgsfield", "https://seed.bytedance.com"]]],
    ["Audio & montaj", [["ElevenLabs", "https://elevenlabs.io"], ["Suno", "https://suno.com"], ["Adobe Podcast", "https://podcast.adobe.com"],
      ["Descript", "https://www.descript.com"], ["Premiere Pro — ajutor Adobe", "https://helpx.adobe.com/premiere-pro.html"],
      ["DaVinci Resolve", "https://www.blackmagicdesign.com/products/davinciresolve"]]],
    ["Agenți & MCP", [["Anthropic — Model Context Protocol (2024)", "https://www.anthropic.com/news/model-context-protocol"],
      ["modelcontextprotocol.io — specificația", "https://modelcontextprotocol.io"], ["Linux Foundation — Agentic AI Foundation", "https://www.linuxfoundation.org"],
      ["Figma — Dev Mode MCP server", "https://help.figma.com"], ["Blender MCP (comunitate)", "https://github.com/ahujasid/blender-mcp"],
      ["adb-mcp — aplicații Adobe (demo)", "https://github.com/mikechambers/adb-mcp"]]],
    ["Etică & reglementare", [["AI Act — articolul 50 (transparență)", "https://artificialintelligenceact.eu/article/50/"],
      ["C2PA — standardul de proveniență", "https://c2pa.org"], ["Content Credentials", "https://contentcredentials.org"],
      ["Google DeepMind — Genie 3", "https://deepmind.google"]]],
  ];
  stage.querySelector(".s14 .srcs").innerHTML = SOURCES.map(([cat, items], i) =>
    `<div class="src" data-a="flip" data-d="${(0.3 + i * 0.1).toFixed(2)}"><b>${cat}</b><ul>${items.map(([t, u]) =>
      `<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join("")}</ul></div>`).join("");

  // ---- pricing slide: one bar per subscription (scale: PR_MAX = full), then the same colours stack into the total; stats count up ----
  const PRICES = [   // [logo or icon, tool, plan, $ / month]
    ["logos/openai", "ChatGPT", "Plus", 20], ["logos/anthropic", "Claude", "Max", 100], ["icons/video", "Kling", "Standard", 10],
  ];
  const PR_COL = ["#e1ecf8", "#8fb3d9", "#5c7a99"], PR_MAX = 100;   // PR_MAX = price of a full bar
  const sPr = stage.querySelector(".spr"), prTotal = PRICES.reduce((a, p) => a + p[3], 0);
  sPr.querySelector(".pr-rows").innerHTML = PRICES.map(([img, name, plan, usd], i) =>
    `<div class="pr-row" data-a="rise" data-d="${(0.3 + i * 0.08).toFixed(2)}"><img src="assets/${img}.png" alt="">
      <span class="pr-name">${name} <small>${plan}</small></span>
      <div class="pr-track"><i class="pr-bar" style="width:${(usd / PR_MAX * 100).toFixed(1)}%;background:${PR_COL[i]}" data-a="unfold" data-d="${(0.5 + i * 0.08).toFixed(2)}"></i></div>
      <b class="pr-usd">$${usd % 1 ? usd.toFixed(2) : usd}</b></div>`).join("");
  sPr.querySelector(".pr-stack").innerHTML = PRICES.map((p, i) => `<i style="width:${(p[3] / prTotal * 100).toFixed(2)}%;background:${PR_COL[i]}"></i>`).join("");
  const STATS = [   // [value, prefix, suffix, label, source]
    [55, "", "%", "dintre utilizatorii AI plătesc cel puțin un produs AI", "Menlo Ventures · 2026"],
    [25, "$", "", "pe lună — mediana celor care plătesc", "a16z · YipitData · aug. 2026"],
    [903, "$", "", "pe lună — media celor mai mari 1% cheltuitori", "a16z · YipitData · aug. 2026"],
  ];
  sPr.querySelector(".pr-stats").innerHTML = STATS.map(([v, pre, suf, lab, src], i) =>
    `<div class="pst" data-a="rise" data-d="${(0.6 + i * 0.15).toFixed(2)}"><b><span class="pst-n">${pre}${v}${suf}</span></b><p>${lab}</p><small>${src}</small></div>`).join("");
  const pstN = [...sPr.querySelectorAll(".pst-n")], prSegs = [...sPr.querySelectorAll(".pr-stack i")], prSum = sPr.querySelector(".pr-sum");
  const cnt = STATS.map(() => ({ v: 0 })), sumC = { v: 0 };
  const showN = (i) => { const [, pre, suf] = STATS[i]; pstN[i].textContent = pre + Math.round(cnt[i].v) + suf; };
  FX.spr = {
    hide() { cnt.forEach((c, i) => { c.v = 0; showN(i); }); gsap.set(prSegs, { scaleX: 0 }); sumC.v = 0; prSum.textContent = "≈ $0"; },
    final() { cnt.forEach((c, i) => { c.v = STATS[i][0]; showN(i); }); gsap.set(prSegs, { scaleX: 1 }); prSum.textContent = "≈ $" + Math.round(prTotal); },
    enter(tl, at, k = 1) {
      STATS.forEach((s, i) => tl.fromTo(cnt[i], { v: 0 }, { v: s[0], duration: 1.6, ease: "power2.out", immediateRender: false, onUpdate: () => showN(i) }, at + (0.7 + i * 0.15) * k));
      prSegs.forEach((sg, i) => tl.fromTo(sg, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, at + 1.6 * k + i * 0.14));
      tl.fromTo(sumC, { v: 0 }, { v: prTotal, duration: 0.14 * prSegs.length + 0.3, ease: "none", immediateRender: false, onUpdate: () => { prSum.textContent = "≈ $" + Math.round(sumC.v); } }, at + 1.6 * k);
    } };

  // ---- agenda: chapters → slides; numbers and jump targets come from the slides themselves (stay right if slides move) ----
  const AGENDA = [
    ["Fundamente", [["Istoria AI", ".s2"], ["Cine construiește AI", ".s3"], ["Modele AI", ".s5"]]],
    ["Generare", [["Imagine", ".s6"], ["Video", ".s7"], ["Audio", ".s8"]]],
    ["În practică", [["Pipeline creativ", ".s9"], ["AI Agents & MCP", ".s10"], ["Perspectiva mea", ".s11"], ["Cât costă AI-ul", ".spr"]]],
    ["Încheiere", [["Limite & viitor", ".s12"], ["Demonstrație", ".s13"], ["Surse", ".s14"]]],
  ];
  const sAg = stage.querySelector(".sag"), slideIx = (sel) => slides.indexOf(stage.querySelector(sel));
  sAg.querySelector(".ag-cols").innerHTML = AGENDA.map(([ch, items], i) =>
    `<div class="ag-col" style="left:${72 + i * 370}px" data-a="rise" data-d="${(0.5 + i * 0.12).toFixed(2)}">
      <i class="ag-node">${i + 1}</i><small>Capitolul ${i + 1}</small><h3>${ch}</h3>
      ${items.map(([t, sel]) => { const ix = slideIx(sel); return `<button class="ag-it" data-go="${ix}"><b>${String(ix + 1).padStart(2, "0")}</b><span>${t}</span><i>→</i></button>`; }).join("")}
    </div>`).join("");
  sAg.querySelectorAll(".ag-it").forEach((b) => b.addEventListener("click", () => go(+b.dataset.go)));

  // split hero title into characters (for the letter-by-letter entrance)
  slides.forEach((s) => s.querySelectorAll("[data-split]").forEach((el) => {
    el.innerHTML = el.innerHTML.split(/(<br>)/).map((part) => part === "<br>" ? part :
      [...part].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("")).join("");
  }));
  // other titles and kickers get a line wrapper, so they can slide in/out behind a mask
  slides.forEach((s) => s.querySelectorAll('[data-morph="title"]:not([data-split]), [data-morph="kicker"]').forEach((el) => {
    el.innerHTML = `<span class="ln">${el.innerHTML}</span>`;
  }));

  /* ---------- fit 1600×900 canvas to the window ---------- */
  function fit() {
    scale = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  addEventListener("resize", fit); fit();

  /* ---------- entrance animations ---------- */
  const FROM = {
    rise: { y: 30, opacity: 0, filter: "blur(5px)" }, drop: { y: -30, opacity: 0, filter: "blur(5px)" }, fade: { opacity: 0 },
    zoom: { scale: 0.9, opacity: 0 }, pop: { scale: 0, opacity: 0 },
    flip: { rotationX: -60, y: 34, opacity: 0, transformOrigin: "50% 0%" },   // cards falling into place like playing cards
    unfold: { scaleX: 0, opacity: 0, transformOrigin: "0% 50%" },               // columns opening like an accordion
    unfoldR: { scaleX: 0, opacity: 0, transformOrigin: "100% 50%" },            // same, growing from the right edge
    left: { x: -80, opacity: 0, filter: "blur(6px)" }, right: { x: 80, opacity: 0, filter: "blur(6px)" },
    dia: { scale: 0.3, rotation: -90, opacity: 0 },                               // the central diamond spins into place
  };
  const animated = (s) => [...s.querySelectorAll("[data-a]")];
  const roadBits = (s) => s.querySelectorAll(".road-dash, .road-floor");
  function hideAnimated(s) {
    animated(s).forEach((el) => gsap.set(el, FROM[el.dataset.a]));
    if (fx(s)) fx(s).hide();
    if (drawn(s).length) { gsap.set(drawn(s), { strokeDashoffset: roadLen }); gsap.set(roadBits(s), { opacity: 0 }); gsap.set(arrow, { opacity: 0 }); }
  }
  function showFinal(s) {
    gsap.set([...animated(s), ...s.querySelectorAll(".ch, .ln")], { clearProps: "transform,opacity,filter" });
    if (fx(s)) fx(s).final();
    if (drawn(s).length) { gsap.set(drawn(s), { strokeDashoffset: 0 }); gsap.set(roadBits(s), { clearProps: "opacity" }); gsap.set(arrow, { opacity: 0 }); }
  }
  // k compresses the authored delays (used after a transition, so the build feels quick and continuous)
  function entrance(s, at = 0, k = 1) {
    const tl = gsap.timeline();
    animated(s).forEach((el) => {
      const a = el.dataset.a, to = { y: 0, scale: 1, opacity: 1, duration: +el.dataset.dur || (a === "flip" ? 1.0 : 0.85), ease: a === "flip" ? "power4.out" : "power3.out" };
      if (FROM[a].filter) to.filter = "blur(0px)";
      if (a === "flip") to.rotationX = 0;
      if ("x" in FROM[a]) to.x = 0;
      if ("rotation" in FROM[a]) { to.rotation = 0; to.ease = "back.out(1.4)"; to.duration = 1.1; }
      if (a === "unfold" || a === "unfoldR") { to.scaleX = 1; to.ease = "expo.out"; to.duration = 0.9; }
      tl.fromTo(el, FROM[a], to, at + (+el.dataset.d || 0) * k);
    });
    if (drawn(s).length) { // the road draws itself; stations light up as it reaches them (same time scale k)
      const dur = ROAD_DRAW * k;
      tl.fromTo(drawn(s), { strokeDashoffset: roadLen }, { strokeDashoffset: 0, duration: dur, ease: "none" }, at);
      tl.fromTo(s.querySelector(".road-floor"), { opacity: 0 }, { opacity: 1, duration: 1.4 }, at);
      tl.fromTo(s.querySelector(".road-dash"), { opacity: 0 }, { opacity: 1, duration: 0.8 }, at + dur * 0.7);
      // once the road is complete, an arrow sets off from the left: slow start, cruising, easing into the end, then it vanishes
      const TRIP = 7.5;  // seconds for the arrow to travel the whole road (slow, calm pace)
      tl.fromTo(trip, { t: 0 }, { t: 1, duration: TRIP, ease: "power2.inOut", onStart: placeArrow, onUpdate: placeArrow }, at + dur + 0.2);
      tl.fromTo(arrow, { opacity: 0 }, { opacity: 1, duration: 0.4 }, at + dur + 0.2);
      tl.to(arrow, { opacity: 0, duration: 0.5, ease: "power2.in" }, at + dur + 0.2 + TRIP - 0.45);
    }
    if (fx(s)) fx(s).enter(tl, at, k);
    const chars = s.querySelectorAll(".ch");   // masked letter-by-letter reveal (the title clips its own overflow)
    if (chars.length) tl.fromTo(chars, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.03 }, at);
    return tl;
  }

  /* ---------- background glows (morph between slides) ---------- */
  const GLOW = { ov: [[-260, -420], [900, 260]], 0: [[-420, 300], [1100, -480]], 1: [[900, 380], [-420, -360]], 2: [[1050, -380], [-380, 400]], 3: [[-300, 260], [1000, -380]], 4: [[1050, 320], [-380, -300]], 5: [[-360, 340], [980, -420]], 6: [[1000, 360], [-300, -420]], 7: [[-420, 420], [1050, -380]], 8: [[900, -420], [-380, 380]], 9: [[-380, -420], [1050, 380]], 10: [[1000, -400], [-420, 420]], 11: [[-400, 380], [1050, -360]], 12: [[1000, 420], [-400, -380]], 13: [[-420, -420], [700, 520]], 14: [[900, -440], [-300, 460]], 15: [[-380, 420], [1000, -400]] };
  function glowTo(key, dur = 1.6) {
    const [a, b] = GLOW[key];
    gsap.to(g1, { left: a[0], top: a[1], duration: dur, ease: "power2.inOut" });
    gsap.to(g2, { left: b[0], top: b[1], duration: dur, ease: "power2.inOut" });
  }
  gsap.set(g1, { left: GLOW.ov[0][0], top: GLOW.ov[0][1] }); gsap.set(g2, { left: GLOW.ov[1][0], top: GLOW.ov[1][1] });
  gsap.to([g1, g2], { x: 40, y: 30, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 2 });

  /* ---------- transition between slides: EXIT → MORPH → ENTER (one beat at a time) ----------
     1. exit   (0 – 0.55 s): old content leaves in a wave with a touch of motion blur; titles slide out behind a mask;
                             the hero video pushes in and fades.
     2. morph  (0.18 – 1.23 s): only the shared panel and accent line move/resize (expo ease) — nothing else competes.
     3. enter  (from ~0.7 s): the new title rises from behind its mask, then the content builds in quick succession. */
  const local = (el) => { const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale }; };
  const BOX = ["panel", "line"];
  const lines = (s) => [...s.querySelectorAll('[data-morph="title"] .ln, [data-morph="kicker"] .ln')];
  const flat = (els) => els.flatMap((e) => (e.matches(".timeline, .cols, .glass-row, .concepts, .acards, .pipe, .hive, .ig-pills, .demo, .q, .srcs, .pr-rows, .pr-stats, .ag-cols, .hero-items") ? [...e.children] : [e]));

  function go(j) {
    if (mode !== "deck" || busy || j < 0 || j >= N || j === cur) return;
    busy = true;
    const A = slides[cur], B = slides[j], dir = j > cur ? 1 : -1;
    const MORPH_AT = 0.18, MORPH = 1.05, IN_AT = 0.95;
    B.classList.add("on"); gsap.set(B, { zIndex: 3 }); gsap.set(A, { zIndex: 2 });
    hideAnimated(B);
    const aM = new Map([...A.querySelectorAll("[data-morph]")].map((e) => [e.dataset.morph, e]));
    const bM = new Map([...B.querySelectorAll("[data-morph]")].map((e) => [e.dataset.morph, e]));
    const vidA = A.querySelector(":scope > video"), vidB = B.querySelector(":scope > video");   // full-screen hero video (push-in)
    const reset = () => { // put the old slide back in its resting state (keep inline layout of generated items)
      A.classList.remove("on");
      gsap.set([...A.children, ...A.querySelectorAll("[data-a], .ch, .ln, .ms, .col, .hi")], { clearProps: "transform,opacity,filter" });
      gsap.set(A.querySelectorAll("[data-morph]"), { clearProps: "transform,opacity,left,top,width,height" });
    };
    const tl = gsap.timeline();
    tl.call(() => A.querySelectorAll("video").forEach((v) => v.pause()), null, 0.95);           // nested clips stop when their slide leaves
    B.querySelectorAll("video").forEach((v) => { if (v !== vidB) { v.currentTime = 0; v.play().catch(() => {}); } });
    tl.call(() => { reset(); cur = j; busy = false; chrome(); }, null, MORPH_AT + MORPH + 0.05);

    // 1 — EXIT
    tl.to(lines(A), { yPercent: -115 * dir, duration: 0.55, ease: "power3.in", stagger: 0.05 }, 0);
    tl.to(A.querySelectorAll(".ch"), { yPercent: -115 * dir, opacity: 0, duration: 0.5, ease: "power3.in", stagger: 0.012 }, 0); // letter-split titles leave letter by letter
    const outgoing = flat([...A.children].filter((e) => !e.classList.contains("card-bg") && e !== vidA && !(e.dataset.morph && bM.has(e.dataset.morph))));
    tl.to(outgoing, { opacity: 0, y: -30 * dir, filter: "blur(6px)", duration: 0.5, ease: "power2.in", stagger: { each: 0.022, from: dir > 0 ? "start" : "end" } }, 0);
    if (vidA) { tl.to(vidA, { scale: 1.08, opacity: 0, duration: 0.9, ease: "power2.in" }, 0); tl.call(() => vidA.pause(), null, 0.95); }
    if (vidB) { vidB.currentTime = 0; vidB.play().catch(() => {}); tl.fromTo(vidB, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "power3.out" }, 0.3); }

    // 2 — MORPH (only the shared container and line)
    bM.forEach((b, key) => {
      if (!BOX.includes(key)) return;
      const a = aM.get(key);
      if (!a) { tl.fromTo(b, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }, IN_AT - 0.25); return; }
      const ra = local(a), rb = local(b);
      gsap.set(a, { opacity: 0 });
      tl.fromTo(b, { left: ra.x, top: ra.y, width: ra.w, height: ra.h }, { left: rb.x, top: rb.y, width: rb.w, height: rb.h, duration: MORPH, ease: "expo.inOut" }, MORPH_AT);
    });

    // 3 — ENTER
    tl.fromTo(lines(B), { yPercent: 115 * dir }, { yPercent: 0, duration: 1.0, ease: "power4.out", stagger: 0.08 }, IN_AT - 0.25);
    tl.add(entrance(B, 0, 0.55), IN_AT);
    glowTo(j, 1.5);
  }

  /* ---------- overview: all slides on a 3D drum (like the Kinetic reference) ----------
     Cards sit on a cylinder with a horizontal axis; the drum itself is turned in 3D (yaw + roll),
     so the column curves into a "C", cards above/below rotate progressively and bleed off the screen.
     The 3 finished slides are followed by preview cards of the next 10 (drum only, not navigable). */
  const FUTURE = [
  ];
  const previews = FUTURE.map(([n, kick, title, visual]) => {
    const s = document.createElement("section");
    s.className = "slide ph";
    s.innerHTML = `<div class="card-bg"></div><div class="kicker"><b>${n}</b> / ${kick}</div><h2 class="title">${title}</h2>${visual}`;
    deck.appendChild(s);
    return s;
  });
  const cards = [...slides, ...previews];                       // drum order (circular)
  const M = cards.length;
  // Arc layout (in card units u = position relative to the focused card):
  //   cards follow a C-shaped arc (circle of radius R centred to the left), their in-plane rotation grows
  //   from top (counter-clockwise) to bottom (clockwise), they tilt back in 3D and lower cards overlap upper ones.
  const DRUM = { R: 1150, arc: 15, scale: 0.36, rot0: -9, rot: 11, tiltX: 13, yaw: 12, depth: 55 };
  const drum = { off: 0, focus: 0 };          // off = extra shift in card units (intro slide-in, idle sway)
  let swayTw = null;
  function pose(k, extra = 0) {
    let rel = (k - drum.focus) % M; if (rel < 0) rel += M; if (rel > M / 2) rel -= M;   // circular order
    const u = rel + drum.off + extra, a = (u * DRUM.arc * Math.PI) / 180;
    return { x: DRUM.R * (Math.cos(a) - 1) + 40, y: DRUM.R * Math.sin(a), z: -Math.abs(u) * DRUM.depth,
      rotationZ: DRUM.rot0 + u * DRUM.rot, rotationX: -u * DRUM.tiltX, rotationY: DRUM.yaw, scale: DRUM.scale,
      transformPerspective: 1700, zIndex: Math.round(60 + u * 3), opacity: Math.max(0, Math.min(1, 4.2 - Math.abs(u))) };
  }
  const DRUM_VIEW = {}, FLAT_VIEW = {};       // the arc is built per card; the deck itself stays flat
  const layout = () => cards.forEach((s, k) => gsap.set(s, pose(k)));
  function swayStart() { swayTw = gsap.fromTo(drum, { off: 0 }, { off: 0.12, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: layout }); }
  function swayStop() { if (swayTw) swayTw.kill(); swayTw = null; }

  function intro() {
    cards.forEach((s) => { s.classList.add("on"); showFinal(s); });
    gsap.set(deck, DRUM_VIEW);
    // the drum spins into place: cards come up from below, one after another
    gsap.fromTo(drum, { off: 6 }, { off: 0, duration: 2.6, ease: "power3.out", delay: 0.2, onUpdate: layout, onComplete: swayStart });
    gsap.from(".ov-chrome > *", { opacity: 0, y: 14, duration: 1, delay: 1.4, stagger: 0.15 });
  }

  function spin(dirn) { // rotate the drum to the next/previous card
    if (mode !== "overview" || busy) return;
    swayStop(); busy = true;
    const from = drum.focus;
    drum.focus = (drum.focus + dirn + N) % N; drum.off = 0;
    cards.forEach((s, k) => {
      const old = (() => { const f = drum.focus; drum.focus = from; const p = pose(k); drum.focus = f; return p; })();
      gsap.fromTo(s, old, { ...pose(k), duration: 0.9, ease: "power3.inOut" });
    });
    gsap.delayedCall(0.9, () => { busy = false; swayStart(); });
  }

  function openSlide(k) {
    if (mode !== "overview" || busy) return;
    busy = true; swayStop();
    gsap.killTweensOf(drum);   // the intro spin may still be running (it would keep re-posing cards and restart the sway)
    const tl = gsap.timeline({ onComplete: () => {
      body.classList.remove("overview"); mode = "deck"; cur = k; busy = false;
      cards.forEach((s, i) => { if (i !== k) { s.classList.remove("on"); gsap.set(s, { clearProps: "all" }); showFinal(s); } });
      gsap.set(slides[k], { clearProps: "transform,zIndex,opacity" });
      gsap.set(deck, { clearProps: "transform" });
      chrome();
    } });
    drum.focus = k; drum.off = 0;
    cards.forEach((s, i) => { if (i !== k) { const p = pose(i, Math.sign(pose(i).y || 1) * 2.5); tl.to(s, { ...p, opacity: 0, duration: 1.0, ease: "power2.in" }, 0); } });
    tl.to(deck, { ...FLAT_VIEW, duration: 1.5, ease: "power3.inOut" }, 0);
    tl.to(slides[k], { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, opacity: 1, zIndex: 200, duration: 1.5, ease: "power3.inOut" }, 0);
    tl.to(slides[k].querySelector(".card-bg"), { opacity: 0, duration: 0.5 }, 1.1);
    glowTo(k, 1.6);
  }

  function toOverview() {
    if (mode !== "deck" || busy) return;
    busy = true; mode = "overview";
    const k = cur;
    body.classList.add("overview");
    cards.forEach((s) => { s.classList.add("on"); showFinal(s); });
    gsap.set(slides[k].querySelector(".card-bg"), { opacity: 0 });
    drum.focus = k; drum.off = 0;
    const tl = gsap.timeline({ onComplete: () => { busy = false; swayStart(); } });
    tl.fromTo(deck, FLAT_VIEW, { ...DRUM_VIEW, duration: 1.3, ease: "power3.inOut" }, 0);
    cards.forEach((s, i) => {
      if (i === k) tl.fromTo(s, { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, opacity: 1, zIndex: 200 }, { ...pose(i), duration: 1.3, ease: "power3.inOut" }, 0);
      else tl.fromTo(s, { ...pose(i, Math.sign(pose(i).y || 1) * 2.5), opacity: 0 }, { ...pose(i), duration: 1.2, ease: "power3.out" }, 0.25);
    });
    tl.to(slides[k].querySelector(".card-bg"), { opacity: 1, duration: 0.4 }, 0.1);
    glowTo("ov");
  }

  /* ---------- chrome, notes, input ---------- */
  function chrome() {
    document.querySelector(".notes-title").textContent = `${String(cur + 1).padStart(2, "0")} · ${slides[cur].dataset.title}`;
    document.querySelector(".notes-body").textContent = NOTES[cur];
  }
  const notes = document.getElementById("notes");
  const next = () => (mode === "overview" ? openSlide(drum.focus) : go(cur + 1));
  const prev = () => go(cur - 1);

  addEventListener("keydown", (e) => {
    if (mode === "overview" && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); spin(e.key === "ArrowDown" ? 1 : -1); }
    else if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === "Escape") toOverview();
    else if (e.key.toLowerCase() === "n") { notes.classList.toggle("open"); chrome(); }
    else if (e.key.toLowerCase() === "f") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (/^[1-9]$/.test(e.key) && mode === "deck") go(+e.key - 1);
  });
  slides.forEach((s, k) => s.addEventListener("click", (e) => { if (mode === "overview") openSlide(k); else if (!e.target.closest(".col, .lbl, .ba, .ac, .st, .hx, a, .ag-it")) next(); }));
  let wheelLock = 0;
  addEventListener("wheel", (e) => {
    if (Date.now() < wheelLock || Math.abs(e.deltaY) < 25) return;
    wheelLock = Date.now() + 1000;
    if (mode === "overview") spin(e.deltaY > 0 ? 1 : -1); else (e.deltaY > 0 ? next() : prev());
  }, { passive: true });
  let tx = null;
  addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) (dx < 0 ? next() : prev()); tx = null; });

  /* ---------- small interactions ---------- */
  const vid = slides[0].querySelector(".hero-video");
  const px = gsap.quickTo(vid, "x", { duration: 1.2, ease: "power3.out" }), py = gsap.quickTo(vid, "y", { duration: 1.2, ease: "power3.out" });
  stage.addEventListener("mousemove", (e) => {
    if (mode !== "deck" || cur !== 0) return;
    const r = stage.getBoundingClientRect();
    px(((e.clientX - r.left) / r.width - 0.5) * -22); py(((e.clientY - r.top) / r.height - 0.5) * -12);
  });

  chrome();
  intro();
})();
