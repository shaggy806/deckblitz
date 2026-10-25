import { defineCard } from "../define.js";

// EDHREC rank 21934. Eldritch Moon.

export default defineCard({
  name: "Abundant Maw",
  manaCost: "{8}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Leech"],
  power: 6,
  toughness: 4,
  alternativeCost: { mana: "{6}{B}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {6}{B} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, target opponent loses 3 life and you gain 3 life.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
      },
      resolve: null,
      text: "When you cast this spell, target opponent loses 3 life and you gain 3 life.",
    },
  ],
});
