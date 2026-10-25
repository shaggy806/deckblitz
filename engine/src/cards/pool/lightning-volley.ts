import { defineCard } from "../define.js";

// EDHREC rank 21238. Gruesome Slaughter's grant to the creatures you control
// as it resolves (rule 611.2c).
const PING_TEXT = "{T}: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Lightning Volley",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Until end of turn, creatures you control gain "${PING_TEXT}"`,
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { type: "creature", controlledBy: "you" },
    ability: {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
    duration: "end-of-turn",
  },
});
