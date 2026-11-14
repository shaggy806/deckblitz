import { defineCard } from "../define.js";

// - The number is drawn before it enters (`chooseOnEnterAtRandom`), so it's
//   never on the battlefield unprotected; nobody is asked (the ruling).
// - Protection from every mana value but that one, not just the other two
//   options (the ruling); with no number chosen, none (`manaValuesExceptChosen`).

const ATTACKS_TEXT = "Haktos attacks each combat if able.";
const CHOOSE_TEXT = "As Haktos enters, choose 2, 3, or 4 at random.";
const PROTECTION_TEXT = "Haktos has protection from each mana value other than the chosen number.";

export default defineCard({
  name: "Haktos the Unscarred",
  manaCost: "{R}{R}{W}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 6,
  toughness: 1,
  text: `${ATTACKS_TEXT}\n${CHOOSE_TEXT}\n${PROTECTION_TEXT}`,
  chooseOnEnter: ["2", "3", "4"],
  chooseOnEnterAtRandom: true,
  static: [
    { affects: { scope: "self" }, restrictions: ["must-attack"], text: ATTACKS_TEXT },
    { affects: { scope: "self" }, protection: { manaValuesExceptChosen: true }, text: PROTECTION_TEXT },
  ],
});
