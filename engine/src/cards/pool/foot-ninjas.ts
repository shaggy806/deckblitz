import { defineCard } from "../define.js";

// EDHREC rank 19720.

export default defineCard({
  name: "Foot Ninjas",
  manaCost: "{4}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 5,
  toughness: 5,
  sneak: { cost: "{3}{W/B}" },
  text: "Sneak {3}{W/B} (You may cast this spell for {3}{W/B} if you also return an unblocked attacker you control to hand during the declare blockers step. It enters tapped and attacking.)\nWhen this creature enters, you gain 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
  ],
});
