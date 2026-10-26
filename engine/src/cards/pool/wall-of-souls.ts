import { defineCard } from "../define.js";

// EDHREC rank 16229.
//
// Rulings:
//   [2004-10-04] Redirected damage is still combat damage, so it will trigger on combat damage
//     that is redirected to it.

const TEXT =
  "Whenever this creature is dealt combat damage, it deals that much damage to target opponent or planeswalker.";

export default defineCard({
  name: "Wall of Souls",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self", combat: true },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
