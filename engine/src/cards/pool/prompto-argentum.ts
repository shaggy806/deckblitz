import { defineCard } from "../define.js";

// EDHREC rank 10204.
//
// Rulings:
//   [2025-06-06] Prompto's last ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.
//
// The intervening-if is the trigger's `manaSpent` filter (The Emperor of
// Palamecia's shape): what was spent on a spell never changes, so it holds on
// resolution exactly when it held as the spell was cast.
const TEXT =
  "Selfie Shot — Whenever you cast a noncreature spell, if at least four mana was spent to cast it, create a Treasure token.";

export default defineCard({
  name: "Prompto Argentum",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"], manaSpent: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
