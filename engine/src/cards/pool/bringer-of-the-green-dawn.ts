import { defineCard } from "../define.js";

// EDHREC rank 21405.

const UPKEEP_TEXT = "At the beginning of your upkeep, you may create a 3/3 green Beast creature token.";

export default defineCard({
  name: "Bringer of the Green Dawn",
  manaCost: "{7}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bringer"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  alternativeCost: { mana: "{W}{U}{B}{R}{G}" },
  text: `You may pay {W}{U}{B}{R}{G} rather than pay this spell's mana cost.\nTrample\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 3/3 green Beast creature token?",
        effect: { kind: "create-token", token: "3/3 Beast Token", count: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
