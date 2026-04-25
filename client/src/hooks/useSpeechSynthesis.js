import { useCallback, useEffect, useState } from "react";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if (!synth) return;
    const loadVoices = () => {
      const voices = synth.getVoices();
      const preferred =
        voices.find((v) => v.lang === "en-US" && /Google|Natural|Neural/i.test(v.name)) ||
        voices.find((v) => v.lang === "en-US") ||
        voices[0];
      setVoice(preferred ?? null);
    };
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback(
    (text) => {
      if (!synth || !text) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      synth.speak(utterance);
    },
    [voice],
  );

  const cancel = useCallback(() => {
    synth?.cancel();
    setSpeaking(false);
  }, []);

  return {
    supported: Boolean(synth),
    speaking,
    speak,
    cancel,
  };
}
