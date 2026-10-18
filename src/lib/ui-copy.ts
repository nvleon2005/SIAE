export type SupportedLocale = "es" | "es-419" | "ca" | "eu" | "gl" | "en";

export const uiCopy: Record<SupportedLocale, {
  greeting: string;
  helpTitle: string;
  helpSubtitle: string;
  online: string;
  loading: string;
  profileTitle: string;
  profileSubtitle: string;
  restoreAccessibility: string;
  profileDataLabel: string;
  next: string;
  skip: string;
  continue: string;
  captionsOn: string;
  captionsOff: string;
  requestInterpreter: string;
  interpreterPending: string;
  requestPhoto: string;
  mediaDecision: string;
  allow: string;
  deny: string;
}> = {
  es: {
    greeting: "Hola",
    helpTitle: "¿Necesitas ayuda ahora?",
    helpSubtitle: "Tu ubicación, contacto y canal de comunicación están disponibles.",
    online: "En línea",
    loading: "Cargando perfil...",
    profileTitle: "Perfil",
    profileSubtitle: "Datos del usuario y ajustes de accesibilidad.",
    restoreAccessibility: "Restablecer accesibilidad",
    profileDataLabel: "Datos del usuario",
    next: "Siguiente",
    skip: "Saltar",
    continue: "Continuar",
    captionsOn: "Ocultar subtítulos",
    captionsOff: "Mostrar subtítulos",
    requestInterpreter: "Solicitar intérprete LSE",
    interpreterPending: "Intérprete solicitado",
    requestPhoto: "Solicitar foto",
    mediaDecision: "Tú decides si quieres compartirla.",
    allow: "Permitir",
    deny: "No permitir",
  },
  "es-419": {
    greeting: "Hola",
    helpTitle: "¿Necesitas ayuda ahora?",
    helpSubtitle: "Tu ubicación, contacto y canal de comunicación están disponibles.",
    online: "En línea",
    loading: "Cargando perfil...",
    profileTitle: "Perfil",
    profileSubtitle: "Datos del usuario y ajustes de accesibilidad.",
    restoreAccessibility: "Restablecer accesibilidad",
    profileDataLabel: "Datos del usuario",
    next: "Siguiente",
    skip: "Saltar",
    continue: "Continuar",
    captionsOn: "Ocultar subtítulos",
    captionsOff: "Mostrar subtítulos",
    requestInterpreter: "Solicitar intérprete LSE",
    interpreterPending: "Intérprete solicitado",
    requestPhoto: "Solicitar foto",
    mediaDecision: "Tú decides si quieres compartirla.",
    allow: "Permitir",
    deny: "No permitir",
  },
  ca: {
    greeting: "Hola",
    helpTitle: "Necessites ajuda ara mateix?",
    helpSubtitle: "La teva ubicació, contacte i canal de comunicació estan disponibles.",
    online: "En línia",
    loading: "Carregant perfil...",
    profileTitle: "Perfil",
    profileSubtitle: "Dades de l'usuari i ajusts d'accessibilitat.",
    restoreAccessibility: "Restablir accessibilitat",
    profileDataLabel: "Dades de l'usuari",
    next: "Següent",
    skip: "Ometre",
    continue: "Continuar",
    captionsOn: "Amagar subtítols",
    captionsOff: "Mostrar subtítols",
    requestInterpreter: "Sol·licitar intèrpret LSE",
    interpreterPending: "Intèrpret sol·licitat",
    requestPhoto: "Sol·licitar foto",
    mediaDecision: "Tu decideixes si vols compartir-la.",
    allow: "Permetre",
    deny: "No permetre",
  },
  eu: {
    greeting: "Kaixo",
    helpTitle: "Laguntza behar duzu orain?",
    helpSubtitle: "Zure kokapena, kontaktua eta komunikazio-kanala eskuragarri daude.",
    online: "Linean",
    loading: "Profila kargatzen...",
    profileTitle: "Profila",
    profileSubtitle: "Erabiltzailearen datuak eta irisgarritasun ezarpenak.",
    restoreAccessibility: "Berrezarri irisgarritasuna",
    profileDataLabel: "Erabiltzailearen datuak",
    next: "Hurrengoa",
    skip: "Saltatu",
    continue: "Jarraitu",
    captionsOn: "Azpitituluak ezkutatu",
    captionsOff: "Azpitituluak erakutsi",
    requestInterpreter: "LSE interpretea eskatu",
    interpreterPending: "Interpretea eskatuta",
    requestPhoto: "Argazkia eskatu",
    mediaDecision: "Zuk erabakitzen duzu partekatu nahi duzun.",
    allow: "Baimendu",
    deny: "Ez baimendu",
  },
  gl: {
    greeting: "Ola",
    helpTitle: "Necesitas axuda agora?",
    helpSubtitle: "A túa localización, contacto e canal de comunicación están dispoñibles.",
    online: "En liña",
    loading: "Cargando perfil...",
    profileTitle: "Perfil",
    profileSubtitle: "Datos do usuario e axustes de accesibilidade.",
    restoreAccessibility: "Restablecer accesibilidade",
    profileDataLabel: "Datos do usuario",
    next: "Seguinte",
    skip: "Omitir",
    continue: "Continuar",
    captionsOn: "Ocultar subtítulos",
    captionsOff: "Mostrar subtítulos",
    requestInterpreter: "Solicitar intérprete LSE",
    interpreterPending: "Intérprete solicitado",
    requestPhoto: "Solicitar foto",
    mediaDecision: "Ti decides se queres compartila.",
    allow: "Permitir",
    deny: "Non permitir",
  },
  en: {
    greeting: "Hello",
    helpTitle: "Do you need help now?",
    helpSubtitle: "Your location, contact, and communication channel are available.",
    online: "Online",
    loading: "Loading profile...",
    profileTitle: "Profile",
    profileSubtitle: "User data and accessibility settings.",
    restoreAccessibility: "Reset accessibility",
    profileDataLabel: "User data",
    next: "Next",
    skip: "Skip",
    continue: "Continue",
    captionsOn: "Hide captions",
    captionsOff: "Show captions",
    requestInterpreter: "Request LSE interpreter",
    interpreterPending: "Interpreter requested",
    requestPhoto: "Request photo",
    mediaDecision: "You decide whether to share it.",
    allow: "Allow",
    deny: "Do not allow",
  },
};

export function getUiCopy(locale: string | undefined) {
  const normalized = (locale || "es") as SupportedLocale;
  return uiCopy[normalized] ?? uiCopy.es;
}
