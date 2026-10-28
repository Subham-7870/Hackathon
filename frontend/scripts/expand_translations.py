import os
import json
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TRANSLATIONS_FILE = os.path.join(SCRIPT_DIR, '..', 'src', 'i18n', 'translations.ts')

with open(TRANSLATIONS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add keys to TranslationDict interface
dict_insert = """  // AI Section & Copilot
  aiJustificationTitle: string;
  aiCopilotTitle: string;
  aiCopilotSubtitle: string;
  enterRawMemoLabel: string;
  memoPlaceholder: string;
  sampleMemosLabel: string;
  parseWithAiBtn: string;
  parsedTicketPreview: string;
  aiConfidenceScore: string;
  pushToQueueBtn: string;
  disruptionModalTitle: string;
  disruptionModalSubtitle: string;
  selectDisruptionScenario: string;
  dynamicAiReroutePlan: string;
  dynamicAiRerouteDesc: string;
  injectDisruptionBtn: string;
  solvingGraphText: string;
}"""

content = content.replace("  directionFilter: string;\n}", "  directionFilter: string;\n\n" + dict_insert)

AI_KEYS = {
  "en": {
    "aiJustificationTitle": "AI Dispatcher Reasoning & Mathematical Justification:",
    "aiCopilotTitle": "AI Operational Co-Pilot & Memo Parser",
    "aiCopilotSubtitle": "Transform unstructured WhatsApp/radio memos into structured G&SR maintenance tickets.",
    "enterRawMemoLabel": "Enter Raw Engineer Memo / Radio Transcript:",
    "memoPlaceholder": "e.g., Urgent OHE insulator flashover near KM 1014.2 on Delhi-Kanpur section...",
    "sampleMemosLabel": "Or Select Representative Field Memos:",
    "parseWithAiBtn": "Parse with Neural Transformer",
    "parsedTicketPreview": "Parsed Statutory Ticket Preview:",
    "aiConfidenceScore": "AI Confidence Score:",
    "pushToQueueBtn": "Push to Active Corridor Queue",
    "disruptionModalTitle": "What-If Disruption Sandbox & Real-time Rescheduler",
    "disruptionModalSubtitle": "Simulate chaotic railway disruptions and watch Google OR-Tools CP-SAT re-solve in < 3 seconds.",
    "selectDisruptionScenario": "Select Real-world Disruption Scenario:",
    "dynamicAiReroutePlan": "Dynamic AI Re-Route Plan",
    "dynamicAiRerouteDesc": "When injected, NEURA-TRACK will dynamically shift maintenance windows, verify that all Superfast trains (Vande Bharat/Rajdhani) remain protected on zero delay, and divert freight to siding loops.",
    "injectDisruptionBtn": "Inject Disruption & Re-Optimize",
    "solvingGraphText": "Solving Disruption Space-Time Graph..."
  },
  "hi": {
    "aiJustificationTitle": "एआई प्रेषक तर्क और गणितीय औचित्य:",
    "aiCopilotTitle": "एआई परिचालन सह-पायलट और मेमो विश्लेषक",
    "aiCopilotSubtitle": "व्हाट्सएप/रेडियो मेमो को संरचित जी एंड एसआर रखरखाव टिकटों में बदलें।",
    "enterRawMemoLabel": "कच्चा इंजीनियर मेमो / रेडियो ट्रांसक्रिप्ट दर्ज करें:",
    "memoPlaceholder": "उदा., दिल्ली-कानपुर सेक्शन में किमी 1014.2 के पास तत्काल ओएचई इंसुलेटर फ्लैशओवर...",
    "sampleMemosLabel": "या प्रतिनिधि फील्ड मेमो में से चुनें:",
    "parseWithAiBtn": "न्यूरल ट्रांसफार्मर से पार्स करें",
    "parsedTicketPreview": "पार्स किए गए वैधानिक टिकट का पूर्वावलोकन:",
    "aiConfidenceScore": "एआई विश्वसनीयता स्कोर:",
    "pushToQueueBtn": "सक्रिय कॉरिडोर कतार में जोड़ें",
    "disruptionModalTitle": "व्हाट-इफ व्यवधान सैंडबॉक्स और वास्तविक समय पुनर्निर्धारक",
    "disruptionModalSubtitle": "रेलवे व्यवधानों का अनुकरण करें और देखें गूगल ओआर-टूल्स सीपी-सैट 3 सेकंड से कम समय में पुनः हल करता है।",
    "selectDisruptionScenario": "वास्तविक दुनिया का व्यवधान परिदृश्य चुनें:",
    "dynamicAiReroutePlan": "गतिशील एआई पुनर्मार्ग योजना",
    "dynamicAiRerouteDesc": "व्यवधान लागू होने पर, नेउरा-ट्रैक रखरखाव विंडो को समायोजित करेगा, यह सत्यापित करेगा कि सभी सुपरफास्ट ट्रेनें शून्य देरी पर सुरक्षित रहें और मालगाड़ियों को लूप साइडिंग पर डाइवर्ट करेगा।",
    "injectDisruptionBtn": "व्यवधान लागू करें और पुनः अनुकूलित करें",
    "solvingGraphText": "व्यवधान स्पेस-टाइम ग्राफ का समाधान हो रहा है..."
  },
  "te": {
    "aiJustificationTitle": "AI డిస్పాచర్ విశ్లేషణ & గణిత న్యాయబద్ధత:",
    "aiCopilotTitle": "AI కార్యాచరణ సహ-పైలట్ & మెమో పార్సర్",
    "aiCopilotSubtitle": "వాట్సాప్/రేడియో మెమోలను నియంత్రిత G&SR నిర్వహణ టిక్కెట్‌లుగా మార్చండి.",
    "enterRawMemoLabel": "ఇంజనీర్ మెమో / రేడియో ట్రాన్స్‌క్రిప్ట్ నమోదు చేయండి:",
    "memoPlaceholder": "ఉదా., ఢిల్లీ-కాన్పూర్ విభాగంలో కి.మీ 1014.2 సమీపంలో అత్యవసర OHE ఇన్సులేటర్ సమస్య...",
    "sampleMemosLabel": "లేదా ఫీల్డ్ మెమోలలో ఒకదాన్ని ఎంచుకోండి:",
    "parseWithAiBtn": "న్యూరల్ ట్రాన్స్‌ఫార్మర్‌తో విశ్లేషించండి",
    "parsedTicketPreview": "చట్టబద్ధమైన టిక్కెట్ ముందస్తు వీక్షణ:",
    "aiConfidenceScore": "AI విశ్వసనీయత స్కోరు:",
    "pushToQueueBtn": "కారిడార్ క్యూకు జోడించండి",
    "disruptionModalTitle": "వాట్-ఇఫ్ అంతరాయ శాండ్‌బాక్స్ & రీ-షెడ్యూలర్",
    "disruptionModalSubtitle": "రైల్వే అంతరాయాలను అనుకరించండి మరియు గూగుల్ OR-టూల్స్ CP-SAT 3 సెకన్లలో పరిష్కరించడాన్ని గమనించండి.",
    "selectDisruptionScenario": "వాస్తవ అంతరాయ దృష్టాంతాన్ని ఎంచుకోండి:",
    "dynamicAiReroutePlan": "డైనమిక్ AI పునఃమార్గాంశ ప్రణాళిక",
    "dynamicAiRerouteDesc": "అమలు చేసినప్పుడు, NEURA-TRACK నిర్వహణ సమయాలను సర్దుబాటు చేస్తుంది, సూపర్ ఫాస్ట్ రైళ్లు ఆలస్యం కాకుండా కాపాడుతుంది.",
    "injectDisruptionBtn": "అంతరాయాన్ని ఇంజెక్ట్ చేయండి & తిరిగి పరిష్కరించండి",
    "solvingGraphText": "స్పేస్-టైమ్ గ్రాఫ్ పరిష్కరించబడుతోంది..."
  },
  "bn": {
    "aiJustificationTitle": "এআই ডিসপ্যাচার যুক্তি ও গাণিতিক যৌক্তিকতা:",
    "aiCopilotTitle": "এআই অপারেশনাল কো-পাইলট ও মেমো পার্সার",
    "aiCopilotSubtitle": "হোয়াটসঅ্যাপ/রেডিও মেমোকে কাঠামোগত জি অ্যান্ড এসআর রক্ষণাবেক্ষণ টিকিটে রূপান্তর করুন।",
    "enterRawMemoLabel": "ইঞ্জিনিয়ার মেমো / রেডিও প্রতিলিপি লিখুন:",
    "memoPlaceholder": "যেমন, দিল্লি-কানপুর সেকশনে কিমি ১০১৪.২-এর কাছে ওএইচই ইনসুলেটর ত্রুটি...",
    "sampleMemosLabel": "অথবা প্রতিনিধি ফিল্ড মেমো নির্বাচন করুন:",
    "parseWithAiBtn": "নিউরাল ট্রান্সফরমার দিয়ে পার্স করুন",
    "parsedTicketPreview": "সংবিধিবদ্ধ টিকিট প্রিভিউ:",
    "aiConfidenceScore": "এআই আত্মবিশ্বাস স্কোর:",
    "pushToQueueBtn": "সক্রিয় করিডোর সারিতে যোগ করুন",
    "disruptionModalTitle": "হোয়াট-ইফ ব্যাঘাত স্যান্ডবক্স ও রিয়েল-টাইম রিসিডিউলার",
    "disruptionModalSubtitle": "রেলওয়ে ব্যাঘাত অনুকরণ করুন এবং গুগল ওআর-টুলস সিপি-স্যাট ৩ সেকেন্ডের মধ্যে পুনরায় সমাধান করতে দেখুন।",
    "selectDisruptionScenario": "বাস্তব ব্যাঘাতের দৃশ্যপট নির্বাচন করুন:",
    "dynamicAiReroutePlan": "গতিশীল এআই পুনর্মার্গ পরিকল্পনা",
    "dynamicAiRerouteDesc": "প্রয়োগ করা হলে, নিউরা-ট্র্যাক রক্ষণাবেক্ষণ সময়সূচী পরিবর্তন করবে এবং সুপারফাস্ট ট্রেন সুরক্ষিত রাখবে।",
    "injectDisruptionBtn": "ব্যাঘাত অন্তর্ভুক্ত করুন ও পুনরায় অপ্টিমাইজ করুন",
    "solvingGraphText": "স্পেস-টাইম গ্রাফ সমাধান করা হচ্ছে..."
  },
  "ta": {
    "aiJustificationTitle": "AI கட்டுப்பாட்டு பகுப்பாய்வு & கணித விளக்கம்:",
    "aiCopilotTitle": "AI செயல்பாட்டு துணை-பைலட் & மெமோ பாகுபடுத்தி",
    "aiCopilotSubtitle": "வாட்ஸ்அப்/ரேடியோ மெமோக்களை கட்டமைக்கப்பட்ட G&SR பராமரிப்பு சீட்டுகளாக மாற்றவும்.",
    "enterRawMemoLabel": "பொறியாளர் மெமோ / வானொலி உரையை உள்ளிடவும்:",
    "memoPlaceholder": "எ.கா., டெல்லி-கான்பூர் பிரிவில் கி.மீ 1014.2 அருகே அவசர OHE இன்சுலேட்டர் கோளாறு...",
    "sampleMemosLabel": "அல்லது கள மெமோக்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்:",
    "parseWithAiBtn": "நியூரல் டிரான்ஸ்ஃபார்மர் மூலம் பாகுபடுத்தவும்",
    "parsedTicketPreview": "வடிவமைக்கப்பட்ட சட்டப்பூர்வ டிக்கெட் முன்னோட்டம்:",
    "aiConfidenceScore": "AI நம்பகத்தன்மை மதிப்பீடு:",
    "pushToQueueBtn": "செயலில் உள்ள வரிசையில் சேர்க்கவும்",
    "disruptionModalTitle": "தடை சான்ட்பாக்ஸ் & நேரடி மறுதிட்டமிடல்",
    "disruptionModalSubtitle": "இரயில்வே தடைகளை உருவகப்படுத்தி கூகிள் OR-டூல்ஸ் CP-SAT 3 வினாடிகளில் தீர்ப்பதைக் காணுங்கள்.",
    "selectDisruptionScenario": "உண்மையான தடை சூழ்நிலையைத் தேர்வுசெய்க:",
    "dynamicAiReroutePlan": "மாறும் AI மாற்றுப் பாதை திட்டம்",
    "dynamicAiRerouteDesc": "செயல்படுத்தப்படும் போது, NEURA-TRACK பராமரிப்பு நேரங்களை மாற்றியமைத்து, அதிவேக ரயில்களைப் பாதுகாக்கும்.",
    "injectDisruptionBtn": "தடையைச் செலுத்தி மீண்டும் மேம்படுத்தவும்",
    "solvingGraphText": "இடைவெளி-நேர வரைபடம் தீர்க்கப்படுகிறது..."
  },
  "mr": {
    "aiJustificationTitle": "एआय प्रेषक तर्क आणि गणितीय औचित्य:",
    "aiCopilotTitle": "एआय ऑपरेशनल सह-पायलट आणि मेमो पार्सर",
    "aiCopilotSubtitle": "व्हॉट्सॲप/रेडिओ मेमोंचे संरचित जी अँड एसआर मेंटेनन्स तिकीटांमध्ये रूपांतर करा.",
    "enterRawMemoLabel": "कच्चा अभियंता मेमो / रेडिओ उतारा प्रविष्ट करा:",
    "memoPlaceholder": "उदा., दिल्ली-कानपूर विभागात किमी १०१४.२ जवळ तातडीचा ओएचई इन्सुलेटर बिघाड...",
    "sampleMemosLabel": "किंवा प्रातिनिधिक फील्ड मेमो निवडा:",
    "parseWithAiBtn": "न्यूरल ट्रान्सफॉर्मरने पार्स करा",
    "parsedTicketPreview": "पार्स केलेल्या वैधानिक तिकिटाचे पूर्वावलोकन:",
    "aiConfidenceScore": "एआय आत्मविश्वास स्कोअर:",
    "pushToQueueBtn": "सक्रिय कॉरिडोअर रांगेत जोडा",
    "disruptionModalTitle": "व्हॉट-इफ व्यत्यय सँडबॉक्स आणि री-शेड्यूलर",
    "disruptionModalSubtitle": "रेल्वे व्यत्ययांचे अनुकरण करा आणि गुगल ओआर-टूल्स सीपी-सॅट ३ सेकंदात सोडवताना पहा.",
    "selectDisruptionScenario": "वास्तविक व्यत्यय परिस्थिती निवडा:",
    "dynamicAiReroutePlan": "डायनॅमिक एआय पुनर्प्रवासाची योजना",
    "dynamicAiRerouteDesc": "लागू केल्यावर, न्यूरा-ट्रॅक मेंटेनन्स विंडो बदलेल आणि सर्व सुपरफास्ट ट्रेन्स सुरक्षित ठेवेल.",
    "injectDisruptionBtn": "व्यत्यय लागू करा आणि पुन्हा ऑप्टिमाइझ करा",
    "solvingGraphText": "स्पेस-टाइम आलेख सोडवला जात आहे..."
  },
  "gu": {
    "aiJustificationTitle": "AI ડિસ્પેચર તર્ક અને ગાણિતિક ઔચિત્ય:",
    "aiCopilotTitle": "AI ઓપરેશનલ કો-પાઇલટ અને મેમો પાર્સર",
    "aiCopilotSubtitle": "વ્હોટ્સએપ/રેડિયો મેમોને સંરચિત G&SR મેન્ટેનન્સ ટિકિટમાં રૂપાંતરિત કરો.",
    "enterRawMemoLabel": "એન્જિનિયર મેમો / રેડિયો ટ્રાન્સક્રિપ્ટ દાખલ કરો:",
    "memoPlaceholder": "દા.ત., દિલ્હી-કાનપુર સેક્શનમાં કિમી 1014.2 પાસે તાત્કાલિક OHE ઇન્સ્યુલેટર ખામી...",
    "sampleMemosLabel": "અથવા ફીલ્ડ મેમો પસંદ કરો:",
    "parseWithAiBtn": "ન્યુરલ ટ્રાન્સફોર્મર વડે પાર્સ કરો",
    "parsedTicketPreview": "પાર્સ કરેલ વૈધાનિક ટિકિટ પૂર્વાવલોકન:",
    "aiConfidenceScore": "AI વિશ્વાસ સ્કોર:",
    "pushToQueueBtn": "સક્રિય કોરિડોર કતારમાં ઉમેરો",
    "disruptionModalTitle": "વ્હોટ-ઇફ વિક્ષેપ સેન્ડબોક્સ અને રી-શેડ્યૂલર",
    "disruptionModalSubtitle": "રેલવે વિક્ષેપોનું અનુકરણ કરો અને ગૂગલ OR-ટૂલ્સ CP-SAT ને 3 સેકન્ડમાં ફરી ઉકેલતા જુઓ.",
    "selectDisruptionScenario": "વાસ્તવિક વિક્ષેપ દૃશ્ય પસંદ કરો:",
    "dynamicAiReroutePlan": "ગતિશીલ AI રી-રૂટ પ્લાન",
    "dynamicAiRerouteDesc": "લાગુ થવા પર, NEURA-TRACK જાળવણી વિન્ડોને સમાયોજિત કરશે અને સુપરફાસ્ટ ટ્રેનોનું રક્ષણ કરશે.",
    "injectDisruptionBtn": "વિક્ષેપ દાખલ કરો અને ફરીથી ઓપ્ટિમાઇઝ કરો",
    "solvingGraphText": "સ્પેસ-ટાઇમ ગ્રાફ ઉકેલાઈ રહ્યો છે..."
  },
  "kn": {
    "aiJustificationTitle": "AI ನಿಯಂತ್ರಣ ತರ್ಕ ಮತ್ತು ಗಣಿತ ಸಮರ್ಥನೆ:",
    "aiCopilotTitle": "AI ಕಾರ್ಯಾಚರಣಾ ಸಹ-ಪೈಲಟ್ & ಮೆಮೊ ಪಾರ್ಸರ್",
    "aiCopilotSubtitle": "ವಾಟ್ಸಾಪ್/ರೇಡಿಯೋ ಮೆಮೊಗಳನ್ನು ರಚನಾತ್ಮಕ G&SR ನಿರ್ವಹಣಾ ಟಿಕೆಟ್‌ಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ.",
    "enterRawMemoLabel": "ಇಂಜಿನಿಯರ್ ಮೆಮೊ / ರೇಡಿಯೋ ಪ್ರತಿಲಿಪಿ ನಮೂದಿಸಿ:",
    "memoPlaceholder": "ಉದಾ., ದೆಹಲಿ-ಕಾನ್ಪುರ ವಿಭಾಗದಲ್ಲಿ ಕಿಮೀ 1014.2 ಬಳಿ ತುರ್ತು OHE ಇನ್ಸುಲೇಟರ್ ದೋಷ...",
    "sampleMemosLabel": "ಅಥವಾ ಕ್ಷೇತ್ರ ಮೆಮೊಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ:",
    "parseWithAiBtn": "ನ್ಯೂರಾಲ್ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್‌ನೊಂದಿಗೆ ಪಾರ್ಸ್ ಮಾಡಿ",
    "parsedTicketPreview": "ಶಾಸನಬದ್ಧ ಟಿಕೆಟ್ ಮುನ್ನೋಟ:",
    "aiConfidenceScore": "AI ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಕೋರ್:",
    "pushToQueueBtn": "ಸಕ್ರಿಯ ಕ್ಯೂಗೆ ಸೇರಿಸಿ",
    "disruptionModalTitle": "ಅಡಚಣೆ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್ ಮತ್ತು ಮರುಹಂಚಿಕೆದಾರ",
    "disruptionModalSubtitle": "ರೈಲ್ವೆ ಅಡಚಣೆಗಳನ್ನು ಅನುಕರಿಸಿ ಮತ್ತು ಗೂಗಲ್ OR-ಟೂಲ್ಸ್ CP-SAT 3 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಪರಿಹರಿಸುವುದನ್ನು ನೋಡಿ.",
    "selectDisruptionScenario": "ನೈಜ ಅಡಚಣೆಯ ಸನ್ನಿವೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
    "dynamicAiReroutePlan": "ಡೈನಾಮಿಕ್ AI ಮರುಮಾರ್ಗ ಯೋಜನೆ",
    "dynamicAiRerouteDesc": "ಅನ್ವಯಿಸಿದಾಗ, NEURA-TRACK ನಿರ್ವಹಣಾ ಸಮಯವನ್ನು ಸರಿಹೊಂದಿಸುತ್ತದೆ ಮತ್ತು ಸೂಪರ್‌ಫಾಸ್ಟ್ ರೈಲುಗಳನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.",
    "injectDisruptionBtn": "ಅಡಚಣೆಯನ್ನು ಸೇರಿಸಿ ಮತ್ತು ಮರು-ಆಪ್ಟಿಮೈಸ್ ಮಾಡಿ",
    "solvingGraphText": "ಸ್ಪೇಸ್-ಟೈಮ್ ಗ್ರಾಫ್ ಪರಿಹರಿಸಲಾಗುತ್ತಿದೆ..."
  },
  "ml": {
    "aiJustificationTitle": "AI ഡിസ്പാച്ചർ യുക്തിയും ഗണിത വിശദീകരണവും:",
    "aiCopilotTitle": "AI പ്രവർത്തന സഹ-പൈലറ്റ് & മെമ്മോ പാർസർ",
    "aiCopilotSubtitle": "വാട്ട്‌സ്ആപ്പ്/റേഡിയോ മെമ്മോകളെ ഘടനാപരമായ G&SR മെയിന്റനൻസ് ടിക്കറ്റുകളാക്കി മാറ്റുക.",
    "enterRawMemoLabel": "എഞ്ചിനീയർ മെമ്മോ / റേഡിയോ ട്രാൻസ്ക്രിപ്റ്റ് നൽകുക:",
    "memoPlaceholder": "ഉദാ., ഡൽഹി-കാൺപൂർ സെക്ഷനിൽ കി.മീ 1014.2 ന് സമീപം അടിയന്തര OHE ഇൻസുലേറ്റർ തകരാർ...",
    "sampleMemosLabel": "അല്ലെങ്കിൽ ഫീൽഡ് മെമ്മോകളിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക:",
    "parseWithAiBtn": "ന്യൂറൽ ട്രാൻസ്ഫോർമർ ഉപയോഗിച്ച് പാർസ് ചെയ്യുക",
    "parsedTicketPreview": "നിയമപരമായ ടിക്കറ്റ് പ്രിവ്യൂ:",
    "aiConfidenceScore": "AI വിശ്വാസ്യത സ്കോർ:",
    "pushToQueueBtn": "ആക്ടീവ് ക്യൂവിലേക്ക് മാറ്റുക",
    "disruptionModalTitle": "തടസ്സ സാൻഡ്‌ബോക്സ് & തത്സമയ റീ-ഷെഡ്യൂളർ",
    "disruptionModalSubtitle": "റെയിൽവേ തടസ്സങ്ങൾ അനുകരിക്കുകയും ഗൂഗിൾ OR-ടൂൾസ് CP-SAT 3 സെക്കൻഡിനുള്ളിൽ പരിഹരിക്കുന്നത് കാണുകയും ചെയ്യുക.",
    "selectDisruptionScenario": "യഥാർത്ഥ തടസ്സ സാഹചര്യം തിരഞ്ഞെടുക്കുക:",
    "dynamicAiReroutePlan": "ഡൈനാമിക് AI റീ-റൂട്ട് പ്ലാൻ",
    "dynamicAiRerouteDesc": "ബാധകമാകുമ്പോൾ, NEURA-TRACK മെയിന്റനൻസ് വിൻഡോകൾ ക്രമീകരിക്കുകയും സൂപ്പർഫാസ്റ്റ് ട്രെയിനുകൾ സംരക്ഷിക്കുകയും ചെയ്യും.",
    "injectDisruptionBtn": "തടസ്സം നൽകി വീണ്ടും ഒപ്റ്റിമൈസ് ചെയ്യുക",
    "solvingGraphText": "സ്പേസ്-ടൈം ഗ്രാഫ് പരിഹരിക്കുന്നു..."
  },
  "pa": {
    "aiJustificationTitle": "AI ਡਿਸਪੈਚਰ ਤਰਕ ਅਤੇ ਗਣਿਤਕ ਜਾਇਜ਼ਤਾ:",
    "aiCopilotTitle": "AI ਓਪਰੇਸ਼ਨਲ ਕੋ-ਪਾਇਲਟ ਅਤੇ ਮੈਮੋ ਪਾਰਸਰ",
    "aiCopilotSubtitle": "ਵਟਸਐਪ/ਰੇਡੀਓ ਮੈਮੋ ਨੂੰ ਢਾਂਚਾਗਤ G&SR ਮੇਨਟੇਨੈਂਸ ਟਿਕਟਾਂ ਵਿੱਚ ਬਦਲੋ।",
    "enterRawMemoLabel": "ਇੰਜੀਨੀਅਰ ਮੈਮੋ / ਰੇਡੀਓ ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਦਰਜ ਕਰੋ:",
    "memoPlaceholder": "ਉਦਾਹਰਣ ਵਜੋਂ, ਦਿੱਲੀ-ਕਾਨਪੁਰ ਸੈਕਸ਼ਨ ਵਿੱਚ ਕਿਲੋਮੀਟਰ 1014.2 ਨੇੜੇ ਐਮਰਜੈਂਸੀ OHE ਇੰਸੂਲੇਟਰ ਨੁਕਸ...",
    "sampleMemosLabel": "ਜਾਂ ਖੇਤਰ ਮੈਮੋ ਚੁਣੋ:",
    "parseWithAiBtn": "ਨਿਊਰਲ ਟ੍ਰਾਂਸਫਾਰਮਰ ਨਾਲ ਪਾਰਸ ਕਰੋ",
    "parsedTicketPreview": "ਪਾਰਸ ਕੀਤੀ ਕਾਨੂੰਨੀ ਟਿਕਟ ਝਲਕ:",
    "aiConfidenceScore": "AI ਭਰੋਸੇਯੋਗਤਾ ਸਕੋਰ:",
    "pushToQueueBtn": "ਸਰਗਰਮ ਕਤਾਰ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
    "disruptionModalTitle": "ਵਿਘਨ ਸੈਂਡਬੌਕਸ ਅਤੇ ਰੀ-ਸ਼ਡਿਊਲਰ",
    "disruptionModalSubtitle": "ਰੇਲਵੇ ਵਿਘਨਾਂ ਦੀ ਨਕਲ ਕਰੋ ਅਤੇ ਗੂਗਲ OR-ਟੂਲਜ਼ CP-SAT ਨੂੰ 3 ਸਕਿੰਟਾਂ ਵਿੱਚ ਹੱਲ ਕਰਦੇ ਹੋਏ ਦੇਖੋ।",
    "selectDisruptionScenario": "ਅਸਲ ਵਿਘਨ ਦ੍ਰਿਸ਼ ਚੁਣੋ:",
    "dynamicAiReroutePlan": "ਡਾਇਨਾਮਿਕ AI ਰੀ-ਰੂਟ ਪਲਾਨ",
    "dynamicAiRerouteDesc": "ਜਦੋਂ ਲਾਗੂ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਤਾਂ NEURA-TRACK ਰੱਖ-ਰਖਾਅ ਵਿੰਡੋਜ਼ ਨੂੰ ਵਿਵਸਥਿਤ ਕਰੇਗਾ ਅਤੇ ਸੁਪਰਫਾਸਟ ਟ੍ਰੇਨਾਂ ਦੀ ਰੱਖਿਆ ਕਰੇਗਾ।",
    "injectDisruptionBtn": "ਵਿਘਨ ਸ਼ਾਮਲ ਕਰੋ ਅਤੇ ਮੁੜ ਅਨੁਕੂਲਿਤ ਕਰੋ",
    "solvingGraphText": "ਸਪੇਸ-ਟਾਈਮ ਗ੍ਰਾਫ ਹੱਲ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ..."
  },
  "or": {
    "aiJustificationTitle": "AI ଡିସପାଚର ତର୍କ ଓ ଗାଣିତିକ ଯଥାର୍ଥତା:",
    "aiCopilotTitle": "AI କାର୍ଯ୍ୟକ୍ଷମ ସହ-ପାଇଲଟ୍ ଓ ମେମୋ ପାର୍ସର୍",
    "aiCopilotSubtitle": "ହ୍ୱାଟ୍ସଆପ୍/ରେଡିଓ ମେମୋକୁ ଗଠନମୂଳକ G&SR ରକ୍ଷଣାବେକ୍ଷଣ ଟିକେଟରେ ପରିଣତ କରନ୍ତୁ।",
    "enterRawMemoLabel": "ଇଞ୍ଜିନିୟର ମେମୋ / ରେଡିଓ ବିବରଣୀ ପ୍ରବେଶ କରନ୍ତୁ:",
    "memoPlaceholder": "ଯଥା, ଦିଲ୍ଲୀ-କାନପୁର ସେକ୍ସନରେ କିମି 1014.2 ନିକଟରେ ଜରୁରୀ OHE ଇନସୁଲେଟର ତ୍ରୁଟି...",
    "sampleMemosLabel": "କିମ୍ବା ଫିଲ୍ଡ ମେମୋ ଚୟନ କରନ୍ତୁ:",
    "parseWithAiBtn": "ନ୍ୟୁରାଲ ଟ୍ରାନ୍ସଫର୍ମର ସହିତ ପାର୍ସ କରନ୍ତୁ",
    "parsedTicketPreview": "ପାର୍ସ ହୋଇଥିବା ବିଧିବଦ୍ଧ ଟିକେଟ୍ ପୂର୍ବାବଲୋକନ:",
    "aiConfidenceScore": "AI ବିଶ୍ୱସନୀୟତା ସ୍କୋର:",
    "pushToQueueBtn": "ସକ୍ରିୟ ଧାଡିରେ ଯୋଡନ୍ତୁ",
    "disruptionModalTitle": "ବିଭ୍ରାଟ ସ୍ୟାଣ୍ଡବକ୍ସ ଓ ପୁନଃ-ନିର୍ଦ୍ଧାରକ",
    "disruptionModalSubtitle": "ରେଳ ବିଭ୍ରାଟ ଅନୁକରଣ କରନ୍ତୁ ଏବଂ ଗୁଗଲ OR-ଟୁଲ୍ସ CP-SAT 3 ସେକେଣ୍ଡରେ ପୁନଃ ସମାଧାନ କରୁଥିବା ଦେଖନ୍ତୁ।",
    "selectDisruptionScenario": "ବାସ୍ତବିକ ବିଭ୍ରାଟ ପରିସ୍ଥିତି ବାଛନ୍ତୁ:",
    "dynamicAiReroutePlan": "ଗତିଶୀଳ AI ପୁନର୍ମାର୍ଗ ଯୋଜନା",
    "dynamicAiRerouteDesc": "ଲାଗୁ ହେବା ପରେ, NEURA-TRACK ରକ୍ଷଣାବେକ୍ଷଣ ସମୟକୁ ସଜାଡିବ ଏବଂ ସୁପରଫାଷ୍ଟ ଟ୍ରେନଗୁଡିକୁ ସୁରକ୍ଷିତ ରଖିବ।",
    "injectDisruptionBtn": "ବିଭ୍ରାଟ ଯୋଡନ୍ତୁ ଏବଂ ପୁନର୍ବାର ଅପ୍ଟିମାଇଜ୍ କରନ୍ତୁ",
    "solvingGraphText": "ସ୍ପେସ୍-ଟାଇମ୍ ଗ୍ରାଫ୍ ସମାଧାନ ହେଉଛି..."
  },
  "as": {
    "aiJustificationTitle": "AI প্ৰেৰক যুক্তি আৰু গাণিতিক ন্যায়সংগততা:",
    "aiCopilotTitle": "AI অপাৰেচনেল ক'-পাইলট আৰু মেম' পাৰ্চাৰ",
    "aiCopilotSubtitle": "হোৱাটছএপ/ৰেডিঅ' মেম'ক কাঠামোগত G&SR মেণ্টেনেন্স টিকটলৈ ৰূপান্তৰ কৰক।",
    "enterRawMemoLabel": "অভিযন্তা মেম' / ৰেডিঅ' অনুলিপি প্ৰবিষ্ট কৰক:",
    "memoPlaceholder": "যেনে, দিল্লী-কানপুৰ অংশত কিমি ১০১৪.২ৰ ওচৰত জৰুৰী OHE ইনচুলেটৰ বিজুতি...",
    "sampleMemosLabel": "বা প্ৰতিনিধি ফিল্ড মেম' বাছক:",
    "parseWithAiBtn": "নিউৰেল ট্ৰান্সফৰ্মাৰেৰে পাৰ্ছ কৰক",
    "parsedTicketPreview": "সংবিধিবদ্ধ টিকটৰ পূৰ্বলোকন:",
    "aiConfidenceScore": "AI আত্মবিশ্বাস স্ক'ৰ:",
    "pushToQueueBtn": "সক্ৰিয় শাৰীলৈ যোগ কৰক",
    "disruptionModalTitle": "হোৱাট-ইফ বিজুতি চেণ্ডবক্স আৰু পুনৰ নিৰ্ধাৰক",
    "disruptionModalSubtitle": "ৰে'লৱে বিজুতি অনুকৰণ কৰক আৰু গুগল OR-টুলছ CP-SATক ৩ ছেকেণ্ডত পুনৰ সমাধান কৰা চাওক।",
    "selectDisruptionScenario": "প্ৰকৃত বিজুতিৰ পৰিস্থিতি বাছক:",
    "dynamicAiReroutePlan": "গতিশীল AI পুনৰ পথ পৰিকল্পনা",
    "dynamicAiRerouteDesc": "প্ৰয়োগ কৰিলে, NEURA-TRACKএ মেণ্টেনেন্স সময়সূচী সলনি কৰিব আৰু চুপাৰফাষ্ট ৰে'লসমূহ সুৰক্ষিত ৰাখিব।",
    "injectDisruptionBtn": "বিজুতি প্ৰয়োগ কৰক আৰু পুনৰ অপ্টিমাইজ কৰক",
    "solvingGraphText": "স্পেচ-টাইম গ্ৰাফ সমাধান কৰা হৈছে..."
  }
}

# Add AI keys to each language block in TRANSLATIONS dictionary
# Pattern: "directionFilter": "..."\n  }
for lang, keys_dict in AI_KEYS.items():
    # Build JS properties
    props = ""
    for k, v in keys_dict.items():
        v_escaped = v.replace('"', '\\"')
        props += f'    "{k}": "{v_escaped}",\n'
    
    # We find the lang block
    pattern = rf'("{lang}":\s*\{{[\s\S]*?"directionFilter":\s*"[^"]*")'
    m = re.search(pattern, content)
    if m:
        old_part = m.group(1)
        # Append props after directionFilter
        new_part = old_part + ",\n" + props.rstrip(",\n")
        content = content.replace(old_part, new_part, 1)

with open(TRANSLATIONS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated translations.ts with AI Section translations!")
