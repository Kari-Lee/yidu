import { useState, useRef, useCallback } from "react";
import { callAI } from "../lib/api";

export function useAI() {
  const [step, setStep] = useState("input"); // input | context | loading | result
  const [result, setResult] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const submit = useCallback(async (systemPrompt, userMessage, images, loadingMessages) => {
    setStep("loading");
    setError(null);

    const msgs = loadingMessages || ["分析中..."];
    let n = 0;
    setLoadingMsg(msgs[0]);
    intervalRef.current = setInterval(() => {
      n++;
      setLoadingMsg(msgs[n % msgs.length]);
    }, 1200);

    try {
      const res = await callAI(systemPrompt, userMessage, images?.length > 0 ? images : null);
      clearInterval(intervalRef.current);
      setResult(res);
      setStep("result");
      return res;
    } catch (e) {
      clearInterval(intervalRef.current);
      setError(e.message || "出错了");
      setStep("input");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStep("input");
    setResult(null);
    setError(null);
    setLoadingMsg("");
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const goToContext = useCallback(() => setStep("context"), []);

  return { step, setStep, result, loadingMsg, error, submit, reset, goToContext };
}
