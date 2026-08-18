import { useEffect, useRef, useState } from "react";

// Tipos mínimos de la Web Speech API (no vienen en lib.dom.d.ts de TS).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Dictado de voz por navegador (Web Speech API). Disponible en Chrome/Android;
 * Safari/iOS no lo soporta (ahí queda el dictado nativo del teclado como alternativa).
 * `supported` indica si mostrar o no el botón de micrófono.
 */
export function useDictation(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = getRecognitionCtor() != null;

  useEffect(() => {
    return () => {
      recRef.current?.stop();
    };
  }, []);

  const toggle = () => {
    if (!supported) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "es-CO";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript ?? "";
      if (text) onResult(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return { supported, listening, toggle };
}
