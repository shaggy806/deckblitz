import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 17129. The Bringers' own alternative cost
// (rule 118.9): {W}{U}{B}{R}{G} in place of {7}{U}{U}.

const UPKEEP_TEXT = "At the beginning of your upkeep, you may draw two cards.";

export default defineCard({
  name: "Bringer of the Blue Dawn",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bringer"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `You may pay {W}{U}{B}{R}{G} rather than pay this spell's mana cost.\nTrample\n${UPKEEP_TEXT}`,
  alternativeCost: { mana: "{W}{U}{B}{R}{G}" },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "may", prompt: "Draw two cards?", effect: { kind: "draw", amount: 2 } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
