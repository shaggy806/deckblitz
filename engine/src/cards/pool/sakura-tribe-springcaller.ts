import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 22189.
const TEXT = "At the beginning of your upkeep, add {G}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Sakura-Tribe Springcaller",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1, persists: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
