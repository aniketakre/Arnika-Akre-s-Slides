
type Lang = 'en' | 'es';

const dict = {
  en: {
    welcome: "Turn Docs into Experiences.",
    import: "Import Document",
    present: "Present",
    new: "New",
    publish: "Publish",
    refining: "Gemini Assistant Refining Layout...",
    templates: "Start from template",
    outline: "Outline"
  },
  es: {
    welcome: "Convierte documentos en experiencias.",
    import: "Importar Documento",
    present: "Presentar",
    new: "Nuevo",
    publish: "Publicar",
    refining: "Asistente Gemini refinando el diseño...",
    templates: "Comenzar desde plantilla",
    outline: "Esquema"
  }
};

export const t = (key: keyof typeof dict['en'], lang: Lang = 'en') => dict[lang][key] || key;
