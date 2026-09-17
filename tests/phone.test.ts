import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPhone, isValidPhone, normalizePhone } from "../src/lib/phone.ts";

/**
 * Le numéro est la première chose que saisit un candidat. Une règle trop
 * stricte ici, et le tunnel s'arrête à l'écran 1 — c'est exactement ce qui
 * s'est produit : le format donné en exemple par le message d'erreur était
 * refusé par la règle qui affichait ce message.
 */

test("accepte les formes réellement saisies au Cameroun", () => {
  const equivalents = [
    "699001122",
    "699 00 11 22",
    "6 99 00 11 22",
    "+237699001122",
    "+237 6 99 00 11 22",
    "+237 699-00-11-22",
    "00237699001122",
    "00237 6 99 00 11 22",
    "(237) 699 00 11 22",
    " 699.00.11.22 ",
  ];

  for (const saisie of equivalents) {
    const parsed = normalizePhone(saisie);
    assert.ok(parsed, `refusé à tort : « ${saisie} »`);
    assert.equal(parsed.e164, "+237699001122", `mauvaise normalisation de « ${saisie} »`);
    assert.equal(parsed.msisdn, "237699001122");
  }
});

test("accepte un fixe camerounais", () => {
  // Le fixe commence par 2 et compte lui aussi 9 chiffres depuis 2015.
  assert.equal(normalizePhone("233420011")?.e164, "+237233420011");
  assert.equal(normalizePhone("2 33 42 00 11")?.e164, "+237233420011");
});

test("refuse ce qui ne peut pas être joignable", () => {
  const invalides = [
    "",
    "   ",
    "12",
    "abcdefghi",
    "099001122",      // ne commence ni par 6 ni par 2
    "69900112",       // 8 chiffres
    "6990011223",     // 10 chiffres
    "+237999001122",  // 9 chiffres mais préfixe inexistant
    "+2370",          // national trop court
  ];

  for (const saisie of invalides) {
    assert.equal(isValidPhone(saisie), false, `accepté à tort : « ${saisie} »`);
  }
});

test("reconnaît les autres indicatifs de la zone", () => {
  assert.equal(normalizePhone("+225 07 12 34 56 78")?.countryCode, "225"); // Côte d'Ivoire
  assert.equal(normalizePhone("+221 77 123 45 67")?.countryCode, "221");   // Sénégal
  assert.equal(normalizePhone("+241 06 12 34 56")?.countryCode, "241");    // Gabon
});

test("n'invente pas d'indicatif sur une saisie internationale", () => {
  // 10 chiffres sans plus : on ne préfixe pas — ce serait fabriquer un
  // numéro qui n'existe pas.
  assert.equal(normalizePhone("0612345678")?.e164, undefined);
});

test("la mise en forme est réversible", () => {
  const affiche = formatPhone("+237699001122");
  assert.equal(affiche, "+237 6 99 00 11 22");
  assert.equal(normalizePhone(affiche)?.e164, "+237699001122");
});
