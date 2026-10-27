import { defineCard } from "../define.js";

// EDHREC rank 29377.
//
// Rulings:
//   [2004-10-04] The ability only does something if used before attackers are declared during
//     a turn. If used after the creature is declared as an attacker, nothing happens.

const TEXT = "{W}, {T}, Discard a card: Target creature can't attack this turn.";

export default defineCard({
  name: "Netter en-Dal",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-attack"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
