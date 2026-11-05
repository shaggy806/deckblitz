import { defineCard } from "../define.js";

// EDHREC rank 19135.
// Makes Illusion Villain → use "Illusion Villain Token".

export default defineCard({
  name: "Mysterio's Mirage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "At the beginning of your end step, if you discarded a card this turn, create a 3/3 blue Illusion Villain creature token.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Illusion Villain Token", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you discarded a card this turn, create a 3/3 blue Illusion Villain creature token.",
      condition: { kind: "turn-history", what: "discarded" },
    },
  ],
});
