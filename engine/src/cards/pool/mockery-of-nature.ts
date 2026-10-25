import { defineCard } from "../define.js";

// EDHREC rank 19998. Eldritch Moon.

export default defineCard({
  name: "Mockery of Nature",
  manaCost: "{9}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Beast"],
  power: 6,
  toughness: 5,
  alternativeCost: { mana: "{7}{G}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {7}{G} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, you may destroy target artifact or enchantment.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["artifact-or-enchantment"],
      effect: {
        kind: "may",
        prompt: "Destroy target artifact or enchantment?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "When you cast this spell, you may destroy target artifact or enchantment.",
    },
  ],
});
