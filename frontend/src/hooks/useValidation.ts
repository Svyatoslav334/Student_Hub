import { useState, useCallback } from 'react';

type RuleKey = 'required'|'minLength'|'maxLength'|'email'|'phone'|'pattern';

interface Rule {
  type: RuleKey;
  value?: number | RegExp;
  message: string;
}

type FieldRules = Record<string, Rule[]>;
type Errors = Record<string, string>;
type Touched = Record<string, boolean>;

export const RULES = {
  required: (msg = 'Поле обов\'язкове'): Rule =>
    ({ type: 'required', message: msg }),
  minLength: (n: number, msg?: string): Rule =>
    ({ type: 'minLength', value: n, message: msg || `Мінімум ${n} символів` }),
  maxLength: (n: number, msg?: string): Rule =>
    ({ type: 'maxLength', value: n, message: msg || `Максимум ${n} символів` }),
  email: (msg = 'Невірний формат email'): Rule =>
    ({ type: 'email', message: msg }),
  phone: (msg = 'Формат: +380XXXXXXXXX'): Rule =>
    ({ type: 'phone', message: msg }),
  pattern: (re: RegExp, msg: string): Rule =>
    ({ type: 'pattern', value: re, message: msg }),
};

function validate(value: string, rules: Rule[]): string {
  for (const rule of rules) {
    const v = value.trim();
    if (rule.type === 'required' && !v) return rule.message;
    if (!v) continue; // skip rest if empty + not required
    if (rule.type === 'minLength' && v.length < (rule.value as number)) return rule.message;
    if (rule.type === 'maxLength' && v.length > (rule.value as number)) return rule.message;
    if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return rule.message;
    if (rule.type === 'phone' && !/^\+?[\d\s\-()]{7,15}$/.test(v)) return rule.message;
    if (rule.type === 'pattern' && !(rule.value as RegExp).test(v)) return rule.message;
  }
  return '';
}

export function useValidation(fieldRules: FieldRules) {
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  const validateField = useCallback((name: string, value: string) => {
    const rules = fieldRules[name] ?? [];
    const error = validate(value, rules);
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  }, [fieldRules]);

  const touchField = useCallback((name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    return validateField(name, value);
  }, [validateField]);

  const validateAll = useCallback((values: Record<string, string>) => {
    const newErrors: Errors = {};
    const newTouched: Touched = {};
    let isValid = true;
    for (const name of Object.keys(fieldRules)) {
      newTouched[name] = true;
      const error = validate(values[name] ?? '', fieldRules[name]);
      newErrors[name] = error;
      if (error) isValid = false;
    }
    setErrors(newErrors);
    setTouched(newTouched);
    return isValid;
  }, [fieldRules]);

  const getProps = useCallback((name: string, value: string, onChange: (v:string)=>void) => ({
    value,
    onChange: (e: React.ChangeEvent<any>) => {
      onChange(e.target.value);
      if (touched[name]) validateField(name, e.target.value);
    },
    onBlur: () => touchField(name, value),
    className: touched[name]
      ? errors[name] ? 'input-error' : 'input-ok'
      : '',
  }), [errors, touched, validateField, touchField]);

  return { errors, touched, validateField, touchField, validateAll, getProps };
}
