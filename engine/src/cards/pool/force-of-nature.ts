import { defineCard } from "../define.js";

// EDHREC rank 27688.

const UPKEEP_TEXT = "At the beginning of your upkeep, this creature deals 8 damage to you unless you pay {G}{G}{G}{G}.";

export default defineCard({
  name: "Force of Nature",
  manaCost: "{2}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{G}{G}{G}{G}", text: "Pay {G}{G}{G}{G}." }],
        otherwise: { kind: "damage", amount: 8, who: "you" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
