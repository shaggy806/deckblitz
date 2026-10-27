import { defineCard } from "../define.js";

// EDHREC rank 28782. Slate Street Ruffian's "defending player".

const TEXT = "Whenever this creature becomes blocked, defending player mills three cards.";

export default defineCard({
  name: "Flint Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
