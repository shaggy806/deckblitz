import { defineCard } from "../define.js";

// Portal Second Age (P02). EDHREC rank 31824. Dire Undercurrents' "you may
// have target player discard a card", for a target opponent.

const TEXT = "When this creature enters, you may have target opponent discard a card.";

export default defineCard({
  name: "Brutal Nightstalker",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Have the target opponent discard a card?",
        effect: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
