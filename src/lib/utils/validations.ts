import i18n from '@/plugins/i18n';
import { bnum } from '.';
import numeral from 'numeral';
import { isAddress } from '@ethersproject/address';

export function isRequired(field = '') {
  const _field = field ? `${field} ` : 'Input ';
  return v => !!v || `${_field}${i18n.global.t('isRequired')}`;
}

export function minChar(minLength: number, field = '') {
  const _field = field ? `${field} ` : '';
  return v =>
    !v ||
    v.length >= minLength ||
    `${_field}${i18n.global.t('mustBeAtLeast', [minLength])}`;
}

export function isPositiveCheck(number: number | string) {
  return bnum(number).isGreaterThanOrEqualTo(0);
}
export function isPositive() {
  return v =>
    !v ||
    isPositiveCheck(numeral(v).value() || 0) ||
    i18n.global.t('mustBePositive');
}

export function isLessThanOrEqualTo(max: number | string, msg = '') {
  return v =>
    !v ||
    bnum(v).isLessThanOrEqualTo(max) ||
    (msg ? msg : i18n.global.t('mustBeLessThan', [max]));
}

export const isEmailCheck = email => {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
};

export function isEmail() {
  return v => !v || isEmailCheck(v) || i18n.global.t('mustBeValidEmail');
}

export function isValidAddress() {
  return v => !v || isAddress(v) || i18n.global.t('mustBeValidAddress');
}

export const isPoolNameCheck = name => {
  return true;
};

export const isSymbolNameCheck = symbol => {
  const regex = /^[0-9A-Z-]+$/;
  if (symbol.length > 7) return false;
  return regex.test(symbol);
};

export function isValidPoolName() {
  return v => !v || isPoolNameCheck(v) || i18n.global.t('mustBeValidPoolName');
}

export function isSymbol() {
  const regex = /^[0-9A-Z-]+$/;
  return v => !v || regex.test(v) || 'Must be valid symbol';
}

export function maxChar(maxLength: number, field = '') {
  const _field = field ? `${field} ` : '';
  return v =>
    (v || '').length <= maxLength ||
    `${_field}${i18n.global.t('mustBeLessThanChars', [maxLength])}`;
}
