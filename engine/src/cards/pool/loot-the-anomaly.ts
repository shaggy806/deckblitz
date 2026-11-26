import { defineCard } from "../define.js";

// Assigns combat damage as though its power were positive
// (`combatDamageAsPositivePower`, rule 510.1a): -4 power assigns 4. Its power
// doesn't change (the ruling), and by toughness wins over it (the ruling).
const POSITIVE_TEXT = "If Loot's power is negative, he assigns combat damage as though his power were positive.";
const THRESHOLD_TEXT =
  "Threshold — Sacrifice another creature or planeswalker: Loot gets -2/-0 until end of turn. Activate only if there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Loot, the Anomaly",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast", "Horror"],
  power: -2,
  toughness: 4,
  text: `${POSITIVE_TEXT}\n${THRESHOLD_TEXT}`,
  static: [{ affects: { scope: "self" }, combatDamageAsPositivePower: true, text: POSITIVE_TEXT }],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "planeswalker"] } },
      },
      condition: { kind: "threshold" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: THRESHOLD_TEXT,
      otherOnly: true,
    },
  ],
});
