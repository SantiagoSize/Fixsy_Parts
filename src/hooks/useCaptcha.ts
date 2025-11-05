import React from 'react';

export type Captcha = {
  question: string;
  expected: string;
};

function generateCaptcha(): Captcha {
  // Suma/resta simple 1..9 para no friccionar
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const isAdd = Math.random() < 0.7; // más común suma
  const question = isAdd ? `${a} + ${b}` : `${a + b} - ${a}`; // ambos dan b
  const expected = String(isAdd ? a + b : b);
  return { question, expected };
}

export function useCaptcha() {
  const [captcha, setCaptcha] = React.useState<Captcha>(() => generateCaptcha());

  const refresh = React.useCallback(() => setCaptcha(generateCaptcha()), []);
  const verify = React.useCallback((answer: string) => {
    return answer.trim() === captcha.expected;
  }, [captcha.expected]);

  return { captcha, refresh, verify } as const;
}

