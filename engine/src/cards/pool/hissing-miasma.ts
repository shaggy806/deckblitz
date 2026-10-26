import { defineCard } from "../define.js";

// EDHREC rank 10018.
//
// "Attacks you" is you, not a planeswalker you control (`attackingYou` +
// `defender: "player"`); "its controller" is the attacker's, read as it last
// existed if it has left (MacCready, Lamplight Mayor).
const TEXT = "Whenever a creature attacks you, its controller loses 1 life.";

export default defineCard({
  name: "Hissing Miasma",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true, defender: "player", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
