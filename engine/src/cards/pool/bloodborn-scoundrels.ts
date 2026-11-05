import { defineCard } from "../define.js";

// EDHREC rank 27510.

export default defineCard({
  name: "Bloodborn Scoundrels",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 4,
  toughness: 4,
  assist: true,
  text: "Assist (Another player can pay up to {5} of this spell's cost.)\nWhen this creature enters, target opponent loses 2 life and you gain 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "When this creature enters, target opponent loses 2 life and you gain 2 life.",
    },
  ],
});
