import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "Discard a card: This creature gains hexproof until end of turn. Tap it.";
const ATTACK_TEXT = "Whenever this creature attacks, scry 3.";

export default defineCard({
  name: "Prognostic Sphinx",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${HEXPROOF_TEXT}\n${ATTACK_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "hexproof", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: HEXPROOF_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 3 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
