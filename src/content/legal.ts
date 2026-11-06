// Textos legales de Chía. VERSIÓN PRELIMINAR: deben revisarse por un abogado antes del lanzamiento público.
// Al cambiarlos, actualiza LEGAL_VERSION.
export const LEGAL_VERSION = "2026-11-01 (borrador)";

export interface LegalSection { h: string; p: string[] }
export interface LegalDoc { title: string; sections: LegalSection[] }

type Docs = { privacy: LegalDoc; terms: LegalDoc; disclaimer: LegalDoc };

export const LEGAL: Record<"es" | "en", Docs> = {
  es: {
    privacy: {
      title: "Aviso de privacidad",
      sections: [
        { h: "Quién es responsable", p: ["Chía es un proyecto de salud digital en etapa de incubación. Contacto para temas de privacidad: [correo de contacto]."] },
        { h: "Consulta Express (sin cuenta)", p: [
          "No pedimos nombre, teléfono ni correo. La conversación vive solo en la memoria de tu navegador y se borra al salir.",
          "Para responderte, el texto de tus mensajes se envía a nuestro servidor y al proveedor de inteligencia artificial que procesa la respuesta. Lo configuramos para que no guarde las conversaciones (opción store: false o equivalente); estos proveedores actúan como encargados del tratamiento.",
        ] },
        { h: "Mi espacio (cuenta opcional)", p: [
          "Tu ficha médica, cartilla de vacunación, diario de síntomas, recordatorios y consultas guardadas se cifran en tu teléfono con AES-256 antes de guardarse.",
          "Si creas una cuenta con correo, una copia cifrada de extremo a extremo se guarda en nuestro proveedor de base de datos (Supabase) para que puedas usarla en otros dispositivos. La clave para descifrarla se deriva de tu contraseña en tu dispositivo: tu contraseña nunca llega a nuestros servidores y ni Chía ni nadie con acceso a la base puede leer tus datos. Guardamos tu correo para que puedas entrar y recuperar tu cuenta.",
          "Si olvidas tu contraseña, solo puedes recuperar tus datos con la clave de recuperación que te mostramos al crear la cuenta. Sin ella, no podemos recuperarlos.",
          "Si eliges guardar todo solo en tu teléfono, nada se sube a la nube; si olvidas tu PIN no podemos recuperar esos datos.",
          "Solo se guardan las consultas que tú decides guardar; las anónimas nunca.",
          "Si activas \"Usar mi ficha\" en una consulta, se envían al proveedor de IA tus alergias, condiciones, medicamentos, tipo de sangre y cartilla de vacunación, solo para esa conversación, para que la orientación sea más segura. Está apagado por defecto.",
        ] },
        { h: "Datos de salud", p: ["La información de salud es un dato sensible. Solo la tratamos para darte orientación y nunca la vendemos ni la usamos para publicidad. Al usar el chat aceptas este tratamiento; puedes dejar de usarlo en cualquier momento."] },
        { h: "Métricas anónimas", p: ["Para planear servicios, registramos datos agregados sin identificarte: el tema de interés, el país elegido de una lista y la semana. Nunca guardamos tu IP, dirección ni texto libre."] },
        { h: "Almacenamiento en tu navegador", p: ["Guardamos tu idioma, tema y modo de lenguaje para recordar tus preferencias, y tu espacio cifrado si creaste una cuenta. El botón Salir rápido borra las preferencias; tu espacio cifrado se conserva porque sin PIN es ilegible."] },
        { h: "Notificaciones", p: ["Si activas recordatorios, el aviso es discreto: no muestra el nombre del medicamento."] },
        { h: "Tus derechos", p: ["Puedes acceder, corregir o borrar tus datos desde Mi espacio en cualquier momento (incluido Borrar mi espacio). Para cualquier otra solicitud de acceso, rectificación, cancelación u oposición, escríbenos a [correo de contacto]."] },
      ],
    },
    terms: {
      title: "Términos y condiciones",
      sections: [
        { h: "Qué es Chía", p: ["Chía es un asistente de información y triaje de salud basado en inteligencia artificial. No es un servicio médico, no emite diagnósticos ni recetas y no sustituye la consulta con un profesional."] },
        { h: "Edad", p: ["Para usar Chía debes tener al menos 18 años."] },
        { h: "Uso adecuado", p: ["Úsala para informarte y orientarte. No la uses en emergencias: en ese caso llama a tu número local de emergencias. No intentes obtener del asistente indicaciones peligrosas ni usarlo para dañar a otras personas."] },
        { h: "Inteligencia artificial", p: ["Las respuestas se generan automáticamente y pueden contener errores. Confirma con un profesional de salud cualquier decisión sobre tu tratamiento."] },
        { h: "Telemedicina", p: ["Las solicitudes de consulta con especialistas se atenderán a través de profesionales o servicios aliados, con sus propios términos. Hoy el servicio está en preparación."] },
        { h: "Responsabilidad", p: ["Chía se ofrece tal cual, como herramienta educativa. En la medida que permita la ley, no somos responsables por decisiones tomadas solo con base en sus respuestas."] },
        { h: "Cambios", p: ["Podemos actualizar estos términos; la versión vigente siempre estará en esta página con su fecha."] },
      ],
    },
    disclaimer: {
      title: "Deslinde médico",
      sections: [
        { h: "Chía no es tu médico", p: [
          "Chía es un asistente de triaje e información, no emite diagnósticos ni reemplaza la consulta con un médico.",
          "No receta, no indica dosis de medicamentos que requieren receta y no cambia tratamientos.",
          "Si tienes dolor en el pecho, dificultad para respirar, sangrado abundante, fiebre muy alta, pensamientos de hacerte daño o cualquier otra urgencia, llama a tu número local de emergencias o acude a urgencias de inmediato.",
        ] },
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy notice",
      sections: [
        { h: "Who is responsible", p: ["Chía is a digital health project in incubation. Privacy contact: [contact email]."] },
        { h: "Express chat (no account)", p: [
          "We don't ask for your name, phone or email. The conversation lives only in your browser's memory and is erased when you leave.",
          "To answer you, your messages are sent to our server and to the AI provider that generates the reply. We configure it not to store conversations (store: false or equivalent); these providers act as data processors.",
        ] },
        { h: "My space (optional account)", p: [
          "Your health record, vaccination record, symptom diary, reminders and saved consultations are encrypted on your phone with AES-256 before being stored.",
          "If you create an account with email, an end-to-end encrypted copy is stored with our database provider (Supabase) so you can use it on other devices. The key to decrypt it is derived from your password on your device: your password never reaches our servers, and neither Chía nor anyone with database access can read your data. We keep your email so you can sign in and recover your account.",
          "If you forget your password, you can only recover your data with the recovery key shown when you created the account. Without it, we can't recover it.",
          "If you choose to keep everything only on your phone, nothing is uploaded; if you forget your PIN we can't recover that data.",
          "Only consultations you choose to save are kept; anonymous ones never are.",
          "If you turn on \"Use my record\" in a consultation, your allergies, conditions, medicines, blood type and vaccination record are sent to the AI provider, for that conversation only, to make guidance safer. It is off by default.",
        ] },
        { h: "Health data", p: ["Health information is sensitive data. We only process it to give you guidance and never sell it or use it for advertising. By using the chat you accept this processing; you can stop at any time."] },
        { h: "Anonymous metrics", p: ["To plan services we record aggregated, non-identifying data: the topic of interest, a country chosen from a list, and the week. We never store your IP, address or free text."] },
        { h: "Browser storage", p: ["We store your language, theme and language mode, and your encrypted space if you created an account. Quick exit erases preferences; your encrypted space is kept because it's unreadable without the PIN."] },
        { h: "Notifications", p: ["If you turn on reminders, alerts are discreet: they don't show the medicine's name."] },
        { h: "Your rights", p: ["You can view, correct or delete your data in My space at any time (including Delete my space). For any other request, write to [contact email]."] },
      ],
    },
    terms: {
      title: "Terms and conditions",
      sections: [
        { h: "What Chía is", p: ["Chía is an AI-based health information and triage assistant. It is not a medical service, does not diagnose or prescribe, and does not replace a consultation with a professional."] },
        { h: "Age", p: ["You must be at least 18 to use Chía."] },
        { h: "Proper use", p: ["Use it to get informed and oriented. Don't use it in emergencies: call your local emergency number. Don't try to obtain dangerous instructions or use it to harm others."] },
        { h: "Artificial intelligence", p: ["Answers are generated automatically and may contain errors. Confirm any treatment decision with a health professional."] },
        { h: "Telehealth", p: ["Specialist consultation requests will be handled by partner professionals or services, under their own terms. The service is currently being prepared."] },
        { h: "Liability", p: ["Chía is provided as is, as an educational tool. To the extent permitted by law, we are not liable for decisions based solely on its answers."] },
        { h: "Changes", p: ["We may update these terms; the current version will always be on this page with its date."] },
      ],
    },
    disclaimer: {
      title: "Medical disclaimer",
      sections: [
        { h: "Chía is not your doctor", p: [
          "Chía is a triage and information assistant; it does not diagnose or replace a consultation with a doctor.",
          "It does not prescribe, give doses of prescription medicines, or change treatments.",
          "If you have chest pain, trouble breathing, heavy bleeding, very high fever, thoughts of harming yourself or any other emergency, call your local emergency number or go to the ER immediately.",
        ] },
      ],
    },
  },
};
