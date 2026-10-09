import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    nav_community: 'Community',
    nav_heatmap: 'Live Heatmap',
    nav_report: 'Report Issue',
    nav_officer: 'Officer Portal',
    nav_karma: 'Karma',
    hero_title: 'See a problem. Report it. Fix it together.',
    hero_sub: 'Empowering Indian citizens with AI-driven civic reporting & municipal escrow action.',
    btn_report: 'Report Civic Issue',
    btn_view_map: 'View Live Map',
    ai_verified: 'AI Verified',
    community_verified: 'Community Verified',
    officially_verified: 'Officially Verified',
    reopened_hazard: 'Recurring Hazard',
    escrow_vault: 'Municipal Escrow Vault',
    indicative_cost: 'Indicative AI Estimate Range'
  },
  mr: {
    nav_community: 'नागरी समुदाय',
    nav_heatmap: 'थेट नकाशा',
    nav_report: 'समस्या नोंदवा',
    nav_officer: 'अधिकारी पोर्टल',
    nav_karma: 'कर्म गुण',
    hero_title: 'समस्या पहा. नोंदवा. एकत्र मिळून सोडवा.',
    hero_sub: 'कृत्रिम बुद्धिमत्ता आणि महापालिका निधी पारदर्शकतेद्वारे भारतीय नागरिकांचे सक्षमीकरण.',
    btn_report: 'समस्या नोंदवा',
    btn_view_map: 'नकाशा पहा',
    ai_verified: 'AI द्वारे तपासलेले',
    community_verified: 'नागरिकांद्वारे सत्यापित',
    officially_verified: 'महापालिकेद्वारे स्वीकृत',
    reopened_hazard: 'पुन्हा उद्भवलेली समस्या',
    escrow_vault: 'महापालिका एस्क्रॉ व्हॉल्ट',
    indicative_cost: 'अंदाजित खर्च मर्यादा'
  },
  hi: {
    nav_community: 'नागरिक समुदाय',
    nav_heatmap: 'लाइव मानचित्र',
    nav_report: 'समस्या दर्ज करें',
    nav_officer: 'अधिकारी पोर्टल',
    nav_karma: 'कर्म अंक',
    hero_title: 'समस्या देखें। दर्ज करें। मिलकर समाधान करें।',
    hero_sub: 'एआई और नगर निगम फंड पारदर्शिता के साथ भारतीय नागरिकों को सशक्त बनाना।',
    btn_report: 'समस्या दर्ज करें',
    btn_view_map: 'मानचित्र देखें',
    ai_verified: 'एआई द्वारा जांचा गया',
    community_verified: 'नागरिकों द्वारा सत्यापित',
    officially_verified: 'नगर निगम द्वारा स्वीकृत',
    reopened_hazard: 'पुनरावृत्त समस्या',
    escrow_vault: 'नगर निगम एस्क्रॉ वॉलेट',
    indicative_cost: 'अनुमानित लागत सीमा'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
