import { defineCard } from "../define.js";

export default defineCard({
  name: "Highway Robber",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, target opponent loses 2 life and you gain 2 life.",
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
